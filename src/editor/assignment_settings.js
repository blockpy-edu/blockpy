import {AbstractEditor} from "./abstract_editor";
import {DisplayModes} from "./python";

const ASSIGNMENT_SETTINGS = [
    ["toolbox", "toolbox", "normal", "toolbox", "Which version of the toolbox to present to the user."],
    ["passcode", "passcode", "", "string", "A string that the user must enter to access the problem. If blank, then no passcode is prompted."],
    //["toolboxLevel", "toolbox_level", "normal", "toolbox", "INCOMPLETE: What level of toolbox to present to the user (hiding and showing categories)."],
    ["startView", "start_view", DisplayModes.SPLIT, DisplayModes, "The Python editor mode to start in when the student starts the problem."],
    ["datasets", "datasets", "", "string", "The current list of datasets available on load as a comma-separated string."],
    ["disableTimeout", "disable_timeout", false, "bool", "If checked, then students code is allowed to run without timeouts (potentially allowing infinite loops)."],
    ["isParsons", "is_parsons", false, "bool", "If checked, then this is a parson's style question (jumbled)."],
    ["disableFeedback", "disable_feedback", false, "bool", "If checked, then no instructor scripts are run (e.g., on_run and on_eval)."],
    ["disableInstructorRun", "disable_instructor_run", false, "bool", "If checked, then the instructor on_run will not automatically run the students' code. This still runs the students' code."],
    ["disableStudentRun", "disable_student_run", false, "bool", "If checked, then the run button no longer run the students' code. This still runs the instructor's feedback on_run script."],
    ["disableTifa", "disable_tifa", false, "bool", "If checked, then do not automatically run Tifa (which can be slow)."],
    ["disableTrace", "disable_trace", false, "bool", "If checked, then the students code will not have its execution traced (no variables recorded, no coverage tracked)."],
    ["disableEdit", "disable_edit", false, "bool", "If checked, then the students' file will not be editable."],
    ["enableImages", "can_image", false, "bool", "If checked, then users can copy/paste images directly into the text editor."],
    ["enableBlocks", "can_blocks", true, "bool", "If checked, then the student can edit the block interface (if not, then it is visible but not editable)."],
    ["canClose", "can_close", false, "bool", "If checked, then the student should mark their submission closed when they are done. There is no way to force a student to do so. Unlike Reviewed, this still submits the correctness."],
    ["onlyInteractive", "only_interactive", false, "bool", "If checked, the editors are hidden, the program is automatically run, and then the console enters Eval mode (interactive)."],
    ["onlyUploads", "only_uploads", false, "bool", "If checked, then the students' file will not be directly editable (they will have to upload submissions)."],
    // What menus/feedback to show and hide
    ["hideSubmission", "hide_submission", false, "bool", "If checked, then students will not be able to see their submission's code or history on Canvas."],
    ["hideFiles", "hide_files", true, "bool", "If checked, then students will not see the View Files toolbar."],
    ["hideQueuedInputs", "hide_queued_inputs", false, "bool", "If checked, then the students cannot access the queued inputs box (makes repeated debugging easier for the input function)."],
    ["hideEditors", "hide_editors", false, "bool", "If checked, then all of the editors are hidden."],
    ["hideMiddlePanel", "hide_middle_panel", false, "bool", "If checked, then the console and feedback areas is hidden."],
    ["hideAll", "hide_all", false, "bool", "INCOMPLETE: If checked, then the entire interface is hidden."],
    ["hideEvaluate", "hide_evaluate", false, "bool", "If checked, then the Evaluate button is not shown on the console."],
    ["hideImportDatasetsButton", "hide_import_datasets_button", false, "bool", "If checked, then students cannot see the import datasets button."],
    // TODO: Fix this one to be settable
    ["hideImportStatements", "hide_import_statements", false, "bool", "INCOMPLETE: If checked, certain kinds of import statements (matplotlib, turtle, datasets) are not shown in the block interface."],
    ["hideCoverageButton", "hide_coverage_button", false, "bool", "INCOMPLETE: If checked, the coverage button is not shown."],
    ["saveTurtleOutput", "save_turtle_output", false, "bool", "If checked, then turtle output is saved whenever the program uses it."],
];

function getDocumentation(name) {
    for (let i=0; i < ASSIGNMENT_SETTINGS.length; i++) {
        if (ASSIGNMENT_SETTINGS[i][0] === name) {
            return ASSIGNMENT_SETTINGS[i][4];
        }
    }
    return "Documentation not found for field";
}

