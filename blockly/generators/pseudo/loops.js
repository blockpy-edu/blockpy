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
 * @fileoverview Generating Pseudo for loop blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Pseudo.loops');

goog.require('Blockly.Pseudo');


Blockly.Pseudo['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(parseInt(block.getFieldValue('TIMES'), 10));
  } else {
    // External number.
    var repeats = Blockly.Pseudo.valueToCode(block, 'TIMES',
        Blockly.Pseudo.ORDER_NONE) || '___';
  }
  if (Blockly.isNumber(repeats)) {
    repeats = parseInt(repeats, 10);
  } else {
    repeats = 'int(' + repeats + ')';
  }
  var branch = Blockly.Pseudo.statementToCode(block, 'DO');
  branch = Blockly.Pseudo.addLoopTrap(branch, block.id) ||
      Blockly.Pseudo.PASS;
  var loopVar = Blockly.Pseudo.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for ' + loopVar + ' in range(' + repeats + '):\n' + branch;
  return code;
};

Blockly.Pseudo['controls_repeat'] = Blockly.Pseudo['controls_repeat_ext'];

Blockly.Pseudo['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Pseudo.valueToCode(block, 'BOOL',
      until ? Blockly.Pseudo.ORDER_LOGICAL_NOT :
      Blockly.Pseudo.ORDER_NONE) || '___';
  var branch = Blockly.Pseudo.statementToCode(block, 'DO');
  branch = Blockly.Pseudo.addLoopTrap(branch, block.id) ||
      Blockly.Pseudo.PASS;
  if (until) {
    argument0 = 'not ' + argument0;
  }
  return 'while ' + argument0 + ':\n' + branch;
};

Blockly.Pseudo['controls_while'] = function(block) {
  // Do while/until loop.
  var argument0 = Blockly.Pseudo.valueToCode(block, 'BOOL',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var branch = Blockly.Pseudo.statementToCode(block, 'DO');
  branch = Blockly.Pseudo.addLoopTrap(branch, block.id) ||
      Blockly.Pseudo.PASS;
  return 'while ' + argument0 + ':\n' + branch;
};

Blockly.Pseudo['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Pseudo.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Pseudo.valueToCode(block, 'FROM',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var argument1 = Blockly.Pseudo.valueToCode(block, 'TO',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var increment = Blockly.Pseudo.valueToCode(block, 'BY',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var branch = Blockly.Pseudo.statementToCode(block, 'DO');
  branch = Blockly.Pseudo.addLoopTrap(branch, block.id) ||
      Blockly.Pseudo.PASS;

  var code = '';
  var range;

  // Helper functions.
  var defineUpRange = function() {
    return Blockly.Pseudo.provideFunction_(
        'upRange',
        ['def ' + Blockly.Pseudo.FUNCTION_NAME_PLACEHOLDER_ +
            '(start, stop, step):',
         '  while start <= stop:',
         '    yield start',
         '    start += abs(step)']);
  };
  var defineDownRange = function() {
    return Blockly.Pseudo.provideFunction_(
        'downRange',
        ['def ' + Blockly.Pseudo.FUNCTION_NAME_PLACEHOLDER_ +
            '(start, stop, step):',
         '  while start >= stop:',
         '    yield start',
         '    start -= abs(step)']);
  };
  // Arguments are legal Pseudo code (numbers or strings returned by scrub()).
  var generateUpDownRange = function(start, end, inc) {
    return '(' + start + ' <= ' + end + ') and ' +
        defineUpRange() + '(' + start + ', ' + end + ', ' + inc + ') or ' +
        defineDownRange() + '(' + start + ', ' + end + ', ' + inc + ')';
  };

  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All parameters are simple numbers.
    argument0 = parseFloat(argument0);
    argument1 = parseFloat(argument1);
    increment = Math.abs(parseFloat(increment));
    if (argument0 % 1 === 0 && argument1 % 1 === 0 && increment % 1 === 0) {
      // All parameters are integers.
      if (argument0 <= argument1) {
        // Count up.
        argument1++;
        if (argument0 == 0 && increment == 1) {
          // If starting index is 0, omit it.
          range = argument1;
        } else {
          range = argument0 + ', ' + argument1;
        }
        // If increment isn't 1, it must be explicit.
        if (increment != 1) {
          range += ', ' + increment;
        }
      } else {
        // Count down.
        argument1--;
        range = argument0 + ', ' + argument1 + ', -' + increment;
      }
      range = 'range(' + range + ')';
    } else {
      // At least one of the parameters is not an integer.
      if (argument0 < argument1) {
        range = defineUpRange();
      } else {
        range = defineDownRange();
      }
      range += '(' + argument0 + ', ' + argument1 + ', ' + increment + ')';
    }
  } else {
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var scrub = function(arg, suffix) {
      if (Blockly.isNumber(arg)) {
        // Simple number.
        arg = parseFloat(arg);
      } else if (arg.match(/^\w+$/)) {
        // Variable.
        arg = 'float(' + arg + ')';
      } else {
        // It's complicated.
        var varName = Blockly.Pseudo.variableDB_.getDistinctName(
            variable0 + suffix, Blockly.Variables.NAME_TYPE);
        code += varName + ' = float(' + arg + ')\n';
        arg = varName;
      }
      return arg;
    };
    var startVar = scrub(argument0, '_start');
    var endVar = scrub(argument1, '_end');
    var incVar = scrub(increment, '_inc');

    if (typeof startVar == 'number' && typeof endVar == 'number') {
      if (startVar < endVar) {
        range = defineUpRange(startVar, endVar, increment);
      } else {
        range = defineDownRange(startVar, endVar, increment);
      }
    } else {
      // We cannot determine direction statically.
      range = generateUpDownRange(startVar, endVar, increment);
    }
  }
  code += 'for ' + variable0 + ' in ' + range + ':\n' + branch;
  return code;
};

Blockly.Pseudo['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Pseudo.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Pseudo.valueToCode(block, 'LIST',
      Blockly.Pseudo.ORDER_RELATIONAL) || '___';
  var branch = Blockly.Pseudo.statementToCode(block, 'DO');
  branch = Blockly.Pseudo.addLoopTrap(branch, block.id) ||
      Blockly.Pseudo.PASS;
  var code = 'Create a new property named <u>' + variable0 + '</u>.\nFor every element inside of the list ' + argument0 + ', set ' + variable0 + ' to that element\'s value and execute the following indented commands:\n' + branch;
  return code+'\n';
};

Blockly.Pseudo['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'Stop this loop.\n';
    case 'CONTINUE':
      return 'Continue this loop, using the next value.\n';
  }
  throw 'Unknown flow statement.';
};

Blockly.Pseudo['controls_pass'] = function(block) {
  return 'Do nothing.\n';
};