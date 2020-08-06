import {firstDefinedValue} from "utilities.js";

// ${makeTab("?mock_urls.blockpy", "URL Data", true)}

const makeTab = function(filename, friendlyName, hideIfEmpty, notInstructor) {
    if (friendlyName === undefined) {
        friendlyName = filename;
    }
    let instructorFileClass = "";
    let hideIfNotInstructor = "true";
    if (!notInstructor) {
        instructorFileClass = "blockpy-file-instructor";
        hideIfNotInstructor = "display.instructor()";
    }
    return `
    <li class="nav-item ${instructorFileClass}">
        <a class="nav-link" href="#"
            data-toggle="tab"
            data-bind="css: {active: display.filename() === '${filename}'},
                click: display.filename.bind($data, '${filename}'),
                visible: (!${hideIfEmpty} || ui.files.hasContents('${filename}')) && ${hideIfNotInstructor}">
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

    ${makeTab("answer.py", undefined, undefined, true)}
    ${makeTab("!instructions.md", "Instructions")}
    ${makeTab("!assignment_settings.blockpy", "Settings")}
    ${makeTab("^starting_code.py", "Starting Code")}
    ${makeTab("!on_run.py", "On Run")}
    ${makeTab("!on_change.py", "On Change", true)}
    ${makeTab("!on_eval.py", "On Eval", true)}
    ${makeTab("!sample_submissions.blockpy", "Sample Submissions", true)}
    ${makeTab("!tags.blockpy", "Tags", true)}
    
    <!-- ko foreach: assignment.extraInstructorFiles -->
        <li class="nav-item"
            data-bind="css: {'blockpy-file-instructor': !filename().startsWith('&')},
                       visible: filename().startsWith('&') || $root.display.instructor() ">
            <a class="nav-link" href="#"
                data-toggle="tab"
                data-bind="css: {active: $root.display.filename() === filename(),
                                 uneditable: filename().startsWith('&')},
                            click: $root.display.filename.bind($data, filename()),
                            text: $root.ui.files.displayFilename(filename())">
            </a>        
        </li>
    <!-- /ko -->
    <!-- ko foreach: assignment.extraStartingFiles -->
        <li class="nav-item blockpy-file-instructor"
            data-bind="visible: $root.display.instructor()">
            <a class="nav-link" href="#"
                data-toggle="tab"
                data-bind="css: {active: $root.display.filename() === filename()},
                            click: $root.display.filename.bind($data, filename()),
                            text: filename">
            </a>        
        </li>
    <!-- /ko -->
    
    <!-- ko foreach: submission.extraFiles -->
        <li class="nav-item">
            <a class="nav-link" href="#"
                data-toggle="tab"
                data-bind="css: {active: $root.display.filename() === filename()},
                            click: $root.display.filename.bind($data, filename()),
                            text: $root.ui.files.displayFilename(filename())">
            </a>        
        </li>
    <!-- /ko -->
  
    <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" data-toggle="dropdown"
         role="button" aria-haspopup="true" aria-expanded="false">Add New</a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item blockpy-file-instructor" href="#"
                data-bind="hidden: ui.files.hasContents('?mock_urls.blockpy'),
                           click: ui.files.add.bind($data, '?mock_urls.blockpy')">URL Data</a>
            <a class="dropdown-item blockpy-file-instructor" href="#"
                data-bind="hidden: ui.files.hasContents('?tags.blockpy')">Tags</a>
            <a class="dropdown-item blockpy-file-instructor" href="#"
                data-bind="hidden: ui.files.hasContents('?sample_submissions.blockpy')">Sample Submissions</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item blockpy-file-instructor" href="#"
                data-bind="hidden: assignment.onChange,
                           click: ui.files.add.bind($data, '!on_change.py')">On Change</a>
            <a class="dropdown-item blockpy-file-instructor" href="#"
                data-bind="hidden: assignment.onEval,
                           click: ui.files.add.bind($data, '!on_eval.py')">On Eval</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item blockpy-file-instructor" href="#"
                data-bind="click: ui.files.add.bind($data, 'starting')">Starting File</a>
            <a class="dropdown-item blockpy-file-instructor" href="#"
                data-bind="click: ui.files.add.bind($data, 'instructor')">Instructor File</a>
            <a class="dropdown-item" href="#"
                data-bind="click: ui.files.add.bind($data, 'student')">Student File</a>
        </div>
    </li>
  
</ul>
</div>
`;

const NEW_INSTRUCTOR_FILE_DIALOG_HTML = `
<form>
<div class="form-group row">
    <!-- Filename -->
    <div class="col-sm-2 text-right">
        <label for="blockpy-instructor-file-dialog-filename">Filename:</label>
    </div>
    <div class="col-sm-10">
        <input type="text" class="form-control blockpy-instructor-file-dialog-filename"
            id="blockpy-instructor-file-dialog-filename">    
    </div>
    <!-- Filetype -->
    <div class="col-sm-2 text-right mt-2">
        <label for="blockpy-instructor-file-dialog-filetype">Filetype: </label>
    </div>
    <div class="col-sm-10">
        <span class="blockpy-instructor-file-dialog-filetype"
            id="blockpy-instructor-file-dialog-filetype"></span>    
    </div>
    <!-- Inaccessible to student? -->
    <div class="col-sm-2 text-right mt-2">
        <label for="blockpy-instructor-file-dialog-namespace">Namespace: </label>
    </div>
    <div class="col-sm-4">
        <select class="form-control blockpy-instructor-file-dialog-namespace"
            id="blockpy-instructor-file-dialog-namespace">
            <option value="!">Completely inaccessible</option>
            <option value="?">Hidden from student, accessible programatically</option>
            <option value="&">Visible to student, but not editable</option>
        </select>
    </div>
</div>
</form>
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

const INSTRUCTOR_DIRECTORY = "_instructor/";
const STUDENT_DIRECTORY = "_student/";

const SearchModes = {
    EVERYWHERE: "EVERYWHERE",
    START_WITH_INSTRUCTOR: "START_WITH_INSTRUCTOR",
    ONLY_STUDENT_FILES: "ONLY_STUDENT_FILES"
};

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

function makeMockModelFile(filename, contents) {
    return { filename: () => filename, contents: () => contents };
}

export function loadConcatenatedFile(concatenatedFile, modelFileList) {
    if (concatenatedFile) {
        let files = JSON.parse(concatenatedFile);
        let modelFiles = [];
        for (let filename in files) {
            if (files.hasOwnProperty(filename)) {
                modelFiles.push(makeModelFile(filename, files[filename]));
            }
        }
        //files = files.map(file => makeModelFile(file.filename, file.contents));
        modelFileList(modelFiles);
    } else {
        modelFileList([]);
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

        this.main.model.display.instructor.subscribe((visiblity)=> {
            $(".blockpy-file-instructor").toggle(visiblity);
        });
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
            this.observeInArray_(file, this.main.model.assignment.extraInstructorFiles);
        } else if (file.filename === "!tags.blockpy") {
            file.handle = this.main.model.assignment.tags;
        } else if (file.filename === "!assignment_settings.blockpy") {
            file.handle = this.main.model.assignment.settings;
        } else if (file.filename === "$settings.blockpy") {
            file.handle = this.main.model.display;
        } else if (file.filename.startsWith("^")) {
            this.observeInArray_(file, this.main.model.assignment.extraStartingFiles);
        } else if (file.filename.startsWith("!") ||
                   file.filename.startsWith("?") ||
                   file.filename.startsWith("&")) {
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

    dismountExtraFiles() {
        for (let name in this.files_) {
            if (this.files_.hasOwnProperty(name)) {
                if (UNDELETABLE_FILES.indexOf(name) === -1) {
                    delete this.files_[name];
                    delete this.watches_[name];
                }
            }
        }
        // submission.codeTODO: Shouldn't we notify the UI that the file was deleted?
    }

    newFile(filename, contents, modelFile) {
        if (filename in this.files_) {
            // File already exists! Just update its handle
            let existingFile = this.files_[filename];
            if (modelFile === undefined) {
                this.observeFile_(existingFile);
            } else {
                existingFile.handle = modelFile;
            }
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
            if (contents !== undefined) {
                newFile.handle(contents);
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

    searchForFile(name, studentSearch) {
        /*
        files.*
        _instructor/files.*
        _student/files.*

        If a student searches for a file, it checks the "?", "&", "*", "" namespaces
            import helper => "./helper.py"
            open("external.json") => "external.json"
        If an instructor searches for a file, it checks "!", "^", "?", "&", "*", "" namespaces
            To explicitly search instructor namespaces first
                import _instructor.helper => "./instructor/helper.py"
                open("_instructor/external.json") => "_instructor/external.json"
            to allow student files to override:
                import helper => "./helper.py"
                open("external.json") => "external.json"
            to only check student files, prepend with _student
         */
        // Chop off starting "./"
        if (name.startsWith("./")) {
            name = name.slice(2);
        }
        let searchMode = SearchModes.EVERYWHERE;
        // Should the search be start with instructor side?
        if (name.startsWith(INSTRUCTOR_DIRECTORY)) {
            name = name.slice(INSTRUCTOR_DIRECTORY.length);
            searchMode = SearchModes.START_WITH_INSTRUCTOR;
        }
        // Should the search be limited to the student mode?
        if (name.startsWith(STUDENT_DIRECTORY)) {
            name = name.slice(STUDENT_DIRECTORY.length);
            searchMode = SearchModes.ONLY_STUDENT_FILES;
        } else if (studentSearch) {
            searchMode = SearchModes.ONLY_STUDENT_FILES;
        }
        // Shortcut for instructor versions
        let extraStudentFiles = this.main.model.submission.extraFiles();
        let extraInstructorFiles = this.main.model.assignment.extraInstructorFiles();
        let extraStartingFiles = this.main.model.assignment.extraStartingFiles();
        // Check special files (TODO: how would an instructor access "./_instructor/answer.py"?
        let specialFile = this.searchForSpecialFiles_(name, searchMode);
        if (specialFile !== undefined) {
            return specialFile;
        }
        // Start looking through possible files
        let studentVersion = this.searchForFileInList_(extraStudentFiles, name);
        let generatedVersion = this.searchForFileInList_(extraStudentFiles, "*"+name);
        let defaultVersion = this.searchForFileInList_(extraInstructorFiles, "&"+name);
        if (searchMode === SearchModes.ONLY_STUDENT_FILES) {
            return firstDefinedValue(defaultVersion, studentVersion, generatedVersion);
        }
        let instructorVersion = this.searchForFileInList_(extraInstructorFiles, "!"+name);
        let hiddenVersion = this.searchForFileInList_(extraInstructorFiles, "?"+name);
        let startingVersion = this.searchForFileInList_(extraStartingFiles, "^"+name);
        if (searchMode === SearchModes.START_WITH_INSTRUCTOR) {
            return firstDefinedValue(instructorVersion, hiddenVersion, startingVersion,
                                     defaultVersion, studentVersion, generatedVersion);
        } else if (searchMode === SearchModes.EVERYWHERE) {
            return firstDefinedValue(defaultVersion, studentVersion, generatedVersion,
                                     instructorVersion, hiddenVersion, startingVersion);
        }
    }

    searchForFileInList_(modelList, filename) {
        for (let i=0; i < modelList.length; i++) {
            if (modelList[i].filename() === filename) {
                return modelList[i];
            }
        }
        return undefined;
    }

    searchForSpecialFiles_(filename, searchMode) {
        if (searchMode === SearchModes.ONLY_STUDENT_FILES) {
            if (filename === "answer.py") {
                return makeMockModelFile("_instructor/answer.py", this.main.model.submission.code());
            }
            return undefined;
        }
        switch (filename) {
            case "answer.py":
                return makeMockModelFile("_instructor/answer.py", this.main.model.submission.code());
            case "on_run.py":
                return makeMockModelFile("_instructor/on_run.py", this.main.model.assignment.onRun());
            case "on_change.py":
                return makeMockModelFile("_instructor/on_change.py", this.main.model.assignment.onChange());
            case "on_eval.py":
                return makeMockModelFile("_instructor/on_eval.md", this.main.model.assignment.onEval());
            case "instructions.md":
                return makeMockModelFile("_instructor/instructions.md", this.main.model.assignment.instructions());
            case "starting_code.py":
                return makeMockModelFile("_instructor/starting_code.py", this.main.model.assignment.startingCode());
        }
        return undefined;
    }

    newFileDialog(kind) {
        let body = $(NEW_INSTRUCTOR_FILE_DIALOG_HTML);
        let filename = body.find(".blockpy-instructor-file-dialog-filename");
        let filetype = body.find(".blockpy-instructor-file-dialog-filetype");
        let namespace = body.find(".blockpy-instructor-file-dialog-namespace");
        let extensionRegex = /(?:\.([^.]+))?$/;
        filename.on("input", () => {
            let extension = extensionRegex.exec(filename.val())[1];
            extension = extension === undefined ? "No extension" : extension;
            //TODO: this.main.components.editors.getEditorFromExtension(extension);
            filetype.text(extension);
        });
        let yes = () => {
            let prefix = "";
            if (kind === "instructor") {
                prefix = namespace.val();
            } else if (kind === "starting") {
                prefix = "^";
            }

            if (filename.val()) {
                filename = prefix+filename.val();
                this.newFile(filename);
            }
        };
        body.submit((e) => {
            e.preventDefault();
            yes();
            this.main.components.dialog.close();
        });
        this.main.components.dialog.confirm("Make New File", body, yes, ()=>{}, "Add");
    }
}