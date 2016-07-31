function BlockPyDialog(main, tag) {
    this.main = main;
    this.tag = tag;
    
    this.titleTag = tag.find('.modal-title');
    this.bodyTag = tag.find('.modal-body');
}

BlockPyDialog.prototype.show = function(title, body, onclose) {
    this.titleTag.html(title);
    this.bodyTag.html(body);
    this.tag.modal('show');
    this.tag.draggable({
        'handle': '.modal-title'
    });
    
    this.tag.on('hidden.bs.modal', function (e) {
        if (onclose !== undefined) {
            onclose();
        }
    });
}