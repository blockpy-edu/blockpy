/**
 * An object for executing Python code and passing the results along to interested components.
 *
 * Interesting components:
 *  Execution Buffer: Responsible for collecting the trace during program execution.
 *                    This prevents Knockoutjs from updating the view during execution.
 *
 * @constructor
 * @this {BlockPyEditor}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
function BlockPyEngine(main) {
    this.main = main;
    this.configureSkulpt();
    this.setStudentEnvironment();
    
    // Keeps track of the tracing while the program is executing
    this.executionBuffer = {};
    //this.abstractInterpreter = new Tifa();
    
    this.openedFiles = {};
}

BlockPyEngine.prototype.UTILITY_MODULE_CODE = 'var $builtinmodule = '+$sk_mod_instructor.toString();
BlockPyEngine.prototype.PREVENT_UTILITY_MODULE = 'raise NotImplementedError("utility module not available to students.")';

/**
 * Initializes the Python Execution engine and the Printer (console).
 * This is typically called only once.
 */
BlockPyEngine.prototype.configureSkulpt = function() {
    // Skulpt settings
    // No connected services
    Sk.connectedServices = {}
    // Ensure version 3, so we get proper print handling
    Sk.python3 = true;
    // Major Skulpt configurations
    var printer = this.main.components.printer;
    Sk.configure({
        // Function to handle the text outputted by Skulpt
        output: printer.print.bind(printer),
        // Function to handle loading in new files
        read: this.readFile.bind(this)
    });
    // Allow file access
    Sk.openFilenamePrefix = "sk-filename-";
    Sk.inBrowser = this.openFile.bind(this);
    // Proxy requests
    var engine = this;
    Sk.requestsGet = function(filename) { return engine.openURL(filename, 'url')};
    // Access point for instructor data
    Sk.executionReports = this.main.model.execution.reports;
    Sk.feedbackSuppressions = this.main.model.execution.suppressions;
    Sk.analyzeParse = this.analyzeParse.bind(this);
    // Allow input box
    Sk.inputfunTakesPrompt = true;
}

/**
 *
 */
BlockPyEngine.prototype.setStudentEnvironment = function() {
    // Limit execution to 5 seconds
    var settings = this.main.model.settings;
    Sk.execLimitFunction = function() { 
        return settings.disable_timeout() ? Infinity : 10000; 
    };
    Sk.execLimit = Sk.execLimitFunction();
    // Identify the location to put new charts
    Sk.console = this.main.components.printer.getConfiguration();
    // Stepper! Executed after every statement.
    Sk.afterSingleExecution = this.step.bind(this);
    // Unmute everything
    Sk.console.skipDrawing = !!settings.preventD3;
    this.main.model.settings.mute_printer(false);
    // Create an input box
    Sk.inputfun = this.inputFunction.bind(this);
    // Disable utility module
    Sk.builtinFiles.files['src/lib/utility/__init__.js'] = this.PREVENT_UTILITY_MODULE;
}
BlockPyEngine.prototype.setInstructorEnvironment = function() {
    // Instructors have no limits
    Sk.execLimit = undefined;
    // Stepper! Executed after every statement.
    Sk.afterSingleExecution = null;
    // Mute everything
    Sk.console.skipDrawing = true;
    this.main.model.settings.mute_printer(true);
    // Disable input box
    Sk.queuedInput = [];
    Sk.inputfun = this.inputMockFunction.bind(this);
    // Enable utility mode
    Sk.builtinFiles.files['src/lib/utility/__init__.js'] = this.UTILITY_MODULE_CODE;
}

/**
 * Used to access Skulpt built-ins. This is pretty generic, taken
 * almost directly from the Skulpt docs.
 *
 * @param {String} filename - The python filename (e.g., "os" or "pprint") that will be loaded.
 * @returns {String} The JavaScript source code of the file (weird, right?)
 * @throws Will throw an error if the file isn't found.
 */
