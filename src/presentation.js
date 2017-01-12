/**
 * An object for managing the blob of text at the top of a problem describing it.
 * This isn't a very busy component.
 *
 * TODO: Isn't most of this redundant now?
 *
 * @constructor
 * @this {BlockPyEditor}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
function BlockPyPresentation(main, tag) {
    this.main = main;
    this.tag = tag;
    
    var presentationEditor = this;
    //this.main.model.settings.instructor.subscribe(function() {presentationEditor.setVisible()});
}

/**
 * Removes the editor when it's not in use.
 * DEPRECATED
 */
BlockPyPresentation.prototype.closeEditor = function() {
    this.tag.destroy();
};

/**
 * Updates the contents of the presentation blob, possibly updating the
 * editor's size too.
 *
 * @param {String} content - The new text of the presentation blob.
 */
BlockPyPresentation.prototype.setBody = function(content) {
    this.main.model.assignment.introduction(content);
    this.main.components.editor.blockly.resize();
};

/**
 * Makes the editor available or not.
 * DEPRECATED.
 */
BlockPyPresentation.prototype.setVisible = function() {
    if (this.main.model.settings.instructor()) {
        this.startEditor();
    } else {
        this.closeEditor();
    }
}

/**
 * Creates the Summer Note editor for the presentation blob.
 * DEPRECATED.
 */
BlockPyPresentation.prototype.startEditor = function() {
    var presentationEditor = this;
    this.tag.summernote({
        codemirror: { // codemirror options
            theme: 'monokai'
        },
        onChange: function(content) {presentationEditor.setBody(content)},
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['fontname', 'fontsize']],
            ['insert', ['link', 'table', 'ul', 'ol']],
            ['misc', ['codeview', 'help']]
        ]
    });
    this.tag.code(this.main.model.assignment.introduction());
    //this.name.tag();
};