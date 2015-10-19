import os
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
            submission = assignment.get_submission(user.id)
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
    
