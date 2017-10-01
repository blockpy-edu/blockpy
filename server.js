Blockly = {};
Blockly.WorkspaceSvg = new function() {};
Blockly.WorkspaceSvg.prototype = {};
skulpt = require('./skulpt/dist/skulpt.min.js')
skulpt_libs = require('./skulpt/dist/skulpt-stdlib.js')
blockpy = require('./dist/blockpy_node.js')
var trace = function() {
    
};
trace.removeAll = x => x;
engine = new blockpy.BlockPyEngine({
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
        'feedback': {
            'isFeedbackVisible': x => true,
            'presentFeedback': x => console.log(x),
        },
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
            '__main__': v => 'a = 0\nprint(a)',
            'give_feedback': v => 'log(student.data)',
        },
        'settings': {
            'disable_timeout': x => false,
            'mute_printer': x => this['mute_printer'] = x,
        }
    }
});
result = engine.on_run();
console.log(engine)