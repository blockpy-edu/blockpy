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
function Kennel(attachmentPoint, toolbox, console) {    
    // The weightQueue will prevents spamming of updates
    this._textUpdateQueue = new WaitQueue();
    this._blocklyUpdateQueue = new WaitQueue();
    
    // The Div or whatever HTML element we attach everything to
    this._attachmentPoint = attachmentPoint;
    
    this._loadMain();
    this._loadBlockly(toolbox);
    this._loadText();
    this._loadConverter();
    this._loadConsole();
    
    // Default mode when you open the screen is blocks
    this._mode = 'blocks';
};

Kennel.prototype.getPythonFromBlocks = function() {
    return Blockly.Python.workspaceToCode(this._blockly);
}

Kennel.prototype._updateText = function() {
    var code = this.getPythonFromBlocks();
    this._text.setValue(code);
}

Kennel.prototype._updateBlocks = function() {
    var backupXML = this.getXml();
    var error = true;
    try {
        var code = this._text.getValue();
        var xml = this._converter.convert(code);
        var blocklyXML = Blockly.Xml.textToDom(xml);
        this._blockly.clear();
        Blockly.Xml.domToWorkspace(this._blockly, blocklyXML);
        this._blockly.align();
        error = false;
    } catch (e) {
        this.printError(e);
    }
    if (error) {
        this._blockly.clear();
        Blockly.Xml.domToWorkspace(this._blockly, backupXML);
    }
}

/**
 * Aligns all the blocks vertically
 */
Kennel.prototype.alignBlocks = function() {
    this._blockly.align();
}

/**
 * Clear out the text 
 */
Kennel.prototype.clear = function() {
    this._blockly.clear();
};

Kennel.prototype.metrics_editor_height = '60%';

Kennel.prototype.changeMode = function() {
    if (this._mode == 'blocks') {
        this._mode = 'text';
        this._updateText();
        $(this._text.getWrapperElement()).show().css('height', this.metrics_editor_height);
        this._blockly.setVisible(false);
        $(this._mainDiv).find('.kennel-blocks').css('height', '0%');
        this._text.setSize(null, '100%'); //this.metrics_editor_height);
        $(this._mainDiv).find('.kennel-text-guide').css('width', this._blockly.toolbox_.width+'px');
        this._text.refresh();
    } else {
        this._mode = 'blocks';
        this._updateBlocks();
        $(this._text.getWrapperElement()).hide().css('height', '0%');
        this._blockly.setVisible(true);
        $(this._mainDiv).find('.kennel-blocks').css('height', this.metrics_editor_height);
    }
}

Kennel.prototype._loadMain = function() {
    var mainTabs = "<div class='kennel-content' style='height:100%'>"+
                        "<div class='kennel-header'>"+
                            "The tool below is from Virginia Tech's Software Innovations Lab. By Austin Cory Bart, Dennis Kafura, Eli Tilevich, and Clifford A. Shaffer. Interested in this project as it develops? Get in touch with <a href='mailto:acbart@vt.edu'>acbart@vt.edu</a>. Help us think of a name for it! "+
                            "<button class='kennel-change-mode'>Change Mode</button>"+
                        "</div>"+
                        "<div class='kennel-blocks'"+
                              "style='height:"+this.metrics_editor_height+"'>"+
                              "<div class='blockly-div' style='position: absolute'></div>"+
                              "<div class='blockly-area' style='height:100%'></div>"+
                        "</div>"+
                        "<div class='kennel-text' style='height:"+this.metrics_editor_height+"'>"+
                            /*"<div class='kennel-text-guide' style='height: 100%; float:left'>"+
                                "Some Text."+
                            "</div>"+*/
                            "<textarea class='language-python'"+
                                       "style='height:"+this.metrics_editor_height+
                                       "'>import weather</textarea>"+
                        "</div>"+
                        "<div class='kennel-console'>"+
                        "</div>"+
                        "<div class='kennel-trace'>"+
                        "</div>"+
                    "</div>";
    this._mainDiv = $(this._attachmentPoint).html($(mainTabs))
    
    var kennel = this;
    this._mainDiv.find('.kennel-change-mode').click(function() {kennel.changeMode()});
};

