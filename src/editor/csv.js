import {AbstractEditor} from "./abstract_editor";
import {default_header} from "./default_header";

export const CSV_EDITOR_HTML = `
    ${default_header}
    <div>
        <div class="blockpy-csv-editor-controls mb-2">
            <button class="btn btn-sm btn-primary blockpy-csv-add-row" title="Add Row">
                <i class="fas fa-plus"></i> Add Row
            </button>
            <button class="btn btn-sm btn-primary blockpy-csv-add-column" title="Add Column">
                <i class="fas fa-plus"></i> Add Column
            </button>
            <button class="btn btn-sm btn-danger blockpy-csv-delete-row" title="Delete Selected Row">
                <i class="fas fa-minus"></i> Delete Row
            </button>
            <button class="btn btn-sm btn-danger blockpy-csv-delete-column" title="Delete Selected Column">
                <i class="fas fa-minus"></i> Delete Column
            </button>
        </div>
        <div class="blockpy-csv-editor-table-container">
            <table class="table table-bordered blockpy-csv-editor-table">
                <thead>
                    <tr class="blockpy-csv-header-row"></tr>
                </thead>
                <tbody class="blockpy-csv-body"></tbody>
            </table>
        </div>
        <div class="blockpy-csv-editor-raw mt-2">
            <label>
                <input type="checkbox" class="blockpy-csv-raw-mode"> 
                Edit as Raw CSV Text
            </label>
            <textarea class="form-control blockpy-csv-raw-text" rows="10" style="display: none;"></textarea>
        </div>
    </div>
`;

/**
 * Simple CSV parser
 */
class CSVParser {
    static parseCSV(csvText) {
        if (!csvText || csvText.trim() === "") {
            return [[]];
        }
        
        const lines = [];
        const rows = csvText.split("\n");
        
        for (let row of rows) {
            if (row.trim() === "") {
                continue;
            }
            
            const cells = [];
            let currentCell = "";
            let inQuotes = false;
            
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                const nextChar = row[i + 1];
                
                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        currentCell += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === "," && !inQuotes) {
                    cells.push(currentCell);
                    currentCell = "";
                } else {
                    currentCell += char;
                }
            }
            cells.push(currentCell);
            lines.push(cells);
        }
        
        return lines;
    }
    
    static stringifyCSV(data) {
        if (!data || data.length === 0) {
            return "";
        }
        
        return data.map(row => {
            return row.map(cell => {
                const cellStr = String(cell || "");
                if (cellStr.includes(",") || cellStr.includes("\"") || cellStr.includes("\n")) {
                    return "\"" + cellStr.replace(/"/g, "\"\"") + "\"";
                }
                return cellStr;
            }).join(",");
        }).join("\n");
    }
}

class CsvEditorView extends AbstractEditor {
    constructor(main, tag) {
        super(main, tag);
        this.data = [[]];
        this.selectedRow = -1;
        this.selectedColumn = -1;
        this.dirty = false;
        this.rawMode = false;
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        // Control buttons
        this.tag.find(".blockpy-csv-add-row").on("click", () => this.addRow());
        this.tag.find(".blockpy-csv-add-column").on("click", () => this.addColumn());
        this.tag.find(".blockpy-csv-delete-row").on("click", () => this.deleteRow());
        this.tag.find(".blockpy-csv-delete-column").on("click", () => this.deleteColumn());
        
        // Raw mode toggle
        this.tag.find(".blockpy-csv-raw-mode").on("change", (e) => {
            this.toggleRawMode(e.target.checked);
        });
        
        // Raw text area changes
        this.tag.find(".blockpy-csv-raw-text").on("input", () => {
            this.handleRawTextChange();
        });
    }
    
    enter(newFilename, oldEditor) {
        super.enter(newFilename, oldEditor);
        this.dirty = false;
        this.updateEditor(this.file.handle());
        // Subscribe to the relevant File
        this.currentSubscription = this.file.handle.subscribe(this.updateEditor.bind(this));
        // TODO: update dynamically when changing instructor status
        const isReadOnly = newFilename.startsWith("&") && !this.main.model.display.instructor();
        this.setReadOnly(isReadOnly);
    }
    
    updateEditor(newContents) {
        if (this.dirty) {
            return;
        }
        
        this.dirty = true;
        this.data = CSVParser.parseCSV(newContents);
        this.renderTable();
        this.updateRawText();
        this.dirty = false;
    }
    
    setReadOnly(readOnly) {
        this.tag.find(".blockpy-csv-editor-controls button").prop("disabled", readOnly);
        this.tag.find(".blockpy-csv-raw-mode").prop("disabled", readOnly);
        this.tag.find(".blockpy-csv-raw-text").prop("readonly", readOnly);
        this.tag.find("input, textarea", ".blockpy-csv-editor-table").prop("readonly", readOnly);
    }
    
