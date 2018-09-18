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
    
    // Actually set up the toolbar!
    this.activateToolbar();
}

BlockPyToolbar.prototype.notifyFeedbackUpdate = function() {
    this.tag.find(".blockpy-toolbar-feedback").show().fadeOut(7000);
}

/**
 * Register click events for more complex toolbar actions.
 */
BlockPyToolbar.prototype.activateToolbar = function() {
    var main = this.main;
    this.tag.find('.blockpy-run').click(function(e) {
        //main.components.server.logEvent('editor', 'run')
        var backup = this;
        main.components.feedback.clear();
        $(this).removeClass("btn-success").addClass("btn-warning")
            //.html("Running")
            ;
        setTimeout(function() {
            main.components.engine.on_run();
            $(backup)
                //.html('<span class="glyphicon glyphicon-play"></span> Run')
                    .removeClass("btn-warning")
                    .addClass("btn-success");
        }, 20);
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
    this.tag.find('.blockpy-mode-set-blocks').click(function(event) {
        if (main.model.areBlocksUpdating()) {
            main.components.server.logEvent('editor', 'blocks')
            main.model.settings.editor("Blocks");
        } else {
            event.preventDefault();
            return false;
        }
    });
    /*this.tag.find('.blockpy-mode-set-instructor').click(function() {
        main.model.settings.editor("Instructor");
        main.components.server.logEvent('editor', 'instructor')
    });*/
    this.tag.find('.blockpy-mode-set-split').click(function(event) {
        if (main.model.areBlocksUpdating()) {
            main.model.settings.editor("Split");
            main.components.server.logEvent('editor', 'split')
        } else {
            event.preventDefault();
            return false;
        }
    });
    this.tag.find('.blockpy-toolbar-import').click(function() {
        main.components.corgis.openDialog();
        main.components.server.logEvent('editor', 'import')
    });
    this.tag.find('.blockpy-toolbar-history').click(function() {
        main.components.history.openDialog();
        main.components.server.logEvent('editor', 'history')
    });
    var instructorDialog = this.main.model.constants.container.find('.blockpy-instructor-popup');
    this.tag.find('.blockpy-toolbar-instructor').click(function() {
        instructorDialog.modal({'backdrop': false}).modal('show');
        instructorDialog.draggable({
            'handle': '.modal-title'
        });
        main.components.server.logEvent('editor', 'instructor')
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
            fn = e.target.fileName;
            var code = e.target.result;
            if (fn.endsWith(".ipynb")) {
                ipynb = JSON.parse(code);
                var makePython = function(cell) {
                    if (cell.cell_type == "code") {
                        return cell.source.join("\n");
                    } else if (cell.cell_type == "markdown" ||
                               cell.cell_type == "raw") {
                        return "'''"+cell.source.join("\n")+"'''";
                    }
                }
                var isUsable = function(cell) {
                    if (cell.cell_type == "code") {
                        return cell.source.length > 0 && 
                               !cell.source[0].startsWith("%");
                    } else {
                        return cell.cell_type == "markdown" ||
                               cell.cell_type == "raw";
                    }
                }
                code = ipynb.cells.filter(isUsable).map(makePython).join("\n");
            }
            main.setCode(code)
            main.components.server.logEvent('editor', 'upload')
            main.components.engine.on_run();
        };
        fr.fileName = files[0].name;
        fr.readAsText(files[0]);
        uploadButton.val("");
    });
    
    var downloadButton = this.tag.find('.blockpy-toolbar-download');
    downloadButton.click(function() {
        var data = main.model.programs['__main__']();
        var filename='blockpy_'+main.model.assignment.name();
        // Make safe
        filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        // Make the data download as a file
        var blob = new Blob([data], {type: 'text/plain'});
        if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
        }
        else{
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;        
            document.body.appendChild(elem);
            elem.click();        
            document.body.removeChild(elem);
        }
        main.components.server.logEvent('editor', 'download')
    });
    
    this.tag.find('.blockpy-toolbar-filename-picker label').click(function() {
        main.model.settings.filename($(this).data('filename'))
    });
}