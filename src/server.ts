import {LocalStorageWrapper} from "./storage";
import {loadAssignmentSettings, saveAssignmentSettings} from "./editor/assignment_settings";

/**
 *
 * @enum {string}
 */
export let StatusState = {
    READY: "ready",
    ACTIVE: "active",
    RETRYING: "retrying",
    FAILED: "failed",
    OFFLINE: "offline"
};

/**
 * Object for communicating with the external servers. This includes functionality for
 * saving and loading files, logging events, saving completions, and retrieving history.
 */
export class BlockPyServer {
    main: any;
    urls: any;
    storage: LocalStorageWrapper;
    queue: Record<string, any[]>;
    MAX_QUEUE_SIZE: Record<string, number>;
    TIMER_DELAY: number;
    FAIL_DELAY: number;
    timers: Record<string, any>;
    overlay: any;
    blockingAttempts: number;
    cachedFilenames: string[];
    altLogEntry: any;

    constructor(main: any) {
        this.main = main;

        // Save URLs locally for quicker access
        this.urls = main.model.configuration.urls;

        // Add the LocalStorage connection
        this.storage = new LocalStorageWrapper("BLOCKPY");

        // FaultResistantCache
        this.queue = {
            "logEvent": JSON.parse(this.storage.getDefault("logEvent", "[]")),
            "updateSubmission": JSON.parse(this.storage.getDefault("updateSubmission", "[]"))
        };
        this.MAX_QUEUE_SIZE = {
            "logEvent": 200,
            "updateSubmission": 50
        };

        this.TIMER_DELAY = 1000;
        this.FAIL_DELAY = 2000;

        this.timers = {};

        this.overlay = null;
        this.blockingAttempts = 0;

        this.cachedFilenames = [];
        this.createSubscriptions();
        this.checkCaches();

        this.altLogEntry = null;
    }

    /**
     * Checks whether the IP address has changed, logging an event if that occurs.
     */
    checkIP(response: any): void {
        if (response.success) {
            if (this.storage.has("IP")) {
                let oldIP = this.storage.get("IP");
                if (oldIP !== response.ip) {
                    let message = JSON.stringify({
                        "old": oldIP,
                        "new": response.ip
                    });
                    if (this.altLogEntry) {
                        this.altLogEntry("X-IP.Change", undefined, undefined, message);
                    } else {
                        this.logEvent("X-IP.Change", undefined, undefined, message);
                    }
                    this.storage.set("IP", response.ip);
                }
            } else {
                this.storage.set("IP", response.ip);
            }
        }
    }

    /**
     * Determines if there have been previous failures cached, and if so retries them.
     * TODO: update
     */
    checkCaches(): void {
        if (this.storage.has("saveAssignment")) {
            let data = JSON.parse(this.storage.get("saveAssignment") as string);
            this._postLatestRetry(data, "assignment",
                                  "saveAssignment", this.TIMER_DELAY);
        }
        this.cachedFilenames.forEach((filename) => {
            if (this.storage.has("saveFile" + filename)) {
                let data = JSON.parse(this.storage.get("saveFile" + filename) as string);
                this._postLatestRetry(data, filename, "saveFile", this.TIMER_DELAY);
            }
        });
        let server = this;
        Object.keys(this.queue).forEach(function (endpoint) {
            (function pushAnyQueued(response: any) {
                if (response.success) {
                    if (server.queue[endpoint].length) {
                        let data = JSON.parse(server.queue[endpoint].pop());
                        server._postRetry(data, endpoint, 1000, pushAnyQueued);
                    }
                }
            })({"success": true});
        });
    }

    createFileSubscription(model: any, filename: string): void {
        model.subscribe((contents: any) =>
            this.main.model.display.autoSave() ? this.saveFile(filename, contents) : false, this);
        this.cachedFilenames.push(filename);
    }

