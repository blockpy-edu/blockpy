function BlockPyPresentation(main, tag) {
    this.main = main;
    this.tag = tag;
    
    var presentationEditor = this;
    //this.main.model.settings.instructor.subscribe(function() {presentationEditor.setVisible()});
}

BlockPyPresentation.prototype.closeEditor = function() {
    this.tag.destroy();
};
BlockPyPresentation.prototype.setBody = function(content) {
    this.main.model.assignment.introduction(content);
    this.main.components.editor.blockly.resize();
};

BlockPyPresentation.prototype.setVisible = function() {
    if (this.main.model.settings.instructor()) {
        this.startEditor();
    } else {
        this.closeEditor();
    }
}

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