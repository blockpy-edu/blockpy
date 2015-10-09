from pprint import pprint
from lxml import etree

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
from models.models import (User, Course, Assignment)

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
def index(lti=lti, assignment_id=None):
    """ initial access page to the lti provider.  This page provides
    authorization for the user.

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    if assignment_id is None:
        return "No assignment, how boring"
    else:
        print "An assignment! Great!", assignment_id
    user, roles, course = ensure_canvas_arguments()
    assignment = Assignment.by_id(assignment_id)
    submission = assignment.get_submission(user.id)
    pprint(session.items())
    return render_template('lti/edit.html', lti=lti,
                           program={}, assignment=assignment)
                           
                           
def ensure_canvas_arguments():
    if request.method == 'POST':
        params = request.form.to_dict()
    else:
        params = request.args.to_dict()
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
@lti(request='session', error=error, role='staff', app=app)
def select(lti=lti):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    # Store current user_id and context_id
    user, roles, course = ensure_canvas_arguments()
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
    
def save_blockpy():
    # Given a problem ID
    # Ensure that the session has the necessary components
    #   Student ID, context ID
    #   and that these match things on record for the problem_id
    return "True"
    
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
    
    return render_template('lti/edit.html', assignment=assignment, submission=submission)
    
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
    session[''] = session['lis_outcome_service_url']
    lti.post_grade(1, "<div>Testing</div><pre>Hello world</pre><br><strong>BE STRONG</strong><em>Hello emphasis</em><iframe src='http://www.google.com'></iframe><img src='http://think.cs.vt.edu/blockpy/static/images/blockly-corgi-logo-large.png' /><span style='color:red'>RED TEXT</span>")
    return "Successful!"