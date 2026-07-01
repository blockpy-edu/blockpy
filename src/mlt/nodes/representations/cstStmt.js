import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerCstStmtBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.CST_STMT] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.CST_STMT,
                message0: "[%1] %2",
                args0: [
                    { type: "field_label", name: "NODE", text: "" },
                    { type: "field_label", name: "CODE", text: "" }
                ],
                previousStatement: null,
                nextStatement: null,
                colour: 0,
                tooltip: "Generic CST statement node"
            });
        }
    };
}
function blockToPython(block) {
    return block.getFieldValue("CODE") || "";
}
export {
    blockToPython,
    registerCstStmtBlock
};