BlockPyEngine.prototype.readFile = function(filename) {
    if (Sk.builtinFiles === undefined ||
        Sk.builtinFiles["files"][filename] === undefined) {
        throw "File not found: '" + filename + "'";
    }
    return Sk.builtinFiles["files"][filename];
}

/**
 * Creates and registers a Promise from the Input box
 * @param {String} promptMessage - Message to display to the user.
 * 
 */
BlockPyEngine.prototype.inputFunction = function(promptMessage) {
    var printer = this.main.components.printer;
    var result = printer.printInput(promptMessage);
    if (result.promise) {
        var resolveOnClick;
        var submittedPromise = new Promise(function(resolve, reject) {
            resolveOnClick = resolve;
        });
        var submitForm = function() {
            resolveOnClick(result.input.val());
            result.input.prop('disabled', true);
            result.button.prop('disabled', true);
        };
        result.button.click(submitForm);
        result.input.keyup(function(e) {
            if (e.keyCode == 13) {
                submitForm();
            }
        });
        result.input.focus();
        return submittedPromise;
    } else {
        return "";
    }
}

BlockPyEngine.prototype.inputMockFunction = function(promptMessage) {
    if (Sk.queuedInput.length) {
        var next = Sk.queuedInput.pop();
        return next;
    } else {
        return "";
    }
}

/**
 * @param {skulpt Str} name - The filename as a Skulpt string.
 */
BlockPyEngine.prototype.openFile = function(name) {
    var filename = Sk.openFilenamePrefix || "";
    filename += name;
    elem = document.getElementById(filename);
    if (elem == null) {
        if (name in this.openedFiles) {
            return this.openedFiles[name];
        } else {
            throw new Sk.builtin.IOError("[Errno 2] No such file or directory: '" + name + "'");
        }
    } else {
        if (elem.nodeName.toLowerCase() == "textarea") {
            return elem.value;
        } else {
            return elem.textContent;
        }
    }
}


BlockPyEngine.prototype.openURL = function(url, type) {
    var server = this.main.components.server;
    var openedFiles = this.openedFiles;
    return new Promise( function(resolve, reject) {
        if (url in openedFiles) {
            resolve(openedFiles[url]);
        } else {
            server.loadFile(url, type, function(contents) {
                openedFiles[url] = contents;
                resolve(contents);
            }, function(message) {
                reject(new Sk.builtin.IOError("Cannot access url: "+url+" because "+message));
            })
        }
    });
}

BlockPyEngine.prototype.loadAllFiles = function() {
    var names = this.main.model.assignment.files();
    var feedback = this.main.components.feedback;
    for (var i = 0; i < names.length; ++i) {
        this.openURL(names[i], 'file')
            .then(function() {}, function(e) {
                feedback.internalError(e, "FileLoadError", "The file failed to load on the server.")
            });
    }
}

/**
 * Resets the state of the execution engine, including reinititializing
 * the execution buffer (trace, step, etc.), reseting the printer, and
 * hiding the trace button.
 *
 */
BlockPyEngine.prototype.resetExecution = function() {
    this.executionBuffer = {
        'trace': [],
        'step': 0,
        'last_step': 0,
        'line_number': 0,
    };
    this.main.model.execution.trace.removeAll();
    this.main.model.execution.step(0);
    this.main.model.execution.last_step(0);
    this.main.model.execution.line_number(0)
    this.main.components.printer.resetPrinter();
    this.main.model.execution.show_trace(false);
}

/**
 * "Steps" the execution of the code, meant to be used as a callback to the Skulpt
 * environment.
 * 
 * @param {Object} variables - Hash that maps the names of variables (Strings) to their Skulpt representation.
 * @param {Number} lineNumber - The corresponding line number in the source code that is being executed.
 * @param {Number} columnNumber - The corresponding column number in the source code that is being executed. Think of it as the "X" position to the lineNumber's "Y" position.
 * @param {String} filename - The name of the python file being executed (e.g., "__main__.py").
 */
