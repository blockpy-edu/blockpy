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
 * @fileoverview Generating Python for plot blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Python.plot');

goog.require('Blockly.Python');

Blockly.Python['plot_title'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var parameter_plot_title = Blockly.Python.quote_(block.getFieldValue('TEXT'))
    var code = 'plt.title('+parameter_plot_title+')\n';
    return code;
};

Blockly.Python['plot_xlabel'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var parameter_plot_title = Blockly.Python.quote_(block.getFieldValue('TEXT'))
    var code = 'plt.xlabel('+parameter_plot_title+')\n';
    return code;
};
Blockly.Python['plot_ylabel'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var parameter_plot_title = Blockly.Python.quote_(block.getFieldValue('TEXT'))
    var code = 'plt.ylabel('+parameter_plot_title+')\n';
    return code;
};

Blockly.Python['plot_line'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var code = 'plt.plot(';
    var argument1 = Blockly.Python.valueToCode(block, 'y_values',
      Blockly.Python.ORDER_NONE) || '___';
    code += argument1 +')\n';
    return code;
};

Blockly.Python['plot_hist'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var code = 'plt.hist(';
    var argument1 = Blockly.Python.valueToCode(block, 'values',
      Blockly.Python.ORDER_NONE) || '___';
    code += argument1 +')\n';
    return code;
};

Blockly.Python['plot_lineXY'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var code = 'plt.line(';
    var argument0 = Blockly.Python.valueToCode(block, 'x_values',
      Blockly.Python.ORDER_NONE) || '___';
    var argument1 = Blockly.Python.valueToCode(block, 'y_values',
      Blockly.Python.ORDER_NONE) || '___';
    code += argument0 + ','+ argument1 + ')\n';
    return code;
};

Blockly.Python['plot_scatter'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var code = 'plt.scatter(';
    var argument0 = Blockly.Python.valueToCode(block, 'x_values',
      Blockly.Python.ORDER_NONE) || '___';
    var argument1 = Blockly.Python.valueToCode(block, 'y_values',
      Blockly.Python.ORDER_NONE) || '___';
    code += argument0 + ','+ argument1 + ')\n';
    return code;
};



Blockly.Python['plot_show'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var code = 'plt.show()\n';
    return code;
};