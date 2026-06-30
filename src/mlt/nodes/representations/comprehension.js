import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerComprehensionBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.COMPREHENSION] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.COMPREHENSION,
                message0: "comprehension %1",
                args0: [{ type: "input_value", name: "ELT" }],
                output: null,
                colour: 260,
                tooltip: "Python comprehension"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    const kind = block.getFieldValue("KIND") || "list";
    const legacyCode = (block.getFieldValue("CODE") || "").trim();
    const elt = ctx.blockToCode(block.getInputTargetBlock("ELT"), errors).trim();
    const clauses = ctx.comprehensionClauses(block, errors);
    const inner = elt && clauses.length > 0 ? `${elt} ${clauses.join(" ")}` : legacyCode || "x for x in []";
    if (kind === "generator") {return `(${inner})`;}
    if (kind === "set") {return `{${inner}}`;}
    if (kind === "dict") {return `{${inner}}`;}
    return `[${inner}]`;
}
export {
    blockToPython,
    registerComprehensionBlock
};
