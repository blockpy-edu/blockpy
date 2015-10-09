# -*- coding: utf-8 -*-
"""
    PyLTI decorator implementation for flask framework
"""
from __future__ import absolute_import
from functools import wraps
import logging
import json

from flask import session, current_app, Flask
from flask import request as flask_request

from .common import (
    LTI_SESSION_KEY,
    LTI_PROPERTY_LIST,
    LTI_ROLES,
    verify_request_common,
    post_message,
    post_message2,
    generate_request_xml,
    LTIException,
    LTIRoleException,
    LTINotInSessionException,
    LTIPostMessageException
)


log = logging.getLogger('pylti.flask')  # pylint: disable=invalid-name


def default_error(exception=None):
    """Render simple error page.  This should be overidden in applications."""
    # pylint: disable=unused-argument
    return "There was an LTI communication error", 500


class LTI(object):
    """
    LTI Object represents abstraction of current LTI session. It provides
    callback methods and methods that allow developer to inspect
    LTI basic-launch-request.

    This object is instantiated by @lti wrapper.
    """

    def __init__(self, lti_args, lti_kwargs):
        self.lti_args = lti_args
        self.lti_kwargs = lti_kwargs
        self.nickname = self.name

        # Set app to current_app if not specified
        if not self.lti_kwargs['app']:
            self.lti_kwargs['app'] = current_app

    @property
    def name(self):  # pylint: disable=no-self-use
        """
        Name returns user's name or user's email or user_id
        :return: best guess of name to use to greet user
        """
        if 'lis_person_sourcedid' in session:
            return session['lis_person_sourcedid']
        elif 'lis_person_contact_email_primary' in session:
            return session['lis_person_contact_email_primary']
        elif 'user_id' in session:
            return session['user_id']
        else:
            return ''

    @property
    def user_id(self):  # pylint: disable=no-self-use
        """
        Returns user_id as provided by LTI

        :return: user_id
        """
        return session['user_id']

    def verify(self):
        """
        Verify if LTI request is valid, validation
        depends on @lti wrapper arguments

        :raises: LTIException
        """
        log.debug('verify request=%s', self.lti_kwargs.get('request'))
        if self.lti_kwargs.get('request') == 'session':
            self._verify_session()
        elif self.lti_kwargs.get('request') == 'initial':
            self.verify_request()
        elif self.lti_kwargs.get('request') == 'any':
            self._verify_any()
        else:
            raise LTIException("Unknown request type")
        return True

    def _verify_any(self):
        """
        Verify that request is in session or initial request

        :raises: LTIException
        """
        log.debug('verify_any enter')
        try:
            self._verify_session()
        except LTINotInSessionException:
            self.verify_request()

    @staticmethod
    def _verify_session():
        """
        Verify that session was already created

        :raises: LTIException
        """
        if not session.get(LTI_SESSION_KEY, False):
            log.debug('verify_session failed')
            raise LTINotInSessionException('Session expired or unavailable')

    def _consumers(self):
        """
        Gets consumer's map from app config
        :return: consumers map
        """
        app_config = self.lti_kwargs['app'].config
        config = app_config.get('PYLTI_CONFIG', dict())
        consumers = config.get('consumers', dict())
        return consumers

    @property
    def key(self):  # pylint: disable=no-self-use
        """
        OAuth Consumer Key
        :return: key
        """
        return session['oauth_consumer_key']

    @staticmethod
    def message_identifier_id():
        """
        Message identifier to use for XML callback

        :return: non-empty string
        """
        return "edX_fix"

    @property
    def lis_result_sourcedid(self):  # pylint: disable=no-self-use
        """
        lis_result_sourcedid to use for XML callback

        :return: LTI lis_result_sourcedid
        """
        return session['lis_result_sourcedid']

    @property
    def role(self):  # pylint: disable=no-self-use
        """
        LTI roles

        :return: roles
        """
        return session.get('roles')

    @staticmethod
    def is_role(role):
        """
        Verify if user is in role

        :param: role: role to verify against
        :return: if user is in role
        :exception: LTIException if role is unknown
        """
        log.debug("is_role %s", role)
        roles = session['roles'].split(',')
        if role in LTI_ROLES:
            role_list = LTI_ROLES[role]
            # find the intersection of the roles
            roles = set(role_list) & set(roles)
            is_user_role_there = len(roles) >= 1
            log.debug(
                "is_role roles_list=%s role=%s in list=%s", role_list,
                roles, is_user_role_there
            )
            return is_user_role_there
        else:
            raise LTIException("Unknown role {}.".format(role))

    def _check_role(self):
        """
        Check that user is in role specified as wrapper attribute

        :exception: LTIRoleException if user is not in roles
        """
        role = u'any'
        if 'role' in self.lti_kwargs:
            role = self.lti_kwargs['role']
        log.debug(
            "check_role lti_role=%s decorator_role=%s", self.role, role
        )
        if not (role == u'any' or self.is_role(role)):
            raise LTIRoleException('Not authorized.')

    @property
    def response_url(self):
        """
        Returns remapped lis_outcome_service_url
        uses PYLTI_URL_FIX map to support edX dev-stack

        :return: remapped lis_outcome_service_url
        """
        url = session['lis_outcome_service_url']
        app_config = self.lti_kwargs['app'].config
        urls = app_config.get('PYLTI_URL_FIX', dict())
        # url remapping is useful for using devstack
        # devstack reports httpS://localhost:8000/ and listens on HTTP
        for prefix, mapping in urls.iteritems():
            if url.startswith(prefix):
                for _from, _to in mapping.iteritems():
                    url = url.replace(_from, _to)
        return url

    def verify_request(self):
        """
        Verify LTI request

        :raises: LTIException is request validation failed
        """
        if flask_request.method == 'POST':
            params = flask_request.form.to_dict()
        else:
            params = flask_request.args.to_dict()
        log.debug(params)

        log.debug('verify_request?')
        try:
            verify_request_common(self._consumers(), flask_request.url,
                                  flask_request.method, flask_request.headers,
                                  params)
            log.debug('verify_request success')

            # All good to go, store all of the LTI params into a
            # session dict for use in views
            for prop in LTI_PROPERTY_LIST:
                if params.get(prop, None):
                    log.debug("params %s=%s", prop, params.get(prop, None))
                    session[prop] = params[prop]

            # Set logged in session key
            session[LTI_SESSION_KEY] = True
            return True
        except LTIException:
            log.debug('verify_request failed')
            for prop in LTI_PROPERTY_LIST:
                if session.get(prop, None):
                    del session[prop]

            session[LTI_SESSION_KEY] = False
            raise

    def post_grade(self, grade, message=''):
        """
        Post grade to LTI consumer using XML

        :param: grade: 0 <= grade <= 1
        :return: True if post successful and grade valid
        :exception: LTIPostMessageException if call failed
        """
        message_identifier_id = self.message_identifier_id()
        operation = 'replaceResult'
        lis_result_sourcedid = self.lis_result_sourcedid
        # # edX devbox fix
        score = float(grade)
        if 0 <= score <= 1.0:
            xml = generate_request_xml(
                message_identifier_id, operation, lis_result_sourcedid,
                score, message)
            ret = post_message(self._consumers(), self.key,
                               self.response_url, xml)
            if not ret:
                raise LTIPostMessageException("Post Message Failed")
            return True

        return False

    def post_grade2(self, grade, user=None, comment=''):
        """
        Post grade to LTI consumer using REST/JSON
        URL munging will is related to:
        https://openedx.atlassian.net/browse/PLAT-281

        :param: grade: 0 <= grade <= 1
        :return: True if post successful and grade valid
        :exception: LTIPostMessageException if call failed
        """
        content_type = 'application/vnd.ims.lis.v2.result+json'
        if user is None:
            user = self.user_id
        lti2_url = self.response_url.replace(
            "/grade_handler",
            "/lti_2_0_result_rest_handler/user/{}".format(user))
        score = float(grade)
        if 0 <= score <= 1.0:
            body = json.dumps({
                "@context": "http://purl.imsglobal.org/ctx/lis/v2/Result",
                "@type": "Result",
                "resultScore": score,
                "comment": comment
            })
            ret = post_message2(self._consumers(), self.key, lti2_url, body,
                                method='PUT',
                                content_type=content_type)
            if not ret:
                raise LTIPostMessageException("Post Message Failed")
            return True

        return False

    @staticmethod
    def close_session():
        """
        Invalidates session
        """
        for prop in LTI_PROPERTY_LIST:
            if session.get(prop, None):
                del session[prop]
        session[LTI_SESSION_KEY] = False


