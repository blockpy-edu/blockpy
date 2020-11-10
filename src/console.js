import {encodeHTML} from "./utilities";

/**
 * Evaluate button HTML template
 * @type {string}
 */
const START_EVAL_HTML = `
<button type="button" class="btn btn-sm btn-outline float-right blockpy-btn-eval">
    Evaluate
</button>`;

/**
 * HTML template for a new line in the console.
 * @type {string}
 */
const NEW_CONSOLE_LINE_HTML = "<div></div>";

/**
 * HTML template for the entire console area
 * @type {string}
 */
export const CONSOLE_HTML = `
    <div class='col-md-6 blockpy-panel blockpy-console'
          role="region" aria-label="Console"
          data-bind="class: ui.console.size">
          
        <!-- Feedback/Trace Visibility Control -->
        <button type='button'
                class='btn btn-sm btn-outline-secondary float-right blockpy-show-feedback'
                data-bind="hidden: ui.secondRow.isConsoleShowVisible, click: ui.secondRow.advanceState">
            <span class='fas fa-eye'></span>
        </button>
          
        <strong>Console:</strong>
        
        <div class='blockpy-printer blockpy-printer-default'>
        </div>
        
     </div>`;

/**
 * All the possible types for a line in the console.
 * @enum
 */
export let ConsoleLineType = {
    TEXT: "text",
    HTML: "html",
    PLOT: "plot",
    IMAGE: "image",
    TURTLE: "turtle",
    EVAL: "eval",
    START_EVAL: "start_eval",
    VALUE: "value",
    INPUT: "input",
    TEST_CASE: "test_case"
};

/**
 * Abstract version of a line in the console. All other console lines
 * should extend this class. Critically, they need to implement a render function.
 */
class ConsoleLine {
    constructor(main, type, content) {
        /**
         * Reference back to the main BlockPy instance.
         * @const
         * @type {BlockPy}
         */
        this.main = main;
        /**
         * Categorizes what kind of line this is (text/html/plot/etc.)
         * @type {ConsoleLineType}
         */
        this.type = type;
        /**
         * The actual data stored on this line.
         * @type {string}
         */
        this.content = content;
        /**
         * Metadata about where the line originated from in the code.
         * @type {{filename: string, line: number, step: number}}
         */
        this.origin = {
            filename: Sk.currFilename,
            step: main.components.engine.executionBuffer.step,
            line: main.components.engine.executionBuffer.line
        };
        /**
         * The HTML content stored on this line, meant to be rendered
         * to the user.
         * @type {*|jQuery.fn.init|jQuery|HTMLElement}
         */
        this.html = $("<div></div>", {
            "class":  "blockpy-printer-output",
            "data-container": main.model.configuration.attachmentPoint,
            "data-toggle": "tooltip",
            "data-placement": "auto",
            "data-step": this.origin.step,
            "title": "Step " + this.origin.step + ", Line " + this.origin.line
        });
        /**
         * Whether or not this line should be visible
         * @type {boolean}
         */
        this.visible = !main.model.display.mutePrinter();
        /**
         *
         * @type {number}
         */
        this.index = 0;
    }

    /**
     * Create a Skulpt representation of this console line's content.
     * @returns {*}
     */
    toSkulpt() {
        return Sk.ffi.remapToPy(this.content);
    }

    /**
     * Remove this console line by deleting its HTML representation.
     */
    delete() {
        this.html.remove();
    }
}

class ConsoleLineTurtle extends ConsoleLine {
    // TODO: Capture turtle commands for tracing purposes
    constructor(main) {
        super(main, ConsoleLineType.TURTLE);
        this.html.addClass("blockpy-console-turtle-output");
    }

    render(where) {
        if (this.visible) {
            where.prepend(this.html);
            //this.html[0].scrollIntoView({ behavior: "smooth" });
            var top = this.html.position().top;
            //$('html').scrollTop(top);
            $("html").scrollTop(0);
            //this.html.tooltip();
        }
    }
}

class ConsoleLineImage extends ConsoleLine {
    constructor(main, content) {
        super(main, ConsoleLineType.IMAGE, content);
        this.html.addClass("blockpy-console-image-output");
    }

    render(where) {
        if (this.visible) {
            console.log(this.content);
            this.html.append(this.content);
            where.append(this.html);
            //this.html.tooltip();
        }
    }
}

class ConsoleLinePlot extends ConsoleLine {
    constructor(main, content) {
        super(main, ConsoleLineType.PLOT, content);
        this.html.addClass("blockpy-console-plot-output");
    }

    render(where) {
        if (this.visible) {
            where.append(this.html);
            //this.html.tooltip();
        }
    }
}

class ConsoleLineText extends ConsoleLine {

    addContent(content) {
        this.content = this.content + content;
    }

