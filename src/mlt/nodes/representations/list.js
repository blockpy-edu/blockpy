import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerListBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.LIST] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.LIST,
                message0: "[%1]",
                args0: [{ type: "input_value", name: "ITEMS" }],
                output: "Array",
                colour: 260,
                tooltip: "List literal"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const items = ctx.variadicInputCodes(block, "ADD", errors, "ITEMS");
    return `[${items.join(", ")}]`;
}
export {
    blockToPython,
    registerListBlock
};
