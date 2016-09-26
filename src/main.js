function expandArray(array, addArray, removeArray) {
    var copyArray = array.filter(function(item) {
        return removeArray.indexOf(item) === -1;
    });
    return copyArray.concat(addArray);
}

function BlockPy(settings, assignment, submission, programs) {
    this.model = {
        // User level settings
        "settings": {
            // Default mode when you open the screen is text
            // 'text', 'blocks'
            'editor': ko.observable(assignment.initial_view),
            // Default mode when you open the screen is instructor
            // boolean
            'instructor': ko.observable(settings.instructor),
            'instructor_initial': ko.observable(settings.instructor),
            // boolean
            'enable_blocks': ko.observable(settings.blocks_enabled),
            // boolean
            'read_only': ko.observable(settings.read_only),
            // string
            'filename': ko.observable("__main__"),
            // string
            'level': ko.observable("level"),
            // boolean
            'disable_semantic_errors': ko.observable(settings.disable_semantic_errors),
            // boolean
            'auto_upload': ko.observable(true),
            // boolean
            'developer': ko.observable(settings.developer || false),
            // boolean
            'mute_printer': ko.observable(false)
        },
        'execution': {
            // 'waiting', 'running'
            'status': ko.observable('waiting'),
            // integer
            'step': ko.observable(0),
            // integer
            'last_step': ko.observable(0),
            // list of string/list of int
            'output': ko.observableArray([]),
            // integer
            'line_number': ko.observable(0),            
            // array of simple objects
            'trace': ko.observableArray([]),
            // integer
            'trace_step': ko.observable(0),
            // object
            'ast': {},
            // boolean
            'show_trace': ko.observable(false),
        },
        'status': {
            // boolean
            'loaded': ko.observable(false),
            'text': ko.observable("Loading"),
            // 'none', 'runtime', 'syntax', 'semantic', 'feedback', 'complete', 'editor'
            'error': ko.observable('none'),
            // "Loading", "Saving", "Ready", "Disconnected", "Error"
            'server': ko.observable("Loading"),
            // Dataset loading
            'dataset_loading': ko.observableArray()
        },
        'constants': {
            // string
            'blocklyPath': settings.blocklyPath,
            // boolean
            'blocklyScrollbars': true,
            // string
            'attachmentPoint': settings.attachmentPoint,
            // JQuery object
            'container': null,
            // Maps codes ('log_event', 'save_code') to URLs
            'urls': settings.urls
        },
        // Assignment level settings
        "assignment": {
            'modules': ko.observableArray(expandArray(BlockPy.DEFAULT_MODULES, assignment.modules.added || [], assignment.modules.removed || [])),
            'assignment_id': assignment.assignment_id,
            'student_id': assignment.student_id,
            'course_id': assignment.course_id,
            'version': ko.observable(assignment.version),
            //'lis_result_sourcedid': assignment.lis_result_sourcedid,
            'name': ko.observable(assignment.name),
            'introduction': ko.observable(assignment.introduction),
            "initial_view": ko.observable(assignment.initial_view || 'Blocks'),
            'parsons': ko.observable(assignment.parsons),
            'upload': ko.observable(assignment.initial_view == 'Upload'),
            'importable': ko.observable(assignment.importable),
        },
        "programs": {
            "__main__": ko.observable(programs.__main__),
            "starting_code": ko.observable(assignment.starting_code),
            "give_feedback": ko.observable(assignment.give_feedback),
        }
    };
    this.model.program = ko.computed(function() {
        return this.programs[this.settings.filename()]();
    }, this.model) //.extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 400 } });
    
    this.model.server_is_connected = function(url) {
        return this.constants.urls !== undefined && this.constants.urls[url] !== undefined;
    };
    
    this.model.status_feedback_class = ko.computed(function() {
        switch (this.status.error()) {
            default: case 'none': return ['label-none', ''];
            case 'runtime': return ['label-runtime-error', 'Runtime Error'];
            case 'syntax': return ['label-syntax-error', 'Syntax Error'];
            case 'editor': return ['label-syntax-error', 'Editor Error'];
            case 'internal': return ['label-internal-error', 'Internal Error'];
            case 'semantic': return ['label-semantic-error', 'Semantic Error'];
            case 'feedback': return ['label-feedback-error', 'Incorrect Answer'];
            case 'complete': return ['label-problem-complete', 'Complete'];
            case 'no errors': return ['label-no-errors', 'No errors'];
        }
    }, this.model);
    
    this.model.status_server_class = ko.computed(function() {
        switch (this.status.server()) {
            default: case 'Loading': return ['label-default', 'Loading'];
            case 'Offline': return ['label-default', 'Offline'];
            case 'Loaded': return ['label-success', 'Loaded'];
            case 'Logging': return ['label-primary', 'Logging'];
            case 'Saving': return ['label-primary', 'Saving'];
            case 'Saved': return ['label-success', 'Saved'];
            case 'Disconnected': return ['label-danger', 'Disconnected'];
            case 'Error': return ['label-danger', 'Error'];
        }
    }, this.model);
    
    var execution = this.model.execution;
    this.model.moveTraceFirst = function(index) { 
        execution.trace_step(0); };
    this.model.moveTraceBackward = function(index) { 
        var previous = Math.max(execution.trace_step()-1, 0);
        execution.trace_step(previous); };
    this.model.moveTraceForward = function(index) { 
        var next = Math.min(execution.trace_step()+1, execution.last_step());
        execution.trace_step(next); };
    this.model.moveTraceLast = function(index) { 
        execution.trace_step(execution.last_step()); };
    this.model.current_trace = ko.pureComputed(function() {
        return execution.trace()[Math.min(execution.trace().length-1, execution.trace_step())];
    });
    
    this.model.viewExactValue = function(type, exact_value) {
        return function() {
            if (type == "List") {
                var output = exact_value.$r().v;
                var result = (window.btoa?'base64,'+btoa(JSON.stringify(output)):JSON.stringify(output));
                window.open('data:application/json;' + result);
            }
        }
    }
    
    // For performance reasons, batch notifications for execution handling.
    execution.trace.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.step.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.last_step.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.line_number.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    
    this.initMain();
}

