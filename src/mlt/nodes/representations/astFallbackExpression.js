import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const cstExpressionAstModule = {
    blockType: PYTHON_BLOCK_TYPES.CST_EXPR,
    expressionNodeTypes: ["LambdaExpression", "AwaitExpression", "ConditionalExpression"],
    expressionToBlock: (node, source, _errors, ctx) => ctx.makeCstExprBlock(node, source)
};
const parenthesizedAstModule = {
    blockType: PYTHON_BLOCK_TYPES.CST_EXPR,
    expressionNodeTypes: ["ParenthesizedExpression"],
    expressionToBlock: (node, source, errors, ctx) => {
        const inner = ctx.meaningfulChildren(node)[0];
        if (inner) {return ctx.exprToBlock(inner, source, errors);}
        return ctx.makeCstExprBlock(node, source);
    }
};
export {
    cstExpressionAstModule,
    parenthesizedAstModule
};
