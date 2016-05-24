function BlockPy(settings, assignment, submission, programs) {
    this.model = {
        // User level settings
        "settings": {
            // Default mode when you open the screen is text
            // 'text', 'blocks'
            'editor': ko.observable(settings.editor),
            // Default mode when you open the screen is instructor
            // boolean
            'instructor': ko.observable(settings.instructor),
            // boolean
            'enable_blocks': ko.observable(settings.blocks_enabled),
            // boolean
            'read_only': ko.observable(settings.read_only),
            // string
            'filename': ko.observable("__main__"),
            // string
            'level': ko.observable("level")
        },
        'execution': {
            // 'waiting', 'running'
            'status': ko.observable('waiting'),
            // integer
            'step': ko.observable(0),
            // list of string/list of int
            'output': ko.observableArray([]),
            // integer
            'line_number': ko.observable(0),            
            // array of simple objects
            'trace': ko.observableArray([])
        },
        'status': {
            // boolean
            'loaded': ko.observable(false),
            'text': ko.observable("Loading"),
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
        },
        // Assignment level settings
        "assignment": {
            'modules': ko.observableArray(['weather', 'earthquakes', 'books', 'stocks', 'crime']),
            'assignment_id': assignment.question_id,
            'student_id': assignment.student_id,
            'context_id': assignment.book_id,
            'version': assignment.version,
            'lis_result_sourcedid': assignment.lis_result_sourcedid,
            'name': ko.observable(assignment.name),
            'introduction': ko.observable(assignment.introduction),
            'presentation': assignment.presentation,
            "on_run": assignment.on_run, 
            "on_change": assignment.on_change, 
            "initial_view": assignment.initial_view,
            "starting_code": assignment.starting_code,
            'parsons': ko.observable(assignment.parsons),
            'urls': assignment.urls
        },
        "programs": {
            "__main__": ko.observable(programs.__main__),
        }
    };
    this.model.program = ko.computed(function() {
        return this.programs[this.settings.filename()]();
    }, this.model) //.extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 400 } });
    
    this.initMain();
    
    /*
    this.model.get = function() {
        return blockpy.model.programs[blockpy.model.settings.program];
    }
    this.model.set = function(content) {
        blockpy.model.programs[blockpy.model.settings.program] = content;
        blockpy.server.save();
    }
    
    this.model.load = function(content) {
        blockpy.model.programs['__main__'] = content;
        if (blockpy.editor !== undefined) {
            blockpy.editor.setPython(content);
        }
    }
    
    // The Div or whatever HTML element we attach everything to
    this.attachmentPoint = attachmentPoint;
    
    this.loadMain();
    var blockpy = this;
    
    
    
    // Add the Server connection
    this.server = new blockpyServer(this.model,
                                   this,
                                   function(message) {
                                        return blockpy.alert(message);
                                    });
    this.server.load();
    
    // Initialize the toolbar so other things can refer to it
    this.toolbar = new blockpyToolbar(this.mainDiv.find('.blockpy-toolbar'));
    
    // Add the Property Explorer
    this.explorer = new PropertyExplorer(
        function(step, page) { 
            blockpy.stepConsole(step);
        },
        function(step, page) { 
            blockpy.editor.highlightLine(page.line-1);
            if (page.block) {
                blockpy.editor.highlightBlock(page.block);
            } else {
                blockpy.editor.highlightBlock(null);
            }
        },
        blockpy.mainDiv.find('.blockpy-explorer'),
        blockpy.server
    );
    
    this.loadConsole();
    
    // Add the presentation block
    this.presentation = new blockpyPresentation(
        function(content) { 
            blockpy.model.presentation = content;
            blockpy.editor.blockly.resize();
            var val = blockpy.mainDiv.find('.blockpy-presentation-name-editor').val();
            blockpy.server.savePresentation(content, val, blockpy.model.settings.parsons);
        },
        function() { return blockpy.model.presentation; },
        blockpy.mainDiv.find('.blockpy-presentation'),
        blockpy.mainDiv.find('.blockpy-presentation-name')
    );
    
    // Add events to the toolbar
    this.activateToolbar();

    this.changeProgram('__main__');
    */
}

BlockPy.prototype.initMain = function() {
    this.initInterface();
    this.initModel();
    this.initComponents();
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
    this.components.dialog = new BlockPyDialog(this, container.find('.blockpy-popup'));
    this.components.toolbar  = new BlockPyToolbar(this,  container.find('.blockpy-toolbar'));
    this.components.feedback = new BlockPyFeedback(this, container.find('.blockpy-feedback'));
    this.components.editor   = new BlockPyEditor(this,   container.find('.blockpy-editor'));
    this.components.presentation = new BlockPyPresentation(this, container.find('.blockpy-presentation'));
    this.components.printer = new BlockPyPrinter(this, container.find('.blockpy-printer'));
    this.components.engine = new BlockPyEngine(this);
}

BlockPy.prototype.reportError = function(component, message) {
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