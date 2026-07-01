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
 */
export class BlockPyHistory {
    main: any;
    tag: any;
    currentId: number | null;
    history: any[];
    editEvents: any[];
    selector: any;

    constructor(main: any, tag: any) {
        this.main = main;
        this.tag = tag;
        this.currentId = null;
        this.history = [];
        this.editEvents = [];
    }

    load(history: any[]): void {
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
            .forEach((entry: any) => {
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
        this.selector.change(() => {
            this.updateEditor();
        });
    }

    moveToStart(): void {
        this.selector.val(0);
        this.updateEditor();
    }

    movePrevious(): void {
        let currentId = parseInt(this.selector.val(), 10);
        this.selector.val(Math.max(0, currentId-1));
        this.updateEditor();
    }

    moveNext(): void {
        let currentId = parseInt(this.selector.val(), 10);
        this.selector.val(Math.min(this.editEvents.length-1, currentId+1));
        this.updateEditor();
    }

    moveToMostRecent(): void {
        this.selector.val(this.editEvents.length-1);
        this.updateEditor();
    }

    updateEditor(): void {
        if (this.editEvents.length) {
            let currentId = parseInt(this.selector.val(), 10);
            this.main.components.pythonEditor.bm.setCode(this.editEvents[currentId].message);
        }
    }

    use(): void {
        if (this.editEvents.length) {
            let currentId = parseInt(this.selector.val(), 10);
            let code = this.editEvents[currentId].message;
            this.main.model.ui.editors.python.turnOffHistoryMode();
            this.main.components.pythonEditor.file.handle(code);
        }
    }

    isEditEvent(entry: any): boolean {
        return ((entry.event_type === "File.Edit" ||
                 entry.event_type === "File.Create") &&
                this.main.model.display.filename() === entry.file_path);
    }

    /**
     * Opens the history dialog box. This requires a trip to the server and
     * occurs asynchronously. The users' code is shown in preformatted text
     * tags (no code highlighting currently) along with the timestamp.
     */
    openDialog(): void {
        let dialog = this.main.components.dialog;
        let body = "<pre>a = 0</pre>";
        this.main.components.server.getHistory(function (data: any) {
            body = data.reverse().reduce(function (complete: string, elem: any) {
                let complete_str = prettyPrintDateTime(elem.time);
                let new_line = "<b>"+complete_str+"</b><br><pre>"+elem.code+"</pre>";
                return complete+"\n"+new_line;
            }, "");
            dialog.show("Work History", body, function() {});
        });
    }
}

const REMAP_EVENT_TYPES: Record<string, string> = {
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

function isSameDay(first: Date, second: Date): boolean {
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
function prettyPrintDateTime(timeString: string | undefined): string {
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
