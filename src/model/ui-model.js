/**
 * @fileoverview UI model methods for BlockPy application.
 * Contains all the UI-related computed observables and methods.
 */

import $ from "jquery";
import {StatusState} from "../server.js";
import {SecondRowSecondPanelOptions, makeExtraInterfaceSubscriptions} from "../interface.js";
import {AST_DESCRIPTIONS} from "../trace";
import {SampleSubmission} from "../editor/sample_submissions";
import {makeModelFile, observeConcatenatedFile, UNDELETABLE_FILES, UNRENAMABLE_FILES} from "../files";
import {uploadFile, downloadFile} from "../editor/abstract_editor";
import {capitalize} from "../utilities";

/**
 * Create and initialize all UI model methods and computed observables.
 * This includes methods for handling menus, files, editors, execution, feedback, etc.
 * 
 * @param {Object} self - Reference to the main BlockPy instance
 * @param {Object} model - The BlockPy model object
 */
export function initializeUIModelMethods(self, model) {
    model.ui = {
        smallLayout: ko.pureComputed(()=>
            !model.display.instructor() && model.assignment.settings.smallLayout()),
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
            visible: ko.pureComputed(
                () =>
                    model.display.instructor() || !model.assignment.settings.onlyInteractive()
            ),
            textFullscreen: ko.pureComputed(() =>
                (model.display.fullscreen()) ? "fa-compress-arrows-alt" : "fa-expand-arrows-alt"
            ),
            clickFullscreen: () =>{
                model.display.fullscreen(!model.display.fullscreen());
            },
            editInputs: () => {
                self.components.dialog.EDIT_INPUTS();
            },
            toggleImages: () => {
                if (model.display.renderImages()) {
                    self.components.pythonEditor.bm.textEditor.disableImages();
                } else {
                    self.components.pythonEditor.bm.textEditor.enableImages();
                }
                model.display.renderImages(!model.display.renderImages());
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
            ),
            showClock: ko.pureComputed(() =>
                !model.assignment.settings.hasClock()
            ),
            canShare: ko.pureComputed(() =>
                model.configuration.urls["shareUrl"] !== undefined
            ),
            getShareUrl: (wasPrompted) => {
                const parts = ["group", model.user.courseId(), model.user.groupId(), model.assignment.id(), model.user.id()];
                /*const interestingDetails = {
                    "when": new Date().toISOString(),
                    // "feedback": model.execution.feedback.category() + "|" + model.execution.feedback.label(),
                    // "wasPrompted": wasPrompted
                };
                parts.push(btoa(JSON.stringify(interestingDetails)));
                console.log(interestingDetails);*/
                parts.push(new Date().toISOString());

                // Base64 encode the parts
                const encoded = btoa(parts.join("_"));
                // Construct the target URL using model.configuration.urls["shareUrl"]
                const baseUrl = model.configuration.urls["shareUrl"];
                return baseUrl + (baseUrl.endsWith("/") ? "" : "/") + encoded;
            },
            startShare: (wasPrompted) => {
                self.components.dialog.START_SHARE(
                    model.ui.menu.getShareUrl(wasPrompted),
                    wasPrompted
                );
            },
        },
        secondRow: {
            width: ko.pureComputed(()=>
                model.display.instructor() || !model.assignment.settings.smallLayout() ?
                    "col-md-12" : "col-md-5"
            ),
            hideTraceButton: ko.pureComputed(()=>
                !model.display.instructor() && model.assignment.settings.hideTraceButton()
            ),
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
            makeWide: function () {
                const currentPanel = model.display.secondRowSecondPanel;
                model.display.previousSecondRowSecondPanel(currentPanel());
                currentPanel(SecondRowSecondPanelOptions.NONE);
            },
            restorePanel: function() {
                const oldPanel = model.display.previousSecondRowSecondPanel;
                if (oldPanel() !== null) {
                    model.display.secondRowSecondPanel(oldPanel());
                    oldPanel(null);
                }
            }
        },
        console: {
            size: ko.pureComputed(() =>
                (!model.display.instructor() && model.assignment.settings.smallLayout()) ||
                (model.display.secondRowSecondPanel() === SecondRowSecondPanelOptions.NONE) ?
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
            }),
            resetScore: () => {
                model.submission.score(0);
                model.submission.correct(false);
                self.components.server.updateSubmission(model.submission.score(), model.submission.correct(), true, true);
            },
            provideRatings: ko.pureComputed(() =>
                !model.assignment.hidden()
            ),
            flipRating: () => {
                const newState = !model.display.showRating();
                model.display.showRating(newState);
                self.localSettings_.set("display.showRating", newState.toString());
            },
            rate: (rating, suggestShare=false) => {
                self.components.server.logEvent("X-Rating",
                                                model.execution.feedback.category(),
                                                model.execution.feedback.label(),
                                                rating);
                model.configuration.container.find(".blockpy-rating").fadeOut(500, function() {
                    $(this).fadeIn(500);
                    model.display.hasRated(true);
                });
                const thankYou = model.configuration.container.find(".blockpy-feedback-thank-you");
                thankYou.addClass("show");
                setTimeout(() => {
                    thankYou.removeClass("show");
                    if (model.display.hasRated()) {
                        model.ui.menu.startShare(true);
                    }
                }, 1000);
            },
            hasRatedClass: ko.pureComputed(() =>
                model.display.hasRated() ? "far" : "fas"
            ),
            addPositiveFeedback: (text, icon, color, onclick, toEnd, instructorOnly) => {
                if (!instructorOnly || model.display.instructor()) {
                    self.components.feedback.addPositiveFeedback(text, icon, color, onclick, toEnd);
                }
            }
        },
        trace: {
            has: ko.pureComputed(() =>
                model.execution.student.currentTraceData() !== null
            ),
            highlightedLine: ko.pureComputed(() => {
                if (model.display.secondRowSecondPanel() !== SecondRowSecondPanelOptions.TRACE) {
                    return [];
                }
                let step = model.execution.student.currentTraceStep();
                let lastStep = model.execution.student.lastStep();
                let traceData = model.execution.student.currentTraceData();
                if (!traceData || step === null) {
                    return [];
                } else if (step === 0) {
                    return [];
                } else {
                    return [traceData[step-1].line];
                }
            }),
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
                    return "Line "+(traceData[step-1].line);
                }
            }),
            ast: ko.pureComputed(function () {
                let step = model.execution.student.currentTraceStep();
                let lastStep = model.execution.student.lastStep();
                let traceData = model.execution.student.currentTraceData();
                if (!traceData) {
                    return "Nothing traced.";
                }
                switch (step) {
                    case 0:
                        return "Starting execution";
                    case lastStep:
                        if (!model.execution.reports.student.success) {
                            return "Execution halted (error)";
                        }
                        return "Finished execution";
                    default:
                        return "Current step: " + AST_DESCRIPTIONS[traceData[step-1].ast];
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
                model.display.instructor() || !model.assignment.settings.hideFiles() || model.assignment.settings.preloadAllFiles()
            ),
            addIsVisible: ko.pureComputed(() =>
                model.display.instructor() || !model.assignment.settings.hideFiles()
            ),
            width: ko.pureComputed(()=>
                model.display.instructor() || !model.assignment.settings.smallLayout() ?
                    "col-md-12" : "col-md-6"
            ),
            hasContents: function(path) {
                switch (path) {
                    case "answer.py": return model.submission.code();
                    case "!instructions.md": return model.assignment.instructions();
                    case "!on_change.py": return model.assignment.onChange() !== null;
                    case "!on_eval.py": return model.assignment.onEval() !== null;
                    case "?mock_urls.blockpy": return model.assignment.extraInstructorFiles().some(file =>
                        file.filename() === "?mock_urls.blockpy");
                    case "images.blockpy": return model.assignment.extraInstructorFiles().some(file =>
                        file.filename() === "images.blockpy");
                    case "!answer_prefix.py": return model.assignment.extraInstructorFiles().some(file =>
                        file.filename() === "!answer_prefix.py");
                    case "!answer_suffix.py": return model.assignment.extraInstructorFiles().some(file =>
                        file.filename() === "!answer_suffix.py");
                    case "?toolbox.blockpy": return model.assignment.extraInstructorFiles().some(file =>
                        file.filename() === "?toolbox.blockpy");
                    case "!tags.blockpy": return model.assignment.tags().length;
                    case "!sample_submissions.blockpy": return model.assignment.sampleSubmissions().length;
                    default: return false;
                }
            },
            add: function(path) {
                switch (path) {
                    case "?mock_urls.blockpy":
                    case "!answer_prefix.py":
                    case "!answer_suffix.py":
                    case "?tags.blockpy":
                    case "?settings.blockpy":
                        self.components.fileSystem.newFile(path);
                        break;
                    case "images.blockpy":
                        self.components.fileSystem.newFile(path, "{}");
                        break;
                    case "?toolbox.blockpy":
                        let normalToolbox = self.components.pythonEditor.bm.blockEditor.TOOLBOXES["normal"];
                        normalToolbox = JSON.stringify(normalToolbox, null, 2);
                        self.components.fileSystem.newFile(path, normalToolbox);
                        break;
                    case "!sample_submissions.blockpy":
                        model.assignment.sampleSubmissions([SampleSubmission.Blank()]);
                        self.components.fileSystem.newFile(path);
                        break;
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
            rename: (newName) => {
                return self.components.fileSystem.renameFile(model.display.filename(), newName);
            },
            getStudentCode: function() {
                let prefixPy = self.components.fileSystem.getFile("!answer_prefix.py");
                let suffixPy = self.components.fileSystem.getFile("!answer_suffix.py");
                let code = self.model.submission.code();
                if (prefixPy && prefixPy.handle && prefixPy.handle()) {
                    code = prefixPy.handle() + code;
                }
                if (suffixPy && suffixPy.handle && suffixPy.handle()) {
                    code = code + suffixPy.handle();
                }
                return code;
            },
            extraStudentFiles: observeConcatenatedFile(model.submission.extraFiles),
            extraInstructorFiles: observeConcatenatedFile(model.assignment.extraInstructorFiles),
            extraStartingFiles: observeConcatenatedFile(model.assignment.extraStartingFiles),
            displayFilename: function(path) {
                if (path === "?mock_urls.blockpy") {
                    return "URL Data";
                }
                if (path === "images.blockpy") {
                    return "Images";
                }
                if (path === "!answer_prefix.py") {
                    return "Answer Prefix";
                }
                if (path === "!answer_suffix.py") {
                    return "Answer Suffix";
                }
                if (path === "?toolbox.blockpy") {
                    return "Toolbox";
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
            width: ko.pureComputed(()=>
                model.display.instructor() || !model.assignment.settings.smallLayout() ?
                    "col-md-12" : "col-md-7"
            ),
            view: ko.pureComputed(() =>
                (!model.display.instructor() && (
                    model.assignment.settings.hideEditors() ||
                    model.assignment.settings.onlyInteractive())) ? "None" :
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
            images: {
                uploadFile: () => self.components.editors.byName("image").uploadFile(),
                deleteFile: (fileInfo) => self.components.editors.byName("image").deleteFile(fileInfo),
                renameFile: (fileInfo) => self.components.editors.byName("image").renameFile(fileInfo),
                reloadImages: () => self.components.editors.byName("image").reloadImages(),
                canChoosePlacement: ko.pureComputed(() => model.display.instructor()),
                canModify: (placement) => model.display.instructor() || placement === "submission" || placement === "user",
            },
            settings: {
                save: () => self.components.server.saveAssignment()
            },
            sampleSubmissions: {
                buildEditor: (newDOM, index, newElement) => {
                    let editor = self.components.editors.byName("Sample Submissions");
                    editor.buildEditor(newDOM, index, newElement);
                }
            },
        },
        execute: {
            isRunning: ko.pureComputed(() =>
                model.status.onExecution() === StatusState.ACTIVE
            ),
            runLabel: ko.pureComputed(() =>
                model.status.onExecution() === StatusState.ACTIVE ? "Stop" : "Run"
            ),
            run: () => {
                if (model.status.onExecution() === StatusState.ACTIVE) {
                    if (typeof PygameLib !== "undefined" && PygameLib.running) {
                        PygameLib.StopPygame();
                    }
                    model.status.onExecution(StatusState.READY);
                } else {
                    self.components.engine.delayedRun();
                }
            },
            runQuietlyLabel: ko.pureComputed(()=>
                model.status.onExecution() === StatusState.ACTIVE ? "Stop" : "Run without feedback"
            ),
            runQuietly: () => {
                if (model.status.onExecution() === StatusState.ACTIVE) {
                    if (typeof PygameLib !== "undefined" && PygameLib.running) {
                        PygameLib.StopPygame();
                    }
                    model.status.onExecution(StatusState.READY);
                } else {
                    self.components.engine.delayedRun(true);
                }
            },
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
                    model.status.externalAPI() ||
                    model.status.updateSubmissionStatusMessage() || "")
            ),
            force: {
                loadAssignment: (data, event) => {
                    //let fileHandler = $(".blockpy-force-load-assignment-file");
                    let assignmentForceLoadButton = $(event.target);
                    //fileHandler.click();
                    $(event.target).parent().fadeOut(100).fadeIn(100);
                    // Allow user to upload a file containing an assignment submission
                    var fr = new FileReader();
                    var files = assignmentForceLoadButton[0].files;
                    fr.onload = function(e) {
                        let assignmentSubmission = JSON.parse(e.target.result);
                        self.loadAssignmentData_(assignmentSubmission);
                    };
                    fr.fileName = files[0].name;
                    fr.readAsText(files[0]);
                    assignmentForceLoadButton.val("");
                },
                updateSubmission: (data, event) => {
                    console.log(event);
                    self.components.server.updateSubmission(self.model.submission.score(),
                                                            self.model.submission.correct(),
                                                            false, true);
                    $(event.target).fadeOut(100).fadeIn(100);
                }
            }
        },
        footer: {
            visible: ko.pureComputed(
                () =>
                    model.display.instructor() || !model.ui.smallLayout()
            ),
        }
    };
    makeExtraInterfaceSubscriptions(self, model);
}