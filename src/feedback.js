function BlockPyFeedback(main, tag) {
    this.main = main;
    this.tag = tag;
    
    this.body = this.tag.find('.blockpy-feedback-body');
    this.title = this.tag.find('.blockpy-feedback-title');
    this.original = this.tag.find('.blockpy-feedback-original');
    this.status = this.tag.find('.blockpy-feedback-status');
    
    this.original.hide();
};

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
}

BlockPyFeedback.prototype.editorError = function(original, message, line) {
    original = this.prettyPrintError(original);
    this.title.html("Editor Error");
    this.original.show().html(original);
    this.body.html(message);
    this.main.model.status.error("editor");
    this.main.components.editor.highlightError(line-1);
    this.main.components.printer.print("Editor error - could not make blocks!");
}

BlockPyFeedback.prototype.complete = function() {
    this.title.html("Complete!");
    this.original.hide();
    this.body.html("Great work!");
    this.main.model.status.error("complete");
    this.main.components.editor.unhighlightLines();
}

BlockPyFeedback.prototype.noErrors = function() {
    this.title.html("Ran");
    this.original.hide();
    this.body.html("No errors reported. View your output on the left.");
    this.main.model.status.error("no errors");
    this.main.components.editor.unhighlightLines();
}

BlockPyFeedback.prototype.syntaxError = function(original, message, line) {
    original = this.prettyPrintError(original);
    this.title.html("Syntax Error");
    this.original.show().html(original);
    this.body.html(message);
    this.main.model.status.error("syntax");
    this.main.components.editor.highlightError(line-1);
    this.main.components.printer.print("Execution stopped - there was an error!");
}

BlockPyFeedback.prototype.semanticError = function(name, message, line) {
    this.title.html(name);
    this.original.hide();
    this.body.html(message);
    this.main.model.status.error("semantic");
    this.main.components.editor.highlightError(line-1);
    this.main.components.printer.print("Execution stopped - there was an error!");
}

BlockPyFeedback.prototype.instructorFeedback = function(name, message, line) {
    this.title.html(name);
    this.original.hide();
    this.body.html(message);
    this.main.model.status.error("feedback");
    if (line !== undefined) {
        this.main.components.editor.highlightError(line-1);
    }
}

BlockPyFeedback.prototype.emptyProgram = function() {
    this.title.html("Blank Program");
    this.original.hide().html("");
    this.body.html("You have not written any code yet.");
    this.main.model.status.error("runtime");
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
    this.body.html(error.enhanced);
    console.error(error);
    this.main.model.status.error("runtime");
    this.main.components.editor.highlightError(error.traceback[0].lineno-1);
    return;
    // Is it a string?
    if (typeof error !== "string") {
        // A weird skulpt thing?
        if (error.tp$str !== undefined) {
            try {
                this.editor.highlightError(error.traceback[0].lineno-1);
            } catch (e) {
            }
            
            var all_blocks = Blockly.mainWorkspace.getAllBlocks();
            blockMap = {};
            all_blocks.forEach(function(elem) {
                if (elem.lineNumber in blockMap) {
                    blockMap[elem.lineNumber].push(elem);
                } else {
                    blockMap[elem.lineNumber] = [elem];
                }
            });
            var hblocks = blockMap[""+error.traceback[0].lineno];
            Blockly.mainWorkspace.highlightBlock(hblocks[0].id);
            //hblocks[0].addSelect();
            
            if (error.constructor == Sk.builtin.NameError
                && error.args.v.length > 0
                && error.args.v[0].v == "name '___' is not defined") {
                error = "<b>Error: </b> You have incomplete blocks. Make sure that you do not have any dangling blocks.<br><br><b>Extended Error Explanation:</b> If you look at the text view of your Python code, you'll see <code>___</code> in the code. The converter will create these <code>___</code> to show that you have a block that's missing a piece.";
            } else if (error.tp$name in EXTENDED_ERROR_EXPLANATION) {
                error = "<b>Error: </b>"+error.tp$str().v + "<br><br>"+EXTENDED_ERROR_EXPLANATION[error.tp$name];
            } else {
                error = error.tp$str().v;
            }
        } else {
            // An error?
            error = ""+error.name + ": " + error.message;
            printer.log("Unknown Error"+error.stack);
        }
    }
    // Perform any necessary cleaning
    this.explorer.tags.errors_body.html(error);
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