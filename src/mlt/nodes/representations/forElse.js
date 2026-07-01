import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerForElseBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.FOR_ELSE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.FOR_ELSE,
                message0: "for %1 in %2",
                args0: [
                    { type: "field_input", name: "VAR", text: "i" },
                    { type: "input_value", name: "ITER" }
                ],
                message1: "do %1",
                args1: [{ type: "input_statement", name: "BODY" }],
                message2: "else %1",
                args2: [{ type: "input_statement", name: "ELSE" }],
                previousStatement: null,
                nextStatement: null,
                colour: 120,
                tooltip: "For/else loop"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const varName = block.getFieldValue("VAR");
    const iterBlock = block.getInputTargetBlock("ITER");
    const iter = iterBlock ? ctx.blockToCode(iterBlock, errors) : "[]";
    const bodyBlock = block.getInputTargetBlock("BODY");
    const elseBlock = block.getInputTargetBlock("ELSE");
    const bodyCode = ctx.statementToCode(bodyBlock, errors);
    const elseCode = ctx.statementToCode(elseBlock, errors);
    return `for ${varName} in ${iter}:
${ctx.indent(bodyCode || "pass")}
else:
${ctx.indent(elseCode || "pass")}`;
}
export {
    blockToPython,
    registerForElseBlock
};
