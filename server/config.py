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

    
class ProductionConfig(Config):
    DEBUG = False
    PORT = 5000
    #SITE_ROOT_URL = 'think.cs.vt.edu/blockpy'
    SQLALCHEMY_DATABASE_URI = 'mysql://compthink:runestone@127.0.0.1/blockpy'
    
class TestingConfig(Config):
    TESTING = True
    PORT = 5001
    HOST = 'localhost'
    SITE_ROOT_URL = 'localhost:5001'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///test.db'
