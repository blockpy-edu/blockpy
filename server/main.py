import os, sys
import logging
from random import randint

from flask import Flask, render_template

from pylti.flask import lti

VERSION = '0.1.0'
app = Flask(__name__)
app.config.from_object('config')

# Debugging
root = logging.getLogger()
root.setLevel(logging.DEBUG)
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(name)s - %(message)s')
ch.setFormatter(formatter)
root.addHandler(ch)
    
# Local HTTPS support
from OpenSSL import SSL
context = SSL.Context(SSL.SSLv23_METHOD)
context.use_privatekey_file('certs/foobar.key')
context.use_certificate_file('certs/foobar.crt')

if __name__ == '__main__':
    """
    For if you want to run the flask development server
    directly
    """
    port = int(os.environ.get("FLASK_LTI_PORT", 5000))
    host = os.environ.get("FLASK_LTI_HOST", "localhost")
    app.run(debug=True, host=host, port=port, ssl_context=context)

import controllers