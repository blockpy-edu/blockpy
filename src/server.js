function BlockPyServer(main, model, kennel, alertBox) {
    this.main = main;
    this.model = model;
    this.kennel = kennel;
    this.alertBox = alertBox;
    
    // Add the LocalStorage connection
    this.storage = new KennelStorage();
    
    this.eventQueue = [];
    this.eventTimer = {};
    this.saveTimer = {};
    this.presentationTimer = null;
}

BlockPyServer.prototype.MAX_LOG_SIZE = 20;
BlockPyServer.prototype.LOG_DELAY = 4000;
BlockPyServer.prototype.SAVE_DELAY = 1000;

BlockPyServer.prototype.logEvent = function(event, action) {
    var filename = this.model.settings.program;
    var data = {'event': event, 
                'action': action,
                'version': this.model.question.version,
                'question_id': this.model.question.question_id,
                'student_id': this.model.question.student_id,
                'context_id': this.model.question.context_id};    
    var alertBox = this.alertBox;
    var server = this;
    if (this.model.urls.server !== false && this.model.urls.log_event !== false) {
        $.post(server.model.urls.log_event, data, function(response) {
            if (response.success) {
                alertBox("Logged").delay(100).fadeOut("slow");
            } else {
                alertBox("Logging failed");
            }
        }).fail(function() {
            alertBox("Logging failed");
        });
    }
}

BlockPyServer.prototype.uploadEvents = function() {
    var data = {
        'events': JSON.stringify(this.eventQueue)
    };
    if (this.model.urls.server !== false) {
        
    }
}

BlockPyServer.prototype.markSuccess = function(success) {
    var data = {
        'code': this.model.programs.__main__,
        'type': 'blockly',
        'version': this.model.question.version,
        'question_id': this.model.question.question_id,
        'lis_result_sourcedid': this.model.question.lis_result_sourcedid,
        'student_id': this.model.question.student_id,
        'context_id': this.model.question.context_id,
        'status': success
    };
    var alertBox = this.alertBox;
    if (this.model.urls.server !== false && this.model.urls.save_success !== false) {
        $.post(this.model.urls.save_success, data, function(response) {
            if (success) {
                if (response.success) {
                    alertBox("Success reported").delay(200).fadeOut("slow");
                } else {
                    alertBox("Success report failed");
                    console.error("Server Success Report Error", response.message);
                }
            }
        }).fail(function() {
            alertBox("Status report failed");
        });
    }
};

BlockPyServer.prototype.savePresentation = function(presentation, name, parsons, text_first) {
    var data = {
        'presentation': presentation,
        'parsons': parsons,
        'text_first': text_first,
        'name': name,
        'question_id': this.model.question.question_id,
    };
    var alertBox = this.alertBox;
    var server = this;
    if (this.model.urls.server !== false && this.model.urls.save_presentation) {
        clearTimeout(this.presentationTimer);
        this.presentationTimer = setTimeout(function() {
            $.post(server.model.urls.save_presentation, data, function(response) {
                if (response.success) {
                    alertBox("Saved").delay(200).fadeOut("slow");
                } else {
                    alertBox("Saving failed");
                    console.error("Server Saving Error", response.message);
                }
            }).fail(function() {
                alertBox("Saving failed");
            });
        }, this.SAVE_DELAY);
    }
}

BlockPyServer.prototype.save = function() {
    var filename = this.model.settings.program;
    var data = {
        'filename': filename,
        'code': this.model.programs[filename],
        'type': 'blockly',
        'version': this.model.question.version,
        'question_id': this.model.question.question_id,
        'student_id': this.model.question.student_id,
        'context_id': this.model.question.context_id
    };
    var alertBox = this.alertBox;
    var server = this;
    if (this.model.urls.server !== false && this.model.urls.save_code !== false) {
        if (this.saveTimer[filename]) {
            clearTimeout(this.saveTimer);
        }
        this.saveTimer[filename] = setTimeout(function() {
            server.storage.set(data.question_id, data.code);
            $.post(server.model.urls.save_code, data, function(response) {
                if (response.is_version_correct === false) {
                    alertBox("New version available! Reload!");
                    server.storage.remove(data.question_id);
                } else if (response.success) {
                    alertBox("Saved").delay(200).fadeOut("slow");
                    server.storage.remove(data.question_id);
                } else {
                    alertBox("Saving failed");
                    console.error("Server Saving Error", response.message);
                }
            }).fail(function() {
                alertBox("Saving failed");
            });
        }, this.SAVE_DELAY);
    }
};

BlockPyServer.prototype.load = function() {
    var data = {
        'question_id': this.model.question.question_id,
        'student_id': this.model.question.student_id,
        'context_id': this.model.question.context_id
    };
    var alertBox = this.alertBox;
    var server = this, kennel = this.kennel;
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
                    kennel.feedback.success('');
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
            this.kennel.feedback.success('');
        }
    }
};