BlockPyEngine.prototype.step = function(variables, lineNumber, columnNumber, filename) {
    if (filename == '__main__.py') {
        var currentStep = this.executionBuffer.step;
        var globals = this.parseGlobals(variables);
        this.executionBuffer.trace.push(
            {'step': currentStep,
             'filename': filename,
             //'block': highlightMap[lineNumber-1],
             'line': lineNumber,
             'column': columnNumber,
             'properties': globals.properties,
             'modules': globals.modules});
        this.executionBuffer.step = currentStep+1;
        this.executionBuffer.last_step = currentStep+1;
        this.executionBuffer.line_number = lineNumber;
    }
}

/**
 * Called at the end of the Skulpt execution to terminate the executionBuffer
 * and hand it off to the execution trace in the model.
 */
BlockPyEngine.prototype.lastStep = function() {
    var execution = this.main.model.execution;
    execution.trace(this.executionBuffer.trace);
    execution.step(this.executionBuffer.step)
    execution.last_step(this.executionBuffer.last_step)
    execution.line_number(this.executionBuffer.line_number)
}

BlockPyEngine.prototype.lookForLines = function(feedbackData) {
    var line = null;
    for (var i = 0; i < feedbackData.length; i+= 1) {
        if ('position' in feedbackData[i]) {
            line = feedbackData[i].position.line;
        }
    }
    return line;
}

/**
 * Activated whenever the Run button is clicked
 */
BlockPyEngine.prototype.on_run = function(afterwards) {
    this.main.model.execution.status("running");
    clearTimeout(this.main.components.editor.triggerOnChange);
    this.main.components.server.saveCode();
    var engine = this;
    var feedback = engine.main.components.feedback;
    var model = this.main.model;
    var printer = this.main.components.printer;
    engine.resetReports();
    engine.verifyCode();
    engine.updateParse();
    //engine.analyzeParse();
    engine.runStudentCode(function() {
        engine.runInstructorCode('give_feedback',false,  function(module) {
            if (Sk.executionReports['instructor']['success']) {
                // SUCCESS, SCORE, CATEGORY, LABEL, MESSAGE, DATA, HIDE
                console.log(module.$d);
                var success = Sk.ffi.remapToJs(module.$d.SUCCESS);
                var score = Sk.ffi.remapToJs(module.$d.SCORE);
                var message = Sk.ffi.remapToJs(module.$d.MESSAGE);
                var category = Sk.ffi.remapToJs(module.$d.CATEGORY);
                var label = Sk.ffi.remapToJs(module.$d.LABEL);
                var data = Sk.ffi.remapToJs(module.$d.DATA);
                var hide = Sk.ffi.remapToJs(module.$d.HIDE);
                var line = engine.lookForLines(data);
                feedback.presentFeedback(category, label, message, line);
                if (!feedback.isFeedbackVisible()) {
                    engine.main.components.toolbar.notifyFeedbackUpdate();
                    feedback.scrollIntoView();
                }
                score = Math.max(0.0, Math.min(1.0, score));
                var old_status = model.settings.completion_status();
                model.settings.completion_status(Math.max(old_status, score));
                if (success && category.toLowerCase() == "complete") {
                    engine.main.components.server.markSuccess(1.0);
                } else {
                    engine.main.components.server.markSuccess(score);
                }
                model.execution.status("complete");
                if (afterwards !== undefined) {
                    afterwards(result);
                }
                if (!Sk.executionReports.instructor.scrolling) {
                    try {
                        printer.scrollToBottom();
                    } catch (e) {}
                }
            } else {
                feedback.presentInstructorError();
            }
        });
    });
    this.main.components.server.logEvent('engine', 'on_run')
}
/**
 * Activated whenever the Python code changes
 */
