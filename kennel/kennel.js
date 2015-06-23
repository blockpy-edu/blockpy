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
    
    // Prevent cascading conversions
    this._convertingText = false;
    this._convertingBlocks = true;
    
    this._loadMain();
    this._loadBlockly(toolbox);
    this._loadText();
    this._loadConverter();
    this._loadConsole();
    
    // Default mode when you open the screen is blocks
    this._mode = 'blocks';
};

Kennel.prototype._updateText = function() {
    console.log("Updating Text", this._convertingBlocks,this._convertingText);
    if (this._convertingBlocks) {
        this._convertingBlocks = false;
    } else {
        this._convertingText = true;
        var code = Blockly.Python.workspaceToCode(this._blockly);
        this.text.setValue(code);
    }
}

Kennel.prototype._updateBlocks = function() {
    console.log("Updating Blocks", this._convertingBlocks,this._convertingText);
    if (this._convertingText) {
        this._convertingText = false;
    } else {
        this._convertingBlocks = true;
        var backupXML = this.getXml();
        var error = true;
        try {
            var code = this.text.getValue();
            var xml = this._converter.convert(code);
            var blocklyXML = Blockly.Xml.textToDom(xml);
            console.log("Mockingjay", code);
            this._blockly.clear();
            var c2 = Blockly.Python.workspaceToCode(this._blockly);
            console.log("Hummingbird", c2);
            Blockly.Xml.domToWorkspace(this._blockly, blocklyXML);
            var c3 = Blockly.Python.workspaceToCode(this._blockly);
            console.log("SParrow", c3);
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

Kennel.prototype.changeMode = function() {
    if (this._mode == 'blocks') {
        this._mode = 'text';
    } else {
        this._mode = 'blocks';
    }
}

Kennel.prototype._loadMain = function() {
    var mainTabs = "<div class='kennel-content' style='height:100%'>"+
                        "<div class='kennel-blocks'"+
                              "style='height:100%' id='blocks'>"+
                              "<div class='blockly-div' style='position: absolute'></div>"+
                              "<div class='blockly-area' style='height:100%'></div>"+
                        "</div>"+
                        "<div class='kennel-text' id='text'>"+
                            "<textarea class='language-python'>import weather</textarea>"+
                        "</div>"+
                        "<div class='kennel-console' id='console'>"+
                        "</div>"+
                    "</div>";
    this._mainDiv = $(this._attachmentPoint).html($(mainTabs))
};

Kennel.prototype._loadBlockly = function(toolbox) {
    var blocklyDiv = this._mainDiv.find('.blockly-div')[0];
    var blocklyArea = this._mainDiv.find('.blockly-area')[0];
    this._blockly = Blockly.inject(blocklyDiv,
                                  {path: 'blockly/', 
                                  scrollbars: true, 
                                  toolbox: toolbox});
    var _kennel_instance = this;
    this._blockly.addChangeListener(function(event) {
        //TODO: saveUndo();
        $(_kennel_instance._attachmentPoint).trigger("blockly:update");
    });
    $(this._attachmentPoint).on("blockly:update", function() {
        // Have to wrap it in a function to prevent *this* mangling.
        _kennel_instance._blocklyUpdateQueue.add(function() {
            _kennel_instance._updateText()
        }, 1000);
    });
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
    //var textCanvas = this._main_div.find('.kennel-text > textarea')[0];
    var textCanvas = document.getElementById('python-output');
    this.text = CodeMirror.fromTextArea(textCanvas, {
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
    //this.text.setSize(null, "100%");
    var _kennel_instance = this;
    this.text.on("change", function(codeMirror) {
        _kennel_instance._textUpdateQueue.add(function() {
            _kennel_instance._updateBlocks()
        }, 1100);
    });
    $('.kennel-content > .nav-tabs a').on('shown.bs.tab', function (e) {
        var contentDiv = $(e.target.attributes.href.value);
        contentDiv.find('.CodeMirror').each(function(i, el) {
            el.CodeMirror.refresh();
        });
    });
};

Kennel.prototype._loadConverter = function() {
    this._converter = new PythonToBlocks();
}

/*
 * Resets skulpt to some default values
 */
Kennel.prototype._loadConsole = function() {
    //this._skulptConsole = this._main_div.find('.kennel-console')[0];
    this._console = document.getElementById('html-output');
    Sk.configure({
        // Function to handle the text outputted by Skulpt
        output: this.print,
        // Function to handle loading in new files
        read: function (filename) {
                    if (Sk.builtinFiles === undefined) {
                        throw new Error("Built-in files are not loaded!");
                    }
                    if (Sk.builtinFiles["files"][filename] === undefined) {
                        throw new Error("File not found: '" + filename + "'");
                    }
                    return Sk.builtinFiles["files"][filename];
                }
    });
    // Limit execution to 5 seconds
    Sk.execLimit = 5000;
    // Identify the location to put new charts
    Sk.matplotlibCanvas = this._console;
}


/*
 * Print an error to the consoles -- the on screen one and the browser one
 */
Kennel.prototype.printError = function(error) {
    console.log(error.stack);
    // Perform any necessary cleaning
    this._console.innerHTML = this._console.innerHTML + error.message;
}

/*
 * Print a successful line to the on-screen console.
 */
Kennel.prototype.print = function(text) {
    // Perform any necessary cleaning
    text = text.replace(/</g, '&lt;');
    this._console.innerHTML = this._console.innerHTML + text;
}

Kennel.prototype.resetConsole = function() {
    this._skulptConsole.innerHtml = "";
    var step = 0;
    var highlightMap = this.getHighlightMap();
    this.traceTable = [];
    Sk.afterSingleExecution = function(variables, lineNumber, 
                                       columnNumber, filename) {
        if (filename == '<stdin>.py') {
            this.traceTable.push({'step': step, 
                                  'filename': filename,
                                  'block': highlightMap[lineNumber-1],
                                  'line': lineNumber,
                                  'column': columnNumber,
                                  'properties': this.parseGlobals(variables)});
            step += 1;
        }
    };
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
Kennel.prototype.run = function(code) {
    this.resetConsole();
    var module;
    try {
        // Actually run the python code
        module = Sk.importMainWithBody("<stdin>", false, code);
        // And run the afterSingleExecution one extra time to get final program state
        Sk.afterSingleExecution(module.$d);
    } catch (e) {
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