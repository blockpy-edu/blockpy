export let FEEDBACK_HTML = `

<span class='blockpy-floating-feedback text-muted-less pull-right position-sticky sticky-top'
    aria-hidden="true" role="presentation" aria-label="New Feedback Alert">
    New feedback &uarr;
</span>

<div class='blockpy-feedback col-md-6 blockpy-panel'
            role="region" aria-label="Feedback"
            aria-live="polite">

    <!-- Feedback/Trace Visibility Control -->
    <button type='button'
            class='btn btn-sm btn-outline-secondary float-right'
            data-bind="click: ui.secondRow.advanceState">
        <span class='fas fa-eye'></span>
        <span data-bind="text: ui.secondRow.switchLabel"></span>
    </button>
    
    <!-- Positive Feedback Region -->
    <div class="blockpy-feedback-positive float-right">
        
    
    </div>

    <!-- Actual Feedback Region -->    
    <div>
        <strong>Feedback: </strong>
        <span class='badge blockpy-feedback-category feedback-badge'
            data-bind="css: ui.feedback.badge,
                       text: ui.feedback.category">Feedback Kind</span>
        <small data-bind="text: (100*submission.score())+'%',
                          visible: display.instructor() && execution.feedback.label()"
            class="text-muted"></small>
    </div>
    <div>
        <strong class="blockpy-feedback-label"
            data-bind="text: execution.feedback.label"></strong>
        <div class="blockpy-feedback-message"
            data-bind="html: execution.feedback.message"></div>
    </div>
</div>            
`;

export class BlockPyFeedback {

    /**
     * An object that manages the feedback area, where users are told the state of their
     * program's execution and given guidance. Also manages the creation of the Trace Table.
     *
     * @constructor
     * @this {BlockPyFeedback}
     * @param {Object} main - The main BlockPy instance
     * @param {HTMLElement} tag - The HTML object this is attached to.
     */
    constructor(main, tag) {
        this.main = main;
        this.tag = tag;

        this.feedbackModel = this.main.model.execution.feedback;

        this.category = this.tag.find(".blockpy-feedback-category");
        this.label = this.tag.find(".blockpy-feedback-label");
        this.message = this.tag.find(".blockpy-feedback-message");
        this.positive = this.tag.find(".blockpy-feedback-positive");

        // TODO: If they change the student extra files, also update the dirty flag
        this.main.model.submission.code.subscribe(() => this.main.model.display.dirtySubmission(true));
    };

    /**
     * Moves the screen (takes 1 second) to make the Feedback area visible.
     */
    scrollIntoView() {
        $("html, body").animate({
            scrollTop: this.tag.offset().top
        }, 1000);
    };

    /**
     * Determines if the feedback area is currently visible
     * @returns {boolean}
     */
    isFeedbackVisible() {
        let visibilityBuffer = 100;
        let topOfElement = this.tag.offset().top;
        //let bottomOfElement = this.tag.offset().top + this.tag.outerHeight();
        let bottomOfElement = topOfElement + visibilityBuffer;
        let bottomOfScreen = $(window).scrollTop() + $(window).height();
        let topOfScreen = $(window).scrollTop();
        //bottom_of_element -= 40; // User friendly padding
        return (
            (topOfElement < bottomOfScreen) &&
            (topOfScreen < bottomOfElement));
    };

    /**
     * Clears any output currently in the feedback area. Also resets the printer and
     * any highlighted lines in the editor.
     */
    clear() {
        this.feedbackModel.message("*Ready*");
        this.feedbackModel.category(null);
        this.feedbackModel.label(null);
        this.feedbackModel.hidden(false);
        this.feedbackModel.linesError.removeAll();
        this.feedbackModel.linesUncovered.removeAll();
        this.clearPositiveFeedback();
    };

    static findFirstErrorLine(feedbackData) {
        if (feedbackData.quick$lookup) {
            let location = feedbackData.quick$lookup(new Sk.builtin.str("location"));
            if (location) {
                let line = location.tp$getattr(new Sk.builtin.str("line"));
                if (line) {
                    return Sk.ffi.remapToJs(line);
                }
            }
        }
        return null;
        /*for (let i = feedbackData.length-1; i >= 0; i-= 1) {
            if ("position" in feedbackData[i]) {
                return feedbackData[i].position.line;
            }
        }
        return null;*/
    };

    updateRegularFeedback() {

    }

