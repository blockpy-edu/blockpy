# Import built-ins
import os, sys
import json
from subprocess import call
import csv
import io

# Import Flask
from flask.ext.admin import Admin, BaseView, expose, form
from flask.ext.admin.contrib.sqla import ModelView
from flask import g, Blueprint, request, url_for, render_template, Response
from jinja2 import Markup

# Import runestone
from main import app
from controllers.helpers import admin_required
from models.models import (User, db, Course, Submission, Assignment, Settings)

admin = Admin(app)

class RegularView(ModelView):
    def is_accessible(self):
        if g.user:
            return g.user.is_admin()
        return False
        
class UserView(RegularView):
    def _list_roles(view, context, model, name):
        return 'some roles'
    def _list_thumbnail(view, context, model, name):
        if model.picture.startswith('http'):
            return Markup('<img style="width:50px" src="{}">'.format(model.picture))
        else:
            return Markup('<img src="{}">'.format(url_for('static', filename='anon.jpg')))
    column_formatters = { 'picture': _list_thumbnail, 'roles': _list_roles }
    form_excluded_columns = ('password',)
    column_exclude_list = ('password',)
    column_display_pk = True

class ModelIdView(RegularView):
    column_display_pk = True
    
def _id(table):
    def _edit_id(view, context, model, name):
        return table.query.filter(table.id == getattr(model, name)).first()
    return _edit_idW
'''class ScheduleView(RegularView):
    column_display_pk = False
    column_searchable_list = ('title', 'calendar')
    column_formatters = { 'course_id': _id(Course)}
    column_default_sort = 'day'
class SubmissionView(RegularView):
    column_formatters = { 'student_id': _id(User),
                          'course_id': _id(Course)}
class FeedbackView(RegularView):
    column_formatters = { 'student_id': _id(User),
                          'course_id': _id(Course),
                          'last_editor': _id(User)}
                          '''
admin.add_view(UserView(User, db.session, category='Tables'))
admin.add_view(RegularView(Course, db.session, category='Tables'))
admin.add_view(RegularView(Submission, db.session, category='Tables'))
admin.add_view(RegularView(Assignment, db.session, category='Tables'))
admin.add_view(RegularView(Settings, db.session, category='Tables'))

@app.route('/admin/shutdown', methods=['GET', 'POST'])
@admin_required
def shutdown():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    return 'Server shutting down...'