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
        //this.tag.modal("hide");
    });
}

BlockPyDialog.prototype.close = function () {
    this.tag.modal("hide");
};

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
    this.okayButton.hide();
    this.tag.draggable({
        "handle": ".modal-title"
    });

    this.tag.on("hidden.bs.modal", function (e) {
        if (onclose !== undefined && onclose !== null) {
            onclose();
        }
    });
};

BlockPyDialog.prototype.confirm = function (title, body, yes, no, yesText) {
    if (yesText === undefined) {
        yesText = "Okay";
    }
    this.show(title, body, no);
    this.yes = yes;
    this.no = no;
    this.okayButton.show().html(yesText);
    // TODO: add okay button and cancel button
};

BlockPyDialog.prototype.ASSIGNMENT_VERSION_CHANGED = function () {
    this.confirm("Assignment Changed", "Your instructor has made changes to this assignment. Would you like to reload? All your work has been saved.",);
};

BlockPyDialog.prototype.ERROR_LOADING_ASSIGNMNENT = function (reason) {
    this.show("Error Loading Assignment", `BlockPy encountered an error while loading the assignment.<br>
Please reload the page and try again.<br>Response from server was:<br><pre>${reason}</pre>`,);
};

BlockPyDialog.prototype.ERROR_LISTING_UPLOADED_FILES = function (reason) {
    this.show("Error Listing Uploaded Files", `BlockPy encountered an error while listing the uploaded files.<br>
Please reload the page and try again.<br>Response from server was:<br><pre>${reason}</pre>`,);
};

BlockPyDialog.prototype.ERROR_UPLOADING_FILE = function (reason) {
    this.show("Error Uploaded File", `BlockPy encountered an error while uploading the file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`,);
};

BlockPyDialog.prototype.ERROR_DOWNLOADING_FILE = function (reason) {
    this.show("Error Downloading File", `BlockPy encountered an error while downloading a file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`,);
};

BlockPyDialog.prototype.ERROR_RENAMING_FILE = function (reason) {
    this.show("Error Renaming File", `BlockPy encountered an error while renaming a file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`,);
};

BlockPyDialog.prototype.ERROR_DELETING_FILE = function (reason) {
    this.show("Error Deleting File", `BlockPy encountered an error while deleting a file.<br>
Please try again.<br>Response from server was:<br><pre>${reason}</pre>`,);
};

BlockPyDialog.prototype.ERROR_SAVING_ASSIGNMNENT = function (reason) {
    this.show("Error Saving Assignment", `BlockPy encountered an error while saving the assignment.<br>
Please reload the page and try again.<br>Response from server was:<br><pre>${reason}</pre>`,);
};

BlockPyDialog.prototype.ERROR_SHOW_STUDENT_ERROR = function (error) {
    this.show("Original Error", `When I ran your code, I encountered an error:\n\n<div class="blockpy-dialog-student-error-message">${error}</div>`);
};

BlockPyDialog.prototype.POSITIVE_FEEDBACK_FULL = function (title, message) {
    this.show(title, message);
};

BlockPyDialog.prototype.SCREENSHOT_BLOCKS = function () {
    // TODO
};

BlockPyDialog.prototype.ERROR_UPDATING_SUBMISSION_STATUS = function () {
    this.show("Error Updating Submission Status", `BlockPy encountered an error while updating your submission status.<br>
Please reload the page and try again.`);
};

BlockPyDialog.prototype.ERROR_LOADING_HISTORY = function () {
    this.show("Error Loading History", `BlockPy encountered an error while loading your history.<br>
Please reload the page and try again.`);
};

BlockPyDialog.prototype.OFFER_FORK = function () {
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
};

BlockPyDialog.prototype.EDIT_INPUTS = function () {
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
    // TODO: Allow user to specify the infinite string to keep giving when the others run out
};

BlockPyDialog.prototype.START_SHARE = function (url, wasPrompted) {
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
        // Copy the URL to the clipboard
        navigator.clipboard.writeText(url).then(() => {
            this.tag.find(".blockpy-copy-share-link").html("Copied!");
        });
    });
};

/**
 * Enhanced State Explorer dialog for viewing complex data structures
 * Supports nested exploration similar to Spyder's variable explorer
 */
BlockPyDialog.prototype.DATA_EXPLORER = function (variableName, type, exactValue) {
    const explorerContent = this.buildDataExplorerContent(variableName, type, exactValue);
    
    this.show(`Data Explorer: ${variableName} (${type})`, explorerContent, () => {
        // Cleanup when dialog closes
        this.tag.find(".data-explorer-item").off("click");
    });
    
    // Make dialog larger for better data viewing
    this.tag.find(".modal-dialog").addClass("modal-xl");
    
    // Set up click handlers for nested exploration
    this.setupDataExplorerHandlers();
};

/**
 * Build HTML content for data explorer based on data type and value
 */
