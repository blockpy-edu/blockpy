import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerUnsupportedBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.UNSUPPORTED] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.UNSUPPORTED,
                message0: "\u26A0 unsupported: %1",
                args0: [{ type: "field_input", name: "CODE", text: "..." }],
                previousStatement: null,
                nextStatement: null,
                colour: 0,
                tooltip: "Unsupported Python syntax"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void errors;
    void ctx;
    return block.getFieldValue("CODE") || "";
}
export {
    blockToPython,
    registerUnsupportedBlock
};
