import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerMultiplyBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.MULTIPLY] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.MULTIPLY,
                message0: "%1 \xD7 %2",
                args0: [
                    { type: "input_value", name: "LEFT" },
                    { type: "input_value", name: "RIGHT" }
                ],
                output: "Number",
                colour: 230,
                tooltip: "Multiply two values"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const left = ctx.blockToCode(block.getInputTargetBlock("LEFT"), errors);
    const right = ctx.blockToCode(block.getInputTargetBlock("RIGHT"), errors);
    return `(${left} * ${right})`;
}
export {
    blockToPython,
    registerMultiplyBlock
};
