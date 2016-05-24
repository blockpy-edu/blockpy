function BlockPyEditor(main, tag) {
    this.main = main;
    this.tag = tag;
    
    this.converter = new PythonToBlocks();
    
    // HTML DOM accessors
    this.blockTag = tag.find('.blockpy-blocks');
    this.textTag = tag.find('.blockpy-text');
    this.uploadTag = tag.find('.blockpy-upload');
    this.instructorTag = tag.find('.blockpy-instructor');
    this.textSidebarTag = this.textTag.find(".blockpy-text-sidebar");
    
    // Blockly and CodeMirror instances
    this.blockly = null;
    this.codeMirror = null;
    this.updateStack = [];
    
    // Keep track of the toolbox width
    this.blocklyToolboxWidth = 0;
    
    // Initialize subcomponents
    this.initBlockly();
    this.initText();
    
    var editor = this;
    
    // Handle mode switching
    this.main.model.settings.editor.subscribe(function() {editor.setMode()});
    this.setMode();
    
    // Handle level switching
    this.main.model.settings.level.subscribe(function() {editor.setLevel()});
}

BlockPyEditor.prototype.initBlockly = function() {
    var blocklyDiv = this.blockTag.find('.blockly-div')[0];
    this.blockly = Blockly.inject(blocklyDiv,
                                  { path: this.main.model.constants.blocklyPath, 
                                    scrollbars: this.main.model.constants.blocklyScrollbars, 
                                    readOnly: this.main.model.settings.read_only(),
                                    zoom: {enabled: false},
                                    toolbox: this.getToolbox()});
    // Activate tracing in blockly for highlighting
    this.blockly.traceOn(true);
    // Activate undo/redo
    this.blockly.enableUndo();
    // Register model changer
    var editor = this;
    this.blockly.addChangeListener(function() {editor.updateCodeFromBlocks()});
    //this.main.model.program.subscribe(function() {editor.updateBlocks()});
    // Force the proper window size
    this.blockly.resize();
    // Keep the toolbox width set
    this.blocklyToolboxWidth = this.blockly.toolbox_.width;
};

BlockPyEditor.prototype.initText = function() {
    var codeMirrorDiv = this.textTag.find('.codemirror-div')[0];
    this.codeMirror = CodeMirror.fromTextArea(codeMirrorDiv, {
                                        mode: { name: "python", 
                                                version: 3, 
                                                singleLineStringErrors: false
                                        },
                                        readOnly: this.main.model.settings.read_only(),
                                        lineNumbers: true,
                                        firstLineNumber: 1,
                                        indentUnit: 4,
                                        tabSize: 4,
                                        indentWithTabs: false,
                                        matchBrackets: true,
                                        extraKeys: {"Tab": "indentMore", 
                                                    "Shift-Tab": "indentLess"},
                                      });
    // Register model changer
    var editor = this;
    this.codeMirror.on("change", function() {editor.updateCodeFromText()});
    this.main.model.program.subscribe(function() {editor.updateText()});
    // Ensure that it fills the editor area
    this.codeMirror.setSize(null, "100%");
    
    this.tag.find('.blockpy-text-insert-if').click(function() {
        var line_number = blockpy.components.editor.codeMirror.getCursor().line;
        var line = blockpy.components.editor.codeMirror.getLine(line_number);
        var whitespace = line.match(/^(\s*)/)[1];
        editor.codeMirror.replaceSelection("if ___:\n    "+whitespace+"pass");
    });
    this.tag.find('.blockpy-text-insert-if-else').click(function() {
        var line_number = blockpy.components.editor.codeMirror.getCursor().line;
        var line = blockpy.components.editor.codeMirror.getLine(line_number);
        var whitespace = line.match(/^(\s*)/)[1];
        editor.codeMirror.replaceSelection("if ___:\n    "+whitespace+"pass\n"+whitespace+"else:\n    "+whitespace+"pass");
    });
};

BlockPyEditor.prototype.hideTextMenu = function() {
    this.textTag.css('height', '0%');
    $(this.codeMirror.getWrapperElement()).hide();
}
BlockPyEditor.prototype.showTextMenu = function() {
    // Adjust height
    this.textTag.css('height', '100%');
    // Show CodeMirror
    $(this.codeMirror.getWrapperElement()).show();
    this.codeMirror.refresh();
    
    // Resize sidebar
    var codemirrorGutterWidth = $('.CodeMirror-gutters').width();
    var sideBarWidth = this.blocklyToolboxWidth-codemirrorGutterWidth-2;
    this.textSidebarTag.css('width', sideBarWidth+'px');
}

