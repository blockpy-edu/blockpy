// TODO: Dynamically populate aria-labelledby in this and other places

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
                <div class='modal-body' style='max-width:100%; max-height:400px'>
                </div>
                <div class='modal-footer'>
                    <button type='button' class='btn btn-white modal-close' data-dismiss='modal'>Close</button>
                    <button type='button' class='btn btn-success modal-okay' data-dismiss='modal'>Okay</button>
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
 */
export class BlockPyDialog {
    main: any;
    tag: any;
    titleTag: any;
    bodyTag: any;
    footerTag: any;
    okayButton: any;
    closeButton: any;
    yes: () => void;
    no: () => void;

    constructor(main: any, tag: any) {
        this.main = main;
        this.tag = tag;

        this.titleTag = tag.find(".modal-title");
        this.bodyTag = tag.find(".modal-body");
        this.footerTag = tag.find(".modal-footer");
        this.okayButton = tag.find(".modal-okay");
        this.closeButton = tag.find(".modal-close");

        this.yes = () => {};
        this.no = () => {};
        this.okayButton.click(() => {
            this.yes();
            this.tag.modal("hide");
        });
        this.closeButton.click(() => {
            this.no();
        });
    }

    close(): void {
        this.tag.modal("hide");
    }

    /**
     * A simple externally available function for popping up a dialog
     * message. This menu will be draggable by its title.
     *
     * @param {String} title - The title of the message dialog. Can have HTML.
     * @param {String} body - The body of the message dialog. Can have HTML.
     * @param {function} onclose - A function to be run when the user closes the dialog.
     */
    show(title: string, body: any, onclose?: (() => void) | null): void {
        this.titleTag.html(title);
        this.bodyTag.html(body);
        this.tag.modal("show");
        this.okayButton.hide();
        this.tag.draggable({
            "handle": ".modal-title"
        });

        this.tag.on("hidden.bs.modal", function (e: any) {
            if (onclose !== undefined && onclose !== null) {
                onclose();
            }
        });
    }

    confirm(title: string, body: string, yes?: () => void, no?: () => void, yesText?: string): void {
        if (yesText === undefined) {
            yesText = "Okay";
        }
        this.show(title, body, no);
        this.yes = yes || (() => {});
        this.no = no || (() => {});
        this.okayButton.show().html(yesText);
    }

    ASSIGNMENT_VERSION_CHANGED(): void {
        this.confirm("Assignment Changed", "Your instructor has made changes to this assignment. Would you like to reload? All your work has been saved.");
    }

    ERROR_LOADING_ASSIGNMNENT(reason: string): void {
        this.show("Error Loading Assignment", `BlockPy encountered an error while loading the assignment.<br>
Please reload the page and try again.<br>Response from server was:<br><pre>${reason}</pre>`);
    }

    ERROR_LISTING_UPLOADED_FILES(reason: string): void {
        this.show("Error Listing Uploaded Files", `BlockPy encountered an error while listing the uploaded files.<br>
Please reload the page and try again.<br>Response from server was:<br><pre>${reason}</pre>`);
    }

    ERROR_UPLOADING_FILE(reason: string): void {
        this.show("Error Uploaded File", `BlockPy encountered an error while uploading the file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`);
    }

    ERROR_DOWNLOADING_FILE(reason: string): void {
        this.show("Error Downloading File", `BlockPy encountered an error while downloading a file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`);
    }

    ERROR_RENAMING_FILE(reason: string): void {
        this.show("Error Renaming File", `BlockPy encountered an error while renaming a file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`);
    }

    ERROR_DELETING_FILE(reason: string): void {
        this.show("Error Deleting File", `BlockPy encountered an error while deleting a file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`);
    }

    ERROR_SAVING_ASSIGNMNENT(reason: string): void {
        this.show("Error Saving Assignment", `BlockPy encountered an error while saving the assignment.<br>
Please reload the page and try again.<br>Response from server was:<br><pre>${reason}</pre>`);
    }

    ERROR_SHOW_STUDENT_ERROR(error: string): void {
        this.show("Original Error", `When I ran your code, I encountered an error:\n\n<div class="blockpy-dialog-student-error-message">${error}</div>`);
    }

