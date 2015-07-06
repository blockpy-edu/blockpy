/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://blockly.googlecode.com/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Table field.
 * @author fraser@google.com (Neil Fraser)
 * @author Andrew Mee
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

goog.provide('Blockly.FieldTable');

goog.require('Blockly.Field');
goog.require('Blockly.Msg');
goog.require('goog.asserts');
goog.require('goog.math.Size');
goog.require('goog.dom');
goog.require('goog.userAgent');


/**
 * Class for an editable table.
 * @param {array} data The initial content of the table, expected to be
 *   an array of arrays, with the first row being an array of strings.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldTable = function(data) {
    this.size_ = new goog.math.Size(0, 25);
    this.tableElements_ = [];
    this.setData(data);
    /*this.setData([["name", "age", "gender"], 
                 ["Cory", 25, "M"], 
                 ["Ellie", 21, "F"]]);*/
};
goog.inherits(Blockly.FieldTable, Blockly.Field);

/**
 * Clone this FieldTable.
 * @return {!Blockly.FieldTable} The result of calling the constructor again
 *   with the current values of the arguments used during construction.
 */
Blockly.FieldTable.prototype.clone = function() {
  return new Blockly.FieldTable(this.getData());
};

/**
 * Mouse cursor style when over the hotspot that initiates the editor.
 */
Blockly.FieldTable.prototype.CURSOR = 'pointer';

/**
 * Close the input widget if this input is being deleted.
 */
Blockly.FieldTable.prototype.dispose = function() {
  Blockly.WidgetDiv.hideIfOwner(this);
  this.tableElements_ = null;
  Blockly.FieldTable.superClass_.dispose.call(this);
};

/**
 * Install this table on a block.
 * @param {!Blockly.Block} block The block containing this table.
 */
Blockly.FieldTable.prototype.init = function(block) {
    if (this.sourceBlock_) {
    // Table has already been initialized once.
        return;
    }
    this.sourceBlock_ = block;
    // Build the DOM.
    var offsetY = 6 - Blockly.BlockSvg.FIELD_HEIGHT;
    this.fieldGroup_ = Blockly.createSvgElement('g', {}, null);
    this.setData(this.data_);
    block.getSvgRoot().appendChild(this.fieldGroup_);
};

/**
 * Set the data of the table.
 * @param {?array} data New data
 * @override
 */
Blockly.FieldTable.prototype.setData = function(data) {
    if (data === null) {
        if (this.data_ == null) {
            this.setData([[""]]);
        }
        // No change if null.
        return;
    }
    // [{"name": "Cory", "age": 25}, {"name": "Ellie", "age": 21}]
    
    // Ensure that we are dealing with an array of hashes with strings as keys
    var tableWidth = null;
    var maximumLetterWidths = []; // *Extremely* terrible system for estimating
                                  //    table widths. Ugh.
    if (Array.isArray(data)) {
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            if (!Array.isArray(row)) {
                return;
            }
            // Make sure that the rows are the same length
            if (tableWidth != null && row.length != tableWidth) {
                return;
            }
            tableWidth = row.length;
            var value = (""+row[j]).length;
            for (var j = 0; j < row.length; j++) {
                if (maximumLetterWidths.length <= j ||
                    maximumLetterWidths[j] == value) {
                    maximumLetterWidths[j] = value;
                }
            }
        }
    }
    for (var i = 1; i < maximumLetterWidths.length; i++) {
        maximumLetterWidths[i] += maximumLetterWidths[i-1];
    }
    // It's valid, assign it!
    this.data_ = data;
    
    // Empty the table
    this.tableElements_ = this.tableElements_.filter(function(element) {
        goog.dom.removeChildren(/** @type {!Element} */ (element));
    });
    
    // Prevent any field from being empty?
    // text = Blockly.Field.NBSP
    var y = 2;
    var maximumElementWidths = [];
    for (var i = 0; i < data.length; i++) {
        var tableRow = Blockly.createSvgElement('text',
                  {}, this.fieldGroup_);
        this.tableElements_.push(tableRow);
        var row = data[i];
        var x = 0;
        for (var j = 0; j < row.length; j++) {
            var value = row[j];
            var properties = {x: x, y:y, 'fill': 'white'};
            if (i == 0) {
                properties['text-decoration'] = 'underline';
            }
            var cell = Blockly.createSvgElement('tspan', properties, tableRow);
            cell.appendChild(document.createTextNode(value));
            x = maximumLetterWidths[j]*8;
        }
        y += 20;
    }
    // Cached width is obsolete.  Clear it.
    this.size_.width = 0;
    
    // Re-render source block in case we shifted things around
    if (this.sourceBlock_ && this.sourceBlock_.rendered) {
        this.sourceBlock_.render();
        this.sourceBlock_.bumpNeighbours_();
        this.sourceBlock_.workspace.fireChangeEvent();
    }
};

