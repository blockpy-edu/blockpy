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
 * @fileoverview Generating Python for weather blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Python.weather');

goog.require('Blockly.Python');

Blockly.Python['weather_forecasts'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_forecasts(';
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

Blockly.Python['weather_temperature'] = function(block) {
    Blockly.Python.definitions_['import_weather'] = 'import weather';
    var code = 'weather.get_temperature(';
    var argument0 = Blockly.Python.quote_(block.getFieldValue('CITY'));
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

