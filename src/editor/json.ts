import {AbstractEditor} from "./abstract_editor";
import {default_header} from "./default_header";

export const JSON_EDITOR_HTML = `
    ${default_header}
     <div>
        <textarea class="blockpy-editor-json"></textarea>
    </div>
`;

class JsonEditorView extends AbstractEditor {
    codeMirror: any;
    dirty: boolean;
    currentSubscription: any;
    currentListener: any;

    constructor(main: any, tag: any) {
        super(main, tag);
        this.codeMirror = CodeMirror.fromTextArea(tag.find(".blockpy-editor-json")[0], {
            showCursorWhenSelecting: true,
            lineNumbers: true,
            firstLineNumber: 1,
            indentUnit: 4,
            tabSize: 4,
            indentWithTabs: false,
            mode: "json",
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
        this.dirty = false;
    }

    enter(newFilename: string, oldEditor: any): void {
        super.enter(newFilename, oldEditor);
        this.dirty = false;
        this.updateEditor(this.file.handle());
        // Subscribe to the relevant File
        this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));
        // Notify relevant file of changes to BM
        this.currentListener = this.updateHandle.bind(this);
        this.codeMirror.on("change", this.currentListener);
        if (oldEditor !== this) {
            // Delay so that everything is rendered
            setTimeout(this.codeMirror.refresh.bind(this.codeMirror), 1);
        }
        // TODO: update dynamically when changing instructor status
        this.codeMirror.setOption("readOnly", newFilename.startsWith("&") && !this.main.model.display.instructor());

    }

    updateEditor(newContents: string): void {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.codeMirror.setValue(newContents);
            this.codeMirror.refresh();
            this.dirty = false;
        }
    }

    updateHandle(event: any): void {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.file.handle(this.codeMirror.getValue());
            this.dirty = false;
        }
    }

    exit(newFilename: string, oldEditor: any, newEditor: any): void {
        // Remove subscriber
        this.currentSubscription.dispose();
        this.codeMirror.off("change", this.currentListener);
        this.codeMirror.setOption("readOnly", false);
        super.exit(newFilename, oldEditor, newEditor);
    }
}

export const JsonEditor = {
    name: "JSON",
    extensions: [".json"],
    constructor: JsonEditorView,
    template: JSON_EDITOR_HTML
};