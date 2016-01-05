from pprint import pprint

from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField, TextAreaField, SubmitField

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from controllers.helpers import instructor_required, login_required

from main import app
from models.models import db, Assignment, Course, Role

courses = Blueprint('courses', __name__, url_prefix='/courses')

class AddCourseForm(Form):
    name = TextAreaField("Name")
    submit = SubmitField("Add new course")

@courses.route('/add/', methods=['GET', 'POST'])
@courses.route('/add', methods=['GET', 'POST'])
@instructor_required
def add():
    """ Create a new assignment with the given information
    """
    return render_template('courses/add.html')
    
@courses.route('/<course_id>/', methods=['GET', 'POST'])
@courses.route('/<course_id>', methods=['GET', 'POST'])
@login_required
def course(course_id):
    course = Course.query.filter_by(id=course_id).first()
    assignments = (db.session.query(Assignment)
                             .filter(Assignment.course_id==course.id)
                             .all())
    return render_template('courses/course.html', 
                           course=course,
                           assignments=assignments)

@courses.route('/', methods=['GET', 'POST'])
@login_required
def index():
    """
    List all of the courses associated with the user.
    """
    
    user_id = g.user.id
    
    local_courses = (db.session.query(Course, Role)
                               .filter(Role.user_id == user_id,
                                       Role.course_id == Course.id)
                               .order_by(Role.name)
                               .all())
    
    return render_template('courses/index.html', courses=local_courses)