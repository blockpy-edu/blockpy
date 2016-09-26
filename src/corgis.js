_IMPORTED_DATASETS = {};

function BlockPyCorgis(main) {
    this.main = main;
    
    this.loadedDatasets = [];
    
    var corgis = this;
    var imports = [];
    this.main.model.assignment.modules().forEach(function(name) {
        var post_prefix = name.substring(7).replace(/\s/g, '_').toLowerCase();
        if (!(name in BlockPyEditor.CATEGORY_MAP)) {
            imports.push.apply(imports, corgis.importDataset(post_prefix, name));
        }
    });
    $.when.apply($, imports).done(function() {
        if (main.model.settings.editor() == "Blocks") {
            main.components.editor.updateBlocks();
        }
        main.components.editor.updateToolbox(true);
    }).fail(function(e) {
        console.error(e);
    });
}

BlockPyCorgis.prototype.importDataset = function(slug, name) {
    var url_retrievals = [];
    if (this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets+'blockpy/'+slug+'/'+slug;
        this.main.model.status.dataset_loading.push(name);
        var get_dataset = $.getScript(root+'_dataset.js');
        var get_skulpt = $.get(root+'_skulpt.js', function(data) {
            Sk.builtinFiles['files']['src/lib/'+slug+'/__init__.js'] = data;
        });
        var get_blockly = $.getScript(root+'_blockly.js');
        var corgis = this;
        $.when(get_dataset, get_skulpt, get_blockly).done(function() {
            corgis.loadedDatasets.push(slug);
            corgis.main.model.assignment.modules.push(name);
            corgis.main.components.editor.addAvailableModule(name);
            corgis.main.model.status.dataset_loading.pop();
        });
        url_retrievals.push(get_dataset, get_skulpt, get_blockly);
    }
    return url_retrievals;
}

BlockPyCorgis.prototype.openDialog = function(name) {
    var corgis = this;
    if (this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets;
        $.getJSON(root+'index.json', function(data) {
            var datasets = data.blockpy.datasets;
            var body = $('<table></table>', {'class': 'table-bordered table-condensed table-striped'});
            Object.keys(datasets).map(function(name) {
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
            var editor = corgis.main.components.editor;
            corgis.main.components.dialog.show("Import Datasets", body, function() {
                if (editor.main.model.settings.editor() == "Blocks") {
                    editor.updateBlocks();
                }
            });
        });
    }
};

var set_button_loaded = function(btn) {
    btn.addClass("active")
       .addClass('btn-success')
       .removeClass('btn-primary')
       .prop("disabled", true)
       .text("Loaded")
       .attr("aria-pressed", "true");
}