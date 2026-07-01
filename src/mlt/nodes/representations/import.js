import { PYTHON_BLOCK_TYPES } from "../../pythonBlocks";
function registerImportBlock(blockly) {
    blockly.Blocks[PYTHON_BLOCK_TYPES.IMPORT] = {
        init() {
            this.jsonInit({
                type: PYTHON_BLOCK_TYPES.IMPORT,
                message0: "import %1",
                args0: [{ type: "field_input", name: "MODULE", text: "math" }],
                previousStatement: null,
                nextStatement: null,
                colour: 45,
                tooltip: "Import a module"
            });
        }
    };
}
function blockToPython(block, errors, ctx) {
    void errors;
    void ctx;
    const module = block.getFieldValue("MODULE");
    return `import ${module}`;
}
export {
    blockToPython,
    registerImportBlock
};
