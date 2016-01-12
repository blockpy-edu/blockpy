import os, sys
import logging
from random import randint
import jinja2

from flask import Flask, render_template

VERSION = '0.1.0'
app = Flask(__name__)

# Debugging
LEVEL = logging.INFO
root = logging.getLogger()
root.setLevel(LEVEL)
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(LEVEL)
formatter = logging.Formatter('%(name)s[%(levelname)s] - %(message)s')
ch.setFormatter(formatter)
root.addHandler(ch)

# Modify Jinja2
app.jinja_env.filters['zip'] = zip

app.config.from_object('config.TestingConfig')

# Assets
from controllers.assets import assets

# Email
from flask.ext.mail import Mail
mail = Mail(app)

import controllers
