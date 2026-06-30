import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerFuncDefBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.FUNC_DEF] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.FUNC_DEF,
                message0: "def %1 (%2)",
                args0: [
                    { type: "field_input", name: "NAME", text: "my_function" },
                    { type: "field_input", name: "PARAMS", text: "" }
                ],
                message1: "do %1",
                args1: [{ type: "input_statement", name: "BODY" }],
                previousStatement: null,
                nextStatement: null,
                colour: 290,
                tooltip: "Function definition"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const name = block.getFieldValue("NAME");
    const params = block.getFieldValue("PARAMS");
    const bodyBlock = block.getInputTargetBlock("BODY");
    const bodyCode = ctx.statementToCode(bodyBlock, errors);
    return `def ${name}(${params}):
${ctx.indent(bodyCode || "pass")}`;
}
export {
    blockToPython,
    registerFuncDefBlock
};
