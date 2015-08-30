from flask.ext.wtf import Form
from wtforms import IntegerField, BooleanField

from flask import Blueprint, send_from_directory
from flask import Flask, redirect, url_for, session, request, jsonify, g,\
                  make_response, Response, render_template
from werkzeug.utils import secure_filename
                  
from sqlalchemy import Date, cast, func, desc, or_

from main import app

services = Blueprint('services', __name__, url_prefix='/services')

from service_libraries import weather as weather_service

@services.route('/weather/<function>/<arguments>', methods=['GET'])
@services.route('/weather/<function>/<arguments>/', methods=['GET'])
def weather(function, arguments):
    weather_function = getattr(weather_service, function)
    weather_arguments = arguments.split("|||")
    return jsonify(data=weather_function(*weather_arguments))

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