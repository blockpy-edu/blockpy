from pprint import pprint
from lxml import etree
from urllib import quote as url_quote
from urllib import urlencode
from HTMLParser import HTMLParser
import logging

class MLStripper(HTMLParser):
    def __init__(self):
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)
def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()

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
from interaction_logger import StructuredEvent
from models.models import (User, Course, 
                           Assignment, AssignmentGroup, AssignmentGroupMembership,
                           Submission, Log)

lti_assignments = Blueprint('lti_assignments', __name__, url_prefix='/lti_assignments')

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
    return render_template('error.html')


@lti_assignments.route('/config/', methods=['GET', 'POST'])
@lti_assignments.route('/config', methods=['GET', 'POST'])
def config():
    """ Create a new assignment with the given information
    """
    return Response(render_template('lti/config.xml',
                                    version='1'), mimetype='text/xml')
                                    
def log_user_ip(uid):
    user_id = str(request.remote_addr)
    question_id = "corgis"
    event = "corgis"
    action = "record"
    body = str(uid)
    external_interactions_logger = logging.getLogger('ExternalInteractions')
    external_interactions_logger.info(
        StructuredEvent(user_id, question_id, event, action, body)
    )

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
    if 'ip_address_found' not in session or session['ip_address_found'] != request.remote_addr:
        session['ip_address_found'] = request.remote_addr
        log_user_ip(user.id)
    # Use the proper template
    if assignments[0].mode == 'maze':
        return render_template('lti/maze.html', lti=lti,
                               assignment= assignments[0], 
                               submission= submissions[0],
                               level=assignments[0].name,
                               user_id=user.id)
    elif assignments[0].mode == 'explain':
        return render_template('lti/explain.html', lti=lti,
                               assignment= assignments[0], 
                               submission= submissions[0],
                               user_id=user.id)
    else:
        return render_template('lti/index.html', lti=lti,
                               group=zip(assignments, submissions),
                               user_id=user.id)
                           
                           
def ensure_canvas_arguments():
    '''
    Translates the current session data into a valid user
    '''
    user = User.from_lti("canvas", 
                         session["pylti_user_id"], 
                         session.get("lis_person_contact_email_primary", ""),
                         session.get("lis_person_name_given", "Canvas"),
                         session.get("lis_person_name_family", "User"))
    if "roles" in session:
        roles = session["roles"].split(",")
    else:
        roles = []
    course = Course.from_lti("canvas", 
                             session["context_id"], 
                             session.get("context_title", ""), 
                             user.id)
    return user, roles, course
    
@lti_assignments.route('/select/', methods=['GET', 'POST'])
@lti_assignments.route('/select', methods=['GET', 'POST'])
@lti(request='initial', error=error, role='staff', app=app)
def select(lti=lti):
    """ Let's the user select from a list of assignments.
    """
    # Store current user_id and context_id
    user, roles, course = ensure_canvas_arguments()
    assignments = Assignment.by_course(course.id, exclude_builtins=True)
    groups = [(group, group.get_assignments())
              for group in AssignmentGroup.by_course(course.id)]
    strays = AssignmentGroup.get_ungrouped_assignments(course.id)
    return_url = session['launch_presentation_return_url']
    
    return render_template('lti/select.html', assignments=assignments, strays=strays, groups=groups, return_url=return_url, menu='select')
    
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
    status = float(request.form.get('status', "0.0"))
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    user = User.from_lti("canvas", session["pylti_user_id"], 
                         session.get("user_email", ""),
                         session.get("lis_person_name_given", ""),
                         session.get("lis_person_name_family", ""))
    assignment = Assignment.by_id(assignment_id)
    if status == 1:
        submission = Submission.save_correct(user.id, assignment_id)
    else:
        submission = assignment.get_submission(user.id)
    if submission.correct:
        message = "Success!"
    else:
        message = "Incomplete"
    url = url_for('lti_assignments.get_submission_code', submission_id=submission.id, _external=True)
    if 'lis_result_sourcedid' not in session:
        return jsonify(success=False, message="Not in a grading context.")
    if assignment.mode == 'maze':
        lti.post_grade(float(submission.correct), "<h1>{0}</h1>".format(message));
    else:
        lti.post_grade(float(submission.correct), "<h1>{0}</h1>".format(message)+"<div>Latest work in progress: <a href='{0}' target='_blank'>View</a></div>".format(url)+"<div>Touches: {0}</div>".format(submission.version)+"Last ran code:<br>"+highlight(submission.code, PythonLexer(), HtmlFormatter()))
    return jsonify(success=True)
    
@lti_assignments.route('/get_submission_code/', methods=['GET', 'POST'])
@lti_assignments.route('/get_submission_code', methods=['GET', 'POST'])
@lti(request='session', app=app)
def get_submission_code(lti=lti):
    user, roles, course = ensure_canvas_arguments()
    submission_id = request.values.get('submission_id', None)
    if submission_id is None:
        return "Sorry, no submission ID was given."
    submission = Submission.query.get(submission_id)
    if User.is_lti_instructor(session["roles"]) or submission.user_id == user.id:
        return submission.code if submission.code else "#No code given!"
    else:
        return "Sorry, you do not have sufficient permissions to spy!"
    
