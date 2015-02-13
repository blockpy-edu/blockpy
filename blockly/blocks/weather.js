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


Blockly.Blocks.weather.HUE = 210;

Blockly.Blocks['get_temperature'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get temperature for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};
        
        
Blockly.Blocks['get_forecasts'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get forecasts for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setTooltip('');
  }
};

Blockly.Blocks['get_forecasted_reports'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get forecasted reports for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setTooltip('');
  }
};

Blockly.Blocks['get_report'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get report for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "dict");
    this.setTooltip('');
  }
};