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
 * @fileoverview Dictionary blocks for Blockly.
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.Blocks.dicts');

goog.require('Blockly.Blocks');


Blockly.Blocks.dicts.HUE = 210;


Blockly.Msg.TYPE_CHECK = "check type of"
Blockly.Msg.DICT_KEYS = "get all keys of "
Blockly.Msg.DICT_GET = "get value of key"
Blockly.Msg.DICT_GET_TO = "from"
Blockly.Msg.DICTS_CREATE_WITH_INPUT_WITH = "dict of"
Blockly.Msg.DICTS_CREATE_WITH_TOOLTIP = "Create a new dictionary"
Blockly.Msg.DICTS_CREATE_EMPTY_TITLE = "Create empty dict"
Blockly.Msg.DICTS_CREATE_WITH_CONTAINER_TITLE_ADD = "key-value pairs"
Blockly.Msg.DICTS_CREATE_WITH_CONTAINER_TOOLTIP = "**"
Blockly.Msg.DICTS_CREATE_WITH_ITEM_TITLE = "key-value"
Blockly.Msg.DICTS_CREATE_WITH_ITEM_TOOLTIP = "Make a new key-value pair"
Blockly.Msg.DICTS_CREATE_WITH_ITEM_KEY = "key"
Blockly.Msg.DICTS_CREATE_WITH_ITEM_VALUE = "value"
Blockly.Blocks['dicts_create_with_container'] = {
  // Container.
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_CONTAINER_TITLE_ADD);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.DICTS_CREATE_WITH_CONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['dicts_create_with_item'] = {
  // Add items.
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_ITEM_TITLE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.DICTS_CREATE_WITH_ITEM_TOOLTIP);
    this.contextMenu = false;
  }
};
Blockly.Blocks['dicts_create_with'] = {
    init: function() {
        this.setColour(260);
        this.appendDummyInput('TITLE_TEXT')
            .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_INPUT_WITH);
        this.appendValueInput('KEY0')
        this.appendValueInput('VALUE0');
        this.appendValueInput('KEY1');
        this.appendValueInput('VALUE1');
        this.appendValueInput('KEY2');
        this.appendValueInput('VALUE2');
        
        this.setOutput(true, 'dict');
        this.setMutator(new Blockly.Mutator(['dicts_create_with_item']));
        this.setTooltip(Blockly.Msg.DICTS_CREATE_WITH_TOOLTIP);
        this.itemCount_ = 3;
    },
    mutationToDom: function(workspace) {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function(container) {
        this.removeInput('TITLE_TEXT');
        for (var x = 0; x < this.itemCount_; x++) {
          this.removeInput('KEY' + x);
          this.removeInput('VALUE' + x);
        }
        this.itemCount_ = parseInt(container.getAttribute('items'), 10);
        this.appendDummyInput('TITLE_TEXT')
            .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_INPUT_WITH);
        for (var x = 0; x < this.itemCount_; x++) {
          var key_input = this.appendValueInput('KEY' + x)
                              .setCheck(null)
                              .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_ITEM_KEY);
          var value_input = this.appendValueInput('VALUE' + x)
                              .setCheck(null)
                              .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_ITEM_VALUE);
        }
    },
    decompose: function(workspace) {
        var containerBlock = new Blockly.Block(workspace,
                                               'dicts_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 0; x < this.itemCount_; x++) {
          var itemBlock = new Blockly.Block(workspace, 'dicts_create_with_item');
          itemBlock.initSvg();
          connection.connect(itemBlock.previousConnection);
          connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    compose: function(containerBlock) {
        // Disconnect all input blocks and remove all inputs.
        if (this.itemCount_ == 0) {
          this.removeInput('EMPTY');
        } else {
          this.removeInput('TITLE_TEXT');
          for (var x = this.itemCount_ - 1; x >= 0; x--) {
            this.removeInput('KEY' + x);
            this.removeInput('VALUE' + x);
          }
        }
        this.itemCount_ = 0;
        // Rebuild the block's inputs.
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        this.appendDummyInput('TITLE_TEXT')
            .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_INPUT_WITH);
        while (itemBlock) {
          var key_input = this.appendValueInput('KEY' + this.itemCount_)
                              .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_ITEM_KEY);
          var value_input = this.appendValueInput('VALUE' + this.itemCount_)
                                .appendTitle(Blockly.Msg.DICTS_CREATE_WITH_ITEM_VALUE);
          // Reconnect any child blocks.
          if (itemBlock.valueConnection_) {
            value_input.connection.connect(itemBlock.valueConnection_);
          }
          this.itemCount_++;
          itemBlock = itemBlock.nextConnection &&
              itemBlock.nextConnection.targetBlock();
        }
        if (this.itemCount_ == 0) {
          this.appendDummyInput('EMPTY')
              .appendTitle(Blockly.Msg.DICTS_CREATE_EMPTY_TITLE);
        }
    },
    saveConnections: function(containerBlock) {
        // Store a pointer to any connected child blocks.
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 0;
        while (itemBlock) {
          var key_input = this.getInput('KEY' + x);
          var value_input = this.getInput('VALUE' + x);
          itemBlock.valueConnection_ = value_input && value_input.connection.targetConnection;
          x++;
          itemBlock = itemBlock.nextConnection &&
              itemBlock.nextConnection.targetBlock();
        }
    }
};

Blockly.Blocks['dict_get'] = {
  // Set element at index.
  init: function() {
    this.setColour(260);
    this.appendValueInput('ITEM')
        .appendTitle(Blockly.Msg.DICT_GET);
    this.appendValueInput('DICT')
        .setCheck('dict')
        .appendTitle(Blockly.Msg.DICT_GET_TO);
    this.setInputsInline(true);
    this.setOutput(true);
    //this.setPreviousStatement(true);
    //this.setNextStatement(true);
  }
};

Blockly.Blocks['dict_keys'] = {
  // Set element at index.
  init: function() {
    this.setColour(260);
    this.appendValueInput('DICT')
        .setCheck('dict')
        .appendTitle(Blockly.Msg.DICT_KEYS);
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    //this.setPreviousStatement(true);
    //this.setNextStatement(true);
  }
};