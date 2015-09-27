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
def index(lti=lti, assignment=None):
    """ initial access page to the lti provider.  This page provides
    authorization for the user.

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    if assignment is None:
        print "No assignment, how boring"
    else:
        print "An assignment! Great!", assignment
    return render_template('blockpy.html', lti=lti,
                           program={})
    
@lti_assignments.route('/select/', methods=['GET', 'POST'])
@lti_assignments.route('/select', methods=['GET', 'POST'])
@lti(request='session', error=error, role='staff', app=app)
def select(lti=lti):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    if request.method == 'POST':
        params = request.form.to_dict()
    else:
        params = request.args.to_dict()
    pprint(params.items())
    user_id = params['user_id']
    user_name = params['lis_person_name_full']
    #user_nickname = lti.nickname
    user_roles = params['roles']
    resource_id = params['resource_link_id']
    assignment_name = params['resource_link_title']
    context_name = params['context_title']
    context_id = params['context_id']
    width = params['launch_presentation_width']
    height = params['launch_presentation_height']
    return_url = params['launch_presentation_return_url']
    message_type = params['lti_message_type']
    return_type = params['ext_content_return_types']
    
    courses=range(10)
    
    return render_template('lti/select.html', courses=courses, return_url=return_url)
    
@lti_assignments.route('/edit/', methods=['GET', 'POST'])
@lti_assignments.route('/edit', methods=['GET', 'POST'])
def edit(assignment=None):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    pprint(vars(session))
    pprint(session.items())
    
    courses=range(100)
    
    return render_template('lti/edit.html')
    
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
    form = AddForm()
    correct = ((form.p1.data + form.p2.data) == form.result.data)
    form.correct.data = correct
    pylti.post_grade(1 if correct else 0)
    return render_template('grade.html', form=form)