    /**
     * TODO: fix
     */
    createSubscriptions(): void {
        let model = this.main.model;
        this.createFileSubscription(model.submission.code, "answer.py");
        this.createFileSubscription(model.assignment.onRun, "!on_run.py");
        this.createFileSubscription(model.assignment.onEval, "!on_eval.py");
        this.createFileSubscription(model.assignment.onChange, "!on_change.py");
        this.createFileSubscription(model.assignment.instructions, "!instructions.md");
        this.createFileSubscription(model.assignment.startingCode, "^starting_code.py");
        this.createFileSubscription(model.ui.files.extraStudentFiles, "#extra_student_files.blockpy");
        this.createFileSubscription(model.ui.files.extraStartingFiles, "#extra_starting_files.blockpy");
        this.createFileSubscription(model.ui.files.extraInstructorFiles, "#extra_instructor_files.blockpy");
    }

    createEventLogs(): void {
        window.onblur = () => {
            this.logEvent("Session.End", undefined, undefined, undefined);
        };
        window.onfocus = () => {
            this.logEvent("Session.Start", undefined, undefined, undefined);
        };
    }

    /**
     * Some subscriptions have to happen after other things have been loaded.
     * Right now this is just after CORGIS libraries have been loaded, but maybe
     * we'll add more later and this will need to be refactored.
     * TODO: fix
     */
    finalizeSubscriptions(): void {
        //this.main.model.assignment.settings.datasets.subscribe(this.saveAssignment.bind(this));
    }

    authorizeHeader(currentSettings?: Record<string, any>): Record<string, any> {
        if (!currentSettings) {
            currentSettings = {};
        }
        const accessToken = this.main.model.configuration.accessToken();
        if (accessToken) {
            if (!currentSettings.headers) {
                currentSettings.headers = {};
            }
            currentSettings.headers["Authorization"] = "Bearer " + accessToken;
        }
        return currentSettings;
    }

    /**
     * Creates the default payload for any communication with the server API
     */
    createServerData(): Record<string, any> {
        let assignment = this.main.model.assignment;
        let user = this.main.model.user;
        let submission = this.main.model.submission;
        let display = this.main.model.display;
        const configuration = this.main.model.configuration;
        let now = new Date();
        let microseconds = now.getTime();
        let result = {
            "assignment_id": assignment.id(),
            "assignment_group_id": user.groupId(),
            "course_id": user.courseId(),
            "submission_id": submission.id(),
            "user_id": user.id(),
            "version": assignment.version(),
            "timestamp": microseconds,
            "timezone": now.getTimezoneOffset(),
            "passcode": display.passcode(),
            "part_id": configuration.partId()
        };
        return result;
    }

    /**
     * Updates the status and message for the relevant endpoint.
     * @param endpoint {string} one of the URL endpoints
     * @param status {StatusState}
     * @param message {string?}
     */
    setStatus(endpoint: string, status: string, message?: string): void {
        if (endpoint in this.main.model.status) {
            this.main.model.status[endpoint](status);
            this.main.model.status[endpoint + "Message"](message || "");
        }
    }

    /**
     * Renders an overlay on the screen that blocks operation until the system is ready.
     * The overlay gets progressively darker to indicate repeated failures.
     */
    showOverlay(attempt: number): void {
        this.blockingAttempts += 1;
        if (!document.getElementsByClassName("blockpy-overlay").length) {
            this.overlay = $('<div class="blockpy-overlay"> </div>');
            this.overlay.appendTo(document.body);
        }
        switch (attempt) {
            case 0:
                this.overlay.css("background-color", "#988");
                break;
            case 1:
                this.overlay.css("background-color", "#655");
                break;
            case 2:
                this.overlay.css("background-color", "#333");
                break;
            default:
                this.overlay.css("background-color", "black");
                break;
        }
    }

    /**
     * Undo a level of overlay; if this was the last level, removes it from the screen.
     */
    hideOverlay(): void {
        this.blockingAttempts -= 1;
        if (this.blockingAttempts <= 0) {
            this.overlay.remove();
        }
    }

    _enqueueData(cache: string, data: any): void {
        // Ensure we have not overfilled the queue
        let length = this.queue[cache].length;
        let max = this.MAX_QUEUE_SIZE[cache];
        if (length > max) {
            this.queue[cache] = this.queue[cache].slice(length - max, max);
        }
        // Only add the element if it's new
        let key = JSON.stringify(data);
        let index = this.queue[cache].indexOf(key);
        if (index === -1) {
            this.queue[cache].push(key);
            this.storage.set(cache, JSON.stringify(this.queue[cache]));
        }
    }

