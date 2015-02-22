/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Weather blocks for Blockly.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Blocks.weather');

goog.require('Blockly.Blocks');

var CITIES = [['Blacksburg, VA', 'BLACKSBURG'], 
              ['Seattle, WA', 'SEATTLE'],
              ['Miami, FL', 'MIAMI'],
              ['San Jose, CA', 'SANJOSE'],
              ['New York, NY', 'NEWYORK']]

Blockly.Blocks.weather.HUE = 70;

Blockly.Blocks['weather_temperature'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.weather.HUE);
    this.appendDummyInput()
        .appendField("get temperature in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "Number");
    this.setTooltip('Returns a single temperature (number)');
  }
};
        
        
Blockly.Blocks['weather_forecasts'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.weather.HUE);
    this.appendDummyInput()
        .appendField("get forecasted temperatures in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a list of forecasted temperatures (list of number)');
  }
};

Blockly.Blocks['weather_report_forecasts'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.weather.HUE);
    this.appendDummyInput()
        .appendField("get forecasted weather in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "Array");
    this.setTooltip('Returns a list of forecasted weather reports (list of dicts)');
  }
};

Blockly.Blocks['weather_report'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.weather.HUE);
    this.appendDummyInput()
        .appendField("get weather in")
        .appendField(new Blockly.FieldDropdown(CITIES), 'CITY');
    this.setInputsInline(false);
    this.setOutput(true, "dict");
    this.setTooltip('Returns a weather report (dictionary)');
  }
};
