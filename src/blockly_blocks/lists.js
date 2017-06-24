Blockly.Python['lists_create'] = function(block) {
    // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  console.log(block.itemCount_)
  for (var i = 1; i <= block.itemCount_; i++) {
    elements[i-1] = Blockly.Python.valueToCode(block, 'ADD' + i,
        Blockly.Python.ORDER_NONE) || '___';
  }
  var code = '[' + elements.join(', ') + ']';
  return [code, Blockly.Python.ORDER_ATOMIC];
}
Blockly.Blocks['lists_create'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LISTS_CREATE_WITH_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE);
    this.itemCount_ = 3;
    this.updateShape_();
    this.setOutput(true, 'Array');
    this.setInputsInline(true);
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
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
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    var that = this;
    function addField(field, block, e) {
        var rect = field.fieldGroup_.getBoundingClientRect();
        var yPosition = e.clientY;
        if (yPosition < rect.top+rect.height/2) {
            that.itemCount_ += 1;
            var input = that.appendValueInput('ADD' + that.itemCount_);
        } else {
            if (that.itemCount_ >= 0) {
                that.removeInput('ADD' + that.itemCount_)
                that.itemCount_ -= 1;
            }
        }
    }
    function popField() {
        if (that.itemCount_ >= 0) {
            that.removeInput('ADD' + that.itemCount_)
            that.itemCount_ -= 1;
        }
    }
    if (!this.getInput('START')) {
        var clickablePlusMinus = new Blockly.FieldClickImage("images/plus-minus-button.svg", 12, 24, '+', addField, '-2px');
        //clickablePlusMinus.imageElement_.style.y = '-2px';
        this.appendDummyInput('START')
            .appendField("create list of")
            .appendField(clickablePlusMinus);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        var input = this.appendValueInput('ADD' + i);
      }
    }
  }
};