    /**
     * Updates the model with these new execution results
     * @param executionResults
     */
    updateFeedback(executionResults) {
        // Parse out data
        let message = Sk.ffi.remapToJs(executionResults.MESSAGE);
        let category = Sk.ffi.remapToJs(executionResults.CATEGORY);
        let label = Sk.ffi.remapToJs(executionResults.LABEL);
        let hide = Sk.ffi.remapToJs(executionResults.HIDE);
        let data = executionResults.DATA;
        let positives = Sk.ffi.remapToJs(executionResults.POSITIVE);

        // Override based on assignments' settings
        let hideScore = this.main.model.assignment.hidden();
        if (hideScore && category.toLowerCase() === "complete") {
            category = "no errors";
            label = "No errors";
            message = "No errors reported.";
        }

        // Remap to expected BlockPy labels
        if (category.toLowerCase() === "instructor" && label.toLowerCase() === "explain") {
            label = "Instructor Feedback";
        }

        // Don't present a lack of error as being incorrect
        if (category === "Instructor" && label === "No errors") {
            category = "no errors";
        }

        // Update model accordingly
        message = this.main.utilities.markdown(message).replace(/<pre>\n/g, "<pre>\n\n");
        this.feedbackModel.message(message);
        this.feedbackModel.category(category);
        this.feedbackModel.label(label);
        //let highlightTimeout = setTimeout(() => {
        this.message.find("pre code").map( (i, block) => {
            window.hljs.highlightBlock(block);
        });
        //}, 400);
        // TODO: Instead of tracking student file, let's track the instructor file
        this.main.components.server.logEvent("Intervention", category, label, message, "answer.py");

        // Clear out any previously highlighted lines
        this.main.components.pythonEditor.bm.clearHighlightedLines();

        // Find the first error on a line and report that
        let line = BlockPyFeedback.findFirstErrorLine(data);
        this.feedbackModel.linesError.removeAll();
        if (line !== null && line !== undefined) {
            this.feedbackModel.linesError.push(line);
        }

        // Invert the set of traced lines
        let studentReport = this.main.model.execution.reports.student;
        this.feedbackModel.linesUncovered.removeAll();
        if (studentReport.success) {
            let uncoveredLines = [];
            this.main.model.execution.reports.parser.lines.forEach((line) => {
                if (studentReport.lines.indexOf(line) === -1) {
                    uncoveredLines.push(line);
                }
            });
            this.feedbackModel.linesUncovered(uncoveredLines);
        }

        for (let i=0; i<positives.length; i+=1) {
            let positiveData = positives[i];
            this.addPositiveFeedback(positiveData.message, "star", "green", () => this.main.components.dialog.POSITIVE_FEEDBACK_FULL(positiveData.title, positiveData.message));
        }
    }

    clearPositiveFeedback() {
        this.positive.empty();
        this.main.model.configuration.container.find(".blockpy-student-error").hide();
    }

    addPositiveFeedback(text, icon, color, onclick, toEnd) {
        let positive = $("<span></span>");
        positive.addClass("blockpy-feedback-positive-icon fas fa-"+icon);
        positive.css("color", color);
        positive.attr("title", text);
        if (toEnd) {
            this.positive.append(positive);
        } else {
            this.positive.prepend(positive);
        }
        positive.tooltip({"trigger": "hover", "container": this.main.model.configuration.attachmentPoint});
        if (onclick !== undefined) {
            positive.click(onclick);
        }
        positive.hover(() => {
            this.main.components.server.logEvent("X-Feedback", "positive", "hover", text, "");
        });
    }

    /**
     * Present any accumulated feedback
     */
    presentFeedback(executionResults) {
        this.updateFeedback(executionResults);

        // TODO: Logging
        //this.main.components.server.logEvent("feedback", category+"|"+label, message);

        this.notifyFeedbackUpdate();
    };

    notifyFeedbackUpdate() {
        if (!this.isFeedbackVisible()) {
            this.tag.find(".blockpy-floating-feedback").show().fadeOut(7000);
            this.scrollIntoView();
        }
    };

    presentRunError(error, just_return) {
        if (just_return === undefined) {
            just_return = false;
        }
        let message, label, category, lineno;
        label = error.tp$name;
        category = "runtime";
        message = this.convertSkulptError(error);

        if (just_return) {
            return message;
        }
        this.feedbackModel.message(message);
        this.feedbackModel.category(category);
        this.feedbackModel.label(label);
        this.feedbackModel.linesError.removeAll();
        if (lineno !== undefined && lineno !== null) {
            this.feedbackModel.linesError.push(lineno);
        }
    }

    convertSkulptError(error, filenameExecuted) {
        let name = error.tp$name;
        let args = Sk.ffi.remapToJs(error.args);
        let top = `${name}: ${args[0]}\n<br>\n<br>`;
        let traceback = "";
        if (error.traceback && error.traceback.length) {
            traceback = "Traceback:<br>\n" + error.traceback.map(frame => {
                let lineno = frame.lineno;
                if (frame.filename.slice(0, -3) === filenameExecuted) {
                    lineno -= this.main.model.execution.reports.instructor.lineOffset;
                }
                let file = `File <code class="filename">"${frame.filename}"</code>, `;
                let line = `on line <code class="lineno">${lineno}</code>, `;
                let scope = (frame.scope !== "<module>" &&
                frame.scope !== undefined) ? `in scope ${frame.scope}` : "";
                let source = "";
                if (frame.source !== undefined) {
                    source = `\n<pre><code>${frame.source}</code></pre>`;
                }
                return file + line + scope + source;
            }).join("\n<br>");
            traceback = `${traceback}`;
        }
        return top+"\n"+traceback;
    }

    presentInternalError(error, filenameExecuted) {
        this.main.model.execution.feedback.category("internal");
        this.main.model.execution.feedback.label("Internal Error");

        let message = "Error in instructor feedback. Please show the following to an instructor:<br>\n";
        message += this.convertSkulptError(error, filenameExecuted);
        this.main.model.execution.feedback.message(message);

        this.notifyFeedbackUpdate();
    }
}