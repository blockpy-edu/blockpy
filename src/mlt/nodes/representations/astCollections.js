import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const listAstModule = {
    blockType: PYTHON_BLOCK_TYPES.LIST,
    expressionNodeTypes: ["ArrayExpression"],
    expressionToBlock: (node, source, errors, ctx) => {
        const items = ctx.meaningfulChildren(node);
        const values = {};
        items.forEach((item, index) => {
            values[`ADD${index}`] = ctx.exprToBlock(item, source, errors);
        });
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.LIST, {}, values, {}, { argc: String(items.length) });
    }
};
const tupleAstModule = {
    blockType: PYTHON_BLOCK_TYPES.TUPLE,
    expressionNodeTypes: ["TupleExpression"],
    expressionToBlock: (node, source, errors, ctx) => {
        const items = ctx.meaningfulChildren(node);
        const values = {};
        items.forEach((item, index) => {
            values[`ADD${index}`] = ctx.exprToBlock(item, source, errors);
        });
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.TUPLE, {}, values, {}, { argc: String(items.length) });
    }
};
const dictAstModule = {
    blockType: PYTHON_BLOCK_TYPES.DICT,
    expressionNodeTypes: ["DictionaryExpression"],
    expressionToBlock: (node, source, _errors, ctx) => ctx.makeBlock(PYTHON_BLOCK_TYPES.DICT, { CODE: ctx.nodeText(node, source) }, {}, {})
};
export {
    dictAstModule,
    listAstModule,
    tupleAstModule
};
