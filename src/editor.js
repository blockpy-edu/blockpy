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
    this.blocksFailed = false;
    
    // Keep track of the toolbox width
    this.blocklyToolboxWidth = 0;
    
    // Initialize subcomponents
    this.initText();
    this.initBlockly();
    this.initInstructor();
    
    var editor = this;
    
    // Handle mode switching
    this.main.model.settings.editor.subscribe(function() {editor.setMode()});
    
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
                                    toolbox: this.updateToolbox(false)});
    // Activate tracing in blockly for highlighting
    this.blockly.traceOn(true);
    // Activate undo/redo
    this.blockly.enableUndo();
    // Register model changer
    var editor = this;
    this.blockly.addChangeListener(function() { 
        //editor.main.components.feedback.clearEditorErrors();
        editor.updateCodeFromBlocks();
    });
    //this.main.model.program.subscribe(function() {editor.updateBlocks()});
    this.main.model.settings.filename.subscribe(function() {
        if (editor.main.model.settings.editor() == "Blocks") {
            editor.updateBlocks()
        }
    });
    this.main.model.assignment.modules.subscribe(function() {editor.updateToolbox(true)});
    // Force the proper window size
    this.blockly.resize();
    // Keep the toolbox width set
    this.blocklyToolboxWidth = this.blockly.toolbox_.width;
    
    Blockly.captureDialog_ = this.copyImage.bind(this);
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
    this.codeMirror.on("change", function() {
        //editor.main.components.feedback.clearEditorErrors();
        editor.updateCodeFromText()
    });
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

BlockPyEditor.prototype.initInstructor = function() {
    var introductionEditor = this.instructorTag.find('.blockpy-presentation-body-editor');
    var model = this.main.model;
    introductionEditor.summernote({
        codemirror: { // codemirror options
            theme: 'monokai'
        },
        onChange: model.assignment.introduction,
        toolbar: [
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['fontname', 'fontsize']],
            ['insert', ['link', 'table', 'ul', 'ol', 'image']],
            ['misc', ['codeview', 'help']]
        ]
    });
    introductionEditor.code(model.assignment.introduction());
    
    this.availableModules = this.instructorTag.find('.blockpy-available-modules');
    this.availableModules.multiSelect({ selectableOptgroup: true });
    
    
}

BlockPyEditor.prototype.addAvailableModule = function(name) {
    this.availableModules.multiSelect('addOption', { 
        'value': name, 'text': name
    });
    this.availableModules.multiSelect('select', name);
};

BlockPyEditor.prototype.hideTextMenu = function() {
    this.textTag.css('height', '0%');
    $(this.codeMirror.getWrapperElement()).hide();
    this.textSidebarTag.hide();
    this.textTag.hide();
}
BlockPyEditor.prototype.showTextMenu = function() {
    this.textTag.show();
    // Adjust height
    this.textTag.css('height', '100%');
    // Show CodeMirror
    $(this.codeMirror.getWrapperElement()).show();
    this.codeMirror.refresh();
    
    // Resize sidebar
    var codemirrorGutterWidth = $('.CodeMirror-gutters').width();
    var sideBarWidth = this.blocklyToolboxWidth-codemirrorGutterWidth-2;
    this.textSidebarTag.css('width', sideBarWidth+'px');
    this.textSidebarTag.show();
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
    this.uploadTag.css('height', '100%');
    this.uploadTag.show();
}
BlockPyEditor.prototype.hideUploadMenu = function() {
    this.uploadTag.hide();
    this.uploadTag.css('height', '0%');
}
BlockPyEditor.prototype.showInstructorMenu = function() {
    this.instructorTag.css('height', '100%');
    this.instructorTag.show();
}
BlockPyEditor.prototype.hideInstructorMenu = function() {
    this.instructorTag.hide();
    this.instructorTag.css('height', '0%');
}

BlockPyEditor.prototype.setModeToText = function() {
    this.hideBlockMenu();
    this.hideUploadMenu();
    this.hideInstructorMenu();
    this.showTextMenu();
    // Update the text model from the blocks
    this.updateText(); //TODO: is this necessary?
}

BlockPyEditor.prototype.setModeToBlocks = function() {
    this.hideTextMenu();
    this.hideUploadMenu();
    this.hideInstructorMenu();
    this.showBlockMenu();
    // Update the blocks model from the text
    success = this.updateBlocks();
    if (!success) {
        var main = this.main;
        main.components.editor.updateText();
        main.model.settings.editor("Text");
        setTimeout(function() {
            main.components.toolbar.tags.mode_set_text.click();
        }, 0);
    }
}

BlockPyEditor.prototype.setModeToUpload = function() {
    this.hideTextMenu();
    this.hideInstructorMenu();
    this.hideBlockMenu();
    this.showUploadMenu();
    //TODO: finish upload mode
}

