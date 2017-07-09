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

BlockPyEngine.INSTRUCTOR_MODULE_CODE = 'var $builtinmodule = '+$sk_mod_instructor.toString();

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
    // Access point for instructor data
    Sk.executionReport = this.main.model.execution.reports;
}

/**
 *
 */
BlockPyEngine.prototype.configureStudentEnvironment = function() {
    // Limit execution to 5 seconds
    Sk.execLimit = this.main.model.settings.disable_timeout() ? null : 5000;
    // Identify the location to put new charts
    Sk.console = printer.getConfiguration();
    // Stepper! Executed after every statement.
    Sk.afterSingleExecution = this.step.bind(this);
    // Unlink the instructor module to prevent abuse
    delete Sk.builtinFiles['files']['src/lib/instructor.js'];
    // Unmute everything
    Sk.skip_drawing = false;
    model.settings.mute_printer(false);
}
BlockPyEngine.prototype.configureInstructorEnvironment = function() {
    // Instructors have no limits
    Sk.execLimit = null;
    // Identify the location to put new charts
    Sk.console = printer.getConfiguration();
    // Stepper! Executed after every statement.
    Sk.afterSingleExecution = null;
    // Create the instructor module
    Sk.builtinFiles['files']['src/lib/instructor.js'] = this.INSTRUCTOR_MODULE_CODE;
    // Mute everything
    Sk.skip_drawing = true;
    model.settings.mute_printer(true);
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
    if (filename == '<stdin>.py') {
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
 * Runs the AbstractInterpreter to get some static information about the code,
 * in particular the variables' types. This is needed for type checking.
 *
 * @returns {Object<String, AIType>} Maps variable names (as Strings) to types as constructed by the AbstractIntepreter.
 */
BlockPyEngine.prototype.analyzeVariables = function() {
    // Get the code
    var code = this.main.model.programs['__main__']();
    if (code.trim() == "") {
        return {};
    }
    
    var analyzer = new AbstractInterpreter(code);
    report = analyzer.report;
    return analyzer.variableTypes;
}

/**
 * Runs the AbstractInterpreter to get some static information about the code,
 * including potential semantic errors. It then parses that information to give
 * feedback.
 *
 * @returns {Boolean} Whether the code was successfully analyzed.
 */
BlockPyEngine.prototype.analyze = function() {
    this.main.model.execution.status("analyzing");
    
    var feedback = this.main.components.feedback;
    
    // Get the code
    var code = this.main.model.programs['__main__']();
    if (code.trim() == "") {
        this.main.components.feedback.emptyProgram("You haven't written any code yet!");
        //this.main.model.feedback.status("semantic");
        return false;
    }
    
    var analyzer = new AbstractInterpreter(code);
    this.main.model.execution.ast = analyzer.ast;
    
    report = analyzer.report;
    // Syntax error
    if (report.error !== false) {
        console.log(report.error.args.v)
        var codeLine = '.';
        if (report.error.args.v.length > 3) {
            codeLine = ', where it says:<br><code>'+report.error.args.v[3][2]+'</code>';
        }
        feedback.editorError(report.error, "While attempting to process your Python code, I found a syntax error. In other words, your Python code has a mistake in it (e.g., mispelled a keyword, bad indentation, unnecessary symbol). You should check to make sure that you have written all of your code correctly. To me, it looks like the problem is on line "+ report.error.args.v[2]+codeLine, report.error.args.v[2]);
        return false;
    }
        
    if (report["Unconnected blocks"].length >= 1) {
        var variable = report['Unconnected blocks'][0];
        feedback.semanticError("Unconnected blocks", "It looks like you have unconnected blocks on line "+variable.position.line+". Before you run your program, you must make sure that all of your blocks are connected and that there are no unfilled holes.", variable.position.line)
        return false;
    } else if (report['Iteration variable is iteration list'].length >= 1) {
        var variable = report['Iteration variable is iteration list'][0];
        feedback.semanticError("Iteration Problem", "The property <code>"+variable.name+"</code> was iterated on line "+variable.position.line+", but you used the same variable as the iteration variable. You should choose a different variable name for the iteration variable. Usually, the iteration variable is the singular form of the iteration list (e.g., <code>for dog in dogs:</code>).", variable.position.line)
        return false;
    } else if (report["Undefined variables"].length >= 1) {
        var variable = report["Undefined variables"][0];
        feedback.semanticError("Initialization Problem", "The property <code>"+variable.name+"</code> was read on line "+variable.position.line+", but it was not given a value on a previous line. You cannot use a property until it has been initialized.", variable.position.line)
        return false;
    } else if (report["Possibly undefined variables"].length >= 1) {
        var variable = report["Possibly undefined variables"][0];
        feedback.semanticError("Initialization Problem", "The property <code>"+variable.name+"</code> was read on line "+variable.position.line+", but it was possibly not given a value on a previous line. You cannot use a property until it has been initialized. Check to make sure that this variable was declared in all of the branches of your decision.", variable.position.line);
        return false;
    } else if (report["Unread variables"].length >= 1) {
        var variable = report["Unread variables"][0];
        feedback.semanticError("Unused Property", "The property <code>"+variable.name+"</code> was set, but was never used after that.", null)
        return false;
    } else if (report["Overwritten variables"].length >= 1) {
        var variable = report["Overwritten variables"][0];
        feedback.semanticError("Overwritten Property", "The property <code>"+variable.name+"</code> was set, but before it could be read it was changed on line "+variable.position.line+". It is unnecessary to change an existing variable's value without reading it first.", variable.position.line)
        return false;
    } else if (report["Empty iterations"].length >= 1) {
        var variable = report["Empty iterations"][0];
        feedback.semanticError("Iterating over empty list", "The property <code>"+variable.name+"</code> was set as an empty list, and then you attempted to iterate over it on "+variable.position.line+". You should only iterate over non-empty lists.", variable.position.line)
        return false;
    } else if (report["Non-list iterations"].length >= 1) {
        var variable = report["Non-list iterations"][0];
        feedback.semanticError("Iterating over non-list", "The property <code>"+variable.name+"</code> is not a list, but you attempted to iterate over it on "+variable.position.line+". You should only iterate over non-empty lists.", variable.position.line)
        return false;
    } else if (report["Incompatible types"].length >= 1) {
        var variable = report["Incompatible types"][0];
        feedback.semanticError("Incompatible types", "You attempted to "+variable.operation+" a "+variable.left.type+" and a "+variable.right.type+" on line "+variable.position.line+". But you can't do that with that operator. Make sure both sides of the operator are the right type.", variable.position.line)
        return false;
    }
    
    return true;
}

var GLOBAL_VALUE;

/**
 * Activated whenever the Run button is clicked
 */
BlockPyEngine.prototype.on_run = function() {
    this.main.model.execution.status("running");
    var engine = this;
    engine.updateParse();
    engine.analyzeParse();
    engine.runStudentCode().then(
    function() {
        engine.runInstructorCode().then(
        function() {
            engine.presentFeedback();
        });
    });
}
/**
 * Activated whenever the Python code changes
 */
BlockPyEngine.prototype.on_step = function() {
    this.main.model.execution.status("changing");
    // Skip if the instructor has not defined anything
    if (!this.main.model.programs['on_step']().trim()) {
        return false;
    }
    // On step does not perform parse analysis by default or run student code
    var engine = this;
    engine.updateParse();
    engine.runInstructorCode().then(
    function() {
        engine.presentFeedback()
    });
}

/**
 * Ensure that the parse information is up-to-date
 */
BlockPyEngine.prototype.updateParse = function() {
    this.main.model.execution.status("parsing");
    var filename = '__main__';
    var code = this.main.model.programs[filename];
    var report = this.main.model.execution.report;
    // Attempt a parse
    try {
        var parse = Sk.parse(filename, code);
        var ast = Sk.astFromParse(parse.cst, filename, parse.flags);
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
    var report = this.main.model.execution.report;
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
        'issues': this.abstractInterpreter.report
    }
    return true;
}

/**
 * Run the student code
 */
BlockPyEngine.prototype.runStudentCode = function(after) {
    this.main.model.execution.status("student");
    var report = this.main.model.execution.report;
    // Prepare execution
    this.resetExecution();
    // Actually run the python code
    var filename = '__main__';
    var code = this.main.model.programs[filename];
    var executionPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody(filename, false, code, true);
    });
}