Kennel.prototype._loadBlockly = function(toolbox) {
    var blocklyDiv = this._mainDiv.find('.blockly-div')[0];
    var blocklyArea = this._mainDiv.find('.blockly-area')[0];
    this._blocklyDiv = blocklyDiv;
    this._blockly = Blockly.inject(blocklyDiv,
                                  {path: 'blockly/', 
                                  scrollbars: true, 
                                  toolbox: toolbox});
    var _kennel_instance = this;
    this._blockly.addChangeListener(function(event) {
        //TODO: saveUndo();
        $(_kennel_instance._attachmentPoint).trigger("blockly:update");
    });
    /*$(this._attachmentPoint).on("blockly:update", function() {
        // Have to wrap it in a function to prevent *this* mangling.
        _kennel_instance._blocklyUpdateQueue.add(function() {
            _kennel_instance._updateText()
        }, 1000);
    });*/
    var onResize = function(e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var element = blocklyArea;
        var x = 0;
        var y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        // Position blocklyDiv over blocklyArea.
        blocklyDiv.style.left = x + 'px';
        blocklyDiv.style.top = y + 'px';
        blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
        blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
    };
    window.addEventListener('resize', onResize, false);
    onResize();
};

Kennel.prototype._loadText = function() {
    var textCanvas = this._mainDiv.find('.kennel-text > textarea')[0];
    //var textCanvas = document.getElementById('python-output');
    this._text = CodeMirror.fromTextArea(textCanvas, {
                                        mode: { name: "python", 
                                                version: 3, 
                                                singleLineStringErrors: false
                                        },
                                        readOnly: false,
                                        lineNumbers: true,
                                        firstLineNumber: 1,
                                        indentUnit: 4,
                                        tabSize: 4,
                                        indentWithTabs: false,
                                        matchBrackets: true,
                                        extraKeys: {"Tab": "indentMore", 
                                                    "Shift-Tab": "indentLess"},
                                        //onKeyEvent: handleEdKeys
                                      });
    this._text.setSize(null, "200px");
    $(this._text.getWrapperElement()).hide();
    var _kennel_instance = this;
    /*this._text.on("change", function(codeMirror) {
        _kennel_instance._textUpdateQueue.add(function() {
            _kennel_instance._updateBlocks()
        }, 1100);
    });*/
    $('.kennel-content > .nav-tabs a').on('shown.bs.tab', function (e) {
        var contentDiv = $(e.target.attributes.href.value);
        contentDiv.find('.CodeMirror').each(function(i, el) {
            el.CodeMirror.refresh();
        });
    });
    /*this._text.on('cursorActivity', function(){
        var editor = _kennel_instance._text;
        var word = editor.findWordAt(editor.getCursor()); 
        var range = editor.getRange(word.anchor, word.head);
        _kennel_instance._mainDiv.find('.kennel-text-guide').html(range);
    });*/
};

Kennel.prototype._loadConverter = function() {
    this._converter = new PythonToBlocks();
}

function encodeHTML(text) {
    return text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&apos;');
}

/*
 * Resets skulpt to some default values
 */
Kennel.prototype._loadConsole = function() {
    this._console = this._mainDiv.find('.kennel-console')[0];
    //this._console = document.getElementById('html-output');
    var kennel = this;
    Sk.configure({
        // Function to handle the text outputted by Skulpt
        output: function(text) { kennel.print(text); },
        // Function to handle loading in new files
        read: function (filename) {
                    if (Sk.builtinFiles === undefined ||
                        Sk.builtinFiles["files"][filename] === undefined) {
                        throw "File not found: '" + filename + "'";
                    }
                    return Sk.builtinFiles["files"][filename];
                }
    });
    // Limit execution to 5 seconds
    Sk.execLimit = 5000;
    // Identify the location to put new charts
    Sk.matplotlibCanvas = this._console;
    Sk.pre = 'html-output';
}

/*
 * Print an error to the consoles -- the on screen one and the browser one
 */
Kennel.prototype.printError = function(error) {
    console.log(error);
    // Is it a string?
    if (typeof error !== "string") {
        // A weird skulpt thing?
        if (error.tp$str !== undefined) {
            error = error.tp$str().v;
        } else {
            // An error?
            error = ""+error.name + ": " + error.message;
            console.log(error.stack);
        }
    }
    // Perform any necessary cleaning
    this._console.innerHTML = this._console.innerHTML + encodeHTML(error);
}

