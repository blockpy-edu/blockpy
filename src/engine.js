/**
 * Printer
 * Responsible for executing code and cleaning the results
 */

function BlockPyEngine(main) {
    this.main = main;
    
    this.loadEngine();
}

BlockPyEngine.prototype.loadEngine = function() {
    var engine = this;
    var printer = this.main.components.printer;
    // Skulpt settings
    // No connected services
    Sk.connectedServices = {}
    // Limit execution to 5 seconds
    Sk.execLimit = 5000;
    // Ensure version 3, so we get proper print handling
    Sk.python3 = true;
    // Major Skulpt configurations
    Sk.configure({
        // Function to handle the text outputted by Skulpt
        output: printer.print.bind(printer),
        // Function to handle loading in new files
        read: this.readFile.bind(this)
    });
    // Identify the location to put new charts
    Sk.console = printer.getConfiguration();
    // Stepper!
    Sk.afterSingleExecution = this.step.bind(this);
}

BlockPyEngine.prototype.loadCode = function(code) {
    // Create parse
}

BlockPyEngine.prototype.readFile = function(filename) {
    if (Sk.builtinFiles === undefined ||
        Sk.builtinFiles["files"][filename] === undefined) {
        throw "File not found: '" + filename + "'";
    }
    return Sk.builtinFiles["files"][filename];
}

BlockPyEngine.prototype.reset = function() {
    this.main.model.execution.trace.removeAll();
    this.main.model.execution.step(0);
    this.main.model.execution.line_number(0)
    this.main.components.printer.resetPrinter();
}

BlockPyEngine.prototype.step = function(variables, lineNumber, 
                                       columnNumber, filename, astType, ast) {
    if (filename == '<stdin>.py') {
        var currentStep = this.main.model.execution.step();
        var globals = this.parseGlobals(variables);
        this.main.model.execution.trace.push(
            {'step': currentStep,
             'filename': filename,
             //'block': highlightMap[lineNumber-1],
             'line': lineNumber,
             'column': columnNumber,
             'properties': globals.properties,
             'modules': globals.modules});
        this.main.model.execution.step(currentStep+1)
        this.main.model.execution.line_number(lineNumber)
    }
}

/*
Syntax Error
Runtime Error
Semantic Error
Question Error
*/

/*
 * Gives suggestions on the given code
 */
BlockPyEngine.prototype.analyze = function() {
    /*var ai = new AbstractInterpreter();
    try {
        var results = ai.analyze(code);
        this.printAnalysis(results);
    } catch (e) {
        // pass
    }*/
}

/*
 * Runs the given python code, resetting the console and Trace Table.
 */
BlockPyEngine.prototype.run = function() {
    this.main.model.execution.status("running");
    
    var feedback = this.main.components.feedback;
    
    // Reset everything
    this.reset();
    
    // Get the code
    var code = this.main.model.program();
    if (code.trim() == "") {
        feedback.printError("You haven't written any code yet!");
        this.main.model.execution.status("error");
        return;
    }
    // Actually run the python code
    var executionPromise = Sk.misceval.asyncToPromise(function() {
        return Sk.importMainWithBody("<stdin>", false, code, true);
    });
    
    var blockpy = this;
    var server = this.server;
    executionPromise.then(
        function (module) {
            // Run the afterSingleExecution one extra time for final state
            Sk.afterSingleExecution(module.$d, -1, 0, "<stdin>.py");
            //blockpy.explorer.reload(blockpy.traceTable, -1);
            // Handle checks
            //blockpy.check(code, blockpy.traceTable, blockpy.outputList);
            // Reenable "Run"
            blockpy.main.model.execution.status("waiting");
        },
        function(error) {
            feedback.printError(error);
            blockpy.main.model.execution.status("error");
            //server.logEvent('blockly_error', error);
        }
    );
}

BlockPyEngine.prototype.check = function(student_code, traceTable, output) {
    var blockpy = this;
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
                    blockpy.server.markSuccess(1.0);
                    blockpy.feedback.success();
                } else {
                    blockpy.server.markSuccess(0.0);
                    blockpy.feedback.error(result);
                }
                Sk.afterSingleExecution = backupExecution;
            }, function (error) {
                Sk.afterSingleExecution = backupExecution;
                blockpy.feedback.error("Error in instructor's feedback. "+error);
                console.error("Instructor Feedback Error:", error);
                server.logEvent('blockly_instructor_error', error);
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