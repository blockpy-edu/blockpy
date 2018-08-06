/**
 * An object that manages the various editors, where users can edit their program. Also manages the
 * movement between editors.
 * There are currently four editors:
 *  - Blocks: A Blockly instance
 *  - Text: A CodeMirror instance
 *  - Instructor: Features for changing the assignment and environment settings
 *
 * @constructor
 * @this {BlockPyEditor}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
function BlockPyEditor(main, tag) {
    this.main = main;
    this.tag = tag;
    
    // This tool is what actually converts text to blocks!
    this.converter = new PythonToBlocks();
    
    // HTML DOM accessors
    this.blockTag = tag.find('.blockpy-blocks');
    this.blocklyDiv = this.blockTag.find('.blockly-div');
    this.textTag = tag.find('.blockpy-text');
    this.instructorTag = tag.find('.blockpy-instructor');
    this.textSidebarTag = this.textTag.find(".blockpy-text-sidebar");
    
    // Blockly and CodeMirror instances
    this.blockly = null;
    this.codeMirror = null;
    // The updateStack keeps track of whether an update is percolating, to prevent duplicate update events.
    this.silenceBlock = false;
    this.silenceBlockTimer = null;
    this.silenceText = false;
    this.silenceModel = 0;
    this.blocksFailed = false;
    this.blocksFailedTimeout = null;
    
    // Hack to prevent chrome errors. Forces audio to load on demand. 
    // See: https://github.com/google/blockly/issues/299
    Blockly.WorkspaceSvg.prototype.preloadAudio_ = function() {};
    
    // Keep track of the toolbox width
    this.blocklyToolboxWidth = 0;
    
    // Initialize subcomponents
    this.initText();
    this.initBlockly();
    this.initInstructor();
    
    this.triggerOnChange = null;
    var editor = this;
    var firstEdit = true;
    this.main.model.program.subscribe(function() {
        editor.updateBlocksFromModel();
        editor.updateTextFromModel();
        
        if (editor.main.model.settings.filename() == "__main__" &&
            !firstEdit) {
            if (editor.triggerOnChange) {
                clearTimeout(editor.triggerOnChange);
            }
            var engine = editor.main.components.engine;
            editor.triggerOnChange = setTimeout(engine.on_change.bind(engine), 2500);
        }
        firstEdit = false;
    });
    
    // Handle mode switching
    var settings = this.main.model.settings;
    settings.editor.subscribe(function() {editor.setMode()});
    var updateReadOnly = function() {
        var newValue = !!(settings.read_only() && !settings.instructor());
        editor.codeMirror.setOption('readOnly', newValue);
        tag.toggleClass("blockpy-read-only", newValue);
    };
    settings.read_only.subscribe(updateReadOnly);
    settings.instructor.subscribe(updateReadOnly);
    
    // Handle filename switching
    this.main.model.settings.filename.subscribe(function (name) {
        if (name == 'give_feedback') {
            editor.setMode('Text');
        }
    });
    
    // Handle Upload mode turned on
    this.main.model.assignment.upload.subscribe(function(uploadsMode) {
        if (uploadsMode) {
            editor.setMode('Text');
        }
    });
    
    // Have to force a manual block update
    //this.updateText();
    this.updateBlocksFromModel();
    this.updateTextFromModel();
}

/**
 * Initializes the Blockly instance (handles all the blocks). This includes
 * attaching a number of ChangeListeners that can keep the internal code
 * representation updated and enforce type checking.
 */
