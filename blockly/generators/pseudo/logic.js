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
 * @fileoverview Generating Pseudo for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Pseudo.logic');

goog.require('Blockly.Pseudo');


Blockly.Pseudo['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.Pseudo.valueToCode(block, 'IF' + n,
      Blockly.Pseudo.ORDER_NONE) || '___';
  var branch = Blockly.Pseudo.statementToCode(block, 'DO' + n) ||
      Blockly.Pseudo.PASS;
  var code = 'if ' + argument + ':\n' + branch;
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.Pseudo.valueToCode(block, 'IF' + n,
        Blockly.Pseudo.ORDER_NONE) || '___';
    branch = Blockly.Pseudo.statementToCode(block, 'DO' + n) ||
        Blockly.Pseudo.PASS;
    code += 'otherwise if ' + argument + ':\n' + branch;
  }
  if (block.elseCount_) {
    branch = Blockly.Pseudo.statementToCode(block, 'ELSE') ||
        Blockly.Pseudo.PASS;
    code += 'otherwise:\n' + branch;
  }
  return code;
};

Blockly.Pseudo['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': ' is equal to ',
    'NEQ': ' is not equal to ',
    'LT': ' is less than ',
    'LTE': ' is less than or equal to ',
    'GT': ' is greater than ',
    'GTE': ' is greater than or equal to '
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Pseudo.ORDER_RELATIONAL;
  var argument0 = Blockly.Pseudo.valueToCode(block, 'A', order) || '___';
  var argument1 = Blockly.Pseudo.valueToCode(block, 'B', order) || '___';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Pseudo['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
  var order = (operator == 'and') ? Blockly.Pseudo.ORDER_LOGICAL_AND :
      Blockly.Pseudo.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Pseudo.valueToCode(block, 'A', order);
  var argument1 = Blockly.Pseudo.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = '___';
    argument1 = '___';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'and') ? '___' : '___';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Pseudo['logic_negate'] = function(block) {
  // Negation.
  var argument0 = Blockly.Pseudo.valueToCode(block, 'BOOL',
      Blockly.Pseudo.ORDER_LOGICAL_NOT) || '___';
  var code = 'not ' + argument0;
  return [code, Blockly.Pseudo.ORDER_LOGICAL_NOT];
};

Blockly.Pseudo['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'True' : 'False';
  return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['logic_null'] = function(block) {
  // Null data type.
  return ['None', Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Pseudo.valueToCode(block, 'IF',
      Blockly.Pseudo.ORDER_CONDITIONAL) || '___';
  var value_then = Blockly.Pseudo.valueToCode(block, 'THEN',
      Blockly.Pseudo.ORDER_CONDITIONAL) || '___';
  var value_else = Blockly.Pseudo.valueToCode(block, 'ELSE',
      Blockly.Pseudo.ORDER_CONDITIONAL) || '___';
  var code = value_then + ' if ' + value_if + ' else ' + value_else;
  return [code, Blockly.Pseudo.ORDER_CONDITIONAL];
};

Blockly.Pseudo['logic_isIn'] = function(block) {
  // Operations 'in', 'not in'.
  var operator = (block.getFieldValue('OP') == 'IN') ? 'in' : 'not in';
  var order = Blockly.Pseudo.ORDER_RELATIONAL;
  var argument0 = Blockly.Pseudo.valueToCode(block, 'ITEM', order) || '___';
  var argument1 = Blockly.Pseudo.valueToCode(block, 'LIST', order) || '___';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};