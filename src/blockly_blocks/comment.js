Blockly.Blocks['comment_single'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Comment:")
        .appendField(new Blockly.FieldTextInput("will be ignored"), "BODY");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(60);
    this.setTooltip('This is a comment, which will be ignored when you execute your code.');
    this.setHelpUrl('');
  }
};

Blockly.Python['comment_single'] = function(block) {
  var text_body = block.getFieldValue('BODY');
  // TODO: Assemble JavaScript into code variable.
  var code = '# '+text_body+'\n';
  return code;
};

Blockly.Blocks['string_multiline'] = {
  // Container.
  init: function() {
    this.appendDummyInput()
        .appendField('Multiline String:');
    this.appendDummyInput()
        .appendField(this.newQuote_(true))
        .appendField(new Blockly.FieldTextArea(''), 'TEXT')
        .appendField(this.newQuote_(false));
    this.setColour(Blockly.Blocks.texts.HUE);
    this.setOutput(true, 'String');
  },
  newQuote_: function(open) {
    if (open == this.RTL) {
      var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==';
    } else {
      var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC';
    }
    return new Blockly.FieldImage(file, 12, 12, '"');
  }
};

Blockly.Python['string_multiline'] = function(block) {
  var text_body = block.getFieldValue('TEXT');
  // TODO: Assemble JavaScript into code variable.
  var code = '"""'+text_body+'"""\n';
  return [code, Blockly.Python.ORDER_ATOMIC];
};