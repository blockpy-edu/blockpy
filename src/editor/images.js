import {AbstractEditor} from "./abstract_editor";
import * as FilePond from "filepond";

export const IMAGE_EDITOR_HTML = `
     <div>
        <strong>Available Files</strong><br>
            All the files available to open with <code>PIL</code> for this assignment:
            <button data-bind="click: ui.editors.images.reloadImages"
                class="btn btn-outline-secondary float-right"
            >Reload Available Images</button>
        <!-- ko if: display.uploadedFiles() !== null -->
            <ul>
                <!-- ko foreach: { data: Object.keys(display.uploadedFiles()), as: 'placement' } -->
                <li>
                    <strong data-bind="text: $data[0].toUpperCase() + $data.slice(1)"></strong>:
                    <table class="table table-striped table-bordered table-hover table-sm">
                        <thead>
                            <tr>
                                <th>Filename</th>
                                <th>Preview</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                    <!-- ko foreach: { data: $root.display.uploadedFiles()[placement], as: 'filename' } -->
                        <tr>
                            <td>
                                <code data-bind="text: filename[0]"></code>
                            </td>
                            <td>
                                <details>
                                    <summary><img data-bind="attr: { src: filename[1], alt: filename[1] }"
                                        width="30px" height="30px" onerror="this.style.display='none'"/>
                                    </summary>
                                    <img data-bind="attr: { src: filename[1], alt: filename[1] }"
                                        onerror="this.style.display='none'"/>
                                </details>
                            </td>
                            <td>
                                <button class="btn btn-danger" 
                                    data-bind="click: $root.ui.editors.images.deleteFile.bind(filename[0]),
                                               visible: $root.ui.editors.images.canModify(placement)">Delete</button>
                                <button class="btn btn-danger" 
                                    data-bind="click: $root.ui.editors.images.renameFile.bind(filename[0]),
                                               visible: $root.ui.editors.images.canModify(placement)">Rename</button>
                            </td>
                        </tr>
                    <!-- /ko -->
                    </table>
                </li>
                <!-- /ko -->
            </ul>
        <!-- /ko -->
        
        <strong>Add more files</strong><br>
        Upload more files using the forms below:
                
        <div class="form-group row">
            <div class="col-sm-2 text-right">
                <label class="form-label" for="blockpy-editor-images-upload-file">File:</label>
            </div>
            <div class="col-sm-10">
                <input type="file" class="form-control blockpy-editor-images-upload-file" id="blockpy-editor-images-upload-file"
            name="blockpy-editor-images-upload-file">
                <small class="form-text text-muted">
                    The file to make available in your code
                </small>
            </div>
        </div>
        
        <div class="form-group row" data-bind="visible: ui.editors.images.canChoosePlacement()">
            <div class="col-sm-2 text-right">
                <label class="form-label" for="blockpy-editor-images-upload-placement">Placement:</label>
            </div>
            <div class="col-sm-10">
                <select id="blockpy-editor-images-upload-placement" name="blockpy-editor-images-upload-placement"
                    class="form-control blockpy-editor-images-upload-placement">
                    <option value="submission" selected>Only your submission</option>
                    <option value="assignment">For all submissions of this assignment</option>
                    <option value="course">Across the entire course</option>
                    <option value="user">For just your user account</option>
                </select>
                <small class="form-text text-muted">
                    The placement of the file in the system. This controls whether other users can see the file.
                    If you want to provide a file to all students for just this specific problem, then you should
                    use <code>For all submissions of this assignment</code>. If you want to use this same image
                    across other assignments (including assignments within this assignment group), then you should
                    use <code>Across the entire course</code>.
                </small>
            </div>
        </div>
        
        <div class="form-group row">
            <div class="col-sm-2 text-right">
                <label class="form-label" for="blockpy-editor-images-upload-filename">Filename:</label>
            </div>
            <div class="col-sm-10">
                <input type="text" class="form-control blockpy-editor-images-upload-filename" id="blockpy-editor-images-upload-filename"
                             name="blockpy-editor-images-upload-filename">
                <small class="form-text text-muted">
                    The filename that will be made available in the code. This should be a valid filename for the
                    system, and should not contain spaces or special characters. It should also have a valid file
                    extension (e.g., <code>.png</code>, <code>.jpg</code>, <code>.txt</code>).
                </small>
            </div>
        </div>
        <div class="form-group row">
            <button data-bind="click: ui.editors.images.uploadFile" class="btn btn-success">Upload</button>
        </div>
    </div>
`;