@lti_assignments.route('/save_presentation/', methods=['GET', 'POST'])
@lti_assignments.route('/save_presentation', methods=['GET', 'POST'])
@lti(request='session', app=app)
def save_presentation(lti=lti):
    assignment_id = request.form.get('question_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No Assignment ID given!")
    presentation = request.form.get('presentation', "")
    parsons = request.form.get('parsons', "false") == "true"
    text_first = request.form.get('text_first', "false") == "true"
    name = request.form.get('name', "")
    if User.is_lti_instructor(session["roles"]):
        Assignment.edit(assignment_id=assignment_id, presentation=presentation, name=name, parsons=parsons, text_first=text_first)
        return jsonify(success=True)
    else:
        return jsonify(success=False, message="You are not an instructor!")
        
        
import explain


# refreshAssignment
    
@lti_assignments.route('/assignment/new/', methods=['GET', 'POST'])
@lti_assignments.route('/assignment/new', methods=['GET', 'POST'])
@lti(request='session', app=app)
def new_assignment(lti=lti):
    user, roles, course = ensure_canvas_arguments()
    menu = request.values.get('menu', "select")
    if not User.is_lti_instructor(roles):
        return "You are not an instructor in this course."
    assignment = Assignment.new(owner_id=user.id, course_id=course.id)
    launch_type = 'lti_launch_url' if menu != 'share' else 'iframe'
    endpoint = 'lti_assignments.index' if menu != 'share' else 'lti_assignments.shared'
    return jsonify(success=True,
                   redirect=url_for('lti_assignments.edit_assignment', assignment_id=assignment.id),
                   id= assignment.id,
                   name= assignment.name,
                   body= strip_tags(assignment.body)[:255],
                   title= assignment.title(),
                   select = url_quote(url_for(endpoint, assignment_id=assignment.id, _external=True))+"&return_type="+launch_type+"&title="+url_quote(assignment.title())+"&text=BlockPy%20Exercise&width=100%25&height=600",
                   edit= url_for('lti_assignments.edit_assignment', assignment_id=assignment.id),
                   date_modified = assignment.date_modified.strftime(" %I:%M%p on %a %d, %b %Y").replace(" 0", " "))
    
@lti_assignments.route('/assignment/remove/', methods=['GET', 'POST'])
@lti_assignments.route('/assignment/remove', methods=['GET', 'POST'])
@lti(request='session', app=app)
def remove_assignment(lti=lti):
    assignment_id = request.values.get('assignment_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No assignment id")
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return jsonify(success=False, message="You are not an instructor in this course.")
    # TODO: Security hole, evil instructors could remove assignments outside of their course
    Assignment.remove(assignment_id)
    return jsonify(success=True)
    
@lti_assignments.route('/assignment/get/', methods=['GET', 'POST'])
@lti_assignments.route('/assignment/get', methods=['GET', 'POST'])
@lti(request='session', app=app)
def get_assignment(lti=lti):
    '''
    Returns metadata about the assignment.
    '''
    assignment_id = request.values.get('assignment_id', None)
    if assignment_id is None:
        return jsonify(success=False, message="No assignment id")
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return jsonify(success=False, message="You are not an instructor in this course.")
    # TODO: Security hole, evil instructors could remove assignments outside of their course
    assignment = Assignment.by_id(assignment_id)
    return jsonify(success=True, url=assignment.url, name=assignment.name,
                   body= strip_tags(assignment.body)[:255],
                   on_run=assignment.on_run,
                   title= assignment.title(),
                   answer=assignment.answer, type=assignment.type,
                   visibility=assignment.visibility, disabled=assignment.disabled,
                   mode=assignment.mode, version=assignment.version,
                   id=assignment.id, course_id=assignment.course_id,
                   date_modified = assignment.date_modified.strftime(" %I:%M%p on %a %d, %b %Y").replace(" 0", " "))

import assignment_groups
    
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
@lti(request='initial', error=error, role='staff', app=app)
def share(lti=lti):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    user, roles, course = ensure_canvas_arguments()
    assignments = Assignment.by_course(course.id, exclude_builtins=True)
    groups = [(group, group.get_assignments())
              for group in AssignmentGroup.by_course(course.id)]
    strays = AssignmentGroup.get_ungrouped_assignments(course.id)
    return_url = session['launch_presentation_return_url']
    
    return render_template('lti/select.html', assignments=assignments, strays=strays, groups=groups, return_url=return_url, menu='share')

@lti_assignments.route('/shared/', methods=['GET', 'POST'])
@lti_assignments.route('/shared', methods=['GET', 'POST'])
@lti(request='session', error=error, app=app)
def shared(lti=lti):
    """ render the contents of the assignment template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
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
                               level=assignments[0].name,
                               user_id=user.id)
    elif assignments[0].mode == 'explain':
        return render_template('lti/explain.html', lti=lti,
                               assignment= assignments[0], 
                               submission= submissions[0],
                               user_id=user.id)
    else:
        return render_template('lti/index.html', lti=lti,
                               group=zip(assignments, submissions),
                               user_id=user.id)

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