BlockPyEditor.prototype.initBlockly = function() {
    this.blockly = Blockly.inject(this.blocklyDiv[0],
                                  { path: this.main.model.constants.blocklyPath, 
                                    scrollbars: this.main.model.constants.blocklyScrollbars, 
                                    readOnly: this.main.model.settings.read_only(),
                                    zoom: {enabled: false},
                                    oneBasedIndex: false,
                                    comments: false,
                                    toolbox: this.updateToolbox(false)});
    // Register model changer
    var editor = this;
    this.blockly.addChangeListener(function(evt) { 
        //editor.main.components.feedback.clearEditorErrors();
        editor.blockly.highlightBlock(null);
        editor.updateBlocks();
    });
    
    this.main.model.settings.filename.subscribe(function() {
        /*if (editor.main.model.settings.editor() == "Blocks") {
            editor.updateBlocksFromModel()
        }*/
    });
    this.main.model.assignment.modules.subscribe(function() {editor.updateToolbox(true)});
    // Force the proper window size
    this.blockly.resize();
    // Keep the toolbox width set
    this.blocklyToolboxWidth = this.getToolbarWidth();
    
    Blockly.captureDialog_ = this.copyImage.bind(this);
    
    // Enable static type checking! 
    /*
    this.blockly.addChangeListener(function() {
        if (!editor.main.model.settings.disable_variable_types()) {
            var variables = editor.main.components.engine.analyzeVariables()
            editor.blockly.getAllBlocks().filter(function(r) {return r.type == 'variables_get'}).forEach(function(block) { 
                var name = block.inputList[0].fieldRow[0].value_;
                if (name in variables) {
                    var type = variables[name];

                    if (type.type == "Num") {
                        block.setOutput(true, "Number");
                    } else if (type.type == "List") {
                        block.setOutput(true, "Array");
                    } else if (type.type == "Str") {
                        block.setOutput(true, "String");
                    } else {
                        block.setOutput(true, null);
                    }
                }
            })
        }
    });
    */


};

/**
 * Retrieves the current width of the Blockly Toolbox, unless
 * we're in read-only mode (when there is no toolbox).
 * @returns {Number} The current width of the toolbox.
 */
BlockPyEditor.prototype.getToolbarWidth = function() {
    if (this.main.model.settings.read_only()) {
        return 0;
    } else {
        return this.blockly.toolbox_.width;
    }
}

/**
 * Initializes the CodeMirror instance. This handles text editing (with syntax highlighting)
 * and also attaches a listener for change events to update the internal code represntation.
 */
BlockPyEditor.prototype.initText = function() {
    var codeMirrorDiv = this.textTag.find('.codemirror-div')[0];
    this.codeMirror = CodeMirror.fromTextArea(codeMirrorDiv, {
                                        mode: { name: "python", 
                                                version: 3, 
                                                singleLineStringErrors: false
                                        },
                                        readOnly: this.main.model.settings.read_only(),
                                        showCursorWhenSelecting: true,
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
        editor.updateText()
        editor.unhighlightLines();
    });

    // Ensure that it fills the editor area
    this.codeMirror.setSize(null, "100%");
};

BlockPyEditor.prototype.reloadIntroduction = function() {
    var introductionEditor = this.tag.find('.blockpy-presentation-body-editor');
    var model = this.main.model;
    introductionEditor.code(model.assignment.introduction());
}

/**
 * Initializes the Instructor tab, which has a number of buttons and menus for
 * manipulating assignments and the environment. One important job is to register the
 * SummerNote instance used for editing the Introduction of the assignment.
 */
BlockPyEditor.prototype.initInstructor = function() {
    var introductionEditor = this.tag.find('.blockpy-presentation-body-editor');
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
    this.reloadIntroduction();
    
    this.availableModules = this.tag.find('.blockpy-available-modules');
    this.availableModules.multiSelect({ selectableOptgroup: true });
}

/**
 * Makes the module available in the availableModules multi-select menu by adding
 * it to the list.
 * 
 * @param {String} name - The name of the module (human-friendly version, as opposed to the slug) to be added.
 */
BlockPyEditor.prototype.addAvailableModule = function(name) {
    this.availableModules.multiSelect('addOption', { 
        'value': name, 'text': name
    });
    this.availableModules.multiSelect('select', name);
};

/**
 * Hides the Text tab, which involves shrinking it and hiding its CodeMirror too.
 */
BlockPyEditor.prototype.hideSplitMenu = function() {
    this.hideTextMenu();
    this.hideBlockMenu();
}

/**
 * Shows the Text tab, which requires restoring its height, showing AND refreshing
 * the CodeMirror instance.
 */
