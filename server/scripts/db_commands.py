from flask.ext.script import Command, Option
from models.models import db
from main import app
import datetime
import random

class ResetDB(Command):
    """Drops all tables and recreates them"""
    def run(self, **kwargs):
        db.drop_all()
        db.create_all()
        
class PopulateDB(Command):
    option_list = (
        Option('--file', '-f', dest='user_data_file', default='scripts/user_data.csv'),
    )
    
    """Fills in predefined data into DB"""
    def run(self, user_data_file, **kwargs):
        from models.models import Role, User
        
        admin = User(first_name='Cory', last_name='Bart', 
                     email='acbart@vt.edu', gender='Male')
        db.session.add(admin)
        db.session.flush()
        db.session.add(Role(name='teacher', user_id=admin.id))
        db.session.add(Role(name='admin', user_id=admin.id))
        
        for student in ('Dan Tilden', 'Anamary Leal', 'Ellie Cayford'):
            first, last = student.split()
            email = '{}{}@vt.edu'.format(first[0].lower(), last.lower())
            db.session.add(User(first_name=first, last_name=last, email=email))
        
        db.session.commit()
        

class DisplayDB(Command):
    def run(self, **kwargs):
        from sqlalchemy import MetaData
        from sqlalchemy_schemadisplay3 import create_schema_graph
        connection = app.config['SQLALCHEMY_DATABASE_URI']
        filename='dbschema.png'
        graph = create_schema_graph(metadata=MetaData(connection),
            show_datatypes=False, # The image would get nasty big if we'd show the datatypes
            show_indexes=False, # ditto for indexes
            rankdir='BT', # From left to right (instead of top to bottom)
            font='Helvetica',
            concentrate=False # Don't try to join the relation lines together
            )
        graph.write_png(filename) # write out the file
