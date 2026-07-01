import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerTupleBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.TUPLE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.TUPLE,
                message0: "(%1)",
                args0: [{ type: "input_value", name: "ITEMS" }],
                output: "Array",
                colour: 260,
                tooltip: "Tuple literal"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const items = ctx.variadicInputCodes(block, "ADD", errors, "ITEMS");
    if (items.length === 1) {
        return `(${items[0]},)`;
    }
    return `(${items.join(", ")})`;
}
export {
    blockToPython,
    registerTupleBlock
};