BlockPyDialog.prototype.buildDataExplorerContent = function(variableName, type, exactValue) {
    let content = "<div class=\"data-explorer\">";
    
    try {
        switch (type) {
            case "List":
                content += this.buildListExplorer(variableName, exactValue);
                break;
            case "Dictionary":
                content += this.buildDictExplorer(variableName, exactValue);
                break;
            case "Tuple":
                content += this.buildTupleExplorer(variableName, exactValue);
                break;
            default:
                content += this.buildSimpleValueExplorer(variableName, type, exactValue);
        }
    } catch (error) {
        content += `<div class="alert alert-warning">Error exploring ${type}: ${error.message}</div>`;
        content += `<pre>${exactValue.$r ? exactValue.$r().v : exactValue.toString()}</pre>`;
    }
    
    content += "</div>";
    return content;
};

/**
 * Build explorer content for List data structures
 */
BlockPyDialog.prototype.buildListExplorer = function(variableName, listValue) {
    let content = `<h5>List Contents (${listValue.v.length} items)</h5>`;
    content += "<div class=\"table-responsive\"><table class=\"table table-sm table-striped\">";
    content += "<thead><tr><th>Index</th><th>Type</th><th>Value</th><th>Explore</th></tr></thead><tbody>";
    
    for (let i = 0; i < Math.min(listValue.v.length, 100); i++) {
        const item = listValue.v[i];
        const itemInfo = this.parseDataValue(`${variableName}[${i}]`, item);
        const canExplore = this.canExploreValue(item);
        
        content += "<tr>";
        content += `<td>${i}</td>`;
        content += `<td>${itemInfo.type}</td>`;
        content += `<td><code>${this.escapeHtml(itemInfo.value)}</code></td>`;
        content += "<td>";
        if (canExplore) {
            content += `<button class="btn btn-sm btn-outline-primary data-explorer-item" 
                               data-name="${variableName}[${i}]" 
                               data-type="${itemInfo.type}" 
                               data-index="${i}">
                        <span class="fas fa-search"></span>
                    </button>`;
        }
        content += "</td></tr>";
    }
    
    if (listValue.v.length > 100) {
        content += `<tr><td colspan="4"><em>... and ${listValue.v.length - 100} more items</em></td></tr>`;
    }
    
    content += "</tbody></table></div>";
    return content;
};

/**
 * Build explorer content for Dictionary data structures
 */
BlockPyDialog.prototype.buildDictExplorer = function(variableName, dictValue) {
    let content = "<h5>Dictionary Contents</h5>";
    content += "<div class=\"table-responsive\"><table class=\"table table-sm table-striped\">";
    content += "<thead><tr><th>Key</th><th>Type</th><th>Value</th><th>Explore</th></tr></thead><tbody>";
    
    const entries = Object.entries(dictValue.v);
    for (let i = 0; i < Math.min(entries.length, 100); i++) {
        const [key, value] = entries[i];
        const keyInfo = this.parseDataValue("key", key);
        const valueInfo = this.parseDataValue(`${variableName}[${keyInfo.value}]`, value);
        const canExplore = this.canExploreValue(value);
        
        content += "<tr>";
        content += `<td><code>${this.escapeHtml(keyInfo.value)}</code></td>`;
        content += `<td>${valueInfo.type}</td>`;
        content += `<td><code>${this.escapeHtml(valueInfo.value)}</code></td>`;
        content += "<td>";
        if (canExplore) {
            content += `<button class="btn btn-sm btn-outline-primary data-explorer-item" 
                               data-name="${variableName}[${this.escapeHtml(keyInfo.value)}]" 
                               data-type="${valueInfo.type}" 
                               data-key="${this.escapeHtml(keyInfo.value)}">
                        <span class="fas fa-search"></span>
                    </button>`;
        }
        content += "</td></tr>";
    }
    
    if (entries.length > 100) {
        content += `<tr><td colspan="4"><em>... and ${entries.length - 100} more entries</em></td></tr>`;
    }
    
    content += "</tbody></table></div>";
    return content;
};

/**
 * Build explorer content for Tuple data structures
 */
