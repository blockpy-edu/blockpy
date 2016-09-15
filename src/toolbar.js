function BlockPyToolbar(main, tag) {
    this.main = main;
    this.tag = tag;
    
    this.tags = {};
    this.tags.mode_set_text = this.tag.find('.blockpy-mode-set-text');
    this.tags.filename_picker = this.tag.find('.blockpy-toolbar-filename-picker');
    
    var groupHtml = '<div class="btn-group" role="group"></div>';
    var runGroup =      $(groupHtml).appendTo(tag);
    var modeGroup =     $(groupHtml).appendTo(tag);
    var doGroup =       $(groupHtml).appendTo(tag);
    var blocksGroup =   $(groupHtml).appendTo(tag);
    var codeGroup =     $(groupHtml).appendTo(tag);
    var programsGroup = $(groupHtml).appendTo(tag);
    this.elements = {
        /*'undo': $("<button></button>")
                            .addClass('btn btn-default blockpy-toolbar-undo')
                            .attr("role", "group")
                            .html('<i class="fa fa-undo"></i>')
                            .appendTo(doGroup),
        'redo': $("<button></button>")
                            .addClass('btn btn-default blockpy-toolbar-redo')
                            .attr("role", "group")
                            .html('<i class="fa fa-repeat"></i>')
                            .appendTo(doGroup),*/
        /*'align': $("<button></button>")
                            .addClass('btn btn-default blockpy-toolbar-align')
                            .attr("role", "group")
                            .html('<i class="fa fa-align-left"></i> Align')
                            .appendTo(doGroup),
        'reset': $("<button></button>")
                            .addClass('btn btn-default blockpy-toolbar-reset')
                            .attr("role", "group")
                            .html('<i class="fa fa-refresh"></i> Reset')
                            .appendTo(doGroup),
        'clear': $("<button></button>")
                            .addClass('btn btn-default blockpy-toolbar-clear')
                            .attr("role", "group")
                            .html('<i class="fa fa-trash-o"></i> Clear')
                            .appendTo(doGroup),*/
        'programs': $("<div></div>")
                            .addClass('btn-group blockpy-programs')
                            .attr("data-toggle", "buttons")
                            .appendTo(programsGroup)
    };    
    this.elements.programs.hide();
    this.elements.editor_mode = this.tag.find('.blockpy-change-mode');
    this.activateToolbar();
}

BlockPyToolbar.prototype.addProgram = function(name) {
    this.elements.programs.append("<label class='btn btn-default'>"+
                                    "<input type='radio' id='"+name+"' "+
                                      "data-name='"+name+"' autocomplete='off'>"+
                                        name+
                                   "</label>");
}

BlockPyToolbar.prototype.showPrograms = function() {
    this.elements.programs.show();
}

BlockPyToolbar.prototype.hidePrograms = function() {
    this.elements.programs.hide();
}
    
    
BlockPyToolbar.prototype.activateToolbar = function() {
    var main = this.main;
    var elements = this.elements;
    this.tag.find('.blockpy-run').click(function() {
        main.components.engine.run();
        main.components.server.logEvent('editor', 'run')
    });
    this.tags.mode_set_text.click(function() {
        main.model.settings.editor("Text");
        main.components.server.logEvent('editor', 'text')
    });
    this.tag.find('.blockpy-toolbar-reset').click(function() {
        main.model.programs['__main__'](main.model.programs['starting_code']());
        main.components.editor.updateBlocks();
        main.components.server.logEvent('editor', 'reset');
    });
    this.tag.find('.blockpy-mode-set-blocks').click(function() {
        main.model.settings.editor("Blocks");
        main.components.server.logEvent('editor', 'blocks')
    });
    this.tag.find('.blockpy-mode-set-instructor').click(function() {
        main.model.settings.editor("Instructor");
        main.components.server.logEvent('editor', 'instructor')
    });
    this.tag.find('.blockpy-toolbar-import').click(function() {
        main.components.corgis.openDialog();
        main.components.server.logEvent('editor', 'import')
    });
    this.tag.find('.blockpy-toolbar-english').click(function() {
        main.components.english.openDialog();
        main.components.server.logEvent('editor', 'english')
    });
}