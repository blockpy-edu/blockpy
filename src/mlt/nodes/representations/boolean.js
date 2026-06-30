import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerBooleanBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.BOOLEAN] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.BOOLEAN,
                message0: "%1",
                args0: [
                    {
                        type: "field_dropdown",
                        name: "VALUE",
                        options: [
                            ["True", "True"],
                            ["False", "False"]
                        ]
                    }
                ],
                output: "Boolean",
                colour: 210,
                tooltip: "A boolean literal"
            });
        }
    };
}
function blockToPython(block) {
    return block.getFieldValue("VALUE");
}
export {
    blockToPython,
    registerBooleanBlock
};
