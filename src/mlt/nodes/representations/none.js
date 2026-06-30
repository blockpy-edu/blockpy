import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerNoneBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.NONE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.NONE,
                message0: "None",
                output: null,
                colour: 210,
                tooltip: "The None value"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void block;
    void errors;
    void ctx;
    return "None";
}
export {
    blockToPython,
    registerNoneBlock
};
