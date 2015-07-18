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

function KennelPresentation(set, get, tag) {
    this.tag = $(tag);
    this.set = set;
    this.get = get;   
    this.mode = "read";
}

KennelPresentation.prototype.closeEditor = function() {
    this.tag.destroy();
};

KennelPresentation.prototype.startEditor = function() {
    var kennelPresentation = this;
    this.tag.summernote({
        codemirror: { // codemirror options
            theme: 'monokai'
        },
        onChange: kennelPresentation.set,
    });
    this.tag.code(this.get());
    
};

function PropertyExplorer(stepConsole, stepEditor, tag) {
    this.stepConsole = stepConsole;
    this.stepEditor = stepEditor;
    this.tag = tag;
    this.tags = {
        "message": tag.find('.kennel-explorer-run-hide'),
        "errors": tag.find('.kennel-explorer-errors'),
        "first": tag.find('.kennel-explorer-first'),
        "back": tag.find('.kennel-explorer-back'),
        "next": tag.find('.kennel-explorer-next'),
        "last": tag.find('.kennel-explorer-last'),
        "step": tag.find('.kennel-explorer-step-span'),
        "length": tag.find('.kennel-explorer-length-span'),
        "line": tag.find('.kennel-explorer-line-span'),
        "table": tag.find('.kennel-explorer-table'),
        "modules": tag.find('.kennel-explorer-modules')
    };
    this.tags.first.prop("disabled", true);
    this.tags.back.prop("disabled", true);
    this.tags.next.prop("disabled", true);
    this.tags.last.prop("disabled", true);
    this.tags.errors.hide();
}

PropertyExplorer.prototype.move = function(step) {
    // Fix the current step
    var last = this.traceTable.length-1;
    if (step < 0) {
        step = last + step + 1;
    }
    if (step > last) {
        step = last;
    }
    // Update the VCR Controls
    this.tags.first.prop('disabled', step == 0);
    this.tags.back.prop('disabled', step == 0);
    this.tags.next.prop('disabled', step == last);
    this.tags.last.prop('disabled', step == last);
    // Unbind/bind the VCR controls functions
    var explorer = this;
    if (step > 0) {
        var back = Math.max(0, step-1);
        this.tags.first.off('click').click(function() {explorer.move(0)});
        this.tags.back.off('click').click(function() {explorer.move(back)});
    }
    if (step < last) {
        var next = Math.min(last, step+1);
        this.tags.last.off('click').click(function() {explorer.move(last)});
        this.tags.next.off('click').click(function() {explorer.move(next)});
    }
    // Update the header bar of the explorer
    this.tags.step.html(step+1);
    this.tags.length.html(last+1);
    this.clear();
    // Get the page of the traceTable at this step
    var page = this.traceTable[step];
    if (page === undefined) {
        this.tags.table.append("<tr><td colspan='3'>No data found at this step!</td></tr>");
        return;
    }
    // Update the modules list
    if (page.modules.length > 0) {
        this.tags.modules.html(page.modules.join(', '));
    } else {
        this.tags.modules.html("None");
    }
    // Update header row
    this.tags.line.html(page.line==-1 ? "Last": page.line);
    // Notify the console and editor of the new step
    this.stepConsole(step, page);
    this.stepEditor(step, page);
    // Render the properties
    for (var property in page.properties) {
        var value = page.properties[property];
        this.tags.table.append(
            $("<tr/>").append($("<td/>").text(value.name))
                      .append($("<td/>").text(value.type))
                      .append('<td><samp>'+value.value+'</samp></td>'));
    }
};

/*
 * Clear out any existing data
 */
PropertyExplorer.prototype.clear = function() {
    this.tags.table.find("tr:gt(0)").remove();
}

PropertyExplorer.prototype.reload = function(traceTable) {
    this.traceTable = traceTable;
    this.move(-1);
    this.tags.message.hide();
}

function KennelEditor(printError, setModel, getModel, setSettings, getSettings, toolbox, blockTag, textTag) {
    this.printError = printError;
    this.setModel = setModel;
    this.getModel = getModel;
    this.setSettings = setSettings;
    this.getSettings = getSettings;
    this.converter = new PythonToBlocks();
    this.loadBlockly(toolbox, blockTag);
    this.loadText(textTag);
    this.setMode(getSettings());
}