BlockPyEditor.prototype.showSplitMenu = function() {
    this.showBlockMenu();
    this.showTextMenu();
    
    this.textTag.css('width', '40%');
    this.blockTag.css('width', '60%');
    this.textSidebarTag.css('width', '0px');
    this.textTag.addClass('col-md-6');
    this.blockTag.addClass('col-md-6');
    Blockly.svgResize(this.blockly);
}

/**
 * Hides the Text tab, which involves shrinking it and hiding its CodeMirror too.
 */
BlockPyEditor.prototype.hideTextMenu = function() {
    this.textTag.css('height', '0%');
    $(this.codeMirror.getWrapperElement()).hide();
    this.textSidebarTag.hide();
    this.textTag.hide();
}

/**
 * Shows the Text tab, which requires restoring its height, showing AND refreshing
 * the CodeMirror instance.
 */
BlockPyEditor.prototype.showTextMenu = function() {
    this.textTag.show();
    // Adjust height
    this.textTag.css('height', '450px');
    this.textTag.css('width', '100%');
    // Show CodeMirror
    $(this.codeMirror.getWrapperElement()).show();
    // CodeMirror doesn't know its changed size
    this.codeMirror.refresh();
    
    // Resize sidebar
    var codemirrorGutterWidth = $('.CodeMirror-gutters').width();
    var sideBarWidth = this.blocklyToolboxWidth-codemirrorGutterWidth-2;
    this.textSidebarTag.css('width', sideBarWidth+'px');
    this.textSidebarTag.show();
    this.textTag.removeClass('col-md-6');
}

/**
 * Hides the Block tab, which involves shrinking it and hiding the Blockly instance.
 */
BlockPyEditor.prototype.hideBlockMenu = function() {
    
    this.blocklyToolboxWidth = this.getToolbarWidth();
    this.blockTag.css('height', '0%');
    this.blocklyDiv.css("width", "0");
    this.blockly.setVisible(false);
}

/**
 * Shows the Block tab, which involves restoring its height and showing the Blockly instance.
 */
BlockPyEditor.prototype.showBlockMenu = function() {
    this.blockTag.css('height', '100%');
    this.blockTag.css('width', '100%');
    this.blocklyDiv.css("width", "100%");
    this.blockly.resize();
    this.blockly.setVisible(true);
    this.blockTag.removeClass('col-md-6');
    Blockly.svgResize(this.blockly);
}

/**
 * Hides the Instructor tab, which shrinking it.
 */
BlockPyEditor.prototype.hideInstructorMenu = function() {
    this.instructorTag.hide();
    this.instructorTag.css('height', '0%');
}

/**
 * Shows the Instructor tab, which involves restoring its height.
 */
BlockPyEditor.prototype.showInstructorMenu = function() {
    this.instructorTag.css('height', '100%');
    this.instructorTag.show();
}

/**
 * Sets the current editor mode to Text, hiding the other menus.
 * Also forces the text side to update.
 */
BlockPyEditor.prototype.setModeToText = function() {
    this.hideBlockMenu();
    this.hideInstructorMenu();
    this.showTextMenu();
    // Update the text model from the blocks
}

/**
 * Sets the current editor mode to Blocks, hiding the other menus.
 * Also forces the block side to update.
 * There is a chance this could fail, if the text side is irredeemably
 * awful. So then the editor bounces back to the text side.
 */
BlockPyEditor.prototype.setModeToBlocks = function() {
    this.hideTextMenu();
    this.hideInstructorMenu();
    this.showBlockMenu();
    if (this.blocksFailed !== false) {
        this.showConversionError();
        var main = this.main;
        main.model.settings.editor("Text");
        setTimeout(function() {
            main.components.toolbar.tags.mode_set_text.click();
        }, 0);
    }
    // Update the blocks model from the text
    /*
    success = this.updateBlocksFromModel();
    if (!success) {
        var main = this.main;
        main.components.editor.updateTextFromModel();
        main.model.settings.editor("Text");
        setTimeout(function() {
            main.components.toolbar.tags.mode_set_text.click();
        }, 0);
    }*/
}

/**
 * Sets the current editor mode to Split mode, hiding the other menus.
 */
