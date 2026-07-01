import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerForBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.FOR] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.FOR,
                message0: "for %1 in %2",
                args0: [
                    { type: "field_input", name: "VAR", text: "i" },
                    { type: "input_value", name: "ITER" }
                ],
                message1: "do %1",
                args1: [{ type: "input_statement", name: "BODY" }],
                previousStatement: null,
                nextStatement: null,
                colour: 120,
                tooltip: "For loop"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const varName = block.getFieldValue("VAR");
    const iterBlock = block.getInputTargetBlock("ITER");
    const iter = iterBlock ? ctx.blockToCode(iterBlock, errors) : "[]";
    const bodyBlock = block.getInputTargetBlock("BODY");
    const bodyCode = ctx.statementToCode(bodyBlock, errors);
    return `for ${varName} in ${iter}:
${ctx.indent(bodyCode || "pass")}`;
}
export {
    blockToPython,
    registerForBlock
};
