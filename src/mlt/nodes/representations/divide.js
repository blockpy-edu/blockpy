import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerDivideBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.DIVIDE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.DIVIDE,
                message0: "%1 / %2",
                args0: [
                    { type: "input_value", name: "LEFT" },
                    { type: "input_value", name: "RIGHT" }
                ],
                output: "Number",
                colour: 230,
                tooltip: "Divide two values"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const left = ctx.blockToCode(block.getInputTargetBlock("LEFT"), errors);
    const right = ctx.blockToCode(block.getInputTargetBlock("RIGHT"), errors);
    return `(${left} / ${right})`;
}
export {
    blockToPython,
    registerDivideBlock
};