    _dequeueData(cache: string, data: any): void {
        let key = JSON.stringify(data);
        let index = this.queue[cache].indexOf(key);
        if (index >= 0) {
            this.queue[cache].splice(index);
            this.storage.set(cache, JSON.stringify(this.queue[cache]));
        }
    }

    _postRetry(data: any, endpoint: string, delay: number, callback?: (response: any) => void): void {
        // Trigger request
        let postRequest = () => {
            // Make a backup of the current post
            this._enqueueData(endpoint, data);
            $.ajax({url: this.urls[endpoint], type: "post", data: data, ...this.authorizeHeader()})
                .done((response: any) => {
                    this._dequeueData(endpoint, data);
                    if (response.success) {
                        this.setStatus(endpoint, StatusState.READY);
                    } else {
                        console.error(response);
                        this.setStatus(endpoint, StatusState.FAILED, response.message);
                    }
                    if (callback) {
                        callback(response);
                    }
                    if (response.success) {
                        this.checkIP(response.ip);
                    }
                })
                // If server request is the latest one, then let's try it again in a bit
                .fail((error: any, textStatus: string) => {
                    this.setStatus(endpoint, StatusState.RETRYING, textStatus.toString());
                    this._postRetry(data, endpoint, delay + this.FAIL_DELAY, callback);
                });
        };
        if (delay === null) {
            postRequest();
        } else {
            setTimeout(postRequest, delay);
        }
    }

    /**
     * Make a AJAX request that, upon failure, will check to see if this was the
     * latest attempt for this `cache` marker. If so, it will attempt again until
     * successful; otherwise, it gives up the request.
     *
     * @param {Object} data - The AJAX-ready data to be posted
     * @param {String} filename - The unique name given to the relevant timer
     * @param {String} endpoint - The unique name given to the relevant cache entry
     * @param {Integer} delay - The current number of milliseconds to wait before trying the request again.
     */
    _postLatestRetry(data: any, filename: string, endpoint: string, delay: number | null, failureFunction?: (response: any) => void, doneFunction?: (response: any) => void): void {
        let cache = endpoint + filename;
        let request = () => {
            // Make a backup of the current post
            this.storage.set(cache, JSON.stringify(data));
            let time = this.storage.getTime(cache);
            // Send the request
            $.ajax({url: this.urls[endpoint], data: data, type: "post", ...this.authorizeHeader()})
                .done((response: any) => {
                    if (response.success) {
                        this.checkIP(response);
                        // If server request is the latest one, clear it from the cache
                        let cachedTime = this.storage.getTime(cache);
                        if (time >= cachedTime) {
                            this.storage.remove(cache);
                        }
                        this.setStatus(endpoint, StatusState.READY);
                    } else {
                        // This connected but failed, don't try again but let the user know why.
                        this.setStatus(endpoint, StatusState.FAILED, response.message);
                        if (response.success === false) {
                            // If we're the latest one, clear it from the cache
                            let cachedTime = this.storage.getTime(cache);
                            if (time >= cachedTime) {
                                this.storage.remove(cache);
                            }
                            if (failureFunction) {
                                failureFunction(response);
                            }
                        }
                    }
                })
                .fail((error: any, textStatus: string) => {
                    this.setStatus(endpoint, StatusState.RETRYING, textStatus.toString());
                    // If server request is the latest one, then let's try it again in a bit
                    let cachedTime = this.storage.getTime(cache);
                    if (time >= cachedTime) {
                        this._postLatestRetry(data, filename, endpoint, delay + this.FAIL_DELAY);
                    }
                })
                .done(doneFunction);
        };
        clearTimeout(this.timers[cache]);
        if (delay === null) {
            return request();
        } else {
            this.timers[cache] = setTimeout(request, delay);
        }
    }

