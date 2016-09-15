function BlockPyServer(main) {
    this.main = main;
    
    // Add the LocalStorage connection
    this.storage = new LocalStorageWrapper("BLOCKPY");
    
    this.saveTimer = {};
    this.presentationTimer = null;
    
    this.createSubscriptions();
}

BlockPyServer.prototype.createSubscriptions = function() {
    var server = this, model = this.main.model;
    model.program.subscribe(function() { server.saveCode(); });
    model.assignment.name.subscribe(function() { server.saveAssignment();});
    model.assignment.introduction.subscribe(function() { server.saveAssignment(); });
    model.assignment.parsons.subscribe(function() { server.saveAssignment(); });
    model.assignment.importable.subscribe(function() { server.saveAssignment(); });
    model.assignment.initial_view.subscribe(function() { server.saveAssignment(); });
    model.assignment.modules.subscribe(function() { server.saveAssignment(); });
    model.settings.editor.subscribe(function(newValue) { server.logEvent('editor', newValue); });
};

BlockPyServer.prototype.TIMER_DELAY = 1000;

BlockPyServer.prototype.createServerData = function() {
    var assignment = this.main.model.assignment;
    return {
        'assignment_id': assignment.assignment_id,
        'course_id': assignment.course_id,
        'student_id': assignment.student_id,
        'version': assignment.version()
    }
}

BlockPyServer.prototype.setStatus = function(status) {
    this.main.model.status.server(status);
}

BlockPyServer.prototype.defaultResponse = function(response) {
    if (response.is_version_correct) {
        this.setStatus('Out of date');
    } else if (response.success) {
        this.setStatus('Saved');
    } else {
        console.error(response);
        this.setStatus('Error');
    }
}
BlockPyServer.prototype.defaultFailure = function() {
    this.setStatus('Disconnected');
}

BlockPyServer.prototype.logEvent = function(event_name, action, body) {
    var data = this.createServerData();
    data['event'] = event_name;
    data['action'] = action;
    if (body === undefined) {
        data['body'] = '';
    } else {
        data['body'] = body;
    }
    
    this.setStatus('Logging');
    if (this.main.model.server_is_connected('log_event')) {
        $.post(this.main.model.constants.urls.log_event, data, 
               this.defaultResponse.bind(this))
         .fail(this.defaultFailure.bind(this));
    } else {
        this.setStatus('Offline');
    }
}

BlockPyServer.prototype.markSuccess = function(success) {
    var data = this.createServerData();
    var server = this,
        model = this.main.model;
    data['code'] = model.programs.__main__;
    data['status'] = success;
    this.main.components.editor.getPngFromBlocks(function(pngData, img) {
        data['image'] = pngData;
        img.remove();
        server.setStatus('Saving');
        if (model.server_is_connected('save_success')) {
            $.post(model.constants.urls.save_success, data, 
                   server.defaultResponse.bind(server))
             .fail(server.defaultFailure.bind(server));
        } else {
            server.setStatus('Offline');
        }
    });
};

BlockPyServer.prototype.saveAssignment = function() {
    var data = this.createServerData();
    var model = this.main.model;
    data['introduction'] = model.assignment.introduction();
    data['parsons'] = model.assignment.parsons();
    data['initial'] = model.assignment.initial_view();
    data['importable'] = model.assignment.importable();
    data['name'] = model.assignment.name();
    //data['disabled'] = disabled;
    data['modules'] = model.assignment.modules().join(','); // TODO: hackish, broken if ',' is in name
    
    var server = this;
    this.setStatus('Saving');
    if (this.main.model.server_is_connected('save_assignment') && 
        this.main.model.settings.auto_upload()) {
        clearTimeout(this.presentationTimer);
        this.presentationTimer = setTimeout(function() {
            $.post(server.main.model.constants.urls.save_assignment, data, 
                   server.defaultResponse.bind(server))
             .fail(server.defaultFailure.bind(server));
        }, this.TIMER_DELAY);
    } else {
        this.setStatus('Offline');
    }
}

BlockPyServer.prototype.saveCode = function() {
    var filename = this.main.model.settings.filename();
    var data = this.createServerData();
    data['filename'] = filename;
    data['code'] = this.main.model.programs[filename]();
    
    var server = this;
    this.setStatus('Saving');
    if (this.main.model.server_is_connected('save_code') && 
        this.main.model.settings.auto_upload()) {
        if (this.saveTimer[filename]) {
            clearTimeout(this.saveTimer[filename]);
        }
        this.saveTimer[filename] = setTimeout(function() {
            $.post(server.main.model.constants.urls.save_code, data, 
                   server.defaultResponse.bind(server))
             .fail(server.defaultFailure.bind(server));
        }, this.TIMER_DELAY);
    } else {
        this.setStatus('Offline');
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