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
 * @fileoverview Generating Pseudo for dictionary blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Pseudo.dicts');

goog.require('Blockly.Pseudo');

Blockly.Pseudo['dict_get'] = function(block) {
  var dict = Blockly.Pseudo.valueToCode(block, 'DICT',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  var value = Blockly.Pseudo.valueToCode(block, 'ITEM',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var code = " the value of the key " + value + " of " +dict;
  return [code, Blockly.Pseudo.ORDER_ATOMIC];
};


Blockly.Pseudo['dict_get_literal'] = function(block) {
  var dict = Blockly.Pseudo.valueToCode(block, 'DICT',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  var value = Blockly.Pseudo.quote_(block.getFieldValue('ITEM'));
  var code = " the value of the key " + value + " of " +dict;
  return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['dicts_create_with'] = function(block) {
    var value_keys = Blockly.Pseudo.valueToCode(block, 'keys', Blockly.   Pseudo.ORDER_ATOMIC);
    // TODO: Assemble Pseudo into code variable.
    var code = new Array(block.itemCount_);
  
    for (var n = 0; n < block.itemCount_; n++) {
        var key = Blockly.Pseudo.quote_(block.getFieldValue('KEY' + n));
        var value = Blockly.Pseudo.valueToCode(block, 'VALUE' + n,
                Blockly.Pseudo.ORDER_NONE) || '___';
        code[n] = key +": "+ value;
    }
    code = '{' + code.join(', ') + '}';
    return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['dict_keys'] = function(block) {
  var dict = Blockly.Pseudo.valueToCode(block, 'DICT',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  var code = dict + '.keys()';
  return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

