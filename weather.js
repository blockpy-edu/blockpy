Blockly.Blocks['get_temperature'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get temperature for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "Number");
    this.setTooltip('');
  }
};

Blockly.Python['get_temperature'] = function(block) {
    var code = 'weather.get_temperature(';
    var argument0 = Blockly.Python.valueToCode(block, 'city',
      Blockly.Python.ORDER_NONE) || '\'\'';
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};
        
        
Blockly.Blocks['get_forecasts'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get forecasts for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setTooltip('');
  }
};

Blockly.Python['get_forecasts'] = function(block) {
    var code = 'weather.get_forecasts(';
    var argument0 = Blockly.Python.valueToCode(block, 'city',
      Blockly.Python.ORDER_NONE) || '\'\'';
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['get_report'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get report for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "dict");
    this.setTooltip('');
  }
};

Blockly.Python['get_report'] = function(block) {
    var code = 'weather.get_report(';
    var argument0 = Blockly.Python.valueToCode(block, 'city',
      Blockly.Python.ORDER_NONE) || '\'\'';
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['get_forecasted_reports'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(330);
    this.appendValueInput("city")
        .appendTitle("get forecasted reports for ")
        .setCheck(null);
    this.setInputsInline(true);
    this.setOutput(true, "Array");
    this.setTooltip('');
  }
};

Blockly.Python['get_forecasted_reports'] = function(block) {
    var code = 'weather.get_forecasted_reports(';
    var argument0 = Blockly.Python.valueToCode(block, 'city',
      Blockly.Python.ORDER_NONE) || '\'\'';
    code += argument0 + ')';
    return [code, Blockly.Python.ORDER_ATOMIC];
};