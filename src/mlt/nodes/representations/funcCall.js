import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerFuncCallBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.FUNC_CALL] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.FUNC_CALL,
                message0: "%1(%2)",
                args0: [
                    { type: "field_input", name: "NAME", text: "foo" },
                    { type: "input_value", name: "ARG0" }
                ],
                output: null,
                colour: 290,
                tooltip: "Function call"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const name = block.getFieldValue("NAME");
    const args = ctx.variadicInputCodes(block, "ARG", errors, "ARG0");
    return `${name}(${args.join(", ")})`;
}
export {
    blockToPython,
    registerFuncCallBlock
};
