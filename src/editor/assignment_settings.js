import {AbstractEditor} from "./abstract_editor";
import {DisplayModes} from "./python";

export const ASSIGNMENT_SETTINGS_EDITOR_HTML = `
    <div>
    Assignment Settings
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
     * The current list of datasets available
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
    ["startInteractive", "start_interactive", false],
    // What menus/feedback to show and hide
    ["hideFiles", "hide_files", true],
    ["hideQueuedInputs", "hide_queued_inputs", true],
    ["hideEditors", "hide_editors", false],
    ["hideAll", "hide_all", false],
    ["hideImportDatasetsButton", "hide_import_datasets_button", false],
    ["hideImportStatements", "hide_import_statements", false],
    ["hideCoverageButton", "hide_coverage_button", false]
];

export function saveAssignmentSettings(model) {
    let settings = {};
    ASSIGNMENT_SETTINGS.forEach(setting => {
        let value = model.assignment.settings[setting[0]]();
        // Only store this setting if its different from the default
        if (value !== setting[2]) {
            settings[setting[0]] = value;
        }
    });
    return JSON.stringify(settings);
}

export function loadAssignmentSettings(model, settings) {
    if (settings) {
        settings = JSON.parse(settings);
        ASSIGNMENT_SETTINGS.forEach(setting => {
            if (setting[0] in settings) {
                model.assignment.settings[setting[0]](settings[setting[0]]);
            }
        });
    }
}

export function makeAssignmentSettingsModel(configuration) {
    let settings = {};
    ASSIGNMENT_SETTINGS.forEach(setting => {
        if (configuration[setting[1]] === undefined) {
            settings[setting[0]] = ko.observable(setting[2]);
        } else {
            settings[setting[0]] = ko.observable(configuration["assignment.settings."+setting[1]]);
        }
    });
    return settings;
}

class AssignmentSettingsView extends AbstractEditor {

}

export const AssignmentSettings = {
    name: "Assignment Settings",
    extensions: ["!assignment_settings.blockpy"],
    constructor: AssignmentSettingsView,
    template: ASSIGNMENT_SETTINGS_EDITOR_HTML
};