BlockPy.DEFAULT_MODULES = ['Properties', 'Decisions', 
                           'Iteration',
                           'Calculation', 'Output', 
                           'Values', 
                           'Lists', 'Dictionaries']

BlockPy.prototype.initMain = function() {
    this.initInterface();
    this.initModel();
    this.initComponents();
    if (this.model.settings.developer()) {
        this.initDevelopment();
    }
}

BlockPy.prototype.initInterface = function(postCompletion) {
    var constants = this.model.constants;
    constants.container = $(constants.attachmentPoint).html($(BlockPyInterface))
}

BlockPy.prototype.initModel = function() {
    ko.applyBindings(this.model);
}

BlockPy.prototype.initComponents = function() {
    var container = this.model.constants.container;
    this.components = {};
    var main = this,
        components = this.components;
    components.dialog = new BlockPyDialog(main, container.find('.blockpy-popup'));
    components.toolbar  = new BlockPyToolbar(main,  container.find('.blockpy-toolbar'));
    components.feedback = new BlockPyFeedback(main, container.find('.blockpy-feedback'));
    components.editor   = new BlockPyEditor(main,   container.find('.blockpy-editor'));
    components.presentation = new BlockPyPresentation(main, container.find('.blockpy-presentation'));
    components.printer = new BlockPyPrinter(main, container.find('.blockpy-printer'));
    components.engine = new BlockPyEngine(main);
    components.server = new BlockPyServer(main);
    components.corgis = new BlockPyCorgis(main);
    components.english = new BlockPyEnglish(main);
    components.editor.setMode();
    main.model.status.server('Loaded')
}

BlockPy.prototype.initDevelopment = function () {
    /*$.get('src/skulpt_ast.js', function(data) {
        Sk.builtinFiles['files']['src/lib/ast/__init__.js'] = data;
    });*/
}

BlockPy.prototype.reportError = function(component, original, message, line) {
    if (component == 'editor') {
        this.components.feedback.editorError(original, message, line);
    } else if (component == 'syntax') {
        this.components.feedback.syntaxError(original, message, line);
    }
    console.error(component, message)
}

/*
function BlockPy(attachmentPoint, mode, presentation, current_code,
                on_run, on_change, starting_code, instructor, view, blocklyPath,
                settings,
                urls, questionProperties) {
    // User programs
}
*/

