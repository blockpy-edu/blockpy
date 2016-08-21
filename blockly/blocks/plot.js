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


Blockly.Blocks.plot.HUE = 170;

Blockly.Blocks['plot_show'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
    this.appendDummyInput()
        .appendField("show plot canvas");
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
    this.setColour(Blockly.Blocks.plot.HUE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput("x_values")
        .appendField("plot scatter ")
        .setCheck('Array');
    this.appendValueInput("y_values")
        .appendField("vs. ")
        .setCheck('Array');
    this.setInputsInline(false);
    this.setOutput(false);
    this.setTooltip('Plots onto the canvas');
  }
};

var OPEN_QUOTE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAA0UlEQVQY023QP0oDURSF8e8MImhlUIiCjWKhrUUK3YCIVkq6bMAF2LkCa8ENWLoNS1sLEQKprMQ/GBDks3kDM+Oc8nfPfTxuANQTYBeYAvdJLL4FnAFfwF2ST9Rz27kp5YH/kwrYp50LdaXHAU4rYNYzWAdeenx7AbgF5sAhcARsAkkyVQ+ACbAKjIGqta4+l78udXxc/LiJG+qvet0pV+q7+tHE+iJzdbGz8FhmOzVcqj/qq7rcKI7Ut1Leq70C1oCrJMMk343HB8ADMEzyVOMff72l48gwfqkAAAAASUVORK5CYII=';
var CLOSED_QUOTE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAYAAACALL/6AAAAvklEQVQY022PoapCQRRF97lBVDRYhBcEQcP1BwS/QLAqr7xitZn0HzRr8Rts+htmQdCqSbQIwmMZPMIw3lVmZu0zG44UAFSBLdBVBDAFZqFo8eYKtANfBC7AE5h8ZNOHd1FrDnh4VgmDO3ADkujDHPgHfkLZ84bfaLjg/hD6RFLq9z6wBDr+rvuZB1bAEDABY76pA2mGHyWSjvqmIemc4WsCLKOp4nssIj8wD8qS/iSVJK3N7OTeJPV9n72ZbV7iDuSc2BaQBQAAAABJRU5ErkJggg==';

Blockly.Blocks['plot_title'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
    this.appendDummyInput()
        .appendField("make plot's title")
        .appendField(this.newQuote_(true))
        .appendField(new Blockly.FieldTextInput('title'), 'TEXT')
        .appendField(this.newQuote_(false));
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setOutput(false);
    this.setTooltip('Sets the plot\'s title');
  },
  newQuote_: function(open) {
    if (open == this.RTL) {
      var file = OPEN_QUOTE;
    } else {
      var file = CLOSED_QUOTE;
    }
    return new Blockly.FieldImage(file, 12, 12, '"');
  }
};

Blockly.Blocks['plot_xlabel'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
    this.appendDummyInput()
        .appendField("make plot's x-axis label")
        .appendField(this.newQuote_(true))
        .appendField(new Blockly.FieldTextInput('title'), 'TEXT')
        .appendField(this.newQuote_(false));
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setOutput(false);
    this.setTooltip('Sets the plot\'s x-axis title (horizontal axis)');
  },
  newQuote_: function(open) {
    if (open == this.RTL) {
      var file = OPEN_QUOTE;
    } else {
      var file = CLOSED_QUOTE;
    }
    return new Blockly.FieldImage(file, 12, 12, '"');
  }
};

Blockly.Blocks['plot_ylabel'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
    this.appendDummyInput()
        .appendField("make plot's y-axis label")
        .appendField(this.newQuote_(true))
        .appendField(new Blockly.FieldTextInput('title'), 'TEXT')
        .appendField(this.newQuote_(false));
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setOutput(false);
    this.setTooltip('Sets the plot\'s y-axis title (vertical axis)');
  },
  newQuote_: function(open) {
    if (open == this.RTL) {
      var file = OPEN_QUOTE;
    } else {
      var file = CLOSED_QUOTE;
    }
    return new Blockly.FieldImage(file, 12, 12, '"');
  }
};

Blockly.Blocks['plot_line'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
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

Blockly.Blocks['plot_hist'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput("values")
        .appendField("plot histogram ")
        .setCheck('Array');
    this.setInputsInline(false);
    this.setOutput(false);
    this.setTooltip('Plots a histogram onto the canvas');
  }
};

Blockly.Blocks['plot_lineXY'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput("x_values")
        .appendField("plot Xs:")
        .setCheck('Array');
    this.appendValueInput("y_values")
        .appendField("vs. Ys:")
        .setCheck('Array');
    this.setInputsInline(false);
    this.setOutput(false);
    this.setTooltip('Plots onto the canvas');
  }
};