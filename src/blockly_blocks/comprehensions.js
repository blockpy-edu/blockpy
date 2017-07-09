Blockly.Blocks['list_comprehension'] = {
  init: function() {
    this.appendValueInput("body")
        .setCheck(null)
        .appendField("[");
    this.appendValueInput("var")
        .setCheck(null)
        .appendField("for");
    this.appendValueInput("list")
        .setCheck(null)
        .appendField("in");
    this.appendDummyInput()
        .appendField("]");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};
Blockly.Python['list_comprehension'] = function(block) {
  var value_body = Blockly.Python.valueToCode(block, 'body', Blockly.Python.ORDER_ATOMIC) || '___';
  var value_var = Blockly.Python.valueToCode(block, 'var', Blockly.Python.ORDER_ATOMIC) || '___';
  var value_list = Blockly.Python.valueToCode(block, 'list', Blockly.Python.ORDER_ATOMIC) || '___';
  // TODO: Assemble Python into code variable.
  var code = '['+value_body+' for '+value_var+' in '+value_list+']';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};