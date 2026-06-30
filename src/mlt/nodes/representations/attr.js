import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerAttrBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.ATTR] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.ATTR,
                message0: "%1 . %2",
                args0: [
                    { type: "input_value", name: "OBJ" },
                    { type: "field_input", name: "ATTR", text: "attr" }
                ],
                output: null,
                colour: 330,
                tooltip: "Attribute access"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const obj = ctx.blockToCode(block.getInputTargetBlock("OBJ"), errors);
    const attr = block.getFieldValue("ATTR");
    return `${obj}.${attr}`;
}
export {
    blockToPython,
    registerAttrBlock
};