    POSITIVE_FEEDBACK_FULL(title: string, message: string): void {
        this.show(title, message);
    }

    SCREENSHOT_BLOCKS(): void {
        // TODO
    }

    ERROR_UPDATING_SUBMISSION_STATUS(): void {
        this.show("Error Updating Submission Status", `BlockPy encountered an error while updating your submission status.<br>
Please reload the page and try again.`);
    }

    ERROR_LOADING_HISTORY(): void {
        this.show("Error Loading History", `BlockPy encountered an error while loading your history.<br>
Please reload the page and try again.`);
    }

    OFFER_FORK(): void {
        let setupUrl = this.main.model.configuration.urls.instructionsAssignmentSetup;
        setupUrl = setupUrl ? ` (<a href="${setupUrl}" target="_blank">How do I do that?</a>)` : "";
        this.show("Assignment Not Owned; Fork?", `
    <div class="mb-4">
        It looks like you want to edit this assignment, but you are not an instructor
    or designer in the course that owns it ("Course Name"). Would you like to fork
    this assignment (or its entire group) so that you can save your modifications?
    </div>
    
    <div class="mb-4">
        Remember to update the Launch URL in the assignments' settings on Canvas!${setupUrl}
    </div>
    
    <div><button type='button' class='btn btn-white'>Fork entire assignment group</button></div>
    <div><button type='button' class='btn btn-white'>Fork just this assignment</button></div>
    <div><button type='button' class='btn btn-danger'>Reset my local changes</button></div>
    
    <div class="form-check">
        <input type="checkbox" class="form-check-input"
                name="blockpy-transfer-submissions">
        <label class="form-check-label" for="blockpy-transfer-submissions">Transfer Student Submissions for this course</label>
    </div>
    
    <div class="form-check">
    <label class="form-text" for="blockpy-course-id">New owning course id: </label>
        <input type="text" name="blockpy-course-id" value="${this.main.model.user.courseId()}">
    </div>
    `);
    }

    EDIT_INPUTS(): void {
        let inputText = this.main.model.execution.input().join("\n");
        let clearInputs = this.main.model.display.clearInputs() ? "" : "checked";
        let yes = () => {
            let checked = this.tag.find(".blockpy-remember-inputs").prop("checked");
            let inputs = this.tag.find(".blockpy-input-list").val().split("\n");
            this.main.model.display.clearInputs(!checked);
            this.main.model.execution.input(inputs);
        };
        this.confirm("Edit Remembered Inputs", `

<div class="form-check">
<input type="checkbox" class="blockpy-remember-inputs form-check-input"
        name="blockpy-remember-inputs" ${clearInputs}>
<label class="form-check-label" for="blockpy-remember-inputs">Reuse inputs for next execution</label>
</div>

<textarea class="blockpy-input-list form-control" rows="4">${inputText}</textarea><br>
Edit the inputs above to store and reuse them across multiple executions.
Each input should be put on its own line.
You do not need quotes; the text will be entered literally.
 
`, yes, this.no, "Save");
    }

    START_SHARE(url: string, wasPrompted: boolean): void {
        const initialMessage = wasPrompted ? `
    It looks like you are having some trouble with this problem, your code, or this feedback.
    If you plan to reach out for help from the course staff, then we recommend you include this link
    in your message. It will make it much easier for them to help you quickly. 
    ` : "You can quickly share your code with instructors and TAs by providing them with this link:";
        this.show("Share Your Code", `
    <div class="mb-4">
        ${initialMessage}
    </div>
    <div class="mb-4">
        <pre class="blockpy-copy-share-link-area">${url}</pre>
        <button type='button' class='btn btn-white blockpy-copy-share-link'>Copy Link</button>
    </div>
    <div class="mb-4">
        Note that you CANNOT share this link with other students, or access it yourself.
        This is strictly for sharing with the course staff when something goes wrong or you need help with your code.
    </div>
    `);

        this.tag.find(".blockpy-copy-share-link").on("click", () => {
            navigator.clipboard.writeText(url).then(() => {
                this.tag.find(".blockpy-copy-share-link").html("Copied!");
            });
        });
    }
}
