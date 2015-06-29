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
function Kennel(attachmentPoint, toolbox, mode, presentation, current_code,
                on_run, on_change, starting_code) {
    // The weightQueue will prevents spamming of updates
    this._textUpdateQueue = new WaitQueue();
    this._blocklyUpdateQueue = new WaitQueue();
    
    // User programs
    this.model = {
        "settings": {
            'editor': 'blocks'
        },
        "programs": {"__main__": current_code},
        "feedback": {
            on_run: on_run, 
            on_change: on_change, 
            starting_code: starting_code
        },
        "presentation": presentation,
    };
    
    // The Div or whatever HTML element we attach everything to
    this._attachmentPoint = attachmentPoint;
    
    this._loadMain();
    this._loadBlockly(toolbox);
    this._loadText();
    this._loadConverter();
    this._loadConsole();
    this._loadExplorer();
    
    // Default mode when you open the screen is blocks
    this._mode = mode;
    
    $("#__main__").click();
};

Kennel.prototype._dirtyEditor = false;

Kennel.prototype.getPythonFromBlocks = function() {
    return Blockly.Python.workspaceToCode(this._blockly);
}

Kennel.prototype._updateText = function() {
    if (this._dirtyEditor) {
        var code = this.getPythonFromBlocks();
        this._text.setValue(code);
        this._dirtyEditor = false;
    }
}

