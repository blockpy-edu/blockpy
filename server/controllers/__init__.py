import os

from main import app

from models.models import db, User, Role
from flask import session, g, send_from_directory, request, jsonify, render_template
from flask import redirect, url_for
from flask_security.core import current_user

from controllers.helpers import admin_required

@app.before_request
def load_user():
    if current_user.is_authenticated():
        g.user = current_user
    else:
        g.user = None

from admin import admin

import security 

from users import users
app.register_blueprint(users)

from courses import courses
app.register_blueprint(courses)

from lti import lti_assignments
app.register_blueprint(lti_assignments)

from services import services
app.register_blueprint(services)

from blockpy import blockpy
app.register_blueprint(blockpy)

@app.route('/', methods=['GET', 'POST'])
def index():
    """ initial access page to the lti provider.  This page provides
    authorization for the user.

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    return render_template('index.html')

@app.route('/favicon.ico', methods=['GET', 'POST'])
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')
@app.route("/site-map", methods=['GET', 'POST'])
def site_map():
    import urllib
    output = []
    for rule in app.url_map.iter_rules():

        options = {}
        for arg in rule.arguments:
            options[arg] = "[{0}]".format(arg)

        methods = ','.join(rule.methods)
        try:
            url = url_for(rule.endpoint, **options)
        except:
            url = "Unknown error"
        line = urllib.unquote("<td>{:50s}</td><td>{:20s}</td><td>{}</td>".format(rule.endpoint, methods, url))
        output.append(line)
    return "<table><tr>{}</tr></table>".format("</tr><tr>".join(sorted(output)))
        