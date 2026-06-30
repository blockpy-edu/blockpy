import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerCompareBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.COMPARE] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.COMPARE,
                message0: "%1 %2 %3",
                args0: [
                    { type: "input_value", name: "LEFT" },
                    {
                        type: "field_dropdown",
                        name: "OP",
                        options: [
                            ["==", "=="],
                            ["!=", "!="],
                            ["<", "<"],
                            ["<=", "<="],
                            [">", ">"],
                            [">=", ">="]
                        ]
                    },
                    { type: "input_value", name: "RIGHT" }
                ],
                output: "Boolean",
                colour: 210,
                tooltip: "Compare two values"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const left = ctx.blockToCode(block.getInputTargetBlock("LEFT"), errors);
    const op = block.getFieldValue("OP");
    const right = ctx.blockToCode(block.getInputTargetBlock("RIGHT"), errors);
    return `(${left} ${op} ${right})`;
}
export {
    blockToPython,
    registerCompareBlock
};
