from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField

from pylti.flask import lti

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from main import app

teachers = Blueprint('teachers', __name__, url_prefix='/teachers')

assignments = Blueprint('assignments', __name__, url_prefix='/assignments')

'''
Add an assignment
Delete an assignment
Fork an assignment

Assignment

Question
    Presentation
    Starting code
    On_run code

'''

@assignments.route('/add', methods=['GET', 'POST'])
def add_assignment(presentation, starting_code, on_run):
    """ Create a new assignment with the given information
    """
    return render_template('blockpy.html', lti=lti,
                           program={})

class AddForm(Form):
    """ Add data from Form

    :param Form:
    """

    p1 = IntegerField('p1')
    p2 = IntegerField('p2')
    result = IntegerField('result')
    correct = BooleanField('correct')
    

def error(exception=None):
    """ render error page

    :param exception: optional exception
    :return: the error.html template rendered
    """
    return render_template('error.html')


@teachers.route('/is_up', methods=['GET'])
def hello_world(lti=lti):
    """ Indicate the app is working. Provided for debugging purposes.

    :param lti: the `lti` object from `pylti`
    :return: simple page that indicates the request was processed by the lti
        provider
    """
    return render_template('up.html', lti=lti)


@teachers.route('/', methods=['GET', 'POST'])
@teachers.route('/index', methods=['GET'])
@teachers.route('/lti/', methods=['GET', 'POST'])
@teachers.route('/lti', methods=['GET', 'POST'])
@lti(request='initial', error=error, app=app)
def index(lti=lti):
    """ initial access page to the lti provider.  This page provides
    authorization for the user.

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    return render_template('blockpy.html', lti=lti,
                           program={})


@teachers.route('/index_staff', methods=['GET', 'POST'])
@lti(request='session', error=error, role='staff', app=app)
def index_staff(lti=lti):
    """ render the contents of the staff.html template

    :param lti: the `lti` object from `pylti`
    :return: the staff.html template rendered
    """
    return render_template('staff.html', lti=lti)


@teachers.route('/add', methods=['GET'])
@lti(request='session', error=error, app=app)
def add_form(lti=lti):
    """ initial access page for lti consumer

    :param lti: the `lti` object from `pylti`
    :return: index page for lti provider
    """
    form = AddForm()
    form.p1.data = randint(1, 9)
    form.p2.data = randint(1, 9)
    return render_template('add.html', form=form)


@teachers.route('/grade', methods=['POST'])
@lti(request='session', error=error, app=app)
def grade(lti=lti):
    """ post grade

    :param lti: the `lti` object from `pylti`
    :return: grade rendered by grade.html template
    """
    form = AddForm()
    correct = ((form.p1.data + form.p2.data) == form.result.data)
    form.correct.data = correct
    lti.post_grade(1 if correct else 0)
    return render_template('grade.html', form=form)