BlockPyEditor.prototype.setModeToInstructor = function() {
    this.hideTextMenu();
    this.hideBlockMenu();
    this.hideUploadMenu();
    this.showInstructorMenu();
    //TODO: finish upload mode
    //this.main.reportError("editor", "Instructor mode has not been implemented");
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
    // TODO: Check to see if an actual change or not
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
    if (code == undefined || code.trim() == "") {
        this.codeMirror.setValue("\n");
    } else {
        this.codeMirror.setValue(code);
    }
    this.refreshHighlight();
    this.updateStack.pop();
}

BlockPyEditor.prototype.updateBlocks = function() {
    if (this.updateStack.slice(-1).pop() == 'blocks') {
        return;
    }
    var python_code = this.main.model.program().trim(), xml_code = "";
    if (python_code !== '' && python_code !== undefined && python_code.trim().charAt(0) !== '<') {
        var result = this.converter.convertSource(python_code);
        xml_code = result.xml;
        if (result.error !== null) {
            this.blocksFailed = true;
            this.main.reportError('editor', result.error, "While attempting to convert the Python code into blocks, I found a syntax error. In other words, your Python code has a spelling or grammatical mistake. You should check to make sure that you have written all of your code correctly. To me, it looks like the problem is on line "+ result.error.args.v[2]+', where it says:<br><code>'+result.error.args.v[3][2]+'</code>', result.error.args.v[2]);
            return false;
        }
    }
    if (xml_code !== '' && xml_code !== undefined) {
        var blocklyXml = Blockly.Xml.textToDom(xml_code);
        this.updateStack.push('blocks');
        try {
            this.setBlocksFromXml(blocklyXml);
        } catch (e) {
            console.error(e);
            var error_code = this.converter.convertSourceToCodeBlock(python_code);
            var blocklyXml = Blockly.Xml.textToDom(error_code);
            this.setBlocksFromXml(blocklyXml);
        }
    } else {
        this.updateStack.push('blocks');
        this.blockly.clear();
    }
    // Parsons shuffling
    if (this.main.model.assignment.parsons()) {
        this.blockly.shuffle();
    } else {
        this.blockly.align();
    }
    if (this.previousLine !== null) {
        this.refreshBlockHighlight(this.previousLine);
    }
    this.updateStack.pop();
    return true;
}

BlockPyEditor.prototype.getBlocksFromXml = function() {
    return Blockly.Xml.workspaceToDom(this.blockly);
}
          
BlockPyEditor.prototype.setBlocksFromXml = function(xml) {
    this.blockly.clear();
    Blockly.Xml.domToWorkspace(xml, this.blockly);
    //console.log(this.blockly.getAllBlocks());
}

BlockPyEditor.prototype.previousLine = null;
BlockPyEditor.prototype.refreshHighlight = function() {
    if (this.previousLine !== null) {
        this.codeMirror.addLineClass(this.previousLine, 'text', 'editor-error-line');
    }
}
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
        this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.codeMirror.addLineClass(line, 'text', 'editor-error-line');
    this.refreshBlockHighlight(line);
    this.previousLine = line;
}
BlockPyEditor.prototype.highlightBlock = function(block) {
    this.blockly.highlightBlock(block);
}

BlockPyEditor.prototype.refreshBlockHighlight = function(line) {
    if (this.blocksFailed) {
        this.blocksFailed = false;
        return;
    }
    if (this.main.model.settings.editor() != "Blocks") {
        return;
    }
    var all_blocks = this.blockly.getAllBlocks();
    //console.log(all_blocks.map(function(e) { return e.lineNumber }));
    var blockMap = {};
    all_blocks.forEach(function(elem) {
        var lineNumber = parseInt(elem.lineNumber, 10);
        if (lineNumber in blockMap) {
            blockMap[lineNumber].push(elem);
        } else {
            blockMap[lineNumber] = [elem];
        }
    });
    if (1+line in blockMap) {
        var hblocks = blockMap[1+line];
        /*hblocks.forEach(function(elem) {
            elem.addSelect();
        });*/
        if (hblocks.length > 0) {
            this.blockly.highlightBlock(hblocks[0].id);
        }
    }
}
BlockPyEditor.prototype.unhighlightBlock = function() {
    // TODO:
}
BlockPyEditor.prototype.unhighlightLines = function() {
    if (this.previousLine !== null) {
        this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-active-line');
        this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-error-line');
    }
    this.previousLine = null;
}

