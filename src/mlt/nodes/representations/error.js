import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerErrorBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.ERROR] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.ERROR,
                message0: "\u26D4 error: %1",
                args0: [{ type: "field_input", name: "MESSAGE", text: "parse error" }],
                previousStatement: null,
                nextStatement: null,
                colour: 0,
                tooltip: "Parse error block"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void ctx;
    errors.push({
        type: "parse_error",
        message: block.getFieldValue("MESSAGE") || "error block"
    });
    return "# error";
}
export {
    blockToPython,
    registerErrorBlock
};
