/**
 * An object that manages the main toolbar, including the different mode buttons.
 * This doesn't actually have many responsibilities after the initial load.
 *
 * @constructor
 * @this {BlockPyToolbar}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
function BlockPyToolbar(main, tag) {
    this.main = main;
    this.tag = tag;
    
    // Holds the HTMLElement tags for each of the toolbar items
    this.tags = {};
    this.tags.mode_set_text = this.tag.find('.blockpy-mode-set-text');
    this.tags.filename_picker = this.tag.find('.blockpy-toolbar-filename-picker');
    
    // Set up each of the relevant Button Groups
    var groupHtml = '<div class="btn-group" role="group"></div>';
    var runGroup =      $(groupHtml).appendTo(tag);
    var modeGroup =     $(groupHtml).appendTo(tag);
    var doGroup =       $(groupHtml).appendTo(tag);
    var blocksGroup =   $(groupHtml).appendTo(tag);
    var codeGroup =     $(groupHtml).appendTo(tag);
    var programsGroup = $(groupHtml).appendTo(tag);
    
    // this used to hold many items, but now we store them directly in the
    // html of interface.js
    this.elements = {
        'programs': $("<div></div>")
                            .addClass('btn-group blockpy-programs')
                            .attr("data-toggle", "buttons")
                            .appendTo(programsGroup)
    };    
    this.elements.programs.hide();
    this.elements.editor_mode = this.tag.find('.blockpy-change-mode');
    
    // Actually set up the toolbar!
    this.activateToolbar();
}

/**
 * Add a new button for the given filename in the Programs button group.
 * These programs will be things like "__main__".
 *
 * @param {String} name - The name of the new program.
 */
BlockPyToolbar.prototype.addProgram = function(name) {
    this.elements.programs.append("<label class='btn btn-default'>"+
                                    "<input type='radio' id='"+name+"' "+
                                      "data-name='"+name+"' autocomplete='off'>"+
                                        name+
                                   "</label>");
}

/**
 * Show the programs button group.
 */
BlockPyToolbar.prototype.showPrograms = function() {
    this.elements.programs.show();
}

/**
 * Hide the programs button group.
 */
BlockPyToolbar.prototype.hidePrograms = function() {
    this.elements.programs.hide();
}
    
/**
 * Register click events for more complex toolbar actions.
 */
BlockPyToolbar.prototype.activateToolbar = function() {
    var main = this.main;
    this.tag.find('.blockpy-run').click(function() {
        main.components.server.logEvent('editor', 'run')
        main.components.engine.on_run();
    });
    this.tags.mode_set_text.click(function() {
        main.components.server.logEvent('editor', 'text')
        main.model.settings.editor("Text");
    });
    this.tag.find('.blockpy-toolbar-reset').click(function() {
        main.model.programs['__main__'](main.model.programs['starting_code']());
        //main.components.editor.updateBlocks();
        main.components.server.logEvent('editor', 'reset');
        if (main.model.assignment.parsons()) {
            main.components.editor.blockly.shuffle();
        }
    });
    this.tag.find('.blockpy-mode-set-blocks').click(function() {
        main.components.server.logEvent('editor', 'blocks')
        main.model.settings.editor("Blocks");
    });
    this.tag.find('.blockpy-mode-set-instructor').click(function() {
        main.model.settings.editor("Instructor");
        main.components.server.logEvent('editor', 'instructor')
    });
    this.tag.find('.blockpy-mode-set-split').click(function() {
        main.model.settings.editor("Split");
        main.components.server.logEvent('editor', 'split')
    });
    this.tag.find('.blockpy-toolbar-import').click(function() {
        main.components.corgis.openDialog();
        main.components.server.logEvent('editor', 'import')
    });
    this.tag.find('.blockpy-toolbar-history').click(function() {
        main.components.history.openDialog();
        main.components.server.logEvent('editor', 'history')
    });
    this.tag.find('.blockpy-toolbar-english').click(function() {
        main.components.english.openDialog();
        main.components.server.logEvent('editor', 'english')
    });
    var uploadButton = this.tag.find('.blockpy-toolbar-upload');
    uploadButton.change(function() {
        var fr = new FileReader();
        var files = uploadButton[0].files;
        fr.onload = function(e) {
            main.setCode(e.target.result)
            main.components.server.logEvent('editor', 'upload')
            main.components.engine.run();
            main.components.server.logEvent('editor', 'run')
        };
        fr.readAsText(files[0]);
    });
}