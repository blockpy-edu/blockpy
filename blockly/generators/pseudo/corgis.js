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
 * @fileoverview Generating Pseudo for CORGIS big data blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Pseudo.corgis');

goog.require('Blockly.Pseudo');


/*
 * Weather Data
 */
 
Blockly.Pseudo['weather_temperature'] = function(block) {
    Blockly.Pseudo.definitions_['import_weather'] = 'Import the weather module (which provides access to US weather reports).';
    var code = 'the current temperature for ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('CITY'));
    code += argument0;
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};
Blockly.Pseudo['weather_forecasts'] = function(block) {
    Blockly.Pseudo.definitions_['import_weather'] = 'Import the weather module (which provides access to US weather reports).';
    var code = 'the expected temperatures for ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('CITY'));
    code += argument0 + '';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};
Blockly.Pseudo['weather_highs_lows'] = function(block) {
    Blockly.Pseudo.definitions_['import_weather'] = 'Import the weather module (which provides access to US weather reports).';
    var code = 'the highs and lows for ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('CITY'));
    code += argument0 + '';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['weather_report'] = function(block) {
    Blockly.Pseudo.definitions_['import_weather'] = 'Import the weather module (which provides access to US weather reports).';
    var code = 'the complete weather report for ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('CITY'));
    code += argument0 + '';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['weather_report_forecasts'] = function(block) {
    Blockly.Pseudo.definitions_['import_weather'] = 'Import the weather module (which provides access to US weather reports).';
    var code = 'the complete weather forecast for ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('CITY'));
    code += argument0 + '';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['weather_all_forecasts'] = function(block) {
    Blockly.Pseudo.definitions_['import_weather'] = 'Import the weather module (which provides access to US weather reports).';
    var code = 'all of the forecasted weather reports'
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

/*
 * Stocks Data
 */
Blockly.Pseudo['stocks_current'] = function(block) {
    Blockly.Pseudo.definitions_['import_stocks'] = 'Import the stock module (which provides access to stock changes)';
    var code = 'the current change in stock for ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('TICKER'));
    code += argument0;
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};
Blockly.Pseudo['stocks_past'] = function(block) {
    Blockly.Pseudo.definitions_['import_stocks'] = 'Import the stock module (which provides access to stock changes)';
    var code = 'the past change in stocks for ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('TICKER'));
    code += argument0;
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

/*
 * Earthquake Data
 */
Blockly.Pseudo['earthquake_get'] = function(block) {
    Blockly.Pseudo.definitions_['import_earthquakes'] = 'Import the earthquake module (which provides access to recent earthquakes)';
    var code = 'the ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('PROPERTY'));
    code += argument0 + ' of recent earthquakes';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};
Blockly.Pseudo['earthquake_both'] = function(block) {
    Blockly.Pseudo.definitions_['import_earthquakes'] = 'Import the earthquake module (which provides access to recent earthquakes)';
    var code = 'both the magnitude and depth of recent earthquakes';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};
Blockly.Pseudo['earthquake_all'] = function(block) {
    Blockly.Pseudo.definitions_['import_earthquakes'] = 'Import the earthquake module (which provides access to recent earthquakes)';
    var code = 'all of the recent earthquakes';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

/*
 * Crime Data
 */
Blockly.Pseudo['crime_state'] = function(block) {
    Blockly.Pseudo.definitions_['import_crime'] = 'Import the crime module (which provides access to historical crime records in the US)';
    var code = 'the ' + block.getFieldValue('TYPE') + ' property crimes of ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('STATE'));
    code += argument0;
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['crime_year'] = function(block) {
    Blockly.Pseudo.definitions_['import_crime'] = 'Import the crime module (which provides access to historical crime records in the US)';
    var code = 'the crime reports in ';
    var argument0 = Blockly.Pseudo.quote_(block.getFieldValue('YEAR'));
    code += argument0;
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['crime_all'] = function(block) {
    Blockly.Pseudo.definitions_['import_crime'] = 'Import the crime module (which provides access to historical crime records in the US)';
    var code = 'all of the crime reports';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

/*
 * Book Data
 */
Blockly.Pseudo['books_get'] = function(block) {
    Blockly.Pseudo.definitions_['import_books'] = 'Import the books module (which provides access to a few example books)';
    var code = 'all of the books';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};