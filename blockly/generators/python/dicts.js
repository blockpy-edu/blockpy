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
 * @fileoverview Generating Python for dictionary blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Python.dicts');

goog.require('Blockly.Python');

Blockly.Python['dict_get'] = function(block) {
  var dict = Blockly.Python.valueToCode(block, 'DICT',
      Blockly.Python.ORDER_MEMBER) || '{}';
  var value = Blockly.Python.valueToCode(block, 'ITEM',
      Blockly.Python.ORDER_NONE) || 'None';
  var code = dict + '[' + value + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
};



Blockly.Python['dicts_create_with'] = function(block) {
  var value_keys = Blockly.Python.valueToCode(block, 'keys', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = new Array(block.itemCount_);
  
  for (var n = 0; n < block.itemCount_; n++) {
    var key = Blockly.Python.valueToCode(block, 'KEY' + n,
        Blockly.Python.ORDER_NONE) || 'None';
    var value = Blockly.Python.valueToCode(block, 'VALUE' + n,
        Blockly.Python.ORDER_NONE) || 'None';
    code[n] = key +": "+ value;
  }
  code = '{' + code.join(',\n\t') + '}';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['dict_keys'] = function(block) {
  var dict = Blockly.Python.valueToCode(block, 'DICT',
      Blockly.Python.ORDER_MEMBER) || '{}';
  var code = dict + '.keys()';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

