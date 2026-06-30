import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerIfBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.IF] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.IF,
                message0: "if %1",
                args0: [{ type: "input_value", name: "CONDITION" }],
                message1: "do %1",
                args1: [{ type: "input_statement", name: "BODY" }],
                message2: "else %1",
                args2: [{ type: "input_statement", name: "ELSE" }],
                previousStatement: null,
                nextStatement: null,
                colour: 120,
                tooltip: "If/else statement"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const condition = ctx.blockToCode(block.getInputTargetBlock("CONDITION"), errors);
    const bodyBlock = block.getInputTargetBlock("BODY");
    const elseBlock = block.getInputTargetBlock("ELSE");
    let code = `if ${condition}:
`;
    const bodyCode = ctx.statementToCode(bodyBlock, errors);
    code += ctx.indent(bodyCode || "pass") + "\n";
    if (elseBlock) {
        code += "else:\n";
        code += ctx.indent(ctx.statementToCode(elseBlock, errors) || "pass") + "\n";
    }
    return code.trimEnd();
}
export {
    blockToPython,
    registerIfBlock
};
