

export const default_header = `
<div class="blockpy-python-toolbar col-md-12 btn-toolbar"
     role="toolbar" aria-label="Python Toolbar">
     <div class="btn-group mr-2">
        <label class="btn btn-outline-secondary">
            <span class="fas fa-file-upload"></span> Upload
            <input class="blockpy-toolbar-upload" type="file"
                hidden
                data-bind="event: {change: ui.editors.upload}">
         </label>

        <button type="button" class="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span class="caret"></span>
            <span class="sr-only">Toggle Dropdown</span>
        </button>
        
        <div class="dropdown-menu dropdown-menu-right">
            <a class='dropdown-item blockpy-toolbar-download'
                data-bind="click: ui.editors.download">
            <span class='fas fa-download'></span> Download
            </a>
        </div>
    </div>
    
    <div class="btn-group mr-2" role="group" aria-label="Delete Group"
        data-bind="visible: ui.editors.canDelete">
        <button type="button" class="btn btn-outline-secondary",
            data-bind="click: ui.files.delete">
            <span class="fas fa-trash"></span> Delete
         </button>
     </div>
 </div>
`;