/**
 * Draws the border with the correct width.
 * Saves the computed width in a property.
 * @private
 */
Blockly.FieldTable.prototype.render_ = function() {
    if (this.visible_ && this.tableElements_) {
        // Calculate the width of the header row
        if (this.tableElements_.length >= 1) {
            this.size_.width = this.tableElements_[0].getBBox().width;
        } else {
            this.size_.width = 50;
        }
        // Calculate the height of the entire thing
        this.size_.height= (this.data_.length || 1)*20 + (Blockly.BlockSvg.SEP_SPACE_Y+5) ;
        // And update the border rectangle
        if (this.borderRect_) {
            this.borderRect_.setAttribute('width',
                this.size_.width + Blockly.BlockSvg.SEP_SPACE_X);
            this.borderRect_.setAttribute('height',
                this.size_.height -  (Blockly.BlockSvg.SEP_SPACE_Y+5));
        }
    }
};
        


/**
 * Show the inline free-text editor on top of the text.
 * @param {boolean=} opt_quietInput True if editor should be created without
 *     focus.  Defaults to false.
 * @private
 */
Blockly.FieldTable.prototype.showEditor_ = function(opt_quietInput) {
  var quietInput = opt_quietInput || false;
  if (!quietInput && (goog.userAgent.MOBILE || goog.userAgent.ANDROID ||
                      goog.userAgent.IPAD)) {
    // Mobile browsers have issues with in-line textareas (focus & keyboards).
    var newValue = window.prompt(Blockly.Msg.CHANGE_VALUE_TITLE, this.text_);
    if (this.changeHandler_) {
      var override = this.changeHandler_(newValue);
      if (override !== undefined) {
        newValue = override;
      }
    }
    if (newValue !== null) {
      this.setText(newValue);
    }
    return;
  }

  Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, this.widgetDispose_());
  var div = Blockly.WidgetDiv.DIV;
  // Create the input.
  var htmlInput = goog.dom.createDom('table', 'blocklyHtmlInput');
  Blockly.FieldTable.htmlInput_ = htmlInput;
  htmlInput.style.resize = 'none';
  htmlInput.style['line-height'] = '20px';
  htmlInput.style['overflow'] = 'hidden';
  htmlInput.style.height = '100%';//this.size_.height - Blockly.BlockSvg.SEP_SPACE_Y + 'px';
  div.appendChild(htmlInput);

  htmlInput.value = htmlInput.defaultValue = this.text_;
  htmlInput.oldValue_ = null;
  this.validate_();
  this.resizeEditor_();
  if (!quietInput) {
    htmlInput.focus();
  }

  // Bind to keydown -- trap Enter without IME and Esc to hide.
  htmlInput.onKeyDownWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keydown', this, this.onHtmlInputKeyDown_);
  // Bind to keyup -- trap Enter; resize after every keystroke.
  // Bind to keyup -- trap Enter and Esc; resize after every keystroke.
  htmlInput.onKeyUpWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keyup', this, this.onHtmlInputChange_);
  // Bind to keyPress -- repeatedly resize when holding down a key.
  htmlInput.onKeyPressWrapper_ =
      Blockly.bindEvent_(htmlInput, 'keypress', this, this.onHtmlInputChange_);
  var workspaceSvg = this.sourceBlock_.workspace.getCanvas();
  htmlInput.onWorkspaceChangeWrapper_ =
      Blockly.bindEvent_(workspaceSvg, 'blocklyWorkspaceChange', this,
      this.resizeEditor_);
};

