import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerExprStmtBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.EXPR_STMT] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.EXPR_STMT,
                message0: "%1",
                args0: [{ type: "input_value", name: "VALUE" }],
                previousStatement: null,
                nextStatement: null,
                colour: 300,
                tooltip: "Standalone expression statement"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const valueBlock = block.getInputTargetBlock("VALUE");
    return valueBlock ? ctx.blockToCode(valueBlock, errors) : "";
}
export {
    blockToPython,
    registerExprStmtBlock
};
