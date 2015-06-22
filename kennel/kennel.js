/**
 * @license
 * Kennel
 *
 * Copyright 2015 Austin Cory Bart
 * https://github.com/RealTimeWeb/corgis-blockly
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
 * @fileoverview Main organization file for Kennel
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

/**
 * @constructor 
 */
function Kennel(attachment_point, toolbox) {    
    // The weightQueue will prevents spamming of updates
    this._textUpdateQueue = new WaitQueue();
    this._blocklyUpdateQueue = new WaitQueue();
    
    // The Div or whatever HTML element we attach everything to
    this._attachment_point = attachment_point;
    
    
    this._load_main();
    this._load_blockly(toolbox);
    this._load_text();
    
    // Default mode when you open the screen is blocks
    this._mode = 'blocks';
};

Kennel.prototype.ALIGNMENT_VERTICAL_SPACING = 20;

Kennel.prototype._update_text = function() {
    // TODO:
    blocklyToPython();
    var dom = Blockly.Xml.workspaceToDom(WB);
    $("#xml-output").text(Blockly.Xml.domToPrettyText(dom));
}

/**
 * Aligns all the blocks vertically
 */
Kennel.prototype.align_blocks = function() {
    var blocks = this._blockly.getTopBlocks();
    var y = 0;
    for (var i = 0; i < blocks.length; i++){
        var block = blocks[i];
        var properties = block.getRelativeToSurfaceXY()
        // 
        block.moveBy(-properties.x, -properties.y+y);
        // Move it by its height plus a buffer
        y += block.getHeightWidth().height + this.ALIGNMENT_VERTICAL_SPACING;
    }
}

/**
 * Clear out the text 
 */
Kennel.prototype.clear = function() {
    this._blockly.clear();
};

Kennel.prototype.change_mode = function() {
    if (this._mode == 'blocks') {
        this._mode = 'text';
    } else {
        this._mode = 'blocks';
    }
}

Kennel.prototype._load_main = function() {
    var main_tabs = "<div class='kennel-content' style='height:100%'>"+
                        "<div class='kennel-blocks'"+
                              "style='height:100%' id='blocks'>"+
                              "<div class='blockly-div' style='position: absolute'></div>"+
                              "<div class='blockly-area' style='height:100%'></div>"+
                        "</div>"+
                        "<div class='kennel-text' id='text'>"+
                            "<textarea class='language-python'>import weather</textarea>"+
                        "</div>"+
                    "</div>";
    this._main_div = $(this._attachment_point).html($(main_tabs))
};

Kennel.prototype._load_blockly = function(toolbox) {
    var blockly_div = this._main_div.find('.blockly-div')[0];
    var blockly_area = this._main_div.find('.blockly-area')[0];
    this._blockly = Blockly.inject(blockly_div,
                                  {path: 'blockly/', 
                                  scrollbars: true, 
                                  toolbox: toolbox});
    this._blockly.addChangeListener(function() {
        //TODO: saveUndo();
        $(this._attachment_point).trigger("blockly:update");
    });
    $(this._attachment_point).on("blockly:update", function() {
        this._textUpdateQueue.add(this._update_text, 0);
    });
    var onresize = function(e) {
        // Compute the absolute coordinates and dimensions of blockly_area.
        var element = blockly_area;
        var x = 0;
        var y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        // Position blockly_div over blockly_area.
        blockly_div.style.left = x + 'px';
        blockly_div.style.top = y + 'px';
        blockly_div.style.width = blockly_area.offsetWidth + 'px';
        blockly_div.style.height = blockly_area.offsetHeight + 'px';
    };
    window.addEventListener('resize', onresize, false);
    onresize();
};

Kennel.prototype._load_text = function() {
    //var text_canvas = this._main_div.find('.kennel-text > textarea')[0];
    var text_canvas = document.getElementById('python-output');
    this.text = CodeMirror.fromTextArea(text_canvas, {
                                        mode: { name: "python", version: 3, singleLineStringErrors: false },
                                        readOnly: false,
                                        lineNumbers: true,
                                        firstLineNumber: 1,
                                        indentUnit: 4,
                                        tabSize: 4,
                                        indentWithTabs: false,
                                        matchBrackets: true,
                                        extraKeys: {"Tab": "indentMore", "Shift-Tab": "indentLess"},
                                        //onKeyEvent: handleEdKeys
                                      });
    this.text.setSize(null, "100%");
    $('.kennel-content > .nav-tabs a').on('shown.bs.tab', function (e) {
        var content_div = $(e.target.attributes.href.value);
        content_div.find('.CodeMirror').each(function(i, el) {
            el.CodeMirror.refresh();
        });
    });
    this.text.setValue('import weather\nif test:\n    print "Hello"');
};

/**
 * @constructor
 * A class for managing delayed function calls so they combine
 */
function WaitQueue() {
    this.queue = [];
}

WaitQueue.prototype.add = function(a_function, delay) {
    this.queue.push(1);
    window.setTimeout(this._delayed_function(a_function), delay);
}

WaitQueue.prototype._delayed_function = function(a_function) {
    return function() {
        if (this.queue.length <= 1) {
            a_function();
        }
        this.queue.pop();
    };
}