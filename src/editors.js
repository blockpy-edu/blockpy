/**
 * Editors are inferred from Filenames.
 *
 * The editor is based on the extension:
 *  .blockpy: Special editor (will be chosen by filename)
 *  .py: Python Editor
 *  .md: Markdown Editor
 *  .txt: Text Editor (also used for other types)
 *  .peml: PEML Editor
 *  .png, .gif, .jpeg, .jpg, .bmp: Image Editor
 *  .json: JSON Editor
 *  .csv: CSV Editor
 *  .yaml: YAML Editor
 */

import {PythonEditor} from "./editor/python";
import {TextEditor} from "./editor/text";
import {AssigmentType as AssignmentType, AssignmentSettings} from "./editor/assignment_settings";
import {TagsEditor} from "./editor/tags";
import {MarkdownEditor} from "./editor/markdown";
import {SampleSubmissions} from "./editor/sample_submissions";
import {JsonEditor} from "./editor/json";
import {CsvEditor} from "./editor/csv";
import {ToolboxEditor} from "./editor/toolbox";
import {QuizEditor} from "./editor/quiz";
import {ImageEditor} from "./editor/images";

/**
 * The different possible editors available
 * @enum {string}
 */
export let EditorsEnum = {
    SUBMISSION: "submission",
    ASSIGNMENT: "assignment",
    INSTRUCTIONS: "instructions",
    ON_RUN: "on_run",
    ON_CHANGE: "on_change",
    ON_EVAL: "on_eval",
    STARTING_CODE: "starting_code",
    SAMPLE_SUBMISSIONS: "sample_submissions",
    INSTRUCTOR_FILE: "instructor_file"
};

const SPECIAL_NAMESPACES = ["!", "^", "?", "$"];

const AVAILABLE_EDITORS = [
    TextEditor, PythonEditor, AssignmentSettings, TagsEditor, MarkdownEditor,
    SampleSubmissions, JsonEditor, CsvEditor, ToolboxEditor, QuizEditor, ImageEditor
];

export const EDITORS_HTML = AVAILABLE_EDITORS.map(editor => `
<div class="blockpy-panel blockpy-editor" 
     data-bind="visible: ui.editors.view().name === '${editor.name}', class: ui.editors.width">
    <div>
    ${editor.template}
    </div>
</div>
`
    /*
    `
<!-- ko if: ui.editors.view().name === '${editor.name}' -->
${editor.template}
<!-- /ko -->`*/
).join("\n");

export class Editors {
    constructor(main, tag) {
        this.main = main;
        this.tag = tag;
        this.current = null;
        this.registered_ = [];
        this.extensions_ = {};
        this.byName_ = {};
        AVAILABLE_EDITORS.forEach(editor => this.registerEditor(editor));
        this.main.model.display.filename.subscribe(this.changeEditor, this);
    }

    registerEditor(data) {
        let extensions = data.extensions;
        let instance = new data.constructor(this.main, this.tag);
        instance.name = data.name;
        this.registered_.push(instance);
        this.byName_[data.name.toLowerCase()] = instance;
        for (let i=0; i < extensions.length; i++) {
            this.extensions_[extensions[i]] = instance;
        }
    }

    byName(name) {
        return this.byName_[name.toLowerCase()];
    }

    changeEditor(newFilename) {
        let oldEditor = this.current;
        let newEditor = this.getEditor(newFilename, oldEditor);
        if (oldEditor !== null) {
            oldEditor.exit(newFilename, oldEditor, newEditor);
        }
        this.current = newEditor;
        this.current.enter(newFilename, oldEditor);
    }

    static parseFilename(path) {
        let space = path.charAt(0);
        if (SPECIAL_NAMESPACES.indexOf(space) !== -1) {
            path = path.substr(1);
        } else {
            space = "";
        }
        let name = path.substr(0, path.lastIndexOf("."));
        let type = path.substr(path.lastIndexOf("."));
        return {"space": space, "name": name, "type": type};
    }

    getEditor(path) {
        let {space, name, type} = Editors.parseFilename(path);
        if (type === ".blockpy" && path in this.extensions_) {
            return this.extensions_[path];
        }
        let assignmentType = this.main.model.assignment.type();
        if (assignmentType !== AssignmentType.BLOCKPY) {
            if (name === "answer" && type === ".py") {
                if ("."+assignmentType in this.extensions_) {
                    return this.extensions_["."+assignmentType];
                } else {
                    console.error("No editor registered for assignment type:", assignmentType);
                    return this.registered_[0];
                }
            }
        }
        if (type in this.extensions_) {
            return this.extensions_[type];
        } else {
            return this.registered_[0];
        }
        //console.log(this.main.model.assignment.type(), space, name, type);
    }

}