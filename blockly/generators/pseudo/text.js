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
 * @fileoverview Generating Pseudo for text blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Pseudo.texts');

goog.require('Blockly.Pseudo');


Blockly.Pseudo['text'] = function(block) {
  // Text value.
  var code = Blockly.Pseudo.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Pseudo.ORDER_ATOMIC];
};

Blockly.Pseudo['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  //Should we allow joining by '-' or ',' or any other characters?
  var code;
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.Pseudo.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var argument0 = Blockly.Pseudo.valueToCode(block, 'ADD0',
        Blockly.Pseudo.ORDER_NONE) || '___';
    code = 'str(' + argument0 + ')';
    return [code, Blockly.Pseudo.ORDER_FUNCTION_CALL];
  } else if (block.itemCount_ == 2) {
    var argument0 = Blockly.Pseudo.valueToCode(block, 'ADD0',
        Blockly.Pseudo.ORDER_NONE) || '___';
    var argument1 = Blockly.Pseudo.valueToCode(block, 'ADD1',
        Blockly.Pseudo.ORDER_NONE) || '___';
    var code = 'str(' + argument0 + ') + str(' + argument1 + ')';
    return [code, Blockly.Pseudo.ORDER_UNARY_SIGN];
  } else {
    var code = [];
    for (var n = 0; n < block.itemCount_; n++) {
      code[n] = Blockly.Pseudo.valueToCode(block, 'ADD' + n,
          Blockly.Pseudo.ORDER_NONE) || '___';
    }
    var tempVar = Blockly.Pseudo.variableDB_.getDistinctName('temp_value',
        Blockly.Variables.NAME_TYPE);
    code = '\'\'.join([str(' + tempVar + ') for ' + tempVar + ' in [' +
        code.join(', ') + ']])';
    return [code, Blockly.Pseudo.ORDER_FUNCTION_CALL];
  }
};

Blockly.Pseudo['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Pseudo.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Pseudo.valueToCode(block, 'TEXT',
      Blockly.Pseudo.ORDER_NONE) || '___';
  return varName + ' = str(' + varName + ') + str(' + argument0 + ')\n';
};

Blockly.Pseudo['text_length'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.Pseudo.valueToCode(block, 'VALUE',
      Blockly.Pseudo.ORDER_NONE) || '___';
  return ['len(' + argument0 + ')', Blockly.Pseudo.ORDER_FUNCTION_CALL];
};

Blockly.Pseudo['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var argument0 = Blockly.Pseudo.valueToCode(block, 'VALUE',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var code = 'not len(' + argument0 + ')';
  return [code, Blockly.Pseudo.ORDER_LOGICAL_NOT];
};

