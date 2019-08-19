const makeTab = function(filename, friendlyName, hideIfEmpty) {
    if (friendlyName === undefined) {
        friendlyName = filename;
    }
    return `
    <li class="nav-item">
        <a class="nav-link" href="#"
            data-toggle="tab"
            data-bind="css: {active: display.filename() === '${filename}'},
                click: display.filename.bind($data, '${filename}'),
                visible: !${hideIfEmpty} || ui.files.hasContents('${filename}')">
            ${friendlyName}</a>
    </li>`;
};

export let FILES_HTML = `
<div class="col-md-12 blockpy-panel blockpy-files"
    data-bind="visible: ui.files.visible">
<ul class="nav nav-tabs" role="tablist">

    <li class="nav-item">
        <strong>View: </strong>
    </li>

    ${makeTab("answer.py")}
    ${makeTab("!instructions.md", "Instructions")}
    ${makeTab("!assignment_settings.blockpy", "Settings")}
    ${makeTab("^starting_code.py", "Starting Code")}
    ${makeTab("!on_run.py", "On Run")}
    ${makeTab("!on_change.py", "On Change", true)}
    ${makeTab("!on_eval.py", "On Eval", true)}
    ${makeTab("?mock_urls.blockpy", "URL Data", true)}
    ${makeTab("!sample_submissions.blockpy", "Sample Submissions", true)}
    ${makeTab("!tags.blockpy", "Tags", true)}
  
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown"
         role="button" aria-haspopup="true" aria-expanded="false">Add New</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item" href="#"
                data-bind="hidden: ui.files.hasContents('?mock_urls.blockpy'),
                           click: ui.files.add.bind($data, '?mock_urls.blockpy')">URL Data</a>
            <a class="dropdown-item" href="#"
                data-bind="hidden: ui.files.hasContents('?tags.blockpy')">Tags</a>
            <a class="dropdown-item" href="#"
                data-bind="hidden: ui.files.hasContents('?sample_submissions.blockpy')">Sample Submissions</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#"
                data-bind="hidden: assignment.onChange,
                           click: ui.files.add.bind($data, '!on_change.py')">On Change</a>
            <a class="dropdown-item" href="#"
                data-bind="hidden: assignment.onEval">On Eval</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#">Starting File</a>
            <a class="dropdown-item" href="#">Instructor File</a>
            <a class="dropdown-item" href="#">Student File</a>
        </div>
    </li>
  
</ul>
</div>
`;

/**
 * Filenames live in one of five possible namespaces:
 *  Instructor (!): Invisible to the student under all circumstances
 *  Start Space (^): Used to reset the student namespace
 *  Student Space (): Visible to the student when display.hideFiles is not true, able to be edited
 *  Hidden Space (?): Not directly visible to the student, but accessible programmatically
 *  Read-only Space (&): An instructor file type visible to the student, but is uneditable by them
 *  Secret Space ($): Not visible from the menu at all, some other mechanism controls it
 *  Generated Space (*): Visible to the student, but destroyed after Engine.Clear. Can shadow an actual file.
 *  Concatenated Space (#): Used when bundling a space for the server.
 */

export let STARTING_FILES = [
    // Submission
    "answer.py",
    // Instructor files
    "!instructions.md",
    "!assignment_settings.blockpy",
    "^starting_code.py",
    "!on_run.py",
    "$settings.blockpy",
];

export const BASIC_NEW_FILES = [
    "!on_change.py",
    "!on_eval.py",
    "?mock_urls.blockpy",
    "!tags.blockpy",
    "!sample_submissions.blockpy"
];

const DELETABLE_SIMPLE_FILES = ["!on_change.py", "!on_eval.py"];

export const UNDELETABLE_FILES = ["answer.py", "!instructions.md", "!assignment_settings.py",
                                  "^starting_code.py", "!on_run.py", "$settings.blockpy"];

export const UNRENAMABLE_FILES = ["answer.py", "!instructions.md", "!assignment_settings.py",
                                  "^starting_code.py", "!on_run.py", "$settings.blockpy",
                                  "!on_change.py", "!on_eval.py", "?mock_urls.blockpy",
                                  "!tags.blockpy", "!sample_submissions.blockpy"];

class BlockPyFile {
    constructor(main, filename, contents) {
        this.main = main;
        this.filename = filename;
        this.contents = contents || "";
        this.owner = null;
        this.handle = null;
    }
}

export function makeModelFile(filename, contents) {
    return {"filename": ko.observable(filename), contents: ko.observable(contents || "")};
}

export function loadConcatenatedFile(concatenatedFile, modelFileList) {
    if (concatenatedFile) {
        let files = JSON.parse(concatenatedFile);
        files = files.map(file => makeModelFile(file.filename, file.contents));
        modelFileList(files);
    }
}

export function createConcatenatedFile(modelFileList) {
    return JSON.stringify(modelFileList().map(file => {
        return {
            filename: file.filename(),
            contents: file.contents()
        };
    }));
}

export function observeConcatenatedFile(modelFileList) {
    return ko.pureComputed(() => {
        let result = {};
        modelFileList().forEach(file =>
            result[file.filename()] = file.contents());
        return JSON.stringify(result);
    });
}

/**
 * Abstracts away database logic
 */
export class BlockPyFileSystem {
    constructor(main) {
        this.main = main;
        this.files_ = {};
        this.mountFiles();

        this.watchModel();
        this.watches_ = {};
    }

