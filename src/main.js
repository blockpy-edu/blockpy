/**
 * A helper function for extending an array based
 * on an "addArray" and "removeArray". Any element
 * found in removeArray is removed from the first array
 * and all the elements of addArray are added.
 * Creates a new array, so is non-destructive.
 *
 * @param {Array} array - the array to manipulate
 * @param {Array} addArray - the elements to add to the array
 * @param {Array} removeArray - the elements to remove from the array
 * @return {Array} The modified array
 */
function expandArray(array, addArray, removeArray) {
    var copyArray = array.filter(function(item) {
        return removeArray.indexOf(item) === -1;
    });
    return copyArray.concat(addArray);
}

/**
 * Creates an instance of BlockPy
 *
 * @constructor
 * @this {BlockPy}
 * @param {Object} settings - User level settings (e.g., what view mode, whether to mute semantic errors, etc.)
 * @param {Object} assignment - Assignment level settings (data about the loaded assignment, user, submission, etc.)
 * @param {Object} submission - Unused parameter.
 * @param {Object} programs - Includes the source code of any programs to be loaded
 */
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
            'disable_variable_types': ko.observable(settings.disable_variable_types || false),
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
    
    // The code for the current active program file (e.g., "__main__")
    this.model.program = ko.computed(function() {
        return this.programs[this.settings.filename()]();
    }, this.model) //.extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 400 } });
    
    // Whether this URL has been specified
    this.model.server_is_connected = function(url) {
        return this.constants.urls !== undefined && this.constants.urls[url] !== undefined;
    };
    
    // Helper function to map error statuses to UI elements
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
    
    // Helper function to map Server error statuses to UI elements
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
    
    // Program trace functions
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
    
    /**
     * Opens a new window to represent the exact value of a Skulpt object.
     * Particularly useful for things like lists that can be really, really
     * long.
     * 
     * @param {String} type - The type of the value
     * @param {Object} exact_value - A Skulpt value to be rendered.
     */
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
    // I'm not even sure these have any value any more.
    execution.trace.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.step.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.last_step.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.line_number.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    
    this.initMain();
}

/**
 * The default modules to make available to the user.
 *
 * @type Array.<String>
 */
BlockPy.DEFAULT_MODULES = ['Properties', 'Decisions', 
                           'Iteration',
                           'Calculation', 'Output', 
                           'Values', 
                           'Lists', 'Dictionaries']

/**
 * Initializes the BlockPy object by initializing its interface,
 * model, and components.
 *
 */
BlockPy.prototype.initMain = function() {
    this.initInterface();
    this.initModel();
    this.initComponents();
    if (this.model.settings.developer()) {
        this.initDevelopment();
    }
}

/**
 * Initializes the User Inteface for the instance, by loading in the
 * HTML file (which has been manually encoded into a JS string using
 * the build.py script). We do this because its a giant hassle to keep
 * HTML correct when it's stored in JS strings. We should look into
 * more sophisticated templating features, probably.
 *
 */
BlockPy.prototype.initInterface = function() {
    var constants = this.model.constants;
    // Refer to interface.js, interface.html, and build.py
    constants.container = $(constants.attachmentPoint).html($(BlockPyInterface))
}

/**
 * Applys the KnockoutJS bindings to the model, instantiating the values into the
 * HTML.
 */
BlockPy.prototype.initModel = function() {
    ko.applyBindings(this.model);
}

/**
 * Initializes each of the relevant components of BlockPy. For more information,
 * consult each of the component's relevant JS file in turn.
 */
BlockPy.prototype.initComponents = function() {
    var container = this.model.constants.container;
    this.components = {};
    var main = this,
        components = this.components;
    // Each of these components will take the BlockPy instance, and possibly a
    // reference to the relevant HTML location where it will be embedded.
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

/**
 * Initiailizes certain development data, useful for testing out new modules in
 * Skulpt.
 */
BlockPy.prototype.initDevelopment = function () {
    /*$.get('src/skulpt_ast.js', function(data) {
        Sk.builtinFiles['files']['src/lib/ast/__init__.js'] = data;
    });*/
}

/**
 * Redundant method for reporting an error. If this is used anywhere, it should be
 * converted to direct calls to components.feedback.
 */
BlockPy.prototype.reportError = function(component, original, message, line) {
    if (component == 'editor') {
        this.components.feedback.editorError(original, message, line);
    } else if (component == 'syntax') {
        this.components.feedback.syntaxError(original, message, line);
    }
    console.error(component, message)
}

/**
 * Helper function for setting the current code. I'm not sure if this is used anywhere.
 *
 */
BlockPy.prototype.setCode = function(code, name) {
    if (name === undefined) {
        name = this.model.settings.filename();
    }
    this.model.programs[name](code);
}
