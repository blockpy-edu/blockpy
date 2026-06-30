import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerIndexBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.INDEX] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.INDEX,
                message0: "%1 [ %2 ]",
                args0: [
                    { type: "input_value", name: "VALUE" },
                    { type: "input_value", name: "INDEX" }
                ],
                output: null,
                colour: 260,
                tooltip: "Index access"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const value = ctx.blockToCode(block.getInputTargetBlock("VALUE"), errors);
    const index = ctx.blockToCode(block.getInputTargetBlock("INDEX"), errors);
    return `${value}[${index}]`;
}
export {
    blockToPython,
    registerIndexBlock
};
