Blockly.Blocks['raw_block'] = {
  // Container.
  init: function() {
    this.setColour(260);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendTitle('raw code block:');
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldTextArea(''), 'TEXT');
  }
};

Blockly.Blocks['raw_expression'] = {
  // Container.
  init: function() {
    this.setColour(260);
    this.appendDummyInput()
        .appendTitle('raw expression:');
    this.appendDummyInput()
        .appendTitle(new Blockly.FieldTextArea(''), 'TEXT');
    this.setOutput(true);
  }
};

Blockly.Blocks['type_check'] = {
  // Set element at index.
  init: function() {
    this.setColour(130);
    this.appendValueInput('VALUE')
        .appendTitle(Blockly.Msg.TYPE_CHECK);
    this.setInputsInline(true);
    this.setOutput(true, 'Type');
    //this.setPreviousStatement(true);
    //this.setNextStatement(true);
  }
};

