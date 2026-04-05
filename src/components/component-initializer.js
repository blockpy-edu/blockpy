/**
 * @fileoverview Component initializer for BlockPy application.
 * Contains the logic for initializing all BlockPy components.
 */

import {BlockPyEngine} from "../engine.js";
import {BlockPyTrace} from "../trace";
import {BlockPyConsole} from "../console";
import {BlockPyFeedback} from "../feedback.js";
import {BlockPyServer} from "../server";
import {BlockPyDialog} from "../dialog";
import {BlockPyFileSystem} from "../files";
import {Editors} from "../editors.js";
import {BlockPyCorgis} from "../corgis";
import {BlockPyHistory} from "../history";

/**
 * Initialize all BlockPy components.
 * Each component takes the BlockPy instance and possibly a reference to the
 * relevant HTML location where it will be embedded.
 * 
 * @param {Object} main - The main BlockPy instance
 * @param {jQuery} container - The jQuery container element
 * @returns {Object} Object containing all initialized components
 */
export function initializeComponents(main, container) {
    const components = {};
    
    // Each of these components will take the BlockPy instance, and possibly a
    // reference to the relevant HTML location where it will be embedded.
    components.dialog = new BlockPyDialog(main, container.find(".blockpy-dialog"));
    components.feedback = new BlockPyFeedback(main, container.find(".blockpy-feedback"));
    components.trace = new BlockPyTrace(main);
    components.console = new BlockPyConsole(main, container.find(".blockpy-console"));
    components.engine = new BlockPyEngine(main);
    components.fileSystem = new BlockPyFileSystem(main);
    components.editors = new Editors(main, container.find(".blockpy-editor"));
    // Convenient shortcut directly to PythonEditor
    components.pythonEditor = components.editors.byName("python");
    components.server = new BlockPyServer(main);
    components.corgis = new BlockPyCorgis(main);
    components.history = new BlockPyHistory(main, container.find(".blockpy-history-toolbar"));
    
    return components;
}