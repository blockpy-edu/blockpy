/**
 * @fileoverview Starting point of the BlockPy application, containing the main
 * BlockPy class.
 */
import "./css/blockpy.css";
import "./css/bootstrap_retheme.css";
import $ from "jquery";
import {$builtinmodule} from "skulpt_modules/image";
import {LocalStorageWrapper} from "storage.js";
import {EditorsEnum} from "editors.js";
import {DisplayModes} from "editor/python.js";
import {StatusState} from "server.js";
import {makeInterface, makeExtraInterfaceSubscriptions, SecondRowSecondPanelOptions} from "interface.js";
import {Editors} from "editors.js";
import {
    BlockPyFileSystem,
    loadConcatenatedFile,
    makeModelFile,
    observeConcatenatedFile,
    UNDELETABLE_FILES,
    UNRENAMABLE_FILES
} from "./files";
import {uploadFile, downloadFile} from "./editor/abstract_editor";
import {BlockPyEngine} from "engine.js";
import {BlockPyTrace} from "./trace";
import {BlockPyConsole} from "./console";
import {BlockPyFeedback} from "feedback.js";
import {BlockPyServer} from "./server";
import {BlockPyDialog} from "./dialog";
import {loadAssignmentSettings, makeAssignmentSettingsModel} from "./editor/assignment_settings";
import {BlockPyCorgis, _IMPORTED_COMPLETE_DATASETS, _IMPORTED_DATASETS} from "./corgis";
import {BlockPyHistory} from "./history";
import {capitalize} from "./utilities";

