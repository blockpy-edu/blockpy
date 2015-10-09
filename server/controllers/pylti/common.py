# -*- coding: utf-8 -*-
"""
Common classes and methods for PyLTI module
"""

from __future__ import absolute_import
import logging

import oauth2
import oauth.oauth as oauth
from xml.etree import ElementTree as etree

log = logging.getLogger('pylti.common')  # pylint: disable=invalid-name

LTI_PROPERTY_LIST = [
    'oauth_consumer_key',
    'launch_presentation_return_url',
    'launch_presentation_width',
    'launch_presentation_height',
    'user_id',
    'oauth_nonce',
    'context_label',
    'context_id',
    'context_title',
    'resource_link_title',
    'resource_link_id',
    'lis_person_contact_email_primary',
    'lis_person_contact_emailprimary',
    'lis_person_name_full',
    'lis_person_name_family',
    'lis_person_name_given',
    'lis_result_sourcedid',
    'lis_person_sourcedid',
    'launch_type',
    'lti_message',
    'lti_version',
    'lti_message_type',
    'roles',
    'lis_outcome_service_url',
    'ext_content_return_types'
]


LTI_ROLES = {
    u'staff': [u'Administrator', u'Instructor', ],
    u'instructor': [u'Instructor', ],
    u'administrator': [u'Administrator', ],
    u'student': [u'Student', u'Learner', ]
    # There is also a special role u'any' that ignores role check
}

LTI_SESSION_KEY = u'lti_authenticated'

LTI_REQUEST_TYPE = [u'any', u'initial', u'session']


class LTIOAuthDataStore(oauth.OAuthDataStore):
    # pylint: disable=abstract-method
    """
    Largely taken from reference implementation
    for app engine at https://code.google.com/p/ims-dev/
    """

    def __init__(self, consumers):
        """
        Create OAuth store
        """
        oauth.OAuthDataStore.__init__(self)
        self.consumers = consumers

    def lookup_consumer(self, key):
        """
        Search through keys
        """
        if not self.consumers:
            log.critical(("No consumers defined in settings."
                          "Have you created a configuration file?"))
            return None

        consumer = self.consumers.get(key)
        if not consumer:
            log.info("Did not find consumer, using key: %s ", key)
            return None

        secret = consumer.get('secret', None)
        if not secret:
            log.critical(('Consumer %s, is missing secret'
                          'in settings file, and needs correction.'), key)
            return None
        return oauth.OAuthConsumer(key, secret)

    def lookup_cert(self, key):
        """
        Search through keys
        """
        if not self.consumers:
            log.critical(("No consumers defined in settings."
                          "Have you created a configuration file?"))
            return None

        consumer = self.consumers.get(key)
        if not consumer:
            log.info("Did not find consumer, using key: %s ", key)
            return None

        cert = consumer.get('cert', None)
        return cert

    def lookup_nonce(self, oauth_consumer, oauth_token, nonce):
        """
        Lookup nonce should check if nonce was already used
        by this consumer in the past.
        Reusing nonce is bad: http://cwe.mitre.org/data/definitions/323.html
        Not implemented.
        """
        return None


class LTIException(Exception):
    """
    Custom LTI exception for proper handling
    of LTI specific errors
    """
    pass


class LTINotInSessionException(LTIException):
    """
    Custom LTI exception for proper handling
    of LTI specific errors
    """
    pass


class LTIRoleException(LTIException):
    """
    Exception class for when LTI user doesn't have the
    right role.
    """
    pass


class LTIPostMessageException(LTIException):
    """
    Exception class for when LTI user doesn't have the
    right role.
    """
    pass


def _post_patched_request(consumers, lti_key, body,
                          url, method, content_type):
    """
    Authorization header needs to be capitalized for some LTI clients
    this function ensures that header is capitalized

    :param body: body of the call
    :param client: OAuth Client
    :param url: outcome url
    :return: response
    """
    # pylint: disable=too-many-locals, too-many-arguments
    oauth_store = LTIOAuthDataStore(consumers)
    oauth_server = oauth.OAuthServer(oauth_store)
    oauth_server.add_signature_method(oauth.OAuthSignatureMethod_HMAC_SHA1())
    lti_consumer = oauth_store.lookup_consumer(lti_key)
    lti_cert = oauth_store.lookup_cert(lti_key)

    secret = lti_consumer.secret

    consumer = oauth2.Consumer(key=lti_key, secret=secret)
    client = oauth2.Client(consumer)

    if lti_cert:
        client.add_certificate(key=lti_cert, cert=lti_cert, domain='')
        log.debug("cert %s", lti_cert)

    import httplib2

    http = httplib2.Http
    # pylint: disable=protected-access
    normalize = http._normalize_headers

    def my_normalize(self, headers):
        """ This function patches Authorization header """
        ret = normalize(self, headers)
        if 'authorization' in ret:
            ret['Authorization'] = ret.pop('authorization')
        log.debug("headers")
        log.debug(headers)
        return ret

    http._normalize_headers = my_normalize
    monkey_patch_function = normalize
    response, content = client.request(
        url,
        method,
        body=body,
        headers={'Content-Type': content_type})

    http = httplib2.Http
    # pylint: disable=protected-access
    http._normalize_headers = monkey_patch_function

    log.debug("key %s", lti_key)
    log.debug("secret %s", secret)
    log.debug("url %s", url)
    log.debug("response %s", response)
    log.debug("content %s", format(content))

    return response, content


