import {AbstractEditor} from "./abstract_editor";

export const TEXT_EDITOR_HTML = `
    <div>
    <textarea></textarea>
    </div>
`;

class TextEditorView extends AbstractEditor {
}

export const TextEditor = {
    name: "Text",
    extensions: [".txt"],
    constructor: TextEditorView,
    template: TEXT_EDITOR_HTML
};