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
 * @fileoverview Generating Pseudo for plot blocks.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Pseudo.plot');

goog.require('Blockly.Pseudo');

Blockly.Pseudo['plot_title'] = function(block) {
    Blockly.Pseudo.definitions_['import_matplotlib'] = 'Import the PyPlot package from the MatPlotLib module (which let\'s you do plotting).';
    var parameter_plot_title = Blockly.Pseudo.quote_(block.getFieldValue('TEXT'))
    var code = 'Set the title of the current plot to '+parameter_plot_title+'.\n';
    return code;
};

Blockly.Pseudo['plot_line'] = function(block) {
    Blockly.Pseudo.definitions_['import_matplotlib'] = 'Import the PyPlot package from the MatPlotLib module (which let\'s you do plotting).';
    var code = 'Plot the list ';
    var argument1 = Blockly.Pseudo.valueToCode(block, 'y_values',
      Blockly.Pseudo.ORDER_NONE) || '___';
    code += argument1 +' onto the current canvas as a line.\n';
    return code;
};

Blockly.Pseudo['plot_lineXY'] = function(block) {
    Blockly.Pseudo.definitions_['import_matplotlib'] = 'Import the PyPlot package from the MatPlotLib module (which let\'s you do plotting).';
    var code = 'Plot the list ';
    var argument0 = Blockly.Pseudo.valueToCode(block, 'x_values',
      Blockly.Pseudo.ORDER_NONE) || '___';
    var argument1 = Blockly.Pseudo.valueToCode(block, 'y_values',
      Blockly.Pseudo.ORDER_NONE) || '___';
    code += argument0 + ','+ argument1 + ' onto the current canvas as an XY Plot\n';
    return code;
};

Blockly.Pseudo['plot_scatter'] = function(block) {
    Blockly.Pseudo.definitions_['import_matplotlib'] = 'Import the PyPlot package from the MatPlotLib module (which let\'s you do plotting).';
    var code = 'plt.scatter(';
    var argument0 = Blockly.Pseudo.valueToCode(block, 'x_values',
      Blockly.Pseudo.ORDER_NONE) || '___';
    var argument1 = Blockly.Pseudo.valueToCode(block, 'y_values',
      Blockly.Pseudo.ORDER_NONE) || '___';
    code += argument0 + ','+ argument1 + ')\n';
    return code;
};



Blockly.Pseudo['plot_show'] = function(block) {
    Blockly.Pseudo.definitions_['import_matplotlib'] = 'Import the PyPlot package from the MatPlotLib module (which let\'s you do plotting).';
    var code = 'Make the plot appear.\n';
    return code;
};