def lti(app=None, request='any', error=default_error, role='any',
        *lti_args, **lti_kwargs):
    """
    LTI decorator

    :param: app - Flask App object (optional).
        :py:attr:`flask.current_app` is used if no object is passed in.
    :param: error - Callback if LTI throws exception (optional).
        :py:attr:`pylti.flask.default_error` is the default.
    :param: request - Request type from
        :py:attr:`pylti.common.LTI_REQUEST_TYPE`. (default: any)
    :param: roles - LTI Role (default: any)
    :return: wrapper
    """

    def _lti(function):
        """
        Inner LTI decorator

        :param: function:
        :return:
        """

        @wraps(function)
        def wrapper(*args, **kwargs):
            """
            Pass LTI reference to function or return error.
            """
            try:
                the_lti = LTI(lti_args, lti_kwargs)
                the_lti.verify()
                the_lti._check_role()  # pylint: disable=protected-access
                kwargs['lti'] = the_lti
                return function(*args, **kwargs)
            except LTIException as lti_exception:
                error = lti_kwargs.get('error')
                exception = dict()
                exception['exception'] = lti_exception
                exception['kwargs'] = kwargs
                exception['args'] = args
                return error(exception=exception)

        return wrapper

    lti_kwargs['request'] = request
    lti_kwargs['error'] = error
    lti_kwargs['role'] = role

    if (not app) or isinstance(app, Flask):
        lti_kwargs['app'] = app
        return _lti
    else:
        # We are wrapping without arguments
        lti_kwargs['app'] = None
        return _lti(app)