export {_IMPORTED_COMPLETE_DATASETS, _IMPORTED_DATASETS};

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
     * Initializes the model to its defaults.
     *
     * Categories:
     *   * user: values for the current user (stored to server)
     *   * assignment: values for the current assignment (stored to server)
     *   * submission: values for the current submission (stored to server)
     *   * display: flags related to current visibility (stored to localSettings)
     *   * status: messages related to current status (not stored)
     *   * execution: values related to last run (not stored)
     *   * configuration: constant values related to setup (not stored)
     */
    initModel(configuration) {
        // Connect to local storage
        this.localSettings_ = new LocalStorageWrapper("localSettings");
        this.initialConfiguration_ = configuration;

        this.model = {
            user: {
                id: ko.observable(configuration["user.id"]),
                name: ko.observable(configuration["user.name"]),
                /**
                 * Whether you are an Owner (can modify the assignment), Grader (can view
                 * the assignments' information) or Student (can not see any instructor stuff).
                 * @type {bool}
                 */
                role: ko.observable(this.getSetting("user.role", "owner")),
                /**
                 * Current course for this user
                 */
                courseId: ko.observable(configuration["user.course_id"]),
                /**
                 * Current assignment group that this user is inside
                 */
                groupId: ko.observable(configuration["user.group_id"])
            },
            assignment: {
                id: ko.observable(null),
                name: ko.observable("Scratch Canvas"),
                instructions: ko.observable("Welcome to BlockPy. Try editing and running the code below."),
                /**
                 * The human-friendly URL to use as a shortcut for this assignment
                 */
                url: ko.observable(""),
                // TODO: warning message if maze
                type: ko.observable(""),
                startingCode: ko.observable(configuration["assignment.starting_code"] || ""),
                onRun: ko.observable(configuration["assignment.on_run"] || ""),
                onChange: ko.observable(configuration["assignment.on_change"] || null),
                onEval: ko.observable(configuration["assignment.on_eval"] || null),
                extraInstructorFiles: ko.observableArray([]),
                extraStartingFiles: ko.observableArray([]),
                forkedId: ko.observable(null),
                forkedVersion: ko.observable(null),
                ownerId: ko.observable(null),
                courseId: ko.observable(null),
                version: ko.observable(null),
                tags: ko.observableArray([]),
                sampleSubmissions: ko.observableArray([]),
                reviewed: ko.observable(configuration["assignment.reviewed"]),
                public: ko.observable(configuration["assignment.public"]),
                hidden: ko.observable(configuration["assignment.hidden"]),
                ipRanges: ko.observable(configuration["assignment.ip_ranges"]),
                settings: makeAssignmentSettingsModel(configuration)
            },
            submission: {
                id: ko.observable(null),
                code: ko.observable(configuration["submission.code"] || ""),
                extraFiles: ko.observableArray([]),
                url: ko.observable(""),
                endpoint: ko.observable(""),
                score: ko.observable(0),
                correct: ko.observable(false),
                // assignmentId inferred from assignment.id
                // courseId inferred from user.courseId
                // userId inferred from user.id
                // assignmentVersion inferred from assignment.version
                version: ko.observable(0),
                submissionStatus: ko.observable("Started"),
                gradingStatus: ko.observable("NotReady"),
                ownerId: ko.observable(null)
            },
            display: {
                /**
                 * Currently visible File, if applicable
                 * @type {String}
                 */
                filename: ko.observable(null),
                /**
                 * Whether or not to be presented with the instructor settings and files
                 * @type {bool}
                 */
                instructor: ko.observable(this.getSetting("display.instructor", "false").toString()==="true"),
                /**
                 * Whether or not to prevent the printer from showing things
                 */
                mutePrinter: ko.observable(false),
                /**
                 * (Python Views) The current editor mode.
                 * @type {DisplayModes}
                 */
                pythonMode: ko.observable(this.getSetting("display.python.mode", DisplayModes.SPLIT)),
                /**
                 * Whether or not History mode is engaged.
                 * @type {bool}
                 */
                historyMode: ko.observable(false),
                /**
                 * Whether or not to be auto-saving changes in Python editor
                 * If an integer, specifies the delay that should be used (microseconds).
                 * This is never on in non-Python editors.
                 * @type {bool|int}
                 */
                autoSave: ko.observable(true),
                /**
                 * Whether or not the console is full width and feedback is hidden
                 */
                bigConsole: ko.observable(false),
                /**
                 * The height to use for the console.
                 *    If null, then let the height remain unchanged
                 *    If a number, then the
                 */
                previousConsoleHeight: ko.observable(null),
                currentConsoleHeight: ko.observable(null),
                /**
                 * Which panel to show in the second row's second column
                 * @type {SecondRowSecondPanelOptions}
                 */
                secondRowSecondPanel: ko.observable(SecondRowSecondPanelOptions.FEEDBACK),
                /**
                 * Whether or not to be tracing the code right now
                 */
                traceExecution: ko.observable(false),
                /**
                 * The list of promises to still resolve while loading datasets
                 * @type {Array<Promise>}
                 */
                loadingDatasets: ko.observableArray([]),
                /**
                 * The temporary changed value of the instructions have been changed from what is in the assignment
                 */
                changedInstructions: ko.observable(null),
                /**
                 * A holder for the timer to trigger on-changes
                 */
                triggerOnChange: null,
                /**
                 * Whether the current feedback and output corresponds to the current submission.
                 * This would be false if there is no feedback/output (i.e., code has not been run),
                 * or if the user has modified the submission after the last run (e.g., by editing
                 * the text).
                 */
                dirtySubmission: ko.observable(true),
                /**
                 *  Whether or not to make the BlockPy element in FULL SCREEN mode. Sadly, not fullscreen
                 *  within the window, but FULL SCREEN. Very aggressive.
                 */
                fullscreen: ko.observable(false),
                /**
                 * User-supplied passcode to compare on the server against the current passcode.
                 */
                passcode: ko.observable(""),
                /**
                 * Whether or not to clear out inputs after a run/on_run cycle
                 */
                clearInputs: ko.observable(true)
            },
            status: {
                // @type {ServerStatus}
                loadAssignment: ko.observable(StatusState.READY),
                loadAssignmentMessage: ko.observable(""),
                // @type {ServerStatus}
                loadHistory: ko.observable(StatusState.READY),
                loadHistoryMessage: ko.observable(""),
                // @type {ServerStatus}
                loadFile: ko.observable(StatusState.READY),
                loadFileMessage: ko.observable(""),
                // @type {ServerStatus}
                loadDataset: ko.observable(StatusState.READY),
                loadDatasetMessage: ko.observable(""),
                // @type {ServerStatus}
                logEvent: ko.observable(StatusState.READY),
                logEventMessage: ko.observable(""),
                // @type {ServerStatus}
                saveImage: ko.observable(StatusState.READY),
                saveImageMessage: ko.observable(""),
                // @type {ServerStatus}
                saveFile: ko.observable(StatusState.READY),
                saveFileMessage: ko.observable(""),
                // @type {ServerStatus}
                saveAssignment: ko.observable(StatusState.READY),
                saveAssignmentMessage: ko.observable(""),
                // @type {ServerStatus}
                updateSubmission: ko.observable(StatusState.READY),
                updateSubmissionMessage: ko.observable(""),
                // @type {ServerStatus}
                updateSubmissionStatus: ko.observable(StatusState.READY),
                updateSubmissionStatusMessage: ko.observable(""),
                // @type {ServerStatus}
                onExecution: ko.observable(StatusState.READY),
            },
            execution: {
                // Information about in-progress executions
                reports: {},
                // list of Output objects
                output: ko.observableArray([]),
                // List of inputted strings
                input: ko.observableArray([]),
                inputIndex: ko.observable(0),
                // Information related to a student run
                student: {
                    // str: the filename that was last executed and is associated with these results
                    filename: ko.observable(null),
                    // integer
                    currentStep: ko.observable(null),
                    // integer
                    lastStep: ko.observable(null),
                    // integer
                    currentLine: ko.observable(null),
                    lastLine: ko.observable(0),
                    // array of simple objects
                    currentTraceData: ko.observableArray([]),
                    // integer
                    currentTraceStep: ko.observable(0),
                    // Actual execution results
                    results: null,
                    globals: ko.observable(null)
                },
                instructor: {
                    globals: null,
                    sysmodules: undefined
                },
                // Information related to feedback from the instructor run
                feedback: {
                    // str (markdown)
                    message: ko.observable("Ready"),
                    category: ko.observable(null),
                    label: ko.observable(null),
                    hidden: ko.observable(false),
                    linesError: ko.observableArray([]),
                    linesUncovered: ko.observableArray([]),
                    // The results of the last execution
                    results: null,
                },
            },
            configuration: {
                /**
                 * Functions to fire when certain events occur
                 */
                callbacks: {
                    /**
                     * When the student gets a success
                     */
                    "success": this.initialConfiguration_["callback.success"],
                },
                /**
                 * Whether or not the server is connected.
                 * @type {bool}
                 */
                serverConnected: ko.observable(this.getSetting("server.connected", true)),
                // string
                blocklyPath: this.initialConfiguration_["blockly.path"],
                // string
                attachmentPoint: this.initialConfiguration_["attachment.point"],
                // JQuery object
                container: null,
                // Maps codes ('log_event', 'save_code') to URLs
                urls: this.initialConfiguration_["urls"] || {}
            }
        };
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
        this.model.submission.code(submission.code);
        this.model.submission.correct(submission.correct);
        this.model.submission.score(submission.score);
        this.model.submission.endpoint(submission.endpoint);
        this.model.submission.url(submission.url);
        this.model.submission.version(submission.version);
        this.model.submission.gradingStatus(submission.grading_status);
        this.model.submission.submissionStatus(submission.submission_status);
        this.model.submission.ownerId(submission.user_id);
        this.model.user.courseId(submission.course_id);
        loadConcatenatedFile(submission.extra_files, this.model.submission.extraFiles);
    }

    loadAssignmentData_(data) {
        console.log(data);
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
        loadAssignmentSettings(this.model, assignment.settings);
        this.loadTags(assignment.tags);
        this.loadSampleSubmissions(assignment.sample_submissions);
        loadConcatenatedFile(assignment.extra_instructor_files, this.model.assignment.extraInstructorFiles);
        loadConcatenatedFile(assignment.extra_starting_files, this.model.assignment.extraStartingFiles);
        this.loadSubmission(data.submission, assignment);
        this.model.display.dirtySubmission(true);
        this.model.display.changedInstructions(null);
        this.model.configuration.serverConnected(wasServerConnected);
        this.components.corgis.loadDatasets(true);
        this.components.pythonEditor.bm.refresh();

        this.components.server.setStatus("saveFile", StatusState.READY);
    }

    initModelMethods() {
        let self = this;
        let model = this.model;
        model.ui = {
            role: {
                isGrader: ko.pureComputed(()=>
                    model.user.role() === "owner" || model.user.role() === "grader")
            },
            instructions: {
                isChanged: ko.pureComputed(() =>
                    model.display.changedInstructions() !== null
                ),
                current: ko.pureComputed(() =>
                    model.ui.instructions.isChanged() ?
                        self.utilities.markdown(model.display.changedInstructions()) :
                        self.utilities.markdown(model.assignment.instructions())
                ),
                reset: () =>
                    model.display.changedInstructions(null)
            },
            menu: {
                textFullscreen: ko.pureComputed(() =>
                    (model.display.fullscreen()) ? "fa-compress-arrows-alt" : "fa-expand-arrows-alt"
                ),
                clickFullscreen: () =>{
                    model.display.fullscreen(!model.display.fullscreen());
                },
                editInputs: () => {
                    this.components.dialog.EDIT_INPUTS();
                },
                canMarkSubmitted: ko.pureComputed(() =>
                    model.assignment.hidden() || model.assignment.reviewed() ||
                    model.assignment.settings.canClose()
                ),
                textMarkSubmitted: ko.pureComputed(() => {
                    if (model.ui.menu.isCompleted()) {
                        return model.user.groupId() ? "Problem closed" : "Assignment closed";
                    } else if (model.ui.menu.isSubmitted()) {
                        return "Reopen for editing";
                    } else if (model.display.dirtySubmission()) {
                        return "Run";
                    } else {
                        if (!model.assignment.hidden() && model.submission.correct()) {
                            return "Submit";
                        } else {
                            return "Submit early";
                        }
                    }
                }),
                clickMarkSubmitted: () => {
                    if (model.ui.menu.isCompleted()) {
                        alert("You cannot reopen closed assignments. Contact a grader!");
                    } else if (model.ui.menu.isSubmitted()) {
                        self.components.server.updateSubmissionStatus("inProgress");
                    } else if (model.display.dirtySubmission()) {
                        self.components.engine.delayedRun();
                    } else {
                        self.components.server.updateSubmissionStatus("Submitted");
                    }
                },
                isSubmitted: ko.pureComputed(() =>
                    (model.assignment.reviewed() || model.assignment.settings.canClose()) &&
                    model.submission.submissionStatus().toLowerCase() === "submitted"
                ),
                isCompleted: ko.pureComputed(()=>
                    model.submission.submissionStatus().toLowerCase() === "completed"
                ),
                showQueuedInputs: ko.pureComputed(() =>
                    !model.assignment.settings.hideQueuedInputs()
                )
            },
            secondRow: {
                isAllVisible: ko.pureComputed(() =>
                    !model.assignment.settings.hideMiddlePanel()
                ),
                isFeedbackVisible: ko.pureComputed(() =>
                    model.display.secondRowSecondPanel() === SecondRowSecondPanelOptions.FEEDBACK
                ),
                isTraceVisible: ko.pureComputed(() =>
                    model.display.secondRowSecondPanel() === SecondRowSecondPanelOptions.TRACE
                ),
                isConsoleShowVisible: ko.pureComputed(() =>
                    model.ui.secondRow.isFeedbackVisible() || model.ui.secondRow.isTraceVisible()
                ),
                switchLabel: ko.pureComputed(() =>
                    model.execution.student.lastStep() !== null ?
                        "View Trace" : ""
                ),
                advanceState: function () {
                    let currentPanel = model.display.secondRowSecondPanel;
                    if (currentPanel() === SecondRowSecondPanelOptions.NONE) {
                        currentPanel(SecondRowSecondPanelOptions.FEEDBACK);
                    } else if (currentPanel() === SecondRowSecondPanelOptions.TRACE) {
                        currentPanel(SecondRowSecondPanelOptions.NONE);
                    } else if (model.execution.student.lastStep() !== null) {
                        currentPanel(SecondRowSecondPanelOptions.TRACE);
                    } else {
                        currentPanel(SecondRowSecondPanelOptions.NONE);
                    }
                },
            },
            console: {
                size: ko.pureComputed(() =>
                    model.display.secondRowSecondPanel() === SecondRowSecondPanelOptions.NONE ?
                        "col-md-12" :
                        "col-md-6"
                ),
                hideEvaluate: ko.pureComputed( ()=>
                    model.assignment.settings.hideEvaluate() || !model.execution.student.globals() ||
                    model.status.onExecution() === StatusState.ACTIVE
                )
            },
            feedback: {
                badge: ko.pureComputed(function () {
                    if (model.execution.feedback.category() === null) {
                        return "label-none";
                    }
                    switch (model.execution.feedback.category().toLowerCase()) {
                        default:
                        case "none":
                            return "label-none";
                        case "runtime":
                            return "label-runtime-error";
                        case "syntax":
                            return "label-syntax-error";
                        case "editor":
                            return "label-syntax-error";
                        case "internal":
                            return "label-internal-error";
                        case "semantic":
                        case "analyzer":
                            return "label-semantic-error";
                        case "feedback":
                        case "instructor":
                            return "label-feedback-error";
                        case "complete":
                            return "label-problem-complete";
                        case "instructions":
                            return "label-instructions";
                        case "no errors":
                            return "label-no-errors";
                    }
                }),
                category: ko.pureComputed(function () {
                    if (model.execution.feedback.category() === null) {
                        return "";
                    }
                    switch (model.execution.feedback.category().toLowerCase()) {
                        default:
                        case "none":
                            return "";
                        case "runtime":
                            return "Runtime Error";
                        case "syntax":
                            return "Syntax Error";
                        case "editor":
                            return "Editor Error";
                        case "internal":
                            return "Internal Error";
                        case "semantic":
                        case "analyzer":
                            return "Algorithm Error";
                        case "feedback":
                        case "instructions":
                            return "Instructions";
                        case "instructor":
                            return "Incorrect Answer";
                        case "complete":
                            return "Complete";
                        case "no errors":
                            return "No errors";
                    }
                })
            },
            trace: {
                has: ko.pureComputed(() =>
                    model.execution.student.currentTraceData() !== null
                ),
                line: ko.pureComputed(function () {
                    let step = model.execution.student.currentTraceStep();
                    let lastStep = model.execution.student.lastStep();
                    let traceData = model.execution.student.currentTraceData();
                    if (!traceData || step === null) {
                        return "No trace";
                    }
                    if (step === 0) {
                        return "Before run";
                    } else if (step === lastStep) {
                        return "Finished run";
                    } else {
                        // TODO: why are these numbers wonky?
                        return "Line "+(traceData[step].line-1);
                    }
                }),
                first: function () {
                    model.execution.student.currentTraceStep(0);
                },
                backward: function () {
                    let previous = Math.max(0, model.execution.student.currentTraceStep() - 1);
                    model.execution.student.currentTraceStep(previous);
                },
                forward: function () {
                    let next = Math.min(model.execution.student.lastStep(), model.execution.student.currentTraceStep() + 1);
                    model.execution.student.currentTraceStep(next);
                },
                last: function () {
                    model.execution.student.currentTraceStep(model.execution.student.lastStep());
                },
                data: ko.pureComputed(function () {
                    let step = model.execution.student.currentTraceStep();
                    let lastStep = model.execution.student.lastStep();
                    let traceData = model.execution.student.currentTraceData();
                    if (!traceData) {
                        return [];
                    }
                    switch (step) {
                        case 0:
                            return [];
                        case lastStep:
                            return traceData[step - 1];
                        default:
                            return traceData[step];
                    }
                }),
            },
            files: {
                visible: ko.pureComputed(() =>
                    model.display.instructor() || !model.assignment.settings.hideFiles()
                ),
                hasContents: function(path) {
                    switch (path) {
                        case "answer.py": return model.submission.code();
                        case "!instructions.md": return model.assignment.instructions();
                        case "!on_change.py": return model.assignment.onChange() !== null;
                        case "!on_eval.py": return model.assignment.onEval() !== null;
                        case "?mock_urls.blockpy": return model.assignment.extraInstructorFiles().some(file =>
                            file.filename() === "?mock_urls.blockpy");
                        case "!tags.blockpy": return model.assignment.tags().length;
                        case "!sample_submissions.blockpy": return model.assignment.sampleSubmissions().length;
                        default: return false;
                    }
                },
                add: function(path) {
                    switch (path) {
                        case "?mock_urls.blockpy":
                        case "?tags.blockpy":
                        case "?settings.blockpy":
                            self.components.fileSystem.newFile(path); break;
                        case "!on_change.py":
                            model.assignment.onChange("");
                            self.components.fileSystem.newFile(path);
                            break;
                            // TODO fix extrafiles for instructor and student
                        case "!on_eval.py":
                            model.assignment.onEval("");
                            self.components.fileSystem.newFile(path);
                            break;
                        case "instructor":
                            self.components.fileSystem.newFileDialog("instructor");
                            return;
                        case "student":
                            self.components.fileSystem.newFileDialog("student");
                            return;
                        case "starting":
                            self.components.fileSystem.newFileDialog("starting");
                            return;
                        default:

                    }
                    model.display.filename(path);
                },
                delete: function() {
                    return self.components.fileSystem.deleteFile(model.display.filename());
                },
                extraStudentFiles: observeConcatenatedFile(model.submission.extraFiles),
                extraInstructorFiles: observeConcatenatedFile(model.assignment.extraInstructorFiles),
                extraStartingFiles: observeConcatenatedFile(model.assignment.extraStartingFiles),
                displayFilename: function(path) {
                    if (path === "?mock_urls.blockpy") {
                        return "URL Data";
                    }
                    if (path.startsWith("&")) {
                        return path.slice(1);
                    }
                    return path;
                },
            },
            editors: {
                current: ko.pureComputed( ()=>
                    self.components.editors.getEditor(model.display.filename())
                ),
                view: ko.pureComputed(() =>
                    (!model.display.instructor() && model.assignment.settings.hideEditors()) ? "None" :
                    model.display.filename() ? model.ui.editors.current() : "None"
                ),
                reset: function() {
                    self.components.server.logEvent("X-File.Reset", "", "", "", "answer.py");
                    model.submission.code(model.assignment.startingCode());
                    model.submission.extraFiles(model.assignment.extraStartingFiles().map(
                        file => {
                            let filename = file.filename().substr(1);
                            return makeModelFile(filename, file.contents());
                        }
                    ));
                },
                canSave: ko.pureComputed(() =>
                    !model.display.autoSave()),
                canDelete: ko.pureComputed(() =>
                    (!model.assignment.settings.hideFiles() || model.display.instructor()) &&
                    UNDELETABLE_FILES.indexOf(model.display.filename()) === -1),
                canRename: ko.pureComputed(() =>
                    (!model.assignment.settings.hideFiles() || model.display.instructor()) &&
                    UNRENAMABLE_FILES.indexOf(model.display.filename()) === -1),
                upload: uploadFile.bind(self),
                download: downloadFile.bind(self),
                importDataset: () => {
                    self.components.corgis.openDialog();
                },
                python: {
                    fullscreen: () => {
                        let codeMirror = self.components.pythonEditor.bm.textEditor.codeMirror;
                        return codeMirror.setOption("fullScreen", !codeMirror.getOption("fullScreen"));
                    },
                    updateMode: (newMode) => {
                        self.components.server.logEvent("X-View.Change", "", "", newMode, model.display.filename());
                        model.display.pythonMode(newMode);
                        if (model.display.filename() === "answer.py") {
                            self.components.pythonEditor.oldPythonMode = newMode;
                        }
                    },
                    isHistoryAvailable: ko.pureComputed(()=>
                        model.ui.server.isEndpointConnected("loadHistory")),
                    turnOffHistoryMode: () => {
                        self.components.pythonEditor.updateEditor();
                        self.components.pythonEditor.setReadOnly(false);
                        model.display.historyMode(false);
                    },
                    turnOnHistoryMode: () => {
                        self.components.server.loadHistory((response) =>{
                            if (response.success) {
                                self.components.history.load(response.history);
                                model.display.historyMode(true);
                                self.components.pythonEditor.setReadOnly(true);
                            } else {
                                self.components.dialog.ERROR_LOADING_HISTORY();
                            }
                        });
                    },
                    toggleHistoryMode: () => {
                        if (model.display.historyMode()) {
                            model.ui.editors.python.turnOffHistoryMode();
                        } else {
                            model.ui.editors.python.turnOnHistoryMode();
                        }
                    },
                    history: {
                        start: ()=>{ self.components.history.moveToStart(); },
                        previous: ()=>{ self.components.history.movePrevious(); },
                        next: ()=>{ self.components.history.moveNext(); },
                        mostRecent: ()=>{ self.components.history.moveToMostRecent(); },
                        use: ()=>{ self.components.history.use(); }
                    }
                },
                settings: {
                    save: () => self.components.server.saveAssignment()
                }
            },
            execute: {
                isRunning: ko.pureComputed(() =>
                    model.status.onExecution() === StatusState.ACTIVE
                ),
                run: () =>
                    self.components.engine.delayedRun(),
                evaluate: () =>
                    self.components.engine.evaluate()
            },
            server: {
                status: (endpoint =>
                    "server-status-" + model.status[endpoint]()
                ),
                isEndpointConnected: (endpoint) =>
                    model.configuration.serverConnected() &&
                    model.configuration.urls !== undefined &&
                    model.configuration.urls[endpoint] !== undefined,
                messages: ko.pureComputed(() =>
                    capitalize(model.status.loadAssignmentMessage() ||
                        model.status.saveAssignmentMessage() ||
                        model.status.loadHistoryMessage() ||
                        model.status.loadFileMessage() ||
                        model.status.saveFileMessage() ||
                        model.status.loadDatasetMessage() ||
                        model.status.logEventMessage() ||
                        model.status.saveImage() ||
                        model.status.updateSubmissionMessage() ||
                        model.status.updateSubmissionStatusMessage() || "")
                ),
                force: {
                    updateSubmission: (data, event) => {
                        console.log(event);
                        self.components.server.updateSubmission(self.model.submission.score(),
                                                                self.model.submission.correct(),
                                                                false, true);
                        $(event.target).fadeOut(100).fadeIn(100);
                    }
                }
            },
        };
        makeExtraInterfaceSubscriptions(self, model);
    }

    turnOnHacks() {
        //console.log("TODO");
        Sk.builtinFiles.files["src/lib/image.js"] = $builtinmodule.toString();
    }

    /**
     * Applys the KnockoutJS bindings to the model, instantiating the values into the
     * HTML.
     */
    applyModel() {
        ko.applyBindings(this.model);
    }

    initUtilities() {
        let main = this;
        this.utilities = {
            markdown: (text) => text ? EasyMDE.prototype.markdown(text) : "<p></p>"
        };
    }

    initComponents() {
        let container = this.model.configuration.container;
        let components = this.components = {};
        let main = this;
        // Each of these components will take the BlockPy instance, and possibly a
        // reference to the relevant HTML location where it will be embedded.
        components.dialog = new BlockPyDialog(main, container.find(".blockpy-dialog"));
        components.feedback = new BlockPyFeedback(main, container.find(".blockpy-feedback"));
        components.trace = new BlockPyTrace(main);
        components.console = new BlockPyConsole(main, container.find(".blockpy-console"));
        components.engine = new BlockPyEngine(main);
        components.fileSystem = new BlockPyFileSystem(main);
        components.editors = new Editors(main, container.find(".blockpy-editor"));
        // Convenient shortcut directly to PythonEditor
        components.pythonEditor = this.components.editors.byName("python");
        components.server = new BlockPyServer(main);
        components.corgis = new BlockPyCorgis(main);
        components.history = new BlockPyHistory(main, container.find(".blockpy-history-toolbar"));
    }

    makeExtraSubscriptions() {
        this.model.display.changedInstructions.subscribe((changed) => {
            this.components.server.logEvent("X-Instructions.Change", "", "",
                                            changed, "instructions.md");
        });
    }

    start() {
        this.model.display.filename("answer.py");
    }

    resetInterface() {
        this.components.engine.reset();
    }

    requestPasscode() {
        let userSuppliedPasscode = prompt("Please enter the passcode.");
        this.model.display.passcode(userSuppliedPasscode);
    }

}

