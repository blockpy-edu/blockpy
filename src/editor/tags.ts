import {AbstractEditor} from "./abstract_editor";

export const TAGS_EDITOR_HTML = `
Create new
Import by name
Find by owner/course/kind

Tags:
    Data:
        Name
        Kind
        Level
        Version
        Description
    Controls:
        Edit
        Remove
        Delete 
`;

class TagsEditorView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag.find(".blockpy-editor-tags"));
    }
}

export const TagsEditor = {
    name: "Tags",
    extensions: ["!tags.blockpy"],
    constructor: TagsEditorView,
    template: TAGS_EDITOR_HTML
};