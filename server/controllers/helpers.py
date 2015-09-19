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
            return redirect(url_for('users.login', next=request.url))
        if not g.user.is_admin():
            flash("This portion of the site is only for administrators.")
            return redirect(url_for('users.index'))
        return f(*args, **kwargs)
    return decorated_function