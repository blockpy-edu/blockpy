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
 *
 * @constructor
 * @this {BlockPyServer}
 * @param {Object} main - The main BlockPy instance
 */
export function BlockPyServer(main) {
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
}

/**
 * Checks whether the IP address has changed, logging an event if that occurs.
 * @param response
 */
BlockPyServer.prototype.checkIP = function (response) {
    if (response.success) {
        if (this.storage.has("IP")) {
            let oldIP = this.storage.get("IP");
            if (oldIP !== response.ip) {
                let message = JSON.stringify({
                    "old": oldIP,
                    "new": response.ip
                });
                this.logEvent("X-IP.Change", undefined, undefined, message);
                this.storage.set("IP", response.ip);
            }
        } else {
            this.storage.set("IP", response.ip);
        }
    }
};

/**
 * Determines if there have been previous failures cached, and if so retries them.
 * TODO: update
 */
BlockPyServer.prototype.checkCaches = function () {
    if (this.storage.has("saveAssignment")) {
        let data = JSON.parse(this.storage.get("saveAssignment"));
        this._postLatestRetry(data, "assignment",
                              "saveAssignment", this.TIMER_DELAY);
    }
    this.cachedFilenames.forEach((filename) => {
        if (this.storage.has("saveFile" + filename)) {
            let data = JSON.parse(this.storage.get("saveFile" + filename));
            this._postLatestRetry(data, filename, "saveFile", this.TIMER_DELAY);
        }
    });
    var server = this;
    Object.keys(this.queue).forEach(function (endpoint) {
        (function pushAnyQueued(response) {
            if (response.success) {
                if (server.queue[endpoint].length) {
                    var data = JSON.parse(server.queue[endpoint].pop());
                    var url = server.urls[endpoint];
                    server._postRetry(data, endpoint, 1000, pushAnyQueued);
                }
            }
        })({"success": true});
    });
};

BlockPyServer.prototype.createFileSubscription = function (model, filename) {
    model.subscribe((contents) =>
        this.main.model.display.autoSave() ? this.saveFile(filename, contents) : false, this);
    this.cachedFilenames.push(filename);
};

/**
 * TODO: fix
 */
BlockPyServer.prototype.createSubscriptions = function () {
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
};

BlockPyServer.prototype.createEventLogs = function() {
    window.onblur = () => {
        this.logEvent("Session.End", undefined, undefined, undefined);
    };
    window.onfocus = () => {
        this.logEvent("Session.Start", undefined, undefined, undefined);
    };

    // TODO: Add in beacon?
};

/**
 *
 * Some subscriptions have to happen after other things have been loaded.
 * Right now this is just after CORGIS libraries have been loaded, but maybe
 * we'll add more later and this will need to be refactored.
 *
 * TODO: fix
 *
 */
BlockPyServer.prototype.finalizeSubscriptions = function () {
    //this.main.model.assignment.settings.datasets.subscribe(this.saveAssignment.bind(this));
};

/**
 * Creates the default payload for any communication with the server API
 * @returns {{assignment_id: *, course_id: *, group_id: *, user_id: *, timezone: *, version: *, timestamp: *}}
 */
BlockPyServer.prototype.createServerData = function () {
    let assignment = this.main.model.assignment;
    let user = this.main.model.user;
    let submission = this.main.model.submission;
    let display = this.main.model.display;
    let now = new Date();
    let microseconds = now.getTime();
    return {
        "assignment_id": assignment.id(),
        "assignment_group_id": user.groupId(),
        "course_id": user.courseId(),
        "submission_id": submission.id(),
        "user_id": user.id(),
        "version": assignment.version(),
        "timestamp": microseconds,
        "timezone": now.getTimezoneOffset(),
        "passcode": display.passcode()
    };
};

/**
 * Updates the status and message for the relevant endpoint.
 * @param endpoint {string} one of the URL endpoints
 * @param status {StatusState}
 * @param message {string?}
 */
BlockPyServer.prototype.setStatus = function (endpoint, status, message) {
    this.main.model.status[endpoint](status);
    this.main.model.status[endpoint + "Message"](message || "");
};

/**
 * Renders an overlay on the screen that blocks operation until the system is ready.
 * The overlay gets progressively darker to indicate repeated failures.
 */
BlockPyServer.prototype.showOverlay = function (attempt) {
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
};

