from pprint import pprint
from lxml import etree

# Pygments, for reporting nicely formatted Python snippets
from pygments import highlight
from pygments.lexers import PythonLexer
from pygments.formatters import HtmlFormatter

from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField

from pylti.flask import lti
from pylti.common import LTI_PROPERTY_LIST 
LTI_PROPERTY_LIST.append('context_title')

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from controllers.helpers import instructor_required

from main import app
from models.models import (User, Course, Assignment, Submission)

lti_assignments = Blueprint('lti_assignments', __name__, url_prefix='/lti_assignments')

'''
A user registeres on BlockPy as a teacher:
    They are given relevant config information
    They put this into Canvas
    
"I Want to use Canvas"
    They are given relevant config information
    They add it, and several things are configured:
        {select/}
        {add/}
        {assignment/}
        Link Selector (Add new assignment)
            * Polls for new/deleted assignments every so often
            * Grouped by course, ordered by title
            Select from an existing one (returns a URL linking to an assignment version of that)
            "Add New" (opens a new window, instructor mode block canas with "save" button)
            
        {share/}
        Rich Text Editor (Dummy Canvas)
            Uneditable except in instructor mode
            
        {grade/}
        Grade Passback
            Returns a number (0..1) and some explanation text
            
        {dashboard}
        Dashboard Navigation
            Brings up the dashboard for that course immediately
            
"I want to use this site"
    {select/}
    Get a link to an existing assignment
    {add/}
    Add a new assignment
    {assignment/}
    The link to an assignment
    

Add an assignment
Delete an assignment
Fork an assignment

Assignment

Question
    Presentation
    Starting code
    On_run code
    
Add/Delete/List/Edit Courses

''' 

def error(exception=None):
    """ render error page

    :param exception: optional exception
    :return: the error.html template rendered
    """
    print exception
    if request.method == 'POST':
        params = request.form.to_dict()
    else:
        params = request.args.to_dict()
    print(params)
    return render_template('error.html')


@lti_assignments.route('/config/', methods=['GET', 'POST'])
@lti_assignments.route('/config', methods=['GET', 'POST'])
def config():
    """ Create a new assignment with the given information
    """
    return Response(render_template('lti/config.xml',
                                    version='1'), mimetype='text/xml')