/*
 * DEPRECATED, thankfully
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

BlockPyEditor.CATEGORY_MAP = {
    'Properties': '<category name="Properties" custom="VARIABLE" colour="240">'+
                  '</category>',
    'Decisions': '<category name="Decisions" colour="330">'+
                    '<block type="controls_if"></block>'+
                    '<block type="controls_if"><mutation else="1"></mutation></block>'+
                    '<block type="logic_compare"></block>'+
                    '<block type="logic_operation"></block>'+
                    '<block type="logic_negate"></block>'+
                  '</category>',
    'Iteration': '<category name="Iteration" colour="300">'+
                    '<block type="controls_forEach"></block>'+
                '</category>',
    'Functions': '<category name="Functions" custom="PROCEDURE" colour="210">'+
                '</category>',
    'Calculation': '<category name="Calculation" colour="270">'+
                    //'<block type="raw_table"></block>'+
                    '<block type="math_arithmetic"></block>'+
                    //'<block type="type_check"></block>'+
                    //'<block type="raw_empty"></block>'+
                    //'<block type="math_single"></block>'+
                    //'<block type="math_number_property"></block>'+
                    '<block type="math_round"></block>'+
                    //'<block type="text_join"></block>'+
                '</category>',
    'Python':   '<category name="Python" colour="180">'+
                    '<block type="raw_block"></block>'+
                    '<block type="raw_expression"></block>'+
                    //'<block type="function_call"></block>'+
                '</category>',
    'Output':   '<category name="Output" colour="160">'+
                    '<block type="text_print"></block>'+
                    //'<block type="text_print_multiple"></block>'+
                    '<block type="plot_line"></block>'+
                    '<block type="plot_scatter"></block>'+
                    '<block type="plot_hist"></block>'+
                    '<block type="plot_show"></block>'+
                    '<block type="plot_title"></block>'+
                    '<block type="plot_xlabel"></block>'+
                    '<block type="plot_ylabel"></block>'+
                '</category>',
    'Values':   '<category name="Values" colour="100">'+
                    '<block type="text"></block>'+
                    '<block type="math_number"></block>'+
                    '<block type="logic_boolean"></block>'+
                '</category>',
    'Lists':    '<category name="Lists" colour="30">'+
                    '<block type="lists_create_with">'+
                        '<value name="ADD0">'+
                          '<block type="math_number"><field name="NUM">0</field></block>'+
                        '</value>'+
                        '<value name="ADD1">'+
                          '<block type="math_number"><field name="NUM">0</field></block>'+
                        '</value>'+
                        '<value name="ADD2">'+
                          '<block type="math_number"><field name="NUM">0</field></block>'+
                        '</value>'+
                    '</block>'+
                    '<block type="lists_create_with"></block>'+
                    '<block type="lists_create_empty"></block>'+
                    '<block type="lists_append"></block>'+
                    /*'<block type="lists_length"></block>'+*/
                    /*'<block type="lists_index">'+
                        '<value name="ITEM">'+
                          '<shadow type="math_number">'+
                            '<field name="NUM">0</field>'+
                          '</shadow>'+
                        '</value>'+
                    '</block>'+*/
                '</category>',
    'Dictionaries': '<category name="Dictionaries" colour="0">'+
                    '<block type="dicts_create_with"></block>'+
                    '<block type="dict_get_literal"></block>'+
                    //'<block type="dict_keys"></block>'+
                '</category>',
    /*
    'Data - Weather': '<category name="Data - Weather" colour="70">'+
                    '<block type="weather_temperature"></block>'+
                    '<block type="weather_report"></block>'+
                    '<block type="weather_forecasts"></block>'+
                    '<block type="weather_report_forecasts"></block>'+
                    '<block type="weather_all_forecasts"></block>'+
                    '<block type="weather_highs_lows"></block>'+
                '</category>',
    'Data - Stocks': '<category name="Data - Stock" colour="65">'+
                    '<block type="stocks_current"></block>'+
                    '<block type="stocks_past"></block>'+
                '</category>',
    'Data - Earthquakes': '<category name="Data - Earthquakes" colour="60">'+
                    '<block type="earthquake_get"></block>'+
                    '<block type="earthquake_both"></block>'+
                    '<block type="earthquake_all"></block>'+
                '</category>',
    'Data - Crime': '<category name="Data - Crime" colour="55">'+
                    '<block type="crime_state"></block>'+
                    '<block type="crime_year"></block>'+
                    '<block type="crime_all"></block>'+
                '</category>',
    'Data - Books': '<category name="Data - Books" colour="50">'+
                    '<block type="books_get"></block>'+
                '</category>',*/
    'Data - Parking': '<category name="Data - Parking" colour="45">'+
                    '<block type="datetime_day"></block>'+
                    '<block type="datetime_time"></block>'+
                    '<block type="logic_compare">'+
                        '<field name="OP">EQ</field>'+
                        '<value name="A">'+
                          '<block type="datetime_time">'+
                            '<mutation isNow="1"></mutation>'+
                            '<field name="HOUR">1</field>'+
                            '<field name="MINUTE">00</field>'+
                            '<field name="MERIDIAN">PM</field>'+
                          '</block>'+
                        '</value>'+
                    '</block>'+
                    '<block type="logic_compare">'+
                        '<field name="OP">EQ</field>'+
                        '<value name="A">'+
                          '<block type="datetime_day">'+
                            '<field name="DAY">Monday</field>'+
                          '</block>'+
                        '</value>'+
                    '</block>'+
                    //'<block type="datetime_check_day"></block>'+
                    //'<block type="datetime_check_time"></block>'+
                '</category>',
    'Separator': '<sep></sep>'
};