function makeStartViewTab(name, icon, mode) {
    return `<label class="btn btn-outline-secondary blockpy-mode-set-blocks"
                data-bind="css: {active: assignment.settings.startView() === '${mode}'},
                           click: assignment.settings.startView.bind($data, '${mode}')">
                <span class='fas fa-${icon}'></span>
                <input type="radio" name="blockpy-start-view-set" autocomplete="off" checked> ${name}
            </label>`;
}

const ASSIGNMENT_SETTINGS_BOOLEAN_COMPONENTS_HTML = ASSIGNMENT_SETTINGS
    // Only handle the simple booleans this way
    .filter((setting) => setting[3] === "bool")
    .map((setting) => {
        let prettyName = setting[1].split("_").map(word=>(word.charAt(0).toUpperCase()+word.slice(1))).join(" ");
        return `
        <div class="form-group row">
            <div class="col-sm-2 text-right">
                <label class="form-check-label" for="blockpy-settings-${setting[0]}">${prettyName}</label>
            </div>
            <div class="col-sm-1">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="blockpy-settings-${setting[0]}"
                    data-bind="checked: assignment.settings.${setting[0]}">
                </div>  
            </div>            
            <div class="col-sm-9">
                <small class="form-text text-muted">
                    ${setting[4]}
                </small>
            </div>
        </div>
        `;
    }).join("\n\n");

export const ASSIGNMENT_SETTINGS_EDITOR_HTML = `
    <div class="blockpy-view-settings">
    
    <form>

        <div class="form-group row">
            <div class="col-sm-12 mx-auto">
                <button type="button" class="btn btn-success"
                    data-bind="click: ui.editors.settings.save">Save changes</button>
            </div>
        </div>
    
        <div class="form-group row">
            <label for="blockpy-settings-name" class="col-sm-2 col-form-label text-right">Name:</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="blockpy-settings-name"
                data-bind="value: assignment.name">
                <small class="form-text text-muted">
                    The student-facing name of the assignment. Assignments within a group are ordered alphabetically
                    by their name, so you may want to use a naming scheme like "#43.5) Whatever".
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <label for="blockpy-settings-url" class="col-sm-2 col-form-label text-right">URL:</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="blockpy-settings-url"
                data-bind="value: assignment.url">
                <small class="form-text text-muted">
                    The course-unique URL that can be used to consistently refer to this assignment. 
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <div class="col-sm-2 text-right">
                <label class="form-check-label" for="blockpy-settings-public">Public:</label>
            </div>
            <div class="col-sm-1">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="blockpy-settings-public"
                    data-bind="checked: assignment.public">
                </div>  
            </div>            
            <div class="col-sm-9">
                <small class="form-text text-muted">
                    If not public, users outside of the course will not be able to see the assignment in course listings.
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <div class="col-sm-2 text-right">
                <label class="form-check-label" for="blockpy-settings-hidden">Hidden:</label>
            </div>
            <div class="col-sm-1">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="blockpy-settings-hidden"
                    data-bind="checked: assignment.hidden">
                </div>  
            </div>            
            <div class="col-sm-9">
                <small class="form-text text-muted">
                    If hidden, students will not be able to see their grade while working on the assignment.
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <div class="col-sm-2 text-right">
                <label class="form-check-label" for="blockpy-settings-reviewed">Reviewed:</label>
            </div>
            <div class="col-sm-1">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="blockpy-settings-reviewed"
                    data-bind="checked: assignment.reviewed">
                </div>  
            </div>            
            <div class="col-sm-9">
                <small class="form-text text-muted">
                    If reviewed, the assignment need to be commented upon and regraded by the staff after submission.
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <div class="col-sm-2 text-right">
                <label class="form-check-label" for="blockpy-settings-reviewed">Starting View:</label>
            </div>
            <div class="col-sm-3">
                <div class="btn-group btn-group-toggle mr-2" data-toggle="buttons">
                    ${makeStartViewTab("Blocks", "th-large", DisplayModes.BLOCK)}
                    ${makeStartViewTab("Split", "columns", DisplayModes.SPLIT)}
                    ${makeStartViewTab("Text", "align-left", DisplayModes.TEXT)}
                 </div>
            </div>            
            <div class="col-sm-7">
                <small class="form-text text-muted">
                    ${getDocumentation("startView")}
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <label for="blockpy-settings-ip-ranges" class="col-sm-2 col-form-label text-right">IP Ranges:</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="blockpy-settings-ip-ranges"
                data-bind="value: assignment.ipRanges">
                <small class="form-text text-muted">
                    Provide a comma-separated list of IP Addresses that will be explicitly allowed. If blank,
                    then all addresses are allowed. If an address starts with <code>^</code> then it it is explicitly
                    blacklisted, but that can be overridden in turn with a <code>!</code>. Addresses can also
                    include a bit mask to allow a range of addresses.
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <label for="blockpy-settings-passcode" class="col-sm-2 col-form-label text-right">Passcode:</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="blockpy-settings-passcode"
                data-bind="value: assignment.settings.passcode">
                <small class="form-text text-muted">
                    ${getDocumentation("passcode")}
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <label for="blockpy-settings-datasets" class="col-sm-2 col-form-label text-right">Preloaded Datasets:</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="blockpy-settings-datasets"
                data-bind="value: assignment.settings.datasets">
                <small class="form-text text-muted">
                    ${getDocumentation("datasets")}
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <label for="blockpy-settings-toolbox" class="col-sm-2 col-form-label text-right">Block Toolbox:</label>
            <div class="col-sm-10">
                <select class="form-control" id="blockpy-settings-toolbox"
                       data-bind="value: assignment.settings.toolbox">
                   <option value="normal">Normal Toolbox</option>
                   <option value="ct">CT@VT Toolbox</option>
                   <option value="ct2">CT@VT Toolbox V2</option>
                   <option value="minimal">Minimal Set</option>
                   <option value="full">All Blocks</option>
                </select>
                <small class="form-text text-muted">
                    ${getDocumentation("toolbox")}
                </small>
            </div>
        </div>
        
        ${ASSIGNMENT_SETTINGS_BOOLEAN_COMPONENTS_HTML}
    </form>
    
    </div>
`;

