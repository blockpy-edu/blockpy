import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerTryBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.TRY] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.TRY,
                message0: "try block %1",
                args0: [{ type: "field_input", name: "CODE", text: "try:\n    pass" }],
                previousStatement: null,
                nextStatement: null,
                colour: 120,
                tooltip: "Try/except/finally source fallback"
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
    registerTryBlock
};