/**
 * Runs the given python code, resetting the console and Trace Table.
 */
BlockPyEngine.prototype.run = function() {
    // Reset everything
    this.resetExecution();
    
    if (!this.main.model.settings.disable_semantic_errors() &&
        !this.main.model.assignment.disable_algorithm_errors()) {
        var success = this.analyze();
        if (success === false) {
            this.executionEnd_();
            this.main.components.server.markSuccess(0.0);
            return;
        }
    }
    
    this.main.model.execution.status("running");
    
    var feedback = this.main.components.feedback;
    
    // Get the code
    var code = this.main.model.programs['__main__']();
    if (code.trim() == "") {
        feedback.emptyProgram();
        this.main.model.execution.status("error");
        this.executionEnd_();
        this.main.components.server.markSuccess(0.0);
        return;
    }
    // Actually run the python code
    var executionPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, code, true);
    });
    
    var engine = this;
    var server = this.server;
    var execution = this.main.model.execution;
    executionPromise.then(
        function (module) {
            // Run the afterSingleExecution one extra time for final state
            Sk.afterSingleExecution(module.$d, -1, 0, "<stdin>.py");
            engine.lastStep();
            // Handle checks
            feedback.noErrors()
            engine.check(code, execution.trace(), execution.output(), execution.ast, module.$d);
            // Reenable "Run"
            engine.main.model.execution.status("waiting");
            engine.executionEnd_();
        },
        function(error) {
            feedback.printError(error);
            engine.main.model.execution.status("error");
            engine.executionEnd_();
            server.markSuccess(0.0);
            //server.logEvent('blockly_error', error);
        }
    );
}

