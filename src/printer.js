/**
 * Printer
 * Responsible for maintaining the list of elements in the printer console.
 */

function BlockPyPrinter(main, tag) {
    this.main = main;
    this.tag = tag;
    this.printerSettings = {};
    
    this.loadPrinter();
};

BlockPyPrinter.prototype.loadPrinter = function() {
    this.resetPrinter();
}

BlockPyPrinter.prototype.resetPrinter = function() {
    this.tag.empty();
    this.main.model.execution.output.removeAll();
    this.printerSettings['width'] = Math.min(500, this.tag.width()-40);
    this.printerSettings['height'] = Math.min(500, this.tag.height()+40);
}

BlockPyPrinter.prototype.getConfiguration = function() {
    var printer = this;
    this.printerSettings['printHtml']= function(html, value) { printer.printHtml(html, value);};
    this.printerSettings['width']= Math.min(500, this.tag.width()-40);
    this.printerSettings['pngMode']= true;
    this.printerSettings['skipDrawing']= false;
    this.printerSettings['height']= Math.min(500, this.tag.height()+40);
    this.printerSettings['container']= this.tag[0];
    return this.printerSettings;
}

BlockPyPrinter.prototype.stepPrinter = function(step, page) {
    $(this.printer).find('.blockpy-printer-output').each(function() {
        if ($(this).attr("data-step") <= step) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

/*
 * Print a successful line to the on-screen printer.
 */
BlockPyPrinter.prototype.print = function(lineText) {
    var stepNumber = this.main.model.execution.step();
    var lineNumber = this.main.model.execution.line_number();
    // Perform any necessary cleaning
    if (lineText !== "\n") {
        var encodedText = encodeHTML(lineText);
        this.main.model.execution.output.push(encodedText.trim());
        if (!(this.main.model.settings.mute_printer())) {
            var lineContainer = $("<div class='blockpy-printer-output' >");
            var lineData = $("<samp></samp>", {
                'data-toggle': 'tooltip',
                'data-placement': 'left',
                'data-step': stepNumber,
                "html": encodedText,
                'title': "Step "+stepNumber + ", Line "+lineNumber,
            })
            lineContainer.append(lineData);
            // Append to the current text
            this.tag.append(lineContainer);
            lineData.tooltip();
        }
    }
}

/*
 *
 * html: A blob of HTML to render in the tag
 * value: a value to push on the outputList for comparison
 */
BlockPyPrinter.prototype.printHtml = function(chart, value) {
    var step = this.main.model.execution.step();
    var line = this.main.model.execution.line_number();
    this.main.model.execution.output.push(value);
    if (!(this.main.model.settings.mute_printer())) {
        var outerDiv = $(Sk.console.png_mode ? chart : chart[0]);//.parent();
        outerDiv.parent().show();
        outerDiv.attr({
            "data-toggle": 'tooltip',
            "data-placement": 'left',
            //"data-container": '#'+chart.attr("id"),
            "class": "blockpy-printer-output",
            "data-step": step,
            "title": "Step "+step+", Line "+line
        });
        outerDiv.tooltip();
    }
}