/**
 * Handle key down to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTable.prototype.onHtmlInputKeyDown_ = function(e) {
  var htmlInput = Blockly.FieldTable.htmlInput_;
  var escKey = 27;
  if (e.keyCode == escKey) {
    this.setText(htmlInput.defaultValue);
    Blockly.WidgetDiv.hide();
  }
};

/**
 * Handle a change to the editor.
 * @param {!Event} e Keyboard event.
 * @private
 */
Blockly.FieldTable.prototype.onHtmlInputChange_ = function(e) {
  var htmlInput = Blockly.FieldTable.htmlInput_;
  var escKey = 27;
  if (e.keyCode == escKey) {
    // Esc
    this.setText(htmlInput.defaultValue);
    Blockly.WidgetDiv.hide();
  } else {
    // Update source block.
        var text = htmlInput.value;
    if (text !== htmlInput.oldValue_) {
      htmlInput.oldValue_ = text;
      this.setText(text);
      this.validate_();
    } else if (goog.userAgent.WEBKIT) {
      // Cursor key.  Render the source block to show the caret moving.
      // Chrome only (version 26, OS X).
      this.sourceBlock_.render();
    }
    this.resizeEditor_();
  }
};

Blockly.FieldTable.prototype.getData = function() {
    return this.data_;
    // TODO
    // Loop through grabbing everything
    /*var myRows = [];
    var $headers = $("th");
    var $rows = $("tbody tr").each(function(index) {
    $cells = $(this).find("td");
    myRows[index] = {};
    $cells.each(function(cellIndex) {
        myRows[index][$($headers[cellIndex]).html()] = $(this).html();
        });    
    });*/
};

/**
 * Resize the editor and the underlying block to fit the text.
 * @private
 */
Blockly.FieldTable.prototype.resizeEditor_ = function() {
  var div = Blockly.WidgetDiv.DIV;
  var bBox = this.fieldGroup_.getBBox();
  var htmlInput = Blockly.FieldTable.htmlInput_;
  //div.style.width = bBox.width + 'px';
  if (htmlInput.clientHeight < htmlInput.scrollHeight) {
    div.style.width = (bBox.width) + 'px';
  } else {
    div.style.width = bBox.width + 'px';
  }
  div.style.height = bBox.height + 'px';
  // Position the editor
  var xy = this.getAbsoluteXY_();
  // In RTL mode block fields and LTR input fields the left edge moves,
  // whereas the right edge is fixed.  Reposition the editor.
  if (this.sourceBlock_.RTL) {
    var borderBBox = this.borderRect_.getBBox();
    xy.x += borderBBox.width;
    xy.x -= div.offsetWidth;
  }
  // Shift by a few pixels to line up exactly.
  xy.y += 1;
  if (goog.userAgent.WEBKIT) {
    xy.y -= 3;
  }
  div.style.left = xy.x + 'px';
  div.style.top = xy.y + 'px';
};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTable.prototype.widgetDispose_ = function() {
  var thisField = this;
  return function() {
    var htmlInput = Blockly.FieldTable.htmlInput_;
    // Save the edit (if it validates).
    var text = htmlInput.value;
    if (thisField.changeHandler_) {
      text = thisField.changeHandler_(text);
      if (text === null) {
        // Invalid edit.
        text = htmlInput.defaultValue;
      }
    }
    thisField.setText(text);
        thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
    Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
    Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
    Blockly.FieldTable.htmlInput_ = null;
    // Delete the width property.
    Blockly.WidgetDiv.DIV.style.width = 'auto';
  };
};