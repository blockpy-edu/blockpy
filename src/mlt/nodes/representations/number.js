import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerNumberBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.NUMBER] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.NUMBER,
                message0: "%1",
                args0: [{ type: "field_number", name: "VALUE", value: 0 }],
                output: "Number",
                colour: 230,
                tooltip: "A number literal"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void errors;
    void ctx;
    return String(block.getFieldValue("VALUE"));
}
export {
    blockToPython,
    registerNumberBlock
};