BlockPyEditor.prototype.updateToolbox = function(only_set) {
    var xml = '<xml id="toolbox" style="display: none">';
    var modules = this.main.model.assignment.modules();
    var started_misc = false,
        started_values = false,
        started_data = false;
    for (var i = 0, length = modules.length; i < length; i = i+1) {
        var module = modules[i];
        if (!started_misc && ['Calculation', 'Output', 'Python'].indexOf(module) != -1) {
            started_misc = true;
            xml += BlockPyEditor.CATEGORY_MAP['Separator'];
        }
        if (!started_values && ['Values', 'Lists', 'Dictionaries'].indexOf(module) != -1) {
            started_values = true;
            xml += BlockPyEditor.CATEGORY_MAP['Separator'];
        }
        if (!started_data && module.slice(0, 6) == 'Data -') {
            started_data = true;
            xml += BlockPyEditor.CATEGORY_MAP['Separator'];
        }
        if (typeof module == 'string') {
            xml += BlockPyEditor.CATEGORY_MAP[module];
        } else {
            var category = '<category name="'+module.name+'" colour="'+module.color+'">';
            for (var j= 0; category_length = module.blocks.length; j = j+1) {
                var block = module.blocks[j];
                category += '<block type="'+block+'"></block>';
            }
            category += '</category>';
        }
        //'<sep></sep>'+
    }
    xml += '</xml>';
    if (only_set) {
        this.blockly.updateToolbox(xml);
    } else {
        return xml;
    }
};

BlockPyEditor.prototype.getPngFromBlocks = function(callback) {
    var blocks = this.blockly.svgBlockCanvas_.cloneNode(true);
    blocks.removeAttribute("width");
    blocks.removeAttribute("height");
    if (blocks.children[0] !== undefined) {
        blocks.removeAttribute("transform");
        blocks.children[0].removeAttribute("transform");
        blocks.children[0].children[0].removeAttribute("transform");
        var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
        linkElm.textContent = Blockly.Css.CONTENT.join('') + '\n\n';
        blocks.insertBefore(linkElm, blocks.firstChild);
        var bbox = document.getElementsByClassName("blocklyBlockCanvas")[0].getBBox();
        var xml = new XMLSerializer().serializeToString(blocks);
        xml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+bbox.width+'" height="'+bbox.height+'" viewBox="0 0 '+bbox.width+' '+bbox.height+'"><rect width="100%" height="100%" fill="white"></rect>'+xml+'</svg>';
        var data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
        var img  = document.createElement("img");
        img.setAttribute('src', data);
        img.style.display = 'block';
        img.onload = function() {
            //TODO: Make this capture a class descendant. Cross the D3/Jquery barrier!
            var canvas = d3.select('#capture-canvas').node();//d3.select('body').append('canvas').node();
            canvas.width = bbox.width;
            canvas.height = bbox.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            var canvasUrl = canvas.toDataURL("image/png");
            callback(canvasUrl, img);
        }
        img.onerror = function() {
            callback("", img);
        }
    } else {
        callback("", document.createElement("img"))
    }
}


BlockPyEditor.prototype.copyImage = function() {
    var dialog = this.main.components.dialog;
    this.getPngFromBlocks(function(canvasUrl, img) {
        img.onload = function() {
            var span = document.createElement('span');
            span.textContent = "Right-click and copy the image below."
            var newWindow = document.createElement('button');
            var newWindowInner = document.createElement('span');
            newWindow.className += "btn btn-default btn-xs";
            newWindowInner.className += "glyphicon glyphicon-new-window";
            newWindow.onclick = function() {
                var output = img.src;
                window.open(img.src);
            }
            newWindow.appendChild(newWindowInner);
            var div = document.createElement('div');
            div.appendChild(span);
            div.appendChild(newWindow);
            div.appendChild(img);
            dialog.show("Blocks as Image", div);
        };
        img.src = canvasUrl;
    });
}