/**
 * TODO: rename files, manual save, tags, sample_submissions, on_eval, non-builtin files
 * TODO: import data, history, run, url_data, assignment_settings, parsons_mode
 * TODO: delete becomes "clear" for instructor files
 * TODO: Fix capture blocks css
 */

/**
 *
 * @enum {str}
 */
import {AbstractEditor, sluggify} from "./abstract_editor";

export let DisplayModes = {
    BLOCK: "block",
    SPLIT: "split",
    TEXT: "text"
};

function makeTab(name, icon, mode) {
    return `<label class="btn btn-outline-secondary blockpy-mode-set-blocks"
                data-bind="css: {active: display.pythonMode() === '${mode}'},
                           click: display.pythonMode.bind($data, '${mode}')">
                <span class='fas fa-${icon}'></span>
                <input type="radio" name="blockpy-mode-set" autocomplete="off" checked> ${name}
            </label>`;
}

export const PYTHON_EDITOR_HTML = `
    <div class="blockpy-python-toolbar col-md-12 btn-toolbar"
         role="toolbar" aria-label="Python Toolbar">

         <div class="btn-group mr-2" role="group" aria-label="Run Group">         
            <button type="button" class="btn blockpy-run"
                data-bind="click: ui.execute.run">
                <span class="fas fa-play"></span> Run
             </button>
         </div>
         
         <div class="btn-group btn-group-toggle mr-2" data-toggle="buttons">
                ${makeTab("Blocks", "th-large", DisplayModes.BLOCK)}
                ${makeTab("Split", "columns", DisplayModes.SPLIT)}
                ${makeTab("Text", "align-left", DisplayModes.TEXT)}
            </div>

        <div class="btn-group mr-2" role="group" aria-label="Reset Group">
            <button type="button" class="btn btn-outline-secondary"
                data-bind="click: ui.editors.reset">
                <span class="fas fa-sync"></span> Reset
             </button>
         </div>
         
         <div class="btn-group mr-2" role="group" aria-label="Import Group">
            <button type="button" class="btn btn-outline-secondary"
                data-bind="click: ui.editors.importDataset">
                <span class="fas fa-cloud-download-alt"></span> Import datasets
             </button>
         </div>
         
         <div class="btn-group mr-2">
                <label class="btn btn-outline-secondary">
                    <span class="fas fa-file-upload"></span> Upload
                    <input class="blockpy-toolbar-upload" type="file"
                        hidden
                        data-bind="event: {change: ui.editors.upload}">
                 </label>

                <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="caret"></span>
                    <span class="sr-only">Toggle Dropdown</span>
                </button>
                
                <div class="dropdown-menu dropdown-menu-right">
                    <a class='dropdown-item blockpy-toolbar-download'
                        data-bind="click: ui.editors.download">
                    <span class='fas fa-download'></span> Download
                    </a>
                </div>
            </div>
         
         <div class="btn-group mr-2" role="group" aria-label="History Group">
            <button type="button" class="btn btn-outline-secondary">
                <span class="fas fa-history"></span> History
             </button>
         </div>
         
         <!-- Fully functional, but a little too.. Invasive 
         <div class="btn-group mr-2" role="group" aria-label="Fullscreen Group"
            data-bind="visible: display.pythonMode() === 'text'">
            <button type="button" class="btn btn-outline-secondary"
                data-bind="click: ui.editors.python.fullscreen">
                <span class="fas fa-expand-arrows-alt"></span> Fullscreen
             </button>
         </div>
         -->
         
         <div class="btn-group mr-2" role="group" aria-label="Save Group"
            data-bind="visible: ui.editors.canSave">
            <button type="button" class="btn btn-outline-secondary">
                <span class="fas fa-save"></span> Save
             </button>
         </div>
         
         <div class="btn-group mr-2" role="group" aria-label="Delete Group"
            data-bind="visible: ui.editors.canDelete">
            <button type="button" class="btn btn-outline-secondary",
                data-bind="click: ui.files.delete">
                <span class="fas fa-trash"></span> Delete
             </button>
         </div>
         
         <div class="btn-group mr-2" role="group" aria-label="Rename Group"
            data-bind="visible: ui.editors.canRename">
             <button type="button" class="btn btn-outline-secondary">
                <span class="fas fa-file-signature"></span> Rename
             </button>
         </div>
         
    </div>


    <div class="blockpy-python-blockmirror">
    </div>
`;
/*
        <button type='button' class='btn blockpy-run' style='float:left',
            data-bind='css: execution.status() == "running" ? "btn-info" :
                            execution.status() == "error" ? "btn-danger" : "btn-success",
                       visible: settings.instructor() || !assignment.upload()' >
            <span class='glyphicon glyphicon-play'></span> Run
        </button>

            <div class="btn-group" data-toggle="buttons" data-bind="visible: !assignment.upload()">
                <label class="btn btn-default blockpy-mode-set-blocks"
                       data-bind="css: {active: settings.editor() == 'Blocks',
                                        disabled: !areBlocksUpdating()}">
                    <span class='glyphicon glyphicon-th-large'></span>
                    <input type="radio" name="blockpy-mode-set" autocomplete="off" checked> Blocks
                </label>
                <!--<label class="btn btn-default blockpy-mode-set-instructor"
                       data-bind="visible: settings.instructor,
                                  css: {active: settings.editor() == 'Upload'}">
                    <span class='glyphicon glyphicon-list-alt'></span>
                    <input type="radio" name="blockpy-mode-set" autocomplete="off"> Instructor
                </label>-->
                <label class="btn btn-default blockpy-mode-set-split"
                       data-bind="css: {active: settings.editor() == 'Split',
                                        disabled: !areBlocksUpdating()}">
                    <span class='glyphicon glyphicon-resize-horizontal'></span>
                    <input type="radio" name="blockpy-mode-set" autocomplete="off"> Split
                </label>
                <label class="btn btn-default blockpy-mode-set-text"
                       data-bind="css: {active: settings.editor() == 'Text'}">
                    <span class='glyphicon glyphicon-pencil'></span>
                    <input type="radio" name="blockpy-mode-set" autocomplete="off"> Text
                </label>
            </div>
            <button type='button' class='btn btn-default blockpy-toolbar-reset'
                    data-bind="visible: !assignment.upload()">
                <span class='glyphicon glyphicon-refresh'></span> Reset
            </button>
            <!--<button type='button' class='btn btn-default blockpy-toolbar-capture'>
                <span class='glyphicon glyphicon-picture'></span> Capture
            </button>-->
            <button type='button' class='btn btn-default blockpy-toolbar-import'
                    data-bind="visible: settings.instructor() || (!assignment.upload() && assignment.importable())">
                <span class='glyphicon glyphicon-cloud-download'></span> Import Datasets
            </button>

            <div class="btn-group">
                <label class="btn btn-default btn-file">
                    <span class='glyphicon glyphicon-upload'></span> Upload
                    <input class="blockpy-toolbar-upload" type="file" style="display: none;">
                </label>

                <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="caret"></span>
                    <span class="sr-only">Toggle Dropdown</span>
                </button>
                <ul class="dropdown-menu">
                    <li>
                        <a class='blockpy-toolbar-download'><span class='glyphicon glyphicon-download'></span> Download Python Code</a>
                    </li>
                </ul>
            </div>

            <button type='button' class='btn btn-default blockpy-toolbar-history'>
                <span class='glyphicon glyphicon-hourglass'></span> History
            </button>
            <button type='button' class='btn btn-default blockpy-toolbar-instructor' data-bind="visible: settings.instructor">
                <span class='glyphicon glyphicon-list-alt'></span> Settings
            </button>

            <!--
            <button type='button' class='btn btn-default blockpy-toolbar-english'>
                <span class='glyphicon glyphicon-list-alt'></span> English
            </button>
            -->
            <div data-bind="visible: settings.instructor()"
                 style='clear:both'>
            <div class="btn-group blockpy-toolbar-filename-picker" data-toggle="buttons">
                <label class="btn btn-default blockpy-set-filename"
                       data-bind="css: {active: settings.filename() == '__main__'}"
                       data-filename="__main__">
                    <input type="radio" name="blockpy-filename-set" autocomplete="off" checked> __main__
                </label>
                <label class="btn btn-default blockpy-set-filename"
                       data-bind="css: {active: settings.filename() == 'starting_code'}"
                       data-filename="starting_code">
                    <input type="radio" name="blockpy-filename-set" autocomplete="off"> on_start
                </label>
                <label class="btn btn-default blockpy-set-filename"
                       data-bind="css: {active: settings.filename() == 'give_feedback'}"
                       data-filename="give_feedback">
                    <input type="radio" name="blockpy-filename-set" autocomplete="off"> on_run
                </label>
                <label class="btn btn-default blockpy-set-filename"
                       data-bind="css: {active: settings.filename() == 'on_change'}"
                       data-filename="on_change">
                    <input type="radio" name="blockpy-filename-set" autocomplete="off"> on_change
                </label>
            </div>
            </div>
        </div>
    </div>
 */



