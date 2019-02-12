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
    
    mod.trace_lines = new Sk.builtin.func(function() {
        if (Sk.executionReports['student'].success) {
            var lines = Sk.executionReports['student'].lines;
            return Sk.ffi.remapToPy(lines);
        } else {
            return new Sk.builtin.list([]);
        }
    });
    
    /**
     *
     */
    mod.get_student_error = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_student_error", arguments, 0, 0);
        var none = Sk.builtin.none.none$;
        if (Sk.executionReports['student'].success) {
            return new Sk.builtin.tuple([none, none]);
        } else {
            var error = Sk.executionReports['student'].error,
                position = {};
            if (error && error.traceback && error.traceback.length > 0) {
                position['line'] = error.traceback[0].lineno;
            } else {
                error = none;
            }
            position = Sk.ffi.remapToPy(position);
            return new Sk.builtin.tuple([error, position]);
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
    
    mod.suppress_scrolling = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("suppress_scrolling", arguments, 0, 0);
        Sk.executionReports.instructor.scrolling = true;
    });
    
    /*
    def hist(self, data, **kwargs):
        label = kwargs.get('label', None)
        self.active_plot['data'].append({'type': 'Histogram', 'values': data, 'label': label})
    def plot(self, xs, ys=None, **kwargs):
        label = kwargs.get('label', None)
        if ys == None:
            self.active_plot['data'].append({'type': 'Line', 
                                            'x': range(len(xs)), 'y': xs, 'label': label})
        else:
            self.active_plot['data'].append({'type': 'Line', 'x': xs, 'y': ys, 'label': label})
    def scatter(self, xs, ys, **kwargs):
        label = kwargs.get('label', None)
        self.active_plot['data'].append({'type': 'Scatter', 'x': xs, 'y': ys, 'label': label})
    */
    mod.get_plots = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_plots", arguments, 0, 0);
        if (Sk.executionReports['student'].success) {
            var outputs = Sk.executionReports['student']['output']();
            outputs = outputs.filter(function(output) { 
                return typeof output != "string"; 
            }).map(function(graph) {
                return {'data': graph.map(function(plot) {
                    var newPlot = { 'type': plot.type,
                                    'label': '' };
                    if (plot.type == "line" || plot.type == 'scatter') {
                        newPlot['x'] = plot.data.map(function(v) { return v.x });
                        newPlot['y'] = plot.data.map(function(v) { return v.y });
                    } else if (plot.type == "hist") {
                        newPlot['values'] = plot.data;
                    }
                    return newPlot;
                }), 
                    'xlabel': '', 'ylabel': '', 
                    'title': '', 'legend': false
                }
            });
            return mixedRemapToPy(outputs);
        } else {
            return Sk.ffi.remapToPy([]);
        }
    });
    
    // Provides `student` as an object with all the data that the student declared.
    mod.StudentData = Sk.misceval.buildClass(mod, function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function(self) {
            //self.data = Sk.builtin.dict();
            var newDict = Sk.builtin.dict();
            Sk.abstr.sattr(self, 'data', newDict, true);
            self.module = Sk.executionReports['student'].module;
            if (self.module !== undefined) {
                self.module = self.module.$d;
                for (var key in self.module) {
                    if (self.module.hasOwnProperty(key)) {
                        newDict.mp$ass_subscript(Sk.ffi.remapToPy(key), 
                                                 self.module[key]);
                    }
                }
            } else {
                self.module = {};
            }
        });
        $loc.get_names_by_type = new Sk.builtin.func(function(self, type, exclude_builtins) {
            Sk.builtin.pyCheckArgs("get_names_by_type", arguments, 2, 3);
            if (exclude_builtins === undefined) {
                exclude_builtins = true;
            } else {
                Sk.builtin.pyCheckType("exclude_builtins", "boolean", Sk.builtin.checkBool(exclude_builtins));
                exclude_builtins = Sk.ffi.remapToJs(exclude_builtins);
            }
            var result = [];
            for (var property in self.module) {
                if (self.module[property].tp$name == type.tp$name) {
                    //console.log(exclude_builtins);
                    if (exclude_builtins && property.startsWith("__")) {
                        continue;
                    }
                    result.push(Sk.ffi.remapToPy(property));
                }
            }
            return Sk.builtin.list(result);
        });
    
        $loc.get_values_by_type = new Sk.builtin.func(function(self, type, exclude_builtins) {
            Sk.builtin.pyCheckArgs("get_values_by_type", arguments, 2, 3);
            if (exclude_builtins === undefined) {
                exclude_builtins = true;
            } else {
                Sk.builtin.pyCheckType("exclude_builtins", "boolean", Sk.builtin.checkBool(exclude_builtins));
                exclude_builtins = Sk.ffi.remapToJs(exclude_builtins);
            }
            var result = [];
            for (var property in self.module) {
                if (self.module[property].tp$name == type.tp$name) {
                    if (exclude_builtins && property.startsWith("__")) {
                        continue;
                    }
                    result.push(self.module[property]);
                }
            }
            return Sk.builtin.list(result);
        });
    });
    mod.student = Sk.misceval.callsimOrSuspend(mod.StudentData);
    
    mod.get_student_data = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("get_student_data", arguments, 0, 0);
        return mod.student;
    });
    
    return mod;
}
