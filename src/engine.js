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
    
    // Keeps track of the tracing while the program is executing
    this.executionBuffer = {};
    this.abstractInterpreter = new AbstractInterpreter();
}

BlockPyEngine.prototype.INSTRUCTOR_MODULE_CODE = 'var $builtinmodule = '+$sk_mod_instructor.toString();
BlockPyEngine.prototype.INSTRUCTOR_MODULE_CODE_ITERATION = 'from instructor import *\ndef test_for_counting_problem():\n    if ast.has("For"):\n        set_success()';

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
    // Create an input box
    Sk.inputfunTakesPrompt = true;
    Sk.inputfun = this.inputFunction.bind(this);
    // Allow file access
    Sk.openFilenamePrefix = "sk-filename-";
    // Access point for instructor data
    Sk.executionReports = this.main.model.execution.reports;
    Sk.feedbackSuppressions = this.main.model.execution.suppressions;
}

/**
 *
 */
BlockPyEngine.prototype.setStudentEnvironment = function() {
    // Limit execution to 5 seconds
    Sk.execLimit = this.main.model.settings.disable_timeout() ? null : 5000;
    // Identify the location to put new charts
    Sk.console = this.main.components.printer.getConfiguration();
    // Stepper! Executed after every statement.
    Sk.afterSingleExecution = this.step.bind(this);
    // Unlink the instructor module to prevent abuse
    delete Sk.builtinFiles['files']['src/lib/instructor.js'];
    // Unmute everything
    Sk.skip_drawing = false;
    this.main.model.settings.mute_printer(false);
}
BlockPyEngine.prototype.setInstructorEnvironment = function() {
    // Instructors have no limits
    Sk.execLimit = undefined;
    // Stepper! Executed after every statement.
    Sk.afterSingleExecution = null;
    // Create the instructor module
    Sk.builtinFiles['files']['src/lib/instructor.js'] = this.INSTRUCTOR_MODULE_CODE;
    Sk.builtinFiles['files']['src/lib/instructor_iteration.py'] = this.INSTRUCTOR_MODULE_CODE_ITERATION;
    // Mute everything
    Sk.skip_drawing = true;
    this.main.model.settings.mute_printer(true);
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

/**
 * Resets the state of the execution engine, including reinitailizing
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

/**
 * Activated whenever the Run button is clicked
 */
BlockPyEngine.prototype.on_run = function() {
    this.main.model.execution.status("running");
    var engine = this;
    var model = this.main.model;
    engine.resetReports();
    engine.verifyCode();
    engine.updateParse();
    engine.analyzeParse();
    engine.runStudentCode(function() {
        engine.runInstructorCode('give_feedback', function() {
            var result = engine.main.components.feedback.presentFeedback();
            if (result == 'success' || result == 'no errors') {
                engine.main.components.server.markSuccess(1.0, model.settings.completedCallback);
            } else {
                engine.main.components.server.markSuccess(0.0, model.settings.completedCallback);
            }
            model.execution.status("complete");
        });
    });
}
/**
 * Activated whenever the Python code changes
 */
BlockPyEngine.prototype.on_step = function() {
    this.main.model.execution.status("changing");
    var FILENAME = 'on_step';
    // TODO: Do we actually want to skip if this is the case?
    // Skip if the instructor has not defined anything
    if (!this.main.model.programs[FILENAME]().trim()) {
        return false;
    }
    // On step does not perform parse analysis by default or run student code
    var engine = this;
    engine.resetReports();
    engine.verifyCode();
    engine.updateParse();
    engine.runInstructorCode(FILENAME, function() {
        engine.main.components.feedback.presentFeedback()
        engine.main.model.execution.status("complete");
    });
}

/**
 * Reset reports and suppressions
 */
BlockPyEngine.prototype.resetReports = function() {
    var report = this.main.model.execution.reports;
    report['verifier'] = {};
    report['parser'] = {};
    report['analyzer'] = {};
    report['student'] = {};
    report['instructor'] = {};
    var suppress = this.main.model.execution.suppressions;
    suppress['verifier'] = false;
    suppress['parser'] = false;
    suppress['analyzer'] = false;
    suppress['student'] = false;
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
    }
    report['analyzer'] = {
        'success': true,
        'variables': this.abstractInterpreter.variableTypes,
        'behavior': this.abstractInterpreter.variablesNonBuiltin,
        'issues': this.abstractInterpreter.report
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
                'error': error
            }
            after();
            engine.executionEnd_();
        }
    );
}

/**
 * Run the instructor code
 */
BlockPyEngine.prototype.runInstructorCode = function(filename, after) {
    this.main.model.execution.status("instructor");
    var report = this.main.model.execution.reports;
    // Prepare execution
    this.setInstructorEnvironment();
    // Actually run the python code
    var studentCode = this.main.model.programs['__main__']();
    if (!report['parser'].success) {
        studentCode = 'pass';
    }
    instructorCode = (
        'from instructor import *\n'+
        'def run_student():\n'+
        '    try:\n'+
        indent(indent(studentCode))+'\n'+
        '    except Exception as error:\n'+
        '        return error\n'+
        '    return None\n'+
        this.main.model.programs[filename]()
    );
    var engine = this;
    report['instructor'] = {
        'compliments': [],
        //'complete': false // Actually, let's use undefined for now.
    };
    Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody(filename, false, instructorCode, true);
    }).then(
        // Success
        function (module) {
            report['instructor']['success'] = true;
            after();
        },
        // Failure
        function (error) {
            if (error.tp$name === 'GracefulExit') {
                report['instructor']['success'] = true;
            } else {
                report['instructor']['success'] = false;
                report['instructor']['error'] = error;
            }
            after();
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