    _postBlocking(endpoint: string, data: any, attempts: number, success?: (response: any) => void, failure?: (e: any, textStatus: string, errorThrown: any) => void, extraSettings: Record<string, any> = {}): any {
        this.showOverlay(attempts);
        return $.ajax({
            type: "POST",
            url: this.urls[endpoint],
            data: data,
            ...this.authorizeHeader(extraSettings)
        })
            .done((response: any) => {
                this.hideOverlay();
                this.setStatus(endpoint, StatusState.READY);
                if (success) {
                    success(response);
                }
                this.checkIP(response);
            })
            .fail((e: any, textStatus: string, errorThrown: any) => {
                if (attempts <= 0) {
                    this.hideOverlay();
                    this.setStatus(endpoint, StatusState.FAILED, textStatus.toString());
                    if (failure) {
                        failure(e, textStatus, errorThrown);
                    }
                } else {
                    setTimeout(() => {
                        this.hideOverlay();
                        this.setStatus(endpoint, StatusState.RETRYING, textStatus.toString());
                        this._postBlocking(endpoint, data, attempts - 1, success, failure, extraSettings);
                    }, this.FAIL_DELAY);
                }
            });
    }

    loadAssignment(assignment_id: any): void {
        let model = this.main.model;
        if (model.ui.server.isEndpointConnected("loadAssignment")) {
            let data = this.createServerData();
            data["assignment_id"] = assignment_id;
            this._postBlocking("loadAssignment", data, 4,
                               (response: any) => {
                                   if (response.success) {
                                       this.main.loadAssignmentData_(response);
                                   } else {
                                       this.setStatus("loadAssignment", StatusState.FAILED, response.message);
                                       this.main.components.dialog.ERROR_LOADING_ASSIGNMNENT(response.message);
                                   }
                               },
                               (e: any, textStatus: string, errorThrown: any) => {
                                   this.main.components.dialog.ERROR_LOADING_ASSIGNMNENT(textStatus);
                                   console.error(e, textStatus, errorThrown);
                               });
        } else {
            this.setStatus("loadAssignment", StatusState.OFFLINE);
        }
    }

    saveAssignment(): void {
        let model = this.main.model;
        if (model.ui.server.isEndpointConnected("saveAssignment")) {
            let data = this.createServerData();
            data["hidden"] = model.assignment.hidden();
            data["reviewed"] = model.assignment.reviewed();
            data["public"] = model.assignment.public();
            data["url"] = model.assignment.url();
            data["points"] = model.assignment.points();
            data["ip_ranges"] = model.assignment.ipRanges();
            data["name"] = model.assignment.name();
            data["settings"] = saveAssignmentSettings(model);

            this._postBlocking("saveAssignment", data, 3,
                               this.startPossibleFork.bind(this),
                               (e: any, textStatus: string, errorThrown: any) => {
                                   this.main.components.dialog.ERROR_SAVING_ASSIGNMNENT(textStatus);
                                   console.error(e, textStatus, errorThrown);
                               });
        } else {
            this.setStatus("saveAssignment", StatusState.OFFLINE, "Server is not connected! (Save Assignment)");
        }
    }

    loadHistory(callback: (data: any) => void): void {
        if (this.main.model.ui.server.isEndpointConnected("loadHistory")) {
            let data = this.createServerData();
            this._postBlocking("loadHistory", data, 2, callback,
                               (e: any, textStatus: string, errorThrown: any) => {
                                   this.main.components.dialog.ERROR_LOADING_HISTORY();
                                   console.error(e, textStatus, errorThrown);
                               });
        }
    }

    listUploadedFiles(callback: (data: any) => void): void {
        if (this.main.model.ui.server.isEndpointConnected("listUploadedFiles")) {
            let data = this.createServerData();
            this._postBlocking("listUploadedFiles", data, 2, callback,
                               (e: any, textStatus: string, errorThrown: any) => {
                                   this.main.components.dialog.ERROR_LISTING_UPLOADED_FILES(textStatus);
                                   console.error(e, textStatus, errorThrown);
                               });
        }
    }

