/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Utility blocks for Blockly.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Blocks.utility');

goog.require('Blockly.Blocks');


Blockly.Blocks.utility.HUE = 160;

Blockly.Blocks['raw_table'] = {
  // Container.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('Tabular Abstraction:');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTable(''), 'TEXT');
  }
};

Blockly.Blocks['raw_block'] = {
  // Container.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('Code Block:');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextArea(''), 'TEXT');
  }
};

Blockly.Blocks['raw_expression'] = {
  // Container.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.appendDummyInput()
        .appendField('Code Expression:');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextArea(''), 'TEXT');
    this.setOutput(true);
  }
};

Blockly.Blocks['raw_empty'] = {
  // Container.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendValueInput('VALUE')
        .appendField('');
    this.setInputsInline(false);
  }
};

Blockly.Blocks['text_comment'] = {
  // Text value.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.appendDummyInput()
        .appendTitle('Comment:')
        .appendTitle(new Blockly.FieldTextInput(''), 'TEXT');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('This comment will be ignored by Python');
  }
};

Blockly.Blocks['type_check'] = {
  // Set element at index.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.appendValueInput('VALUE')
        .appendField(Blockly.Msg.TYPE_CHECK);
    this.setInputsInline(false);
    this.setOutput(true, 'Type');
    //this.setPreviousStatement(true);
    //this.setNextStatement(true);
  }
};


Blockly.Blocks['text_print_multiple'] = {
    /**
     * Block for printing multiple things (including nothing)
     * @this Blockly.Block
     */
    init: function() {
        this.setColour(Blockly.Blocks.utility.HUE);
        this.itemCount_ = 1;
        this.updateShape_();
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setMutator(new Blockly.Mutator(['text_print_multiple_item']));
        this.setTooltip(Blockly.Msg.TEXT_PRINT_TOOLTIP);
  },
    /**
     * Create XML to represent print inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function(workspace) {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    /**
     * Parse XML to restore the list inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function(xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function(workspace) {
        var containerBlock = Blockly.Block.obtain(workspace,
                                 'text_print_multiple_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 0; x < this.itemCount_; x++) {
          var itemBlock = Blockly.Block.obtain(workspace, 'text_print_multiple_item');
          itemBlock.initSvg();
          connection.connect(itemBlock.previousConnection);
          connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function(containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        var i = 0;
        while (itemBlock) {
            connections[i] = itemBlock.valueConnection_;
            itemBlock = itemBlock.nextConnection &&
                        itemBlock.nextConnection.targetBlock();
            i++;
        }
        this.itemCount_ = i;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            if (connections[i]) {
                this.getInput('PRINT' + i).connection.connect(connections[i]);
            }
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function(containerBlock) {
        // Store a pointer to any connected child blocks.
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 0;
        while (itemBlock) {
            var input = this.getInput('PRINT' + x);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            x++;
            itemBlock = itemBlock.nextConnection &&
                        itemBlock.nextConnection.targetBlock();
        }
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @private
     * @this Blockly.Block
     */
    updateShape_: function() {
        // Delete everything.
        if (this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else {
            var i = 0;
            while (this.getInput('PRINT' + i)) {
                this.removeInput('PRINT' + i);
                i++;
            }
        }
    
        // Rebuild block.
        if (this.itemCount_ == 0) {
            this.appendDummyInput('EMPTY')
                .appendField("print");
        } else {
            for (var i = 0; i < this.itemCount_; i++) {
                var input = this.appendValueInput('PRINT' + i);
                if (i == 0) {
                    input.appendField("print");
                }
            }
        }
    }
};

Blockly.Blocks['text_print_multiple_container'] = {
  // Container.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.appendDummyInput()
        .appendField('print');
    this.appendStatementInput('STACK');
    this.setTooltip('');
    this.contextMenu = false;
  }
};
Blockly.Blocks['text_print_multiple_item'] = {
  // Add items.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.appendDummyInput()
        .appendField('item');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.contextMenu = false;
  }
};

Blockly.Blocks['function_call'] = {
    /**
     * Block for printing multiple things (including nothing)
     * @this Blockly.Block
     */
    init: function() {
        this.setColour(Blockly.Blocks.utility.HUE);
        this.itemCount_ = 1;
        this.hasReturn_ = false;
        this.appendDummyInput()
            .appendField(new Blockly.FieldTextInput("str"), 'NAME');
        this.updateShape_();
        this.setMutator(new Blockly.Mutator(['function_call_item']));
        this.setTooltip("Can be used to call any function");
  },
    /**
     * Create XML to represent print inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function(workspace) {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        container.setAttribute('hasReturn', this.hasReturn_ ? "TRUE": "FALSE");
        return container;
    },
    /**
     * Parse XML to restore the list inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function(xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.hasReturn_ = xmlElement.getAttribute('hasReturn') === "TRUE";
        this.updateShape_();
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function(workspace) {
        var containerBlock = Blockly.Block.obtain(workspace,
                                 'function_call_container');
        containerBlock.initSvg();
        
        containerBlock.setFieldValue(this.hasStatements_ ? 'TRUE' : 'FALSE',
                                   'RETURN');
        
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 0; x < this.itemCount_; x++) {
          var itemBlock = Blockly.Block.obtain(workspace, 'function_call_item');
          itemBlock.initSvg();
          connection.connect(itemBlock.previousConnection);
          connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    /**
     * Notification that the procedure's return state has changed.
     * @param {boolean} returnState New return state
     * @this Blockly.Block
     */
    setReturn: function(returnState) {
        this.unplug(true, true);
        this.setOutput(returnState);
        this.setPreviousStatement(!returnState);
        this.setNextStatement(!returnState);
        if (this.rendered) {
            this.render();
        }
    },
    /**
     * Reconfigure this block based on the mutator dialog's components.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    compose: function(containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        var i = 0;
        while (itemBlock) {
            connections[i] = itemBlock.valueConnection_;
            itemBlock = itemBlock.nextConnection &&
                        itemBlock.nextConnection.targetBlock();
            i++;
        }
        this.itemCount_ = i;
        
        this.hasReturn_ = containerBlock.getFieldValue("RETURN") === "TRUE";
        
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            if (connections[i]) {
                this.getInput('ARGUMENT' + i).connection.connect(connections[i]);
            }
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function(containerBlock) {
        // Store a pointer to any connected child blocks.
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 0;
        while (itemBlock) {
            var input = this.getInput('ARGUMENT' + x);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            x++;
            itemBlock = itemBlock.nextConnection &&
                        itemBlock.nextConnection.targetBlock();
        }
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @private
     * @this Blockly.Block
     */
    updateShape_: function() {
        // Delete everything.
        if (this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else {
            var i = 0;
            while (this.getInput('ARGUMENT' + i)) {
                this.removeInput('ARGUMENT' + i);
                i++;
            }
        }
    
        // Rebuild block.
        for (var i = 0; i < this.itemCount_; i++) {
            var input = this.appendValueInput('ARGUMENT' + i);
        }
        
        // Set whether returns anything
        this.setReturn(this.hasReturn_);
    }
};

Blockly.Blocks['function_call_container'] = {
  // Container.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.appendDummyInput()
        .appendField('Arguments');
    this.appendStatementInput('STACK');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('has return')
        .appendField(new Blockly.FieldCheckbox('TRUE'),
                     'RETURN');
    this.setTooltip('');
    this.contextMenu = false;
  }
};
Blockly.Blocks['function_call_item'] = {
  // Add items.
  init: function() {
    this.setColour(Blockly.Blocks.utility.HUE);
    this.appendDummyInput()
        .appendField('argument');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('');
    this.contextMenu = false;
  }
};
