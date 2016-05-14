"""
Flask Configuration File

Checks for a "secrets.json" file and uses that to add in private settings such as Secret Key.
"""
import os
import json

try:
    with open('secrets.json', 'r') as secret_file:
        secrets = json.load(secret_file)
except IOError:
    print("No secrets file found. Using insecure defaults.")
    secrets = {}

class Config(object):
    DEBUG = False
    TESTING = False
    CSRF_ENABLED = True
    WTF_CSRF_ENABLED = True
    SITE_NAME = 'BlockPy'
    SYS_ADMINS = ['acbart@vt.edu']
    ROOT_DIRECTORY = os.path.dirname(os.path.abspath(__file__))
    STATIC_DIRECTORY = os.path.join(ROOT_DIRECTORY, 'static')
    BLOCKLY_LOG_DIR = os.path.join(ROOT_DIRECTORY, 'logs')
    
    # secret key for flask authentication
    SECRET_KEY = secrets.get('FLASK_SECRET_KEY', 'flask-secret-key')
    
    PYLTI_CONFIG = {
        "consumers": {
            secrets.get("CONSUMER_KEY", "__consumer_key__"): {
                "secret": secrets.get("CONSUMER_KEY_SECRET", "__lti_secret__"),
                "cert": secrets.get("CONSUMER_KEY_PEM_FILE", "consumer_key.pem")
            }
        }
    }
    
    #configured for GMAIL
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = 'vt.blockpy@gmail.com'
    MAIL_PASSWORD = secrets.get("EMAIL_PASSWORD")
    DEFAULT_MAIL_SENDER = 'BlockPy Admin'
    
    SECURITY_CONFIRMABLE = True
    SECURITY_REGISTERABLE = True
    SECURITY_RECOVERABLE = True
    SECURITY_CHANGEABLE = True
    SECURITY_PASSWORD_HASH='bcrypt'
    SECURITY_PASSWORD_SALT=secrets.get('SECURITY_PASSWORD_SALT')
    SECURITY_DEFAULT_REMEMBER_ME = True

    
class ProductionConfig(Config):
    DEBUG = False
    PORT = 5000
    #SITE_ROOT_URL = 'think.cs.vt.edu/blockpy'
    SQLALCHEMY_DATABASE_URI = 'mysql://compthink:runestone@127.0.0.1/blockpy'
    
class TestingConfig(Config):
    DEBUG = True
    PORT = 5001
    HOST = 'localhost'
    SITE_ROOT_URL = 'localhost:5001'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
