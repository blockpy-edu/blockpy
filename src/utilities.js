/**
 * Determines if the element is in the list.
 * @param {anything} needle - The element to look for.
 * @param {Array} haystack - The list to search.
 * @return {Boolean} Whether the element exists
 */
function arrayContains(needle, haystack) {
    return haystack.indexOf(needle) > -1;
}

/**
 * Remove duplicate values from an array, preserving order.
 * Creates a new array, so is non-destructive.
 * Courtesy:
 * https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
 *
 * @param {Array} array - The array to uniquify. Elements compared with ===.
 */
function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

/**
 * A helper function for extending an array based
 * on an "addArray" and "removeArray". Any element
 * found in removeArray is removed from the first array
 * and all the elements of addArray are added.
 * Any duplicate items are removed.
 * Creates a new array, so is non-destructive.
 *
 * @param {Array} array - the array to manipulate
 * @param {Array} addArray - the elements to add to the array
 * @param {Array} removeArray - the elements to remove from the array
 * @return {Array} The modified array
 */
function expandArray(array, addArray, removeArray) {
    var copyArray = array.filter(function(item) {
        return removeArray.indexOf(item) === -1;
    });
    return arrayUnique(copyArray.concat(addArray));
}

/**
 * Deeply clones a node
 * @param {Node} node A node to clone
 * @return {Node} A clone of the given node and all its children
 */
function cloneNode(node) {
    // If the node is a text node, then re-create it rather than clone it
    var clone = node.nodeType == 3 ? document.createTextNode(node.nodeValue) : node.cloneNode(false);
 
    // Recurse     
    var child = node.firstChild;
    while(child) {
        clone.appendChild(cloneNode(child));
        child = child.nextSibling;
    }
     
    return clone;
}

/**
 * Indents the given string by 4 spaces. This correctly handles multi-line strings.
 *
 * @param {String} str - The string to be manipulated.
 * @returns {String} The string with four spaces added at the start of every new line.
 */
function indent(str) {
  return str.replace(/^(?=.)/gm, '    ');
}

/**
 * Return a random integer between [`min`, `max`].
 * 
 * @param {number} min - The lowest possible integer.
 * @param {number} max - The highest possible integer (inclusive).
 * @returns {number} A random integer.
 */
function randomInteger(min,max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * Encodes some text so that it can be safely written into an HTML box.
 * This includes replacing special HTML characters (&, <, >, etc.).
 *
 * @param {string} str - The text to be converted.
 * @return {string} The HTML-safe text.
 */
function encodeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}

/**
 * Shuffle the blocks in the workspace
 */
Blockly.WorkspaceSvg.prototype.shuffle = function() {
    var metrics = this.getMetrics();
    var width = metrics.viewWidth / 2,
        height = metrics.viewHeight;
    var blocks = this.getTopBlocks(false);
    var y = 5, x = 0,
        maximal_increase = height/blocks.length;
    for (var i = 0; i < blocks.length; i++){
        // Get a block
        var block = blocks[i];
        var properties = block.getRelativeToSurfaceXY();
        if (i == 0) {
            x = 5;
        } else {
            x = -properties.x+randomInteger(10, width);
        }
        block.moveBy(x, 
                     -properties.y+y);
        y = y + randomInteger(5, maximal_increase);
    }
}

