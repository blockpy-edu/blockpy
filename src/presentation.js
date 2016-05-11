function BlockPyPresentation(main, set, get, tag, name_tag) {
    this.main = main;
    this.tag = $(tag);
    this.set = set;
    this.get = get;   
    this.mode = "read";
    this.name_tag = $(name_tag);
}

BlockPyPresentation.prototype.closeEditor = function() {
    this.tag.destroy();
};

BlockPyPresentation.prototype.startEditor = function() {
    var BlockPyPresentation = this;
    this.tag.summernote({
        codemirror: { // codemirror options
            theme: 'monokai'
        },
        onChange: BlockPyPresentation.set,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['fontname', 'fontsize']],
            ['insert', ['link', 'table', 'ul', 'ol']],
            ['misc', ['codeview', 'help']]
        ]
    });
    this.tag.code(this.get());
    //this.name.tag();
};