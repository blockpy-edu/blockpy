/**
 * @fileoverview Starting point of the BlockPy application, containing the main
 * BlockPy class.
 */
import "./css/blockpy.css";
import "./css/bootstrap_retheme.css";
import $ from "jquery";
import {$builtinmodule as imageModule} from "skulpt_modules/image";
import {$builtinmodule as weakrefModule} from "skulpt_modules/weakref";
//import {$builtinmodule as matplotlibModule} from "skulpt_modules/matplotlib2";
import {makeInterface} from "interface.js";
import {
    loadConcatenatedFile
} from "./files";
import {loadAssignmentSettings} from "./editor/assignment_settings";
import {getCurrentTime} from "./utilities";
import {SubmissionStatuses} from "./editor/sample_submissions";
import {initializeModel} from "./model/model-config";
import {initializeUIModelMethods} from "./model/ui-model";
import {initializeComponents} from "./components/component-initializer";

// Re-export for backward compatibility 
export {_IMPORTED_COMPLETE_DATASETS, _IMPORTED_DATASETS} from "./corgis";

/**
 * Major entry point for creating a BlockPy instance.
 * Two most important fields are `model` and `components`.
 * The `model` holds all the data about the interface.
 * The `components` are references to the disparate parts of BlockPy.
 *
 * Most of this classes definition is just initializing the model and updating
 * it on an assignment switch.
 */
export class BlockPy {
    /**
     * @param {Object} configuration - User level settings (e.g., what editor mode, whether to mute semantic errors, etc.)
     * @param {Object} assignment - Assignment level settings (data about the loaded assignment, user, submission, etc.)
     * @param {Object} submission - Includes the source code of any programs to be loaded
     */
    constructor(configuration, assignment, submission) {
        this.initModel(configuration);
        if (assignment !== undefined) {
            this.setAssignment(configuration, assignment, submission);
        }
        this.initMain();
    }

    /**
     * Initializes the BlockPy object by initializing its interface,
     * model, and components.
     *
     */
    initMain() {
        this.initUtilities();
        this.initModelMethods();
        this.turnOnHacks();
        this.initInterface();
        this.applyModel();
        this.initComponents();
        this.makeExtraSubscriptions();
        this.start();
    };

    /**
     * Retrieves a default value or
     * @param {string} key - the key to look up a value for
     * @param {Object} defaultValue - if the key is not found anywhere, use this value
     */
    getSetting(key, defaultValue) {
        if (key in this.initialConfiguration_) {
            return this.initialConfiguration_[key];
        } else if (this.localSettings_.has(key)) {
            return this.localSettings_.get(key);
        } else {
            return defaultValue;
        }
    }

    /**
     * Initializes the model using the modular configuration approach.
     */
    initModel(configuration) {
        const modelData = initializeModel(configuration);
        this.model = modelData.model;
        this.localSettings_ = modelData.localSettings;
        this.getSetting = modelData.getSetting;
        this.initialConfiguration_ = modelData.initialConfiguration;
    };

    /**
     * Creates the interface
     */
    initInterface() {
        let constants = this.model.configuration;
        let gui = makeInterface(this);
        constants.container = $(constants.attachmentPoint).html($(gui));
    };

    loadAssignment(assignment_id) {
        this.components.server.loadAssignment(assignment_id);
    }

    loadTags(tags) {
        // Already a JSON list representing tags
    }

    loadSampleSubmissions(samples) {
        // Already a JSON list representing samples
    }

    loadNoSubmission(assignment) {
        this.model.submission.code(assignment.starting_code);
        loadConcatenatedFile(assignment.extra_starting_files, this.model.submission.extraFiles);
    }

    loadSubmission(submission, assignment) {
        if (!submission) {
            // TODO: Scarier "You are not logged in message"
            this.loadNoSubmission(assignment);
            return false;
        }
        // TODO: What if submissions' assignment version and the assignments' version conflict?
        this.model.submission.id(submission.id);
        this.model.display.backupSubmissionCode(submission.code);
        this.model.submission.code(extractPart(submission.code, this.model.configuration.partId()) || "");
        this.model.submission.correct(submission.correct);
        this.model.submission.score(submission.score);
        this.model.submission.endpoint(submission.endpoint);
        this.model.submission.url(submission.url);
        this.model.submission.version(submission.version);
        this.model.submission.gradingStatus(submission.grading_status || SubmissionStatuses.UNKNOWN);
        this.model.submission.submissionStatus(submission.submission_status || SubmissionStatuses.UNKNOWN);
        this.model.submission.ownerId(submission.user_id);
        this.model.user.courseId(submission.course_id);
        loadConcatenatedFile(submission.extra_files, this.model.submission.extraFiles);
    }

