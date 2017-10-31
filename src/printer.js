/**
 * An object for managing the console where printing and plotting is outputed.
 *
 * @constructor
 * @this {BlockPyEditor}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
function BlockPyPrinter(main, tag) {
    this.main = main;
    this.tag = tag;
    
    /** Keep printer settings available for interested parties */
    this.printerSettings = {};
    
    this.resetPrinter();
};

/**
 * Reset the status of the printer, including removing any text in it and
 * fixing its size.
 */
BlockPyPrinter.prototype.resetPrinter = function() {
    this.tag.empty();
    this.main.model.execution.output.removeAll();
    this.printerSettings['width'] = Math.min(500, this.tag.width()-40);
    this.printerSettings['height'] = Math.min(500, this.tag.height()+40);
    Sk.TurtleGraphics = {'target': this.tag[0], 
                         'width': this.printerSettings['width']-40, 
                         'height': this.printerSettings['height']-40};
}

/**
 * Update and return the current configuration of the printer. This 
 * involves calculating its size, among other operations.
 *
 * @returns {Object} Returns an object with information about the printer.
 */
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

/**
 * Update and return a static disabled configuration of the printer. This 
 * printer will be unable to do most tasks.
 *
 * @returns {Object} Returns an object with information about the printer.
 */
BlockPyPrinter.getDisabledConfiguration = function() {
    var printerSettings = {}
    printerSettings['printHtml']= function(html, value) { console.log(html, value);};
    printerSettings['width']= 500;
    printerSettings['pngMode']= false;
    printerSettings['skipDrawing']= true;
    printerSettings['height']= 500;
    printerSettings['container']= null;
    return printerSettings;
}

/**
 * Updates each printed element in the printer and makes it hidden
 * or visible, depending on what step we're on.
 *
 * @param {Number} step - The current step of the executed program that we're on; each element in the printer must be marked with a "data-step" property to resolve this.
 * @param {Number} page - Deprecated, not sure what this even does.
 */
BlockPyPrinter.prototype.stepPrinter = function(step, page) {
    $(this.printer).find('.blockpy-printer-output').each(function() {
        if ($(this).attr("data-step") <= step) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}

/**
 * Print a successful line to the on-screen printer.
 * @param {String} lineText - A line of text to be printed out.
 */
BlockPyPrinter.prototype.print = function(lineText) {
    // Should probably be accessing the model instead of a component...
    var stepNumber = this.main.components.engine.executionBuffer.step;
    var lineNumber = this.main.components.engine.executionBuffer.line_number;
    // Perform any necessary cleaning
    if (lineText !== "\n") {
        this.main.model.execution.output.push(lineText.slice(0, -1));
        var encodedText = encodeHTML(lineText);
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

/**
 * Prints a successful HTML blob to the printer. This is typically charts,
 * but it can actually be any kind of HTML. This will probably be useful for
 * doing Turtle and Processing stuff down the road.
 * 
 * @param {HTML} html - A blob of HTML to render in the tag
 * @param {Anything} value - a value to push on the outputList for comparison. For instance, on charts this is typically the data of the chart.
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

/**
 * Creates an Input box for receiving input() from the user.
 * 
 * @param {String} promptMessage - a message to render before the input
 * @returns {String} Returns the handle on the message box.
 */
BlockPyPrinter.prototype.printInput = function(promptMessage) {
    // Should probably be accessing the model instead of a component...
    var stepNumber = this.main.components.engine.executionBuffer.step;
    var lineNumber = this.main.components.engine.executionBuffer.line_number;
    // Perform any necessary cleaning
    if (promptMessage !== "\n") {
        var encodedText = encodeHTML(promptMessage);
        if (!(this.main.model.settings.mute_printer())) {
            var inputForm = $("<input type='text' />");
            var inputMsg = $("<samp></samp>",  {"html": encodedText})
            var inputBtn = $("<button></button>", {"html": "Enter"});
            var inputBox = $("<div></div>",
                    {
                        'data-toggle': 'tooltip',
                        'class': 'blockpy-printer-output',
                        'data-placement': 'left',
                        'data-step': stepNumber,                                
                        'title': "Step "+stepNumber + ", Line "+lineNumber
                    });
            inputBox.append(inputMsg)
                    .append($("<br>"))
                    .append(inputForm)
                    .append(inputBtn);
            this.tag.append(inputBox);
            inputBox.tooltip();
            return {'input': inputForm, 'button': inputBtn, 'promise': true};
        }
    }
    return {'promise': false}
}

if (typeof exports !== 'undefined') {
    exports.BlockPyPrinter = BlockPyPrinter;
}