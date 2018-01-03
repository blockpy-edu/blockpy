_IMPORTED_DATASETS = {};
_IMPORTED_COMPLETE_DATASETS = {};

/**
 * Module that connects to the CORGIS datasets and manages interactions
 * with them. This includes loading in datasets at launch and on-the-fly.
 * Note that this has no presence on screen, so it does not have a tag.
 *
 * @constructor
 * @this {BlockPyCorgis}
 * @param {Object} main - The main BlockPy instance
 */
function BlockPyCorgis(main) {
    this.main = main;
    
    this.loadedDatasets = [];
    this.loadDatasets();
}

BlockPyCorgis.prototype.loadDatasets = function(silently) {
    // Load in each the datasets
    var corgis = this,
        model = this.main.model,
        editor = this.main.components.editor,
        server = this.main.components.server;
    var imports = [];
    model.assignment.modules().forEach(function(name) {
        var post_prefix = name.substring(7).replace(/\s/g, '_').toLowerCase();
        if (!(name in BlockPyEditor.CATEGORY_MAP)) {
            imports.push.apply(imports, corgis.importDataset(post_prefix, name, silently));
        }
    });
    
    // When datasets are loaded, update the toolbox.
    $.when.apply($, imports).done(function() {
        if (model.settings.editor() == "Blocks") {
            editor.updateBlocksFromModel();
        }
        editor.updateToolbox(true);
    }).fail(function(e) {
        console.error(e);
    }).always(function() {
        server.finalizeSubscriptions();
    });
}

/**
 * Loads the definitions for a dataset into the environment, including
 * the dataset (as a JS file), the skulpt bindings, and the blockly
 * bindings. This requires access to a CORGIS server, and occurs
 * asynchronously. The requests are fired and their deferred objects
 * are returned - callers can use this information to perform an action
 * on completion of the import.
 *
 * @param {String} slug - The URL safe version of the dataset name
 * @param {String} name - The user-friendly version of the dataset name.
 * @returns {Array.<Deferred>} - Returns the async requests as deferred objects.
 */
BlockPyCorgis.prototype.importDataset = function(slug, name, silently) {
    var url_retrievals = [];
    if (this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets+'blockpy/'+slug+'/'+slug;
        this.main.model.status.dataset_loading.push(name);
        // Actually get data
        var get_dataset = $.getScript(root+'_dataset.js');
        var get_complete = $.getScript(root+'_complete.js');
        // Load get_complete silently in the background
        var get_skulpt = $.get(root+'_skulpt.js', function(data) {
            Sk.builtinFiles['files']['src/lib/'+slug+'/__init__.js'] = data;
        });
        var get_blockly = $.getScript(root+'_blockly.js');
        // On completion, update menus.
        var corgis = this;
        $.when(get_dataset, get_skulpt, 
               get_blockly).done(function() {
            corgis.loadedDatasets.push(slug);
            if (silently) {
                corgis.main.model.settings.server_connected(false);
                corgis.main.model.assignment.modules.push(name);
                corgis.main.components.editor.addAvailableModule(name);
                corgis.main.model.settings.server_connected(true);
            } else {
                corgis.main.model.assignment.modules.push(name);
                corgis.main.components.editor.addAvailableModule(name);
            }
            corgis.main.model.status.dataset_loading.pop();
        });
        url_retrievals.push(get_dataset, get_skulpt, get_blockly);
    }
    return url_retrievals;
}

/**
 * Opens a dialog box to present the user with the datasets available
 * through the CORGIS server. This requires a call, so this method
 * completes asynchronously. The dialog is composed of a table with
 * buttons to load the datasets (More than one dataset can be loaded
 * from within the dialog at a time).
 * 
 * @param {String} name - The name of the dataset to open. This is basically the user friendly version of the name, though it will be mangled into a slug.
 */
BlockPyCorgis.prototype.openDialog = function(name) {
    var corgis = this;
    if (this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets;
        $.getJSON(root+'index.json', function(data) {
            // Make up the Body
            var datasets = data.blockpy.datasets;
            var start = $("<p>Documentation is available at url</p>");
            var body = $('<table></table>', {'class': 'table-bordered table-condensed table-striped'});
            Object.keys(datasets).sort().map(function(name) {
                var title_name = name;
                name = name.replace(/\s/g, '_').toLowerCase();
                var btn = $('<button type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">Load</button>');
                if (corgis.loadedDatasets.indexOf(name) > -1) {
                    set_button_loaded(btn);
                } else {
                    btn.click(function() {
                        corgis.importDataset(name.toLowerCase(), 'Data - '+title_name);
                        set_button_loaded(btn);
                    });
                }
                $("<tr></tr>")
                    .append($("<td class='col-md-4'>"+title_name+"</td>"))
                    .append($("<td>"+datasets[title_name]['short']+"</td>"))
                    .append($("<td class='col-md-2'></td>").append(btn))
                    .appendTo(body);
            });
            // Show the actual dialog
            var editor = corgis.main.components.editor;
            corgis.main.components.dialog.show("Import Datasets", body, function() {
                if (editor.main.model.settings.editor() == "Blocks") {
                    editor.updateBlocksFromModel();
                }
            });
        });
    }
};

/**
 * This is a very simplistic helper function that will transform
 * a given button into a "Loaded" state (disabled, pressed state, etc.).
 *
 * @param {HTMLElement} btn - An HTML element to change the text of.
 */
var set_button_loaded = function(btn) {
    btn.addClass("active")
       .addClass('btn-success')
       .removeClass('btn-primary')
       .prop("disabled", true)
       .text("Loaded")
       .attr("aria-pressed", "true");
}
