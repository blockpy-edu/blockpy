import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerDictBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.DICT] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.DICT,
                message0: "%1",
                args0: [{ type: "field_input", name: "CODE", text: '{"key": 1}' }],
                output: null,
                colour: 260,
                tooltip: "Dictionary literal"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void errors;
    void ctx;
    const code = block.getFieldValue("CODE") || "{}";
    return code.trim() || "{}";
}
export {
    blockToPython,
    registerDictBlock
};
