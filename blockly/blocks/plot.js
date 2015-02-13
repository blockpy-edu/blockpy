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
 * @fileoverview Plotting blocks for Blockly.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Blocks.plot');

goog.require('Blockly.Blocks');


Blockly.Blocks.plot.HUE = 210;

Blockly.Blocks['plot_show'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendDummyInput()
        .appendTitle("show plot canvas");
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setOutput(false);
    this.setTooltip('Makes the canvas appear');
  }
};

Blockly.Blocks['plot_scatter'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput("x_values")
        .appendTitle("plot scatter ")
        .setCheck('Array');
    this.appendValueInput("y_values")
        .appendTitle("vs. ")
        .setCheck('Array');
    this.setInputsInline(false);
    this.setOutput(false);
    this.setTooltip('Plots onto the canvas');
  }
};

Blockly.Blocks['plot_title'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput('title')
        .setCheck('String')
        .appendTitle("make plot's title");
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setOutput(false);
    this.setTooltip('Sets the plot\'s title');
  }
};

Blockly.Blocks['plot_line'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput("y_values")
        .appendField("plot line ")
        .setCheck('Array');
    this.setInputsInline(false);
    this.setOutput(false);
    this.setTooltip('Plots onto the canvas');
  }
};