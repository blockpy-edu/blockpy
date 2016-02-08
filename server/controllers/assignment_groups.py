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
                           AssignmentGroupMembership,
                           Submission, Log)
                           
from lti import lti_assignments, ensure_canvas_arguments


@lti_assignments.route('/group/add', methods=['GET', 'POST'])
@lti_assignments.route('/group/add', methods=['GET', 'POST'])
@lti(request='session', app=app)
def add_group(lti=lti):
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return jsonify(success=False, message="You are not an instructor in this course.")
    assignment_group = AssignmentGroup.new(owner_id=user.id, course_id=course.id)
    return jsonify(success=True, id=assignment_group.id, name=assignment_group.name)
    
@lti_assignments.route('/group/remove', methods=['GET', 'POST'])
@lti_assignments.route('/group/remove', methods=['GET', 'POST'])
@lti(request='session', app=app)
def remove_group(lti=lti):
    assignment_group_id = request.values.get('assignment_group_id', None)
    if assignment_group_id is None:
        return jsonify(success=False, message="No assignment group id")
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return jsonify(success=False, message="You are not an instructor in this course.")
    AssignmentGroup.remove(assignment_group_id)
    return jsonify(success=True)
    
@lti_assignments.route('/group/edit', methods=['GET', 'POST'])
@lti_assignments.route('/group/edit', methods=['GET', 'POST'])
@lti(request='session', app=app)
def edit_group(lti=lti):
    assignment_group_id = request.values.get('assignment_group_id', None)
    new_name = request.values.get('new_name', None)
    if None in (assignment_group_id, new_name):
        return jsonify(success=False, message="No assignment group id, or no new_name given.")
    user, roles, course = ensure_canvas_arguments()
    print user, roles, course
    if not User.is_lti_instructor(roles):
        return jsonify(success=False, message="You are not an instructor in this course.")
    AssignmentGroup.edit(assignment_group_id, name=new_name)
    return jsonify(success=True)

@lti_assignments.route('/group/move', methods=['GET', 'POST'])
@lti_assignments.route('/group/move/', methods=['GET', 'POST'])
@lti(request='session', app=app)
def move_group(lti=lti):
    assignment_id = request.values.get('assignment_id', None)
    new_group_id = request.values.get('new_group_id', None)
    if None in (assignment_id, new_group_id):
        return jsonify(success=False, message="Need assignment_id and new_group_id.")
    user, roles, course = ensure_canvas_arguments()
    if not User.is_lti_instructor(roles):
        return jsonify(success=False, message="You are not an instructor in this course.")
    AssignmentGroupMembership.move_assignment(assignment_id, new_group_id)
    return jsonify(success=True)

