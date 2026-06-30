import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerAssignBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.ASSIGN] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.ASSIGN,
                message0: "%1 = %2",
                args0: [
                    { type: "field_input", name: "VAR", text: "x" },
                    { type: "input_value", name: "VALUE" }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: 330,
                tooltip: "Assign a value to a variable"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const varName = block.getFieldValue("VAR");
    const valueBlock = block.getInputTargetBlock("VALUE");
    const value = valueBlock ? ctx.blockToCode(valueBlock, errors) : "None";
    return `${varName} = ${value}`;
}
export {
    blockToPython,
    registerAssignBlock
};
