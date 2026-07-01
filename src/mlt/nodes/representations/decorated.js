import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerDecoratedBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.DECORATED] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.DECORATED,
                message0: "decorators %1",
                args0: [{ type: "field_input", name: "DECORATORS", text: "@decorator" }],
                message1: "definition %1",
                args1: [{ type: "field_input", name: "TARGET", text: "def f(): ..." }],
                previousStatement: null,
                nextStatement: null,
                colour: 290,
                tooltip: "Decorator-applied definition"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void errors;
    void ctx;
    const decoratorsRaw = block.getFieldValue("DECORATORS") || "@decorator";
    const target = block.getFieldValue("TARGET") || "def f():\n    pass";
    const decorators = decoratorsRaw.split(",").map((d) => d.trim()).filter(Boolean).map((d) => d.startsWith("@") ? d : `@${d}`);
    return `${decorators.join("\n")}
${target}`;
}
export {
    blockToPython,
    registerDecoratedBlock
};