Blockly.Pseudo['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  var operator = block.getFieldValue('END') == 'FIRST' ? 'find' : 'rfind';
  var argument0 = Blockly.Pseudo.valueToCode(block, 'FIND',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var argument1 = Blockly.Pseudo.valueToCode(block, 'VALUE',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  var code = argument1 + '.' + operator + '(' + argument0 + ') + 1';
  return [code, Blockly.Pseudo.ORDER_MEMBER];
};

Blockly.Pseudo['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Pseudo.valueToCode(block, 'AT',
      Blockly.Pseudo.ORDER_UNARY_SIGN) || '1';
  var text = Blockly.Pseudo.valueToCode(block, 'VALUE',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.Pseudo.ORDER_MEMBER];
    case 'LAST':
      var code = text + '[-1]';
      return [code, Blockly.Pseudo.ORDER_MEMBER];
    case 'FROM_START':
      // Blockly uses one-based indicies.
      if (Blockly.isNumber(at)) {
        // If the index is a naked number, decrement it right now.
        at = parseInt(at, 10) - 1;
      } else {
        // If the index is dynamic, decrement it in code.
        at = 'int(' + at + ' - 1)';
      }
      var code = text + '[' + at + ']';
      return [code, Blockly.Pseudo.ORDER_MEMBER];
    case 'FROM_END':
      var code = text + '[-' + at + ']';
      return [code, Blockly.Pseudo.ORDER_MEMBER];
    case 'RANDOM':
      Blockly.Pseudo.definitions_['import_random'] = 'import random';
      var functionName = Blockly.Pseudo.provideFunction_(
          'text_random_letter',
          ['def ' + Blockly.Pseudo.FUNCTION_NAME_PLACEHOLDER_ + '(text):',
           '  x = int(random.random() * len(text))',
           '  return text[x];']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.Pseudo.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.Pseudo['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.Pseudo.valueToCode(block, 'STRING',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Pseudo.valueToCode(block, 'AT1',
      Blockly.Pseudo.ORDER_ADDITIVE) || '1';
  var at2 = Blockly.Pseudo.valueToCode(block, 'AT2',
      Blockly.Pseudo.ORDER_ADDITIVE) || '1';
  if (where1 == 'FIRST' || (where1 == 'FROM_START' && at1 == '1')) {
    at1 = '';
  } else if (where1 == 'FROM_START') {
    // Blockly uses one-based indicies.
    if (Blockly.isNumber(at1)) {
      // If the index is a naked number, decrement it right now.
      at1 = parseInt(at1, 10) - 1;
    } else {
      // If the index is dynamic, decrement it in code.
      at1 = 'int(' + at1 + ' - 1)';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at1)) {
      at1 = -parseInt(at1, 10);
    } else {
      at1 = '-int(' + at1 + ')';
    }
  }
  if (where2 == 'LAST' || (where2 == 'FROM_END' && at2 == '1')) {
    at2 = '';
  } else if (where1 == 'FROM_START') {
    if (Blockly.isNumber(at2)) {
      at2 = parseInt(at2, 10);
    } else {
      at2 = 'int(' + at2 + ')';
    }
  } else if (where1 == 'FROM_END') {
    if (Blockly.isNumber(at2)) {
      // If the index is a naked number, increment it right now.
      at2 = 1 - parseInt(at2, 10);
      if (at2 == 0) {
        at2 = '';
      }
    } else {
      // If the index is dynamic, increment it in code.
      // Add special case for -0.
      Blockly.Pseudo.definitions_['import_sys'] = 'import sys';
      at2 = 'int(1 - ' + at2 + ') or sys.maxsize';
    }
  }
  var code = text + '[' + at1 + ' : ' + at2 + ']';
  return [code, Blockly.Pseudo.ORDER_MEMBER];
};

Blockly.Pseudo['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.upper()',
    'LOWERCASE': '.lower()',
    'TITLECASE': '.title()'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var argument0 = Blockly.Pseudo.valueToCode(block, 'TEXT',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  var code = argument0 + operator;
  return [code, Blockly.Pseudo.ORDER_MEMBER];
};

Blockly.Pseudo['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.lstrip()',
    'RIGHT': '.rstrip()',
    'BOTH': '.strip()'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var argument0 = Blockly.Pseudo.valueToCode(block, 'TEXT',
      Blockly.Pseudo.ORDER_MEMBER) || '___';
  var code = argument0 + operator;
  return [code, Blockly.Pseudo.ORDER_MEMBER];
};

Blockly.Pseudo['text_print'] = function(block) {
  // Print statement.
  var argument0 = Blockly.Pseudo.valueToCode(block, 'TEXT',
      Blockly.Pseudo.ORDER_NONE) || '___';
  return 'Print ' + argument0 + ' to the printer.\n';
};

Blockly.Pseudo['text_prompt_ext'] = function(block) {
  // Prompt function.
  var functionName = Blockly.Pseudo.provideFunction_(
      'text_prompt',
      ['def ' + Blockly.Pseudo.FUNCTION_NAME_PLACEHOLDER_ + '(msg):',
       '  try:',
       '    return raw_input(msg)',
       '  except NameError:',
       '    return input(msg)']);
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Pseudo.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Pseudo.valueToCode(block, 'TEXT',
        Blockly.Pseudo.ORDER_NONE) || '___';
  }
  var code = functionName + '(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'float(' + code + ')';
  }
  return [code, Blockly.Pseudo.ORDER_FUNCTION_CALL];
};

Blockly.Pseudo['text_print_multiple'] = function(block) {
  // Create a list with any number of elements of any type.
  var inner_prints = new Array(block.itemCount_);
  for (var n = 0; n < block.itemCount_; n++) {
    inner_prints[n] = Blockly.Pseudo.valueToCode(block, 'PRINT' + n,
        Blockly.Pseudo.ORDER_NONE) || '___';
  }
  var code;
  if (block.itemCount_ == 1) {
      code = 'Print ' + inner_prints.join(', ') + ' to the printer.\n';
  } else {
      code = 'Print ' + inner_prints.join(', ') + ' to the printer.\n';
  }
  return code;
};

Blockly.Pseudo['text_prompt'] = Blockly.Pseudo['text_prompt_ext'];
