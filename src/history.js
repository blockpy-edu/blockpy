// TODO: Should disable buttons if we can't activate them.

export const HISTORY_TOOLBAR_HTML = `
<div class="blockpy-history-toolbar col-md-12" data-bind="visible: display.historyMode">

    <form class="form-inline">
        <button class="blockpy-history-start btn btn-outline-secondary mr-2" type="button"
            data-bind="click: ui.editors.python.history.start">
            <span class='fas fa-step-backward'></span> Start
        </button>
        <button class="btn btn-outline-secondary mr-2" type="button"
            data-bind="click: ui.editors.python.history.previous">
            <span class='fas fa-backward'></span> Previous
        </button>
        <select class="blockpy-history-selector form-control custom-select mr-2" aria-title="History Selector">
        </select>
        <button class="btn btn-outline-secondary mr-2" type="button"
            data-bind="click: ui.editors.python.history.use">
            <span class='fas fa-file-import'></span> Use
        </button>
        <button class="btn btn-outline-secondary mr-2" type="button"
            data-bind="click: ui.editors.python.history.next">
            <span class='fas fa-forward'></span> Next
        </button>
        <button class="btn btn-outline-secondary" type="button"
            data-bind="click: ui.editors.python.history.mostRecent">
            <span class='fas fa-step-forward'></span> Most Recent
        </button>
    </form>
</div>
`;

/**
 * An object for displaying the user's coding logs (their history).
 * A lightweight component, its only job is to open a dialog.
 *
 * @constructor
 * @this {BlockPyHistory}
 * @param {Object} main - The main BlockPy instance
 */
export class BlockPyHistory {
    constructor(main, tag) {
        this.main = main;
        this.tag = tag;
        this.currentId = null;
        this.history = [];
        this.editEvents = [];
    }

    load(history) {
        this.history = history;
        this.editEvents = [];
        this.selector = $(".blockpy-history-selector").empty();
        let editId = 0;
        history
            .filter((entry) => (
                !entry.file_path.startsWith("_instructor.") &&
                    entry.event_type !== "Compile" &&
                    entry.event_type !== "Intervention" &&
                    (!this.main.model.assignment.hidden() || entry.event_type !== "X-Submission.LMS")
            ))
            .forEach((entry, index) => {
                let event_type = REMAP_EVENT_TYPES[entry.event_type] || entry.event_type;
                let displayed = prettyPrintDateTime(entry.client_timestamp) +" - "+event_type;
                let disable = (entry.event_type !== "File.Edit");
                let option = $("<option></option>", {text: displayed, disabled: disable});
                if (this.isEditEvent(entry)) {
                    option.attr("value", editId);
                    this.editEvents.push(entry);
                    editId += 1;
                }
                this.selector.append(option);
            });
        this.selector.val(Math.max(0, editId-1));
        this.selector.change((evt) => {
            this.updateEditor();
        });
    }

    moveToStart() {
        this.selector.val(0);
        this.updateEditor();
    }

    movePrevious() {
        let currentId = parseInt(this.selector.val(), 10);
        this.selector.val(Math.max(0, currentId-1));
        this.updateEditor();
    }

    moveNext() {
        let currentId = parseInt(this.selector.val(), 10);
        this.selector.val(Math.min(this.editEvents.length-1, currentId+1));
        this.updateEditor();
    }

    moveToMostRecent() {
        this.selector.val(this.editEvents.length-1);
        this.updateEditor();
    }

    updateEditor() {
        if (this.editEvents.length) {
            let currentId = parseInt(this.selector.val(), 10);
            this.main.components.pythonEditor.bm.setCode(this.editEvents[currentId].message);
        }
    }

    use() {
        if (this.editEvents.length) {
            let currentId = parseInt(this.selector.val(), 10);
            let code = this.editEvents[currentId].message;
            this.main.model.ui.editors.python.turnOffHistoryMode();
            this.main.components.pythonEditor.file.handle(code);
        }
    }

    isEditEvent(entry) {
        return ((entry.event_type === "File.Edit" ||
                 entry.event_type === "File.Create") &&
                this.main.model.display.filename() === entry.file_path);
    }

}

const REMAP_EVENT_TYPES = {
    "Session.Start": "Began session",
    "X-IP.Change": "Changed IP address",
    "File.Edit": "Edited code",
    "File.Create": "Started assignment",
    "Run.Program": "Ran program",
    "Compile.Error": "Syntax error",
    "X-Submission.LMS": "Updated grade"
};

const monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "June", "July",
    "Aug", "Sept", "Oct",
    "Nov", "Dec"
];
const weekDays = [
    "Sun", "Mon", "Tue",
    "Wed", "Thu", "Fri",
    "Sat"
];

function isSameDay(first, second) {
    return first.getDate() === second.getDate() &&
        first.getMonth() === second.getMonth() &&
        first.getFullYear() === second.getFullYear();
}

/**
 * Helper function to parse a date/time string and rewrite it as something
 * more human readable.
 * @param {String} timeString - the string representation of time ("YYYYMMDD HHMMSS")
 * @returns {String} - A human-readable time string.
 */
function prettyPrintDateTime(timeString) {
    /*let year = timeString.slice(0, 4),
        month = parseInt(timeString.slice(4, 6), 10)-1,
        day = timeString.slice(6, 8),
        hour = timeString.slice(9, 11),
        minutes = timeString.slice(11, 13),
        seconds = timeString.slice(13, 15);*/
    // TODO: Handle timezones correctly
    if (timeString === undefined) {
        return "Undefined Time";
    }
    let now = new Date();
    let past = new Date(parseInt(timeString, 10));
    if (isSameDay(now, past)) {
        return "Today at "+past.toLocaleTimeString();
    } else {
        let dayStr = weekDays[past.getDay()];
        let monthStr = monthNames[past.getMonth()];
        let date = dayStr + ", " + monthStr + " " + past.getDate();
        if (now.getFullYear() === past.getFullYear()) {
            return date + " at "+past.toLocaleTimeString();
        } else {
            return date + ", "+past.getFullYear() + " at "+past.toLocaleTimeString();
        }
    }
}


/**
 * Opens the history dialog box. This requires a trip to the server and
 * occurs asynchronously. The users' code is shown in preformatted text
 * tags (no code highlighting currently) along with the timestamp.
 */
BlockPyHistory.prototype.openDialog = function() {
    var dialog = this.main.components.dialog;
    var body = "<pre>a = 0</pre>";
    this.main.components.server.getHistory(function (data) {
        body = data.reverse().reduce(function (complete, elem) { 
            var complete_str = prettyPrintDateTime(elem.time);
            var new_line = "<b>"+complete_str+"</b><br><pre>"+elem.code+"</pre>";
            return complete+"\n"+new_line;
        }, "");
        dialog.show("Work History", body, function() {});
    });
};