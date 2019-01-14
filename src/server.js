/**
 * Object for communicating with the external servers. This includes functionality for
 * saving and loading files, logging events, saving completions, and retrieving history.
 *
 * @constructor
 * @this {BlockPyServer}
 * @param {Object} main - The main BlockPy instance
 */
function BlockPyServer(main) {
    this.main = main;
    
    // Save URLs locally for quicker access
    this.urls = main.model.constants.urls;
    
    // Add the LocalStorage connection
    // Presently deprecated, but we should investigate this
    this.storage = new LocalStorageWrapper("BLOCKPY");
    
    // FaultResistantCache
    this.queue = {
        'log_event':  JSON.parse(this.storage.getDefault('log_event', '[]')),
        'save_success': JSON.parse(this.storage.getDefault('save_success', '[]'))
    };
    this.MAX_QUEUE_SIZE = {
        'log_event': 200,
        'save_success': 50
    }
    
    this.saveTimer = {};
    this.presentationTimer = null;
    this.timers = {};
    
    this.overlay = null;
    this.blockingAttempts = 0;
    
    // For managing "walks" that let us rerun stored code
    this.inProgressWalks = [];
    
    this.createSubscriptions();
    
    // Check cache
    this.checkCaches();
}

BlockPyServer.prototype.checkIP = function(newIP) {
    if (this.storage.has("IP")) {
        var oldIP = this.storage.get("IP");
        if (oldIP != newIP) {
            this.logEvent("editor", "changeIP", oldIP+"|"+newIP);
            this.storage.set("IP", newIP);
        }
    } else {
        this.storage.set("IP", newIP);
    }
}

BlockPyServer.prototype.checkCaches = function() {
    if (this.storage.has('ASSIGNMENTS_CACHE')) {
        var data = JSON.parse(this.storage.get('ASSIGNMENTS_CACHE'));
        this._postLatestRetry(data, this.urls.save_assignment, 'assignment', 
                              'ASSIGNMENTS_CACHE', this.TIMER_DELAY);
    }
    for (var filename in this.main.model.programs) {
        if (this.storage.has('CODE_CACHE_'+filename)) {
            var data = JSON.parse(this.storage.get('CODE_CACHE_'+filename));
            this._postLatestRetry(data, this.urls.save_code, 
                                  'code_'+filename, 
                                  'CODE_CACHE_'+filename, this.TIMER_DELAY);
        }
    }
    var server = this;
    Object.keys(this.queue).forEach(function(cache) {
        (function pushAnyQueued(response){
            if (response.success) {
                if (server.queue[cache].length) {
                    var data = JSON.parse(server.queue[cache].pop());
                    var url = server.urls[cache];
                    server._postRetry(data, url, cache, 1000, pushAnyQueued);
                }
            }
        })({'success': true})
    });
}

BlockPyServer.prototype.createSubscriptions = function() {
    var server = this, model = this.main.model;
    model.program_updated.subscribe(function() { server.saveCode(); });
    model.assignment.name.subscribe(function(e) { server.saveAssignment();});
    model.assignment.introduction.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.parsons.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.importable.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.secret.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.disable_algorithm_errors.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.disable_timeout.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.initial_view.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.files.subscribe(function(e) { server.saveAssignment(); });
    //model.settings.editor.subscribe(function(newValue) { server.logEvent('editor', newValue); });
    model.execution.show_trace.subscribe(function(newValue) { server.logEvent('trace', newValue); });
    model.execution.trace_step.subscribe(function(newValue) { server.logEvent('trace_step', newValue); });
};

/**
 *
 * Some subscriptions have to happen after other things have been loaded.
 * Right now this is just after CORGIS libraries have been loaded, but maybe
 * we'll add more later and this will need to be refactored.
 * 
 */
BlockPyServer.prototype.finalizeSubscriptions = function() {
    var server = this, model = this.main.model;
    model.assignment.modules.subscribe(function(e) { server.saveAssignment(); });
};

BlockPyServer.prototype.TIMER_DELAY = 1000;
BlockPyServer.prototype.FAIL_DELAY = 2000;

BlockPyServer.prototype.createServerData = function() {
    var assignment = this.main.model.assignment;
    var d = new Date();
    var seconds = Math.round(d.getTime() / 1000);
    data = {
        'assignment_id': assignment.assignment_id(),
        'group_id': assignment.group_id(),
        'course_id': assignment.course_id(),
        'student_id': assignment.student_id(),
        'version': assignment.version(),
        'timestamp': seconds
    };
    if (this.main.model.settings.log_id() != null) {
        data['log_id'] = this.main.model.settings.log_id();
    }
    return data;
}

