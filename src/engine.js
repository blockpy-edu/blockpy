function BlockPyEngine(main, tag) {
    this.main = main;
    
    this.parse = null;
}

BlockPyEngine.prototype.loadCode = function(code) {
    // Create parse
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
}

/*
 * Runs the given python code, resetting the console and Trace Table.
 */
BlockPyEngine.prototype.run = function() {
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

BlockPyEngine.prototype.check = function(student_code, traceTable, output) {
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