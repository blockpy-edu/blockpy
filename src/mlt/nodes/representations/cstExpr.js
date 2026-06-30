import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerCstExprBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.CST_EXPR] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.CST_EXPR,
                message0: "[%1] %2",
                args0: [
                    { type: "field_label", name: "NODE", text: "" },
                    { type: "field_label", name: "CODE", text: "" }
                ],
                output: null,
                colour: 0,
                tooltip: "Generic CST expression node"
            });
        }
    };
}
function blockToPython(block) {
    return block.getFieldValue("CODE") || "";
}
export {
    blockToPython,
    registerCstExprBlock
};
