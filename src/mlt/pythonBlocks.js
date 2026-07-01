import { PYTHON_BLOCK_TYPES } from "./blockTypes";
import { registerNodeRepresentationBlocks } from "./nodes/representations/registry";
function registerPythonBlocks(blockly) {
    registerNodeRepresentationBlocks(blockly);
}
const PYTHON_TOOLBOX = {
    kind: "categoryToolbox",
    contents: [
        {
            kind: "category",
            name: "Values",
            colour: "230",
            contents: [
                { kind: "block", type: PYTHON_BLOCK_TYPES.NUMBER },
                { kind: "block", type: PYTHON_BLOCK_TYPES.STRING },
                { kind: "block", type: PYTHON_BLOCK_TYPES.BOOLEAN },
                { kind: "block", type: PYTHON_BLOCK_TYPES.NONE }
            ]
        },
        {
            kind: "category",
            name: "Variables",
            colour: "330",
            contents: [
                { kind: "block", type: PYTHON_BLOCK_TYPES.VARIABLE },
                { kind: "block", type: PYTHON_BLOCK_TYPES.ASSIGN }
            ]
        },
        {
            kind: "category",
            name: "Arithmetic",
            colour: "230",
            contents: [
                { kind: "block", type: PYTHON_BLOCK_TYPES.ADD },
                { kind: "block", type: PYTHON_BLOCK_TYPES.SUBTRACT },
                { kind: "block", type: PYTHON_BLOCK_TYPES.MULTIPLY },
                { kind: "block", type: PYTHON_BLOCK_TYPES.DIVIDE },
                { kind: "block", type: PYTHON_BLOCK_TYPES.MODULO },
                { kind: "block", type: PYTHON_BLOCK_TYPES.POWER }
            ]
        },
        {
            kind: "category",
            name: "Logic",
            colour: "210",
            contents: [
                { kind: "block", type: PYTHON_BLOCK_TYPES.COMPARE },
                { kind: "block", type: PYTHON_BLOCK_TYPES.BOOL_OP },
                { kind: "block", type: PYTHON_BLOCK_TYPES.NOT }
            ]
        },
        {
            kind: "category",
            name: "Control",
            colour: "120",
            contents: [
                { kind: "block", type: PYTHON_BLOCK_TYPES.IF },
                { kind: "block", type: PYTHON_BLOCK_TYPES.WHILE },
                { kind: "block", type: PYTHON_BLOCK_TYPES.WHILE_ELSE },
                { kind: "block", type: PYTHON_BLOCK_TYPES.FOR },
                { kind: "block", type: PYTHON_BLOCK_TYPES.FOR_ELSE }
            ]
        },
        {
            kind: "category",
            name: "Functions",
            colour: "290",
            contents: [
                { kind: "block", type: PYTHON_BLOCK_TYPES.FUNC_DEF },
                { kind: "block", type: PYTHON_BLOCK_TYPES.FUNC_CALL },
                { kind: "block", type: PYTHON_BLOCK_TYPES.RETURN },
                { kind: "block", type: PYTHON_BLOCK_TYPES.PRINT }
            ]
        },
        {
            kind: "category",
            name: "Lists",
            colour: "260",
            contents: [
                { kind: "block", type: PYTHON_BLOCK_TYPES.LIST },
                { kind: "block", type: PYTHON_BLOCK_TYPES.TUPLE },
                { kind: "block", type: PYTHON_BLOCK_TYPES.DICT },
                { kind: "block", type: PYTHON_BLOCK_TYPES.COMPREHENSION },
                { kind: "block", type: PYTHON_BLOCK_TYPES.COMPREHENSION_FOR },
                { kind: "block", type: PYTHON_BLOCK_TYPES.COMPREHENSION_IF },
                { kind: "block", type: PYTHON_BLOCK_TYPES.INDEX },
                { kind: "block", type: PYTHON_BLOCK_TYPES.ATTR }
            ]
        },
        {
            kind: "category",
            name: "Imports",
            colour: "45",
            contents: [{ kind: "block", type: PYTHON_BLOCK_TYPES.IMPORT }]
        }
    ]
};
export {
    PYTHON_BLOCK_TYPES,
    PYTHON_TOOLBOX,
    registerPythonBlocks
};
