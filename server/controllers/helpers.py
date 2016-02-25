# Built-in imports
from datetime import timedelta
from functools import wraps, update_wrapper
import calendar, datetime
import json

# Flask imports
from flask import g, request, redirect, url_for, make_response, current_app
from flask import flash

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return redirect(url_for('security.login', next=request.url))
        if not g.user.is_admin():
            flash("This portion of the site is only for administrators.")
            return redirect(url_for('users.index'))
        return f(*args, **kwargs)
    return decorated_function

def instructor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return redirect(url_for('security.login', next=request.url))
        if not g.user.is_instructor():
            flash("This portion of the site is only for instructors.")
            return redirect(url_for('users.index'))
        return f(*args, **kwargs)
    return decorated_function

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user is None:
            return redirect(url_for('security.login', next=request.url))
        return f(*args, **kwargs)
    return decorated_function
    
def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    print "FUCKING"
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    print "DEATH PIG"
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    print "MURDER"
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    print "CHRIST"
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods
        print "ELLIE"
        options_resp = current_app.make_default_options_response()
        print options_resp.headers
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers
            print "DOES"
            h['Access-Control-Allow-Origin'] = origin
            print "GAMMA"
            h['Access-Control-Allow-Methods'] = get_methods()
            print "BANANA"
            h['Access-Control-Max-Age'] = str(max_age)
            print "ALPHA"
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            print "CRASH"
            return resp

        f.provide_automatic_options = False
        print "HERE"
        return update_wrapper(wrapped_function, f)
    return decorator