from pprint import pprint
from lxml import etree
from urllib import quote as url_quote
import json

# Pygments, for reporting nicely formatted Python snippets
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField

from pylti.flask import lti

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from controllers.helpers import instructor_required

from main import app
from models.models import (User, Course, Assignment, AssignmentGroup, 
                           Submission, Log)
                           
from lti import lti_assignments, ensure_canvas_arguments

@lti_assignments.route('/explain_upload/', methods=['GET', 'POST'])
@lti_assignments.route('/explain_upload', methods=['GET', 'POST'])
@lti(request='session', app=app)
def explain_upload(lti=lti):
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    user, roles, course = ensure_canvas_arguments()

@lti_assignments.route('/explain/download/', methods=['GET', 'POST'])
@lti_assignments.route('/explain/download', methods=['GET', 'POST'])
def download():
    assignment_id = request.values.get('assignment_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    user = User.from_lti("canvas", session["pylti_user_id"], 
                         session.get("user_email", ""),
                         session.get("lis_person_name_given", ""),
                         session.get("lis_person_name_family", ""))
    submission = Submission.load(user.id, assignment_id)
    submission_destructured = submission.load_explanation()
    return jsonify(success=True, **submission_destructured)
    
#TODO: I wrote book_id instead of course_id all over the place for the uploading
    
@lti_assignments.route('/explain/delete/', methods=['GET', 'POST'])
@lti_assignments.route('/explain/delete', methods=['GET', 'POST'])
def delete():
    directive_id = request.values.get('directive_id', None)
    book_id = request.values.get('book_id', None)
    student_id = request.values.get('student_id', None)
    
    if student_id:
        student = User.query.get(student_id)
    else:
        student = g.user
    
    if not (directive_id or book_id):
        return jsonify(success=False, message="Insufficient parameters! Given {}".format(request.values))
    
    directory = os.path.join(app.config['FLASK_APP_DIR'],
                             'uploads', str(book_id), 
                             directive_id, str(student.id))
    full_file_path = os.path.join(directory, file_name)
    
    try:
        os.remove(full_file_path)
    except OSError, e:
        app.logger.warning(e.args)
    
    any_files = bool(os.listdir(directory))
    save_response(student_id, student.course_id, directive_id,
                  complete=any_files, timestamp=datetime.datetime.utcnow())
    
    return file_name

@lti_assignments.route('/explain/upload/', methods=['POST'])
@lti_assignments.route('/explain/upload', methods=['POST'])
def upload():
    assignment_id = request.values.get('assignment_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    user = User.from_lti("canvas", session["pylti_user_id"], 
                         session.get("user_email", ""),
                         session.get("lis_person_name_given", ""),
                         session.get("lis_person_name_family", ""))
    submission = Submission.load(user.id, assignment_id)
    
    # Get the uploaded information
    data_file = request.files.get('files')
    if not data_file:
        return jsonify(success=False, message="No data file!")
    code_submission = data_file.read()
    
    submission_destructured = submission.save_explanation_code(code_submission)
    
    return jsonify(success=True, **submission_destructured)
    