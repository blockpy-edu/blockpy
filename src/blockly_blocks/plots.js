Blockly.Blocks['plot_legend'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(Blockly.Blocks.plot.HUE);
    this.appendDummyInput()
        .appendField("make legend");
    this.setInputsInline(false);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setOutput(false);
    this.setTooltip('Makes the legend appear');
  }
};

Blockly.Python['plot_legend'] = function(block) {
    Blockly.Python.definitions_['import_matplotlib'] = 'import matplotlib.pyplot as plt';
    var code = 'plt.legend()\n';
    return code;
};