    loadAssignmentData_(data) {
        console.debug(data);
        this.resetInterface();
        this.components.fileSystem.dismountExtraFiles();
        let wasServerConnected = this.model.configuration.serverConnected();
        this.model.configuration.serverConnected(false);
        let assignment = data.assignment;
        this.model.assignment.id(assignment.id);
        this.model.assignment.version(assignment.version);
        this.model.assignment.courseId(assignment.course_id);
        this.model.assignment.forkedId(assignment.forked_id);
        this.model.assignment.forkedVersion(assignment.forked_version);
        this.model.assignment.hidden(assignment.hidden);
        this.model.assignment.reviewed(assignment.reviewed);
        this.model.assignment.public(assignment.public);
        this.model.assignment.type(assignment.type);
        this.model.assignment.url(assignment.url);
        this.model.assignment.points(assignment.points);
        this.model.assignment.ipRanges(assignment.ip_ranges);
        this.model.assignment.instructions(assignment.instructions);
        this.model.assignment.name(assignment.name);
        this.model.assignment.onChange(assignment.on_change || null);
        if (assignment.on_change) {
            this.components.fileSystem.newFile("!on_change.py", assignment.on_change);
        }
        this.model.assignment.onEval(assignment.on_eval || null);
        if (assignment.on_eval) {
            this.components.fileSystem.newFile("!on_eval.py", assignment.on_eval);
        }
        this.model.assignment.onRun(assignment.on_run);
        this.model.assignment.startingCode(assignment.starting_code);
        this.model.assignment.ownerId(assignment.owner_id);
        this.loadTags(assignment.tags);
        this.loadSampleSubmissions(assignment.sample_submissions);
        loadConcatenatedFile(assignment.extra_instructor_files, this.model.assignment.extraInstructorFiles);
        loadConcatenatedFile(assignment.extra_starting_files, this.model.assignment.extraStartingFiles);
        loadAssignmentSettings(this.model, assignment.settings);
        this.loadSubmission(data.submission, assignment);
        this.model.display.dirtySubmission(true);
        this.model.display.changedInstructions(null);
        this.model.configuration.serverConnected(wasServerConnected);
        this.components.corgis.loadDatasets(true);
        this.components.pythonEditor.bm.refresh();
        this.components.fileSystem.loadRemoteFiles();

        this.components.server.setStatus("saveFile", StatusState.READY);
    }

    /**
     * Initialize UI model methods using the modular approach.
     */
    initModelMethods() {
        initializeUIModelMethods(this, this.model);
    }

    turnOnHacks() {
        //console.log("TODO");
        Sk.builtinFiles.files["src/lib/image.js"] = imageModule.toString();
        //Sk.builtinFiles.files["src/lib/weakref.js"] = weakrefModule.toString();
        //Sk.builtinFiles.files["src/lib/matplotlib/pyplot/__init__.js"] = matplotlibModule.toString();
    }

    /**
     * Applys the KnockoutJS bindings to the model, instantiating the values into the
     * HTML.
     */
    applyModel() {
        ko.applyBindings(this.model, this.model.configuration.container[0]);
    }

    initUtilities() {
        let main = this;
        this.utilities = {
            markdown: (text) => text ? EasyMDE.prototype.markdown(text) : "<p></p>"
        };
    }

    /**
     * Initialize components using the modular approach.
     */
    initComponents() {
        let container = this.model.configuration.container;
        this.components = initializeComponents(this, container);
    }

    show() {
        this.model.configuration.container.show();
        //this.model.configuration.container.find(".blockpy-file-instructor").toggle(this.model.display.instructor());
    }

    hide() {
        this.model.configuration.container.hide();
    }

    makeExtraSubscriptions() {
        this.model.display.changedInstructions.subscribe((changed) => {
            this.components.server.logEvent("X-Instructions.Change", "", "",
                                            changed, "instructions.md");
        });
        this.clock = null;
        const container = this.model.configuration.container;
        const updateClock = () => container.find(".blockpy-menu-clock").text(getCurrentTime());
        if (this.model.ui.menu.showClock()) {
            this.clock = setInterval(updateClock, 1000);
        }

        this.model.ui.menu.showClock.subscribe((changed) => {
            if (this.model.ui.menu.showClock()) {
                if (this.clock) {
                    clearInterval(this.clock);
                    this.clock = null;
                }
            } else {
                if (!this.clock) {
                    this.clock = setInterval(updateClock, 1000);
                }
            }
        });
    }

    start() {
        this.model.display.filename("answer.py");
    }

    resetInterface() {
        this.components.engine.reset();
        // Disable any alternative logEntry functions we have been given
        this.components.server.altLogEntry = null;
    }

    requestPasscode() {
        let userSuppliedPasscode = prompt("Please enter the passcode.");
        this.model.display.passcode(userSuppliedPasscode);
    }

    destroy() {

    }

}

