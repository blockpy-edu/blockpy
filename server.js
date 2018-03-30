// BlockPy Loading
Blockly = {};
Blockly.WorkspaceSvg = new function() {};
Blockly.WorkspaceSvg.prototype = {};
skulpt = require('./skulpt/dist/skulpt.min.js')
skulpt_libs = require('./skulpt/dist/skulpt-stdlib.js')
d3 = require('d3-3');
blockpy = require('./dist/blockpy_node.js')
var trace = function() {
    
};
trace.removeAll = x => x;
mockFeedback = {
    'isFeedbackVisible': x => true,
    'clear': x => x,
    //'presentFeedback': x => blockpy.BlockPyFeedback.prototype.presentFeedback.bind(mockFeedback)(x),
    'presentFeedback': x => x, //console.log(Sk.executionReports.instructor.complaint),
    'presentAnalyzerFeedback': x => blockpy.BlockPyFeedback.prototype.presentAnalyzerFeedback.bind(mockFeedback)(x),
    'instructorFeedback': (name, message, line) => name, //console.log(name, message, line),
}
var printHtml = ((e,v) => this.printed.push(v));
main = {
    'components': {
        'printer': {
            'print': e => this.printed.push(e.slice(0, -1)), //console.log("PRINTED", e),
            'printHtml': printHtml,
            'resetPrinter': e => this.printed = [], //console.log("PRINTER RESET"),
            'getConfiguration': function() {
                    var printerSettings = {}
                    printerSettings['printHtml']= printHtml;
                    printerSettings['width']= 500;
                    printerSettings['pngMode']= false;
                    printerSettings['skipDrawing']= true;
                    printerSettings['height']= 500;
                    printerSettings['container']= null;
                    return printerSettings;
                }
        },
        'editor': {
            'triggerOnChange': 0
        },
        'server': {
            'logEvent': x => x,
            'markSuccess': x => x,
        },
        'feedback': mockFeedback,
        'toolbar': {
            
        }
    },
    'model': {
        'execution': {
            'reports': {},
            'suppressions': {},
            'status': v => this['status'] = v,
            'trace': trace,
            'step': x => x,
            'last_step': x => x,
            'line_number': x => x,
            'show_trace': x => x,
            'output': v => this.printed
        },
        'programs': {
            '__main__': v => 'a = "Words"\nprint(a)',
            'give_feedback': v => 'from instructor import *\ngently("You have failed.")\ngently("Not bad!")',
        },
        'settings': {
            'disable_timeout': x => false,
            'mute_printer': x => this['mute_printer'] = x,
            'preventD3': false,
            'trace_off': v => true,
        }
    }
};
main.components.feedback.main = main;
engine = new blockpy.BlockPyEngine(main);
Sk.afterSingleExecution = engine.step.bind(engine);

// Progress Bar stuff
var ProgressBar = require('progress');

// JSON File loading
const loadJsonFile = require('load-json-file');