/**
 * Undo a level of overlay; if this was the last level, removes it from the screen.
 */
BlockPyServer.prototype.hideOverlay = function () {
    this.blockingAttempts -= 1;
    if (this.blockingAttempts <= 0) {
        this.overlay.remove();
    }
};

BlockPyServer.prototype._enqueueData = function (cache, data) {
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
};

BlockPyServer.prototype._dequeueData = function (cache, data) {
    let key = JSON.stringify(data);
    let index = this.queue[cache].indexOf(key);
    if (index >= 0) {
        this.queue[cache].splice(index);
        this.storage.set(cache, JSON.stringify(this.queue[cache]));
    }
};


BlockPyServer.prototype._postRetry = function (data, endpoint, delay, callback) {
    // Trigger request
    let postRequest = () => {
        // Make a backup of the current post
        this._enqueueData(endpoint, data);
        $.post(this.urls[endpoint], data)
            .done((response) => {
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
            .fail((error, textStatus) => {
                this.setStatus(endpoint, StatusState.RETRYING, textStatus.toString());
                this._postRetry(data, endpoint, delay + this.FAIL_DELAY, callback);
            });
    };
    if (delay === null) {
        postRequest();
    } else {
        setTimeout(postRequest, delay);
    }
};

/**
 * Make a AJAX request that, upon failure, will check to see if this was the
 * latest attempt for this `cache` marker. If so, it will attempt again until
 * successful; otherwise, it gives up the request.
 *
 * @param {Object} data - The AJAX-ready data to be posted
 * @param {String} filename - The unique name given to the relevant timer
 * @param {String} endpoint - The unique name given to the relevant cache entry
 * @param {Integer} delay - The current number of milliseconds to wait before
 trying the request again.
 */
BlockPyServer.prototype._postLatestRetry = function (data, filename, endpoint, delay) {
    let cache = endpoint + filename;
    let request = () => {
        // Make a backup of the current post
        this.storage.set(cache, JSON.stringify(data));
        let time = this.storage.getTime(cache);
        // Send the request
        $.post(this.urls[endpoint], data)
            .done((response) => {
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
                    }
                }
            })
            .fail((error, textStatus) => {
                this.setStatus(endpoint, StatusState.RETRYING, textStatus.toString());
                // If server request is the latest one, then let's try it again in a bit
                let cachedTime = this.storage.getTime(cache);
                if (time >= cachedTime) {
                    this._postLatestRetry(data, filename, endpoint, delay + this.FAIL_DELAY);
                }
            });
    };
    clearTimeout(this.timers[cache]);
    if (delay === null) {
        request();
    } else {
        this.timers[cache] = setTimeout(request, delay);
    }
};

BlockPyServer.prototype._postBlocking = function (endpoint, data, attempts, success, failure) {
    this.showOverlay(attempts);
    $.post(this.urls[endpoint], data)
        .done((response) => {
            this.hideOverlay();
            this.setStatus(endpoint, StatusState.READY);
            success(response);
            this.checkIP(response);
        })
        .fail((e, textStatus, errorThrown) => {
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
                    this._postBlocking(endpoint, data, attempts - 1, success, failure);
                }, this.FAIL_DELAY);
            }
        });
};


BlockPyServer.prototype.loadAssignment = function (assignment_id) {
    let model = this.main.model;
    if (model.ui.server.isEndpointConnected("loadAssignment")) {
        let data = this.createServerData();
        data["assignment_id"] = assignment_id;
        this._postBlocking("loadAssignment", data, 4,
                           (response) => {
                               if (response.success) {
                                   this.main.loadAssignmentData_(response);
                               } else {
                                   this.setStatus("loadAssignment", StatusState.FAILED, response.message);
                                   this.main.components.dialog.ERROR_LOADING_ASSIGNMNENT(response.message);
                               }
                           },
                           (e, textStatus, errorThrown) => {
                               this.main.components.dialog.ERROR_LOADING_ASSIGNMNENT(textStatus);
                               console.error(e, textStatus, errorThrown);
                           });
    } else {
        this.setStatus("loadAssignment", StatusState.OFFLINE);
    }
};

