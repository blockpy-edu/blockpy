import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerReturnBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.RETURN] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.RETURN,
                message0: "return %1",
                args0: [{ type: "input_value", name: "VALUE" }],
                previousStatement: null,
                colour: 290,
                tooltip: "Return statement"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const valueBlock = block.getInputTargetBlock("VALUE");
    const value = valueBlock ? ctx.blockToCode(valueBlock, errors) : "";
    return `return ${value}`;
}
export {
    blockToPython,
    registerReturnBlock
};
