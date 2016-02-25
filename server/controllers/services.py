import logging

from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from main import app
from helpers import crossdomain
from interaction_logger import StructuredEvent

services = Blueprint('services', __name__, url_prefix='/services')

from service_libraries import weather as weather_service

@services.route('/weather/', methods=['GET', "POST"])
@services.route('/weather', methods=['GET', 'POST'])
def weather():
    function = request.args.get("function", "get_temperature")
    city = request.args.get("city", "Blacksburg, VA")
    weather_function = getattr(weather_service, function)
    return jsonify(data=weather_function(city))

@services.route('/sheets', methods=['GET'])
def sheets(sheet_url):
    sheet_id = ''
    if sheet_url.startswith('http'):
        sheet_url.split('/')
    elif sheet_url.startswith('docs'):
        sheet_url.split('/')
    elif sheet_url.startswith('docs'):
        sheet_url.split('/')
    # sample:
    # https://docs.google.com/spreadsheets/d/1eLbX_5EFvZYc7JOGYF8ATdu5uQeu6OvILNnr4vH3vFI/pubhtml
    # =>
    # https://spreadsheets.google.com/feeds/list/___/od6/public/basic?alt=json
    # https://spreadsheets.google.com/feeds/list/1eLbX_5EFvZYc7JOGYF8ATdu5uQeu6OvILNnr4vH3vFI/od6/public/basic?alt=json
    
@services.route('/log/', methods=['GET', 'POST', 'OPTIONS'])
@services.route('/log', methods=['GET', 'POST', 'OPTIONS'])
#@crossdomain(origin='*')
def log_event():
    user_id = request.form.get('user_id', "")
    question_id = request.form.get('question_id', "")
    event = request.form.get('event', "")
    action = request.form.get('action', "")
    body = request.form.get('body', "")
    external_interactions_logger = logging.getLogger('ExternalInteractions')
    external_interactions_logger.info(
        StructuredEvent(user_id, question_id, event, action, body)
    )
    response = make_response('success') 
    response.headers['Access-Control-Allow-Origin'] = "*"
    return response
