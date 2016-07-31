_IMPORTED_DATASETS = {};

function BlockPyCorgis(main) {
    this.main = main;
}

BlockPyCorgis.prototype.importDataset = function(name) {
    if (this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets+name;
        $.getScript(root+'_dataset.js');
        $.get(root+'_skulpt.js', function(data) {
            Sk.builtinFiles['files']['src/lib/'+name+'/__init__.js'] = data;
        });
        $.getScript(root+'_blockly.js');
    }
}

BlockPyCorgis.prototype.openDialog = function(name) {
    var corgis = this;
    if (false && this.main.model.server_is_connected('import_datasets')) {
        var root = this.main.model.constants.urls.import_datasets;
        $.getJSON(root+'index.json', function(data) {
            var datasets = data.blockpy.datasets;
        });
    } else {
        var datasets = ["Classics", "Weather", "Zanzibar"];
        var body = $('<table></table>', {'class': 'table-bordered table-condensed table-striped'});
        $.map(datasets, function(item, i) {
            var btn = $('<button type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">Load</button>');
            btn.click(function() {
                corgis.importDataset(item.toLowerCase());
            });
            $("<tr></tr>")
                .append($("<td>"+item+"</td>"))
                .append($("<td></td>").append(btn))
                .appendTo(body);
        });
        var editor = this.main.components.editor;
        this.main.components.dialog.show("Import Datasets", body, function() {
            editor.updateBlocks();
        });
    }
};