function BlockPy(settings, assignment, submission, programs) {
    this.model = {
        // User level settings
        "settings": {
            // Default mode when you open the screen is text
            // 'text', 'blocks'
            'editor': ko.observable(settings.editor),
            // Default mode when you open the screen is instructor
            // boolean
            'instructor': ko.observable(settings.instructor),
            // boolean
            'enable_blocks': ko.observable(settings.blocks_enabled),
            // boolean
            'read_only': ko.observable(settings.read_only),
            // string
            'filename': ko.observable("__main__"),
        },
        'status': {
            // boolean
            'loaded': ko.observable(false),
            'text': ko.observable("Loading"),
        },
        'constants': {
            // string
            'blocklyPath': settings.blocklyPath,
            // boolean
            'blocklyScrollbars': true,
            // string
            'attachmentPoint': settings.attachmentPoint,
            // JQuery object
            'container': null,
        },
        // Assignment level settings
        "assignment": {
            'assignment_id': assignment.question_id,
            'student_id': assignment.student_id,
            'context_id': assignment.book_id,
            'version': assignment.version,
            'lis_result_sourcedid': assignment.lis_result_sourcedid,
            'name': assignment.name,
            'introduction': assignment.introduction,
            'presentation': assignment.presentation,
            "on_run": assignment.on_run, 
            "on_change": assignment.on_change, 
            "initial_view": assignment.initial_view,
            "starting_code": assignment.starting_code,
            'parsons': ko.observable(assignment.parsons),
            'urls': assignment.urls
        },
        "programs": {
            "__main__": ko.observable(programs.__main__),
        }
    };
    this.model.program = ko.computed(function() {
        return this.programs[this.settings.filename()]();
    }, this.model) //.extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 400 } });
    
    this.initMain();
    
    /*
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
    
    // The Div or whatever HTML element we attach everything to
    this.attachmentPoint = attachmentPoint;
    
    this.loadMain();
    var kennel = this;
    
    
    
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
    
    this.loadConsole();
    
    // Add the presentation block
    this.presentation = new KennelPresentation(
        function(content) { 
            kennel.model.presentation = content;
            kennel.editor.blockly.resize();
            var val = kennel.mainDiv.find('.kennel-presentation-name-editor').val();
            kennel.server.savePresentation(content, val, kennel.model.settings.parsons);
        },
        function() { return kennel.model.presentation; },
        kennel.mainDiv.find('.kennel-presentation'),
        kennel.mainDiv.find('.kennel-presentation-name')
    );
    
    // Add events to the toolbar
    this.activateToolbar();

    this.changeProgram('__main__');
    */
}

BlockPy.prototype.initMain = function() {
    this.initInterface();
    this.initModel();
    this.initComponents();
}

BlockPy.prototype.initInterface = function(postCompletion) {
    var constants = this.model.constants;
    constants.container = $(constants.attachmentPoint).html($(BlockPyInterface))
}

BlockPy.prototype.initModel = function() {
    ko.applyBindings(this.model);
}

BlockPy.prototype.initComponents = function() {
    var container = this.model.constants.container;
    this.components = {};
    this.components.toolbar = new BlockPyToolbar(this, container.find('.kennel-toolbar'));
    this.components.feedback = new BlockPyFeedback(this, container.find('.kennel-feedback'));
    this.components.editor = new BlockPyEditor(this, container.find('.kennel-editor'),
        function(e) {kennel.printError(e); },
        this.model,
        container.find('.kennel-blocks'),
        container.find('.kennel-text'),
        this.model.blocklyPath
    );
}

BlockPy.prototype.reportError = function(component, message) {
    console.error(component, message)
}

/*
function BlockPy(attachmentPoint, mode, presentation, current_code,
                on_run, on_change, starting_code, instructor, view, blocklyPath,
                settings,
                urls, questionProperties) {
    // User programs
}
*/

