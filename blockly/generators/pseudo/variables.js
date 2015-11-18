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
 * @fileoverview Generating Pseudo for variable blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Pseudo.variables');

goog.require('Blockly.Pseudo');


Blockly.Pseudo['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.Pseudo.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return ['the property <u>'+code+'</u>', Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.Pseudo.valueToCode(block, 'VALUE',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var varName = Blockly.Pseudo.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return 'Set the property <u>'+varName + '</u> to ' + argument0 + '.\n';
};
