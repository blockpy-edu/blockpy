import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const numberAstModule = {
    blockType: PYTHON_BLOCK_TYPES.NUMBER,
    expressionNodeTypes: ["Number"],
    expressionToBlock: (node, source, _errors, ctx) => ctx.makeBlock(PYTHON_BLOCK_TYPES.NUMBER, { VALUE: ctx.nodeText(node, source) }, {}, {})
};
const stringAstModule = {
    blockType: PYTHON_BLOCK_TYPES.STRING,
    expressionNodeTypes: ["String"],
    expressionToBlock: (node, source, _errors, ctx) => {
        const raw = ctx.nodeText(node, source);
        let value = raw;
        if (raw.startsWith('"""') || raw.startsWith("'''")) {
            value = raw.slice(3, -3);
        } else if (raw.startsWith("'") && raw.endsWith("'") || raw.startsWith('"') && raw.endsWith('"')) {
            value = raw.slice(1, -1);
        }
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.STRING, { VALUE: value }, {}, {});
    }
};
const booleanAstModule = {
    blockType: PYTHON_BLOCK_TYPES.BOOLEAN,
    expressionNodeTypes: ["Boolean"],
    expressionToBlock: (node, source, _errors, ctx) => {
        const val = ctx.nodeText(node, source);
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.BOOLEAN,
            { VALUE: val === "True" ? "True" : "False" },
            {},
            {}
        );
    }
};
const noneAstModule = {
    blockType: PYTHON_BLOCK_TYPES.NONE,
    expressionNodeTypes: ["None"],
    expressionToBlock: (_node, _source, _errors, ctx) => ctx.makeBlock(PYTHON_BLOCK_TYPES.NONE, {}, {}, {})
};
const variableAstModule = {
    blockType: PYTHON_BLOCK_TYPES.VARIABLE,
    expressionNodeTypes: ["VariableName"],
    expressionToBlock: (node, source, _errors, ctx) => ctx.makeBlock(PYTHON_BLOCK_TYPES.VARIABLE, { NAME: ctx.nodeText(node, source) }, {}, {})
};
export {
    booleanAstModule,
    noneAstModule,
    numberAstModule,
    stringAstModule,
    variableAstModule
};
