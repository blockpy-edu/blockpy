/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Python for CORGIS big data blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Python.corgis');

goog.require('Blockly.Python');


/*
 * Weather Data
 */
 
Blockly.Python['weather_temperature'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_temperature(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('CITY'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.Python['weather_forecasts'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_forecasts(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('CITY'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.Python['weather_highs_lows'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_highs_lows(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('CITY'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['weather_report'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_report(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('CITY'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['weather_report_forecasts'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_forecasted_reports(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('CITY'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['weather_all_forecasts'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_all_forecasted_temperatures()'
    return [code, Blockly.Python.ORDER_ATOMIC];
};

/*
 * Stocks Data
 */
Blockly.Python['stocks_current'] = function(block) {
    Blockly.Python.definitions_['import_stocks'] = 'import stocks';
    var code = 'stocks.get_current(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('TICKER'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.Python['stocks_past'] = function(block) {
    Blockly.Python.definitions_['import_stocks'] = 'import stocks';
    var code = 'stocks.get_past(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('TICKER'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

/*
 * Earthquake Data
 */
Blockly.Python['earthquake_get'] = function(block) {
    Blockly.Python.definitions_['import_earthquakes'] = 'import earthquakes';
    var code = 'earthquakes.get(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('PROPERTY'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.Python['earthquake_both'] = function(block) {
    Blockly.Python.definitions_['import_earthquakes'] = 'import earthquakes';
    var code = 'earthquakes.get_both()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.Python['earthquake_all'] = function(block) {
    Blockly.Python.definitions_['import_earthquakes'] = 'import earthquakes';
    var code = 'earthquakes.get_all()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

/*
 * Crime Data
 */
Blockly.Python['crime_state'] = function(block) {
    Blockly.Python.definitions_['import_crime'] = 'import crime';
    var code = 'crime.get_' + block.getFieldValue('TYPE') + '_crimes(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('STATE'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['crime_year'] = function(block) {
    Blockly.Python.definitions_['import_crime'] = 'import crime';
    var code = 'crime.get_by_year(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('YEAR'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['crime_all'] = function(block) {
    Blockly.Python.definitions_['import_crime'] = 'import crime';
    var code = 'crime.get_all()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

/*
 * Book Data
 */
Blockly.Python['books_get'] = function(block) {
    Blockly.Python.definitions_['import_books'] = 'import books';
    var code = 'books.get_all()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};