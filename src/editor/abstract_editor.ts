import {Editors} from "../editors";

export function uploadFile(model: any, event: any): void {
    let fileReader = new FileReader();
    let files = event.target.files;
    fileReader.onload = (e =>
        model.ui.editors.current().uploadFile(e)
    );
    (fileReader as any).fileName = files[0].name;
    fileReader.readAsText(files[0]);
    event.target.value = "";
}

export function sluggify(text: string): string {
    return text.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

export function downloadFile(model: any, event: any): void {
    let {name, extension, contents, mimetype} = model.ui.editors.current().downloadFile();
    // Make safe
    name = sluggify(name);
    name = name + extension;
    // Make the data download as a file
    let blob = new Blob([contents], {type: mimetype});
    if ((window.navigator as any).msSaveOrOpenBlob) {
        (window.navigator as any).msSaveBlob(blob, name);
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
    main: any;
    tag: any;
    fileSystem: any;
    filename: string | null;
    file: any;
    name?: string;

    constructor(main: any, tag: any) {
        this.main = main;
        this.tag = tag;

        this.fileSystem = main.components.fileSystem;
        this.filename = null;
        this.file = null;
    }

    deleteFile(): void {
        this.fileSystem.deleteFile(this.filename);
        this.main.model.display.filename("answer.py");
        this.main.components.editors.changeEditor("answer.py");
    }

    onFileDeleted(): void {
        // TODO: Switch to the previous file instead of a default file
        this.main.model.display.filename("answer.py");
        this.main.components.editors.changeEditor("answer.py");
    }

    onFileUpdated(file: any): void {
        if (file.filename === this.filename) {
            //this.file = file;
            this.main.components.editors.changeEditor(this.filename);
            //this.fileSystem.stopWatchingFile(this.filename);
            //this.trackCurrentFile();
        }
    }

    trackCurrentFile(): void {
        this.fileSystem.watchFile(this.filename, {
            updated: this.onFileUpdated.bind(this),
            deleted: this.onFileDeleted.bind(this)
        });
    }

    enter(newFilename: string, oldEditor: any): void {
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
    exit(newFilename: string, oldEditor: any, newEditor: any): void {
        this.fileSystem.stopWatchingFile(this.filename);
        this.file = null;
        this.filename = null;
    }

    uploadFile(event: any): void {
        let filename = event.target.fileName;
        let contents = event.target.result;
        this.file.handle(contents);
    }

    downloadFile(): { name: string; extension: string; contents: string; mimetype: string } {
        let filename = Editors.parseFilename(this.filename!);
        return {
            name: filename.name,
            extension: filename.type,
            contents: this.file.handle(),
            mimetype: "text/plain"
        };
    }
}