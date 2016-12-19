Blockly.Blocks['dicts_create_with_container'] = {
  // Container.
  init: function() {
    this.setColour(Blockly.Blocks.dicts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.DICTS_CREATE_WITH_CONTAINER_TITLE_ADD);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.DICTS_CREATE_WITH_CONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['dicts_create_with_item'] = {
  // Add items.
  init: function() {
    this.setColour(Blockly.Blocks.dicts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.DICTS_CREATE_WITH_ITEM_TITLE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.DICTS_CREATE_WITH_ITEM_TOOLTIP);
    this.contextMenu = false;
  }
};
Blockly.Blocks['dicts_create_with'] = {
    /**
     * Block for creating a dict with any number of elements of any type.
     * @this Blockly.Block
     */
    init: function() {
        console.log("init");
        this.setInputsInline(false);
        this.setColour(Blockly.Blocks.dicts.HUE);
        this.itemCount_ = 1;
        this.updateShape_();
        this.setOutput(true, 'dict');
        this.setMutator(new Blockly.Mutator(['dicts_create_with_item']));
        this.setTooltip(Blockly.Msg.DICTS_CREATE_WITH_TOOLTIP);
    },
    /**
     * Create XML to represent dict inputs.
     * @return {Element} XML storage element.
     * @this Blockly.Block
     */
    mutationToDom: function(workspace) {
        console.log("mutationToDom");
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    /**
     * Parse XML to restore the dict inputs.
     * @param {!Element} xmlElement XML storage element.
     * @this Blockly.Block
     */
    domToMutation: function(xmlElement) {
        console.log("domToMutation");
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    /**
     * Modify this block to have the correct number of inputs.
     * @private
     * @this Blockly.Block
     */
    updateShape_: function() {
        console.log("updateShape");
        // Delete everything.
        if (this.getInput("EMPTY")) {
            this.removeInput('EMPTY');
        }
        var keyNames = [];
        for (var i = 0; this.getInput('VALUE' + i); i++) {
            //this.getInput('VALUE' + i).removeField("KEY"+i);
            keyNames.push(this.getFieldValue("KEY"+i))
            this.removeInput('VALUE' + i);
        }
        // Rebuild block.
        if (this.itemCount_ == 0) {
            this.appendDummyInput('EMPTY')
                .appendField(Blockly.Msg.DICTS_CREATE_EMPTY_TITLE);
        } else {
            this.appendDummyInput('EMPTY')
                .appendField(Blockly.Msg.DICTS_CREATE_WITH_INPUT_WITH);
            for (var i = 0; i < this.itemCount_; i++) {
                this.appendValueInput('VALUE' + i)
                    .setCheck(null)
                    .setAlign(Blockly.ALIGN_RIGHT)
                    .appendField(
                          new Blockly.FieldTextInput(
                              keyNames.length > i
                              ? keyNames[i]
                              : Blockly.Msg.DICTS_CREATE_WITH_ITEM_KEY),
                         'KEY'+i)
                   .appendField(Blockly.Msg.DICTS_CREATE_WITH_ITEM_MAPPING);
            }
        }
    },
    /**
     * Populate the mutator's dialog with this block's components.
     * @param {!Blockly.Workspace} workspace Mutator's workspace.
     * @return {!Blockly.Block} Root block in mutator.
     * @this Blockly.Block
     */
    decompose: function(workspace) {
        console.log("Decompose");
        var containerBlock = workspace.newBlock('dicts_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var x = 0; x < this.itemCount_; x++) {
          var itemBlock = workspace.newBlock('dicts_create_with_item');
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
        console.log("Compose");
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
                this.getInput('VALUE' + i).connection.connect(connections[i]);
            }
        }
    },
    /**
     * Store pointers to any connected child blocks.
     * @param {!Blockly.Block} containerBlock Root block in mutator.
     * @this Blockly.Block
     */
    saveConnections: function(containerBlock) {
        console.log("SaveConnections");
        // Store a pointer to any connected child blocks.
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var x = 0;
        while (itemBlock) {
            var value_input = this.getInput('VALUE' + x);
            itemBlock.valueConnection_ = value_input && value_input.connection.targetConnection;
            x++;
            itemBlock = itemBlock.nextConnection &&
                        itemBlock.nextConnection.targetBlock();
        }
    }
};