BlockPyEditor.prototype.setModeToSplit = function() {
    this.hideTextMenu();
    this.hideInstructorMenu();
    this.hideBlockMenu();
    this.showSplitMenu();
    if (this.blocksFailed !== false) {
        this.showConversionError();
    }
}

/**
 * Sets the current editor mode to the Instructor mode, hiding the other menus.
 */
BlockPyEditor.prototype.setModeToInstructor = function() {
    this.hideTextMenu();
    this.hideBlockMenu();
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

/**
 * Dispatch method to set the mode to the given argument.
 * If the mode is invalid, an editor error is reported. If the 
 *
 * @param {String} mode - The new mode to set to ("Blocks", "Text", or "Instructor")
 */
BlockPyEditor.prototype.setMode = function(mode) {
    // Either update the model, or go with the model's
    if (mode === undefined) {
        mode = this.main.model.settings.editor();
    } else {
        this.main.model.settings.editor(mode);
    }
    // Dispatch according to new mode
    if (mode == 'Blocks') {
        this.setModeToBlocks();
    } else if (mode == 'Text') {
        this.setModeToText();
    } else if (mode == 'Split') {
        this.setModeToSplit();
    } else if (mode == 'Instructor') {
        this.setModeToInstructor();
    } else if (mode == 'Upload') {
        this.setModeToText();
    } else {
        this.main.components.feedback.internalError(""+mode, "Invalid Mode", "The editor attempted to change to an invalid mode.")
    }
}

/**
 * Actually changes the value of the CodeMirror instance
 *
 * @param {String} code - The new code for the CodeMirror
 */
BlockPyEditor.prototype.setText = function(code) {
    if (code == undefined || code.trim() == "") {
        this.codeMirror.setValue("\n");
    } else {
        this.codeMirror.setValue(code);
    }
    // Ensure that we maintain proper highlighting
    this.refreshHighlight();
}

BlockPyEditor.prototype.showConversionError = function() {
    var error = this.blocksFailed;
    this.main.components.feedback.convertSkulptSyntax(error);
}

BlockPyEditor.prototype.setBlocks = function(python_code) {
    if (!(!this.main.model.assignment.upload() &&
        (this.main.model.settings.filename() == "__main__" ||
         this.main.model.settings.filename() == "starting_code"))) {
        return false;
    }
    var xml_code = "";
    if (python_code !== '' && python_code !== undefined && python_code.trim().charAt(0) !== '<') {
        var result = this.converter.convertSource(python_code);
        xml_code = result.xml;
        window.clearTimeout(this.blocksFailedTimeout);
        if (result.error !== null) {
            this.blocksFailed = result.error;
            var editor = this;
            this.blocksFailedTimeout = window.setTimeout(function() {
                if (editor.main.model.settings.editor() != 'Text') {
                    editor.showConversionError();
                }
            }, 500)
        } else {
            this.blocksFailed = false;
            this.main.components.feedback.clearEditorErrors();
        }
    }
    var error_code = this.converter.convertSourceToCodeBlock(python_code);
    var errorXml = Blockly.Xml.textToDom(error_code);
    if (python_code == '' || python_code == undefined || python_code.trim() == '') {
        this.blockly.clear();
    } else if (xml_code !== '' && xml_code !== undefined) {
        var blocklyXml = Blockly.Xml.textToDom(xml_code);
        try {
            this.setBlocksFromXml(blocklyXml);
        } catch (e) {
            console.error(e);
            this.setBlocksFromXml(errorXml);
        }
    } else {
        this.setBlocksFromXml(errorXml);
    }
    Blockly.Events.disable();
    // Parsons shuffling
    if (this.main.model.assignment.parsons()) {
        this.blockly.shuffle();
    } else {
        this.blockly.align();
    }
    Blockly.Events.enable();
    if (this.previousLine !== null) {
        this.refreshBlockHighlight(this.previousLine);
    }
}

BlockPyEditor.prototype.clearDeadBlocks = function() {
    var all_blocks = this.blockly.getAllBlocks();
    all_blocks.forEach(function(elem) {
        if (!Blockly.Python[elem.type]) {
            elem.dispose(true);
        }
    });
}

/**
 * Attempts to update the model for the current code file from the 
 * block workspace. Might be prevented if an update event was already
 * percolating.
 */
BlockPyEditor.prototype.updateBlocks = function() {
    if (! this.silenceBlock) {
        try {
            var newCode = Blockly.Python.workspaceToCode(this.blockly);
        } catch (e) {
            this.clearDeadBlocks();
            this.main.components.feedback.editorError("Unknown Block", "It looks like you attempted to paste or load some blocks that were not known. Typically, this is because you failed to load in the dataset before trying to paste in a data block. If there are any black blocks on the canvas, delete them before continuing.", "Unknown Block");
        }
        // Update Model
        this.silenceModel = 2;
        var changed = this.main.setCode(newCode);
        if (!changed) {
            this.silenceModel = 0;
        } else {
            // Update Text
            this.silenceText = true;
            this.setText(newCode);
        }
    }
}

/**
 * Attempts to update the model for the current code file from the 
 * text editor. Might be prevented if an update event was already
 * percolating. Also unhighlights any lines.
 */
var timerGuard = null;
BlockPyEditor.prototype.updateText = function() {
    if (! this.silenceText) {
        var newCode = this.codeMirror.getValue();
        // Update Model
        this.silenceModel = 2;
        this.main.setCode(newCode);
        // Update Blocks
        this.silenceBlock = true;
        this.setBlocks(newCode);
        this.unhighlightLines();
        this.resetBlockSilence();
    }
    this.silenceText = false;
}

/**
 * Resets the silenceBlock after a short delay
 */
BlockPyEditor.prototype.resetBlockSilence = function() {
    var editor = this;
    if (editor.silenceBlockTimer != null) {
        clearTimeout(editor.silenceBlockTimer);
    }
    this.silenceBlockTimer = window.setTimeout(function() {
        editor.silenceBlock = false;
        editor.silenceBlockTimer = null;
    }, 40);
};

/**
 * Updates the text editor from the current code file in the
 * model. Might be prevented if an update event was already
 * percolating.
 */
BlockPyEditor.prototype.updateTextFromModel = function() {
    if (this.silenceModel == 0) {
        var code = this.main.model.program();
        this.silenceText = true;
        this.setText(code);
    } else {
        this.silenceModel -= 1;
    }
}

/**
 * Updates the block editor from the current code file in the
 * model. Might be prevented if an update event was already
 * percolating. This can also report an error if one occurs.
 *
 * @returns {Boolean} Returns true upon success.
 */
BlockPyEditor.prototype.updateBlocksFromModel = function() {
    if (this.silenceModel == 0) {
        var code = this.main.model.program();
        this.silenceBlock = true;
        this.setBlocks(code);
        this.resetBlockSilence();
    } else {
        this.silenceModel -= 1;
    }
}

/**
 * Helper function for retrieving the current Blockly workspace as
 * an XML DOM object.
 *
 * @returns {XMLDom} The blocks in the current workspace.
 */
BlockPyEditor.prototype.getBlocksFromXml = function() {
    return Blockly.Xml.workspaceToDom(this.blockly);
}
          
/**
 * Helper function for setting the current Blockly workspace to
 * whatever XML DOM is given. This clears out any existing blocks.
 */
BlockPyEditor.prototype.setBlocksFromXml = function(xml) {
    //this.blockly.clear();
    Blockly.Xml.domToWorkspaceDestructive(xml, this.blockly);
    //console.log(this.blockly.getAllBlocks());
}

/** 
 * @property {Number} previousLine - Keeps track of the previously highlighted line.
 */
BlockPyEditor.prototype.previousLine = null;

/**
 * Assuming that a line has been highlighted previously, this will set the
 * line to be highlighted again. Used when we need to restore a highlight.
 */
BlockPyEditor.prototype.refreshHighlight = function() {
    if (this.previousLine !== null) {
        if (this.previousLine < this.codeMirror.lineCount()) {
            this.codeMirror.addLineClass(this.previousLine, 'text', 'editor-error-line');
        }
    }
    // TODO: Shouldn't this refresh the highlight in the block side too?
}

/**
 * Highlights a line of code in the CodeMirror instance. This applies the "active" style
 * which is meant to bring attention to a line, but not suggest it is wrong.
 *
 * @param {Number} line - The line of code to highlight. I think this is zero indexed?
 */
BlockPyEditor.prototype.highlightLine = function(line) {
    if (this.previousLine !== null) {
        if (this.previousLine < this.codeMirror.lineCount()) {
            this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-active-line');
            this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-error-line');
        }
    }
    if (line < this.codeMirror.lineCount()) {
        this.codeMirror.addLineClass(line, 'text', 'editor-active-line');
    }
    this.previousLine = line;
}

/**
 * Highlights a line of code in the CodeMirror instance. This applies the "error" style
 * which is meant to suggest that a line is wrong.
 *
 * @param {Number} line - The line of code to highlight. I think this is zero indexed?
 */
BlockPyEditor.prototype.highlightError = function(line) {
    if (this.previousLine !== null) {
        if (this.previousLine < this.codeMirror.lineCount()) {
            this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-active-line');
            this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-error-line');
        }
    }
    if (line < this.codeMirror.lineCount()) {
        this.codeMirror.addLineClass(line, 'text', 'editor-error-line');
    }
    this.refreshBlockHighlight(line);
    this.previousLine = line;
}

/**
 * Highlights a block in Blockly. Unfortunately, this is the same as selecting it.
 *
 * @param {Number} block - The ID of the block object to highlight.
 */
BlockPyEditor.prototype.highlightBlock = function(block) {
    //this.blockly.highlightBlock(block);
}

/**
 * Used to restore a block's highlight when travelling from the code tab. This
 * uses a mapping between the blocks and text that is generated from the parser.
 * The parser has stored the relevant line numbers for each block in the XML of the
 * block. Very sophisticated, and sadly fairly fragile.
 * TODO: I believe there's some kind of off-by-one error here...
 *
 * @param {Number} line - The line of code to highlight. I think this is zero indexed?
 */
BlockPyEditor.prototype.refreshBlockHighlight = function(line) {
    if (this.blocksFailed) {
        this.blocksFailed = false;
        return;
    }
    if (this.main.model.settings.editor() != "Blocks" &&
        this.main.model.settings.editor() != "Split") {
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
        var blockly = this.blockly;
        hblocks.forEach(function(elem) {
            //elem.addSelect();
            blockly.highlightBlock(elem.id, true);
        });
        /*if (hblocks.length > 0) {
            this.blockly.highlightBlock(hblocks[0].id, true);
        }*/
    }
}

/**
 * Removes the outline around a block. Currently unused.
 */
BlockPyEditor.prototype.unhighlightBlock = function() {
    // TODO:
}

/**
 * Removes any highlight in the text code editor.
 *
 */
BlockPyEditor.prototype.unhighlightLines = function() {
    if (this.previousLine !== null) {
        if (this.previousLine < this.codeMirror.lineCount()) {
            this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-active-line');
            this.codeMirror.removeLineClass(this.previousLine, 'text', 'editor-error-line');
        }
    }
    this.previousLine = null;
}

/**
 * Removes any highlight in the text code editor.
 *
 */
BlockPyEditor.prototype.unhighlightAllLines = function() {
    var editor = this.codeMirror;
    var count = editor.lineCount(), i;
    for (i = 0; i < count; i++) {
        editor.removeLineClass(i, 'text', 'editor-error-line');
    }
}

/**
 * DEPRECATED, thankfully
 * Builds up an array indicating the relevant block ID for a given step.
 * Operates on the current this.blockly instance
 * It works by injecting __HIGHLIGHT__(id); at the start of every line of code
 *  and then extracting that with regular expressions. This makes it vulnerable
 *  if someone decides to use __HIGHLIGHT__ in their code. I'm betting on that
 *  never being a problem, though. Still, this was a miserable way of accomplishing
 *  the desired behavior.
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

/**
 * Updates the current file being edited in the editors.
 * This appears to be deprecated.
 *
 * @param {String} name - The name of the file being edited (e.g, "__main__", "starting_code")
 */
/*
BlockPyEditor.prototype.changeProgram = function(name) {
    console.log("TEST")
    this.silentChange_ = true;
    if (name == 'give_feedback') {
        this.setMode('Text');
    }
    this.model.settings.filename = name;
    this.editor.setPython(this.model.programs[name]);
    this.toolbar.elements.programs.find("[data-name="+name+"]").click();
}*/

/**
 * Eventually will be used to update "levels" of sophistication of the code interface.
 * Currently unimplemented and unused.
 */
BlockPyEditor.prototype.setLevel = function() {
    var level = this.main.model.settings.level();
}

/**
 * Maps short category names in the toolbox to the full XML used to
 * represent that category as usual. This is kind of a clunky mechanism
 * for managing the different categories, and doesn't allow us to specify
 * individual blocks.
 */
BlockPyEditor.CATEGORY_MAP = {
    'Variables': '<category name="Variables" custom="VARIABLE" colour="240">'+
                  '</category>',
    'Decisions': '<category name="Decisions" colour="330">'+
                    '<block type="controls_if_better"></block>'+
                    '<block type="controls_if_better"><mutation else="1"></mutation></block>'+
                    //'<block type="controls_if"></block>'+
                    //'<block type="controls_if"><mutation else="1"></mutation></block>'+
                    '<block type="logic_compare"></block>'+
                    '<block type="logic_operation"></block>'+
                    '<block type="logic_negate"></block>'+
                  '</category>',
    'Iteration': '<category name="Iteration" colour="300">'+
                    '<block type="controls_forEach"></block>'+
                '</category>',
    'Functions': '<category name="Functions" custom="PROCEDURE" colour="210">'+
                '</category>',
    'Classes': '<category name="Classes" colour="210">'+
                    '<block type="class_creation"></block>'+
                    '<block type="class_creation">'+
                        '<mutation value="k"></mutation>'+
                    '</block>'+
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
    'Conversion': '<category name="Conversion" colour="275">'+
                    '<block type="procedures_callreturn" inline="true">'+
                        '<mutation name="int"><arg name="">'+
                        '</arg></mutation>'+
                    '</block>'+
                    '<block type="procedures_callreturn" inline="true">'+
                        '<mutation name="float"><arg name="">'+
                        '</arg></mutation>'+
                    '</block>'+
                    '<block type="procedures_callreturn" inline="true">'+
                        '<mutation name="str"><arg name="">'+
                        '</arg></mutation>'+
                    '</block>'+
                    '<block type="procedures_callreturn" inline="true">'+
                        '<mutation name="bool"><arg name="">'+
                        '</arg></mutation>'+
                    '</block>'+
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
    'Input':   '<category name="Input" colour="165">'+
                    '<block type="text_input"></block>'+
                '</category>',
    'Turtles': '<category name="Turtles" colour="180">'+
                    '<block type="turtle_create"></block>'+
                    '<block type="turtle_forward"></block>'+
                    '<block type="turtle_backward"></block>'+
                    '<block type="turtle_left"></block>'+
                    '<block type="turtle_right"></block>'+
                    '<block type="turtle_color"></block>'+
                '</category>',
    'Values':   '<category name="Values" colour="100">'+
                    '<block type="text"></block>'+
                    '<block type="math_number"></block>'+
                    '<block type="logic_boolean"></block>'+
                '</category>',
    'Tuples': '<category name="Tuples" colour="40">'+
                '<block type="tuple_create"></block>'+
              '</category>',
    'Lists':    '<category name="Lists" colour="30">'+
                    //'<block type="lists_create"></block>'+
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
                    '<block type="procedures_callreturn" inline="true">'+
                        '<mutation name="range"><arg name="">'+
                            '<block type="math_number"><field name="NUM">10</field></block>'+
                        '</arg></mutation>'+
                        '<value name="ARG0">'+
                            '<block type="math_number"><field name="NUM">10</field></block>'+
                        '</value>'+
                    '</block>'+
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

/**
 * Creates an updated representation of the Toolboxes XML as currently specified in the
 * model, using whatever modules have been added or removed. This method can either set it
 * or just retrieve it for future use.
 *
 * @param {Boolean} only_set - Whether to return the XML string or to actually set the XML. False means that it will not update the toolbox!
 * @returns {String?} Possibly returns the XML of the toolbox as a string.
 */
BlockPyEditor.prototype.updateToolbox = function(only_set) {
    var xml = '<xml id="toolbox" style="display: none">';
    var modules = this.main.model.assignment.modules();
    var started_misc = false,
        started_values = false,
        started_data = false;
    for (var i = 0, length = modules.length; i < length; i = i+1) {
        var module = modules[i];
        if (!started_misc && ['Calculation', 'Conversion', 'Output', 'Input', 'Python'].indexOf(module) != -1) {
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
    if (only_set && !this.main.model.settings.read_only()) {
        this.blockly.updateToolbox(xml);
        this.blockly.resize();
    } else {
        return xml;
    }
};

BlockPyEditor.prototype.DOCTYPE = '<?xml version="1.0" standalone="no"?>' + '<' + '!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
BlockPyEditor.prototype.cssData = null;
BlockPyEditor.prototype.loadCss = function() {
    if (this.cssData == null) {
        var txt = '.blocklyDraggable {}\n';
        txt += Blockly.Css.CONTENT.join('\n');
        if (Blockly.FieldDate) {
            txt += Blockly.FieldDate.CSS.join('\n');
        }
        // Strip off any trailing slash (either Unix or Windows).
        this.cssData = txt.replace(/<<<PATH>>>/g, Blockly.Css.mediaPath_);
    }
}

/**
 * Generates a PNG version of the current workspace. This PNG is stored in a Base-64 encoded
 * string as part of a data URL (e.g., "data:image/png;base64,...").
 * TODO: There seems to be some problems capturing blocks that don't start with
 * statement level blocks (e.g., expression blocks).
 * 
 * @param {Function} callback - A function to be called with the results. This function should take two parameters, the URL (as a string) of the generated base64-encoded PNG and the IMG tag.
 */
BlockPyEditor.prototype.getPngFromBlocks = function(callback) {
    this.loadCss();
    try {
        // Retreive the entire canvas, strip some unnecessary tags
        var blocks = this.blockly.svgBlockCanvas_.cloneNode(true);
        blocks.removeAttribute("width");
        blocks.removeAttribute("height");
        // Ensure that we have some content
        if (blocks.childNodes[0] !== undefined) {
            // Remove tags that offset
            blocks.removeAttribute("transform");
            blocks.childNodes[0].removeAttribute("transform");
            blocks.childNodes[0].childNodes[0].removeAttribute("transform");
            // Add in styles
            var linkElm = document.createElementNS("http://www.w3.org/1999/xhtml", "style");
            linkElm.textContent = this.cssData + '\n\n';
            blocks.insertBefore(linkElm, blocks.firstChild);
            // Get the bounding box
            var bbox = document.getElementsByClassName("blocklyBlockCanvas")[0].getBBox();
            // Create the XML representation of the SVG
            var xml = new XMLSerializer().serializeToString(blocks);
            xml = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+bbox.width+'" height="'+bbox.height+'" viewBox="0 0 '+bbox.width+' '+bbox.height+'"><rect width="100%" height="100%" fill="white"></rect>'+xml+'</svg>';
            // create a file blob of our SVG.
            // Unfortunately, this crashes modern chrome for unknown reasons.
            //var blob = new Blob([ this.DOCTYPE + xml], { type: 'image/svg+xml' });
            //var url = window.URL.createObjectURL(blob);
            // Old method: this failed on IE
            var url = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
            // Create an IMG tag to hold the new element
            var img  = document.createElement("img");
            img.style.display = 'block';
            img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = bbox.width;
                canvas.height = bbox.height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                var canvasUrl;
                try {
                    canvasUrl = canvas.toDataURL("image/png");
                } catch (e) {
                    canvasUrl = url;
                }
                img.onload = null;
                callback(canvasUrl, img);
            }
            img.onerror = function() {
                callback("", img);
            }
            img.setAttribute('src', url);
        } else {
            callback("", document.createElement("img"))
        }
    } catch (e) {
        callback("", document.createElement("img"));
        console.error("PNG image creation not supported!", e);
    }
}

/**
 * Shows a dialog window with the current block workspace encoded as a
 * downloadable PNG image.
 */
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