    renderTable() {
        const headerRow = this.tag.find(".blockpy-csv-header-row");
        const tbody = this.tag.find(".blockpy-csv-body");
        
        headerRow.empty();
        tbody.empty();
        
        if (this.data.length === 0) {
            this.data = [[]];
        }
        
        const maxColumns = Math.max(...this.data.map(row => row.length), 1);
        
        // Render header
        for (let col = 0; col < maxColumns; col++) {
            const th = $(`<th data-column="${col}">Column ${col + 1}</th>`);
            th.on("click", () => this.selectColumn(col));
            headerRow.append(th);
        }
        
        // Render data rows
        this.data.forEach((row, rowIndex) => {
            const tr = $(`<tr data-row="${rowIndex}"></tr>`);
            tr.on("click", (e) => {
                if (e.target.tagName !== "INPUT") {
                    this.selectRow(rowIndex);
                }
            });
            
            for (let col = 0; col < maxColumns; col++) {
                const cellValue = row[col] || "";
                const td = $(`<td data-row="${rowIndex}" data-column="${col}"></td>`);
                const input = $("<input type=\"text\" class=\"form-control form-control-sm\" value=\"\">");
                input.val(cellValue);
                input.on("input", () => this.handleCellChange(rowIndex, col, input.val()));
                td.append(input);
                tr.append(td);
            }
            
            tbody.append(tr);
        });
        
        this.updateSelection();
    }
    
    handleCellChange(row, col, value) {
        if (this.dirty) {
            return;
        }
        
        // Ensure data structure exists
        while (this.data.length <= row) {
            this.data.push([]);
        }
        while (this.data[row].length <= col) {
            this.data[row].push("");
        }
        
        this.data[row][col] = value;
        this.updateFileFromData();
        this.updateRawText();
    }
    
    updateFileFromData() {
        if (this.dirty) {
            return;
        }
        
        this.dirty = true;
        const csvText = CSVParser.stringifyCSV(this.data);
        this.file.handle(csvText);
        this.dirty = false;
    }
    
    addRow() {
        const maxColumns = Math.max(...this.data.map(row => row.length), 1);
        const newRow = new Array(maxColumns).fill("");
        this.data.push(newRow);
        this.renderTable();
        this.updateFileFromData();
        this.selectRow(this.data.length - 1);
    }
    
    addColumn() {
        this.data.forEach(row => row.push(""));
        this.renderTable();
        this.updateFileFromData();
        this.selectColumn(this.data[0].length - 1);
    }
    
    deleteRow() {
        if (this.selectedRow >= 0 && this.selectedRow < this.data.length) {
            this.data.splice(this.selectedRow, 1);
            this.selectedRow = -1;
            this.renderTable();
            this.updateFileFromData();
        }
    }
    
    deleteColumn() {
        if (this.selectedColumn >= 0) {
            this.data.forEach(row => {
                if (row.length > this.selectedColumn) {
                    row.splice(this.selectedColumn, 1);
                }
            });
            this.selectedColumn = -1;
            this.renderTable();
            this.updateFileFromData();
        }
    }
    
    selectRow(rowIndex) {
        this.selectedRow = rowIndex;
        this.selectedColumn = -1;
        this.updateSelection();
    }
    
    selectColumn(columnIndex) {
        this.selectedColumn = columnIndex;
        this.selectedRow = -1;
        this.updateSelection();
    }
    
    updateSelection() {
        // Clear previous selection
        this.tag.find("tr, th").removeClass("table-active");
        
        if (this.selectedRow >= 0) {
            this.tag.find(`tr[data-row="${this.selectedRow}"]`).addClass("table-active");
        }
        if (this.selectedColumn >= 0) {
            this.tag.find(`th[data-column="${this.selectedColumn}"], td[data-column="${this.selectedColumn}"]`).addClass("table-active");
        }
    }
    
    toggleRawMode(enabled) {
        this.rawMode = enabled;
        const table = this.tag.find(".blockpy-csv-editor-table-container");
        const rawText = this.tag.find(".blockpy-csv-raw-text");
        const controls = this.tag.find(".blockpy-csv-editor-controls");
        
        if (enabled) {
            table.hide();
            controls.hide();
            rawText.show();
            this.updateRawText();
        } else {
            table.show();
            controls.show();
            rawText.hide();
            this.handleRawTextChange();
        }
    }
    
    updateRawText() {
        if (!this.rawMode) {
            return;
        }
        
        const csvText = CSVParser.stringifyCSV(this.data);
        this.tag.find(".blockpy-csv-raw-text").val(csvText);
    }
    
    handleRawTextChange() {
        if (this.dirty) {
            return;
        }
        
        const rawText = this.tag.find(".blockpy-csv-raw-text").val();
        this.data = CSVParser.parseCSV(rawText);
        this.renderTable();
        this.updateFileFromData();
    }
    
    exit(newFilename, oldEditor, newEditor) {
        // Remove subscriber
        if (this.currentSubscription) {
            this.currentSubscription.dispose();
        }
        super.exit(newFilename, oldEditor);
    }
}

export const CsvEditor = {
    name: "CSV",
    extensions: [".csv"],
    constructor: CsvEditorView,
    template: CSV_EDITOR_HTML
};