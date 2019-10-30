import {AbstractEditor} from "./abstract_editor";

export const TEXT_EDITOR_HTML = `
    <div>
    <textarea class="blockpy-editor-text"></textarea>
    </div>
`;

class TextEditorView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag);
        this.codeMirror = CodeMirror.fromTextArea(tag.find(".blockpy-editor-text")[0], {
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
        this.dirty = false;
    }

    enter(newFilename, oldEditor) {
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

    updateEditor(newContents) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.codeMirror.setValue(newContents);
            this.codeMirror.refresh();
            this.dirty = false;
        }
    }

    updateHandle(event) {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.file.handle(this.codeMirror.getValue());
            this.dirty = false;
        }
    }

    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        this.currentSubscription.dispose();
        this.codeMirror.off("change", this.currentListener);
        this.codeMirror.setOption("readOnly", false);
        super.exit(newFilename, oldEditor);
    }
}

export const TextEditor = {
    name: "Text",
    extensions: [".txt"],
    constructor: TextEditorView,
    template: TEXT_EDITOR_HTML
};