import {Editors} from "../editors";

export function uploadFile(model, event) {
    let fileReader = new FileReader();
    let files = event.target.files;
    fileReader.onload = (e =>
        model.ui.editors.current().uploadFile(e)
    );
    fileReader.fileName = files[0].name;
    fileReader.readAsText(files[0]);
    event.target.value = "";
}

export function sluggify(text) {
    return text.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export function downloadFile(model, event) {
    let {name, extension, contents, mimetype} = model.ui.editors.current().downloadFile();
    // Make safe
    name = sluggify(name);
    name = name + extension;
    // Make the data download as a file
    let blob = new Blob([contents], {type: mimetype});
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, name);
    } else{
        let temporaryDownloadLink = window.document.createElement("a");
        temporaryDownloadLink.href = window.URL.createObjectURL(blob);
        temporaryDownloadLink.download = name;
        document.body.appendChild(temporaryDownloadLink);
        temporaryDownloadLink.click();
        document.body.removeChild(temporaryDownloadLink);
    }
}

export class AbstractEditor {
    constructor(main, tag) {
        this.main = main;
        this.tag = tag;

        this.fileSystem = main.components.fileSystem;
        this.filename = null;
        this.file = null;
    }

    deleteFile() {
        this.fileSystem.deleteFile(this.filename);
        this.main.model.display.filename("answer.py");
        this.main.components.editors.changeEditor("answer.py");
    }

    onFileDeleted() {
        // TODO: Switch to the previous file instead of a default file
        this.main.model.display.filename("answer.py");
        this.main.components.editors.changeEditor("answer.py");
    }

    onFileUpdated(file) {
        if (file.filename === this.filename) {
            //this.file = file;
            this.main.components.editors.changeEditor(this.filename);
            //this.fileSystem.stopWatchingFile(this.filename);
            //this.trackCurrentFile();
        }
    }

    trackCurrentFile() {
        this.fileSystem.watchFile(this.filename, {
            updated: this.onFileUpdated.bind(this),
            deleted: this.onFileDeleted.bind(this)
        });
    }

    enter(newFilename, oldEditor) {
        this.filename = newFilename;
        this.file = this.fileSystem.getFile(newFilename);
        this.trackCurrentFile();
    }

    /**
     *
     * @param newFilename - the filename that the other editor will be switching to
     * @param oldEditor
     * @param newEditor
     */
    exit(newFilename, oldEditor, newEditor) {
        this.fileSystem.stopWatchingFile(this.filename);
        this.file = null;
        this.filename = null;
    }

    uploadFile(event) {
        let filename = event.target.fileName;
        let contents = event.target.result;
        this.file.handle(contents);
    }

    downloadFile() {
        let filename = Editors.parseFilename(this.filename);
        return {
            name: filename.name,
            extension: filename.type,
            contents: this.file.handle(),
            mimetype: "text/plain"
        };
    }
}