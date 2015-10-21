from models.models import db, User, Role
from main import app

from flask.ext.security import SQLAlchemyUserDatastore, Security
from flask_security.forms import ConfirmRegisterForm

from wtforms import BooleanField, TextField, validators

class ExtendedConfirmRegisterForm(ConfirmRegisterForm):
    first_name = TextField('First Name', [validators.Required()])
    last_name = TextField('Last Name', [validators.Required()])
    proof = TextField('Instructor Proof (e.g., your university website)')
    
# User registration, etc.
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(app, user_datastore, confirm_register_form=ExtendedConfirmRegisterForm)