KennelEditor.prototype.loadBlockly = function(toolbox, tag) {
    this.blockTag = tag;
    this.toolbox = toolbox;
    this.blocklyDiv = tag.find('.blockly-div');
    this.blocklyArea = tag.find('.blockly-area');
    this.blockly = Blockly.inject(this.blocklyDiv[0],
                                   {path: 'blockly/', 
                                    scrollbars: true, 
                                    toolbox: toolbox});
    // Activate tracing in blockly
    this.blockly.traceOn(true);
    var editor = this;
    // Register model changer
    this.blockly.addChangeListener(function() {
        editor.setModel(editor.getPythonFromBlocks());
    });
    // Register window size changes for Blockly
    window.addEventListener('resize', function() {
        editor.resizeBlockly()
    }, false);
    this.resizeBlockly();
};

KennelEditor.prototype.updateToolbox = function() {
    this.blockly.updateToolbox(this.toolbox);
}

KennelEditor.prototype.resizeBlockly = function(e) {
    // Compute the absolute coordinates and dimensions of blocklyArea.
    if ($(document).width() < 900) {
        
    }
    var element = this.blocklyArea[0];
    var x = 0;
    var y = 0;
    do {
        x += element.offsetLeft;
        y += element.offsetTop;
        element = element.offsetParent;
        element = null;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    this.blocklyDiv[0].style.left = x + 'px';
    this.blocklyDiv[0].style.top = y + 'px';
    this.blocklyDiv[0].style.width = this.blocklyArea[0].offsetWidth + 'px';
    this.blocklyDiv[0].style.height = this.blocklyArea[0].offsetHeight + 'px';
    this.blockly.resize();
}

KennelEditor.prototype.loadText = function(tag) {
    this.textTag = tag;
    var textarea = tag.find('textarea');
    //var textCanvas = document.getElementById('python-output');
    this.text = CodeMirror.fromTextArea(textarea[0], {
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
                                      });
    var editor = this;
    this.text.on("change", function(cm, change) {
        editor.setModel(editor.getPythonFromText());
    });
    // Ensure that it fills the editor area
    this.text.setSize(null, "100%");
};

KennelEditor.prototype.changeMode = function() {
    if (this.getSettings() == "blocks") {
        this.setMode("text");
    } else {
        this.setMode("blocks");
    }
}

KennelEditor.prototype.setMode = function(mode) {
    // Either update the model, or go with the model's
    if (mode === undefined) {
        mode = this.getSettings();
    } else {
        this.setSettings(mode);
    }
    // Hide and show elements based on model
    if (mode == 'text') {
        // Update the text model from the blocks
        this.updateText();
        // Hide the blocks menu
        this.blockTag.css('height', '0%');
        this.blockly.setVisible(false);
        // Show the text menu
        this.textTag.css('height', '100%');
        $(this.text.getWrapperElement()).show();
        // Refresh the CodeMirror instance to prevent graphical glitches
        this.text.refresh();
    } else if (mode == 'blocks') {
        // Update the blocks model from the text
        this.updateBlocks();
        // Hide the text menu
        this.textTag.css('height', '0%');
        $(this.text.getWrapperElement()).hide();
        // Show the blocks menu
        this.blockTag.css('height', '100%');
        this.resizeBlockly();
        this.blockly.setVisible(true);
    } else {
        console.error("Invalid mode:", mode);
    }
}

KennelEditor.prototype.getPythonFromBlocks = function() {
    return Blockly.Python.workspaceToCode(this.blockly);
}

KennelEditor.prototype.getPythonFromText = function() {
    return this.text.getValue();
}
          
KennelEditor.prototype.setPython = function(text) {
    this.text.setValue(text);
    if (this.getSettings() == 'blocks') {
        this.updateBlocks();
    }
}

KennelEditor.prototype.updateText = function() {
    var code = this.getModel();//this.getPythonFromBlocks();
    console.log(code);
    if (code == "") {
        this.text.setValue("\n");
    } else {
        this.text.setValue(code);
    }
}

KennelEditor.prototype.updateBlocks = function() {
    // Make a backup of the current state
    var backupXml = this.getBlocksFromXml();
    try {
        // Try to convert it!
        var code = this.getModel(); //this.text.getValue();
        var result = this.converter.convert(code);
        var xml = result.xml;
        if (result.error !== null) {
            console.error(result.errors);
        }
        var blocklyXml = Blockly.Xml.textToDom(xml);
        this.setBlocksFromXml(blocklyXml);
        this.blockly.align();
    } catch (e) {
        this.printError(e);
        console.error(e);
        this.setBlocksFromXml(backupXml);
    }
}

KennelEditor.prototype.getBlocksFromXml = function() {
    return Blockly.Xml.workspaceToDom(this.blockly);
}
          
KennelEditor.prototype.setBlocksFromXml = function(xml) {
    this.blockly.clear();
    Blockly.Xml.domToWorkspace(this.blockly, xml);
}

KennelEditor.prototype.previousLine = null;
KennelEditor.prototype.highlightLine = function(line) {
    if (this.previousLine !== null) {
        this.text.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.text.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.text.addLineClass(line, 'text', 'editor-active-line');
    this.previousLine = line;
}
KennelEditor.prototype.highlightError = function(line) {
    if (this.previousLine !== null) {
        this.text.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.text.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.text.addLineClass(line, 'text', 'editor-error-line');
    this.previousLine = line;
}
KennelEditor.prototype.highlightBlock = function(block) {
    this.blockly.highlightBlock(block);
}

function KennelFeedback(tag) {
    this.tag = tag;
};

KennelFeedback.prototype.error = function(html) {
    this.tag.html(html);
    this.tag.removeClass("alert-success");
    this.tag.addClass("alert-warning");
}

KennelFeedback.prototype.success = function() {
    this.tag.html("Success!");
    this.tag.removeClass("alert-warning");
    this.tag.addClass("alert-success");
}

function KennelToolbar(tag) {
    this.tag = tag;
    this.elements = {
        'editor_mode': this.tag.find('.kennel-change-mode'),
        'kennel_mode': this.tag.find('.kennel-mode'),
        'run': this.tag.find('.kennel-run'),
        'programs': this.tag.find('.kennel-programs')
    };    
    this.elements.programs.hide();
}

KennelToolbar.prototype.addProgram = function(name) {
    this.elements.programs.append("<label class='btn btn-default'>"+
                                    "<input type='radio' id='"+name+"' "+
                                      "data-name='"+name+"' autocomplete='off'>"+
                                        name+
                                   "</label>");
}

KennelToolbar.prototype.showPrograms = function() {
    this.elements.programs.show();
}

KennelToolbar.prototype.hidePrograms = function() {
    this.elements.programs.hide();
}
    

/**
 * @constructor 
 */
function Kennel(attachmentPoint, toolbox, mode, presentation, current_code,
                on_run, on_change, starting_code, instructor, view) {
    // User programs
    this.model = {
        "settings": {
            'editor': view,
            'instructor': instructor,
            'program': "__main__"
        },
        "programs": {
            "__main__": current_code,
            "on_run": on_run, 
            "on_change": on_change, 
            "starting_code": starting_code
        },
        "presentation": presentation,
    };
    
    // Default mode when you open the screen is instructor
    this.mode = mode;
    
    // The Div or whatever HTML element we attach everything to
    this.attachmentPoint = attachmentPoint;
    
    this.loadMain();
    var kennel = this;
    
    // Add the Feedback block (unused)
    this.feedback = new KennelFeedback(this.mainDiv.find('.kennel-feedback'));
    
    // Initialize the toolbar so other things can refer to it
    this.toolbar = new KennelToolbar(this.mainDiv.find('.kennel-toolbar'));
    
    // Add the Property Explorer
    this.explorer = new PropertyExplorer(
        function(step, page) { 
            kennel.stepConsole(step);
        },
        function(step, page) { 
            kennel.editor.highlightLine(page.line-1);
            if (page.block) {
                kennel.editor.highlightBlock(page.block);
            } else {
                kennel.editor.highlightBlock(null);
            }
        },
        kennel.mainDiv.find('.kennel-explorer')
    );
    
    // Initialize the editor.
    this.model.get = function() {
        return kennel.model.programs[kennel.model.settings.program];
    }
    this.model.set = function(content) {
        localStorage.setItem('__main__', content);
        kennel.model.programs[kennel.model.settings.program] = content;
    }
    this.editor = new KennelEditor(
        function(e) {kennel.printError(e); },
        function(content) {  kennel.model.set(content); },
        function() { return kennel.model.get(); },
        function(new_editor) { kennel.model.settings.editor = new_editor; },
        function() { return kennel.model.settings.editor; },
        toolbox,
        this.mainDiv.find('.kennel-blocks'),
        this.mainDiv.find('.kennel-text')
    );
    this.loadConsole();
    
    // Add the presentation block
    this.presentation = new KennelPresentation(
        function(content) { 
            kennel.model.presentation = content;
            kennel.editor.blockly.resize();
        },
        function() { return kennel.model.presentation; },
        kennel.mainDiv.find('.kennel-presentation')
    );
    
    // Add events to the toolbar
    this.toolbar.elements.editor_mode.click(function() {
        $(this).html("To "+kennel.model.settings.editor);
        kennel.editor.changeMode();
    });
    this.toolbar.elements.kennel_mode.click(function() {
        kennel.changeKennelMode();
    });
    this.toolbar.elements.run.click(function() {
        kennel.run();
    });
    for (var name in this.model.programs) {
        this.toolbar.addProgram(name);
    }
    this.toolbar.elements.programs.button('toggle').change(function(event) {
        if (kennel.silentChange_) {
            kennel.silentChange_ = false;
        } else {
            var name = $(event.target).attr("data-name");
            kennel.changeProgram(name);
        }
    });
    
    this.changeProgram('__main__');
};

Kennel.prototype.metrics_editor_height = '100%';

Kennel.prototype.setCode = function(code, name) {
    if (name === undefined) {
        name = "__main__";
    }
    this.model.programs[name] = code;
    this.editor.setPython(code);
}

Kennel.prototype.changeKennelMode = function() {
    if (this.mode == 'instructor') {
        this.presentation.startEditor();
        // Make the presentation editable
        // Display the extra programs
        this.toolbar.showPrograms();
        // Expose Teacher API
        this.editor.resizeBlockly();
        // Extra Config options
        this.mode = "student";
    } else if (this.mode == 'student') {
        this.presentation.closeEditor();
        // Make the presentation read-only
        // Hide the extra programs
        this.toolbar.hidePrograms();
        this.changeProgram('__main__');
        // Hide the Teacher API
        this.editor.resizeBlockly();
        // Show the __main__ program
        this.mode = "instructor";
    } else if (this.mode == 'grade') {
    } else if (this.mode == 'public') {
        // Hide the feedback box
        // Hide the property explorer
        // Hide the toolbar
    }
}

Kennel.prototype.changeProgram = function(name) {
    this.silentChange_ = true;
    this.model.settings.program = name;
    this.editor.setPython(this.model.programs[name]);
    this.toolbar.elements.programs.find("[data-name="+name+"]").click();
}

Kennel.prototype.loadMain = function() {
    var mainTabs = ""+
    "<div class='kennel-content container-fluid'>"+
        "<div class='row'>"+
            "<div class='col-md-7 col-sm-7 alert alert-warning'>"+
                "<fieldset>"+
                    "<legend>BlockPy/Kennel/Silicon</legend>"+
                "</fieldset>"+
                "<div class='kennel-presentation'>"+
                    this.model.presentation+
                "</div>"+
                "<strong>Feedback:</strong> <span class='kennel-feedback'></span>"+
                "<div class='kennel-toolbar btn-toolbar' role='toolbar'>"+
                    "<button class='btn btn-default kennel-change-mode'>To text</button>"+
                    "<button class='btn btn-default kennel-run'>Run</button>"+
                    (this.model.settings.instructor ? "<button class='btn btn-default kennel-mode'>Instructor Mode</button>" : "") +
                    "<div class='btn-group kennel-programs' data-toggle='buttons'></div>"+
                "</div>"+
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
            "<div class='col-md-5 col-sm-5 alert alert-info'>"+
                "<div class='panel panel-default'>"+
                    "<div class='panel-heading'>Data Explorer</div>"+
                    "<div class='panel-body'>"+
                    "<div class='kennel-explorer'>"+
                        "<table><tr>"+
                        // Step: X of Y (Line: Z)
                        "<td colspan='4'>"+
                            "<div class='kennel-explorer-run-hide'>"+
                                "<i>Run your code to explore it.</i>"+
                            "</div>"+
                            "<div class='kennel-explorer-errors alert alert-danger' role='alert'>"+
                            "</div>"+
                            "<div class='kennel-explorer-status'>"+
                                "<strong>Step: </strong>"+
                                "<span class='kennel-explorer-step-span'>0</span> of "+
                                "<span class='kennel-explorer-length-span'>0</span> "+
                                "(<strong>Line: </strong>"+
                                "<span class='kennel-explorer-line-span'>0</span>)"+
                            "</div>"+
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
                        // Printer
                        "<br><strong>Printer</strong>"+
                        "<div class='kennel-console'></div>"+
                        // Modules
                        "<br><div>"+
                            "<strong>Loaded Modules: </strong>"+
                            "<i class='kennel-explorer-modules'>None</i>"+
                        "</div>"+
                        // Actual Trace data
                        "<br><strong>Trace Table</strong>"+
                        "<br><table style='width: 100%'"+
                                "class='table table-condensed table-striped "+
                                       "table-bordered table-hover kennel-explorer-table'>"+
                            // Property Type Value
                            "<tr>"+
                                "<th>Property</th>"+
                                "<th>Type</th>"+
                                "<th>Value</th>"+
                            "</tr>"+
                        "</table>"+
                    "</div>"+
                    "</div>"+
                "</div>"+
            "</div>"+
        "</div>"+
        "<div class='row'>"+
            "<div class='col-md-3 col-sm-3 col-xs-3'>"+
                "<img src='images/blockly-corgi-logo.png'  class='img-responsive' />"+
            "</div>"+
            "<div class='col-md-9 col-sm-9 col-xs-9'>"+
                "The tool above is from Virginia Tech's Software Innovations Lab. By Austin Cory Bart, Dennis Kafura, Eli Tilevich, and Clifford A. Shaffer. Interested in this project as it develops? Get in touch with <a href='mailto:acbart@vt.edu'>acbart@vt.edu</a>. Help us think of a name for it! "+
            "</div>"+
        "</div>"+
    "</div>";
    this.mainDiv = $(this.attachmentPoint).html($(mainTabs))
};

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
Kennel.prototype.loadConsole = function() {
    this.console = this.mainDiv.find('.kennel-console')[0];
    //this.console = document.getElementById('html-output');
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
    Sk.console = {
        'printHtml': function(html, value) {kennel.printHtml(html, value);},
        'width': $(this.console).width(),
        'height': $(this.console).height(),
        'console': this.console
    }
}

Kennel.prototype.stepConsole = function(step, page) {
    $(this.console).find('.kennel-console-output').each(function() {
        if ($(this).attr("data-step") <= step) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

/*
 * Print an error to the consoles -- the on screen one and the browser one
 */
Kennel.prototype.printError = function(error) {
    console.log(error);
    this.explorer.tags.errors.show();
    // Is it a string?
    if (typeof error !== "string") {
        // A weird skulpt thing?
        if (error.tp$str !== undefined) {
            try {
                this.editor.highlightError(error.args.v[2]-1);
            } catch (e) {
            }
            if (error.tp$name in EXTENDED_ERROR_EXPLANATION) {
                error = "<b>Error: </b>"+error.tp$str().v + "<br><br>"+EXTENDED_ERROR_EXPLANATION[error.tp$name];
            } else {
                error = error.tp$str().v;
            }
        } else {
            // An error?
            error = ""+error.name + ": " + error.message;
            console.log(error.stack);
        }
    }
    // Perform any necessary cleaning
    this.explorer.tags.errors.html(error);
}

/*
 * Print a successful line to the on-screen console.
 */
Kennel.prototype.print = function(text) {
    // Perform any necessary cleaning
    if (text !== "\n") {
        this.outputList.push(text);
        text = encodeHTML(text);
        text = $("<samp data-toggle='tooltip' data-placement='right' "+
                     "class='kennel-console-output' data-step='"+this.step+"' "+
                     "title='Step "+this.step+", Line "+this.stepLineMap[this.step-1]+"'>"+
                text+
               "</samp>");
        // Append to the current text
        $(this.console).append(text).append("<br>");
        text.tooltip();
    }
}

/*
 *
 * html: A blob of HTML to render in the tag
 * value: a value to push on the outputList for comparison
 */
Kennel.prototype.printHtml = function(chart, value) {
    this.outputList.push(value);
    var outerDiv = $(chart[0]);//.parent();
    outerDiv.parent().show();
    outerDiv.attr({
        "data-toggle": 'tooltip',
        "data-placement": 'right',
        //"data-container": '#'+chart.attr("id"),
        "class": "kennel-console-output",
        "data-step": this.step,
        "title": "Step "+this.step+", Line "+this.stepLineMap[this.step-1]
    });
    //outerDiv.parent().parent().append("<br>");
    //outerHtml.append($(html[0]));
    //var temp = d3.select(outerHtml[0]).append('svg');
    //temp.html(html.html());
    // Append to the current text
    //$(this.console).append(outerHtml);
    outerDiv.tooltip();
}

Kennel.prototype.resetConsole = function() {
    this.console.innerHTML = "";
    this.explorer.tags.errors.hide();
    this.step = 0;
    var highlightMap = this.getHighlightMap();
    this.traceTable = [];
    this.outputList = [];
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
        if (property !== "__name__" && property !== "__doc__") {
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
        case Sk.builtin.int_:
            return {'name': property,
                'type': "Integer",
                "value": value.$r().v
            };
        case Sk.builtin.float_:
            return {'name': property,
                'type': "Float",
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
 * Operates on the current this.blockly instance
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
    var highlightedCode = Blockly.Python.workspaceToCode(this.editor.blockly);
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
    this.editor.updateBlocks();
    var code = this.model.programs['__main__'];
    if (code.trim() == "") {
        this.printError("Your canvas is currently blank.");
    }
    this.resetConsole();
    // Actually run the python code
    var executionPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, code, true);
    });
    
    // Change "Run" to "Executing"
    this.toolbar.elements.run.prop('disabled', true);
    
    var kennel = this;
    executionPromise.then(
        function (module) {
            // Run the afterSingleExecution one extra time for final state
            Sk.afterSingleExecution(module.$d, -1, 0, "<stdin>.py");
            kennel.explorer.reload(kennel.traceTable, -1);
            // Handle checks
            kennel.check(code, kennel.traceTable, kennel.outputList);
            // Reenable "Run"
            kennel.toolbar.elements.run.prop('disabled', false);
        },
        function(error) {
            console.log(error.stack);
            kennel.printError(error);
            kennel.toolbar.elements.run.prop('disabled', false);
        }
    );
}

Kennel.prototype.check = function(student_code, traceTable, output) {
    var kennel = this;
    var on_run = this.model.programs['on_run'];
    if (on_run.trim() !== "") {
        var backupExecution = Sk.afterSingleExecution;
        Sk.afterSingleExecution = undefined;
        on_run += "\nresult = on_run('''"+student_code+"''', "+
                  JSON.stringify(traceTable)+", "+
                  "'''"+output+"'''"+
                  ")";
        var executionPromise = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, on_run, true);
        });
        executionPromise.then(
            function (module) {
                var result = Sk.ffi.remapToJs(module.$d.result);
                if (result === 1) {
                    kennel.feedback.success();
                } else {
                    kennel.feedback.error(result);
                }
                Sk.afterSingleExecution = backupExecution;
            }, function (error) {
                Sk.afterSingleExecution = backupExecution;
                kennel.feedback.error("Error in instructor's feedback. "+error);
                console.error(error);
            });
    }
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