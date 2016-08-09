_IMPORTED_DATASETS = {};

function BlockPyCorgis(main) {
    this.main = main;
    
    this.loadedDatasets = [];
    
    var corgis = this;
    var imports = [];
    this.main.model.assignment.modules().forEach(function(name) {
        var post_prefix = name.substring(7).replace(/\s/g, '').toLowerCase();
        if (!(name in BlockPyEditor.CATEGORY_MAP)) {
            imports.push.apply(imports, corgis.importDataset(post_prefix));
        }
    });
    $.when.apply($, imports).done(function() {
        main.components.editor.updateBlocks();
        main.components.editor.updateToolbox(true);
    }).fail(function(e) {
        console.error(e);
    });
}

BlockPyCorgis.prototype.importDataset = function(name) {
    var url_retrievals = [];
    if (this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets+'blockpy/'+name+'/'+name;
        var get_dataset = $.getScript(root+'_dataset.js');
        var get_skulpt = $.get(root+'_skulpt.js', function(data) {
            Sk.builtinFiles['files']['src/lib/'+name+'/__init__.js'] = data;
        });
        var get_blockly = $.getScript(root+'_blockly.js');
        this.loadedDatasets.push(name);
        url_retrievals.push(get_dataset, get_skulpt, get_blockly);
    }
    return url_retrievals;
}

BlockPyCorgis.prototype.openDialog = function(name) {
    var corgis = this;
    if (false && this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets;
        $.getJSON(root+'index.json', function(data) {
            var datasets = data.blockpy.datasets;
            var body = $('<table></table>', {'class': 'table-bordered table-condensed table-striped'});
            for (var name in datasets) {
                var btn = $('<button type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">Load</button>');
                if (this.loadedDatasets.indexOf(name) > -1) {
                    btn;
                }
                btn.click(function() {
                    corgis.importDataset(item.toLowerCase());
                });
                $("<tr></tr>")
                    .append($("<td>"+item+"</td>"))
                    .append($("<td></td>").append(btn))
                    .appendTo(body);
            };
            var editor = this.main.components.editor;
            this.main.components.dialog.show("Import Datasets", body, function() {
                editor.updateBlocks();
            });
        });
    } else {
        var datasets = {"Classics": "", "Weather": "", "Global Development": "", "Tate": ""};
        var body = $('<table></table>', {'class': 'table-bordered table-condensed table-striped'});
        var loadedDatasets = this.loadedDatasets;
        Object.keys(datasets).map(function(name) {
            var title_name = name;
            name = name.replace(/\s/g, '').toLowerCase();
            var btn = $('<button type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">Load</button>');
            if (loadedDatasets.indexOf(name) > -1) {
                btn.addClass("active")
                   .addClass('btn-success')
                   .removeClass('btn-primary')
                   .prop("disabled", true)
                   .text("Loaded")
                   .attr("aria-pressed", "true");
            } else {
                btn.click(function() {
                    corgis.importDataset(name.toLowerCase());
                    btn.addClass("active")
                       .addClass('btn-success')
                       .removeClass('btn-primary')
                       .prop("disabled", true)
                       .text("Loaded")
                       .attr("aria-pressed", "true");
                });
            }
            $("<tr></tr>")
                .append($("<td>"+title_name+"</td>"))
                .append($("<td></td>").append(btn))
                .appendTo(body);
        });
        var editor = this.main.components.editor;
        this.main.components.dialog.show("Import Datasets", body, function() {
            editor.updateBlocks();
        });
    }
};