/**
 * Indents the given string by 4 spaces. This correctly handles multi-line strings.
 *
 * @param {String} str - The string to be manipulated.
 * @returns {String} The string with four spaces added at the start of every new line.
 */
function indent(str) {
  return str.replace(/^(?=.)/gm, '    ');
}

BlockPyEngine.prototype.setupEnvironment = function(student_code, traceTable, output, ast, final_values) {
    var model = this.main.model;
    this._backup_execution = Sk.afterSingleExecution;
    Sk.afterSingleExecution = undefined;
    Sk.builtins.get_output = new Sk.builtin.func(function() { 
        Sk.builtin.pyCheckArgs("get_output", arguments, 0, 0);
        return Sk.ffi.remapToPy(model.execution.output());
    });
    Sk.builtins.reset_output = new Sk.builtin.func(function() { 
        Sk.builtin.pyCheckArgs("reset_output", arguments, 0, 0);
        model.execution.output.removeAll();
    });
    Sk.builtins.log = new Sk.builtin.func(function(data) { 
        Sk.builtin.pyCheckArgs("log", arguments, 1, 1);
        console.log(data)
    });
    //Sk.builtins.trace = Sk.ffi.remapToPy(traceTable);
    Sk.builtins._trace = traceTable;
    Sk.builtins._final_values = final_values;
    Sk.builtins.code = Sk.ffi.remapToPy(student_code);
    Sk.builtins.set_success = this.instructor_module.set_success;
    Sk.builtins.set_feedback = this.instructor_module.set_feedback;
    Sk.builtins.set_finished = this.instructor_module.set_finished;
    Sk.builtins.count_components = this.instructor_module.count_components;
    Sk.builtins.no_nonlist_nums = this.instructor_module.no_nonlist_nums;
    Sk.builtins.only_printing_properties = this.instructor_module.only_printing_properties;
    Sk.builtins.calls_function = this.instructor_module.calls_function;
    Sk.builtins.get_property = this.instructor_module.get_property;
    Sk.builtins.get_value_by_name = this.instructor_module.get_value_by_name;
    Sk.builtins.get_value_by_type = this.instructor_module.get_value_by_type;
    Sk.builtins.parse_json = this.instructor_module.parse_json;
    Sk.builtins.Stack = this.instructor_module.Stack;

    Sk.skip_drawing = true;
    model.settings.mute_printer(true);
}

BlockPyEngine.prototype.disposeEnvironment = function() {
    Sk.afterSingleExecution = this._backup_execution;
    Sk.builtins.get_output = undefined;
    Sk.builtins.reset_output = undefined;
    Sk.builtins.log = undefined;
    Sk.builtins._trace = undefined;
    Sk.builtins.trace = undefined;
    Sk.builtins.code = undefined;
    Sk.builtins.set_success = undefined;
    Sk.builtins.set_feedback = undefined;
    Sk.builtins.set_finished = undefined;
    Sk.builtins.count_components = undefined;
    Sk.builtins.calls_function = undefined;
    Sk.builtins.get_property = undefined;
    Sk.builtins.get_value_by_name = undefined;
    Sk.builtins.get_value_by_type = undefined;
    Sk.builtins.no_nonlist_nums = undefined;
    Sk.builtins.only_printing_properties = undefined;
    Sk.builtins.parse_json = undefined;
    Sk.skip_drawing = false;
    GLOBAL_VALUE = undefined;
    this.main.model.settings.mute_printer(false);
}

BlockPyEngine.prototype.check = function(student_code, traceTable, output, ast, final_values) {
    var engine = this;
    var server = this.main.components.server;
    var model = this.main.model;
    var on_run = model.programs['give_feedback']();
    if (on_run !== undefined && on_run.trim() !== "") {
        on_run = 'def run_code():\n'+indent(student_code)+'\n'+on_run;
        this.setupEnvironment(student_code, traceTable, output, ast, final_values);
        
        var executionPromise = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, on_run, true);
        });
        executionPromise.then(
            function (module) {
                engine.main.components.feedback.noErrors();
                engine.disposeEnvironment();
            }, function (error) {
                engine.disposeEnvironment();
                console.log(error.tp$name, error.tp$name == "Success");
                if (error.tp$name == "Success") {
                    server.markSuccess(1.0, model.settings.completedCallback);
                    engine.main.components.feedback.complete();
                } else if (error.tp$name == "Feedback") {
                    server.markSuccess(0.0);
                    engine.main.components.feedback.instructorFeedback("Incorrect Answer", error.args.v[0].v);
                } else if (error.tp$name == "Finished") {
                    server.markSuccess(1.0, model.settings.completedCallback);
                    engine.main.components.feedback.finished();
                } else {
                    console.error(error);
                    engine.main.components.feedback.internalError(error, "Feedback Error", "Error in instructor's feedback. Please show the above message to an instructor!");
                    server.logEvent('blockly_instructor_error', ''+error);
                    server.markSuccess(0.0);
                }
            });
    }
}

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