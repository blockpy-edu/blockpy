from pprint import pprint

from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField, TextAreaField, SubmitField

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from controllers.helpers import instructor_required

from main import app

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

@courses.route('/', methods=['GET', 'POST'])
@instructor_required
def index():
    """ Create a new assignment with the given information
    """
    return render_template('courses/index.html')