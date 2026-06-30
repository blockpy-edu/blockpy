import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerWhileElseBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.WHILE_ELSE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.WHILE_ELSE,
                message0: "while %1",
                args0: [{ type: "input_value", name: "CONDITION" }],
                message1: "do %1",
                args1: [{ type: "input_statement", name: "BODY" }],
                message2: "else %1",
                args2: [{ type: "input_statement", name: "ELSE" }],
                previousStatement: null,
                nextStatement: null,
                colour: 120,
                tooltip: "While/else loop"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const condition = ctx.blockToCode(block.getInputTargetBlock("CONDITION"), errors);
    const bodyBlock = block.getInputTargetBlock("BODY");
    const elseBlock = block.getInputTargetBlock("ELSE");
    const bodyCode = ctx.statementToCode(bodyBlock, errors);
    const elseCode = ctx.statementToCode(elseBlock, errors);
    return `while ${condition}:
${ctx.indent(bodyCode || "pass")}
else:
${ctx.indent(elseCode || "pass")}`;
}
export {
    blockToPython,
    registerWhileElseBlock
};