BlockPyDialog.prototype.buildTupleExplorer = function(variableName, tupleValue) {
    let content = `<h5>Tuple Contents (${tupleValue.v.length} items)</h5>`;
    content += "<div class=\"table-responsive\"><table class=\"table table-sm table-striped\">";
    content += "<thead><tr><th>Index</th><th>Type</th><th>Value</th><th>Explore</th></tr></thead><tbody>";
    
    for (let i = 0; i < Math.min(tupleValue.v.length, 100); i++) {
        const item = tupleValue.v[i];
        const itemInfo = this.parseDataValue(`${variableName}[${i}]`, item);
        const canExplore = this.canExploreValue(item);
        
        content += "<tr>";
        content += `<td>${i}</td>`;
        content += `<td>${itemInfo.type}</td>`;
        content += `<td><code>${this.escapeHtml(itemInfo.value)}</code></td>`;
        content += "<td>";
        if (canExplore) {
            content += `<button class="btn btn-sm btn-outline-primary data-explorer-item" 
                               data-name="${variableName}[${i}]" 
                               data-type="${itemInfo.type}" 
                               data-index="${i}">
                        <span class="fas fa-search"></span>
                    </button>`;
        }
        content += "</td></tr>";
    }
    
    if (tupleValue.v.length > 100) {
        content += `<tr><td colspan="4"><em>... and ${tupleValue.v.length - 100} more items</em></td></tr>`;
    }
    
    content += "</tbody></table></div>";
    return content;
};

/**
 * Build explorer content for simple values
 */
BlockPyDialog.prototype.buildSimpleValueExplorer = function(variableName, type, exactValue) {
    let content = `<h5>${type} Value</h5>`;
    content += "<div class=\"mb-3\">";
    content += "<label class=\"form-label\">Raw Value:</label>";
    content += `<pre class="bg-light p-3 border rounded">${this.escapeHtml(exactValue.$r ? exactValue.$r().v : exactValue.toString())}</pre>`;
    content += "</div>";
    
    if (exactValue.$r) {
        content += "<div class=\"mb-3\">";
        content += "<label class=\"form-label\">String Representation:</label>";
        content += `<pre class="bg-light p-3 border rounded">${this.escapeHtml(exactValue.$r().v)}</pre>`;
        content += "</div>";
    }
    
    return content;
};

/**
 * Parse a Skulpt value to get readable information
 */
BlockPyDialog.prototype.parseDataValue = function(name, value) {
    if (value === undefined) {
        return { name, type: "Unknown", value: "Undefined" };
    }
    
    // Use existing parsing logic from BlockPyTrace
    if (window.BlockPyTrace && window.BlockPyTrace.parseValue) {
        const parsed = window.BlockPyTrace.parseValue(name, value, true);
        return parsed || { name, type: "Unknown", value: "Unknown" };
    }
    
    // Fallback parsing
    if (value.constructor === Sk.builtin.str) {
        return { name, type: "String", value: value.$r().v };
    } else if (value.constructor === Sk.builtin.int_) {
        return { name, type: "Integer", value: value.$r().v };
    } else if (value.constructor === Sk.builtin.float_) {
        return { name, type: "Float", value: value.$r().v };
    } else if (value.constructor === Sk.builtin.bool) {
        return { name, type: "Boolean", value: value.$r().v };
    } else if (value.constructor === Sk.builtin.list) {
        return { name, type: "List", value: `[${value.v.length} items]` };
    } else if (value.constructor === Sk.builtin.dict) {
        return { name, type: "Dictionary", value: `{${Object.keys(value.v).length} keys}` };
    } else if (value.constructor === Sk.builtin.tuple) {
        return { name, type: "Tuple", value: `(${value.v.length} items)` };
    } else {
        return { name, type: value.tp$name || "Object", value: value.$r ? value.$r().v : value.toString() };
    }
};

/**
 * Check if a value can be explored further
 */
BlockPyDialog.prototype.canExploreValue = function(value) {
    if (!value) {return false;}
    
    return value.constructor === Sk.builtin.list ||
           value.constructor === Sk.builtin.dict ||
           value.constructor === Sk.builtin.tuple ||
           (value.v && (Array.isArray(value.v) || typeof value.v === "object"));
};

/**
 * Set up click handlers for nested data exploration
 */
BlockPyDialog.prototype.setupDataExplorerHandlers = function() {
    const self = this;
    
    this.tag.find(".data-explorer-item").on("click", function() {
        const button = $(this);
        const itemName = button.data("name");
        const itemType = button.data("type");
        const index = button.data("index");
        const key = button.data("key");
        
        // Get the current dialog's exact value and navigate to the item
        // This is a simplified approach - in a full implementation, we'd store references
        // to the original data structure to allow deep navigation
        
        // For now, create a new dialog with placeholder content
        const newDialog = new BlockPyDialog(self.main, $("<div>").appendTo("body"));
        newDialog.show(`Data Explorer: ${itemName} (${itemType})`, 
                       `<div class="alert alert-info">
                Nested exploration of ${itemName} would open here.
                <br><br>
                <strong>Item:</strong> ${itemName}<br>
                <strong>Type:</strong> ${itemType}<br>
                ${index !== undefined ? `<strong>Index:</strong> ${index}<br>` : ""}
                ${key !== undefined ? `<strong>Key:</strong> ${key}<br>` : ""}
            </div>`);
            
        newDialog.tag.find(".modal-dialog").addClass("modal-lg");
    });
};

/**
 * Utility function to escape HTML
 */
BlockPyDialog.prototype.escapeHtml = function(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
};