    render(where) {
        if (this.visible) {
            let encodedText = encodeHTML(this.content);
            if (!encodedText || encodedText.trim().length <= 0) {
                encodedText = "\n";
            }
            let lineData = $("<samp></samp>", { "html": encodedText });
            this.html.append(lineData);
            where.append(this.html);
            this.html.tooltip();
        }
    }
}

class ConsoleLineValue extends ConsoleLine {

    constructor(main, content) {
        super(main, ConsoleLineType.VALUE, content);
    }

    render(where) {
        if (this.visible) {
            let encodedText = encodeHTML(this.content);
            let lineData = $("<code></code>", { "html": encodedText });
            this.html.append(lineData);
            where.append(this.html);
            this.html.tooltip();
        }
    }
}

class ConsoleLineInput extends ConsoleLine {
    constructor(main, promptMessage) {
        super(main, ConsoleLineType.INPUT, promptMessage);
        this.visible = true;
    }

    /**
     * Creates an Input box for receiving input() from the user.
     *
     */
    render(where) {
        // Perform any necessary cleaning
        if (this.visible) {
            // Input form
            let inputForm = $("<input type='text' />");
            // Enter button
            let inputBtn = $("<button></button>", {"html": "Enter"});
            // Group form and button
            let inputGroup = $("<div></div>", {"class": "blockpy-console-input"});
            inputGroup.append(inputForm);
            inputGroup.append(inputBtn);
            // Prompt box, new line, input group
            let inputBox = $("<div></div>");
            if (this.content !== "\n") {
                let encodedText = encodeHTML(this.content);
                let inputMsg = $("<samp></samp>",  {"html": encodedText});
                inputBox.append(inputMsg);
            }
            inputBox.append($("<br>"))
                .append(inputGroup);
            // Render
            this.html.append(inputBox);
            where.append(this.html);
            // Make it interactive
            return this.makeInteractive(inputForm, inputBtn);
        }
        return "";
    };

    makeInteractive(input, button) {
        let resolveOnClick;
        let submittedPromise = new Promise((resolve) => {
            resolveOnClick = resolve;
        });
        let inputIndex = this.main.model.execution.inputIndex();
        let submitForm = () => {
            let userInputtedValue = input.val();
            Sk.queuedInput.push(userInputtedValue);
            this.main.model.execution.inputIndex(inputIndex+1);
            this.main.model.execution.input().push(userInputtedValue);
            resolveOnClick(userInputtedValue);
            input.prop("disabled", true);
            button.prop("disabled", true);
            this.html.tooltip();
        };
        button.click(submitForm);
        input.keyup((e) => {
            if (e.keyCode === 13) {
                submitForm();
            }
        });
        input.focus();
        if (inputIndex < this.main.model.execution.input().length) {
            let userInputtedValue = this.main.model.execution.input()[inputIndex];
            input.val(userInputtedValue);
            this.main.model.execution.inputIndex(inputIndex+1);
            return new Promise((resolve) => {
                input.prop("disabled", true);
                button.prop("disabled", true);
                this.html.tooltip();
                resolve(userInputtedValue);
            });
        }
        return submittedPromise;
    }
}

class ConsoleLineEvaluate extends ConsoleLineInput {
    constructor(main) {
        super(main, "Evaluate:");
    }
}

class ConsoleLineStartEvaluate extends ConsoleLine {
    constructor(main) {
        super(main, ConsoleLineType.START_EVAL);
        this.html.append($(START_EVAL_HTML));
        this.html.click(() => {
            this.main.model.ui.execute.evaluate();
            this.delete();
        });
    }

    render(where) {
        where.append(this.html);
    }
}

export class BlockPyConsole {

    /**
     * An object for managing the console, with features for things like printing, plotting, evaling, inputing.
     * The "printer" is the region where we put things, as opposed to the console as a whole.
     *
     * @constructor
     * @param {Object} main - The main BlockPy instance
     * @param {HTMLElement} tag - The HTML object this is attached to.
     */
    constructor (main, tag) {
        this.main = main;
        this.tag = tag;
        this.printerTag = tag.find(".blockpy-printer");

        this.MINIMUM_WIDTH = 200;
        this.MINIMUM_HEIGHT = 200;
        this.DEFAULT_HEIGHT = this.printerTag.height(); // Let CSS define this
        this.main.model.display.previousConsoleHeight(this.DEFAULT_HEIGHT);

        this.output = this.main.model.execution.output;
        //this.input = this.main.model.execution.input;
        this.settings = {};
        this.clear();

        // TODO: If the user modifies a file, then make the console look faded a little
    };

