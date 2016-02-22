from datetime import datetime, timedelta
import time
import re
import os
import json
from pprint import pprint
import logging

from main import app
from interaction_logger import StructuredEvent

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

def ensure_dirs(path):
    try: 
        os.makedirs(path)
    except OSError, e:
        if not os.path.isdir(path):
            app.logger.warning(e.args + (path, ) )

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
    def new_lti_user(service, lti_user_id, lti_email, lti_first_name, lti_last_name):
        new_user = User(first_name=lti_first_name, last_name=lti_last_name, email=lti_email, 
                        password="", active=False, confirmed_at=None)
        db.session.add(new_user)
        db.session.flush()
        new_authentication = Authentication(type=service, 
                                            value=lti_user_id,
                                            user_id=new_user.id)
        db.session.add(new_authentication)
        db.session.commit()
        return new_user
        
    def register_authentication(self, service, lti_user_id):
        new_authentication = Authentication(type=service, 
                                            value=lti_user_id,
                                            user_id=self.id)
        db.session.add(new_authentication)
        db.session.commit()
        return self
        
    @staticmethod
    def from_lti(service, lti_user_id, lti_email, lti_first_name, lti_last_name):
        """
        For a given service (e.g., "canvas"), and a user_id in the LTI system
        """
        lti = Authentication.query.filter_by(type=service, 
                                             value=lti_user_id).first()
        if lti is None:
            user = User.query.filter_by(email=lti_email).first()
            if user:
                user.register_authentication(service, lti_user_id)
                return user
            else:
                return User.new_lti_user(service, lti_user_id, lti_email, lti_first_name, lti_last_name)
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
        return '<User {} is {}>'.format(self.user_id, self.name)
        
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
    assignment_version = Column(Integer(), default=0)
    version = Column(Integer(), default=0)
    
    def __str__(self):
        return '<Submission {} for {}>'.format(self.id, self.user_id)
        
    @staticmethod
    def load(user_id, assignment_id):
        submission = Submission.query.filter_by(assignment_id=assignment_id, 
                                                user_id=user_id).first()
        if not submission:
            submission = Submission(assignment_id=assignment_id, user_id=user_id)
            assignment = Assignment.by_id(assignment_id)
            submission.code = assignment.on_start
            db.session.add(submission)
            db.session.commit()
        return submission
        
    def save_explanation_code(self, code):
        submission_destructured = json.loads(self.code)
        if 'code' in submission_destructured:
            submission_destructured['code'] = code_submission
        else:
            submission_destructured = {
                'code': code_submission
            }
        submission.code = json.dumps(submission_destructured)
        submission.version += 1
        db.session.commit()
        return submission_destructured
        
    def load_explanation(self):
        return json.loads(self.code)
        
    @staticmethod
    def save_code(user_id, assignment_id, code, assignment_version):
        submission = Submission.query.filter_by(user_id=user_id, 
                                                assignment_id=assignment_id).first()
        is_version_correct = True
        if not submission:
            submission = Submission(assignment_id=assignment_id, 
                                    user_id=user_id,
                                    code=code,
                                    assignment_version=assignment_version)
            db.session.add(submission)
        else:
            submission.code = code
            submission.version += 1
            current_assignment_version = Assignment.by_id(submission.assignment_id).version
            is_version_correct = (assignment_version == current_assignment_version)
        db.session.commit()
        submission.log_code()
        return submission, is_version_correct
        
    @staticmethod
    def save_correct(user_id, assignment_id):
        submission = Submission.query.filter_by(user_id=user_id, 
                                                assignment_id=assignment_id).first()
        if not submission:
            submission = Submission(assignment_id=self.id, 
                                    user_id=user_id,
                                    correct=True)
            db.session.add(submission)
        else:
            submission.correct = True
        db.session.commit()
        return submission
        
    def log_code(self, extension='.py'):
        '''
        Store the code on disk, mapped to the Assignment ID and the Student ID
        '''
        # Multiple-file logging
        directory = os.path.join(app.config['BLOCKLY_LOG_DIR'],
                                 str(self.assignment_id), 
                                 str(self.user_id))

        ensure_dirs(directory)
        name = time.strftime("%Y%m%d-%H%M%S")
        file_name = os.path.join(directory, name + extension)
        with open(file_name, 'wb') as blockly_logfile:
            blockly_logfile.write(self.code)
        # Single file logging
        student_interactions_logger = logging.getLogger('StudentInteractions')
        student_interactions_logger.info(
            StructuredEvent(self.user_id, self.assignment_id, 'code', 'set', self.code)
        )

    