BlockPyEngine.prototype.on_change = function() {
    var FILENAME = 'on_change';
    // TODO: Do we actually want to skip if this is the case?
    // Skip if the instructor has not defined anything
    if (!this.main.model.programs[FILENAME]().trim()) {
        return false;
    }
    this.main.model.execution.status("changing");
    this.main.components.server.saveCode();
    // On step does not perform parse analysis by default or run student code
    var engine = this;
    var feedback = this.main.components.feedback;
    engine.resetReports();
    engine.verifyCode();
    engine.updateParse();
    this.main.model.execution.suppressions['verifier'] = true;
    this.main.model.execution.suppressions['analyzer'] = true;
    this.main.model.execution.suppressions['student'] = true;
    this.main.model.execution.suppressions['parser'] = true;
    this.main.model.execution.suppressions['no errors'] = true;
    engine.runInstructorCode(FILENAME, true, function(module) {
        if (Sk.executionReports['instructor']['success']) {
            // SUCCESS, SCORE, CATEGORY, LABEL, MESSAGE, DATA, HIDE
            var success = Sk.ffi.remapToJs(module.$d.SUCCESS);
            var score = Sk.ffi.remapToJs(module.$d.SCORE);
            var message = Sk.ffi.remapToJs(module.$d.MESSAGE);
            var category = Sk.ffi.remapToJs(module.$d.CATEGORY);
            var label = Sk.ffi.remapToJs(module.$d.LABEL);
            var data = Sk.ffi.remapToJs(module.$d.DATA);
            var hide = Sk.ffi.remapToJs(module.$d.HIDE);
            var line = engine.lookForLines(data);
            if (!success &&
                !(category == "Instructor" &&  label == "No errors")) {
                feedback.presentFeedback(category, label, message, line);
                if (!feedback.isFeedbackVisible()) {
                    engine.main.components.toolbar.notifyFeedbackUpdate();
                    feedback.scrollIntoView();
                }
            }
            engine.main.model.execution.status("complete");
        }
    });
    engine.main.components.server.logEvent('engine', 'on_change')
}

/**
 * Reset reports and suppressions
 */
BlockPyEngine.prototype.resetReports = function() {
    var report = this.main.model.execution.reports;
    report['verifier'] = {};
    report['parser'] = {};
    //report['analyzer'] = {'success': true};
    report['student'] = {};
    report['instructor'] = {};
    var suppress = this.main.model.execution.suppressions;
    suppress['verifier'] = false;
    suppress['parser'] = false;
    /*suppress['analyzer'] = false;
    suppress['student'] = false;
    suppress['instructor'] = false;
    suppress['no errors'] = false;*/
}

BlockPyEngine.prototype.verifyCode = function() {
    this.main.model.execution.status("verifying");
    var report = this.main.model.execution.reports;
    var FILENAME = '__main__';
    var code = this.main.model.programs[FILENAME]();
    // Make sure it has code
    if (code.trim()) {
        report['verifier'] = {
            'success': true,
            'code': code
        }
    } else {
        report['verifier'] = {
            'success': false,
            'code': code
        }
    }
}

/**
 * Ensure that the parse information is up-to-date
 */
BlockPyEngine.prototype.updateParse = function() {
    this.main.model.execution.status("parsing");
    var FILENAME = '__main__';
    var code = this.main.model.programs[FILENAME]();
    var report = this.main.model.execution.reports;
    // Attempt a parse
    try {
        var parse = Sk.parse(FILENAME, code);
        var ast = Sk.astFromParse(parse.cst, FILENAME, parse.flags);
    } catch (error) {
        // Report the error
        report['parser'] = {
            'success': false,
            'error': error
        }
        return false;
    }
    // Successful parse
    report['parser'] = {
        'success': true,
        'ast': ast
    }
    return true;
}

/**
 * Run the abstract interpreter
 */