    watchFile(filename, callback) {
        if (!(filename in this.watches_)) {
            this.watches_[filename] = [];
        }
        this.watches_[filename].push(callback);
    }

    stopWatchingFile(filename) {
        delete this.watches_[filename];
    }

    watchModel() {
        let filesystem = this;
        [this.main.model.submission.extraFiles,
         this.main.model.assignment.extraStartingFiles,
         this.main.model.assignment.extraInstructorFiles].forEach(fileArray =>
            fileArray.subscribe(function(changes) {
                changes.forEach(function (change) {
                    let modelFile = change.value;
                    if (change.status === "added") {
                        // Track new file
                        let file = filesystem.newFile(modelFile.filename(), modelFile.contents(), modelFile.contents);
                        filesystem.notifyWatches(file);
                    } else if (change.status === "deleted") {
                        // Delete file
                        filesystem.deleteFileLocally_(modelFile.filename);
                    }
                });
            }, this, "arrayChange")
        );
    }

    // answer.py
    //   => subscribe to first element of submission.code)
    // !on_run.py, !on_change.py, !on_eval.py
    //   => subscribe to relevant assignment.<whatever>
    // ^starting_code.py
    //   => subscribe to first element of assignment.startingCode
    // ^whatever
    //   => subscribe to rest of the elements of assignment.startingCode
    // !whatever or ?whatever
    //   => subscribe to elements of assignment.extraFiles
    // Otherwise:
    //   => subscribe to rest of the elements of submission.code
    /**
     * New special files need to be registered here
     * @param file {BlockPyFile}
     * @private
     */
    observeFile_(file) {
        if (file.filename === "answer.py") {
            file.handle = this.main.model.submission.code;
        } else if (file.filename === "!on_run.py") {
            file.handle = this.main.model.assignment.onRun;
        } else if (file.filename === "!on_change.py") {
            file.handle = this.main.model.assignment.onChange;
        } else if (file.filename === "!on_eval.py") {
            file.handle = this.main.model.assignment.onEval;
        } else if (file.filename === "!instructions.md") {
            file.handle = this.main.model.assignment.instructions;
        } else if (file.filename === "^starting_code.py") {
            file.handle = this.main.model.assignment.startingCode;
        } else if (file.filename === "?mock_urls.blockpy") {
            this.observeInArray_(file, this.main.model.assignment.extraFiles);
        } else if (file.filename === "!tags.blockpy") {
            file.handle = this.main.model.assignment.tags;
        } else if (file.filename === "!assignment_settings.blockpy") {
            file.handle = this.main.model.assignment.settings;
        } else if (file.filename === "$settings.blockpy") {
            file.handle = this.main.model.display;
        } else if (file.filename.startsWith("^")) {
            this.observeInArray_(file, this.main.model.assignment.extraStartingFiles);
        } else if (file.filename.startsWith("!") || file.filename.startsWith("?")) {
            this.observeInArray_(file, this.main.model.assignment.extraInstructorFiles);
        } else {
            this.observeInArray_(file, this.main.model.submission.extraFiles);
        }
    }

    observeInArray_(file, array) {
        file.owner = array;
        let codeBundle = file.owner();
        for (let i=0; i < codeBundle.length; i++) {
            if (codeBundle[i].filename() === file.filename) {
                file.handle = codeBundle[i].contents;
            }
        }
        if (file.handle === null) {
            let newFile = makeModelFile(file.filename);
            file.handle = newFile.contents;
            array.push(newFile);
        }
    }

    mountFiles() {
        this.newFile("answer.py");
        this.newFile("^starting_code.py");
        this.newFile("!on_run.py");
        this.newFile("!instructions.md");
        this.newFile("!assignment_settings.blockpy");
    }

    newFile(filename, contents, modelFile) {
        if (filename in this.files_) {
            // File already exists! Just update its handle
            let existingFile = this.files_[filename];
            existingFile.handle = modelFile;
            existingFile.handle(contents || "");
            return existingFile;
        } else {
            // File does not exist
            let newFile = new BlockPyFile(this.main, filename);
            this.files_[filename] = newFile;
            if (modelFile === undefined) {
                this.observeFile_(newFile);
            } else {
                newFile.handle = modelFile;
            }
            return newFile;
        }
    }

    writeFile(filename, contents) {
        contents = contents || "";
        this.files_[filename].handle(contents);
    }

    readFile(filename) {
        return this.files_[filename].handle();
    }

    getFile(filename) {
        return this.files_[filename];
    }

    /**
     *
     * @param filename
     * @returns {boolean|object} The info about the file, or false if it could not be deleted
     */
    deleteFile(filename) {
        if (DELETABLE_SIMPLE_FILES.indexOf(filename) !== -1) {
            let file = this.deleteFileLocally_(filename);
            file.handle(null);
            return true;
        } else if (this.files_[filename].owner === null) {
            return false;
        } else {
            // Triggers a callback to eventually call deleteFileLocally_
            let found = this.files_[filename].owner.remove(modelFile => modelFile.filename === filename);
            return found || false;
        }
    }

    deleteFileLocally_(filename) {
        let file = this.files_[filename];
        delete this.files_[filename];
        if (filename in this.watches_) {
            this.watches_[filename].forEach(callback => callback.deleted());
        }
        return file;
    }

    notifyWatches(file) {
        if (file.filename in this.watches_) {
            this.watches_[file.filename].forEach(callback => callback.updated(file));
        }
    }
}