import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerComprehensionForBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.COMPREHENSION_FOR] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.COMPREHENSION_FOR,
                message0: "for %1 in %2",
                args0: [
                    { type: "input_value", name: "TARGET" },
                    { type: "input_value", name: "ITER" }
                ],
                inputsInline: true,
                output: "ComprehensionFor",
                colour: 260,
                tooltip: "Comprehension for clause"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const target = ctx.blockToCode(block.getInputTargetBlock("TARGET"), errors) || "_";
    const iter = ctx.blockToCode(block.getInputTargetBlock("ITER"), errors) || "[]";
    return `for ${target} in ${iter}`;
}
export {
    blockToPython,
    registerComprehensionForBlock
};
