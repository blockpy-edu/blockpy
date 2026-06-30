import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerWhileBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.WHILE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.WHILE,
                message0: "while %1",
                args0: [{ type: "input_value", name: "CONDITION" }],
                message1: "do %1",
                args1: [{ type: "input_statement", name: "BODY" }],
                previousStatement: null,
                nextStatement: null,
                colour: 120,
                tooltip: "While loop"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const condition = ctx.blockToCode(block.getInputTargetBlock("CONDITION"), errors);
    const bodyBlock = block.getInputTargetBlock("BODY");
    const bodyCode = ctx.statementToCode(bodyBlock, errors);
    return `while ${condition}:
${ctx.indent(bodyCode || "pass")}`;
}
export {
    blockToPython,
    registerWhileBlock
};