BlockPy.prototype.activateToolbar = function() {
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
        kennel.changeBlockPyMode();
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
        kennel.editor.updateBlocks();
        server.logEvent('editor', 'pseudo');
        var popup = kennel.mainDiv.find('.kennel-popup');
        popup.find('.modal-title').html("Pseudo-code Explanation");
        popup.find('.modal-body').html(Blockly.Pseudo.workspaceToCode(kennel.editor.blockly));
        popup.modal('show');
    });
    kennel.mainDiv.find('.kennel-popup').on('hidden.bs.modal', function () {
        server.logEvent('editor', 'close_pseudo');
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
        if (kennel.model.settings.editor() == 'blocks') {
            kennel.editor.blockly.undo();
        } else {
            kennel.editor.text.undo();
        }
    });
    // Redo
    elements.redo.click(function() {
        server.logEvent('editor', 'redo');
        if (kennel.model.settings.editor() == 'blocks') {
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
    
    var parsonBox = kennel.mainDiv.find('.kennel-presentation-parsons-check input');
    var textFirstBox = kennel.mainDiv.find('.kennel-presentation-text-first input');
    var nameEditor = kennel.mainDiv.find('.kennel-presentation-name-editor');
    var updatePresentation = function() {
        kennel.model.settings.parsons = parsonBox.prop('checked');
        kennel.model.settings.text_first = textFirstBox.prop('checked');
        kennel.server.savePresentation(kennel.presentation.get(), 
                                       nameEditor.val(), 
                                       kennel.model.settings.parsons,
                                       kennel.model.settings.text_first);
    }
    // Save name editing
    nameEditor.change(updatePresentation);
    // Parsons checkbox
    parsonBox.change(updatePresentation).prop('checked', this.model.settings.parsons);
    // Text first checkbox
    textFirstBox.change(updatePresentation).prop('checked', this.model.settings.text_first);
}

BlockPy.prototype.metrics_editor_height = '100%';

BlockPy.prototype.setCode = function(code, name) {
    if (name === undefined) {
        name = this.model.settings.filename();
    }
    this.model.programs[name](code);
}

BlockPy.prototype.changeBlockPyMode = function() {
    var nameSpan = this.mainDiv.find('.kennel-presentation-name');
    var nameInput = this.mainDiv.find('.kennel-presentation-name-editor');
    var parsonBox = this.mainDiv.find('.kennel-presentation-parsons-check');
    var textFirstBox = this.mainDiv.find('.kennel-presentation-text-first');
    if (this.mode == 'instructor') {
        // Make the presentation editable
        this.presentation.startEditor();
        // Make the name editable
        nameSpan.hide();
        nameInput.val(nameSpan.html()).show();
        parsonBox.show();
        textFirstBox.show();
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
        parsonBox.hide();
        textFirstBox.hide();
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

BlockPy.prototype.changeProgram = function(name) {
    this.silentChange_ = true;
    this.model.settings.filename = name;
    this.editor.setPython(this.model.programs[name]);
    this.toolbar.elements.programs.find("[data-name="+name+"]").click();
}

BlockPy.prototype.alert = function(message) {
    var box = this.mainDiv.find('.kennel-alert');
    box.text(message).show();
    return box;
}

/*
 * Resets skulpt to some default values
 */
BlockPy.prototype.loadConsole = function() {
    this.console = this.mainDiv.find('.kennel-console')[0];
    this.resetConsole();
}

BlockPy.prototype.stepConsole = function(step, page) {
    $(this.console).find('.kennel-console-output').each(function() {
        if ($(this).attr("data-step") <= step) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

BlockPy.prototype.printAnalysis = function(result) {
    //this.explorer.tags.message.show();
    //this.explorer.tags.message.html(JSON.stringify(result.identifiers));
    console.log(result);
}

/*
 * Print an error to the consoles -- the on screen one and the browser one
 */
BlockPy.prototype.printError = function(error) {
    console.log("Printing Error", error);
    this.explorer.tags.errors.show();
    // Is it a string?
    if (typeof error !== "string") {
        // A weird skulpt thing?
        if (error.tp$str !== undefined) {
            try {
                this.editor.highlightError(error.traceback[0].lineno-1);
            } catch (e) {
            }
            
            var all_blocks = Blockly.mainWorkspace.getAllBlocks();
            console.log(all_blocks);
            blockMap = {};
            all_blocks.forEach(function(elem) {
                if (elem.lineNumber in blockMap) {
                    blockMap[elem.lineNumber].push(elem);
                } else {
                    blockMap[elem.lineNumber] = [elem];
                }
            });
            var hblocks = blockMap[""+error.traceback[0].lineno];
            console.log(hblocks);
            //Blockly.mainWorkspace.highlightBlock(hblocks[0].id);
            hblocks[0].addSelect();
            
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
BlockPy.prototype.print = function(text) {
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
BlockPy.prototype.printHtml = function(chart, value) {
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

BlockPy.prototype.resetConsole = function() {
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

BlockPy.prototype.parseGlobals = function(variables) {
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

BlockPy.prototype.parseValue = function(property, value) {
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
BlockPy.prototype.getHighlightMap = function() {
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
BlockPy.prototype.run = function() {
    //this.editor.updateBlocks();
    var code = this.model.programs['__main__']();
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

BlockPy.prototype.check = function(student_code, traceTable, output) {
    var kennel = this;
    var server = this.server;
    var on_run = this.model.programs['on_run']();
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
                    kennel.server.markSuccess(1.0);
                    kennel.feedback.success();
                } else {
                    kennel.server.markSuccess(0.0);
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