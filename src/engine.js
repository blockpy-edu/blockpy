/**
 * Printer
 * Responsible for executing code and cleaning the results
 */

function BlockPyEngine(main) {
    this.main = main;
    
    this.loadEngine();
    
    //this.main.model.program.subscribe(this.analyze.bind(this))
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
    this.main.model.execution.status("analyzing");
    
    // Get the code
    var code = this.main.model.programs['__main__']();
    if (code.trim() == "") {
        this.main.components.feedback.emptyProgram("You haven't written any code yet!");
        //this.main.model.feedback.status("semantic");
        return false;
    }
    
    var analyzer = new AbstractInterpreter(code);
    this.main.model.execution.ast = analyzer.ast;
    
    result = analyzer.analyze();
    // Syntax error
    if (result !== true) {
        this.main.reportError('syntax', result.error, "While attempting to convert the Python code into blocks, I found a syntax error. In other words, your Python code has a spelling or grammatical mistake. You should check to make sure that you have written all of your code correctly. To me, it looks like the problem is on line "+ result.error.args.v[2]+', where it says:<br><code>'+result.error.args.v[3][2]+'</code>', result.error.args.v[2]);
        return false;
    }
    
    var report = analyzer.report;
    // Semantic error
    //console.log(report);
    
    // TODO: variables defined AFTER their use
    if (report["Undefined variables"].length >= 1) {
        var variable = report["Undefined variables"][0];
        this.main.reportError('semantic', "Undefined Property", "The property <code>"+variable.name+"</code> was read on line "+variable.line.split("|")[0]+", but it was not defined on any previous lines. You cannot use a variable until it has been set.", variable.line.split("|")[0])
        return false;
    } else if (report["Unread variables"].length >= 1) {
        var variable = report["Unread variables"][0];
        this.main.reportError('semantic', "Unused Property", "The property <code>"+variable.name+"</code> was created on line "+variable.line.split("|")[0]+", but was never used.", variable.line.split("|")[0])
        return false;
    } else if (report["Overwritten variables"].length >= 1) {
        var variable = report["Overwritten variables"][0];
        this.main.reportError('semantic', "Overwritten Property", "The property <code>"+variable.name+"</code> was set on line "+variable.first_location.split("|")[0]+", but before it could be read it was changed on line "+variable.last_location.split("|")[0]+". It is unnecessary to change an existing variable's value without reading it first.", variable.last_location.split("|")[0])
        return false;
    }
    
    return true;
}

/*
 * Runs the given python code, resetting the console and Trace Table.
 */
BlockPyEngine.prototype.run = function() {
    // Reset everything
    this.reset();
    
    if (!this.main.model.settings.disable_semantic_errors()) {
        var success = this.analyze();
        if (success === false) {
            return;
        }
    }
    
    this.main.model.execution.status("running");
    
    var feedback = this.main.components.feedback;
    
    // Get the code
    var code = this.main.model.program();
    if (code.trim() == "") {
        feedback.emptyProgram();
        this.main.model.execution.status("error");
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
            //blockpy.explorer.reload(blockpy.traceTable, -1);
            // Handle checks
            feedback.noErrors()
            engine.check(code, execution.trace(), execution.output(), execution.ast);
            // Reenable "Run"
            engine.main.model.execution.status("waiting");
        },
        function(error) {
            feedback.printError(error);
            engine.main.model.execution.status("error");
            //server.logEvent('blockly_error', error);
        }
    );
}

BlockPyEngine.prototype.check = function(student_code, traceTable, output, ast) {
    var engine = this;
    var server = this.server;
    var on_run = this.main.model.programs['give_feedback']();
    if (on_run !== undefined && on_run.trim() !== "") {
        var backupExecution = Sk.afterSingleExecution;
        Sk.afterSingleExecution = undefined;
        
        // Old code to handle lame checking
        on_run += "\nresult = on_run('''"+student_code+"''', "+
                  JSON.stringify(output)+", "+
                  JSON.stringify(traceTable)+" "+
                  ")";
        console.log(on_run);
        
        // New code to handle sophisticated checking
        /*
        Sk.builtins.output = Sk.ffi.remapToPy(output);
        Sk.builtins.trace = Sk.ffi.remapToPy(traceTable);
        Sk.builtins.code = Sk.ffi.remapToPy(student_code);
        Sk.builtins.ast = Sk.ffi.remapToPy(ast);
        Sk.builtins.give_feedback = new Sk.builtin.func(function(message) {
            throw new Sk.builtin.SystemExit(message);
        });
        */
        
        var executionPromise = Sk.misceval.asyncToPromise(function() {
            return Sk.importMainWithBody("<stdin>", false, on_run, true);
        });
        executionPromise.then(
            function (module) {
                Sk.afterSingleExecution = backupExecution;
                var result = Sk.ffi.remapToJs(module.$d.result);
                if (result === true) {  
                    //server.markSuccess(1.0);
                    engine.main.components.feedback.complete();
                } else {
                    //server.markSuccess(0.0);
                    engine.main.components.feedback.instructorFeedback(result);
                }
            }, function (error) {
                Sk.afterSingleExecution = backupExecution;
                /*
                Sk.builtins.output = undefined;
                Sk.builtins.trace = undefined;
                Sk.builtins.code = undefined;
                Sk.builtins.ast = undefined;
                Sk.builtins.give_feedback = undefined;
                
                if (error.tp$name == "SystemExit") {
                    engine.main.components.feedback.instructorFeedback("Incorrect Answer", error.args.v[0].v);
                } else {
                    engine.main.components.feedback.error("Error in instructor's feedback. "+error);
                }
                */
                engine.main.components.feedback.error("Error in instructor's feedback. "+error);
                console.error("Instructor Feedback Error:", error);
                //server.logEvent('blockly_instructor_error', error);
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