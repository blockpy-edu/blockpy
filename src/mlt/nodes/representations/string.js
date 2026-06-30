import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerStringBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.STRING] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.STRING,
                message0: '"%1"',
                args0: [{ type: "field_input", name: "VALUE", text: "" }],
                output: "String",
                colour: 160,
                tooltip: "A string literal"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void errors;
    void ctx;
    return JSON.stringify(block.getFieldValue("VALUE"));
}
export {
    blockToPython,
    registerStringBlock
};
