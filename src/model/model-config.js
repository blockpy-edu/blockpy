/**
 * @fileoverview Model configuration for BlockPy application.
 * Contains the initial model setup and configuration logic.
 */

import {LocalStorageWrapper} from "../storage.js";
import {DisplayModes} from "../editor/python.js";
import {StatusState} from "../server.js";
import {SecondRowSecondPanelOptions} from "../interface.js";
import {AssigmentType, makeAssignmentSettingsModel} from "../editor/assignment_settings";
import {loadConcatenatedFile} from "../files";
import {extractPart} from "../utilities";

const EDITOR_VERSION = "5.1.2";

/**
 * Creates and initializes the BlockPy model with all configuration sections.
 * 
 * Categories:
 *   * user: values for the current user (stored to server)
 *   * assignment: values for the current assignment (stored to server)
 *   * submission: values for the current submission (stored to server)
 *   * display: flags related to current visibility (stored to localSettings)
 *   * status: messages related to current status (not stored)
 *   * execution: values related to last run (not stored)
 *   * configuration: constant values related to setup (not stored)
 * 
 * @param {Object} configuration - Initial configuration object
 * @param {LocalStorageWrapper} localSettings - Local storage wrapper
 * @param {Function} getSetting - Function to get setting values
 * @returns {Object} The initialized model object
 */
export function createModelConfiguration(configuration, localSettings, getSetting) {
    return {
        user: {
            id: ko.observable(configuration["user.id"]),
            name: ko.observable(configuration["user.name"]),
            /**
             * Whether you are an Owner (can modify the assignment), Grader (can view
             * the assignments' information) or Student (can not see any instructor stuff).
             * @type {bool}
             */
            role: ko.observable(getSetting("user.role", "owner")),
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
            type: ko.observable(AssigmentType.BLOCKPY),
            points: ko.observable(null),
            startingCode: ko.observable(configuration["assignment.starting_code"] || ""),
            onRun: ko.observable(configuration["assignment.on_run"] || ""),
            onChange: ko.observable(configuration["assignment.on_change"] || null),
            onEval: ko.observable(configuration["assignment.on_eval"] || null),
            extraInstructorFiles: ko.observableArray(loadConcatenatedFile(configuration["assignment.extra_instructor_files"]) || []),
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
            code: ko.observable(extractPart(configuration["submission.code"] || "", configuration["partId"]) || ""),
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
            instructor: ko.observable(""+getSetting("display.instructor", "false")==="true"),
            /**
             * Whether or not to prevent the printer from showing things
             */
            mutePrinter: ko.observable(false),
            /**
             * (Python Views) The current editor mode.
             * @type {DisplayModes}
             */
            pythonMode: ko.observable(getSetting("display.python.mode", DisplayModes.TEXT)),
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
            previousSecondRowSecondPanel: ko.observable(null),
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
            clearInputs: ko.observable(true),
            /**
             * Whether or not images should be rendered (true), or just stay as text code (false).
             */
            renderImages: ko.observable(true),
            editorVersion: EDITOR_VERSION,
            readOnly: ko.observable(getSetting("display.read_only", "false").toString()==="true"),
            /**
             * Uploaded files are ones that have been listed by the remote
             */
            uploadedFiles: ko.observable(null),
            /**
             * Backup copy of the latest known full code for the Submission. This is relevant if there was a
             * PartID specified, in which case the submission.code in the model is only showing what we know
             * locally.
             */
            backupSubmissionCode: ko.observable(configuration["submission.code"] || ""),
            /**
             * Controls the rating system
             */
            showRating: ko.observable(getSetting("display.showRating", "true").toString()==="true"),
            /**
             * Whether the student has rated this current feedback
             */
            hasRated: ko.observable(false),
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
            listUploadedFiles: ko.observable(StatusState.READY),
            listUploadedFilesMessage: ko.observable(""),
            // @type {ServerStatus}
            downloadFile: ko.observable(StatusState.READY),
            downloadFileMessage: ko.observable(""),
            // @type {ServerStatus}
            uploadFile: ko.observable(StatusState.READY),
            uploadFileMessage: ko.observable(""),
            // @type {ServerStatus}
            renameFile: ko.observable(StatusState.READY),
            renameFileMessage: ko.observable(""),
            // @type {ServerStatus}
            externalAPI: ko.observable(StatusState.READY),
            externalAPIMessage: ko.observable(""),
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
                globals: ko.observable(null),
                calls: {}
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
                "success": configuration["callback.success"],
            },
            /**
             * Whether or not the server is connected.
             * @type {bool}
             */
            serverConnected: ko.observable(getSetting("server.connected", true)),
            // string
            blocklyPath: configuration["blockly.path"],
            // string
            attachmentPoint: configuration["attachment.point"],
            // JQuery object
            container: null,
            // Maps codes ('log_event', 'save_code') to URLs
            urls: configuration["urls"] || {},
            /**
             * Unique Part ID that can distinguish this editor instance's region of the assignment.
             * It's possible that other editors may be attached to a different Part of the same assignmnet, on the
             * same page.
             * **/
            partId: ko.observable(configuration["partId"] || ""),
            accessToken: ko.observable(configuration["access_token"] || undefined),
        }
    };
}

/**
 * Initialize model with configuration and local storage
 * @param {Object} configuration - The configuration object
 * @returns {Object} The initialized model and related functions
 */
export function initializeModel(configuration) {
    // Connect to local storage
    const localSettings = new LocalStorageWrapper("localSettings");
    
    // Helper function to get setting value
    const getSetting = (key, defaultValue) => {
        if (key in configuration) {
            return configuration[key];
        } else if (localSettings.has(key)) {
            return localSettings.get(key);
        } else {
            return defaultValue;
        }
    };
    
    const model = createModelConfiguration(configuration, localSettings, getSetting);
    
    return {
        model,
        localSettings,
        getSetting,
        initialConfiguration: configuration
    };
}