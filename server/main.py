import os, sys
import logging
from random import randint

from flask import Flask, render_template

VERSION = '0.1.0'
app = Flask(__name__)

# Debugging
root = logging.getLogger()
root.setLevel(logging.INFO)
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(name)s[%(levelname)s] - %(message)s')
ch.setFormatter(formatter)
root.addHandler(ch)

app.config.from_object('config.TestingConfig')

# Email
from flask.ext.mail import Mail
mail = Mail(app)

import controllers
