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

    <!-- Actual Feedback Region -->    
    <div>
        <strong>Feedback: </strong>
        <span class='badge blockpy-feedback-category feedback-badge'
            data-bind="css: ui.feedback.badge,
                       text: ui.feedback.category">Feedback Kind</span>
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
        let top_of_element = this.tag.offset().top;
        let bottom_of_element = this.tag.offset().top + this.tag.outerHeight();
        let bottom_of_screen = $(window).scrollTop() + $(window).height();
        let top_of_screen = $(window).scrollTop();
        //bottom_of_element -= 40; // User friendly padding
        return ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element));
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
    };

    static findFirstErrorLine(feedbackData) {
        for (let i = feedbackData.length-1; i >= 0; i-= 1) {
            if ("position" in feedbackData[i]) {
                return feedbackData[i].position.line;
            }
        }
        return null;
    };

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
        let data = Sk.ffi.remapToJs(executionResults.DATA);

        // Override based on assignments' settings
        let hideScore = this.main.model.assignment.hidden();
        if (hideScore && category.toLowerCase() === "complete") {
            category = "no errors";
            label = "No errors";
            message = "No errors reported";
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
        message = this.main.utilities.markdown(message);
        this.feedbackModel.message(message);
        this.feedbackModel.category(category);
        this.feedbackModel.label(label);

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
            for (let i=0; i <= this.main.model.execution.student.lastLine; i++) {
                if (studentReport.lines.indexOf(i) === -1) {
                    this.feedbackModel.linesUncovered.push(i);
                }
            }
        }
    }

    /**
     * Present any accumulated feedback
     */
    presentFeedback(executionResults) {
        this.updateFeedback(executionResults);

        // TODO: Logging
        //this.main.components.server.logEvent("feedback", category+"|"+label, message);

        if (!this.isFeedbackVisible()) {
            this.notifyFeedbackUpdate();
            this.scrollIntoView();
        }
    };

    notifyFeedbackUpdate() {
        this.tag.find(".blockpy-floating-feedback").show().fadeOut(7000);
    };

    presentInternalError(error, filenameExecuted) {
        console.error(error);
        this.main.model.execution.feedback.category("internal");
        this.main.model.execution.feedback.label("Internal Error");
        let message = `
            Error in instructor feedback.
            Please show the following to an instructor:
            
            <pre><strong>${error.tp$name}</strong>: ${Sk.ffi.remapToJs(error.args)}</pre>`;

        if (error.traceback && error.traceback.length) {
            let tracebackFormatted= error.traceback.map(frame =>
                `File <span class="filename">"${frame.filename}"</span>, line <span class="lineno">${frame.lineno}</span>\n`).join("");
            message += `<pre>${tracebackFormatted}</pre>`;
            let last_traceback = error.traceback.slice(-1)[0];
            if (last_traceback.filename === filenameExecuted) {
                last_traceback.lineno -= this.main.model.execution.reports.instructor.line_offset;
            }
            console.error(error);
        }
        this.main.model.execution.feedback.message(message);
    }
}