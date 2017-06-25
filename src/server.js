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
    
    // Add the LocalStorage connection
    // Presently deprecated, but we should investigate this
    this.storage = new LocalStorageWrapper("BLOCKPY");
    
    this.saveTimer = {};
    this.presentationTimer = null;
    
    // For managing "walks" that let us rerun stored code
    this.inProgressWalks = [];
    
    this.createSubscriptions();
}

BlockPyServer.prototype.createSubscriptions = function() {
    var server = this, model = this.main.model;
    model.program.subscribe(function() { server.saveCode(); });
    model.assignment.name.subscribe(function(e) { server.saveAssignment();});
    model.assignment.introduction.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.parsons.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.importable.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.disable_algorithm_errors.subscribe(function(e) { server.saveAssignment(); });
    model.assignment.initial_view.subscribe(function(e) { server.saveAssignment(); });
    model.settings.editor.subscribe(function(newValue) { server.logEvent('editor', newValue); });
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

BlockPyServer.prototype.createServerData = function() {
    var assignment = this.main.model.assignment;
    var d = new Date();
    var seconds = Math.round(d.getTime() / 1000);
    data = {
        'assignment_id': assignment.assignment_id(),
        'group_id': assignment.group_id,
        'course_id': assignment.course_id,
        'student_id': assignment.student_id,
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
BlockPyServer.prototype.defaultResponseWithoutVersioning = function(response) {
    if (response.success) {
        this.setStatus('Saved');
    } else {
        console.error(response);
        this.setStatus('Error', response.message);
    }
}
BlockPyServer.prototype.defaultResponse = function(response) {
    /*console.log(response);
    if (!response.is_version_correct) {
        this.setStatus('Out of date');
    } else */if (response.success) {
        this.setStatus('Saved');
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
        $.post(this.main.model.constants.urls.log_event, data, 
               this.defaultResponse.bind(this))
         .fail(this.defaultFailure.bind(this));
    } else {
        this.setStatus('Offline', "Server is not connected!");
    }
}

BlockPyServer.prototype.markSuccess = function(success, callback) {
    var model = this.main.model;
    if (model.server_is_connected('save_success')) {
        var data = this.createServerData();
        var server = this;
        data['code'] = model.programs.__main__;
        data['status'] = success;
        this.main.components.editor.getPngFromBlocks(function(pngData, img) {
            data['image'] = pngData;
            img.remove();
            server.setStatus('Saving');
            // Trigger request
            $.post(model.constants.urls.save_success, data, 
                function(response) {
                   if (response.success) {
                        server.setStatus('Saved');
                        if (success) {
                            callback(data);
                        }
                    } else {
                        console.error(response);
                        server.setStatus('Error', response.message);
                        callback(data);
                        console.log(data, callback);
                    }
                })
             .fail(server.defaultFailure.bind(server));
        } else {
            server.setStatus('Offline', "Server is not connected!");
        }
    });
};

BlockPyServer.prototype.saveAssignment = function() {
    var model = this.main.model;
    if (model.server_is_connected('save_assignment') && 
        model.settings.auto_upload()) {
        var data = this.createServerData();
        data['introduction'] = model.assignment.introduction();
        data['parsons'] = model.assignment.parsons();
        data['initial'] = model.assignment.initial_view();
        data['importable'] = model.assignment.importable();
        data['disable_algorithm_errors'] = model.assignment.disable_algorithm_errors();
        data['name'] = model.assignment.name();
        data['modules'] = model.assignment.modules().join(','); // TODO: hackish, broken if ',' is in name
        
        var server = this;
        this.setStatus('Saving');
        clearTimeout(this.presentationTimer);
        // Trigger request
        this.presentationTimer = setTimeout(function() {
            $.post(model.constants.urls.save_assignment, data, 
                   server.defaultResponseWithoutVersioning.bind(server))
             .fail(server.defaultFailure.bind(server));
        }, this.TIMER_DELAY);
    } else {
        this.setStatus('Offline', "Server is not connected!");
    }
}

BlockPyServer.prototype.saveCode = function() {
    var model = this.main.model;
    if (model.server_is_connected('save_code') && 
        model.settings.auto_upload()) {
        var data = this.createServerData();
        var filename = model.settings.filename();
        data['filename'] = filename;
        data['code'] = model.programs[filename]();
        
        var server = this;
        this.setStatus('Saving');
        if (this.saveTimer[filename]) {
            clearTimeout(this.saveTimer[filename]);
        }
        this.saveTimer[filename] = setTimeout(function() {
            $.post(model.constants.urls.save_code, data, 
                   filename == '__main__'
                    ? server.defaultResponse.bind(server)
                    : server.defaultResponseWithoutVersioning.bind(server))
             .fail(server.defaultFailure.bind(server));
        }, this.TIMER_DELAY);
    } else {
        this.setStatus('Offline', "Server is not connected!");
    }
}

BlockPyServer.prototype.getHistory = function(callback) {
    var model = this.main.model;
    
    if (model.server_is_connected('get_history')) {
        var data = this.createServerData();
        var server = this;
        this.setStatus('Loading History');
        $.post(model.constants.urls.get_history, data, 
               function(response) {
                if (response.success) {
                    server.setStatus('Saved');
                    callback(response.data);
                } else {
                    console.error(response);
                    server.setStatus('Error', response.message);
                }
               })
         .fail(server.defaultFailure.bind(server));
    } else {
        this.setStatus('Offline', "Server is not connected!");
        callback([]);
    }
}

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
            this.setStatus('Offline', "Server is not connected!");
        }
    }
}

/*
BlockPyServer.prototype.load = function() {
    var data = {
        'question_id': this.model.question.question_id,
        'student_id': this.model.question.student_id,
        'context_id': this.model.question.context_id
    };
    var alertBox = this.alertBox;
    var server = this, blockpy = this.blockpy;
    if (this.model.urls.server !== false && this.model.urls.load_code !== false) {
        $.post(this.model.urls.load_code, data, function(response) {
            if (response.success) {
                if (server.storage.has(data.question_id)) {
                    if (server.storage.is_new(data.question_id, response.timestamp)) {
                        var xml = server.storage.get(data.question_id);
                        server.model.load(xml);
                        server.save();
                    } else {
                        server.storage.remove(data.question_id);
                        if (response.code !== null) {
                            server.model.load(response.code);
                        }
                    }
                } else {
                    if (response.code !== null) {
                        server.model.load(response.code);
                    }
                }
                if (response.completed) {
                    blockpy.feedback.success('');
                }
                alertBox("Loaded").delay(200).fadeOut("slow");
            } else {
                console.error("Server Load Error", response.message);
                alertBox("Loading failed");
            }
        }).fail(function() {
            alertBox("Loading failed");
        }).always(function() {
            server.model.loaded = true;
        });
    } else {
        server.model.loaded = true;
        alertBox("Loaded").delay(200).fadeOut("slow");
        if (this.model.urls.load_success === true) {
            this.blockpy.feedback.success('');
        }
    }
};
*/