Kennel.prototype._updateBlocks = function() {
    if (this._dirtyEditor) {
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
        this._dirtyEditor = false;
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

Kennel.prototype.metrics_editor_height = '100%';

Kennel.prototype.changeKennelMode = function() {
    if (this._mode == 'instructor') {
        // Make the presentation editable
        // Display the extra programs
        // Expose Teacher API
        // Extra Config options
    } else if (this._mode == 'student') {
        // Make the presentation read-only
        // Hide the extram programs
        // Hide the Teacher API
    } else if (this._mode == 'grade') {
    } else if (this._mode == 'public') {
        // Hide the feedback box
        // Hide the property explorer
        // Hide the toolbar
    }
}

Kennel.prototype.changeEditorMode = function() {
    if (this.model.settings.editor == 'blocks') {
        this.model.settings.editor = 'text';
        this._updateText();
        $(this._text.getWrapperElement()).show(); //.css('height', this.metrics_editor_height);
        $(this._mainDiv).find('.kennel-blocks').css('height', '0%');
        $(this._mainDiv).find('.kennel-text').css('height', this.metrics_editor_height);
        //this._text.setSize(null, '100%'); //this.metrics_editor_height);
        this._text.refresh();
        $(this._mainDiv).find('.kennel-change-mode').html('Change to Block View');
        this._blockly.setVisible(false);
    } else if (this.model.settings.editor == 'text') {
        this.model.settings.editor = 'blocks';
        this._updateBlocks();
        $(this._text.getWrapperElement()).hide();
        $(this._mainDiv).find('.kennel-text').css('height', '0%');
        $(this._mainDiv).find('.kennel-blocks').css('height', this.metrics_editor_height);
        $(this._mainDiv).find('.kennel-change-mode').html('Change to Text View');
        this._resetBlocklySize();
        this._blockly.setVisible(true);
    } else {
        console.error("Invalid mode:", this.model.settings.editor);
    }
}

Kennel.prototype._loadMain = function() {
    var mainTabs = ""+
    "<div class='kennel-content container-fluid'>"+
        "<div class='row'>"+
            "<div class='col-md-7 kennel-presentation'>"+
                this.model.presentation+
            "</div>"+
            "<div class='col-md-5' kennel-feedback'>"+
                "The tool below is from Virginia Tech's Software Innovations Lab. By Austin Cory Bart, Dennis Kafura, Eli Tilevich, and Clifford A. Shaffer. Interested in this project as it develops? Get in touch with <a href='mailto:acbart@vt.edu'>acbart@vt.edu</a>. Help us think of a name for it! "+
            "</div>"+
        "</div>"+
        "<div class='row'>"+
            "<div class='col-md-12 kennel-toolbar'>"+
                "<button class='btn btn-default kennel-change-mode'>Change to Text View</button>"+
                "<button class='btn btn-default kennel-run'>Run</button>"+
                "<button class='btn btn-default kennel-mode'>Instructor Mode</button>"+
                "<div class='btn-group kennel-programs' data-toggle='buttons'></div>"+
            "</div>"+
        "</div>"+
        "<div class='row'>"+
            "<div class='col-md-7 col-sm-7'>"+
                "<div class='kennel-editor'>"+
                    "<div class='kennel-blocks' "+
                         "style='height:"+this.metrics_editor_height+"'>"+
                        "<div class='blockly-div' style='position: absolute'></div>"+
                        "<div class='blockly-area' style='height:100%'></div>"+
                    "</div>"+
                    "<div class='kennel-text'>"+
                        "<textarea class='language-python'"+
                                   "style='height:"+this.metrics_editor_height+
                                   "'></textarea>"+
                    "</div>"+
                "</div>"+
            "</div>"+
            "<div class='col-md-5 col-sm-5'>"+
                "<div class='panel panel-default'>"+
                    "<div class='panel-heading'>Console</div>"+
                    "<div class='panel-body'>"+
                        "<div class='kennel-console'></div>"+
                    "</div>"+
                "<div class='panel panel-default'>"+
                    "<div class='panel-heading'>Explorer</div>"+
                    "<div class='panel-body'>"+
                    "<div class='kennel-explorer'>"+
                        "<table><tr>"+
                        // Step: X of Y (Line: Z)
                        "<td colspan='4'>"+
                            "<strong>Step: </strong>"+
                            "<span class='kennel-explorer-step-span'>0</span> of "+
                            "<span class='kennel-explorer-length-span'>0</span> "+
                            "(<strong>Line: </strong>"+
                            "<span class='kennel-explorer-line-span'>0</span>)"+
                        "</td>"+
                        "</tr><tr>"+
                        // First Previous Next Last
                        "<td style='width:25%'>"+
                            "<button type='button' class='btn btn-default kennel-explorer-first'>"+
                            "<span class='glyphicon glyphicon-fast-backward'></span> First</button>"+
                        "</td><td style='width:25%'>"+
                            "<button type='button' class='btn btn-default kennel-explorer-back'>"+
                            "<span class='glyphicon glyphicon-backward'></span> Back</button>"+
                        "</td><td style='width:25%'>"+
                            "<button type='button' class='btn btn-default kennel-explorer-next'>"+
                            "Next <span class='glyphicon glyphicon-forward'></span></button>"+
                        "</td><td style='width:25%'>"+
                            "<button type='button' class='btn btn-default kennel-explorer-last'>"+
                            "Last <span class='glyphicon glyphicon-fast-forward'></span> </button>"+
                        "</td>"+
                        "</tr></table>"+
                        // Actual Trace data
                        "<table style='width: 100%'"+
                                "class='table table-condensed table-striped "+
                                       "table-bordered table-hover kennel-explorer-table'>"+
                            // Property Type Value
                            "<tr>"+
                                "<th>Property</th>"+
                                "<th>Type</th>"+
                                "<th>Value</th>"+
                            "</tr>"+
                        "</table><br>"+
                        "Loaded Modules: <i class='kennel-explorer-modules'>None</i>"+
                    "</div>"+
                    "</div>"+
                "</div>"+
            "</div>"+
        "</div>"+
    "</div>";
    this._mainDiv = $(this._attachmentPoint).html($(mainTabs))
    
    var kennel = this;
    this._mainDiv.find('.kennel-change-mode').click(function() {kennel.changeEditorMode()});
    this._mainDiv.find('.kennel-mode').click(function() {kennel.changeKennelMode()});
    this._mainDiv.find('.kennel-run').click(function() {kennel.run()});
    
    var _programTabs = this._mainDiv.find('.kennel-programs');
    var addTab = function(name, code) {
        _programTabs.append("<label class='btn btn-default'>"+
                                "<input type='radio' id='"+name+"' "+
                                        "data-name='"+name+"' autocomplete='off'>"+
                                        name+
                                "</label>");
    }
    for (var name in this.model.programs) {
        addTab(name, this.model.programs[name]);
    }
    for (var name in this.model.feedback) {
        addTab(name, this.model.feedback[name]);
    }
    _programTabs.button('toggle').change(function(event) {
        var name = $(event.target).attr("data-name");
        kennel.setPythonFromText(kennel.model.programs[name]);
        if (kennel.model.settings.editor == 'blocks') {
            kennel._updateBlocks();
        }
    });
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
    this._blockly.addChangeListener(function() {
        _kennel_instance._dirtyEditor = true;
    });
    this._resetBlocklySize = function(e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var element = blocklyArea;
        var x = 0;
        var y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
            element = null;
        } while (element);
        // Position blocklyDiv over blocklyArea.
        blocklyDiv.style.left = x + 'px';
        blocklyDiv.style.top = y + 'px';
        blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
        blocklyDiv.style.height = blocklyArea.offsetHeight + 'px';
        //_kennel_instance._blockly.render();
    };
    window.addEventListener('resize', this._resetBlocklySize, false);
    this._resetBlocklySize();
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
    var kennel = this;
    this._text.on("change", function(cm, change) {
        kennel._dirtyEditor = true;
    });
    this._text.setSize(null, "100%");
    $(this._text.getWrapperElement()).hide();
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
}

Kennel.prototype._loadExplorer = function() {
    this._explorer = this._mainDiv.find('.kennel-explorer');
    var explorer = this._explorer;
    this._explorerPage = 0;
    this._explorerElementsFirst = explorer.find('.kennel-explorer-first');
    this._explorerElementsBack = explorer.find('.kennel-explorer-back');
    this._explorerElementsNext = explorer.find('.kennel-explorer-next');
    this._explorerElementsLast = explorer.find('.kennel-explorer-last');
    this._explorerElementsStep = explorer.find('.kennel-explorer-step-span');
    this._explorerElementsLength = explorer.find('.kennel-explorer-length-span');
    this._explorerElementsLine = explorer.find('.kennel-explorer-line-span');
    this._explorerElementsTable = explorer.find('.kennel-explorer-table');
    this._explorerElementsModules = explorer.find('.kennel-explorer-modules');
}

Kennel.prototype.reloadExplorer = function(page) {
    var kennel = this;
    // Fix the current page
    var traceTable = this.traceTable;
    var last = traceTable.length-1;
    if (page < 0) {
        page = last + page + 1;
    }
    if (page > last) {
        page = last;
    }
    // Activate tracing in blockly
    this._blockly.traceOn(true);
    // Clear out any existing data
    this._explorerElementsTable.find("tr:gt(0)").remove();
    // Update the VCR Controls
    this._explorerElementsFirst.prop('disabled', page == 0);
    this._explorerElementsBack.prop('disabled', page == 0);
    this._explorerElementsNext.prop('disabled', page == last);
    this._explorerElementsLast.prop('disabled', page == last);
    if (page > 0) {
        this._explorerElementsFirst.unbind('click')
                                   .click(function() {
                                       kennel.reloadExplorer(0);
                                   });
        this._explorerElementsBack.unbind('click')
                                   .click(function() {
                                       kennel.reloadExplorer(Math.max(0, page-1));
                                   });
    }
    if (page < last) {
        this._explorerElementsNext.unbind('click')
                                   .click(function() {
                                       kennel.reloadExplorer(Math.min(last, page+1));
                                   });
        this._explorerElementsLast.unbind('click')
                                   .click(function() {
                                       kennel.reloadExplorer(last);
                                   });
    }
    this._explorerElementsStep.html(page+1);
    this._explorerElementsLength.html(last+1);
    $(this._console).find('.kennel-console-output').each(function() {
        if ($(this).attr("data-step")-1 <= page) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
    // If we have data
    if (traceTable[page] === undefined) {
        this._explorerElementsTable.append($("<tr><td colspan='3'>No data found at this step!</td></tr>"));
    } else {
        // Update header row
        var line = traceTable[page]['line'];
        this._explorerElementsLine.html(line);
        this.highlightLine(line-1);
        // Highlight relevant block
        var block_id = traceTable[page]['block'];
        if (block_id) {
            this._blockly.highlightBlock(block_id);
        }
        function renderVisualizerRow(property, value) {
            return $("<tr/>").append($("<td/>").text(value['name']))
                             .append($("<td/>").text(value['type']))
                             .append($("<td/>").text(value['value']));
        }
        // Render the properties
        for (var property in traceTable[page]['properties']) {
            var value = traceTable[page]['properties'][property];
            var row = renderVisualizerRow(property, value);
            this._explorerElementsTable.append(row);
        }
        if (traceTable[page]['modules'].length > 0) {
            this._explorerElementsModules.html(traceTable[page]['modules'].join(', '));
        } else {
            this._explorerElementsModules.html("None");
        }
    }
}

Kennel.prototype._previousLine = null;
Kennel.prototype.highlightLine = function(line) {
    if (this._previousLine !== null) {
        this._text.removeLineClass(this._previousLine, 'text', 'editor-active-line');
    }
    this._text.addLineClass(line, 'text', 'editor-active-line');
    this._previousLine = line;
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
    if (text !== "\n") {
        text = encodeHTML(text);
        text = $("<samp data-toggle='tooltip' data-placement='right' "+
                     "class='kennel-console-output' data-step='"+this.step+"' "+
                     "title='Step "+this.step+", Line "+this.stepLineMap[this.step-1]+"'>"+
                text+
               "</samp>");
        // Append to the current text
        $(this._console).append(text).append("<br>");
        text.tooltip();
    }
}

Kennel.prototype.resetConsole = function() {
    this._console.innerHTML = "";
    this.step = 0;
    var highlightMap = this.getHighlightMap();
    this.traceTable = [];
    this.stepLineMap = [];
    var kennel = this;
    Sk.afterSingleExecution = function(variables, lineNumber, 
                                       columnNumber, filename, astType, ast) {
        if (filename == '<stdin>.py') {
            var globals = kennel.parseGlobals(variables);
            kennel.traceTable.push({'step': kennel.step, 
                                  'filename': filename,
                                  'block': highlightMap[lineNumber-1],
                                  'line': lineNumber,
                                  'column': columnNumber,
                                  'properties': globals["properties"],
                                  'modules': globals["modules"]});
            kennel.step += 1;
            kennel.stepLineMap.push(lineNumber);
        }
    };
}

Kennel.prototype.parseGlobals = function(variables) {
    var result = Array();
    var modules = Array();
    for (var property in variables) {
        var value = variables[property];
        if (property !== "__name__") {
            property = property.replace('_$rw$', '')
                               .replace('_$rn$', '');
            var parsed = this.parseValue(property, value);
            if (parsed !== null) {
                result.push(parsed);
            } else if (value.constructor == Sk.builtin.module) {
                modules.push(value.$d.__name__.v);
            }
        }
    }
    return {"properties": result, "modules": modules};
}

Kennel.prototype.parseValue = function(property, value) {
    switch (value.constructor) {
        case Sk.builtin.func:
            return {'name': property,
                    'type': "Function",
                    "value":  
                        (value.func_code.co_varnames !== undefined ?
                         " Arguments: "+value.func_code.co_varnames.join(", ") :
                         ' No arguments')
                    };
        case Sk.builtin.module: return null;
        case Sk.builtin.str:
            return {'name': property,
                'type': "String",
                "value": value.$r().v
            };
        case Sk.builtin.none:
            return {'name': property,
                'type': "None",
                "value": "None"
            };
        case Sk.builtin.bool:
            return {'name': property,
                'type': "Boolean",
                "value": value.$r().v
            };
        case Sk.builtin.nmber:
            return {'name': property,
                'type': "int" == value.skType ? "Integer": "Float",
                "value": value.$r().v
            };
        case Sk.builtin.list:
            return {'name': property,
                'type': "List",
                "value": value.$r().v
            };
        case Sk.builtin.dict:
            return {'name': property,
                'type': "Dictionary",
                "value": value.$r().v
            };
        case Number:
            return {'name': property,
                'type': value % 1 === 0 ? "Integer" : "Float",
                "value": value
            };
        case String:
            return {'name': property,
                'type': "String",
                "value": value
            };
        case Boolean:
                return {'name': property,
                    'type': "Boolean",
                    "value": (value ? "True": "False")
                };
        default:
            return {'name': property,
                    'type': value.$r().v,
                    "value": value.$r().v
                    };
    }
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
    this._updateBlocks();
    var code = "";
    if (this.model.settings.editor == 'blocks') {
        code = this.getPythonFromBlocks();
    } else {
        code = this.getPythonFromText();
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
    this.reloadExplorer(-1);
}

Kennel.prototype.getXml = function() {
    return Blockly.Xml.workspaceToDom(this._blockly);
}
          
Kennel.prototype.setXml = function(xml) {
    this._blockly.clear();
    Blockly.Xml.domToWorkspace(this._blockly, xml);
}

Kennel.prototype.getPythonFromText = function() {
    return this._text.getValue();
}
          
Kennel.prototype.setPythonFromText = function(text) {
    this._text.setValue(text);
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