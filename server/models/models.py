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
    email = Column(String(255), unique=True)
    gender = Column(String(255), default='Unspecified')
    picture = Column(String(255), default='') # A url
    proof = Column(String(255))
    password = Column(String(255))
    active = Column(Boolean())
    confirmed_at = Column(DateTime())
    
    # Foreign key relationships
    settings = relationship("Settings", backref='user', lazy='dynamic')
    roles = relationship("Role", backref='user', lazy='dynamic')
    authentications = relationship("Authentication", backref='user', lazy='dynamic')
    assignments = relationship("Assignment",  backref='user', lazy='dynamic')
    def __str__(self):
        return '<{} {}>'.format(self.role.title(),
                                self.email)
        
    def name(self):
        return ' '.join((self.first_name, self.last_name))
        
    def is_admin(self):
        return 'admin' in {role.name.lower() for role in self.roles}
    
    def is_instructor(self):
        return 'instructor' in {role.name.lower() for role in self.roles}
        
class Course(Base):
    name = Column(String(255))
    owner_id = Column(Integer(), ForeignKey('user.id'))
    external_id = Column(String(255))
    
    def __str__(self):
        return '<Course {}>'.format(self.id)

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
    code = Column(Text())
    status = Column(Integer())
    correct = Column(Boolean())
    assignment_id = Column(Integer(), ForeignKey('assignment.id'))
    user_id = Column(Integer(), ForeignKey('user.id'))
    
    def __str__(self):
        return '<Submission {} for {}>'.format(self.id, self.user_id)
    
class Assignment(Base):
    url = Column(String(255))
    body = Column(Text())
    on_run = Column(Text())
    on_step = Column(Text())
    on_start = Column(Text())
    answer = Column(Text())
    due = Column(DateTime())
    type = Column(String(10))
    visibility = Column(String(10))
    disabled = Column(String(10))
    mode = Column(String(10))
    owner_id = Column(Integer(), ForeignKey('user.id'))
    course_id = Column(Integer(), ForeignKey('course.id'))
    
    def __str__(self):
        return '<Assignment {} for {}>'.format(self.id, self.user_id)