def post_message(consumers, lti_key, url, body):
    """
        Posts a signed message to LTI consumer

    :param consumers: consumers from config
    :param lti_key: key to find appropriate consumer
    :param url: post url
    :param body: xml body
    :return: success
    """
    content_type = 'application/xml'
    method = 'POST'
    (_, content) = _post_patched_request(
        consumers,
        lti_key,
        body,
        url,
        method,
        content_type,
    )

    is_success = "<imsx_codeMajor>success</imsx_codeMajor>" in content
    log.debug("is success %s", is_success)
    return is_success


def post_message2(consumers, lti_key, url, body,
                  method='POST', content_type='application/xml'):
    """
        Posts a signed message to LTI consumer using LTI 2.0 format

    :param: consumers: consumers from config
    :param: lti_key: key to find appropriate consumer
    :param: url: post url
    :param: body: xml body
    :return: success
    """
    # pylint: disable=too-many-arguments
    (response, _) = _post_patched_request(
        consumers,
        lti_key,
        body,
        url,
        method,
        content_type,
    )

    is_success = response.status == 200
    log.debug("is success %s", is_success)

    return is_success


def verify_request_common(consumers, url, method, headers, params):
    """
    Verifies that request is valid

    :param consumers: consumers from config file
    :param url: request url
    :param method: request method
    :param headers: request headers
    :param params: request params
    :return: is request valid
    """

    log.debug("consumers %s", consumers)
    log.debug("url %s", url)
    log.debug("method %s", method)
    log.debug("headers %s", headers)
    log.debug("params %s", params)

    oauth_store = LTIOAuthDataStore(consumers)
    oauth_server = oauth.OAuthServer(oauth_store)
    oauth_server.add_signature_method(
        oauth.OAuthSignatureMethod_PLAINTEXT())
    oauth_server.add_signature_method(
        oauth.OAuthSignatureMethod_HMAC_SHA1())

    # Check header for SSL before selecting the url
    if headers.get('X-Forwarded-Proto', 'http') == 'https':
        url = url.replace('http:', 'https:', 1)

    oauth_request = oauth.OAuthRequest.from_request(
        method,
        url,
        headers=dict(headers),
        parameters=params
    )

    if not oauth_request:
        log.info('Received non oauth request on oauth protected page')
        raise LTIException('This page requires a valid oauth session '
                           'or request')
    try:
        # pylint: disable=protected-access
        consumer = oauth_server._get_consumer(oauth_request)
        oauth_server._check_signature(oauth_request, consumer, None)
    except oauth.OAuthError:
        # Rethrow our own for nice error handling (don't print
        # error message as it will contain the key
        raise LTIException("OAuth error: Please check your key and secret")

    return True


def generate_request_xml(message_identifier_id, operation,
                         lis_result_sourcedid, score, message):
    # pylint: disable=too-many-locals
    """
    Generates LTI 1.1 XML for posting result to LTI consumer.

    :param message_identifier_id:
    :param operation:
    :param lis_result_sourcedid:
    :param score:
    :return: XML string
    """
    root = etree.Element(u'imsx_POXEnvelopeRequest',
                         xmlns=u'http://www.imsglobal.org/services/'
                               u'ltiv1p1/xsd/imsoms_v1p0')

    header = etree.SubElement(root, 'imsx_POXHeader')
    header_info = etree.SubElement(header, 'imsx_POXRequestHeaderInfo')
    version = etree.SubElement(header_info, 'imsx_version')
    version.text = 'V1.0'
    message_identifier = etree.SubElement(header_info,
                                          'imsx_messageIdentifier')
    message_identifier.text = message_identifier_id
    body = etree.SubElement(root, 'imsx_POXBody')
    xml_request = etree.SubElement(body, '%s%s' % (operation, 'Request'))
    record = etree.SubElement(xml_request, 'resultRecord')

    guid = etree.SubElement(record, 'sourcedGUID')

    sourcedid = etree.SubElement(guid, 'sourcedId')
    sourcedid.text = lis_result_sourcedid
    if score is not None:
        result = etree.SubElement(record, 'result')
        result_score = etree.SubElement(result, 'resultScore')
        language = etree.SubElement(result_score, 'language')
        language.text = 'en'
        text_string = etree.SubElement(result_score, 'textString')
        text_string.text = score.__str__()
        if message is not None:
            result_data = etree.SubElement(result, 'resultData')
            text_node = etree.SubElement(result_data, 'text')
            text_node.text = message
    ret = "<?xml version='1.0' encoding='utf-8'?>\n{}".format(
        etree.tostring(root, encoding='utf-8'))

    log.debug("XML Response: \n%s", ret)
    return ret