BlockPyServer.prototype.setStatus = function(status, server_error) {
    this.main.model.status.server(status);
    if (server_error !== undefined) {
        this.main.model.status.server_error(server_error);
    } else {
        this.main.model.status.server_error('');
    }
}

BlockPyServer.prototype.defaultResponse = function(response) {
    if (response.success) {
        this.setStatus('Saved');
        this.checkIP(response.ip);
    } else {
        console.error(response);
        this.setStatus('Error', response.message);
    }
}
BlockPyServer.prototype.defaultFailure = function(error, textStatus) {
    this.setStatus('Disconnected', "Could not access server!\n"+textStatus);
}

BlockPyServer.prototype.logEvent = function(event_name, action, body) {
    if (this.main.model.server_is_connected('log_event')) {
        var data = this.createServerData();
        data['event'] = event_name;
        data['action'] = action;
        data['body'] = (body === undefined) ? '' : body;
        this.setStatus('Logging');
        // Trigger request
        this._postRetry(data, this.urls.log_event, 'log_event', 0, function(){});
    } else {
        this.setStatus('Offline', "Server is not connected! (Log Event)");
    }
}

BlockPyServer.prototype._enqueueData = function(cache, data) {
    // Ensure we have not overfilled the queue
    var length = this.queue[cache].length;
    var max = this.MAX_QUEUE_SIZE[cache];
    if (length > max) {
        this.queue[cache] = this.queue[cache].slice(length-max, max);
    }
    // Only add the element if it's new
    var key = JSON.stringify(data);
    var index = this.queue[cache].indexOf(key);
    if (index == -1) {
        this.queue[cache].push(key);
        this.storage.set(cache, JSON.stringify(this.queue[cache]));
    }
}
BlockPyServer.prototype._dequeueData = function(cache, data) {
    var key = JSON.stringify(data);
    var index = this.queue[cache].indexOf(key);
    if (index >= 0) {
        this.queue[cache].splice(index);
        this.storage.set(cache, JSON.stringify(this.queue[cache]));
    }
}
BlockPyServer.prototype._getQueued = function(cache, data) {
    return JSON.parse(this.queue[cache][0]);
}

BlockPyServer.prototype._postRetry = function(data, url, cache, delay, callback) {
    // Trigger request
    var server = this;
    server.setStatus('Saving');
    setTimeout(function() {
        // Make a backup of the current post
        server._enqueueData(cache, data);
        $.post(url, data)
        .done(function(response) {
            server._dequeueData(cache, data);
            if (response.success) {
                server.setStatus('Saved');
            } else {
                console.error(response);
                server.setStatus('Error', response.message);
            }
            callback(response);
            if (response.success) {
                server.checkIP(response.ip);
            }
        })
        // If server request is the latest one, then let's try it again in a bit
        .fail(function(error, textStatus) {
            server.defaultFailure(error, textStatus);
            server._postRetry(data, url, cache, delay+server.FAIL_DELAY, callback);
        });
    }, delay);
}


BlockPyServer.prototype.markSuccess = function(success) {
    var model = this.main.model;
    var callback = model.settings.completedCallback;
    var forceUpdate = model.settings.forceUpdate;
    var hideCorrectness = model.assignment.secret();
    var server = this;
    if (model.server_is_connected('save_success')) {
        var data = this.createServerData();
        data['code'] = model.programs.__main__;
        data['status'] = success;
        data['hide_correctness'] = hideCorrectness;
        data['force_update'] = forceUpdate;
        this.main.components.editor.getPngFromBlocks(function(pngData, img) {
            data['image'] = pngData;
            if (img.remove) {
                img.remove();
            }
            server._postRetry(data, server.urls.save_success, 'save_success', 0, 
                function(response) {
                    if (response.success && !response.submitted) {
                        server.setStatus('Ungraded', response.message);
                    }
                    if (success && callback) {
                        callback(data);
                    }
                });
        });
    }
}
/*
BlockPyServer.prototype.markSuccess = function(success) {
    var model = this.main.model;
    var callback = model.settings.completedCallback;
    var hideCorrectness = model.assignment.secret();
    var server = this;
    if (model.server_is_connected('save_success')) {
        var data = this.createServerData();
        data['code'] = model.programs.__main__;
        data['status'] = success;
        data['hide_correctness'] = hideCorrectness;
        this.main.components.editor.getPngFromBlocks(function(pngData, img) {
            data['image'] = pngData;
            if (img.remove) {
                img.remove();
            }
            server.setStatus('Saving');
            // Trigger request
            $.post(model.constants.urls.save_success, data, 
                function(response) {
                   if (response.success) {
                        if (response.submitted) {
                            server.setStatus('Saved');
                        } else {
                            server.setStatus('Ungraded', response.message);
                        }
                        if (success && callback) {
                            callback(data);
                        }
                    } else {
                        console.error(response);
                        server.setStatus('Error', response.message);
                        if (success && callback) {
                            callback(data);
                        }
                    }
                })
             .fail(server.defaultFailure.bind(server));
        });
    } else {
        server.setStatus('Offline', "Server is not connected! (Mark Success)");
    }
};*/

