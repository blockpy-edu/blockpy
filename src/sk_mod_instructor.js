/**
 * Skulpt Module for holding the Instructor API.
 *
 * This module is loaded in by getting the functions' source code from toString.
 * Isn't that crazy?
 *
 * @param {String} name - The name of the module (should always be 'instructor')
 *
 */
var $sk_mod_instructor = function(name) {
    // Main module object that gets returned at the end.
    var mod = {};
    
    var prior = null;
    mod.timeit = new Sk.builtin.func(function(name) {
        Sk.builtin.pyCheckArgs("timeit", arguments, 1, 1);
        var difference;
        if (prior === null) {
            difference = 0;
        } else {
            difference = Date.now() - prior;
        }
        console.log(Sk.ffi.remapToJs(name), difference/1000);
        prior = Date.now();
    });
    
    /**
     * Logs feedback to javascript console
     */
    mod.log = new Sk.builtin.func(function(message) {
        Sk.builtin.pyCheckArgs("log", arguments, 1, 1);
        console.log(Sk.ffi.remapToJs(message));
    });
    
    /**
     * Logs debug to javascript console
     */
    mod.debug = new Sk.builtin.func(function(message) {
        Sk.builtin.pyCheckArgs("log", arguments, 1, 1);
        console.log(message);
    });

    
    /**
     * This function coverts the output in the student report to a python 
     * list and returns it.
    **/
    mod.get_output = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_output", arguments, 0, 0);
        if (Sk.executionReports['student'].success) {
            return mixedRemapToPy(Sk.executionReports['student']['output']());
        } else {
            return Sk.ffi.remapToPy([]);
        }
    });
    
    /**
     * This function resets the output, particularly useful if the student
     * code is going to be rerun.
     */
    mod.reset_output = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("reset_output", arguments, 0, 0);
        if (Sk.executionReports['student'].success) {
            Sk.executionReports['student']['output'].removeAll();
        }
    });
    
    mod.queue_input = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("queue_input", arguments, 1, Infinity);
        var args = arguments;
        for (var i = args.length-1; i >= 0; i--) {
            var input = args[i];
            Sk.builtin.pyCheckType("input", "string", Sk.builtin.checkString(input));
            Sk.queuedInput.push(Sk.ffi.remapToJs(input));
        }
    });
    
    /**
     * This function is called by instructors to get the students' code as a string.
    **/
    mod.get_program = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_program", arguments, 0, 0);
        return Sk.ffi.remapToPy(Sk.executionReports['verifier'].code);
    });
    
    /**
     *
     */
    mod.get_student_error = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_student_error", arguments, 0, 0);
        if (Sk.executionReports['student'].success) {
            return Sk.builtin.none.none$;
        } else {
            return Sk.executionReports['student'].error;
        }
    });

    /**
     * This function is called by instructors to construct the python version of the AST
    **/
    mod.parse_program = new Sk.builtin.func(function() {
        var result = parseProgram();
        if(result == null){
            return Sk.builtin.none.none$;
        }else{
            return Sk.misceval.callsimOrSuspend(mod.AstNode, 0);
        }
    });
    
    mod.had_execution_time_error = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("had_execution_time_error", arguments, 0, 0);
        return !Sk.executionReports['student'].success && 
                Sk.executionReports['student'].error &&
                Sk.executionReports['student'].error.tp$name == 'TimeLimitError';
    });
    
    var backupTime = undefined;
    mod.limit_execution_time = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("limit_execution_time", arguments, 0, 0);
        backupTime = Sk.execLimit;
        if (Sk.execLimitFunction) {
            Sk.execLimit = Sk.execLimitFunction();
            Sk.execStart = Date.now();
        }
    });
    mod.unlimit_execution_time = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("unlimit_execution_time", arguments, 0, 0);
        Sk.execLimit = backupTime;
        Sk.execStart = Date.now()
    });
    
    return mod;
}
