function BlockPyFeedback(main, tag) {
    this.main = main;
    this.tag = tag;
    
    this.body = this.tag.find('.blockpy-feedback-body');
    this.title = this.tag.find('.blockpy-feedback-title');
    this.original = this.tag.find('.blockpy-feedback-original');
    this.status = this.tag.find('.blockpy-feedback-status');
    this.trace = this.tag.find('.blockpy-feedback-trace');
    
    this.trace.click(this.buildTraceTable.bind(this));
    
    this.original.hide();
};

BlockPyFeedback.prototype.buildTraceTable = function() {
    var execution = this.main.model.execution;
    execution.show_trace(true);
    execution.trace_step(execution.last_step());
    this.main.components.server.logEvent('editor', 'trace')
}

BlockPyFeedback.prototype.error = function(html) {
    this.tag.html(html);
    this.tag.removeClass("alert-success");
    this.tag.addClass("alert-warning");
    this.main.components.printer.print("Execution stopped - there was an error!");
}

BlockPyFeedback.prototype.clear = function() {
    this.title.html("Ready");
    this.original.hide();
    this.body.html("Run your program to get feedback.");
    this.main.model.status.error("none");
    this.main.components.editor.unhighlightLines();
    this.main.components.printer.resetPrinter()
};

BlockPyFeedback.prototype.clearEditorErrors = function() {
    if (this.main.model.status.error() == "editor") {
        this.clear();
    }
}

BlockPyFeedback.prototype.success = function() {
    this.tag.html("<span class='label label-success'><span class='glyphicon glyphicon-ok'></span> Success!</span>");
    this.tag.removeClass("alert-warning");
    this.main.components.server.logEvent('feedback', "Success");
}

BlockPyFeedback.prototype.editorError = function(original, message, line) {
    original = this.prettyPrintError(original);
    this.title.html("Editor Error");
    this.original.show().html(original);
    this.body.html(message);
    this.main.model.status.error("editor");
    this.main.components.editor.highlightError(line-1);
    this.main.components.printer.print("Editor error - could not make blocks!");
    this.main.components.server.logEvent('feedback', "Editor Error", original+"\n|\n"+message);
}

BlockPyFeedback.prototype.complete = function() {
    this.title.html("Complete!");
    this.original.hide();
    this.body.html("Great work!");
    this.main.model.status.error("complete");
    this.main.components.editor.unhighlightLines();
    this.main.components.server.logEvent('feedback', "Success");
}

BlockPyFeedback.prototype.noErrors = function() {
    this.title.html("Ran");
    this.original.hide();
    this.body.html("No errors reported. View your output on the left.");
    this.main.model.status.error("no errors");
    this.main.components.editor.unhighlightLines();
    this.main.components.server.logEvent('feedback', "No Errors", '');
}

BlockPyFeedback.prototype.syntaxError = function(original, message, line) {
    original = this.prettyPrintError(original);
    this.title.html("Syntax Error");
    this.original.show().html(original);
    this.body.html(message);
    this.main.model.status.error("syntax");
    this.main.components.editor.highlightError(line-1);
    this.main.components.printer.print("Execution stopped - there was an error!");
    this.main.components.server.logEvent('feedback', "Syntax Error", original+"\n|\n"+message);
}

BlockPyFeedback.prototype.semanticError = function(name, message, line) {
    this.title.html(name);
    this.original.hide();
    this.body.html(message);
    this.main.model.status.error("semantic");
    if (line !== null) {
        this.main.components.editor.highlightError(line-1);
    }
    this.main.components.printer.print("Execution stopped - there was an error!");
    this.main.components.server.logEvent('feedback', "Semantic Error", name+"\n|\n"+message);
}

BlockPyFeedback.prototype.internalError = function(original, name, message) {
    original = this.prettyPrintError(original);
    this.title.html(name);
    this.original.show().html(original);
    this.body.html(message);
    this.main.model.status.error("internal");
    this.main.components.printer.print("Internal error! Please show this to an instructor!");
    this.main.components.server.logEvent('feedback', "Internal Error", name+"\n|\n"+original+"\n|\n"+message);
}

BlockPyFeedback.prototype.instructorFeedback = function(name, message, line) {
    this.title.html(name);
    this.original.hide();
    this.body.html(message);
    this.main.model.status.error("feedback");
    if (line !== undefined) {
        this.main.components.editor.highlightError(line-1);
    }
    this.main.components.server.logEvent('feedback', "Instructor Feedback", name+"\n|\n"+"\n|\n"+message);
}

BlockPyFeedback.prototype.emptyProgram = function() {
    this.title.html("Blank Program");
    this.original.hide().html("");
    this.body.html("You have not written any code yet.");
    this.main.model.status.error("runtime");
    this.main.components.server.logEvent('feedback', "Empty Program");
}

BlockPyFeedback.prototype.prettyPrintError = function(error) {
    if (typeof error === "string") {
        return error;
    } else {
        // A weird skulpt thing?
        if (error.tp$str !== undefined) {
            return error.tp$str().v;
        } else {
            return ""+error.name + ": " + error.message;
        }
    }
}

/*
 * Print an error to the printers -- the on screen one and the browser one
 */
BlockPyFeedback.prototype.printError = function(error) {
    //console.log(error);
    original = this.prettyPrintError(error);
    this.title.html(error.tp$name);
    this.original.show().html(original);
    if (error.tp$name == "ParseError") {
        this.body.html("While attempting to convert the Python code into blocks, I found a syntax error. In other words, your Python code has a spelling or grammatical mistake. You should check to make sure that you have written all of your code correctly. To me, it looks like the problem is on line "+ error.args.v[2]+', where it says:<br><code>'+error.args.v[3][2]+'</code>', error.args.v[2]);
    } else if (error.constructor == Sk.builtin.NameError
                && error.args.v.length > 0
                && error.args.v[0].v == "name '___' is not defined") {
        this.body.html("You have incomplete blocks. Make sure that you do not have any dangling blocks or blocks that are connected incorrectly.<br><br>If you look at the text view of your Python code, you'll see <code>___</code> in the code. The converter will create these <code>___</code> to show that you have a block that's missing a piece.");
    } else if (error.tp$name in EXTENDED_ERROR_EXPLANATION) {
        this.body.html(EXTENDED_ERROR_EXPLANATION[error.tp$name]);
    } else {
        this.body.html(error.enhanced);
    }
    console.error(error);
    if (error.stack) {
        console.error(error.stack);
    }
    this.main.model.status.error("runtime");
    this.main.components.editor.highlightError(error.traceback[0].lineno-1);
    this.main.components.server.logEvent('feedback', "Runtime", original);
}


BlockPyFeedback.prototype.printSemantic = function(result) {
    //this.explorer.tags.message.show();
    //this.explorer.tags.message.html(JSON.stringify(result.identifiers));
    var out = $("<div></div>");
    for (var title in result) {
        if (result[title].length >0) {
            out.append("<b>"+title+"</b>: "+result[title].join()+"<br>");
        }
    }
    this.body.html(out);
}