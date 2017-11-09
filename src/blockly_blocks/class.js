Blockly.Blocks['class_creation'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Create class")
        .appendField(new Blockly.FieldVariable("new class"), "CLASS");
    
    this.appendDummyInput()
        .appendField("Inherits from")
        .appendField(new Blockly.FieldVariable("j"), "NAME")
        .appendField(",")
        .appendField(new Blockly.FieldVariable("k"), "NAME");
  
    this.appendStatementInput("BODY")
        .setCheck(null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Python['class_creation'] = function(block) {
  var class_name = Blockly.Python.variableDB_.getName(block.getFieldValue('CLASS'), Blockly.Variables.NAME_TYPE) || '___';
  var body = Blockly.Python.statementToCode(block, 'BODY') ||
      Blockly.Python.PASS;
  // TODO: Assemble Python into code variable.
  var code = 'class ' + class_name + ':\n' + body;
  return code;
};

Blockly.Blocks['attribute_access'] = {
  init: function() {
    this.appendValueInput("MODULE")
        .setCheck(null);
    this.appendValueInput("NAME")
        .setCheck(null)
        .appendField(".");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};

Blockly.Python['attribute_access'] = function(block) {
  var value_module = Blockly.Python.valueToCode(block, 'MODULE', Blockly.Python.ORDER_MEMBER);
  var value_name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_MEMBER);
  // TODO: Assemble JavaScript into code variable.
  var code = value_module+'.'+value_name;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};