export function saveAssignmentSettings(model) {
    let settings = {};
    ASSIGNMENT_SETTINGS.forEach(setting => {
        let clientName = setting[0], serverName = setting[1], defaultValue = setting[2];
        let value = model.assignment.settings[clientName]();
        // Only store this setting if its different from the default
        if (value !== defaultValue) {
            settings[serverName] = value;
        }
    });
    return JSON.stringify(settings);
}

export function loadAssignmentSettings(model, settings) {
    if (settings) {
        settings = JSON.parse(settings);
        ASSIGNMENT_SETTINGS.forEach(setting => {
            let clientName = setting[0], serverName = setting[1];
            if (serverName in settings) {
                model.assignment.settings[clientName](settings[serverName]);
            } else {
                model.assignment.settings[clientName](setting[2]);
            }
        });

        if (settings.start_view) {
            model.display.pythonMode(settings.start_view);
        }
    }
}

export function makeAssignmentSettingsModel(configuration) {
    let settings = {};
    ASSIGNMENT_SETTINGS.forEach(setting => {
        let clientName = setting[0], serverName = setting[1], defaultValue = setting[2],
            fieldType = setting[3];
        if (configuration["assignment.settings."+serverName] === undefined) {
            settings[clientName] = ko.observable(defaultValue);
        } else {
            let configValue = configuration["assignment.settings."+serverName];
            if (fieldType === "bool") {
                configValue = configValue.toLowerCase() === "true";
            }
            settings[clientName] = ko.observable(configValue);
        }
    });

    return settings;
}

class AssignmentSettingsView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag);
        this.dirty = false;
    }

    enter(newFilename, oldEditor) {
        super.enter(newFilename, oldEditor);
        console.log(this.file);
        this.dirty = false;
        //TODO: this.updateEditor(this.file.handle());
        // Subscribe to the relevant File
        // this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));
        // Notify relevant file of changes to BM
        this.currentListener = this.updateHandle.bind(this);

        //TODO: this.codeMirror.on("change", this.currentListener);
    }

    updateEditor(newContents) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            // TODO: Do update

            this.dirty = false;
        }
    }

    updateHandle(event) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            //this.file.handle(this.codeMirror.value());
            // TODO: Update
            this.dirty = false;
        }
    }

    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        //this.currentSubscription.dispose();
        // TODO: update
        //this.codeMirror.off("change", this.currentListener);
        super.exit(newFilename, oldEditor);
    }
}

export const AssignmentSettings = {
    name: "Assignment Settings",
    extensions: ["!assignment_settings.blockpy"],
    constructor: AssignmentSettingsView,
    template: ASSIGNMENT_SETTINGS_EDITOR_HTML
};