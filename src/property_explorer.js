function PropertyExplorer(main, tag, stepConsole, stepEditor, tag, server) {
    this.main = main;
    this.tag = tag;
    
    this.traceTable = [];
    
    this.stepConsole = stepConsole;
    this.stepEditor = stepEditor;
    this.server = server;
    this.tag = tag;
    this.tags = {
        "message": tag.find('.blockpy-explorer-run-hide'),
        "errors": tag.find('.blockpy-explorer-errors'),
        "errors_body": tag.find('.blockpy-explorer-errors-body'),
        "errors_hide": tag.find('.blockpy-explorer-errors-hide'),
        "first": tag.find('.blockpy-explorer-first'),
        "back": tag.find('.blockpy-explorer-back'),
        "next": tag.find('.blockpy-explorer-next'),
        "last": tag.find('.blockpy-explorer-last'),
        "step": tag.find('.blockpy-explorer-step-span'),
        "length": tag.find('.blockpy-explorer-length-span'),
        "line": tag.find('.blockpy-explorer-line-span'),
        "table": tag.find('.blockpy-explorer-table'),
        "modules": tag.find('.blockpy-explorer-modules')
    };
    this.tags.first.prop("disabled", true);
    this.tags.back.prop("disabled", true);
    this.tags.next.prop("disabled", true);
    this.tags.last.prop("disabled", true);
    this.tags.errors.hide();
    var errors = this.tags.errors;
    this.tags.errors_hide.click(function() {
       errors.hide();
    });
    
    /*
        // Add the Property Explorer
    this.explorer = new PropertyExplorer(
        function(step, page) { 
            blockpy.stepConsole(step);
        },
        function(step, page) { 
            blockpy.editor.highlightLine(page.line-1);
            if (page.block) {
                blockpy.editor.highlightBlock(page.block);
            } else {
                blockpy.editor.highlightBlock(null);
            }
        },
        blockpy.mainDiv.find('.blockpy-explorer'),
        blockpy.server
    );
    */
}

PropertyExplorer.prototype.move = function(step) {
    // Fix the current step
    var last = this.traceTable.length-1;
    if (step < 0) {
        step = last + step + 1;
    }
    if (step > last) {
        step = last;
    }
    // Update the VCR Controls
    this.tags.first.prop('disabled', step == 0);
    this.tags.back.prop('disabled', step == 0);
    this.tags.next.prop('disabled', step == last);
    this.tags.last.prop('disabled', step == last);
    // Unbind/bind the VCR controls functions
    var explorer = this;
    var server = this.server;
    if (step > 0) {
        var back = Math.max(0, step-1);
        this.tags.first.off('click').click(function() {
            server.logEvent('explorer', 'first');
            explorer.move(0);
        });
        this.tags.back.off('click').click(function() {
            server.logEvent('explorer', 'back');
            explorer.move(back);
        });
    }
    if (step < last) {
        var next = Math.min(last, step+1);
        this.tags.last.off('click').click(function() {
            server.logEvent('explorer', 'last');
            explorer.move(last);
        });
        this.tags.next.off('click').click(function() {
            server.logEvent('explorer', 'next');
            explorer.move(next);
        });
    }
    // Update the header bar of the explorer
    this.tags.step.html(step+1);
    this.tags.length.html(last+1);
    this.clear();
    // Get the page of the traceTable at this step
    var page = this.traceTable[step];
    if (page === undefined) {
        this.tags.table.append("<tr><td colspan='3'>No data found at this step!</td></tr>");
        return;
    }
    // Update the modules list
    if (page.modules.length > 0) {
        this.tags.modules.html(page.modules.join(', '));
    } else {
        this.tags.modules.html("None");
    }
    // Update header row
    this.tags.line.html(page.line==-1 ? "Last": page.line);
    // Notify the console and editor of the new step
    this.stepConsole(step, page);
    this.stepEditor(step, page);
    // Render the properties
    for (var property in page.properties) {
        var value = page.properties[property];
        this.tags.table.append(
            $("<tr/>").append($("<td/>").text(value.name))
                      .append($("<td/>").text(value.type))
                      .append('<td><samp>'+encodeHTML(value.value)+'</samp></td>'));
    }
};

String.prototype.trunc = String.prototype.trunc ||
function(n) {
    return (this.length > n) ? this.substr(0,n-1)+'&hellip;' : this;
};

PropertyExplorer.prototype.abbreviateValue = function(value) {
    
    return encodeHTML;
}

/*
 * Clear out any existing data
 */
PropertyExplorer.prototype.clear = function() {
    this.tags.table.find("tr:gt(0)").remove();
}

PropertyExplorer.prototype.reload = function(traceTable) {
    this.traceTable = traceTable;
    this.move(-1);
    this.tags.message.hide();
}

PropertyExplorer.prototype.load = function() {
    this.tags.errors.hide();
    this.step = 0;
}