BlockPyEditor.prototype.hideBlockMenu = function() {
    this.blocklyToolboxWidth = this.blockly.toolbox_.width;
    this.blockTag.css('height', '0%');
    this.blockly.setVisible(false);
}

BlockPyEditor.prototype.showBlockMenu = function() {
    this.blockTag.css('height', '100%');
    this.blockly.resize();
    this.blockly.setVisible(true);
}
BlockPyEditor.prototype.showUploadMenu = function() {
}
BlockPyEditor.prototype.hideUploadMenu = function() {
}
BlockPyEditor.prototype.showInstructorMenu = function() {
}
BlockPyEditor.prototype.hideInstructorMenu = function() {
}

BlockPyEditor.prototype.setModeToText = function() {
    this.hideBlockMenu();
    this.hideUploadMenu();
    this.hideInstructorMenu();
    this.showTextMenu();
    // Update the text model from the blocks
    //this.updateText(); TODO: is this necessary?
}

BlockPyEditor.prototype.setModeToBlocks = function() {
    this.hideTextMenu();
    this.hideUploadMenu();
    this.hideInstructorMenu();
    this.showBlockMenu();
    // Update the blocks model from the text
    this.updateBlocks();
}

BlockPyEditor.prototype.setModeToUpload = function() {
    this.hideTextMenu();
    this.hideInstructorMenu();
    this.hideBlockMenu();
    this.showUploadMenu();
    //TODO: finish upload mode
    this.main.reportError("editor", "Upload mode has not been implemented");
}

BlockPyEditor.prototype.setModeToInstructor = function() {
    this.hideTextMenu();
    this.hideBlockMenu();
    this.hideUploadMenu();
    this.showInstructorMenu();
    //TODO: finish upload mode
    this.main.reportError("editor", "Instructor mode has not been implemented");
}

BlockPyEditor.prototype.changeMode = function() {
    if (main.model.settings.editor() == "Blocks") {
        main.model.settings.editor("Text");
    } else {
        main.model.settings.editor("Blocks");
    }
}

BlockPyEditor.prototype.setMode = function(mode) {
    // Either update the model, or go with the model's
    if (mode === undefined) {
        mode = this.main.model.settings.editor();
    } else {
        this.main.model.settings.editor(mode);
    }
    // Dispatch according to new mode
    if (mode == 'Blocks') {
        //this.updateCodeFromText()
        this.setModeToBlocks();
    } else if (mode == 'Text') {
        //this.updateCodeFromBlocks();
        this.setModeToText();
    } else if (mode == 'Upload') {
        this.setModeToUpload();
    } else if (mode == 'Instructor') {
        this.setModeToInstructor();
    } else {
        this.main.reportError("editor", "Invalid Mode: "+mode);
    }
}

BlockPyEditor.prototype.updateCodeFromBlocks = function() {
    if (this.updateStack.slice(-1).pop() !== undefined) {
        return;
    }
    var newCode = Blockly.Python.workspaceToCode(this.blockly);
    this.updateStack.push('blocks');
    this.main.setCode(newCode);
    this.updateStack.pop();
}
BlockPyEditor.prototype.updateCodeFromText = function() {
    if (this.updateStack.slice(-1).pop() !== undefined) {
        return;
    }
    var newCode = this.codeMirror.getValue();
    this.updateStack.push('text');
    this.main.setCode(newCode);
    this.unhighlightLines();
    this.updateStack.pop();
    // Ensure that we maintain proper highlighting
}

BlockPyEditor.prototype.updateText = function() {
    if (this.updateStack.slice(-1).pop() == 'text') {
        return;
    }
    var code = this.main.model.program();
    this.updateStack.push('text');
    if (code == "") {
        this.codeMirror.setValue("\n");
    } else {
        this.codeMirror.setValue(code);
    }
    this.updateStack.pop();
}