BlockPyEngine.prototype.analyzeParse = function() {
    this.main.model.execution.status("analyzing");
    var report = this.main.model.execution.reports;
    if (!report['parser']['success']) {
        report['analyzer'] = {
            'success': false,
            'error': 'Parser was unsuccessful. Cannot run Abstract Interpreter'
        }
        return false;
    }
    var ast = report['parser']['ast'];
    try {
        this.abstractInterpreter.processAst(ast);
    } catch (error) {
        report['analyzer'] = {
            'success': false,
            'error': error
        }
        return false;
    }
    report['analyzer'] = {
        'success': true,
        'variables': this.abstractInterpreter.report.topLevelVariables,
        'behavior': this.abstractInterpreter.report.variables,
        'issues': this.abstractInterpreter.report.issues
    }
    return true;
}

/**
 * Run the student code
 */
BlockPyEngine.prototype.runStudentCode = function(after) {
    this.main.model.execution.status("student");
    var report = this.main.model.execution.reports;
    var engine = this;
    // Prepare execution
    this.resetExecution();
    this.setStudentEnvironment();
    // Actually run the python code
    var filename = '__main__';
    var code = this.main.model.programs[filename]();
    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody(filename, false, code, true);
    }).then(
        // Success
        function (module) {
            Sk.afterSingleExecution(module.$d, -1, 0, filename+".py");
            engine.lastStep();
            report['student'] = {
                'success': true,
                'trace': engine.executionBuffer.trace,
                'lines': engine.executionBuffer.trace.map(x => x.line),
                'module': module,
                'output': engine.main.model.execution.output
            }
            after();
            engine.executionEnd_();
        },
        // Failure
        function (error) {
            report['student'] = {
                'success': false,
                'error': error,
            }
            console.error(error);
            after();
            engine.executionEnd_();
        }
    );
}

var NEW_LINE_REGEX = /\r\n|\r|\n/;

/**
 * Run the instructor code
 */
BlockPyEngine.prototype.runInstructorCode = function(filename, quick, after) {
    this.main.model.execution.status("instructor");
    var report = this.main.model.execution.reports;
    // Prepare execution
    this.setInstructorEnvironment();
    // Actually run the python code
    var studentCode = this.main.model.programs['__main__']();
    var studentCodeSafe = studentCode;
    //studentCode = JSON.stringify(studentCode);
    if (!report['parser'].success || !report['verifier'].success) {
        studentCodeSafe = 'pass';
    }
    Sk.builtinFiles.files['src/lib/pedal/sandbox/sandbox.py'] = 'class Sandbox: pass\ndef run(): pass\ndef reset(): pass\n';
    var instructorCode = this.main.model.programs[filename]();
    var lineOffset = instructorCode.split(NEW_LINE_REGEX).length;
    instructorCode = (
        //'timeit("initial")\n'+
        'from pedal.report import *\n'+
        'from pedal.source import set_source\n'+
        'set_source('+JSON.stringify(studentCode)+')\n'+
        'def run_student():\n'+
        '    #limit_execution_time()\n'+
        '    try:\n'+
        indent(indent(studentCodeSafe))+'\n'+
        '    except Exception as error:\n'+
        '        #unlimit_execution_time()\n'+
        '        return error\n'+
        '    #unlimit_execution_time()\n'+
        '    return None\n'+
        (quick ? '': 'from pedal.tifa import tifa_analysis\n')+
        (quick ? '': 'tifa_analysis(False)\n')+
        'from pedal.sandbox import compatibility\n'+
        'from utility import *\n'+
        'student = get_student_data()\n'+
        'compatibility.set_sandbox(student)\n'+
        'error, position = get_student_error()\n'+
        'compatibility.raise_exception(error, position)\n'+
        'compatibility.run_student = run_student\n'+
        'compatibility.get_plots = get_plots\n'+
        'compatibility.get_output = get_output\n'+
        'compatibility.reset_output = reset_output\n'+
        'compatibility.trace_lines = trace_lines\n'+
        'def capture_output(func, *args):\n'+
        '   reset_output()\n'+
        '   func(*args)\n'+
        '   return get_output()\n'+
        'compatibility.capture_output = capture_output\n'+
        'from pedal.cait.cait_api import parse_program\n'+
        instructorCode+'\n'+
        'from pedal.resolvers import simple\n'+
        'SUCCESS, SCORE, CATEGORY, LABEL, MESSAGE, DATA, HIDE = simple.resolve()'
    );
    lineOffset = instructorCode.split(NEW_LINE_REGEX).length - lineOffset;
    var engine = this;
    report['instructor'] = {
        'compliments': [],
        'filename': filename+".py",
        'code': instructorCode,
        //'complete': false // Actually, let's use undefined for now.
    };
    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody(filename, false, instructorCode, true);
    }).then(
        // Success
        function (module) {
            report['instructor']['success'] = true;
            after(module);
        },
        // Failure
        function (error) {
            if (error.tp$name === 'GracefulExit') {
                report['instructor']['success'] = true;
            } else {
                console.log(report['instructor']['code']);
                console.error(error);
                report['instructor']['success'] = false;
                report['instructor']['error'] = error;
                report['instructor']['line_offset'] = lineOffset;
            }
            after(error);
        }
    );
}


