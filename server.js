// BlockPy Loading
Blockly = {};
Blockly.WorkspaceSvg = new function() {};
Blockly.WorkspaceSvg.prototype = {};
skulpt = require('./skulpt/dist/skulpt.min.js')
skulpt_libs = require('./skulpt/dist/skulpt-stdlib.js')
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
main = {
    'components': {
        'printer': {
            'print': e => this.printed.push(e.slice(0, -1)), //console.log("PRINTED", e),
            'printHtml': e => this.printed.push(e),
            'resetPrinter': e => this.printed = [], //console.log("PRINTER RESET"),
            'getConfiguration': blockpy.BlockPyPrinter.getDisabledConfiguration,
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

// Hardcoded datasets
_IMPORTED_DATASETS = {};
AbstractInterpreter = blockpy.AbstractInterpreter;
NodeVisitor = blockpy.NodeVisitor;
datasets = ['publishers', 'state_demographics', 'school_scores'];
datasets.forEach(slug => {
    readModuleFile('./data_analysis/corgis/'+slug+'_skulpt.js', function (err, words) {
        Sk.builtinFiles['files']['src/lib/'+slug+'/__init__.js'] = words;
    });
    require('./data_analysis/corgis/'+slug+'_abstract.js')
    require('./data_analysis/corgis/'+slug+'_dataset.js')
});

console.log(AbstractInterpreter.MODULES)

// Actual work
final_result = []
loadJsonFile('data_analysis/f17_ct_solutions.json').then(assignment_solutions => {
    loadJsonFile('data_analysis/f17_ct_posts_short.json').then(data => {
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
                    fs.writeFile('./data_analysis/f17_ct_processed_new.json', 
                                 JSON.stringify(final_result), 
                                 {'spaces':2}, 
                                 function (err) {
                         console.error(err);
                    });
                }
            });
        };
        function processSub(sub, callback) {
            var instructor_code = assignment_solutions[""+sub.aid];
            var student_code = sub.code;
            main.model.programs.__main__ = v => student_code;
            main.model.programs.give_feedback = v => instructor_code;
            result = engine.on_run(v => {
                console.log(sub.user, sub.assignment);
                var ms = Sk.executionReports.instructor.complaint ?
                         Sk.executionReports.instructor.complaint.map(x => x.message.match(/.*\((.*)\).*/).pop()) : [];
                //console.log(ms);
                final_result.push({
                    'aid': sub.aid,
                    'assignment': sub.assignment,
                    'user': sub.user,
                    'uid': sub.uid,
                    'timestamp': sub.timestamp,
                    'code': sub.code,
                    'messages': ms,
                    'complete': !!(Sk.executionReports.instructor.complete)
                })
                callback();
            });
        }
        next(0, 0);
    });
});