BlockPyEditor.prototype.updateBlocks = function() {
    if (this.updateStack.slice(-1).pop() == 'blocks') {
        return;
    }
    var code = this.main.model.program();
    if (code.trim().charAt(0) !== '<') {
        var result = this.converter.convertSource(code);
        code = result.xml;
        if (result.error !== null) {
            this.reportError('editor', "Partial conversion error: "+ result.error);
        }
    }
    var blocklyXml = Blockly.Xml.textToDom(code);
    this.updateStack.push('blocks');
    this.setBlocksFromXml(blocklyXml);
    // Parsons shuffling
    if (this.main.model.assignment.parsons()) {
        this.blockly.shuffle();
    } else {
        this.blockly.align();
    }
    this.updateStack.pop();
}

BlockPyEditor.prototype.getBlocksFromXml = function() {
    return Blockly.Xml.workspaceToDom(this.blockly);
}
          
BlockPyEditor.prototype.setBlocksFromXml = function(xml) {
    this.blockly.clear();
    Blockly.Xml.domToWorkspace(xml, this.blockly);
}

BlockPyEditor.prototype.previousLine = null;
BlockPyEditor.prototype.highlightLine = function(line) {
    if (this.previousLine !== null) {
        this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.codeMirror.addLineClass(line, 'text', 'editor-active-line');
    this.previousLine = line;
}
BlockPyEditor.prototype.highlightError = function(line) {
    if (this.previousLine !== null) {
        this.text.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.text.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.text.addLineClass(line, 'text', 'editor-error-line');
    this.previousLine = line;
}
BlockPyEditor.prototype.highlightBlock = function(block) {
    this.blockly.highlightBlock(block);
}
BlockPyEditor.prototype.unhighlightBlock = function() {
    // TODO:
}
BlockPyEditor.prototype.unhighlightLines = function() {
    if (this.previousLine !== null) {
        this.text.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.text.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.previousLine = null;
}

/*
 * Builds up an array indicating the relevant block ID for a given step.
 * Operates on the current this.blockly instance
 * It works by injecting __HIGHLIGHT__(id); at the start of every line of code
 *  and then extracting that with regular expressions. This makes it vulnerable
 *  if someone decides to use __HIGHLIGHT__ in their code. I'm betting on that
 *  never being a problem, though.
 */
BlockPyEditor.prototype.getHighlightMap = function() {
    // Protect the current STATEMENT_PREFIX
    var backup = Blockly.Python.STATEMENT_PREFIX;
    Blockly.Python.STATEMENT_PREFIX = '__HIGHLIGHT__(%1);';
    Blockly.Python.addReservedWords('__HIGHLIGHT__');
    // Get the source code, injected with __HIGHLIGHT__(id)
    var highlightedCode = Blockly.Python.workspaceToCode(this.blockly);
    Blockly.Python.STATEMENT_PREFIX = backup;
    // Build up the array by processing the highlighted code line-by-line
    var highlightMap = [];
    var lines = highlightedCode.split("\n");
    for (var i = 0; i < lines.length; i++) {
        // Get the block ID from the line
        var id = lines[i].match(/\W*__HIGHLIGHT__\(\'(.+?)\'\)/);
        if (id !== null) {
            // Convert it into a base-10 number, because JavaScript.
            highlightMap[i] = parseInt(id[1], 10);
        }
    }
    return highlightMap;
}


BlockPyEditor.prototype.changeProgram = function(name) {
    this.silentChange_ = true;
    this.model.settings.filename = name;
    this.editor.setPython(this.model.programs[name]);
    this.toolbar.elements.programs.find("[data-name="+name+"]").click();
}

BlockPyEditor.prototype.setLevel = function() {
    var level = this.main.model.settings.level();
    
}

BlockPyEditor.prototype.getToolbox = function() {
    return '<xml id="toolbox" style="display: none">'+
                '<category name="Properties" custom="VARIABLE" colour="240">'+
                '</category>'+
                '<category name="Decisions" colour="330">'+
                    '<block type="controls_if"></block>'+
                    '<block type="controls_if"><mutation else="1"></mutation></block>'+
                    '<block type="logic_compare"></block>'+
                    '<block type="logic_operation"></block>'+
                    '<block type="logic_negate"></block>'+
                '</category>'+
                '<category name="Iteration" colour="300">'+
                    '<block type="controls_forEach"></block>'+
                '</category>'+
                '<category name="Functions" custom="PROCEDURE" colour="210">'+
                '</category>'+
                '<category name="Calculation" colour="270">'+
                    //'<block type="raw_table"></block>'+
                    '<block type="math_arithmetic"></block>'+
                    //'<block type="type_check"></block>'+
                    //'<block type="raw_empty"></block>'+
                    //'<block type="math_single"></block>'+
                    //'<block type="math_number_property"></block>'+
                    '<block type="math_round"></block>'+
                    //'<block type="text_join"></block>'+
                '</category>'+
                '<category name="Python" colour="180">'+
                    '<block type="raw_block"></block>'+
                    '<block type="raw_expression"></block>'+
                    //'<block type="function_call"></block>'+
                '</category>'+
                '<category name="Output" colour="160">'+
                    '<block type="text_print"></block>'+
                    //'<block type="text_print_multiple"></block>'+
                    '<block type="plot_line"></block>'+
                    //'<block type="plot_scatter"></block>'+
                    '<block type="plot_show"></block>'+
                    '<block type="plot_title"></block>'+
                '</category>'+
                '<sep></sep>'+
                '<category name="Values" colour="100">'+
                    '<block type="text"></block>'+
                    '<block type="math_number"></block>'+
                    '<block type="logic_boolean"></block>'+
                '</category>'+
                '<category name="Lists" colour="30">'+
                    '<block type="lists_create_empty"></block>'+
                    '<block type="lists_append"></block>'+
                    '<block type="lists_length"></block>'+
                    '<block type="lists_create_with"></block>'+
                    '<block type="lists_index">'+
                        '<value name="ITEM">'+
                          '<shadow type="math_number">'+
                            '<field name="NUM">0</field>'+
                          '</shadow>'+
                        '</value>'+
                    '</block>'+
                '</category>'+
                '<category name="Dictionaries" colour="0">'+
                    '<block type="dict_get_literal"></block>'+
                    '<block type="dict_keys"></block>'+
                    '<block type="dicts_create_with"></block>'+
                '</category>'+
                '<sep></sep>'+
                '<category name="Data - Weather" colour="70">'+
                    '<block type="weather_temperature"></block>'+
                    '<block type="weather_report"></block>'+
                    '<block type="weather_forecasts"></block>'+
                    '<block type="weather_report_forecasts"></block>'+
                    '<block type="weather_all_forecasts"></block>'+
                    '<block type="weather_highs_lows"></block>'+
                '</category>'+
                '<category name="Data - Stock" colour="65">'+
                    '<block type="stocks_current"></block>'+
                    '<block type="stocks_past"></block>'+
                '</category>'+
                '<category name="Data - Earthquakes" colour="60">'+
                    '<block type="earthquake_get"></block>'+
                    '<block type="earthquake_both"></block>'+
                    '<block type="earthquake_all"></block>'+
                '</category>'+
                '<category name="Data - Crime" colour="55">'+
                    '<block type="crime_state"></block>'+
                    '<block type="crime_year"></block>'+
                    '<block type="crime_all"></block>'+
                '</category>'+
                '<category name="Data - Books" colour="50">'+
                    '<block type="books_get"></block>'+
                '</category>'+
            '</xml>';
}


BlockPyEditor.prototype.copyImage = function() {
    aleph = this.blockly.svgBlockCanvas_.cloneNode(true);
    aleph.removeAttribute("width");
    aleph.removeAttribute("height");
    if (aleph.children[0] !== undefined) {
        aleph.removeAttribute("transform");
        aleph.children[0].removeAttribute("transform");
        aleph.children[0].children[0].removeAttribute("transform");
        var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
        linkElm.textContent = Blockly.Css.CONTENT.join('') + '\n\n';
        aleph.insertBefore(linkElm, aleph.firstChild);
        var bbox = document.getElementsByClassName("blocklyBlockCanvas")[0].getBBox();
        var xml = new XMLSerializer().serializeToString(aleph);
        xml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+bbox.width+'" height="'+bbox.height+'" viewBox="0 0 '+bbox.width+' '+bbox.height+'"><rect width="100%" height="100%" fill="white"></rect>'+xml+'</svg>';
        var data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
        var img  = document.createElement("img");
        img.setAttribute('src', data);
        img.style.display = 'block';
        var span = document.createElement('span');
        span.textContent = "Right-click and copy the image below."
        var div = document.createElement('div');
        div.appendChild(span);
        div.appendChild(img);
        //document.body.appendChild(img);
        
        this.main.components.dialog.show("Blocks as Image", div);
    }
}