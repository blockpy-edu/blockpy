import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerVariableBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.VARIABLE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.VARIABLE,
                message0: "%1",
                args0: [{ type: "field_input", name: "NAME", text: "x" }],
                output: null,
                colour: 330,
                tooltip: "A variable reference"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void errors;
    void ctx;
    return block.getFieldValue("NAME");
}
export {
    blockToPython,
    registerVariableBlock
};
