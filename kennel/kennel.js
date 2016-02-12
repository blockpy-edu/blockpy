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
 
function randomInteger(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

function KennelStorage() {
    this.set =  function(directive, value) {
        localStorage.setItem("BLOCKPY_"+directive+"_value", value);
        localStorage.setItem("BLOCKPY_"+directive+"_timestamp", $.now());
    };
    this.remove = function(directive) {
        localStorage.removeItem("BLOCKPY_"+directive+"_value");
        localStorage.removeItem("BLOCKPY_"+directive+"_timestamp");
    };
    this.get = function(directive) {
        return localStorage.getItem("BLOCKPY_"+directive+"_value");
    };
    this.has = function(directive) {
        return localStorage.getItem("BLOCKPY_"+directive+"_value") !== null;
    };
    // Tests whether the server has the newer version
    this.is_new = function(directive, server_time) {
        var stored_time = localStorage.getItem("BLOCKPY_"+directive+"_timestamp");
        return (server_time >= stored_time+5000);
    };
}

 
 /**
 * @fileoverview Main organization file for Kennel
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

function KennelServer(model, kennel, alertBox) {
    this.model = model;
    this.kennel = kennel;
    this.alertBox = alertBox;
    
    // Add the LocalStorage connection
    this.storage = new KennelStorage();
    
    this.eventQueue = [];
    this.eventTimer = {};
    this.saveTimer = {};
    this.presentationTimer = null;
    
}

KennelServer.prototype.MAX_LOG_SIZE = 20;
KennelServer.prototype.LOG_DELAY = 4000;
KennelServer.prototype.SAVE_DELAY = 1000;

KennelServer.prototype.logEvent = function(event, action) {
    var filename = this.model.settings.program;
    var CURRENT_TIME = new Date();
    var data = {'event': event, 
                'action': action,
                'version': this.model.question.version,
                'question_id': this.model.question.question_id,
                'student_id': this.model.question.student_id,
                'context_id': this.model.question.context_id};    
    var alertBox = this.alertBox;
    var server = this;
    if (this.model.urls.server !== false) {
        $.post(server.model.urls.log_event, data, function(response) {
            if (response.success) {
                alertBox("Logged").delay(100).fadeOut("slow");
            } else {
                alertBox("Logging failed");
            }
        }).fail(function() {
            alertBox("Logging failed");
        });
    }
}

KennelServer.prototype.uploadEvents = function() {
    var data = {
        'events': JSON.stringify(this.eventQueue)
    };
    if (this.model.urls.server !== false) {
        
    }
}

KennelServer.prototype.markSuccess = function() {
    var data = {
        'code': this.model.programs.__main__,
        'type': 'blockly',
        'version': this.model.question.version,
        'question_id': this.model.question.question_id,
        'student_id': this.model.question.student_id,
        'context_id': this.model.question.context_id
    };
    var alertBox = this.alertBox;
    if (this.model.urls.server !== false) {
        $.post(this.model.urls.save_success, data, function(response) {
            if (response.success) {
                alertBox("Success reported").delay(200).fadeOut("slow");
            } else {
                alertBox("Success report failed");
                console.error("Server Success Report Error", response.message);
            }
        }).fail(function() {
            alertBox("Success report failed");
        });
    }
};

KennelServer.prototype.savePresentation = function(presentation, name) {
    var data = {
        'presentation': presentation,
        'name': name,
        'question_id': this.model.question.question_id,
    };
    var alertBox = this.alertBox;
    var server = this;
    if (this.model.urls.server !== false && this.model.urls.save_presentation) {
        clearTimeout(this.presentationTimer);
        this.presentationTimer = setTimeout(function() {
            $.post(server.model.urls.save_presentation, data, function(response) {
                if (response.success) {
                    alertBox("Saved").delay(200).fadeOut("slow");
                } else {
                    alertBox("Saving failed");
                    console.error("Server Saving Error", response.message);
                }
            }).fail(function() {
                alertBox("Saving failed");
            });
        }, this.SAVE_DELAY);
    }
}

KennelServer.prototype.save = function() {
    var filename = this.model.settings.program;
    var data = {
        'filename': filename,
        'code': this.model.programs[filename],
        'type': 'blockly',
        'version': this.model.question.version,
        'question_id': this.model.question.question_id,
        'student_id': this.model.question.student_id,
        'context_id': this.model.question.context_id
    };
    var alertBox = this.alertBox;
    var server = this;
    if (this.model.urls.server !== false) {
        if (this.saveTimer[filename]) {
            clearTimeout(this.saveTimer);
        }
        this.saveTimer[filename] = setTimeout(function() {
            server.storage.set(data.question_id, data.code);
            $.post(server.model.urls.save_code, data, function(response) {
                if (response.is_version_correct === false) {
                    alertBox("New version available! Reload!");
                    server.storage.remove(data.question_id);
                } else if (response.success) {
                    alertBox("Saved").delay(200).fadeOut("slow");
                    server.storage.remove(data.question_id);
                } else {
                    alertBox("Saving failed");
                    console.error("Server Saving Error", response.message);
                }
            }).fail(function() {
                alertBox("Saving failed");
            });
        }, this.SAVE_DELAY);
    }
};

KennelServer.prototype.load = function() {
    var data = {
        'question_id': this.model.question.question_id,
        'student_id': this.model.question.student_id,
        'context_id': this.model.question.context_id
    };
    var alertBox = this.alertBox;
    var server = this, kennel = this.kennel;
    if (this.model.urls.server !== false && this.model.urls.load_code !== false) {
        $.post(this.model.urls.load_code, data, function(response) {
            if (response.success) {
                if (server.storage.has(data.question_id)) {
                    if (server.storage.is_new(data.question_id, response.timestamp)) {
                        var xml = server.storage.get(data.question_id);
                        server.model.load(xml);
                        server.save();
                    } else {
                        server.storage.remove(data.question_id);
                        if (response.code !== null) {
                            server.model.load(response.code);
                        }
                    }
                } else {
                    if (response.code !== null) {
                        server.model.load(response.code);
                    }
                }
                if (response.completed) {
                    kennel.feedback.success('');
                }
                alertBox("Loaded").delay(200).fadeOut("slow");
            } else {
                console.error("Server Load Error", response.message);
                alertBox("Loading failed");
            }
        }).fail(function() {
            alertBox("Loading failed");
        }).always(function() {
            server.model.loaded = true;
        });
    } else {
        server.model.loaded = true;
        alertBox("Loaded").delay(200).fadeOut("slow");
        if (this.model.urls.load_success === true) {
            this.kennel.feedback.success('');
        }
    }
};

function KennelPresentation(set, get, tag, name_tag) {
    this.tag = $(tag);
    this.set = set;
    this.get = get;   
    this.mode = "read";
    this.name_tag = $(name_tag);
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
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['fontname', 'fontsize']],
            ['insert', ['link', 'table', 'ul', 'ol']],
            ['misc', ['codeview', 'help']]
        ]
    });
    this.tag.code(this.get());
    //this.name.tag();
};

function PropertyExplorer(stepConsole, stepEditor, tag, server) {
    this.stepConsole = stepConsole;
    this.stepEditor = stepEditor;
    this.server = server;
    this.tag = tag;
    this.tags = {
        "message": tag.find('.kennel-explorer-run-hide'),
        "errors": tag.find('.kennel-explorer-errors'),
        "errors_body": tag.find('.kennel-explorer-errors-body'),
        "errors_hide": tag.find('.kennel-explorer-errors-hide'),
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
    var errors = this.tags.errors;
    this.tags.errors_hide.click(function() {
       errors.hide();
    });
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
    var server = this.server;
    if (step > 0) {
        var back = Math.max(0, step-1);
        this.tags.first.off('click').click(function() {
            server.logEvent('explorer', 'first');
            explorer.move(0);
        });
        this.tags.back.off('click').click(function() {
            server.logEvent('explorer', 'back');
            explorer.move(back);
        });
    }
    if (step < last) {
        var next = Math.min(last, step+1);
        this.tags.last.off('click').click(function() {
            server.logEvent('explorer', 'last');
            explorer.move(last);
        });
        this.tags.next.off('click').click(function() {
            server.logEvent('explorer', 'next');
            explorer.move(next);
        });
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
                      .append('<td><samp>'+encodeHTML(value.value)+'</samp></td>'));
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

function KennelEditor(printError, model, blockTag, textTag, blocklyPath) {
    this.printError = printError;
    this.model = model;
    this.converter = new PythonToBlocks();
    this.loadBlockly(blockTag, blocklyPath);
    this.loadText(textTag);
    this.setMode(this.model.settings.editor);
}

KennelEditor.prototype.loadBlockly = function(tag, blocklyPath) {
    this.blockTag = tag;
    this.blocklyDiv = tag.find('.blockly-div');
    this.blockly = Blockly.inject(this.blocklyDiv[0],
                                   {path: blocklyPath, 
                                    scrollbars: true, 
                                    readOnly: this.model.settings.read_only,
                                    zoom: {enabled: false},
                                    toolbox: this.getToolbox()});
    // Activate tracing in blockly
    this.blockly.traceOn(true);
    var editor = this;
    // Register model changer
    this.blockly.enableUndo();
    this.blockly.addChangeListener(function() {
        if (editor.model.loaded) {
            editor.model.set(editor.getPythonFromBlocks());
        }
        //$(".kennel-explorer").css("white-space", "pre-wrap").html(Blockly.Pseudo.workspaceToCode(this.blockly));
    });
    // Register window size changes for Blockly
    /*window.addEventListener('resize', function() {
        editor.resizeBlockly()
    }, false);*/
    this.resizeBlockly();
};

