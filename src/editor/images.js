import {AbstractEditor} from "./abstract_editor";

export const IMAGE_EDITOR_HTML = `
     <div>
        <h3>Available Images</h3>
        
        <button data-bind="click: ui.editors.images.reloadImages">Reload Available Images</button>
        <!-- ko if: display.uploadedFiles() !== null -->
            <ul>
                <!-- ko foreach: { data: Object.keys(display.uploadedFiles()), as: 'placement' } -->
                <li>
                    <strong data-bind="text: $data"></strong>:
                    <ul>
                    <!-- ko foreach: { data: $root.display.uploadedFiles()[placement], as: 'filename' } -->
                        <li>
                            <span data-bind="text: filename[0]"></span>:
                            <img data-bind="attr: { src: filename[1], alt: filename[1] }"
                                width="30px" height="30px"/>
                        </li>
                    <!-- /ko -->
                    </ul>
                </li>
                <!-- /ko -->
            </ul>
        <!-- /ko -->
    </div>
`;

class ImageEditorView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag);
    }

    enter(newFilename, oldEditor) {
        super.enter(newFilename, oldEditor);

        let uploadedFiles = this.main.model.display.uploadedFiles();
        if (uploadedFiles === null) {
            this.reloadImages();
        }

        this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));
        /*
        this.updateEditor(this.file.handle());
        // Subscribe to the relevant File

        // Notify relevant file of changes to BM
        this.currentListener = this.updateHandle.bind(this);
        this.codeMirror.on("change", this.currentListener);*/
    }

    reloadImages() {
        this.main.components.server.listUploadedFiles((response) => {
            if (response.success) {
                this.main.model.display.uploadedFiles(response.files);
            } else {
                this.main.components.dialogs.ERROR_LISTING_UPLOADED_FILES(response.message);
            }
        });
    }

    updateEditor(newContents) {

    }

    updateHandle(event) {
        /*this.dirty = !this.dirty;
        if (this.dirty) {
            this.dirty = true;
            this.file.handle(this.codeMirror.getValue());
            this.dirty = false;
        }*/
    }

    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        this.currentSubscription.dispose();
        super.exit(newFilename, oldEditor);
    }
}

export const ImageEditor = {
    name: "Image",
    extensions: ["?images.blockpy"],
    constructor: ImageEditorView,
    template: IMAGE_EDITOR_HTML
};