BlockPy.prototype.activateToolbar = function() {
    var elements = this.toolbar.elements;
    var blockpy = this, server = this.server;
    // Editor mode
    
    elements.to_pseudo.click(function(ev) {
        ev.preventDefault();
        blockpy.editor.updateBlocks();
        server.logEvent('editor', 'pseudo');
        var popup = blockpy.mainDiv.find('.blockpy-popup');
        popup.find('.modal-title').html("Pseudo-code Explanation");
        popup.find('.modal-body').html(Blockly.Pseudo.workspaceToCode(blockpy.editor.blockly));
        popup.modal('show');
    });
    blockpy.mainDiv.find('.blockpy-popup').on('hidden.bs.modal', function () {
        server.logEvent('editor', 'close_pseudo');
    });
    if (!this.model.settings.instructor) {
        elements.blockpy_mode.hide();
        //elements.to_rst.hide();
    }
    // Run
    elements.run.click(function() {
        server.logEvent('editor', 'run');
        blockpy.run();
    });
    // Undo
    elements.undo.click(function() {
        server.logEvent('editor', 'undo');
        if (blockpy.model.settings.editor() == 'blocks') {
            blockpy.editor.blockly.undo();
        } else {
            blockpy.editor.text.undo();
        }
    });
    // Redo
    elements.redo.click(function() {
        server.logEvent('editor', 'redo');
        if (blockpy.model.settings.editor() == 'blocks') {
            blockpy.editor.blockly.redo();
        } else {
            blockpy.editor.text.redo();
        }
    });
    // Wide
    var left = blockpy.mainDiv.find('.blockpy-content-left'),
        right = blockpy.mainDiv.find('.blockpy-content-right');
    elements.wide.click(function() {
        if (elements.wide.attr("data-side") == "skinny") {
            server.logEvent('editor', 'wide');
            // Make it skinny
            elements.wide.attr("data-side", "wide")
                         .html('<i class="fa fa-ellipsis-h"></i> Wide');
            // Left side
            left.removeClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
            left.addClass('col-md-7 col-sm-7 col-xs-7');
            // Right side
            right.removeClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
            right.addClass('col-md-5 col-xs-5 col-sm-5');
        } else {
            server.logEvent('editor', 'skinny');
            // Make it wide
            elements.wide.attr("data-side", "skinny")
                         .html('<i class="fa fa-ellipsis-v"></i> Skinny');
            // Left side
            left.removeClass('col-md-7 col-xs-7 col-sm-7');
            left.addClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
            // Right side
            right.removeClass('col-md-5 col-xs-5 col-sm-7');
            right.addClass('col-md-10 col-sm-12 col-xs-12 col-md-offset-1');
        }
        // Hack: Force the blockly window to fit the width
        if (blockpy.model.settings.editor == 'blocks') {
            blockpy.editor.blockly.render();
        }
    });
    // Reset code
    elements.reset.click(function() {
        server.logEvent('editor', 'reset');
        blockpy.setCode(blockpy.model.programs.starting_code);
    });
    // Clear code
    elements.clear.click(function() {
        server.logEvent('editor', 'clear');
        blockpy.setCode("");
    });
    // Align blocks
    elements.align.click(function() {
        server.logEvent('editor', 'align');
        blockpy.editor.blockly.align();
    });
    // Change programs
    for (var name in this.model.programs) {
        this.toolbar.addProgram(name);
    }
    this.toolbar.elements.programs.button('toggle').change(function(event) {
        if (blockpy.silentChange_) {
            blockpy.silentChange_ = false;
        } else {
            var name = $(event.target).attr("data-name");
            blockpy.changeProgram(name);
        }
    });
    
    var parsonBox = blockpy.mainDiv.find('.blockpy-presentation-parsons-check input');
    var textFirstBox = blockpy.mainDiv.find('.blockpy-presentation-text-first input');
    var nameEditor = blockpy.mainDiv.find('.blockpy-presentation-name-editor');
    var updatePresentation = function() {
        blockpy.model.settings.parsons = parsonBox.prop('checked');
        blockpy.model.settings.text_first = textFirstBox.prop('checked');
        blockpy.server.savePresentation(blockpy.presentation.get(), 
                                       nameEditor.val(), 
                                       blockpy.model.settings.parsons,
                                       blockpy.model.settings.text_first);
    }
    // Save name editing
    nameEditor.change(updatePresentation);
    // Parsons checkbox
    parsonBox.change(updatePresentation).prop('checked', this.model.settings.parsons);
    // Text first checkbox
    textFirstBox.change(updatePresentation).prop('checked', this.model.settings.text_first);
}

BlockPy.prototype.setCode = function(code, name) {
    if (name === undefined) {
        name = this.model.settings.filename();
    }
    this.model.programs[name](code);
}

BlockPy.prototype.alert = function(message) {
    var box = this.mainDiv.find('.blockpy-alert');
    box.text(message).show();
    return box;
}

/*
 * Resets skulpt to some default values
 */