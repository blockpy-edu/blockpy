/**
 * Panel for editing the set of Sample Submissions.
 * These are not provided at all to students without the Grader role.
 */

import {AbstractEditor} from "./abstract_editor";

export const SubmissionStatuses = {
    UNKNOWN: "unknown",
    PASSED: "passed",
    FAILED: "failed",
    ERROR: "error",
    SKIPPED: "skipped"
};

export class SampleSubmission {
    constructor(name, status, code) {
        this.name = name;
        this.status = status;
        this.code = code;
    }

    static Blank(count) {
        return new SampleSubmission("Untitled"+(count || 1),
                                    SubmissionStatuses.UNKNOWN, "a=0");
    }

    static deserialize(data) {
        return new SampleSubmission(data.name, data.status, data.code);
    }

    serialize() {
        return {
            name: this.name,
            status: this.status,
            code: this.code
        };
    }
}

export const SAMPLE_SUBMISSIONS_HTML = `
<div>
    <div data-bind="foreach: {data: assignment.sampleSubmissions}"
        class="row">
        <div class="col-md-6">
            <span data-bind="text: name"></span>
            <textarea class="blockpy-editor-sample-submissions-code"
                data-bind="codeMirrorInstance: code"></textarea>
        </div>
        <div class="col-md-6">
            <span data-bind="text: status"></span>        
        </div>
    </div>
</div>
`;

ko.bindingHandlers.codeMirrorInstance = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
        console.log("INIT");
        let cm = CodeMirror.fromTextArea(element, {
            showCursorWhenSelecting: true,
            lineNumbers: true,
            firstLineNumber: 1,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            extraKeys: {
                "Tab": "indentMore",
                "Shift-Tab": "indentLess",
                "Esc": function (cm) {
                    if (cm.getOption("fullScreen")) {
                        cm.setOption("fullScreen", false);
                    } else {
                        cm.display.input.blur();
                    }
                },
                "F11": function (cm) {
                    cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                }
            }
        });
        cm.setSize("100%", "100px");
        return cm;
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever any observables/computeds that are accessed change
        // Update the DOM element based on the supplied values here.
        console.log("UPDATE");
    }
};

class SampleSubmissionsView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag);
        this.tag = tag;
        this.codeMirrors = [];
        this.dirty = false;
    }

    buildEditor(newDOM, index, newElement) {

    }

    rebuildEditors() {
        console.log("Rebuilding editors");
    }

    enter(newFilename, oldEditor) {
        super.enter(newFilename, oldEditor);
        this.dirty = false;
        this.updateEditor(this.file.handle());
        // Subscribe to the relevant File
        this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));
        // Notify relevant file of changes to BM
        this.currentListener = this.updateHandle.bind(this);
        //this.rebuildEditors();
        //this.codeMirror.on("change", this.currentListener);
        if (oldEditor !== this) {
            console.log(this.tag);
            console.log(this.tag.find(".CodeMirror"));
            console.log(this.tag.find(".CodeMirror").map((i,cm) => console.log("+++", cm.CodeMirror)));
            this.tag.find(".CodeMirror").map((i, cm) => cm.CodeMirror.refresh());
            console.log("REFRESH");
            // Delay so that everything is rendered
            setTimeout(() => this.tag.find(".CodeMirror").map((i, cm) => cm.CodeMirror.refresh()), 1);
        }
        // TODO: update dynamically when changing instructor status
        //this.codeMirror.setOption("readOnly", newFilename.startsWith("&") && !this.main.model.display.instructor());
    }

    updateEditor(newContents) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            console.log(this.codeMirrors);
            //this.codeMirrors.each( (i, cm) => cm.setValue(newContents.join("\n")));
            //this.codeMirrors.each( (i, cm) => cm.refresh());
            this.dirty = false;
        }
    }

    updateHandle(event) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.file.handle(this.codeMirrors.map(cm => cm.getValue()));
            this.dirty = false;
        }
    }

    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        this.currentSubscription.dispose();
        this.codeMirrors = [];
        //this.codeMirrors.off("change", this.currentListener);
        //this.codeMirror.setOption("readOnly", false);
        super.exit(newFilename, oldEditor);
    }
}

export const SampleSubmissions = {
    name: "Sample Submissions",
    extensions: ["!sample_submissions.blockpy"],
    constructor: SampleSubmissionsView,
    template: SAMPLE_SUBMISSIONS_HTML
};
