/**
 * TODO: rename files, manual save, tags, sample_submissions, on_eval, non-builtin files
 * TODO: import data, history, run, url_data, assignment_settings, parsons_mode
 * TODO: delete becomes "clear" for instructor files
 */

/**
 *
 * @enum {str}
 */
import {AbstractEditor, sluggify} from "./abstract_editor";
import {HISTORY_TOOLBAR_HTML} from "../history";

export let DisplayModes = {
    BLOCK: "block",
    SPLIT: "split",
    TEXT: "text"
};

function makeTab(name, icon, mode) {
    return `<label class="btn btn-outline-secondary blockpy-mode-set-blocks"
                data-bind="css: {active: display.pythonMode() === '${mode}'},
                           click: ui.editors.python.updateMode.bind($data, '${mode}')">
                <span class='fas fa-${icon}'></span>
                <input type="radio" name="blockpy-mode-set" autocomplete="off" checked> ${name}
            </label>`;
}

export const PYTHON_EDITOR_HTML = `

    <div class="blockpy-python-toolbar col-md-12 btn-toolbar"
         role="toolbar" aria-label="Python Toolbar">

         <div class="btn-group mr-2" role="group" aria-label="Run Group">         
            <button type="button" class="btn blockpy-run notransition"
                data-bind="click: ui.execute.run,
                            css: {'blockpy-run-running': ui.execute.isRunning}">
                <span class="fas fa-play"></span> Run
             </button>
         </div>
         
         <div class="btn-group btn-group-toggle mr-2" data-toggle="buttons">
            <!-- ko if: $root.assignment.settings.enableBlocks() -->
            ${makeTab("Blocks", "th-large", DisplayModes.BLOCK)}
            ${makeTab("Split", "columns", DisplayModes.SPLIT)}
            ${makeTab("Text", "align-left", DisplayModes.TEXT)}
            <!-- /ko -->
         </div>

         <div class="btn-group mr-2" role="group" aria-label="Reset Group">
             <button type="button" class="btn btn-outline-secondary"
                 data-bind="click: ui.editors.reset">
                 <span class="fas fa-sync"></span> Reset
              </button>
         </div>
         
         <!-- ko if: !assignment.settings.hideImportDatasetsButton() -->
         <div class="btn-group mr-2" role="group" aria-label="Import Group">
            <button type="button" class="btn btn-outline-secondary"
                data-bind="click: ui.editors.importDataset">
                <span class="fas fa-cloud-download-alt"></span> Import datasets
             </button>
         </div>
         <!-- /ko -->
         
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
            <button type="button" class="btn btn-outline-secondary"
                aria-pressed="false"
                data-bind="click: ui.editors.python.toggleHistoryMode,
                           enable: ui.editors.python.isHistoryAvailable,
                           css: { active: display.historyMode },
                           attr: { 'aria-pressed': display.historyMode }">
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
    
    ${HISTORY_TOOLBAR_HTML}


    <div class="blockpy-python-blockmirror"
        data-bind="hidden: ui.menu.isSubmitted">
    </div>
`;



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
        Blockly.setParentContainer(main.model.configuration.container[0]);
        this.bm = new BlockMirror({
            "container": this.tag[0],
            "run": main.components.engine.run.bind(main.components.engine),
            "skipSkulpt": true,
            "blocklyMediaPath": main.model.configuration.blocklyPath,
            "toolbox": main.model.assignment.settings.toolbox(),
            "imageMode": true,
            imageDownloadHOok: (oldUrl) => {
                return oldUrl;
            },
            imageUploadHook: (blob) => {
                return Promise.resolve("Image("+JSON.stringify(URL.createObjectURL(blob))+")");
            },
            imageLiteralHook: (oldUrl) => {
                return `Image("${oldUrl}")`;
            },
            //'height': '2000px'
        });

        this.dirty = false;
        this.readOnly = false;
        this.makeSubscriptions();
        this.lineErrorSubscription = null;
        this.lineUncoveredSubscription = null;
        this.oldPythonMode = this.main.model.display.pythonMode();

        this.makePerAssignmentSubscriptions();
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
        let oldFilename = this.filename;
        super.enter(newFilename, oldEditor);
        this.dirty = false;

        if (newFilename !== "answer.py") {
            if (oldFilename === "answer.py") {
                this.oldPythonMode = this.main.model.display.pythonMode();
            }
            this.main.model.display.pythonMode(DisplayModes.TEXT);
        } else {
            this.main.model.display.pythonMode(this.oldPythonMode);
        }

        this.updateEditor(this.file.handle());

        // Subscribe to the relevant File
        this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));

        // Notify relevant file of changes to BM
        this.currentBMListener = this.updateHandle.bind(this);
        this.bm.addChangeListener(this.currentBMListener);

        if (newFilename !== "answer.py") {
            this.bm.isParsons = () => false;
        } else {
            this.bm.isParsons = this.main.model.assignment.settings.isParsons;

            this.lineErrorSubscription = this.main.model.execution.feedback.linesError.subscribe((lines) =>{
                return this.bm.setHighlightedLines(lines, "editor-error-line");
            });
            this.lineUncoveredSubscription = this.main.model.execution.feedback.linesUncovered.subscribe((lines) =>
                this.bm.setHighlightedLines(lines, "editor-uncovered-line")
            );
        }


        //this.bm.blockEditor.workspace.render();
        //this.bm.refresh();
        // TODO: Figure out why this doesn't end up looking right (go to a different editor, come back, and it'll be squished)
        //this.bm.refresh();
        setTimeout(() => this.bm.refresh(), 0);
    }

    updateEditor(newContents) {
        if (newContents === undefined) {
            if (this.file !== null) {
                newContents = this.file.handle();
            } else {
                // Doesn't matter, file was already shut down.
                newContents = "";
            }
        } else if (newContents === null) {
            // We're closing this file
            this.main.components.fileSystem.deleteFileLocally_(this.filename);
            return;
        }
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.bm.setCode(newContents);
            // Delay so that everything is rendered
            this.dirty = false;
        }
    }

    updateHandle(event) {
        this.bm.clearHighlightedLines();

        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            if (!this.main.model.display.historyMode()) {
                this.file.handle(this.bm.getCode());
            }
            this.dirty = false;
        }
    }

    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        this.dirty = false;
        this.currentSubscription.dispose();
        this.bm.removeChangeListener(this.currentBMListener);
        if (this.main.model.display.historyMode()) {
            this.main.model.ui.editors.python.turnOffHistoryMode();
        }
        this.clearLineSubscriptions();
        super.exit(newFilename, oldEditor);
    }

    clearLineSubscriptions() {
        this.bm.clearHighlightedLines();
        if (this.lineErrorSubscription) {
            this.lineErrorSubscription.dispose();
            this.lineErrorSubscription = null;
        }
        if (this.lineUncoveredSubscription) {
            this.lineUncoveredSubscription.dispose();
            this.lineUncoveredSubscription = null;
        }
    }

    makeSubscriptions() {
        this.bm.setMode(this.main.model.display.pythonMode());
        this.main.model.display.pythonMode.subscribe(mode => {
            this.bm.setMode(mode);
        });
        this.main.model.assignment.settings.enableBlocks.subscribe(enabled => {
            if (!enabled) {
                this.bm.setMode(DisplayModes.TEXT);
            } else {
                this.bm.setMode(this.main.model.display.pythonMode());
            }
        });
        this.main.model.assignment.settings.toolbox.subscribe(toolbox => {
            this.bm.configuration.toolbox = toolbox;
            this.bm.blockEditor.remakeToolbox();
        });
        this.main.model.assignment.settings.enableImages.subscribe(imageMode => {
            this.bm.setImageMode(imageMode);
        });
    }

    makePerAssignmentSubscriptions() {
        this.main.model.display.instructor.subscribe((changed) => {
            this.setReadOnly(this.decideIfNotEditable());
        });
        this.main.model.assignment.settings.onlyUploads.subscribe((changed) => {
            this.setReadOnly(this.decideIfNotEditable());
        });
    }

    decideIfNotEditable() {
        let model = this.main.model;
        return model.display.historyMode() || (
            model.assignment.settings.onlyUploads() && !model.display.instructor()
        );
    }

    setReadOnly(isReadOnly) {
        this.readOnly = isReadOnly;
        this.bm.setReadOnly(isReadOnly);
    }

    uploadFile(event) {
        let filename = event.target.fileName;
        let code = event.target.result;
        if (filename.endsWith(".ipynb")) {
            code = convertIpynbToPython(code);
        }
        this.main.components.server.logEvent("X-File.Upload", "", "", code, this.filename);
        this.file.handle(code);
        this.main.components.engine.run();
        // TODO: Run code
    }

    downloadFile() {
        let result = super.downloadFile();
        if (result.name === "answer" && result.extension === ".py") {
            result.name = sluggify(this.main.model.assignment.name());
        }
        result.mimetype = "text/x-python";
        this.main.components.server.logEvent("X-File.Download", "", "", "", result.name);
        return result;
    }

}

export const PythonEditor = {
    name: "Python",
    extensions: [".py"],
    constructor: PythonEditorView,
    template: PYTHON_EDITOR_HTML
};