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
 * @fileoverview Utility blocks for Blockly.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Blocks.utility');

goog.require('Blockly.Blocks');


Blockly.Blocks.utility.HUE = 210;

Blockly.Blocks['raw_block'] = {
  // Container.
  init: function() {
    this.setColour(260);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendTitle('raw code block:');
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldTextArea(''), 'TEXT');
  }
};

Blockly.Blocks['raw_expression'] = {
  // Container.
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendTitle('raw expression:');
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldTextArea(''), 'TEXT');
    this.setOutput(true);
  }
};

Blockly.Blocks['type_check'] = {
  // Set element at index.
  init: function() {
    this.setColour(130);
    this.appendValueInput('VALUE')
        .appendTitle(Blockly.Msg.TYPE_CHECK);
    this.setInputsInline(true);
    this.setOutput(true, 'Type');
    //this.setPreviousStatement(true);
    //this.setNextStatement(true);
  }
};

