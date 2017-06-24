Blockly.Python['tuple_create'] = function(block) {
    // Create a list with any number of elements of any type.
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = (Blockly.Python.valueToCode(block, 'ADD' + i,
            Blockly.Python.ORDER_NONE) || '___' );
    }
    var code = elements.join(', ');
    if (block.itemCount_ == 1) {
        code = '(' + code + ',)';
    } else {
        code = '(' + code + ')';
    }
    return [code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['tuple_create'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LISTS_CREATE_WITH_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE+10);
    this.itemCount_ = 3;
    this.updateShape_();
    this.setOutput(true, 'Tuple');
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
            var input = that.appendValueInput('ADD' + that.itemCount_);
            that.itemCount_ += 1;
        } else {
            console.log("O", that.itemCount_);
            if (that.itemCount_ > 0) {
                that.itemCount_ -= 1;
                that.removeInput('ADD' + that.itemCount_)
            }
            console.log("PO", that.itemCount_);
        }
    }
    if (!this.getInput('START')) {
        var clickablePlusMinus = new Blockly.FieldClickImage("images/plus-minus-button.svg", 12, 24, '+', addField, '-2px');
        //clickablePlusMinus.imageElement_.style.y = '-2px';
        this.appendDummyInput('START')
            .appendField("create tuple of")
            .appendField(clickablePlusMinus);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
        console.log("A", i)
      if (!this.getInput('ADD' + i)) {
        var input = this.appendValueInput('ADD' + i);
      }
    }
    // Remove deleted inputs.
    console.log("Removing PAST", i)
    while (this.getInput('ADD' + i)) {
      this.removeInput('ADD' + i);
      i++;
    }
  }
};