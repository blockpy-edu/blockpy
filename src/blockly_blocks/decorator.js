Blockly.Python['decorator'] = function(block) {
  var value_name = Blockly.Python.valueToCode(block, 'BODY', Blockly.Python.ORDER_ATOMIC);
  var code = '@'+(value_name  || '___')+'\n';
  return code;
};

Blockly.Blocks['decorator'] = {
  init: function() {
    this.appendValueInput("BODY")
        .setCheck(null)
        .appendField("@");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  }
};