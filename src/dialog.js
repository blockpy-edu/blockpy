// TODO: Dyanmically populate aria-labelledby in this and other places

export let DIALOG_HTML = `
    <div class='blockpy-dialog modal hidden'
         role="dialog"
         aria-label='Dialog'
         aria-hidden="true"
         aria-modal="true">
        <div class='modal-dialog modal-lg' role="document">
            <div class='modal-content' role='region' aria-label='Dialog content'>
                <div class='modal-header'>
                    <h4 class='modal-title'>Dynamic Content</h4>
                    <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class='modal-body' style='width:100%; height:400px; white-space:pre-wrap'>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-white' data-dismiss='modal'>Close</button>
                </div>    
            </div>
        </div>
    </div>
`;

/**
 * A utility object for quickly and conveniently generating dialog boxes.
 * Unfortunately, this doesn't dynamically create new boxes; it reuses the same one
 * over and over again. It turns out dynamically generating new dialog boxes
 * is a pain! So we can't stack them.
 *
 * @constructor
 * @this {BlockPyDialog}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
export function BlockPyDialog(main, tag) {
    this.main = main;
    this.tag = tag;

    this.titleTag = tag.find(".modal-title");
    this.bodyTag = tag.find(".modal-body");
}

/**
 * A simple externally available function for popping up a dialog
 * message. This menu will be draggable by its title.
 *
 * @param {String} title - The title of the message dialog. Can have HTML.
 * @param {String} body - The body of the message dialog. Can have HTML.
 * @param {function} onclose - A function to be run when the user closes the dialog.
 */
BlockPyDialog.prototype.show = function (title, body, onclose) {
    this.titleTag.html(title);
    this.bodyTag.html(body);
    this.tag.modal("show");
    this.tag.draggable({
        "handle": ".modal-title"
    });

    this.tag.on("hidden.bs.modal", function (e) {
        if (onclose !== undefined && onclose !== null) {
            onclose();
        }
    });
};

BlockPyDialog.prototype.ERROR_LOADING_ASSIGNMNENT = function () {
    confirm("Error Loading Assignment", `BlockPy encountered an error while loading the assignment.<br>
Please reload the page and try again.`,);
};

BlockPyDialog.prototype.SCREENSHOT_BLOCKS = function () {
    // TODO
};