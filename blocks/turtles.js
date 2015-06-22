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
 * @fileoverview Turtle blocks for Blockly.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Blocks.turtle');

goog.require('Blockly.Blocks');


Blockly.Blocks.turtle.HUE = 0;


Blockly.Blocks['turtle_start'] = {
  // Set element at index.
  init: function() {
    this.setColour(Blockly.Blocks.turtle.HUE);
    this.appendDummyInput()
        .appendField("Start turtle stuff");
    this.setInputsInline(false);
    this.setOutput(true);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
  }
};