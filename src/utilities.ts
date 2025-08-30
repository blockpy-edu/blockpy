/**
 * Move an element from index in an array to a new index.
 * O(n)
 * Courtesy:
 * https://stackoverflow.com/a/73877680/1718155
 */
export function arrayMove<T>(arr: T[], oldIndex: number, newIndex: number): T[] {
    const length = arr.length;
    const itemToMove = arr[oldIndex];

    if (oldIndex === newIndex || oldIndex > length || newIndex > length) {
        return arr;
    }

    return arr.reduce((acc: T[], item: T, index: number) => {
        if (index === oldIndex) {return acc;}
        if (index === newIndex) {return oldIndex < newIndex ? [...acc, item, itemToMove] : [...acc, itemToMove, item];}
        return [...acc, item];
    }, []);
}

/**
 * Determines if the element is in the list.
 */
function arrayContains<T>(needle: T, haystack: T[]): boolean {
    return haystack.indexOf(needle) > -1;
}

/**
 * Remove duplicate values from an array, preserving order.
 * Creates a new array, so is non-destructive.
 * Courtesy:
 * https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
 */
function arrayUnique<T>(array: T[]): T[] {
    const a = array.concat();
    for(let i = 0; i < a.length; ++i) {
        for(let j = i + 1; j < a.length; ++j) {
            if(a[i] === a[j]) {a.splice(j--, 1);}
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
 */
function expandArray<T>(array: T[], addArray: T[], removeArray: T[]): T[] {
    const copyArray = array.filter(function(item) {
        return removeArray.indexOf(item) === -1;
    });
    return arrayUnique(copyArray.concat(addArray));
}

/**
 * Deeply clones a node
 */
function cloneNode(node: Node): Node {
    // If the node is a text node, then re-create it rather than clone it
    const clone = node.nodeType === 3 ? document.createTextNode(node.nodeValue || "") : node.cloneNode(false);
 
    // Recurse     
    let child = node.firstChild;
    while(child) {
        clone.appendChild(cloneNode(child));
        child = child.nextSibling;
    }
     
    return clone;
}

/**
 * Indents the given string by 4 spaces. This correctly handles multi-line strings.
 */
export function indent(str: string): string {
    return str.replace(/^(?=.)/gm, "    ");
}

/**
 * Turns spaces into underscores in the string, makes it lowercase.
 */
export function slug(str: string): string {
    return str.replace(/\s/g, "_").toLowerCase();
}

/**
 * Capitalize the first letter of a string.
 */
export function capitalize(s: string | null | undefined): string {
    if (typeof s !== "string") {
        return "";
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Return a random integer between [`min`, `max`].
 */
function randomInteger(min: number, max: number): number {
    return Math.floor(Math.random()*(max-min+1)+min);
}

/**
 * Encodes some text so that it can be safely written into an HTML box.
 * This includes replacing special HTML characters (&, <, >, etc.).
 */
export function encodeHTML(str: string): string {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Shuffle the blocks in the workspace
 */
declare const Blockly: any;
if (typeof Blockly !== "undefined") {
    Blockly.WorkspaceSvg.prototype.shuffle = function() {
        const metrics = this.getMetrics();
        const width = metrics.viewWidth / 2;
        const height = metrics.viewHeight;
        const blocks = this.getTopBlocks(false);
        let y = 5;
        let x = 0;
        const maximal_increase = height/blocks.length;
        for (let i = 0; i < blocks.length; i++){
            // Get a block
            const block = blocks[i];
            const properties = block.getRelativeToSurfaceXY();
            if (i === 0) {
                x = 5;
            } else {
                x = -properties.x+randomInteger(10, width);
            }
            block.moveBy(x, 
                         -properties.y+y);
            y = y + randomInteger(5, maximal_increase);
        }
    };
}

/**
 * Move elements from one array to another based on a conditional check.
 * https://stackoverflow.com/questions/31887967/javascript-move-objects-from-one-array-to-another-best-approach
 */
function moveElements<T>(source: T[], target: T[], moveCheck: (element: T) => boolean): void {
    for (let i = 0; i < source.length; i++) {
        const element = source[i];
        if (moveCheck(element)) {
            source.splice(i, 1);
            target.push(element);
            i--;
        }
    } 
}

export function firstDefinedValue<T>(...args: (T | null | undefined)[]): T | undefined {
    for (let i = 0; i < args.length; i++) {
        if (args[i] != null) {
            return args[i] as T;
        }
    }
    return undefined;
}

/**
 * This function checks if the given object is one of the Sk.builtin objects
 * TODO: make this so we don't have to explicitly put out every option
 *          one possible thing we could do is get a string version of the 
 *          of the constructor and look for the substring "return new Sk.builtin"
 *          But I don't know how reliable that is.  Rather, it's kind of hackish.
 *          Should theoretically belong in Sk.ffi
 */
declare const Sk: any;
function isSkBuiltin(obj: any): boolean {
    return (obj instanceof Sk.builtin.dict) ||
        (obj instanceof Sk.builtin.list) ||
        (obj instanceof Sk.builtin.tuple) ||
        (obj instanceof Sk.builtin.bool) ||
        (obj instanceof Sk.builtin.int_) ||
        (obj instanceof Sk.builtin.float_) ||
        (obj instanceof Sk.builtin.str) ||
        (obj instanceof Sk.builtin.lng);
    //var cons_str = obj.constructor + "";
    //return cons_str.indexOf("return new Sk.builtin") !== -1;
}

function isAstNode(obj: any): boolean {
    return obj instanceof Object && "_astname" in obj;
}

const DEFAULT_SECTION_PATTERN = /^(##### Part (.+))$/gm;

/**
 * Finds the given Part ID using the pattern `#### Part whatever` (on its own separate line). If the pattern
 * is not found, then null is returned. If no pattern is given (empty string or null), then the original text
 * is returned without modifications.
 */
export function extractPart(text: string, partId: string | null | undefined): string | null {
    if (partId === "" || partId == null) {
        return text;
    }
    const parts = text.split(DEFAULT_SECTION_PATTERN);
    for (let i = 2; i < parts.length; i += 3) {
        /* // Unnecessary assertion, but not bad to think about
        if (!parts[i-1].startsWith("#### Part ")) {
            throw "Error: part format is broken!";
        }*/
        if (parts[i] === partId) {
            let body = parts[i+1];
            if (body && body[0] === "\n") {
                body = body.slice(1);
            }
            if (i !== parts.length - 3 && body && body.slice(-1) === "\n") {
                body = body.slice(0, -1);
            }
            return body;
        }
    }
    return null;
}

/**
 * Should theoretically belong in Sk.ffi, but I put it here instead to not mess up the skulpt files
 * like the normal Sk.ffi.remapToPy, it doesn't work for functions or more complex objects, but it handles
 * cases where the types in obj are a mix of python SIMPLE objects and SIMPLE normal javascript objects
 */
function mixedRemapToPy(obj: any): any {
    let k: string;
    let kvs: any[];
    let i: number;
    let arr: any[];
    //@TODO: should theoretically check if the object is a python dict or array with js objects
    if (isSkBuiltin(obj)){
        //object is already python ready
        return obj;
    } else if (Object.prototype.toString.call(obj) === "[object Array]") {
        //object is actually a javascript array
        arr = [];
        for (i = 0; i < obj.length; ++i) {
            //for each object, convert it to a python object if it isn't one already
            const subval = obj[i];
            if(!isSkBuiltin(subval)){
                arr.push(mixedRemapToPy(subval));
            }else{
                arr.push(subval);
            }
        }
        return new Sk.builtin.list(arr);
    } else if (obj === null) {//null object
        return Sk.builtin.none.none$;
    } else if (typeof obj === "object") {
        if(!isSkBuiltin(obj)){
            //assuming it's a standard dictionary
            kvs = [];//Sk.builtin.dict uses an array of key-value,key-value...
            for (k in obj) {
                //convert the key if it needs to be converted
                kvs.push(mixedRemapToPy(k));
                //covert corresponding value if it needs to be converted
                kvs.push(mixedRemapToPy(obj[k]));
            }
            //create the new dictionary
            return new Sk.builtin.dict(kvs);
        }else{
            return obj;
        }
    } else if (typeof obj === "string") {
        return new Sk.builtin.str(obj);
    } else if (typeof obj === "number") {
        return Sk.builtin.assk$(obj);
    } else if (typeof obj === "boolean") {
        return new Sk.builtin.bool(obj);
    } else if(typeof obj === "function") {
        return new Sk.builtin.str(obj.name);
    }
}

export function getCurrentTime(): string {
    const today = new Date();
    let h = Math.floor(today.getHours() % 12);
    let m: number | string = today.getMinutes();
    //let s = today.getSeconds();
    if (m < 10) {m = "0" + m;}
    //if (s < 10) {s = "0" + s;}
    let p = "am";
    if (today.getHours() >= 12) {
        p = "pm";
    }
    return `${h}:${m}${p}`;
}

export const pyInt = Sk.builtin.int_;
export const pyNone = Sk.builtin.none.none$;
export const pyStr = Sk.builtin.str;
export const pyTuple = Sk.builtin.tuple;
export const pyCallOrSuspend = Sk.misceval.callsimOrSuspendArray;

export const { isTrue, richCompareBool, chain } = Sk.misceval;
export const { typeName, setUpModuleMethods, buildNativeClass } = Sk.abstr;
export const { TypeError, ValueError, KeyError, IndexError, checkString, asnum$ } = Sk.builtin;
export const { remapToPy, remapToJs } = Sk.ffi;
export const { getAttr, setAttr } = Sk.generic;
export const chainOrSuspend = chain;