    uploadFile(placement: string, directory: string, filename: string, contents: string, callback: (data: any) => void, deleteInstead: boolean = false): any {
        let model = this.main.model;
        if (model.ui.server.isEndpointConnected("uploadFile")) {
            let data = this.createServerData();
            data["placement"] = placement;
            data["directory"] = directory;
            data["filename"] = filename;
            data["contents"] = contents;
            if (deleteInstead) {
                data["delete"] = true;
            }
            let fd = Object.entries(data).reduce((d: FormData, e: [string, any]) => (d.append(...e), d), new FormData());
            return this._postBlocking("uploadFile", fd, 3,
                                      callback,
                                      (e: any, textStatus: string, errorThrown: any) => {
                                          if (deleteInstead) {
                                              this.main.components.dialog.ERROR_DELETING_FILE(textStatus);
                                          } else {
                                              this.main.components.dialog.ERROR_UPLOADING_FILE(textStatus);
                                          }
                                          console.error(e, textStatus, errorThrown);
                                      }, {processData: false, contentType: false});
        } else {
            this.setStatus("uploadFile", StatusState.OFFLINE, "Server is not connected! (Upload File)");
        }
    }

    downloadFile(placement: string, directory: string, filename: string, callback: (data: any) => void): any {
        let model = this.main.model;
        if (model.ui.server.isEndpointConnected("downloadFile")) {
            let data = this.createServerData();
            data["placement"] = placement;
            data["directory"] = directory;
            data["filename"] = filename;
            let fd = Object.entries(data).reduce((d: FormData, e: [string, any]) => (d.append(...e), d), new FormData());
            return this._postBlocking("downloadFile", fd, 3,
                                      callback,
                                      (e: any, textStatus: string, errorThrown: any) => {
                                          this.main.components.dialog.ERROR_DOWNLOADING_FILE(textStatus);
                                          console.error(e, textStatus, errorThrown);
                                      }, {processData: false, contentType: false, dataType: "text"});
        } else {
            this.setStatus("uploadFile", StatusState.OFFLINE, "Server is not connected! (Upload File)");
        }
    }

    renameFile(placement: string, directory: string, old_filename: string, new_filename: string, callback: (data: any) => void): any {
        let model = this.main.model;
        if (model.ui.server.isEndpointConnected("renameFile")) {
            let data = this.createServerData();
            data["placement"] = placement;
            data["directory"] = directory;
            data["old_filename"] = old_filename;
            data["new_filename"] = new_filename;
            let fd = Object.entries(data).reduce((d: FormData, e: [string, any]) => (d.append(...e), d), new FormData());
            return this._postBlocking("renameFile", fd, 3,
                                      callback,
                                      (e: any, textStatus: string, errorThrown: any) => {
                                          this.main.components.dialog.ERROR_UPLOADING_FILE(textStatus);
                                          console.error(e, textStatus, errorThrown);
                                      }, {processData: false, contentType: false});
        } else {
            this.setStatus("renameFile", StatusState.OFFLINE, "Server is not connected! (Rename File)");
        }
    }

    logEvent(event_type: string, category: any, label: any, message: any, file_path?: string): void {
        if (this.main.model.display.readOnly()) {
            this.setStatus("logEvent", StatusState.OFFLINE);
            return;
        }
        if (this.main.model.ui.server.isEndpointConnected("logEvent")) {
            let data = this.createServerData();
            data["event_type"] = event_type;
            data["category"] = category;
            data["label"] = label;
            data["message"] = message;
            data["file_path"] = file_path;
            this.setStatus("logEvent", StatusState.ACTIVE);
            // Trigger request
            this._postRetry(data, "logEvent", 0, () => {
            });
        } else {
            this.setStatus("logEvent", StatusState.OFFLINE);
        }
    }

    saveImage(directory: string, image: string): void {
        if (this.main.model.display.readOnly()) {
            this.setStatus("saveImage", StatusState.OFFLINE);
            return;
        }
        if (this.main.model.ui.server.isEndpointConnected("saveImage")) {
            let data = this.createServerData();
            data["directory"] = directory;
            data["image"] = image;
            this.setStatus("saveImage", StatusState.ACTIVE);
            // Trigger request
            this._postLatestRetry(data, "turtle_output", "saveImage", 0);
        } else {
            this.setStatus("saveImage", StatusState.OFFLINE);
        }
    }

