import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerPrintBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.PRINT] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.PRINT,
                message0: "print(%1)",
                args0: [{ type: "input_value", name: "VALUE" }],
                previousStatement: null,
                nextStatement: null,
                colour: 290,
                tooltip: "Print to output"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const valueBlock = block.getInputTargetBlock("VALUE");
    const value = valueBlock ? ctx.blockToCode(valueBlock, errors) : "";
    return `print(${value})`;
}
export {
    blockToPython,
    registerPrintBlock
};
