import {encodeHTML} from "./utilities";

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

const NEW_CONSOLE_LINE_HTML = "<div></div>";

/**
 *
 * @enum
 */
export let ConsoleLineType = {
    TEXT: "text",
    HTML: "html",
    PLOT: "plot",
    IMAGE: "image",
    TURTLE: "turtle",
    EVAL: "eval",
    INPUT: "input",
    TEST_CASE: "test_case"
};

class ConsoleLine {
    constructor(main, type, content) {
        this.main = main;
        this.type = type;
        this.content = content;
        this.origin = {
            filename: Sk.currFilename,
            step: main.components.engine.executionBuffer.step,
            line: main.components.engine.executionBuffer.line
        };
        this.html = $("<div></div>", {
            "class":  "blockpy-printer-output",
            "data-toggle": "tooltip",
            "data-placement": "auto",
            "data-step": this.origin.step,
            "title": "Step " + this.origin.step + ", Line " + this.origin.line
        });
        console.log(this.html.attr("title"));
        this.visible = !main.model.display.mutePrinter();
        this.index = 0;
    }

    toSkulpt() {
        return Sk.ffi.remapToJs(this.content);
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
            this.html.tooltip();
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
            let lineData = $("<samp></samp>", { "html": encodedText });
            this.html.append(lineData);
            where.append(this.html);
            this.html.tooltip();
        }
    }
}

class ConsoleLineInput extends ConsoleLine {
    constructor(main, promptMessage) {
        super(main, ConsoleLineType.INPUT, promptMessage);
    }

    /**
     * Creates an Input box for receiving input() from the user.
     *
     */
    render(where) {
        // Perform any necessary cleaning
        console.log(this.content);
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
        let submitForm = () => {
            resolveOnClick(input.val());
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
        return submittedPromise;
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

        this.DEFAULT_WIDTH = 500;
        this.DEFAULT_HEIGHT = 500;

        this.output = this.main.model.execution.output;
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
        this.tag.find(".blockpy-printer").empty();
        Sk.TurtleGraphics = {
            target: this.newTurtle(),
            width: 0,
            height: 0
        };
    };

    // TODO: turtles should be based on the current width
    newTurtle() {
        return this;
    }

    getWidth() {
        return Math.min(this.DEFAULT_WIDTH, this.printerTag.width()-40);
    }

    getHeight() {
        return Math.min(this.DEFAULT_HEIGHT, this.printerTag.height()+40);
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

    /**
     * Creates and registers a Promise from the Input box
     * @param {String} promptMessage - Message to display to the user.
     *
     */
    input(promptMessage) {
        this.inputBuffer = new ConsoleLineInput(this.main, promptMessage);
        return this.inputBuffer.render(this.printerTag);
    };



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