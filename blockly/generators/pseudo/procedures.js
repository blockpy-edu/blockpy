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
 * @fileoverview Generating Pseudo for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Pseudo.procedures');

goog.require('Blockly.Pseudo');


Blockly.Pseudo['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is assigned.
  // acbart: Actually, skip that, globals are bad news!
  var globals = []; //Blockly.Variables.allVariables(block);
  for (var i = globals.length - 1; i >= 0; i--) {
    var varName = globals[i];
    if (block.arguments_.indexOf(varName) == -1) {
      globals[i] = Blockly.Pseudo.variableDB_.getName(varName,
          Blockly.Variables.NAME_TYPE);
    } else {
      // This variable is actually a parameter name.  Do not include it in
      // the list of globals, thus allowing it be of local scope.
      globals.splice(i, 1);
    }
  }
  globals = globals.length ? '  global ' + globals.join(', ') + '\n' : '';
  // Get the function's name
  var funcName = Blockly.Pseudo.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  // Get the stack of code
  var branch = Blockly.Pseudo.statementToCode(block, 'STACK');
  // Handle prefixing
  if (Blockly.Pseudo.STATEMENT_PREFIX) {
    branch = Blockly.Pseudo.prefixLines(
        Blockly.Pseudo.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Pseudo.INDENT) + branch;
  }
  // Handle infinite loop trapping
  if (Blockly.Pseudo.INFINITE_LOOP_TRAP) {
    branch = Blockly.Pseudo.INFINITE_LOOP_TRAP.replace(/%1/g,
        '"' + block.id + '"') + branch;
  }
  // Handle return value
  var returnValue = Blockly.Pseudo.valueToCode(block, 'RETURN',
      Blockly.Pseudo.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = 'Now the function is done, so it returns ' + returnValue + '.\n';
  } else if (!branch) {
    branch = Blockly.Pseudo.PASS;
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = '<u>'+Blockly.Pseudo.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE)+'</u>';
  }
  var funcHeader;
  if (args.length > 0) {
      funcHeader = 'The function can take the following parameters: ' + args.join(', ');
  } else {
      funcHeader = 'The function takes no parameters';
  }
  var code = 'Define a new function named <u>' + funcName + '</u>.\n' + funcHeader+ '.\nWhen called, it will do the following:\n' +
      globals + branch + returnValue;
  //acbart: I'm not sure why this is used here. It was fine before when
  //        functions didn't have anything after them, but now it's deadly.
  //code = Blockly.Pseudo.scrub_(block, code);
  //Blockly.Pseudo.definitions_[funcName] = code;
  return code+'\n';
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Pseudo['procedures_defnoreturn'] =
    Blockly.Pseudo['procedures_defreturn'];

Blockly.Pseudo['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Pseudo.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Pseudo.valueToCode(block, 'ARG' + x,
        Blockly.Pseudo.ORDER_NONE) || '___';
  }
  var code = 'the result of calling the function '+funcName + ', with the following arguments: ' + args.join(', ') + '';
  return [code, Blockly.Pseudo.ORDER_FUNCTION_CALL];
};

Blockly.Pseudo['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Pseudo.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Pseudo.valueToCode(block, 'ARG' + x,
        Blockly.Pseudo.ORDER_NONE) || '___';
  }
  var code = 'Call the function '+funcName + ', with the following arguments: ' + args.join(', ') + '';
  return code;
};

Blockly.Pseudo['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Pseudo.valueToCode(block, 'CONDITION',
      Blockly.Pseudo.ORDER_NONE) || '___';
  var code = 'if ' + condition + ':\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Pseudo.valueToCode(block, 'VALUE',
        Blockly.Pseudo.ORDER_NONE) || '___';
    code += '  return ' + value + '\n';
  } else {
    code += '  return\n';
  }
  return code;
};

Blockly.Pseudo['procedures_return'] = function(block) {
  // return value from a procedure.
  var code = "Return";
  if (block.hasReturnValue_) {
    var value = Blockly.Pseudo.valueToCode(block, 'VALUE',
        Blockly.Pseudo.ORDER_NONE) || '___';
    code += ' ' + value + '.\n';
  } else {
    code += '.\n';
  }
  return code;
};