/*
 * Print a successful line to the on-screen console.
 */
Kennel.prototype.print = function(text) {
    // Perform any necessary cleaning
    text = encodeHTML(text);
    // Append to the current text
    this._console.innerHTML = this._console.innerHTML + text;
}

Kennel.prototype.resetConsole = function() {
    this._console.innerHTML = "";
    var step = 0;
    var highlightMap = this.getHighlightMap();
    this.traceTable = [];
    var kennel = this;
    Sk.afterSingleExecution = function(variables, lineNumber, 
                                       columnNumber, filename) {
        if (filename == '<stdin>.py') {
            kennel.traceTable.push({'step': step, 
                                  'filename': filename,
                                  'block': highlightMap[lineNumber-1],
                                  'line': lineNumber,
                                  'column': columnNumber,
                                  'properties': kennel.parseGlobals(variables)});
            step += 1;
        }
    };
}

Kennel.prototype.parseGlobals = function(variables) {
    return {};
}

/*
 * Builds up an array indicating the relevant block ID for a given step.
 * Operates on the current this._blockly instance
 * It works by injecting __HIGHLIGHT__(id); at the start of every line of code
 *  and then extracting that with regular expressions. This makes it vulnerable
 *  if someone decides to use __HIGHLIGHT__ in their code. I'm betting on that
 *  never being a problem, though.
 */
Kennel.prototype.getHighlightMap = function() {
    // Protect the current STATEMENT_PREFIX
    var backup = Blockly.Python.STATEMENT_PREFIX;
    Blockly.Python.STATEMENT_PREFIX = '__HIGHLIGHT__(%1);';
    Blockly.Python.addReservedWords('__HIGHLIGHT__');
    // Get the source code, injected with __HIGHLIGHT__(id)
    var highlightedCode = Blockly.Python.workspaceToCode(this._blockly);
    Blockly.Python.STATEMENT_PREFIX = backup;
    // Build up the array by processing the highlighted code line-by-line
    var highlightMap = [];
    var lines = highlightedCode.split("\n");
    for (var i = 0; i < lines.length; i++) {
        // Get the block ID from the line
        var id = lines[i].match(/\W*__HIGHLIGHT__\(\'(.+?)\'\)/);
        if (id !== null) {
            // Convert it into a base-10 number, because JavaScript.
            highlightMap[i] = parseInt(id[1], 10);
        }
    }
    return highlightMap;
}

/*
 * Runs the given python code, resetting the console and Trace Table.
 */
Kennel.prototype.run = function() {
    var code = "";
    if (this._mode == 'blocks') {
        code = this._text.getValue();
    } else {
        code = this.getPythonFromBlocks();
    }
    if (code.trim() == "") {
        this.printError("Your canvas is currently blank.");
    }
    this.resetConsole();
    try {
        // Actually run the python code
        var module = Sk.importMainWithBody("<stdin>", false, code);
        // And run the afterSingleExecution one extra time to get final program state
        Sk.afterSingleExecution(module.$d);
    } catch (e) {
        console.log(e.stack);
        this.printError(e);
    }
    this.refreshTraceTable();
}

Kennel.prototype.refreshTraceTable = function() {
    if (this.traceTable === undefined) {
        return false;
    }
}

Kennel.prototype.getXml = function() {
    return Blockly.Xml.workspaceToDom(this._blockly);
}
          
Kennel.prototype.setXml = function(xml) {
    this._blockly.clear();
    Blockly.Xml.domToWorkspace(this._blockly, xml);
}

/**
 * @constructor
 * A class for managing delayed function calls so they combine
 */
function WaitQueue() {
    this.timeout = null;
}

/**
 * Adds the function to the timeout queue. If there's already a function
 *  triggered to run, then it gets rid of it.
 */
WaitQueue.prototype.add = function(aFunction, delay) {
    if (this.timeout !== null) {
        clearTimeout(this.timeout);
    }
    this.timeout = window.setTimeout(aFunction, delay);
}