// Read as string
var fs = require('fs');
function readModuleFile(path, callback) {
    try {
        var filename = require.resolve(path);
        fs.readFile(filename, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}

StretchyTreeMatcher = blockpy.StretchyTreeMatcher;
isSkBuiltin = blockpy.isSkBuiltin;
mixedRemapToPy = blockpy.mixedRemapToPy;
isAstNode = blockpy.isAstNode;

// Hardcoded datasets
_IMPORTED_DATASETS = {};
AbstractInterpreter = blockpy.AbstractInterpreter;
NodeVisitor = blockpy.NodeVisitor;
datasets = ['publishers', 'state_demographics', 'school_scores', 'weather', 'tate', 'earthquakes'];
datasets.forEach(slug => {
    readModuleFile('./data_analysis/corgis/'+slug+'_skulpt.js', function (err, words) {
        Sk.builtinFiles['files']['src/lib/'+slug+'/__init__.js'] = words;
    });
    require('./data_analysis/corgis/'+slug+'_abstract.js')
    require('./data_analysis/corgis/'+slug+'_dataset.js')
});
/*
for (var name in _IMPORTED_DATASETS) {
    for (var key in _IMPORTED_DATASETS[name]) {
        var original = _IMPORTED_DATASETS[name][key]['data'];
        _IMPORTED_DATASETS[name][key]['data'] = ; //original.slice(0, 10);
    }
}*/
//console.log(AbstractInterpreter.MODULES)

// Actual work
final_result = []
// 'data_analysis/ct_experimental_post_run_submissions.json'
filename = process.argv[2];
loadJsonFile('data_analysis/f17_ct_solutions.json').then(assignment_solutions => {
    // f17_ct_8-5_change_steps
    // s17_post_run_submissions
    // quick_test.json
    // ct_f17_post_run_submissions.json
    // ct_experimental_post_run_submissions
    loadJsonFile(filename).then(data => {
        subs = data.submissions;
        var next = function(subi, stui) {
            processSub(subs[subi][stui], function() {
                stui += 1;
                if (stui >= subs[subi].length) {
                    stui = 0;
                    subi += 1;
                }
                if (subi < subs.length) {
                    next(subi, stui);
                } else {
                    //f17_ct_stepped_new_8-5
                    //f17_post_checked
                    // './data_analysis/ct_experimental_post_checked.json'
                    fs.writeFile(filename.slice(0, -5)+'-post.json', 
                                 JSON.stringify(final_result, undefined, 2), 
                                 {'spaces':2}, 
                                 function (err) {
                         if (err) {
                            console.error("ERROR", err);
                         }
                    });
                }
            });
        };
        function processSub(sub, callback) {
            if (sub === undefined) {
                callback();
                return;
            }
            var instructor_code = assignment_solutions[""+sub.aid];
            var student_code = sub.code;
            if (student_code == "") {
                final_result.push({
                    'aid': sub.aid,
                    'assignment': sub.assignment,
                    'semester': sub.semester,
                    'time_spent': sub.time_spent,
                    'step_number': sub['step number'],
                    'run_number': sub['run number'],
                    'user': sub.user,
                    'uid': sub.uid,
                    'timestamp': sub.timestamp,
                    'code': sub.code,
                    'messages': ['nocode'],
                    'ran': false,
                    'analyzers': [],
                    'complete': false
                })
                callback();
            } else {
                main.model.programs.__main__ = v => student_code;
                main.model.programs.give_feedback = v => instructor_code;
                Sk.console= {skipDrawing: false};
                result = engine.on_run(v => {
                    var ms = Sk.executionReports.instructor.complaint ?
                             Sk.executionReports.instructor.complaint.map(x => x.message.match(/.*\((.*)\).*/).pop()) 
                             : [];
                    console.log(sub.user, sub.assignment, sub['run number'], 
                                ms.length, 
                                !!Sk.executionReports.instructor.complete);
                    var analyzers = [];
                    for (var issue in Sk.executionReports.analyzer.issues) {
                        if (Sk.executionReports.analyzer.issues[issue].length) {
                            analyzers.push(issue)
                        }
                    }
                    /*if (Sk.executionReports.instructor.complete) {
                        console.log(JSON.stringify(Sk.executionReports['analyzer'], null, 2));
                    }*/
                    final_result.push({
                        'aid': sub.aid,
                        'assignment': sub.assignment,
                        'user': sub.user,
                        'uid': sub.uid,
                        'timestamp': sub.timestamp,
                        'semester': sub.semester,
                        'time_spent': sub.time_spent,
                        'step_number': sub['step number'],
                        'run_number': sub['run number'],
                        'code': sub.code,
                        'messages': ms,
                        'ran': !!Sk.executionReports.student.success,
                        'analyzers': analyzers,
                        'complete': !!(Sk.executionReports.instructor.complete)
                    })
                    callback();
                });
            }
        }
        next(0, 0);
    });
});
