import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerComprehensionIfBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.COMPREHENSION_IF] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.COMPREHENSION_IF,
                message0: "if %1",
                args0: [{ type: "input_value", name: "TEST" }],
                inputsInline: true,
                output: "ComprehensionIf",
                colour: 260,
                tooltip: "Comprehension if clause"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const test = ctx.blockToCode(block.getInputTargetBlock("TEST"), errors) || "True";
    return `if ${test}`;
}
export {
    blockToPython,
    registerComprehensionIfBlock
};