@lti_assignments.route('/', methods=['GET', 'POST'])
@lti_assignments.route('/index', methods=['GET'])
@lti_assignments.route('/lti', methods=['GET', 'POST'])
@lti(request='initial', error=error, app=app)
def index(lti=lti):
    """ initial access page to the lti provider.  This page provides
    authorization for the user.

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    assignment_id = request.args.get('assignment_id', None)
    if assignment_id is None:
        return "No assignment, how boring"
    else:
        print "An assignment! Great!", assignment_id
    user, roles, course = ensure_canvas_arguments()
    assignment = Assignment.by_id(assignment_id)
    submission = assignment.get_submission(user.id)
    pprint(session.items())
    return render_template('lti/index.html', lti=lti,
                           program={}, assignment=assignment, submission=submission)
                           
                           
def ensure_canvas_arguments():
    if request.method == 'POST':
        params = request.form.to_dict()
    else:
        params = request.args.to_dict()
    if 'launch_presentation_return_url' in params:
        session['launch_presentation_return_url'] = params['launch_presentation_return_url']
    if "stored_context_id" not in session:
        session["stored_context_id"] = params['context_id']
    if "stored_context_title" not in session:
        session["stored_context_title"] = params.get('context_title', "")
    if "stored_user_id" not in session:    
        session["stored_user_id"] = params['user_id']
    if "stored_user_role" not in session:
        session["stored_user_role"] = params['roles']
    if "stored_user_email" not in session:
        session["stored_user_email"] = params.get("lis_person_contact_email_primary", "")
    user = User.from_lti("canvas", session["stored_user_id"], 
                         session["stored_user_email"])
    roles = session["stored_user_role"]
    course = Course.from_lti("canvas", 
                             session["stored_context_id"], 
                             session["stored_context_title"], 
                             user.id)
    return user, roles.split(","), course
    
@lti_assignments.route('/select/', methods=['GET', 'POST'])
@lti_assignments.route('/select', methods=['GET', 'POST'])
@lti(request='initial', error=error, role='staff', app=app)
def select(lti=lti):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    # Store current user_id and context_id
    user, roles, course = ensure_canvas_arguments()
    print roles
    assignments = Assignment.by_course(course.id)
    return_url = session['launch_presentation_return_url']
    
    return render_template('lti/select.html', assignments=assignments, return_url=return_url)
    
@lti_assignments.route('/check_assignments/', methods=['GET', 'POST'])
@lti_assignments.route('/check_assignments', methods=['GET', 'POST'])
def check_assignments():
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    # Store current user_id and context_id
    user, roles, course = ensure_canvas_arguments()
    assignments = Assignment.by_course(course.id)
    return jsonify(success=True, assignments=[a.to_dict() for a in assignments])
    
@lti_assignments.route('/save_code/', methods=['GET', 'POST'])
@lti_assignments.route('/save_code', methods=['GET', 'POST'])
def save_code():
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    code = request.form.get('code', '')
    filename = request.form.get('filename', '__main__')
    NEEDED_KEYS = ["stored_user_id", "stored_user_email"]
    if not bool(key for key in NEEDED_KEYS if key in session):
        return jsonify(success=False, message="LTI Authentication error!")
    user = User.from_lti("canvas", session["stored_user_id"], 
                         session["stored_user_email"])
    if filename == "__main__":
        Submission.save_code(user.id, assignment_id, code)
    elif User.is_lti_instructor(session["stored_user_role"]):
        if filename == "on_run":
            Assignment.edit(assignment_id=assignment_id, on_run=code)
        elif filename == "on_change":
            Assignment.edit(assignment_id=assignment_id, on_step=code)
        elif filename == "starting_code":
            Assignment.edit(assignment_id=assignment_id, on_start=code)
    return jsonify(success=True)
    
@lti_assignments.route('/save_correct/', methods=['GET', 'POST'])
@lti_assignments.route('/save_correct', methods=['GET', 'POST'])
def save_correct():
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    NEEDED_KEYS = ["stored_user_id", "stored_user_email"]
    if not bool(key for key in NEEDED_KEYS if key in session):
        return jsonify(success=False, message="LTI Authentication error!")
    user = User.from_lti("canvas", session["stored_user_id"], 
                         session["stored_user_email"])
    submission = Submission.save_correct(user.id, assignment_id)
    return jsonify(success=True)
    
@lti_assignments.route('/save_presentation/', methods=['GET', 'POST'])
@lti_assignments.route('/save_presentation', methods=['GET', 'POST'])
def save_presentation():
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    presentation = request.form.get('presentation', "")
    NEEDED_KEYS = ["stored_user_id", "stored_user_email"]
    if not bool(key for key in NEEDED_KEYS if key in session):
        return jsonify(success=False, message="LTI Authentication error!")
    if User.is_lti_instructor(session["stored_user_role"]):
        Assignment.edit(assignment_id=assignment_id, presentation=presentation)
        return jsonify(success=True)
    else:
        return jsonify(success=False, message="You are not an instructor!")
    
@lti_assignments.route('/new_assignment/', methods=['GET', 'POST'])
@lti_assignments.route('/new_assignment', methods=['GET', 'POST'])
def new_assignment():
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return "You are not an instructor in this course."
    assignment = Assignment.new(owner_id=user.id, course_id=course.id)
    print(assignment)
    return redirect(url_for('lti_assignments.edit_assignment', assignment_id=assignment.id))
    
@lti_assignments.route('/edit_assignment/<int:assignment_id>/', methods=['GET', 'POST'])
@lti_assignments.route('/edit_assignment/<int:assignment_id>', methods=['GET', 'POST'])
def edit_assignment(assignment_id):
    user, roles, course = ensure_canvas_arguments()
    assignment = Assignment.by_id(assignment_id)
    if not assignment:
        return "Assignment ID not found"
    if not User.is_lti_instructor(roles):
        return "You are not an instructor in this course."
    if not assignment.context_is_valid(course.external_id):
        return "This assignment does not belong to this course."
    submission = assignment.get_submission(user.id)
    
    return render_template('lti/edit.html', 
                           assignment=assignment, 
                           submission=submission, 
                           user_id=user.id,
                           context_id=course.id)
    
@lti_assignments.route('/dashboard/', methods=['GET', 'POST'])
@lti_assignments.route('/dashboard', methods=['GET', 'POST'])
@lti(request='session', error=error, role='staff', app=app)
def dashboard(lti=lti):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    return "Choose from the below:<ol><li>Test</li></ol>"
    
@lti_assignments.route('/share/', methods=['GET', 'POST'])
@lti_assignments.route('/share', methods=['GET', 'POST'])
@lti(request='session', app=app)
def share(lti=lti):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    return "Choose from the below:<ol><li>Test</li></ol>"


@lti_assignments.route('/grade', methods=['POST'])
@lti(request='session', app=app)
def grade(lti=lti):
    """ post grade

    :param lti: the `lti` object from `pylti`
    :return: grade rendered by grade.html template
    """
    pprint(session.items())
    pprint(vars(session))
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    NEEDED_KEYS = ["stored_user_id", "stored_user_email"]
    if not bool(key for key in NEEDED_KEYS if key in session):
        return jsonify(success=False, message="LTI Authentication error!")
    user = User.from_lti("canvas", session["stored_user_id"], 
                         session["stored_user_email"])
    submission = Submission.save_correct(user.id, assignment_id)
    session[''] = session['lis_outcome_service_url']
    lti.post_grade(1, "<h1>Success</h1>"+highlight(submission.code, PythonLexer(), HtmlFormatter()))
    return "Successful!"