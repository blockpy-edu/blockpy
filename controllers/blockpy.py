import os
import json
from pprint import pprint

from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from main import app

from models.models import db, Assignment

blockpy = Blueprint('blockpy', __name__, url_prefix='/blockpy')

@blockpy.route('/', methods=['GET', 'POST'])
def blockpy_canvas():
    assignment_id = request.args.get('assignment_id', None)
    if assignment_id is not None:
        assignment = Assignment.by_id(assignment_id)
        if g.user is not None:
            submission = assignment.get_submission(g.user.id)
        else:
            submission = {}
    else:
        assignment = {'presentation': '', 'id': 1}
        submission = {}
    user = {'id': 1}
    course = {'id': 1}
        
    return render_template('blockpy.html',
                           assignment=assignment, submission=submission,
                           user=user, course=course)
                           
@blockpy.route('/static/<path:path>', methods=['GET', 'POST'])
def blockpy_static(path):
    return app.send_static_file(path)

@blockpy.route('/save/', methods=['GET', 'POST'])
@blockpy.route('/save', methods=['GET', 'POST'])
def save():
    # problem_id
    if 'question_id' in request.values:
        question_id = request.values['question_id']
    else:
        return jsonify(success=False, message="No problem ID given.")
    # user_id
    if g.user:
        user_id = g.user.id
    else:
        return jsonify(success=False, message="You are not logged in.")
    # values
    code = request.values.get('code', '')
    
    assignment = Assignment.by_id(question_id)
    submission = assignment.get_submission(g.user.id)
    submission.code = code
    db.session.commit()
    
    # Do saving
    return jsonify(success=True)
    
@blockpy.route('/load/', methods=['GET', 'POST'])
@blockpy.route('/load', methods=['GET', 'POST'])
def load():
    return jsonify(success=True, code='a=0', completed=False, timestamp='')
    
@blockpy.route('/analyze_log/', methods=['GET', 'POST'])
@blockpy.route('/analyze_log', methods=['GET', 'POST'])
def analyze():
    log_folder = os.path.join(app.config['ROOT_DIRECTORY'], 'queued_logs')
    files = [f[:-4].split("_") for f in os.listdir(log_folder)]
    return render_template('analyzer.html', files=json.dumps(files))

@blockpy.route('/load_log/', methods=['GET', 'POST'])
@blockpy.route('/load_log', methods=['GET', 'POST'])
def analyze_load_log():
    assignment_id = request.args.get('assignment_id', None)
    user_id = request.args.get('user_id', None)
    if None in (assignment_id, user_id):
        return jsonify(success=False, message="No user_id or assignment_id given")
    assignment = Assignment.by_id(assignment_id)
    log_file = str(user_id)+"_"+str(assignment_id)+".log"
    log_file = os.path.join(app.config['ROOT_DIRECTORY'], 'queued_logs', log_file)
    if not os.path.isfile(log_file):
        return jsonify(success=False, message="No log found")
    with open(log_file) as opened_file:
        records = [json.loads(line) for line in opened_file]
    return render_template('analyzer.html',
                           records=json.dumps(records),
                           assignment=assignment)

