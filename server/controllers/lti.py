from pprint import pprint
from lxml import etree
from urllib import quote as url_quote

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
from models.models import (User, Course, Assignment, AssignmentGroup, 
                           Submission, Log)

lti_assignments = Blueprint('lti_assignments', __name__, url_prefix='/lti_assignments')

def error(exception=None):
    """ render error page

    :param exception: optional exception
    :return: the error.html template rendered
    """
    if request.method == 'POST':
        params = request.form.to_dict()
    else:
        params = request.args.to_dict()
    return render_template('error.html')


@lti_assignments.route('/config/', methods=['GET', 'POST'])
@lti_assignments.route('/config', methods=['GET', 'POST'])
def config():
    """ Create a new assignment with the given information
    """
    return Response(render_template('lti/config.xml',
                                    version='1'), mimetype='text/xml')

@lti_assignments.route('/', methods=['GET', 'POST'])
@lti_assignments.route('/index', methods=['GET', 'POST'])
@lti_assignments.route('/lti', methods=['GET', 'POST'])
@lti(request='initial', error=error, app=app)
def index(lti=lti):
    """ initial access page to the lti provider.  This page provides
    authorization for the user.

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    assignment_id = request.args.get('assignment_id', None)
    assignment_group_id = request.args.get('assignment_group_id', None)
    user, roles, course = ensure_canvas_arguments()
    # Assignment group or individual assignment?
    if assignment_group_id is not None:
        group = AssignmentGroup.by_id(assignment_group_id)
        assignments = group.get_assignments()
        submissions = [a.get_submission(user.id) for a in assignments]
    elif assignment_id is not None:
        assignments = [Assignment.by_id(assignment_id)]
        submissions = [assignments[0].get_submission(user.id)]
    else:
        return error()
    # Use the proper template
    if assignments[0].mode == 'maze':
        return render_template('lti/maze.html', lti=lti,
                               assignment= assignments[0], 
                               submission= submissions[0],
                               level=assignments[0].name)
    else:
        return render_template('lti/index.html', lti=lti,
                               group=zip(assignments, submissions))
                           
                           
def ensure_canvas_arguments():
    '''
    Translates the current session data into a valid user
    '''
    user = User.from_lti("canvas", 
                         session["pylti_user_id"], 
                         session.get("lis_person_contact_email_primary", ""),
                         session.get("lis_person_name_given", "Canvas"),
                         session.get("lis_person_name_family", "User"))
    roles = session["roles"]
    course = Course.from_lti("canvas", 
                             session["context_id"], 
                             session.get("context_title", ""), 
                             user.id)
    return user, roles.split(","), course
    
@lti_assignments.route('/select/', methods=['GET', 'POST'])
@lti_assignments.route('/select', methods=['GET', 'POST'])
@lti(request='initial', error=error, role='staff', app=app)
def select(lti=lti):
    """ Let's the user select from a list of assignments.
    """
    # Store current user_id and context_id
    user, roles, course = ensure_canvas_arguments()
    assignments = Assignment.by_course(course.id, exclude_builtins=True)
    return_url = session['launch_presentation_return_url']
    
    return render_template('lti/select.html', assignments=assignments, return_url=return_url)
    
@lti_assignments.route('/check_assignments/', methods=['GET', 'POST'])
@lti_assignments.route('/check_assignments', methods=['GET', 'POST'])
@lti(request='session', app=app)
def check_assignments(lti=lti):
    """ An AJAX endpoint for listing any new assignments.
    
    Unused.
    """
    # Store current user_id and context_id
    user, roles, course = ensure_canvas_arguments()
    assignments = Assignment.by_course(course.id)
    return jsonify(success=True, assignments=[a.to_dict() for a in assignments])
    
@lti_assignments.route('/save_code/', methods=['GET', 'POST'])
@lti_assignments.route('/save_code', methods=['GET', 'POST'])
@lti(request='session', app=app)
def save_code(lti=lti):
    assignment_id = request.form.get('question_id', None)
    assignment_version = int(request.form.get('version', -1))
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    code = request.form.get('code', '')
    filename = request.form.get('filename', '__main__')
    user = User.from_lti("canvas", session["pylti_user_id"], 
                         session.get("user_email", ""),
                         session.get("lis_person_name_given", ""),
                         session.get("lis_person_name_family", ""))
    is_version_correct = True
    if filename == "__main__":
        submission, is_version_correct = Submission.save_code(user.id, assignment_id, code, assignment_version)
    elif User.is_lti_instructor(session["roles"]):
        if filename == "on_run":
            Assignment.edit(assignment_id=assignment_id, on_run=code)
        elif filename == "on_change":
            Assignment.edit(assignment_id=assignment_id, on_step=code)
        elif filename == "starting_code":
            Assignment.edit(assignment_id=assignment_id, on_start=code)
    return jsonify(success=True, is_version_correct=is_version_correct)
    
@lti_assignments.route('/save_events/', methods=['GET', 'POST'])
@lti_assignments.route('/save_events', methods=['GET', 'POST'])
@lti(request='session', app=app)
def save_events(lti=lti):
    assignment_id = request.form.get('question_id', None)
    event = request.form.get('event', "blank")
    action = request.form.get('action', "missing")
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    user = User.from_lti("canvas", session["pylti_user_id"], 
                         session.get("user_email", ""),
                         session.get("lis_person_name_given", ""),
                         session.get("lis_person_name_family", ""))
    log = Log.new(event, action, assignment_id, user.id)
    return jsonify(success=True)
    
@lti_assignments.route('/save_correct/', methods=['GET', 'POST'])
@lti_assignments.route('/save_correct', methods=['GET', 'POST'])
@lti(request='session', app=app)
def save_correct(lti=lti):
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    user = User.from_lti("canvas", session["pylti_user_id"], 
                         session.get("user_email", ""),
                         session.get("lis_person_name_given", ""),
                         session.get("lis_person_name_family", ""))
    assignment = Assignment.by_id(assignment_id)
    submission = Submission.save_correct(user.id, assignment_id)
    if assignment.mode == 'maze':
        lti.post_grade(1, "<h1>Success</h1>");
    else:
        lti.post_grade(1, "<h1>Success</h1>"+highlight(submission.code, PythonLexer(), HtmlFormatter()))
    return jsonify(success=True)
    
@lti_assignments.route('/save_presentation/', methods=['GET', 'POST'])
@lti_assignments.route('/save_presentation', methods=['GET', 'POST'])
@lti(request='session', app=app)
def save_presentation(lti=lti):
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    presentation = request.form.get('presentation', "")
    name = request.form.get('name', "")
    if User.is_lti_instructor(session["roles"]):
        Assignment.edit(assignment_id=assignment_id, presentation=presentation, name=name)
        return jsonify(success=True)
    else:
        return jsonify(success=False, message="You are not an instructor!")
    
@lti_assignments.route('/new_assignment/', methods=['GET', 'POST'])
@lti_assignments.route('/new_assignment', methods=['GET', 'POST'])
@lti(request='session', app=app)
def new_assignment(lti=lti):
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return "You are not an instructor in this course."
    assignment = Assignment.new(owner_id=user.id, course_id=course.id)
    return redirect(url_for('lti_assignments.edit_assignment', assignment_id=assignment.id))
    
@lti_assignments.route('/select_builtin_assignment/', methods=['GET', 'POST'])
@lti_assignments.route('/select_builtin_assignment', methods=['GET', 'POST'])
@lti(request='session', app=app)
def select_builtin_assignment(lti=lti):
    assignment_type = request.args.get('assignment_type', None)
    assignment_id = request.args.get('assignment_id', None)
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return "You are not an instructor in this course."
    assignment = Assignment.by_builtin(assignment_type, assignment_id, 
                                       owner_id=user.id, course_id=course.id)
    assignment_url = url_for('lti_assignments.index', 
                                    assignment_id=assignment.id, 
                                    _external=True)
    print assignment_url
    encoded_url = url_quote(assignment_url)
    return jsonify(url=encoded_url)
    
@lti_assignments.route('/edit_assignment/<int:assignment_id>/', methods=['GET', 'POST'])
@lti_assignments.route('/edit_assignment/<int:assignment_id>', methods=['GET', 'POST'])
@lti(request='session', app=app)
def edit_assignment(assignment_id, lti=lti):
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
                           
        
@lti_assignments.route('/batch_edit/', methods=['GET', 'POST'])
@lti_assignments.route('/batch_edit', methods=['GET', 'POST'])
@lti(request='session', app=app)
def batch_edit(lti=lti):
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return "You are not an instructor in this course."
    assignments = Assignment.by_course(course.id)
    return render_template('lti/batch.html', 
                           assignments=assignments,
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
    user, roles, course = ensure_canvas_arguments()
    return "Sorry this feature has not been implemented yet!"


@lti_assignments.route('/grade', methods=['POST'])
@lti(request='session', app=app)
def grade(lti=lti):
    """ post grade

    :param lti: the `lti` object from `pylti`
    :return: grade rendered by grade.html template
    """
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    user = User.from_lti("canvas", session["pylti_user_id"], 
                         session.get("user_email", ""))
    submission = Submission.save_correct(user.id, assignment_id)
    if 'lis_result_sourcedid' not in session:
        return "Failure"
    #session[''] = session['lis_outcome_service_url']
    lti.post_grade(1, "<h1>Success</h1>"+highlight(submission.code, PythonLexer(), HtmlFormatter()))
    return "Successful!"
