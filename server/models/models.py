from datetime import datetime, timedelta
import time
import re
import os
from pprint import pprint

from main import app

from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy.orm.exc import NoResultFound, MultipleResultsFound
from flask.ext.security import Security, SQLAlchemyUserDatastore, \
                               UserMixin, RoleMixin, login_required
from sqlalchemy import event, Integer, Date, ForeignKey, Column, Table,\
                       String, Boolean, DateTime, Text, ForeignKeyConstraint,\
                       cast

db = SQLAlchemy(app)
Model = db.Model
relationship = db.relationship
backref = db.backref

# Define models

UserRole  = db.Table('user_role',
        db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
        db.Column('role_id', db.Integer(), db.ForeignKey('role.id')))
                 
class User(Model, UserMixin):
    # General user properties
    __tablename__ = 'user'
    id = Column(Integer(), primary_key=True)
    password = Column(String(255), nullable=False, default='')
    first_name = Column(String(255))
    last_name = Column(String(255))
    email = Column(String(255), unique=True)
    gender = Column(String(255), default='Unspecified')
    picture = Column(String(255)) # A url
    major = Column(String(255))
    bio = Column(String(255), default="")
    
    # Temporal activity
    active = Column(Boolean())
    guest = Column(Boolean(), default=False)
    admin = Column(Boolean(), default=False)
    created_on = Column(DateTime(), default=datetime.utcnow)
    modified_on = Column(DateTime(), default=datetime.utcnow)
    
    # Foreign key relationships
    roles = db.relationship('Role', secondary=UserRole,
                            backref=backref('users', lazy='dynamic'))
    
    def __str__(self):
        return '<{} {}>'.format(self.role.title(),
                                self.email)
    def __repr__(self):
        return str(self)
        
    def name(self):
        return ' '.join((self.first_name, self.last_name))
        
    @staticmethod
    def get_guest(ip_address, book_id):
        try:
            guest = User.query.filter_by(email=ip_address).one()
        except NoResultFound:
            if book_id:
                course = Book.query.get(book_id).get_anonymous_course()
            else:
                course = Book.get_default().get_anonymous_course()
            guest = User(password='', major='',
                         first_name='', last_name='Guest', email=ip_address,
                         gender='', picture='', active=False, guest=True, 
                         course_id=course.id)
            db.session.add(guest)
            db.session.commit()
        return guest

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))
    
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore)