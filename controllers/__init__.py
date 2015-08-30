import os

from main import app

from models.models import User
from flask import session, g, send_from_directory, request, jsonify, render_template
from flask import redirect, url_for
from flask_security.core import current_user

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    
@app.route('/shutdown', methods=['GET', 'POST'])
def shutdown():
    shutdown_server()
    return 'Server shutting down...'

@app.before_request
def load_user():
    pass #g.user = current_user
    #if current_user.is_authenticated():
    #    g.user = current_user
    #    #log_page_access()
    #else:
    #    g.user = None

from teachers import teachers
app.register_blueprint(teachers)

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
    
@app.route('/blockpy', methods=['GET', 'POST'])
def blockpy():
    """ initial access page to the lti provider.  This page provides
    authorization for the user.

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    return render_template('blockpy.html',
                           program={})

@app.route('/favicon.ico', methods=['GET', 'POST'])
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')
@app.route("/site-map", methods=['GET', 'POST'])
def site_map():
    links = []
    for rule in app.url_map.iter_rules():
        # Filter out rules we can't navigate to in a browser
        # and rules that require parameters
        try:
            url = url_for(rule.endpoint)
        except:
            url = "Unknown"
        links.append((url, rule.endpoint))
    # links is now a list of url, endpoint tuples
    return "<br>\n".join(["{} => {}".format(u, e) for u, e in links])
