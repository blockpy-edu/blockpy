import {slug} from "./utilities";

// TODO: editor.bm.blockEditor.extraTools[]

export let _IMPORTED_DATASETS = {};
export let _IMPORTED_COMPLETE_DATASETS = {};

/**
 * This is a very simplistic helper function that will transform
 * a given button into a "Loaded" state (disabled, pressed state, etc.).
 *
 * @param {HTMLElement} btn - An HTML element to change the text of.
 */
let setButtonLoaded = function (btn) {
    btn.addClass("active")
        .addClass("btn-success")
        .removeClass("btn-primary")
        .prop("disabled", true)
        .text("Loaded")
        .attr("aria-pressed", "true");
};


/**
 * Module that connects to the CORGIS datasets and manages interactions
 * with them. This includes loading in datasets at launch and on-the-fly.
 * Note that this has no presence on screen, so it does not have a tag.
 *
 * @constructor
 * @this {BlockPyCorgis}
 * @param {Object} main - The main BlockPy instance
 */
export function BlockPyCorgis(main) {
    this.main = main;

    this.loadedDatasets = [];
    this.loadDatasets();
}

BlockPyCorgis.prototype.loadDatasets = function (silently) {
    // Load in each the datasets
    let model = this.main.model,
        editor = this.main.components.pythonEditor,
        server = this.main.components.server;
    let imports = [];
    model.assignment.settings.datasets().split(",").forEach((name) => {
        if (name && !(name in BlockMirrorBlockEditor.EXTRA_TOOLS)) {
            imports.push.apply(imports, this.importDataset(slug(name), name, silently));
        }
    });

    // When datasets are loaded, update the toolbox.
    $.when.apply($, imports).done(function () {
        //console.log("TRIGGERED");
        editor.bm.forceBlockRefresh();
        editor.bm.blockEditor.remakeToolbox();
    }).fail(function (e) {
        console.log(arguments);
        console.error(e);
    }).always(function () {
        server.finalizeSubscriptions();
    });
};

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
BlockPyCorgis.prototype.importDataset = function (slug, name) {
    let url_retrievals = [];
    if (this.main.model.ui.server.isEndpointConnected("importDatasets")) {
        let root = this.main.model.configuration.urls.importDatasets + "blockpy/" + slug + "/" + slug;
        this.main.model.display.loadingDatasets.push(name);
        // Actually get data
        let getDataset = $.getScript(root + "_dataset.js");
        // Load getComplete silently in the background because its big :(
        let getComplete = $.getScript(root + "_complete.js");
        let getSkulpt = $.get(root + "_skulpt.js", function (data) {
            Sk.builtinFiles["files"]["src/lib/" + slug + "/__init__.js"] = data;
        });
        let getBlockly = $.getScript(root + "_blockly.js");
        // On completion, update menus.
        $.when(getDataset, getSkulpt, getBlockly).done(() => {
            this.loadedDatasets.push(slug);
            this.main.components.pythonEditor.bm.textToBlocks.hiddenImports.push(slug);
            this.main.components.pythonEditor.bm.forceBlockRefresh();
            this.main.components.pythonEditor.bm.blockEditor.remakeToolbox();
            this.main.model.display.loadingDatasets.remove(name);
        });
        url_retrievals.push(getDataset, getSkulpt, getBlockly);
    }
    return url_retrievals;
};

/**
 * Opens a dialog box to present the user with the datasets available
 * through the CORGIS server. This requires a call, so this method
 * completes asynchronously. The dialog is composed of a table with
 * buttons to load the datasets (More than one dataset can be loaded
 * from within the dialog at a time).
 */
BlockPyCorgis.prototype.openDialog = function () {
    if (this.main.model.ui.server.isEndpointConnected("importDatasets")) {
        let root = this.main.model.configuration.urls.importDatasets;
        $.getJSON(root + "index.json",  (data) => {
            // Make up the Body
            let datasets = data.blockpy;
            let documentation = root+"blockpy/index.html";
            let start = $(`<p>Documentation is available at <a href='${documentation}' target=_blank>url</a></p>`);
            let body = $("<table></table>", {"class": "table table-bordered table-sm table-striped"});
            Object.keys(datasets).sort().map((name) => {
                let sluggedName = slug(datasets[name].name);
                let titleName = name;
                let btn = $('<button type="button" class="btn btn-primary" data-toggle="button" aria-pressed="false" autocomplete="off">Load</button>');
                let imgSrc = root+"../images/datasets/"+name+"-icon.png";
                if (this.loadedDatasets.indexOf(sluggedName) > -1) {
                    setButtonLoaded(btn);
                } else {
                    btn.click( () => {
                        this.importDataset(sluggedName, "Data - " + datasets[name].title);
                        setButtonLoaded(btn);
                    });
                }
                //let img = `<img src='${imgSrc}' class="corgis-icon">`;
                $("<tr></tr>")
                    //.append($("<td>" + img + "</td>"))
                    .append($("<td>" + datasets[name].title + "</td>"))
                    .append($("<td>" + datasets[name].overview + "</td>"))
                    .append($("<td></td>").append(btn))
                    .appendTo(body);
            });
            body.appendTo(start);
            // Show the actual dialog
            this.main.components.dialog.show("Import Datasets", start, null);
        });
    }
};