BlockPyServer.prototype.saveAssignment = function () {
    let model = this.main.model;
    if (model.ui.server.isEndpointConnected("saveAssignment")) {
        let data = this.createServerData();
        data["hidden"] = model.assignment.hidden();
        data["reviewed"] = model.assignment.reviewed();
        data["public"] = model.assignment.public();
        data["url"] = model.assignment.url();
        data["ip_ranges"] = model.assignment.ipRanges();
        data["name"] = model.assignment.name();
        data["settings"] = saveAssignmentSettings(model);

        this._postBlocking("saveAssignment", data, 3, () => 0,
                           (e, textStatus, errorThrown) => {
                               this.main.components.dialog.ERROR_SAVING_ASSIGNMNENT();
                               console.error(e, textStatus, errorThrown);
                           });
    } else {
        this.setStatus("saveAssignment", StatusState.OFFLINE, "Server is not connected! (Save Assignment)");
    }
};

BlockPyServer.prototype.loadHistory = function (callback) {
    if (this.main.model.ui.server.isEndpointConnected("loadHistory")) {
        let model = this.main.model;
        let data = this.createServerData();
        this._postBlocking("loadHistory", data, 2, callback,
                           (e, textStatus, errorThrown) => {
                               this.main.components.dialog.ERROR_LOADING_HISTORY();
                               console.error(e, textStatus, errorThrown);
                           });
    }
};

BlockPyServer.prototype.logEvent = function (event_type, category, label, message, file_path) {
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
};

BlockPyServer.prototype.saveImage = function (directory, image) {
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
};

BlockPyServer.prototype.updateSubmissionStatus = function(newStatus) {
    if (this.main.model.ui.server.isEndpointConnected("updateSubmissionStatus")) {
        let data = this.createServerData();
        data["status"] = newStatus;
        let postStatusChange = (data) => {
            if (data.success) {
                this.main.model.submission.submissionStatus(newStatus);
            }
        };
        this._postBlocking("updateSubmissionStatus", data, 2, postStatusChange,
                           (e, textStatus, errorThrown) => {
                               this.main.components.dialog.ERROR_UPDATING_SUBMISSION_STATUS();
                               console.error(e, textStatus, errorThrown);
                           });
    }
};

/**
 * This function can be used to load files and web resources.
 *
 * DEPRECATED
 */
BlockPyServer.prototype.loadFile = function (filename, type, callback, errorCallback) {
    var model = this.main.model;
    var server = this;
    if (model.ui.server.isEndpointConnected("load_file")) {
        var data = this.createServerData();
        data["filename"] = filename;
        data["type"] = type;
        this._postBlocking(this.urls.load_file, data, 5,
                           function (response) {
                               if (response.success) {
                                   callback(response.data);
                               } else {
                                   errorCallback(response.message);
                                   server.setStatus("loadFile", StatusState.FAILED, response.message);
                               }
                           },
                           function (e, textStatus, errorThrown) {
                               errorCallback("Server failure! Report to instructor");
                               console.error(errorThrown);
                           });
    } else {
        errorCallback("No file server available.");
        this.setStatus("loadFile", StatusState.OFFLINE, "Server is not connected! (Load File)");
    }
};

BlockPyServer.prototype.saveFile = function (filename, contents, delay) {
    if (delay === undefined) {
        delay = this.TIMER_DELAY;
    }
    let model = this.main.model;
    if (model.ui.server.isEndpointConnected("saveFile")) {
        let data = this.createServerData();
        data["filename"] = filename;
        data["code"] = contents;
        this.setStatus("saveFile", StatusState.ACTIVE);
        this._postLatestRetry(data, filename, "saveFile", delay);
    } else {
        this.setStatus("saveFile", StatusState.OFFLINE);
    }
};

BlockPyServer.prototype.updateSubmission = function (score, correct, hiddenOverride, forceUpdate) {
    let callback = this.main.model.configuration.callbacks.success;
    if (this.main.model.ui.server.isEndpointConnected("updateSubmission")) {
        let data = this.createServerData();
        data["score"] = score;
        data["correct"] = correct;
        data["hidden_override"] = hiddenOverride;
        data["force_update"] = forceUpdate;
        this.main.components.pythonEditor.bm.blockEditor.getPngFromBlocks((pngData, img) => {
            data["image"] = pngData;
            if (img.remove) {
                img.remove();
            }
            this._postRetry(data, "updateSubmission", 0,
                            (response) => {
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
};