BlockPyServer.prototype.saveAssignment = function() {
    var model = this.main.model;
    if (model.server_is_connected('save_assignment') && 
        model.settings.auto_upload()) {
        var data = this.createServerData();
        data['introduction'] = model.assignment.introduction();
        data['parsons'] = model.assignment.parsons();
        data['initial'] = model.assignment.initial_view();
        data['importable'] = model.assignment.importable();
        data['secret'] = model.assignment.secret();
        data['disable_algorithm_errors'] = model.assignment.disable_algorithm_errors();
        data['disable_timeout'] = model.assignment.disable_timeout();
        data['name'] = model.assignment.name();
        // TODO: hackish, broken if ',' is in name
        data['modules'] = model.assignment.modules().join(',');
        data['files'] = model.assignment.files().join(',');
        
        this._postLatestRetry(data, this.urls.save_assignment, 'assignment', 
                              'ASSIGNMENTS_CACHE', this.TIMER_DELAY);
    } else {
        this.setStatus('Offline', "Server is not connected! (Save Assignment)");
    }
}

/**
 * Make a AJAX request that, upon failure, will check to see if this was the
 * latest attempt for this `cache` marker. If so, it will attempt again until
 * successful; otherwise, it gives up the request.
 *
 * @param {Object} data - The AJAX-ready data to be posted
 * @param {String} url - The URL to post to
 * @param {String} filename - The unique name given to the relevant timer
 * @param {String} cache - The unique name given to the relevant cache entry
 * @param {Integer} delay - The current number of milliseconds to wait before
                            trying the request again.
 */
BlockPyServer.prototype._postLatestRetry = function(data, url, filename, cache, delay) {
    var server = this;
    clearTimeout(this.timers[filename]);
    this.timers[filename] = setTimeout(function() {
        // Make a backup of the current post
        server.storage.set(cache, JSON.stringify(data));
        var time = server.storage.getTime(cache);
        // Send the request
        server.setStatus('Saving');
        $.post(url, data)
        .done(function(response) {
            server.defaultResponse(response);
            // If server request is the latest one, clear it from the cache
            var cachedTime = server.storage.getTime(cache);
            if (time >= cachedTime) {
                server.storage.remove(cache);
            }
        })
        .fail(function(error, textStatus) {
            server.defaultFailure(error, textStatus);
            // If server request is the latest one, then let's try it again in a bit
            var cachedTime = server.storage.getTime(cache);
            if (time >= cachedTime) {
                server._postLatestRetry(data, url, filename, cache, 
                                        delay+server.FAIL_DELAY);
            }
        });
    }, delay);
}

BlockPyServer.prototype.saveCode = function() {
    var model = this.main.model;
    if (model.server_is_connected('save_code') && 
        model.settings.auto_upload()) {
        var data = this.createServerData();
        var filename = model.settings.filename();
        data['filename'] = filename;
        data['code'] = model.programs[filename]();
        
        this._postLatestRetry(data, this.urls.save_code, 
                              'code_'+filename, 
                              'CODE_CACHE_'+filename, this.TIMER_DELAY);
    } else {
        this.setStatus('Offline', "Server is not connected! (Save Code)");
    }
}

BlockPyServer.prototype.getHistory = function(callback) {
    var model = this.main.model;
    if (model.server_is_connected('get_history')) {
        var data = this.createServerData();
        var server = this;
        this._postBlocking(this.urls.get_history, data, 5,
            function(response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    console.error(response);
                    server.setStatus('Error', response.message);
                }
            });
    } else {
        this.setStatus('Offline', "Server is not connected! (Get History)");
        callback([]);
    }
}

/**
 *
 */
