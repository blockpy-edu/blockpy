from datetime import datetime, timedelta
import time
import re
import os
from pprint import pprint

from main import app

from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
from flask.ext.security import UserMixin, RoleMixin, login_required
from sqlalchemy import event, Integer, Date, ForeignKey, Column, Table,\
                       String, Boolean, DateTime, Text, ForeignKeyConstraint,\
                       cast, func
from sqlalchemy.ext.declarative import declared_attr

db = SQLAlchemy(app)
Model = db.Model
relationship = db.relationship
backref = db.backref

class Base(Model):
    __abstract__  = True
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
    def __repr__(self):
        return str(self)

    id =  Column(Integer(), primary_key=True)
    date_created  = Column(DateTime, default=func.current_timestamp())
    date_modified = Column(DateTime, default=func.current_timestamp(),
                                     onupdate=func.current_timestamp())

                 
class User(Base, UserMixin):
    # General user properties
    id = Column(Integer(), primary_key=True)
    first_name = Column(String(255))
    last_name = Column(String(255))
    email = Column(String(255))
    gender = Column(String(255), default='Unspecified')
    picture = Column(String(255), default='') # A url
    proof = Column(String(255), default=None)
    password = Column(String(255))
    active = Column(Boolean())
    confirmed_at = Column(DateTime())
    
    # Foreign key relationships
    settings = relationship("Settings", backref='user', lazy='dynamic')
    roles = relationship("Role", backref='user', lazy='dynamic')
    authentications = relationship("Authentication", backref='user', lazy='dynamic')
    assignments = relationship("Assignment",  backref='user', lazy='dynamic')
    def __str__(self):
        return '<User {} ({})>'.format(self.id, self.email)
        
    def name(self):
        return ' '.join((self.first_name, self.last_name))
        
    def is_admin(self):
        return 'admin' in {role.name.lower() for role in self.roles}
    
    def is_instructor(self):
        return 'instructor' in {role.name.lower() for role in self.roles}
        
    @staticmethod
    def is_lti_instructor(given_roles):
        ROLES = ["urn:lti:role:ims/lis/TeachingAssistant",
                 "Instructor", "ContentDeveloper",
                 "urn:lti:role:ims/lis/Instructor",
                 "urn:lti:role:ims/lis/ContentDeveloper"]
        return any(role for role in ROLES if role in given_roles)
        
    @staticmethod
    def new_lti_user(service, lti_user_id, lti_email):
        new_user = User(first_name=lti_user_id, last_name="Canvas User", email=lti_email, 
                        password="", active=False, confirmed_at=None)
        db.session.add(new_user)
        db.session.flush()
        new_authentication = Authentication(type=service, 
                                            value=lti_user_id,
                                            user_id=new_user.id)
        db.session.add(new_authentication)
        db.session.commit()
        return new_user
        
    @staticmethod
    def from_lti(service, lti_user_id, lti_email):
        """
        For a given service (e.g., "canvas"), and a user_id in the LTI system
        """
        lti = Authentication.query.filter_by(type=service, 
                                             value=lti_user_id).first()
        if lti is None:
            return User.new_lti_user(service, lti_user_id, lti_email)
        else:
            return lti.user
        
class Course(Base):
    name = Column(String(255))
    owner_id = Column(Integer(), ForeignKey('user.id'))
    service = Column(String(80), default="")
    external_id = Column(String(255), default="")
    
    def __str__(self):
        return '<Course {}>'.format(self.id)
        
    @staticmethod
    def new_lti_course(service, external_id, name, user_id):
        new_course = Course(name=name, owner_id=user_id,
                            service=service, external_id=external_id)
        db.session.add(new_course)
        db.session.commit()
        return new_course
        
    @staticmethod
    def from_lti(service, lti_context_id, name, user_id):
        lti_course = Course.query.filter_by(external_id=lti_context_id).first()
        if lti_course is None:
            return Course.new_lti_course(service=service, 
                                         external_id=lti_context_id,
                                         name=name,
                                         user_id=user_id)
        else:
            return lti_course
    
class Role(Base, RoleMixin):
    name = Column(String(80))
    user_id = Column(Integer(), ForeignKey('user.id'))
    course_id = Column(Integer(), ForeignKey('course.id'), default=None)
    
    NAMES = ['teacher', 'admin', 'student']
    
    def __str__(self):
        return '<{} is {}>'.format(self.name, self.user_id)
        
class Authentication(Base):
    type = Column(String(80))
    value = Column(String(255))
    user_id = Column(Integer(), ForeignKey('user.id'))
    
    TYPES = ['local', 'canvas']
    
    def __str__(self):
        return '<{} is {}>'.format(self.name, self.user_id)
        
class Settings(Base):
    mode = Column(String(80))
    connected = Column(String(80))
    user_id = Column(Integer(), ForeignKey('user.id'))
    
    def __str__(self):
        return '<{} settings ({})>'.format(self.user_id, self.id)
        
class Submission(Base):
    code = Column(Text(), default="")
    status = Column(Integer(), default=0)
    correct = Column(Boolean(), default=False)
    assignment_id = Column(Integer(), ForeignKey('assignment.id'))
    user_id = Column(Integer(), ForeignKey('user.id'))
    
    def __str__(self):
        return '<Submission {} for {}>'.format(self.id, self.user_id)
    
class Assignment(Base):
    url = Column(String(255), default="")
    name = Column(String(255), default="Untitled")
    body = Column(Text(), default="")
    on_run = Column(Text(), default="def on_run(code, output, properties):\n    pass")
    on_step = Column(Text(), default="def on_step(code, output, properties):\n    pass")
    on_start = Column(Text(), default="")
    answer = Column(Text(), default="")
    due = Column(DateTime(), default=None)
    type = Column(String(10), default="normal")
    visibility = Column(String(10), default="visible")
    disabled = Column(String(10), default="enabled")
    mode = Column(String(10), default="blocks")
    owner_id = Column(Integer(), ForeignKey('user.id'))
    course_id = Column(Integer(), ForeignKey('course.id'))
    
    def to_dict(self):
        return {
            'name': self.name,
            'id': self.id,
            'body': self.body,
            'title': self.title()
        }
    
    def __str__(self):
        return '<Assignment {} for {}>'.format(self.id, self.course_id)
        
    def title(self):
        return self.name if self.name != "Untitled" else "Untitled ({})".format(self.id)
    
    @staticmethod    
    def new(owner_id, course_id):
        assignment = Assignment(owner_id=owner_id, course_id=course_id)
        db.session.add(assignment)
        db.session.commit()
        return assignment
        
    @staticmethod
    def by_course(course_id):
        return Assignment.query.filter_by(course_id=course_id).all()
    
    @staticmethod
    def by_id(assignment_id):
        return Assignment.query.get(assignment_id)
    
    @staticmethod
    def by_id_or_new(assignment_id, owner_id, course_id):
        if assignment_id is None:
            assignment = None
        else:
            assignment = Assignment.query.get(assignment_id)
        if not assignment:
            assignment = Assignment.new(owner_id, course_id)
        return assignment
    
    def context_is_valid(self, context_id):
        course = Course.query.get(self.course_id)
        if course:
            return course.external_id == context_id
        return False
    
    def get_submission(self, user_id):
        submission = Submission.query.filter_by(assignment_id=self.id, user_id=user_id).first()
        if not submission:
            submission = Submission(assignment_id=self.id, user_id=user_id)
        return submission