KennelEditor.prototype.resizeBlockly = function(e) {
    // Compute the absolute coordinates and dimensions of blocklyArea.
    if ($(document).width() < 900) {
        
    }
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
        if (editor.model.loaded) {
            editor.model.set(editor.getPythonFromText());
        }
        editor.unhighlightLines();
    });
    // Ensure that it fills the editor area
    this.text.setSize(null, "100%");
};

KennelEditor.prototype.changeMode = function() {
    if (this.model.settings.editor == "blocks") {
        this.setMode("text");
    } else {
        this.setMode("blocks");
    }
}

KennelEditor.prototype.setMode = function(mode) {
    // Either update the model, or go with the model's
    if (mode === undefined) {
        mode = this.model.settings.editor;
    } else {
        this.model.settings.editor = mode;
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
        // Hide the text menu
        this.textTag.css('height', '0%');
        $(this.text.getWrapperElement()).hide();
        // Show the blocks menu
        this.blockTag.css('height', '100%');
        this.resizeBlockly();
        this.blockly.setVisible(true);
        // Update the blocks model from the text
        this.updateBlocks();
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
    if (text.trim().charAt(0) == "<") {
        var xml = Blockly.Xml.textToDom(text);
        this.setBlocksFromXml(xml);
        if (this.model.settings.editor == 'text') {
            this.updateText();
        }
    } else {
        this.text.setValue(text);
        if (this.model.settings.editor == 'blocks') {
            this.updateBlocks();
        }
    }
}

KennelEditor.prototype.updateText = function() {
    var code = this.model.get();//this.getPythonFromBlocks();
    if (code == "") {
        this.text.setValue("\n");
    } else {
        this.text.setValue(code);
    }
}

KennelEditor.prototype.updateBlocks = function() {
    // Make a backup of the current state
    var backupXml = this.getBlocksFromXml();
    //try {
        // Try to convert it!
        var code = this.model.get(); //this.text.getValue();
        if (code.trim().charAt(0) !== '<') {
            var result = this.converter.convertSource(code);
            code = result.xml;
            if (result.error !== null) {
                console.error("Partial Conversion Error", result.error);
            }
        }
        var blocklyXml = Blockly.Xml.textToDom(code);
        this.setBlocksFromXml(blocklyXml);
        if (this.model.settings.parsons) {
            this.shuffle();
        } else {
            this.blockly.align();
        }
    //} catch (e) {
      //  this.printError(e);
//        console.error("Total Conversion Error", e);
        //this.setBlocksFromXml(backupXml);
    //}
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
KennelEditor.prototype.unhighlightLines = function() {
    if (this.previousLine !== null) {
        this.text.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.text.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.previousLine = null;
}

KennelEditor.prototype.getToolbox = function() {
    return '<xml id="toolbox" style="display: none">'+
                '<category name="Properties" custom="VARIABLE" colour="240">'+
                '</category>'+
                '<category name="Decisions" colour="330">'+
                    '<block type="controls_if"></block>'+
                    '<block type="logic_compare"></block>'+
                    '<block type="logic_operation"></block>'+
                    '<block type="logic_negate"></block>'+
                '</category>'+
                '<category name="Iteration" colour="300">'+
                    '<block type="controls_forEach"></block>'+
                '</category>'+
                '<category name="Functions" custom="PROCEDURE" colour="210">'+
                '</category>'+
                '<category name="Calculation" colour="270">'+
                    //'<block type="raw_table"></block>'+
                    '<block type="math_arithmetic"></block>'+
                    //'<block type="type_check"></block>'+
                    //'<block type="raw_empty"></block>'+
                    //'<block type="math_single"></block>'+
                    //'<block type="math_number_property"></block>'+
                    '<block type="math_round"></block>'+
                    //'<block type="text_join"></block>'+
                '</category>'+
                '<category name="Python" colour="180">'+
                    '<block type="raw_block"></block>'+
                    '<block type="raw_expression"></block>'+
                    //'<block type="function_call"></block>'+
                '</category>'+
                '<category name="Output" colour="160">'+
                    '<block type="text_print"></block>'+
                    //'<block type="text_print_multiple"></block>'+
                    '<block type="plot_line"></block>'+
                    //'<block type="plot_scatter"></block>'+
                    '<block type="plot_show"></block>'+
                    '<block type="plot_title"></block>'+
                '</category>'+
                '<sep></sep>'+
                '<category name="Values" colour="100">'+
                    '<block type="text"></block>'+
                    '<block type="math_number"></block>'+
                    '<block type="logic_boolean"></block>'+
                '</category>'+
                '<category name="Lists" colour="30">'+
                    '<block type="lists_create_empty"></block>'+
                    '<block type="lists_append"></block>'+
                    '<block type="lists_length"></block>'+
                    '<block type="lists_create_with"></block>'+
                    '<block type="lists_index">'+
                        '<value name="ITEM">'+
                          '<shadow type="math_number">'+
                            '<field name="NUM">0</field>'+
                          '</shadow>'+
                        '</value>'+
                    '</block>'+
                '</category>'+
                '<category name="Dictionaries" colour="0">'+
                    '<block type="dict_get_literal"></block>'+
                    '<block type="dict_keys"></block>'+
                    '<block type="dicts_create_with"></block>'+
                '</category>'+
                '<sep></sep>'+
                '<category name="Data - Weather" colour="70">'+
                    '<block type="weather_temperature"></block>'+
                    '<block type="weather_report"></block>'+
                    '<block type="weather_forecasts"></block>'+
                    '<block type="weather_report_forecasts"></block>'+
                    '<block type="weather_all_forecasts"></block>'+
                    '<block type="weather_highs_lows"></block>'+
                '</category>'+
                '<category name="Data - Stock" colour="65">'+
                    '<block type="stocks_current"></block>'+
                    '<block type="stocks_past"></block>'+
                '</category>'+
                '<category name="Data - Earthquakes" colour="60">'+
                    '<block type="earthquake_get"></block>'+
                    '<block type="earthquake_both"></block>'+
                    '<block type="earthquake_all"></block>'+
                '</category>'+
                '<category name="Data - Crime" colour="55">'+
                    '<block type="crime_state"></block>'+
                    '<block type="crime_year"></block>'+
                    '<block type="crime_all"></block>'+
                '</category>'+
                '<category name="Data - Books" colour="50">'+
                    '<block type="books_get"></block>'+
                '</category>'+
            '</xml>';
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
    this.tag.html("<span class='label label-success'><span class='glyphicon glyphicon-ok'></span> Success!</span>");
    this.tag.removeClass("alert-warning");
    //this.tag.addClass("alert-success");
}

function KennelToolbar(tag) {
    this.tag = tag;
    var groupHtml = '<div class="btn-group" role="group"></div>';
    var runGroup =      $(groupHtml).appendTo(tag);
    var modeGroup =     $(groupHtml).appendTo(tag);
    var doGroup =       $(groupHtml).appendTo(tag);
    var blocksGroup =   $(groupHtml).appendTo(tag);
    var codeGroup =     $(groupHtml).appendTo(tag);
    var programsGroup = $(groupHtml).appendTo(tag);
    this.elements = {
        'run': $("<button>Run</button>")
                            .addClass('btn btn-success kennel-run')
                            .prependTo(runGroup),
        'editor_mode': $("<button> Text</button>")
                            .addClass('btn btn-default kennel-change-mode')
                            .prepend("<span class='glyphicon glyphicon-italic'><span>")
                            .appendTo(modeGroup),
        'wide': $("<button></button>")
                            .addClass('btn btn-default kennel-toolbar-wide')
                            .attr("role", "group")
                            .attr("data-side", "wide")
                            .html('<i class="fa fa-ellipsis-h"></i> Wide')
                            .appendTo(modeGroup),
        'kennel_mode': $("<button>Instructor</button>")
                            .addClass('btn btn-default kennel-mode')
                            .appendTo(modeGroup),
        'undo': $("<button></button>")
                            .addClass('btn btn-default kennel-toolbar-undo')
                            .attr("role", "group")
                            .html('<i class="fa fa-undo"></i>')
                            .appendTo(doGroup),
        'redo': $("<button></button>")
                            .addClass('btn btn-default kennel-toolbar-redo')
                            .attr("role", "group")
                            .html('<i class="fa fa-repeat"></i>')
                            .appendTo(doGroup),
        'align': $("<button></button>")
                            .addClass('btn btn-default kennel-toolbar-align')
                            .attr("role", "group")
                            .html('<i class="fa fa-align-left"></i> Align')
                            .appendTo(doGroup),
        'reset': $("<button></button>")
                            .addClass('btn btn-default kennel-toolbar-reset')
                            .attr("role", "group")
                            .html('<i class="fa fa-refresh"></i> Reset')
                            .appendTo(doGroup),
        'clear': $("<button></button>")
                            .addClass('btn btn-default kennel-toolbar-clear')
                            .attr("role", "group")
                            .html('<i class="fa fa-trash-o"></i> Clear')
                            .appendTo(doGroup),
        /*'to_rst': $("<button>RST</button>")
                            .addClass('btn btn-info kennel-to-rst')
                            .appendTo(doGroup),*/
        'to_pseudo': $("<button>Pseudo</button>")
                            .addClass('btn btn-default kennel-toolbar-pseudo')
                            .appendTo(doGroup),
        'wrench': '',
        'copy': '',
        'paste': '',
        'programs': $("<div></div>")
                            .addClass('btn-group kennel-programs')
                            .attr("data-toggle", "buttons")
                            .appendTo(programsGroup)
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
function Kennel(attachmentPoint, mode, presentation, current_code,
                on_run, on_change, starting_code, instructor, view, blocklyPath,
                settings,
                urls, questionProperties) {
    // User programs
    this.model = {
        'loaded': false,
        "settings": {
            'editor': view,
            'instructor': instructor,
            'parsons': settings.parsons,
            'read_only': settings.read_only,
            'program': "__main__"
        },
        "question": {
            'question_id': questionProperties.question_id,
            'student_id': questionProperties.student_id,
            'context_id': questionProperties.book_id,
            'version': questionProperties.version,
            'name': questionProperties.name
        },
        'urls': urls,
        "programs": {
            "__main__": current_code,
            "on_run": on_run, 
            "on_change": on_change, 
            "starting_code": starting_code
        },
        "presentation": presentation
    };
    
    // Initialize the editor.
    var model = this.model;
    this.model.get = function() {
        return kennel.model.programs[kennel.model.settings.program];
    }
    this.model.set = function(content) {
        kennel.model.programs[kennel.model.settings.program] = content;
        kennel.server.save();
    }
    
    this.model.load = function(content) {
        kennel.model.programs['__main__'] = content;
        if (kennel.editor !== undefined) {
            kennel.editor.setPython(content);
        }
    }
    
    // Default mode when you open the screen is instructor
    this.mode = mode;
    
    // The Div or whatever HTML element we attach everything to
    this.attachmentPoint = attachmentPoint;
    
    this.loadMain();
    var kennel = this;
    
    // Add the Feedback block (unused)
    this.feedback = new KennelFeedback(this.mainDiv.find('.kennel-feedback'));
    
    // Add the Server connection
    this.server = new KennelServer(this.model,
                                   this,
                                   function(message) {
                                        return kennel.alert(message);
                                    });
    this.server.load();
    
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
        kennel.mainDiv.find('.kennel-explorer'),
        kennel.server
    );
    
    this.editor = new KennelEditor(
        function(e) {kennel.printError(e); },
        this.model,
        this.mainDiv.find('.kennel-blocks'),
        this.mainDiv.find('.kennel-text'),
        blocklyPath
    );
    this.loadConsole();
    
    // Add the presentation block
    this.presentation = new KennelPresentation(
        function(content) { 
            kennel.model.presentation = content;
            kennel.editor.blockly.resize();
            var val = kennel.mainDiv.find('.kennel-presentation-name-editor').val();
            kennel.server.savePresentation(content, val);
        },
        function() { return kennel.model.presentation; },
        kennel.mainDiv.find('.kennel-presentation'),
        kennel.mainDiv.find('.kennel-presentation-name')
    );
    
    // Add events to the toolbar
    this.activateToolbar();

    this.changeProgram('__main__');
};

/**
 * Indents the given string
 * @param {string} str  The string to be indented.
 * @param {number} numOfIndents  The amount of indentations to place at the
 *     beginning of each line of the string.
 * @param {number=} opt_spacesPerIndent  Optional.  If specified, this should be
 *     the number of spaces to be used for each tab that would ordinarily be
 *     used to indent the text.  These amount of spaces will also be used to
 *     replace any tab characters that already exist within the string.
 * @return {string}  The new string with each line beginning with the desired
 *     amount of indentation.
 */
function indent(str, numOfIndents, opt_spacesPerIndent) {
  str = str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('\t'));
  numOfIndents = new Array(opt_spacesPerIndent + 1 || 0).join(' '); // re-use
  return opt_spacesPerIndent
    ? str.replace(/^\t+/g, function(tabs) {
        return tabs.replace(/./g, numOfIndents);
    })
    : str;
}

Kennel.prototype.activateToolbar = function() {
    var elements = this.toolbar.elements;
    var kennel = this, server = this.server;
    // Editor mode
    elements.editor_mode.click(function() {
        if (kennel.model.settings.editor == "blocks") {
            server.logEvent('editor', 'blocks');
            elements.editor_mode.html("<span class='glyphicon glyphicon-th'></span> Blocks");
        } else {
            server.logEvent('editor', 'text');
            elements.editor_mode.html("<span class='glyphicon glyphicon-italic'></span> Text");
        }
        kennel.editor.changeMode();
    });
    if (this.model.settings.editor == "text") {
        elements.editor_mode.html("<span class='glyphicon glyphicon-th'></span> Blocks");
    } else {
        elements.editor_mode.html("<span class='glyphicon glyphicon-italic'></span> Text");
    }
    // Instructor/Student/Grade mode
    elements.kennel_mode.click(function() {
        server.logEvent('editor', 'mode');
        kennel.changeKennelMode();
    });
    /*elements.to_rst.click(function(ev) {
        ev.preventDefault();
        var presentation = kennel.model.presentation.replace(/(\r\n|\n|\r)/gm,"");
        var starting = indent(kennel.model.programs.starting_code, 1, 4);
        var testing = indent(kennel.model.programs.on_run, 1, 4);
        var text = ".. blockly:: ___\n"+
                   "    :comment: " + presentation + "\n"+
                   "\n"+
                   "    preload::\n"+ starting + "\n"+
                   "    test::\n"+ testing + "\n";
        var popup = kennel.mainDiv.find('.kennel-popup');
        popup.find('.modal-title').html("RST");
        popup.find('.modal-body').text(text);
        popup.modal('show');
        
    });*/
    
    elements.to_pseudo.click(function(ev) {
        ev.preventDefault();
        server.logEvent('editor', 'pseudo');
        var popup = kennel.mainDiv.find('.kennel-popup');
        popup.find('.modal-title').html("Pseudo-code Explanation");
        popup.find('.modal-body').html(Blockly.Pseudo.workspaceToCode(kennel.editor.blockly));
        popup.modal('show');
        
    });
    if (!this.model.settings.instructor) {
        elements.kennel_mode.hide();
        //elements.to_rst.hide();
    }
    // Run
    elements.run.click(function() {
        server.logEvent('editor', 'run');
        kennel.run();
    });
    // Undo
    elements.undo.click(function() {
        server.logEvent('editor', 'undo');
        if (kennel.model.settings.editor == 'blocks') {
            kennel.editor.blockly.undo();
        } else {
            kennel.editor.text.undo();
        }
    });
    // Redo
    elements.redo.click(function() {
        server.logEvent('editor', 'redo');
        if (kennel.model.settings.editor == 'blocks') {
            kennel.editor.blockly.redo();
        } else {
            kennel.editor.text.redo();
        }
    });
    // Wide
    var left = kennel.mainDiv.find('.kennel-content-left'),
        right = kennel.mainDiv.find('.kennel-content-right');
    elements.wide.click(function() {
        if (elements.wide.attr("data-side") == "skinny") {
            server.logEvent('editor', 'wide');
            // Make it skinny
            elements.wide.attr("data-side", "wide")
                         .html('<i class="fa fa-ellipsis-h"></i> Wide');
            // Left side
            left.removeClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
            left.addClass('col-md-7 col-sm-7 col-xs-7');
            // Right side
            right.removeClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
            right.addClass('col-md-5 col-xs-5 col-sm-5');
        } else {
            server.logEvent('editor', 'skinny');
            // Make it wide
            elements.wide.attr("data-side", "skinny")
                         .html('<i class="fa fa-ellipsis-v"></i> Skinny');
            // Left side
            left.removeClass('col-md-7 col-xs-7 col-sm-7');
            left.addClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
            // Right side
            right.removeClass('col-md-5 col-xs-5 col-sm-7');
            right.addClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
        }
        // Hack: Force the blockly window to fit the width
        if (kennel.model.settings.editor == 'blocks') {
            kennel.editor.blockly.render();
        }
    });
    // Reset code
    elements.reset.click(function() {
        server.logEvent('editor', 'reset');
        kennel.setCode(kennel.model.programs.starting_code);
    });
    // Clear code
    elements.clear.click(function() {
        server.logEvent('editor', 'clear');
        kennel.setCode("");
    });
    // Align blocks
    elements.align.click(function() {
        server.logEvent('editor', 'align');
        kennel.editor.blockly.align();
    });
    // Change programs
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
    // Save name editing
    this.mainDiv.find('.kennel-presentation-name-editor').change(function() {
        var val = kennel.mainDiv.find('.kennel-presentation-name-editor').val();
        kennel.server.savePresentation(kennel.presentation.get(), val);
    });
}

Kennel.prototype.metrics_editor_height = '100%';

Kennel.prototype.setCode = function(code, name) {
    if (name === undefined) {
        name = "__main__";
    }
    this.model.programs[name] = code;
    this.editor.setPython(code);
}

Kennel.prototype.changeKennelMode = function() {
    var nameSpan = this.mainDiv.find('.kennel-presentation-name');
    var nameInput = this.mainDiv.find('.kennel-presentation-name-editor');
    if (this.mode == 'instructor') {
        // Make the presentation editable
        this.presentation.startEditor();
        // Make the name editable
        nameSpan.hide();
        nameInput.val(nameSpan.html()).show();
        // Display the extra programs
        this.toolbar.showPrograms();
        // Expose Teacher API
        this.editor.resizeBlockly();
        // Extra Config options
        this.mode = "student";
    } else if (this.mode == 'student') {
        // Make the presentation read-only
        this.presentation.closeEditor();
        // Make the name read-only
        nameSpan.html(nameInput.val()).show();
        nameInput.hide();
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

Kennel.prototype.alert = function(message) {
    var box = this.mainDiv.find('.kennel-alert');
    box.text(message).show();
    return box;
}

Kennel.prototype.loadMain = function() {
    var mainTabs = ""+
    "<div class='kennel-content container-fluid'>"+
        "<div class='kennel-popup modal fade' style='display:none'>"+
            "<div class='modal-dialog' style='width:750px'>"+
                "<div class='modal-content' id='modal-message' >"+
                    "<div class='modal-header'>"+
                        "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>"+
                        "<h4 class='modal-title'>Dynamic Content</h4>"+
                    "</div>"+
                    "<div class='modal-body' style='width:100%; height:400px; white-space:pre-wrap'>"+
                    "</div>"+
                    "<div class='modal-footer'>"+
                        "<button type='button' class='btn btn-white' data-dismiss='modal'>Close</button>"+
                    "</div>"+    
                "</div>"+
            "</div>"+
        "</div>"+
        "<div class='row'>"+
            "<div class='kennel-content-left col-md-7 col-sm-7 alert alert-warning'>"+
                '<span class="kennel-alert pull-right text-muted">Loading...</span>'+
                "<div class='form-inline'>"+
                "<div><strong>BlockPy </strong>"+
                    "<span class='kennel-presentation-name'>"+
                    this.model.question.name+
                    "</span>"+
                    "<input type='text' class='kennel-presentation-name-editor form-control' style='display:none'>"+
                    "</div>"+
                "</div>"+
                "<div class='kennel-presentation'>"+
                    this.model.presentation+
                "</div>"+
                "<strong>Feedback:</strong> <span class='kennel-feedback'></span>"+
                "<div class='kennel-toolbar btn-toolbar' role='toolbar'>"+
                "</div>"+
                "<div class='kennel-editor'>"+
                    "<div class='kennel-blocks' "+
                         "style='height:"+this.metrics_editor_height+"'>"+
                        "<div class='blockly-div' style='height:450px; width: 100%' '></div>"+
                        //"<div class='blockly-area'></div>"+
                    "</div>"+
                    "<div class='kennel-text'>"+
                        "<textarea class='language-python'"+
                                   "style='height:"+this.metrics_editor_height+
                                   "'></textarea>"+
                    "</div>"+
                "</div>"+
            "</div>"+
            "<div class='kennel-content-right col-md-5 col-sm-5 alert alert-info'>"+
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
                            "<div class='kennel-explorer-errors alert alert-danger alert-dismissible' role='alert'>"+
                                 "<button type='button' class='kennel-explorer-errors-hide close' aria-label='Close'><span  aria-hidden='true'>&times;</span></button>"+
                                 "<div class='kennel-explorer-errors-body'></div>"+
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
    this.resetConsole();
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

Kennel.prototype.printAnalysis = function(result) {
    //this.explorer.tags.message.show();
    //this.explorer.tags.message.html(JSON.stringify(result.identifiers));
    console.log(result);
}

/*
 * Print an error to the consoles -- the on screen one and the browser one
 */
Kennel.prototype.printError = function(error) {
    console.log("Printing Error", error);
    this.explorer.tags.errors.show();
    // Is it a string?
    if (typeof error !== "string") {
        // A weird skulpt thing?
        if (error.tp$str !== undefined) {
            try {
                this.editor.highlightError(error.args.v[2]-1);
            } catch (e) {
            }
            if (error.constructor == Sk.builtin.NameError
                && error.args.v.length > 0
                && error.args.v[0].v == "name '___' is not defined") {
                error = "<b>Error: </b> You have incomplete blocks. Make sure that you do not have any dangling blocks.<br><br><b>Extended Error Explanation:</b> If you look at the text view of your Python code, you'll see <code>___</code> in the code. The converter will create these <code>___</code> to show that you have a block that's missing a piece.";
            } else if (error.tp$name in EXTENDED_ERROR_EXPLANATION) {
                error = "<b>Error: </b>"+error.tp$str().v + "<br><br>"+EXTENDED_ERROR_EXPLANATION[error.tp$name];
            } else {
                error = error.tp$str().v;
            }
        } else {
            // An error?
            error = ""+error.name + ": " + error.message;
            console.log("Unknown Error"+error.stack);
        }
    }
    // Perform any necessary cleaning
    this.explorer.tags.errors_body.html(error);
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
    // Skulpt settings
    // No connected services
    Sk.connectedServices = {}
    // Limit execution to 5 seconds
    Sk.execLimit = 5000;
    // Ensure version 3, so we get proper print handling
    Sk.python3 = true
    // Major Skulpt configurations
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
    // Identify the location to put new charts
    Sk.console = {
        'printHtml': function(html, value) {kennel.printHtml(html, value);},
        'width': $(this.console).width(),
        'height': $(this.console).height(),
        'console': this.console
    }
    // Stepper!
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
        case Sk.builtin.tuple:
            return {'name': property,
                'type': "Tuple",
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
    //this.editor.updateBlocks();
    var code = this.model.programs['__main__'];
    if (code.trim() == "") {
        this.printError("You haven't written any code yet!");
        return;
    }
    this.resetConsole();
    // Actually run the python code
    var executionPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, code, true);
    });
    
    /*var ai = new AbstractInterpreter();
    try {
        var results = ai.analyze(code);
        this.printAnalysis(results);
    } catch (e) {
        // pass
    }*/
    
    // Change "Run" to "Executing"
    this.toolbar.elements.run.prop('disabled', true);
    
    var kennel = this;
    var server = this.server;
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
            kennel.printError(error);
            kennel.toolbar.elements.run.prop('disabled', false);
            server.logEvent('blockly_error', error);
        }
    );
}

Kennel.prototype.check = function(student_code, traceTable, output) {
    var kennel = this;
    var server = this.server;
    var on_run = this.model.programs['on_run'];
    if (on_run.trim() !== "") {
        var backupExecution = Sk.afterSingleExecution;
        console.log(output);
        Sk.afterSingleExecution = undefined;
        on_run += "\nresult = on_run('''"+student_code+"''', "+
                  JSON.stringify(output)+", "+
                  JSON.stringify(traceTable)+", "+
                  ")";
        var executionPromise = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, on_run, true);
        });
        executionPromise.then(
            function (module) {
                var result = Sk.ffi.remapToJs(module.$d.result);
                if (result === 1) {  
                    kennel.server.markSuccess();
                    kennel.feedback.success();
                } else {
                    kennel.feedback.error(result);
                }
                Sk.afterSingleExecution = backupExecution;
            }, function (error) {
                Sk.afterSingleExecution = backupExecution;
                kennel.feedback.error("Error in instructor's feedback. "+error);
                console.error("Instructor Feedback Error:", error);
                server.logEvent('blockly_instructor_error', error);
            });
    }
}

/**
 * Align the blocks in the workspace vertically.
 */
KennelEditor.prototype.shuffle = function() {
    var workspace = this.blockly;
    var metrics = workspace.getMetrics();
    var width = metrics.viewWidth / 2,
        height = metrics.viewHeight;
    var blocks = workspace.getTopBlocks(false);
    var y = 5, x = 0,
        maximal_increase = height/blocks.length;
    for (var i = 0; i < blocks.length; i++){
        // Get a block
        var block = blocks[i];
        var properties = block.getRelativeToSurfaceXY();
        if (i == 0) {
            x = 5;
        } else {
            x = -properties.x+randomInteger(10, width);
        }
        block.moveBy(x, 
                     -properties.y+y);
        y = y + randomInteger(5, maximal_increase);
    }
}