BlockPyServer.prototype.showOverlay = function(attempt) {
    this.blockingAttempts += 1;
    if (!document.getElementsByClassName("blockpy-overlay").length) {
        this.overlay = $('<div class="blockpy-overlay"> </div>');
        this.overlay.appendTo(document.body)
    }
    switch (attempt) {
        case 0: this.overlay.css('background-color', '#988'); break;
        case 1: this.overlay.css('background-color', '#655'); break;
        case 2: this.overlay.css('background-color', '#333'); break;
        default: this.overlay.css('background-color', 'black'); break;
    }
}
BlockPyServer.prototype.hideOverlay = function() {
    this.blockingAttempts -= 1;
    if (this.blockingAttempts <= 0) {
        this.overlay.remove();
    }
}

BlockPyServer.prototype._postBlocking = function(url, data, attempts, success, failure) {
    var server = this;
    this.setStatus('Loading');
    this.showOverlay(attempts);
    $.post(url, data)
    .done(function(response) {
        server.hideOverlay();
        server.setStatus('Loaded');
        success(response);
        if (response.success) {
            server.checkIP(response.ip);
        }
    })
    .fail(function(e, textStatus, errorThrown) {
        if (attempts <= 0) {
            server.hideOverlay();
            server.defaultFailure();
            if (failure) {
                failure(e, textStatus, errorThrown);
            }
        } else {
            setTimeout(function() {
                server.hideOverlay();
                server._postBlocking(url, data, attempts-1, success, failure);
            }, server.FAIL_DELAY);
        }
    });
}

BlockPyServer.prototype.loadAssignment = function(assignment_id) {
    var model = this.main.model;
    var server = this;
    if (model.server_is_connected('load_assignment')) {
        var data = this.createServerData();        
        data['assignment_id'] = assignment_id;
        this._postBlocking(this.urls.load_assignment, data, 5,
            function(response) {
                if (response.success) {
                    server.main.setAssignment(response.settings,
                                              response.assignment, 
                                              response.programs)
                } else {
                    server.setStatus('Failure', response.message);
                }
            },
            function(e,textStatus,errorThrown) {
                server.main.components.dialog.show("Error While Loading", 
                "BlockPy encountered an error while loading the assignment.<br>"+
                "You should probably reload the page or advance to another assignment.<br>")
                console.error(e, textStatus, errorThrown);
            });
    } else {
        this.setStatus('Offline', "Server is not connected! (Load Assignment)");
    }
}

/**
 * This function can be used to load files and web resources.
 */
BlockPyServer.prototype.loadFile = function(filename, type, callback, errorCallback) {
    var model = this.main.model;
    var server = this;
    if (model.server_is_connected('load_file')) {
        var data = this.createServerData();
        data['filename'] = filename;
        data['type'] = type;
        this._postBlocking(this.urls.load_file, data, 5,
            function(response) {
                if (response.success) {
                    callback(response.data);
                } else {
                    errorCallback(response.message);
                    server.setStatus('Failure', response.message);
                }
           },
           function(e, textStatus, errorThrown) {
                errorCallback("Server failure! Report to instructor");
                console.error(errorThrown);
         });
    } else {
        errorCallback("No file server available.");
        this.setStatus('Offline', "Server is not connected! (Load File)");
    }
}

/*
BlockPyServer.prototype.walkOldCode = function() {
    var server = this,
        main = this.main;
    if (this.inProgressWalks.length > 0) {
        var response = this.inProgressWalks.pop();
        console.log('Processing walk', response.log_id);
        main.setCode(response.code, '__main__');
        main.setCode(response.feedback, 'give_feedback');
        main.model.assignment.assignment_id = response.assignment_id;
        main.model.assignment.user_id = response.user_id;
        main.model.settings.log_id(response.log_id);
        main.components.engine.onExecutionEnd = function(newState) {
            console.log(response.log_id, newState);
            main.components.engine.onExecutionEnd = null;
            setTimeout(function() {
                server.walkOldCode()
            }, 0);
        };
        console.log("Running");
        main.components.engine.run();
    } else {
        var data = this.createServerData();
        this.setStatus('Retrieving');
        if (main.model.server_is_connected('walk_old_code')) {
            $.post(server.main.model.constants.urls.walk_old_code, data, 
                   function (response) {
                       if (response.success) {
                           if (response.more_to_do) {
                            server.inProgressWalks = response.walks;
                            server.walkOldCode();
                           }
                       } else {
                           server.setStatus('Failure', response.message);
                       }
                   })
            .fail(
            function(response) {
                console.error(response);
                setTimeout(function() {
                    server.walkOldCode()
                }, 3000);
            }
            );
            //server.defaultFailure.bind(server));
        } else {
            this.setStatus('Offline', "Server is not connected! (Walk Old Code)");
        }
    }
}*/