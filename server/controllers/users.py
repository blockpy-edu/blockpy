'''

Handles all user management

'''

from flask import (Blueprint, Flask, redirect, url_for, session, request, 
                   jsonify, g, make_response, Response, render_template)
                  
from sqlalchemy import Date, cast, func, desc, or_

from main import app

users = Blueprint('users', __name__, url_prefix='/users')