function convertIpynbToPython(code) {
    let ipynb = JSON.parse(code);
    let isUsable = function(cell) {
        if (cell.cell_type === "code") {
            return cell.source.length > 0 &&
                !cell.source[0].startsWith("%");
        } else {
            return cell.cell_type === "markdown" ||
                cell.cell_type === "raw";
        }
    };
    let makePython = function(cell) {
        if (cell.cell_type === "code") {
            return cell.source.join("\n");
        } else if (cell.cell_type === "markdown" ||
            cell.cell_type === "raw") {
            return "'''"+cell.source.join("\n")+"'''";
        }
    };
    return ipynb.cells.filter(isUsable).map(makePython).join("\n");
}

class PythonEditorView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag.find(".blockpy-python-blockmirror"));
        this.bm = new BlockMirror({
            "container": this.tag[0],
            "run": main.components.engine.run.bind(main.components.engine),
            "skipSkulpt": true,
            "blocklyMediaPath": main.model.configuration.blocklyPath,
            //'height': '2000px'
        });
        this.dirty = false;
        this.makeSubscriptions();
    }

    configureExtraBlockly() {
        this.bm.blockEditor.workspace.configureContextMenu = (options) => {
            options.push({
                enabled: true,
                text: "Screenshot",
                callback: () => this.main.components.dialog.SCREENSHOT_BLOCKS
            });
        };
    }

    enter(newFilename, oldEditor) {
        super.enter(newFilename, oldEditor);
        this.dirty = false;
        this.updateEditor(this.file.handle());

        // Subscribe to the relevant File
        this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));

        // Notify relevant file of changes to BM
        this.currentBMListener = this.updateHandle.bind(this);
        this.bm.addChangeListener(this.currentBMListener);


        //this.bm.blockEditor.workspace.render();
        //this.bm.refresh();
        // TODO: Figure out why this doesn't end up looking right (go to a different editor, come back, and it'll be squished)
        setTimeout(() => this.bm.refresh(), 1000);
        console.log("Arc, reload!");
    }

    updateEditor(newContents) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.bm.setCode(newContents);
            // Delay so that everything is rendered
            this.dirty = false;
        }
    }

    updateHandle(event) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.file.handle(this.bm.getCode());
            this.dirty = false;
        }
    }

    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        this.dirty = false;
        this.currentSubscription.dispose();
        this.bm.removeChangeListener(this.currentBMListener);
        super.exit(newFilename, oldEditor);
    }

    makeSubscriptions() {
        this.bm.setMode(this.main.model.display.pythonMode());
        this.main.model.display.pythonMode.subscribe(mode => {
            this.bm.setMode(mode);
        });
    }

    uploadFile(event) {
        let filename = event.target.fileName;
        let code = event.target.result;
        if (filename.endsWith(".ipynb")) {
            code = convertIpynbToPython(code);
        }
        this.file.handle(code);
        // TODO: log upload event
        // TODO: Run code
    }

    downloadFile() {
        let result = super.downloadFile();
        if (result.name === "answer" && result.extension === ".py") {
            result.name = sluggify(this.main.model.assignment.name());
        }
        result.mimetype = "text/x-python";
        return result;
    }

}

export const PythonEditor = {
    name: "Python",
    extensions: [".py"],
    constructor: PythonEditorView,
    template: PYTHON_EDITOR_HTML
};