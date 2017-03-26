/**
 * An object for handling the conversion of Python to an English transliteration.
 * Currently dummied out, but we will bring this feature back.
 *
 * @constructor
 * @this {BlockPyEnglish}
 * @param {Object} main - The main BlockPy instance
 */
function BlockPyEnglish(main) {
    this.main = main; 
}

/**
 * A method for opening a dialog with the english transliteration.
 */
BlockPyEnglish.prototype.openDialog = function() {
    try {
        body = Blockly.Pseudo.workspaceToCode();
    } catch (e) {
        console.error(e);
        body = "I couldn't understand the code. Sorry!"
    }
    this.main.components.dialog.show("English", body, function() {});
}