class ImageEditorView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag);

        this.tagUploadFileButton = this.tag.find(".blockpy-editor-images-upload-file");
        this.tagUploadFilePlacement = this.tag.find(".blockpy-editor-images-upload-placement");
        this.tagUploadFileName = this.tag.find(".blockpy-editor-images-upload-filename");

        this.tagUploadFileButton.on("change", (event) => {
            this.tagUploadFileName.val(event.target.files[0].name);
        });
    }

    enter(newFilename, oldEditor) {
        super.enter(newFilename, oldEditor);

        let uploadedFiles = this.main.model.display.uploadedFiles();
        if (uploadedFiles === null) {
            this.reloadImages();
        }

        this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));

        // const target = this.tag.find(".blockpy-editor-images-filepond")[0];
        //console.log(target);
        /*const uploadUrl = new URL(this.main.model.configuration.urls["uploadFile"]);
        uploadUrl.searchParams.set("directory", this.main.model.assignment.id());
        uploadUrl.searchParams.set("placement", "submission");*/
        // this.filepond = FilePond.create(target, {
        //     //files: [],
        //     allowMultiple: true,
        //     server: {
        //         url: this.main.model.configuration.urls["downloadFile"],
        //         load: (source, load) => {
        //             const params = new URL(source, window.location.origin).searchParams;
        //             this.main.components.server.downloadFile(
        //                 params.get("placement"),
        //                 params.get("directory"),
        //                 params.get("filename"),
        //                 (response) => {
        //                     load(new File([response], params.get("filename")));
        //                 }
        //             );
        //             console.log(source, load);
        //         },
        //         process: {
        //             url: this.main.model.configuration.urls["uploadFile"],
        //             // url: "blockpy/upload_file?placement=assignment&directory="+this.main.model.assignment.id(),
        //         }
        //     }
        // });
        // console.log(this.filepond);
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
                this.main.components.fileSystem.loadRemoteFiles(response.files);
                // const allFiles = [];
                // Object.entries(response.files).forEach(([group, files]) => {
                //     files.forEach(([filename, url]) => allFiles.push({
                //         source: url,
                //         options: {
                //             type: "local"
                //         }
                //     }));
                // });
                // this.filepond.addFiles(allFiles);
            } else {
                this.main.components.dialog.ERROR_LISTING_UPLOADED_FILES(response.message);
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

    getPlacementDirectory(placement) {
        switch (placement) {
            case "submission":
                return this.main.model.submission.id();
            case "assignment":
                return this.main.model.assignment.id();
            case "course":
                return this.main.model.course.id();
            case "user":
                return this.main.model.user.id();
            default:
                return null;
        }
    }

    uploadFile(event) {
        this.main.components.server.uploadFile(
            this.tagUploadFilePlacement.val(),
            this.getPlacementDirectory(this.tagUploadFilePlacement.val()),
            this.tagUploadFileName.val(),
            this.tagUploadFileButton[0].files[0],
            (response) => {
                if (response.success) {
                    this.reloadImages();
                } else {
                    this.main.components.dialog.ERROR_UPLOADING_FILE(response.message);
                }
            }
        );
    }

    deleteFile(fileInfo) {
        const [filename, url] = fileInfo;
        const queryParams = new URL(url, window.location.origin).searchParams;
        this.main.components.server.uploadFile(
            queryParams.get("placement"),
            queryParams.get("directory"),
            filename,
            "",
            (response) => {
                if (response.success) {
                    this.reloadImages();
                } else {
                    this.main.components.dialog.ERROR_DELETING_FILE(response.message);
                }
            },
            true
        );
    }
    renameFile(fileInfo) {
        const [filename, url] = fileInfo;
        const queryParams = new URL(url, window.location.origin).searchParams;
        const newFilename = prompt("Enter the new filename for this file:", filename);
        if (newFilename) {
            this.main.components.server.renameFile(
                queryParams.get("placement"),
                queryParams.get("directory"),
                filename,
                newFilename,
                (response) => {
                    if (response.success) {
                        this.reloadImages();
                    } else {
                        this.main.components.dialog.ERROR_RENAMING_FILE(response.message);
                    }
                }
            );
        }
    }

    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        this.currentSubscription.dispose();
        super.exit(newFilename, oldEditor);
        // if (this.filepond) {
        //     this.filepond.destroy();
        // }
    }
}

export const ImageEditor = {
    name: "Image",
    extensions: ["images.blockpy"],
    constructor: ImageEditorView,
    template: IMAGE_EDITOR_HTML
};