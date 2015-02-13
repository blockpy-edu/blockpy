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