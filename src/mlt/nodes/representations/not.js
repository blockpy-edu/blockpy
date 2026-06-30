import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerNotBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.NOT] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.NOT,
                message0: "not %1",
                args0: [{ type: "input_value", name: "VALUE" }],
                output: "Boolean",
                colour: 210,
                tooltip: "Boolean not"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const value = ctx.blockToCode(block.getInputTargetBlock("VALUE"), errors);
    return `(not ${value})`;
}
export {
    blockToPython,
    registerNotBlock
};
