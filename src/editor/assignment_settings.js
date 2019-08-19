import {AbstractEditor} from "./abstract_editor";
import {DisplayModes} from "./python";

export const ASSIGNMENT_SETTINGS_EDITOR_HTML = `
    <div>
    Assignment Settings
    
    <form>
        <div class="form-group row">
            <label for="blockpy-settings-name" class="col-sm-2 col-form-label">Name:</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="blockpy-settings-name">
            </div>
        </div>
        <!--
        url
        reviewed
        hidden
        public
        ip_ranges
        
        settings
        -->
    </form>
    
    </div>
`;

const ASSIGNMENT_SETTINGS = [
    /**
     * Whether or not the user is allowed to edit the file directly
     * @type {bool}
     */
    ["canEdit", "can_edit", true],
    /**
     * Whether or not the user can use blocks
     * @type {bool}
     */
    ["canBlocks", "can_blocks", true],
    /**
     * Whether to prevent timeouts (potentially allow infinite loops)
     * @type {bool}
     */
    ["disableTimeout", "disable_timeout", false],
    /**
     * What level of toolbox to present to the user
     */
    ["toolboxLevel", "toolbox_level", "normal"],
    /**
     * When the student opens this assignment, what Python editor mode to start in
     */
    ["startView", "start_view", DisplayModes.SPLIT],
    /**
     * The current list of datasets available on load as a comma separated string
     */
    ["datasets", "datasets", ""],
    /**
     * Whether this a parson's style question
     */
    ["isParsons", "is_parsons", false],
    // Whether to even try to run feedback
    ["disableFeedback", "disable_feedback", false],
    // Whether to do any tracing
    ["disableTrace", "disable_trace", false],
    // Whether to immediately start in Interactive Console mode
    ["onlyInteractive", "only_interactive", false],
    ["onlyUploads", "only_uploads", false],
    // What menus/feedback to show and hide
    ["hideFiles", "hide_files", true],
    ["hideQueuedInputs", "hide_queued_inputs", true],
    ["hideEditors", "hide_editors", false],
    ["hideAll", "hide_all", false],
    ["hideEvaluate", "hide_evaluate", false],
    ["hideImportDatasetsButton", "hide_import_datasets_button", true],
    ["hideImportStatements", "hide_import_statements", false],
    ["hideCoverageButton", "hide_coverage_button", false]
];

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
            }
        });
    }
}

export function makeAssignmentSettingsModel(configuration) {
    let settings = {};
    ASSIGNMENT_SETTINGS.forEach(setting => {
        let clientName = setting[0], serverName = setting[1], defaultValue = setting[2];
        if (configuration[serverName] === undefined) {
            settings[clientName] = ko.observable(defaultValue);
        } else {
            settings[clientName] = ko.observable(configuration["assignment.settings."+serverName]);
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