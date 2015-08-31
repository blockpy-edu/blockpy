from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from main import app

blockpy = Blueprint('blockpy', __name__, url_prefix='/blockpy')

@blockpy.route('/save/', methods=['GET', 'POST'])
@blockpy.route('/save', methods=['GET', 'POST'])
def save():
    # problem_id
    if 'problem_id' in request.args:
        problem_id = request.args['problem_id']
    else:
        return jsonify(success=False, message="No problem ID given.")
    # user_id
    if g.user:
        user_id = g.user.id
    else:
        return jsonify(success=False, message="You are not logged in.")
    # values
    code = request.args.get('code', '')
    correct = request.args.get('correct', 'false') == "true"
    
    # Do saving
    return jsonify(success=True)
    
@blockpy.route('/load/', methods=['GET', 'POST'])
@blockpy.route('/load', methods=['GET', 'POST'])
def load():
    return jsonify(success=True, data={'code': 'a=0', 'completed': 'false', 'timestamp': ''})