    updateSubmissionStatus(newStatus: any): void {
        if (this.main.model.display.readOnly()) {
            this.setStatus("updateSubmissionStatus", StatusState.OFFLINE);
            return;
        }
        if (this.main.model.ui.server.isEndpointConnected("updateSubmissionStatus")) {
            let data = this.createServerData();
            data["status"] = newStatus;
            let postStatusChange = (data: any) => {
                if (data.success) {
                    this.main.model.submission.submissionStatus(newStatus);
                }
            };
            this._postBlocking("updateSubmissionStatus", data, 2, postStatusChange,
                               (e: any, textStatus: string, errorThrown: any) => {
                                   this.main.components.dialog.ERROR_UPDATING_SUBMISSION_STATUS();
                                   console.error(e, textStatus, errorThrown);
                               });
        }
    }

    /**
     * This function can be used to load files and web resources.
     *
     * DEPRECATED
     */
    loadFile(filename: string, type: string, callback: (data: any) => void, errorCallback: (message: string) => void): void {
        let model = this.main.model;
        let server = this;
        if (model.ui.server.isEndpointConnected("load_file")) {
            let data = this.createServerData();
            data["filename"] = filename;
            data["type"] = type;
            this._postBlocking(this.urls.load_file, data, 5,
                               function (response: any) {
                                   if (response.success) {
                                       callback(response.data);
                                   } else {
                                       errorCallback(response.message);
                                       server.setStatus("loadFile", StatusState.FAILED, response.message);
                                   }
                               },
                               function (e: any, textStatus: string, errorThrown: any) {
                                   errorCallback("Server failure! Report to instructor");
                                   console.error(errorThrown);
                               });
        } else {
            errorCallback("No file server available.");
            this.setStatus("loadFile", StatusState.OFFLINE, "Server is not connected! (Load File)");
        }
    }

    saveFile(filename: string, contents: string, delay?: number): any {
        if (delay === undefined) {
            delay = this.TIMER_DELAY;
        }
        let model = this.main.model;
        if (model.display.readOnly()) {
            this.setStatus("saveFile", StatusState.OFFLINE);
            return;
        }
        if (model.ui.server.isEndpointConnected("saveFile")) {
            let data = this.createServerData();
            data["filename"] = filename;
            data["code"] = contents;
            this.setStatus("saveFile", StatusState.ACTIVE);
            return this._postLatestRetry(data, filename, "saveFile", delay, this.startPossibleFork.bind(this));
        } else {
            return this.setStatus("saveFile", StatusState.OFFLINE);
        }
    }

    startPossibleFork(response: any): void {
        if (!response.success && response.forkable) {
            this.main.components.dialog.OFFER_FORK();
        }
    }

    updateSubmission(score: any, correct: any, hiddenOverride: any, forceUpdate: any): void {
        if (this.main.model.display.readOnly()) {
            this.setStatus("updateSubmission", StatusState.OFFLINE);
            return;
        }
        let callback = this.main.model.configuration.callbacks.success;
        if (this.main.model.ui.server.isEndpointConnected("updateSubmission")) {
            let data = this.createServerData();
            data["score"] = score;
            data["correct"] = correct;
            data["hidden_override"] = hiddenOverride;
            data["force_update"] = forceUpdate;
            this.main.components.pythonEditor.bm.blockEditor.getPngFromBlocks((pngData: string, img: any) => {
                data["image"] = pngData;
                if (img.remove) {
                    img.remove();
                }
                this._postRetry(data, "updateSubmission", 0,
                                (response: any) => {
                                    if (response.success) {
                                        this.setStatus("updateSubmission", StatusState.READY);
                                    } else {
                                        this.setStatus("updateSubmission", StatusState.FAILED, response.message);
                                    }
                                    if (!hiddenOverride && correct && callback) {
                                        callback(data["assignment_id"]);
                                    }
                                });
            });
        }
    }

    openaiProxy(openai_data: any): any {
        let model = this.main.model;
        let server = this;
        let data = this.createServerData();
        data["openai_data"] = openai_data;
        return this._postBlocking(this.urls.openai_proxy, data);
    }
}