class Assignment(Base):
    url = Column(String(255), default="")
    name = Column(String(255), default="Untitled")
    body = Column(Text(), default="")
    on_run = Column(Text(), default="def on_run(code, output, properties):\n    return True")
    on_step = Column(Text(), default="def on_step(code, output, properties):\n    return True")
    on_start = Column(Text(), default="")
    answer = Column(Text(), default="")
    due = Column(DateTime(), default=None)
    type = Column(String(10), default="normal")
    visibility = Column(String(10), default="visible")
    disabled = Column(String(10), default="enabled")
    mode = Column(String(10), default="blocks")
    owner_id = Column(Integer(), ForeignKey('user.id'))
    course_id = Column(Integer(), ForeignKey('course.id'))
    version = Column(Integer(), default=0)
    
    @staticmethod
    def edit(assignment_id, presentation=None, name=None, on_run=None, on_step=None, on_start=None, parsons=None):
        assignment = Assignment.by_id(assignment_id)
        if name is not None:
            assignment.name = name
            assignment.version += 1
        if presentation is not None:
            assignment.body = presentation
            assignment.version += 1
        if on_run is not None:
            assignment.on_run = on_run
            assignment.version += 1
        if on_step is not None:
            assignment.on_step = on_step
            assignment.version += 1
        if on_start is not None:
            assignment.on_start = on_start
            assignment.version += 1
        if parsons is not None:
            assignment.type = 'parsons' if parsons else 'normal'
            assignment.version += 1
        db.session.commit()
        return assignment
    
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
    def remove(assignment_id):
        Assignment.query.filter_by(id=assignment_id).delete()
        db.session.commit()
        
    @staticmethod
    def by_course(course_id, exclude_builtins=True):
        if exclude_builtins:
            return (Assignment.query.filter_by(course_id=course_id)
                                    .filter(Assignment.mode != 'maze')
                                    .all())
        else:
            return Assignment.query.filter_by(course_id=course_id).all()
    
    @staticmethod
    def by_id(assignment_id):
        return Assignment.query.get(assignment_id)
    
    @staticmethod    
    def by_builtin(type, id, owner_id, course_id):
        assignment = Assignment.query.filter_by(course_id=course_id,
                                                mode=type,
                                                name=id).first()
        if not assignment:
            assignment = Assignment.new(owner_id, course_id)
            assignment.mode = type
            assignment.name = id
            db.session.commit()
        return assignment
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
        return Submission.load(user_id, self.id)
        
class AssignmentGroup(Base):
    name = Column(String(255), default="Untitled")
    owner_id = Column(Integer(), ForeignKey('user.id'))
    course_id = Column(Integer(), ForeignKey('course.id'))
    
    @staticmethod    
    def new(owner_id, course_id):
        assignment_group = AssignmentGroup(owner_id=owner_id, course_id=course_id)
        db.session.add(assignment_group)
        db.session.commit()
        return assignment_group
        
    @staticmethod    
    def remove(assignment_group_id):
        AssignmentGroup.query.filter_by(id=assignment_group_id).delete()
        AssignmentGroupMembership.query.filter_by(assignment_group_id=assignment_group_id).delete()
        db.session.commit()
        
    @staticmethod
    def edit(assignment_group_id, name=None):
        assignment_group = AssignmentGroup.by_id(assignment_group_id)
        if name is not None:
            assignment_group.name = name
        db.session.commit()
        return assignment_group
    
    @staticmethod
    def by_id(assignment_group_id):
        return AssignmentGroup.query.get(assignment_group_id)
        
    @staticmethod
    def by_course(course_id):
        return (AssignmentGroup.query.filter_by(course_id=course_id)
                                     .order_by(AssignmentGroup.name)
                                     .all())
    
    @staticmethod
    def get_ungrouped_assignments(course_id):
        return (Assignment.query
                          .filter_by(course_id=course_id)
                          .outerjoin(AssignmentGroupMembership)
                          .filter(AssignmentGroupMembership.assignment_id==None)
                          .all())
    
    def get_assignments(self):
        return (Assignment.query
                          .join(AssignmentGroupMembership, 
                                AssignmentGroupMembership.assignment_id == Assignment.id)
                          .filter(AssignmentGroupMembership.assignment_group_id==self.id)
                          .order_by(AssignmentGroupMembership.position)
                          .all())
        
class AssignmentGroupMembership(Base):
    assignment_group_id = Column(Integer(), ForeignKey('assignmentgroup.id'))
    assignment_id = Column(Integer(), ForeignKey('assignment.id'))
    position = Column(Integer())
    
    @staticmethod
    def move_assignment(assignment_id, new_group_id):
        membership = (AssignmentGroupMembership.query
                                               .filter_by(assignment_id=assignment_id)
                                               .first())
        if membership is None:
            membership = AssignmentGroupMembership(assignment_group_id = new_group_id,
                                                   assignment_id=assignment_id,
                                                   position=0)
            db.session.add(membership)
        else:
            membership.assignment_group_id = new_group_id
        db.session.commit()
        return membership

class Log(Base):
    event = Column(String(255), default="")
    action = Column(String(255), default="")
    assignment_id = Column(Integer(), ForeignKey('assignment.id'))
    user_id = Column(Integer(), ForeignKey('user.id'))
    
    @staticmethod    
    def new(event, action, assignment_id, user_id):
        # Database logging
        log = Log(event=event, action=action, assignment_id=assignment_id, user_id=user_id)
        db.session.add(log)
        db.session.commit()
        # Single-file logging
        student_interactions_logger = logging.getLogger('StudentInteractions')
        student_interactions_logger.info(
            StructuredEvent(user_id, assignment_id, event, action, '')
        )
        return log
    
    def __str__(self):
        return '<Log {} for {}>'.format(self.event, self.action)
