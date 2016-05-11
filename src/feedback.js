function BlockPyFeedback(main, origin) {
    this.main = main;
    this.origin = origin;
};

BlockPyFeedback.prototype.error = function(html) {
    this.origin.html(html);
    this.origin.removeClass("alert-success");
    this.origin.addClass("alert-warning");
}

BlockPyFeedback.prototype.success = function() {
    this.origin.html("<span class='label label-success'><span class='glyphicon glyphicon-ok'></span> Success!</span>");
    this.origin.removeClass("alert-warning");
}