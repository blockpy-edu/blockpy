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
    'presentFeedback': x => blockpy.BlockPyFeedback.prototype.presentFeedback.bind(mockFeedback)(x),
    'presentAnalyzerFeedback': x => blockpy.BlockPyFeedback.prototype.presentAnalyzerFeedback.bind(mockFeedback)(x),
    'instructorFeedback': (name, message, line) => console.log(name, message, line),
}
main = {
    'components': {
        'printer': {
            'print': e => console.log("PRINTED", e),
            'resetPrinter': e => console.log("PRINTER RESET"),
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
        },
        'programs': {
            '__main__': v => 'a = "Words"\nprint(a)',
            'give_feedback': v => 'from instructor import *\ngently("You have failed.")',
        },
        'settings': {
            'disable_timeout': x => false,
            'mute_printer': x => this['mute_printer'] = x,
        }
    }
};
main.components.feedback.main = main;
engine = new blockpy.BlockPyEngine(main);
result = engine.on_run();
main.components.feedback