/**
 * Consume a set of variables traced from the execution and parse out any
 * global variables and modules.
 *
 * @param {Object} variables - a mapping of variable names to their Skupt value.
 */
BlockPyEngine.prototype.parseGlobals = function(variables) {
    var result = [];
    var modules = [];
    if (!this.main.model.settings.trace_off()) {
        for (var property in variables) {
            var value = variables[property];
            if (property !== "__name__" && 
                property !== "__doc__" && 
                property !== "__package__") {
                property = property.replace('_$rw$', '')
                                   .replace('_$rn$', '');
                var parsed = {"name": property, "type": "Unknown",
                              "value": value.toString()};
                try {
                    parsed = this.parseValue(property, value);
                } catch {
                    // Can't really do anything
                }
                if (parsed !== null) {
                    result.push(parsed);
                } else if (value.constructor == Sk.builtin.module) {
                    modules.push(value.$d.__name__.v);
                }
            }
        }
    }
    return {"properties": result, "modules": modules};
}

/**
 * Convert a Skulpt value into a more easily printable object.
 * 
 * @param {String} property
 * @param {Object} value - the skulpt value
 */
BlockPyEngine.prototype.parseValue = function(property, value) {
    if (value == undefined) {
        return {'name': property,
                'type': 'Unknown',
                "value": 'Undefined'
                };
    }
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
            if (value.sq$length <= 2000) {
                return {'name': property,
                    'type': "String",
                    "value": value.$r().v
                };
            } else {
                return {'name': property,
                    'type': "String",
                    "value": "["+value.sq$length()+" characters not shown]"
                };
            }
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
            if (value.v.length <= 20) {
                return {'name': property,
                    'type': "List",
                    "value": value.$r().v,
                    'exact_value': value
                };
            } else {
                return {'name': property,
                    'type': "List",
                    "value": "[... "+value.v.length+" elements ...]",
                    "exact_value": value
                };
            }
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
                    'type': value.tp$name == undefined ? value : value.tp$name,
                    "value": value.$r == undefined ? value : value.$r().v
                    };
    }
}

/**
 * Definable function to be run when execution has fully ended,
 * whether it succeeds or fails.
 */
BlockPyEngine.prototype.onExecutionEnd = null;

/**
 * Helper function that will attempt to call the defined onExecutionEnd,
 * but will do nothing if there is no function defined.
 */
BlockPyEngine.prototype.executionEnd_ = function() {
    if (this.onExecutionEnd !== null) {
        this.onExecutionEnd();
    }
};

Tifa = {};
if (typeof exports !== 'undefined') {
    exports.BlockPyEngine = BlockPyEngine;
    //exports.AbstractInterpreter = Tifa;
    exports.NodeVisitor = NodeVisitor;
    exports.StretchyTreeMatcher = StretchyTreeMatcher;
    exports.isSkBuiltin = isSkBuiltin;
    exports.isAstNode = isAstNode;
    exports.mixedRemapToPy = mixedRemapToPy;
}