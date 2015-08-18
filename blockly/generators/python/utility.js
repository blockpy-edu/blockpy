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
 * @fileoverview Generating Python for utility blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Python.utility');

goog.require('Blockly.Python');

Blockly.Python['raw_block'] = function(block) {
  var code = block.getFieldValue('TEXT')+"\n";
  return code;
};

Blockly.Python['raw_expression'] = function(block) {
  var code = block.getFieldValue('TEXT');
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['raw_empty'] = function(block) {
  var code = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_MEMBER) || '';
  return code+"\n";
};

Blockly.Python['raw_table'] = function(block) {
  //var code = block.getFieldValue('TEXT')+"\n";
  return '';//code;
};

Blockly.Python['type_check'] = function(block) {
  var value = Blockly.Python.valueToCode(block, 'VALUE',
      Blockly.Python.ORDER_MEMBER) || '___';
  var code = 'type('+value + ')';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['function_call'] = function(block) {
  var name = block.getFieldValue('NAME');
  var hasReturn = block.hasReturn_;
  var args = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    args[n] = Blockly.Python.valueToCode(block, 'ARGUMENT' + n,
        Blockly.Python.ORDER_NONE) || '___';
  }
  var code = name+ '(' + args.join(', ') + ')';
  if (hasReturn) {
      return [code, Blockly.Python.ORDER_ATOMIC];
  } else {
      return code+'\n';
  }
};
