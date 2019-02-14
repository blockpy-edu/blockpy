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
function BlockPy(settings, assignment, programs) {
    this.localSettings = new LocalStorageWrapper('localSettings');
    this.initModel(settings);
    if (assignment !== undefined) {
        this.setAssignment(settings, assignment, programs);
    }
    this.initModelMethods();
    this.initMain();
}

/**
 * The default modules to make available to the user.
 *
 * @type Array.<String>
 */
BlockPy.DEFAULT_MODULES = ['Variables', 'Decisions', 
                           'Iteration',
                           'Calculation', 'Output', 'Input',
                           'Values', 'Conversion',
                           'Lists', 'Dictionaries']

/**
 * Initializes the BlockPy object by initializing its interface,
 * model, and components.
 *
 */
BlockPy.prototype.initMain = function() {
    this.turnOnHacks();
    this.initInterface();
    this.applyModel();
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
BlockPy.prototype.applyModel = function() {
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
    components.history = new BlockPyHistory(main);
    components.english = new BlockPyEnglish(main);
    components.editor.setMode();
    main.model.status.server('Loaded')
    
    var statusBox = container.find(".blockpy-status-box");
    main.model.status.server.subscribe(function(newValue) {
        if (newValue == "Error" || 
            newValue == "Offline" ||
            newValue == "Disconnected") {
            if (!statusBox.is(':animated')) {
                statusBox.effect("shake");
            }
        } else if (newValue == "Out of date") {
            if (!statusBox.is(':animated')) {
                statusBox.effect("shake").effect("shake");
            }
        }
    });
    statusBox.tooltip();
    
    main.model.assignment.name.subscribe(function(newValue) {
        document.title = "BlockPy: "+newValue;
    });
    
    var setPresentationMode = function(is_set) {
        if (is_set) {
            container.find('.blockpy-content-left').removeClass('col-md-6 col-sm-6');
            container.find('.blockpy-content-left').addClass('col-md-12 col-sm-12');
            container.find('.blockpy-content-right').hide();
            container.find('.blockpy-toolbar-row').hide();
            container.find('.blockpy-content-bottom').hide();
            container.find('.blockpy-printer').css("height", "400px");
        } else {
            container.find('.blockpy-content-left').removeClass('col-md-12 col-sm-12');
            container.find('.blockpy-content-left').addClass('col-md-6 col-sm-6');
            container.find('.blockpy-content-right').show();
            container.find('.blockpy-toolbar-row').show();
            container.find('.blockpy-content-bottom').show();
            container.find('.blockpy-printer').css("height", "200px");
        }
    };
    this.model.settings.presentation_mode.subscribe(setPresentationMode);
    setPresentationMode(this.model.settings.presentation_mode());
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
 * Helper function for setting the current code, optionally in the given filename.
 *
 * @param {String} code - The new Python source code to set.
 * @param {String?} name - An optional filename (e.g,. '__main__') to update. Defaults to the currently selected filename.
 * @returns {Boolean} - whether the code was updated (i.e. there was a diff between new and old).
 */
BlockPy.prototype.setCode = function(code, name) {
    if (name === undefined) {
        name = this.model.settings.filename();
    }
    var original = this.model.programs[name]();
    this.model.programs[name](code);
    return original != this.model.programs[name]();
}

/**
 * Initializes the model to its defaults
 */
BlockPy.prototype.initModel = function(settings) {
    var getDefault = this.localSettings.getDefault.bind(this.localSettings);
    this.model = {
        // User level settings
        'settings': {
            // Default mode when you open the screen is text
            // 'Text', 'Blocks', "Split"
            'editor': ko.observable(settings.editor || getDefault('editor','Split')),
            // Default mode when you open the screen is instructor
            // boolean
            'instructor': ko.observable(settings.instructor),
            // Track the original value
            // boolean
            'instructor_initial': ko.observable(settings.instructor),
            // Internal for Refresh mechanism to fix broken logs
            // String
            'log_id': ko.observable(null),
            // boolean
            'enable_blocks': ko.observable(true),
            // Whether the canvas is read-only
            // boolean
            'read_only': ko.observable(false),
            // Whether to skip tracing dynamically
            // boolean
            'trace_off': ko.observable(false),
            // The current filename that we are editing
            // string
            'filename': ko.observable("__main__"),
            // boolean
            'show_settings': ko.observable(false),
            // boolean
            'disable_semantic_errors': ko.observable(false),
            // boolean
            'disable_variable_types': ko.observable(false),
            // boolean
            'disable_timeout': ko.observable(false),
            // boolean
            'auto_upload': ko.observable(true),
            // boolean
            'forceUpdate': ko.observable(false),
            // boolean
            'developer': ko.observable(false),
            // boolean
            'mute_printer': ko.observable(false),
            // function
            'completedCallback': settings.completedCallback,
            // boolean
            'server_connected': ko.observable(true),
            // boolean
            'presentation_mode': ko.observable(settings.presentation_mode),
            // Completion status (0 incomplete, 1 complete, (0,1) is partial
            'completion_status': ko.observable(0),
        },
        // Assignment level settings
        'assignment': {
            'modules': ko.observableArray(BlockPy.DEFAULT_MODULES),
            'files': ko.observableArray([]),
            'assignment_id': ko.observable(null),
            'student_id': ko.observable(null),
            'course_id': ko.observable(null),
            'group_id': ko.observable(null),
            'version': ko.observable(0),
            'name': ko.observable('Untitled'),
            'introduction': ko.observable(''),
            "initial_view": ko.observable('Split'),
            'parsons': ko.observable(false),
            'upload': ko.observable(false),
            'importable': ko.observable(false),
            'secret': ko.observable(false),
            'disable_algorithm_errors': ko.observable(false),
            'disable_timeout': ko.observable(false)
        },
        // Programs' actual code
        'programs': {
            "__main__": ko.observable(''),
            "starting_code": ko.observable(''),
            "give_feedback": ko.observable(''),
            "on_change": ko.observable(''),
            "answer": ko.observable('')
        },
        // Information about the current run of the program
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
            // boolean
            'show_trace': ko.observable(false),
            // boolean
            'trace_off': ko.observable(false),
            // object: strings => objects
            'reports': {},
            // objects: strings => boolean
            'suppressions': {}
            
        },
        // Internal and external status information
        'status': {
            // boolean
            'loaded': ko.observable(false),
            // Status text
            // string
            'text': ko.observable("Loading"),
            // 'none', 'runtime', 'syntax', 'semantic', 'feedback', 'complete', 'editor'
            'error': ko.observable('none'),
            // "Loading", "Saving", "Ready", "Disconnected", "Error"
            'server': ko.observable("Loading"),
            // Some message from a server error can go here
            'server_error': ko.observable(''),
            // Dataset loading
            // List of promises
            'dataset_loading': ko.observableArray(),
        },
        // Constant globals for this page, cannot be changed
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
    }
}

/**
 * Define various helper methods that can be used in the view, based on 
 * data from the model.
 */
BlockPy.prototype.initModelMethods = function() {
    // The code for the current active program file (e.g., "__main__")
    this.model.program = ko.computed(function() {
        return this.programs[this.settings.filename()]();
    }, this.model)
    this.model.program_updated = ko.computed(function() {
        return this.programs[this.settings.filename()]();
    }, this.model).extend({ rateLimit: { 
        method: "notifyWhenChangesStop", timeout: 1000
    }});
    
    // Whether this URL has been specified
    this.model.server_is_connected = function(url) {
        return this.settings.server_connected() &&
               this.constants.urls !== undefined && this.constants.urls[url] !== undefined;
    };
    
    var modelSettings = this.model.settings;
    this.model.showHideSettings = function() {
        modelSettings.show_settings(!modelSettings.show_settings());
    };
    
    // Helper function to map error statuses to UI elements
    this.model.status_feedback_class = ko.computed(function() {
        switch (this.status.error().toLowerCase()) {
            default: case 'none': return ['label-none', ''];
            case 'runtime': return ['label-runtime-error', 'Runtime Error'];
            case 'syntax': return ['label-syntax-error', 'Syntax Error'];
            case 'editor': return ['label-syntax-error', 'Editor Error'];
            case 'internal': return ['label-internal-error', 'Internal Error'];
            case 'semantic': case 'analyzer': return ['label-semantic-error', 'Algorithm Error'];
            case 'feedback': case "instructor": return ['label-feedback-error', 'Incorrect Answer'];
            case 'complete': return ['label-problem-complete', 'Complete'];
            case 'no errors': return ['label-no-errors', 'No errors'];
        }
    }, this.model);
    
    // Helper function to map Server error statuses to UI elements
    this.model.status_server_class = ko.computed(function() {
        switch (this.status.server()) {
            default: case 'Loading': return ['label-default', 'Loading'];
            case 'Offline': return ['label-default', 'Offline'];
            case 'Out of date': return ['label-danger', 'Out of Date'];
            case 'Loaded': return ['label-success', 'Loaded'];
            case 'Logging': return ['label-primary', 'Logging'];
            case 'Saving': return ['label-primary', 'Saving'];
            case 'Saved': return ['label-success', 'Saved'];
            case 'Ungraded': return ['label-warning', 'Ungraded']
            case 'Disconnected': return ['label-danger', 'Disconnected'];
            case 'Error': return ['label-danger', 'Errors'];
        }
    }, this.model);
    // Helper function to map Execution status messages to UI elements
    this.model.execution_status_class = ko.computed(function() {
        switch (this.execution.status()) {
            default: case 'idle': return ['label-success', 'Ready'];
            case 'running': return ['label-warning', 'Running'];
            case 'changing': return ['label-warning', 'Changing'];
            case 'verifying': return ['label-warning', 'Verifying'];
            case 'parsing': return ['label-warning', 'Parsing'];
            case 'analyzing': return ['label-warning', 'Analyzing'];
            case 'student': return ['label-warning', 'Student'];
            case 'instructor': return ['label-warning', 'Instructor'];
            case 'complete': return ['label-success', 'Idle'];
            
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
        //console.log(execution.trace(), execution.trace().length-1, execution.trace_step())
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
                var newWindow = window.open('about:blank', "_blank");
                newWindow.document.body.innerHTML += "<code>"+output+"</code>";
            }
        }
    }
    
    this.model.areBlocksUpdating = ko.pureComputed(function() {
        return (!this.assignment.upload() &&
                (this.settings.filename() == "__main__" ||
                 this.settings.filename() == "starting_code"))
    }, this.model);
    
    // For performance reasons, batch notifications for execution handling.
    // I'm not even sure these have any value any more.
    execution.trace.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.step.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.last_step.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    execution.line_number.extend({ rateLimit: { timeout: 20, method: "notifyWhenChangesStop" } });
    
    // Handle Files
    var self = this;
    this.model.removeFile = function() {
        self.model.assignment.files.remove(this.valueOf());
        delete self.components.engine.openedFiles[this];
    }
    this.model.viewFile = function() {
        var contents = self.components.engine.openedFiles[this];
        self.components.dialog.show("Previewing <code>"+this+"</code>", 
                                    "<pre>"+contents+"</pre>", 
                                    function() {});
    }
    this.model.addFile = function() {
        var name = prompt("Please enter the filename.");
        if (name !== null) {
            self.model.assignment.files.push(name);
            self.components.engine.openURL(name, 'file');
        }
    }
}

/**
 * Restores any user interface items to their original states.
 * This is used to manually reset anything that isn't tied automatically to
 * the model.
 */
BlockPy.prototype.resetSystem = function() {
    if (this.components) {
        this.components.feedback.clear();
        this.components.printer.resetPrinter();
    }
}

/**
 * Function for initializing user, course, and assignment group info.
 */
BlockPy.prototype.setUserData = function(student_id, course_id, group_id) {
    this.model.assignment['group_id'](group_id);
    this.model.assignment['student_id'](student_id);
    this.model.assignment['course_id'](course_id);
}

/**
 * Helper function for loading in an assignment.
 */
BlockPy.prototype.setAssignment = function(settings, assignment, programs) {
    this.model.settings.server_connected(false);
    this.resetSystem();
    // Settings
    if (settings.filename) {
        this.model.settings['filename'](settings.filename);
    }
    // Update the current filename ONLY if we're editing the __main__
    if (this.model.settings['filename']() == '__main__') {
        this.model.settings['editor'](assignment.initial_view);
    }
    if (settings.instructor) {
        this.model.settings['instructor'](settings.instructor);
        this.model.settings['instructor_initial'](settings.instructor);
    }
    this.model.settings['enable_blocks'](settings.blocks_enabled);
    this.model.settings['read_only'](settings.read_only);
    this.model.settings['show_settings'](settings.show_settings);
    this.model.settings['disable_semantic_errors'](
                    settings.disable_semantic_errors || 
                    assignment.disable_algorithmic_errors || 
                    false);
    this.model.settings['disable_variable_types'](settings.disable_variable_types);
    this.model.settings['disable_timeout'](settings.disable_timeout || 
                                           assignment.disable_timeout);
    this.model.settings['developer'](settings.developer);
    if (settings.presentation_mode !== undefined) {
        this.model.settings['presentation_mode'](!!settings.presentation_mode);
    }
    if (settings.completedCallback) {
        this.model.settings['completedCallback'] = settings.completedCallback;
    }
    // Assignment
    if (assignment.modules) {
        var new_modules = expandArray(this.model.assignment['modules'](), 
                                    assignment.modules.added || [], 
                                    assignment.modules.removed || []);
        this.model.assignment['modules'](new_modules);
    }
    if (assignment.files) {
        this.model.assignment['files'](assignment.files);
    }
    this.model.settings['completion_status'](settings.status || 0);
    this.model.assignment['assignment_id'](assignment.assignment_id);
    this.model.assignment['group_id'](assignment.group_id);
    this.model.assignment['student_id'](assignment.student_id);
    this.model.assignment['course_id'](assignment.course_id);
    this.model.assignment['version'](assignment.version);
    this.model.assignment['name'](assignment.name);
    this.model.assignment['introduction'](assignment.introduction);
    if (assignment.initial_view) {
        this.model.assignment['initial_view'](assignment.initial_view);
    }
    if (assignment.has_files) {
        this.model.assignment['has_files'](assignment.has_files);
    }
    this.model.assignment['parsons'](assignment.parsons);
    this.model.assignment['upload'](assignment.upload);
    if (assignment.importable) {
        this.model.assignment['importable'](assignment.importable);
    }
    if (assignment.secret) {
        this.model.assignment['secret'](assignment.secret);
    }
    if (assignment.disable_algorithm_errors) {
        this.model.assignment['disable_algorithm_errors'](assignment.disable_algorithm_errors);
    }
    // Programs
    if (programs.__main__ !== undefined) {
        this.model.programs['__main__'](programs.__main__);
    }
    if (assignment.starting_code !== undefined) {
        this.model.programs['starting_code'](assignment.starting_code);
    }
    if (assignment.give_feedback !== undefined) {
        this.model.programs['give_feedback'](assignment.give_feedback);
    }
    if (assignment.on_change !== undefined) {
        this.model.programs['on_change'](assignment.on_change);
    }
    this.model.programs['answer'](assignment.answer);
    // Update Model
    // Reload blockly
    // Reload CodeMirror
    // Reload summernote
    this.components.editor.reloadIntroduction();
    this.model.settings.server_connected(true)
    this.components.corgis.loadDatasets(true);
    this.components.engine.loadAllFiles(true);
    this.components.server.setStatus('Loaded');
    if (this.model.settings.presentation_mode()) {
        this.components.server.logEvent('editor', 'run')
        this.components.engine.on_run();
    }
}

/**
 * Function for running any code that fixes bugs and stuff upstream.
 * Not pleasant that this exists, but better to have it isolated than
 * just lying about randomly...
 *
 */
BlockPy.prototype.turnOnHacks = function() {
    /*
     * jQuery UI shake - Padding disappears
     * Courtesy: http://stackoverflow.com/questions/22301972/jquery-ui-shake-padding-disappears
     */
    if ($.ui) {
        (function () {
            var oldEffect = $.fn.effect;
            $.fn.effect = function (effectName) {
                if (effectName === "shake" || effectName.effect == "shake") {
                    var old = $.effects.createWrapper;
                    $.effects.createWrapper = function (element) {
                        var result;
                        var oldCSS = $.fn.css;

                        $.fn.css = function (size) {
                            var _element = this;
                            var hasOwn = Object.prototype.hasOwnProperty;
                            return _element === element && hasOwn.call(size, "width") && hasOwn.call(size, "height") && _element || oldCSS.apply(this, arguments);
                        };

                        result = old.apply(this, arguments);

                        $.fn.css = oldCSS;
                        return result;
                    };
                }
                return oldEffect.apply(this, arguments);
            };
        })();
    }
    // Fix Function#name on browsers that do not support it (IE):
    // Courtesy: http://stackoverflow.com/a/17056530/1718155
    if (!(function f() {}).name) {
        Object.defineProperty(Function.prototype, 'name', {
            get: function() {
                var name = (this.toString().match(/^function\s*([^\s(]+)/) || [])[1];
                // For better performance only parse once, and then cache the
                // result through a new accessor for repeated access.
                Object.defineProperty(this, 'name', { value: name });
                return name;
            }
        });
    }
}