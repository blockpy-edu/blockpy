import {AbstractEditor} from "./abstract_editor";
import {default_header} from "./default_header";

export const MARKDOWN_EDITOR_HTML = `
    ${default_header}
    <textarea class="blockpy-editor-markdown"></textarea>    
`;


class MarkdownEditorView extends AbstractEditor {
    mde: any;
    dirty: boolean;
    currentSubscription: any;
    currentListener: any;

    constructor(main: any, tag: any) {
        super(main, tag);
        this.mde = new (window as any).EasyMDE({
            element: tag.find(".blockpy-editor-markdown")[0],
            autoDownloadFontAwesome: false,
            forceSync: true,
            minHeight: "300px",
            //scrollbarStyle: "native",
            // TODO: imageUploadFunction
            renderingConfig: {
                codeSyntaxHighlighting: true,
            },
            indentWithTabs: false,
            tabSize: 4,
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
        this.mde.codemirror.on("change", this.currentListener);
        if (oldEditor !== this) {
            // Delay so that everything is rendered
            setTimeout(this.mde.codemirror.refresh.bind(this.mde.codemirror), 1);
        }
    }

    updateEditor(newContents: string): void {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.mde.value(newContents);
            this.mde.codemirror.refresh();
            this.dirty = false;
        }
    }

    updateHandle(event: any): void {
        this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.file.handle(this.mde.value());
            this.dirty = false;
        }
    }

    exit(newFilename: string, oldEditor: any, newEditor: any): void {
        // Remove subscriber
        this.currentSubscription.dispose();
        this.mde.codemirror.off("change", this.currentListener);
        super.exit(newFilename, oldEditor, newEditor);
    }
}

export const MarkdownEditor = {
    name: "Markdown",
    extensions: [".md"],
    constructor: MarkdownEditorView,
    template: MARKDOWN_EDITOR_HTML
};