    /**
     * Reset the status of the printer, including removing any text in it and
     * fixing its size.
     */
    clear() {
        this.output.removeAll();

        this.lineBuffer = null;
        this.plotBuffer = null;
        this.printerTag.empty();
        // If the user hasn't changed the console size, we'll reset it
        if (this.main.model.display.previousConsoleHeight() === this.printerTag.height()) {
            this.printerTag.height(this.DEFAULT_HEIGHT);
            this.main.model.display.previousConsoleHeight(this.printerTag.height());
        }

        this.turtleLine = null;
        Sk.TurtleGraphics = {
            target: this.getTurtleLine.bind(this),
            width: this.getWidth(),
            height: this.getHeight(),
            assets: this.loadAsset.bind(this)
        };
    };

    loadAsset(name) {
        return name;
    }

    getTurtleLine() {
        if (this.turtleLine === null) {
            this.turtleLine = new ConsoleLineTurtle(this.main);
            this.turtleLine.render(this.printerTag);
            // If the user hasn't changed the console size, we'll do so
            if (this.main.model.display.previousConsoleHeight() === this.printerTag.height()) {
                let currentPrinterDimension = this.printerTag.width();
                this.printerTag.height(currentPrinterDimension);
                this.main.model.display.previousConsoleHeight(this.printerTag.height());
                Sk.TurtleGraphics.height = currentPrinterDimension-40;
            }
        }
        return this.turtleLine.html[0];
    }

    finishTurtles() {
        if (this.main.model.assignment.settings.saveTurtleOutput()) {
            let canvas = this.turtleLine.html.find("canvas").last()[0];
            let ctx = canvas.getContext("2d");
            let img = new Image();
            let dataUrl = canvas.toDataURL("image/png");
            this.main.components.server.saveImage("turtle_output", dataUrl);
        }
    }

    // TODO: turtles should be based on the current width
    newTurtle() {
        return this;
    }

    getWidth() {
        return Math.max(this.MINIMUM_WIDTH, this.printerTag.width()-40);
    }

    getHeight() {
        return Math.max(this.MINIMUM_HEIGHT, this.printerTag.height()+40);
    }

    isMuted() {
        return this.main.model.display.mutePrinter();
    }

    /**
     * Updates each printed element in the printer and makes it hidden
     * or visible, depending on what step we're on.
     *
     * @param {Number} step - The current step of the executed program that we're on; each element in the printer must be marked with a "data-step" property to resolve this.
     * @param {Number} page - Deprecated, not sure what this even does.
     */
    stepPrinter(step, page) {
        this.printerTag.find(".blockpy-printer-output").each(function() {
            if ($(this).attr("data-step") <= step) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    };

    /**
     * Print a line to the on-screen printer.
     * @param {String} lineText - A line of text to be printed out.
     */
    print(lineText) {
        // Empty strings means do nothing.
        // print("", end="")
        if (!lineText) {
            return;
        }
        let flush = false;
        if (lineText.charAt(lineText.length-1) === "\n") {
            flush = true;
        }
        let splitLines = lineText.split("\n");
        if (this.lineBuffer === null) {
            this.lineBuffer = new ConsoleLineText(this.main, ConsoleLineType.TEXT, splitLines[0]);
        } else {
            this.lineBuffer.addContent(splitLines[0]);
        }
        for (let i=1; i < splitLines.length-1; i++) {
            this.output.push(this.lineBuffer);
            this.lineBuffer.render(this.printerTag);
            this.lineBuffer = new ConsoleLineText(this.main, ConsoleLineType.TEXT, splitLines[i]);
        }
        if (flush) {
            this.output.push(this.lineBuffer);
            this.lineBuffer.render(this.printerTag);
            this.lineBuffer = null;
        }
    };


    plot(plots) {
        this.plotBuffer = new ConsoleLinePlot(this.main, plots);
        this.plotBuffer.render(this.printerTag);
        return this.plotBuffer;
    }

    printPILImage(imageData) {
        console.log("TEST", imageData.image);
        this.imageBuffer = new ConsoleLineImage(this.main, imageData.image);
        this.imageBuffer.render(this.printerTag);
        return this.imageBuffer;
    }

    printValue(value) {
        let printedValue = new ConsoleLineValue(this.main, value);
        printedValue.render(this.printerTag);
        return printedValue;
    }

    /**
     * Creates and registers a Promise from the Input box
     * @param {String} promptMessage - Message to display to the user.
     *
     */
    input(promptMessage) {
        this.inputBuffer = new ConsoleLineInput(this.main, promptMessage);
        return this.inputBuffer.render(this.printerTag);
    };


    evaluate() {
        this.inputBuffer = new ConsoleLineEvaluate(this.main);
        return this.inputBuffer.render(this.printerTag);
    }

    beginEval() {
        let startEvaluation = new ConsoleLineStartEvaluate(this.main);
        return startEvaluation.render(this.printerTag);
    }

    /**
     * Unconditionally scroll to the bottom of the window.
     *
     */
    scrollToBottom() {
        this.tag.animate({
            scrollTop: this.tag.prop("scrollHeight") - this.tag.prop("clientHeight")
        }, 500);
    };

}