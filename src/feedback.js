function BlockPyFeedback(main, tag) {
    this.main = main;
    this.tag = tag;
};

BlockPyFeedback.prototype.error = function(html) {
    this.tag.html(html);
    this.tag.removeClass("alert-success");
    this.tag.addClass("alert-warning");
}

BlockPyFeedback.prototype.success = function() {
    this.tag.html("<span class='label label-success'><span class='glyphicon glyphicon-ok'></span> Success!</span>");
    this.tag.removeClass("alert-warning");
}

/*
 * Print an error to the printers -- the on screen one and the browser one
 */
BlockPyFeedback.prototype.printError = function(error) {
    console.log("Printing Error", error);
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
            printer.log(all_blocks);
            blockMap = {};
            all_blocks.forEach(function(elem) {
                if (elem.lineNumber in blockMap) {
                    blockMap[elem.lineNumber].push(elem);
                } else {
                    blockMap[elem.lineNumber] = [elem];
                }
            });
            var hblocks = blockMap[""+error.traceback[0].lineno];
            printer.log(hblocks);
            //Blockly.mainWorkspace.highlightBlock(hblocks[0].id);
            hblocks[0].addSelect();
            
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


BlockPyFeedback.prototype.printAnalysis = function(result) {
    //this.explorer.tags.message.show();
    //this.explorer.tags.message.html(JSON.stringify(result.identifiers));
    printer.log(result);
}