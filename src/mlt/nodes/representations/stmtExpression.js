import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const expressionStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.EXPR_STMT,
    statementNodeTypes: ["ExpressionStatement"],
    statementToBlock: (node, source, errors, ctx) => {
        const exprNode = node.firstChild;
        if (!exprNode) {return "";}
        const exprXml = ctx.exprToBlock(exprNode, source, errors);
        if (exprXml.includes(`type="${PYTHON_BLOCK_TYPES.PRINT}"`)) {
            return exprXml;
        }
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.EXPR_STMT, {}, { VALUE: exprXml }, {});
    }
};
const yieldStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.EXPR_STMT,
    statementNodeTypes: ["YieldStatement"],
    statementToBlock: (node, source, errors, ctx) => {
        const children = ctx.meaningfulChildren(node);
        const valueXml = children[0] ? ctx.exprToBlock(children[0], source, errors) : "";
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.EXPR_STMT, {}, valueXml ? { VALUE: valueXml } : {}, {});
    }
};
export {
    expressionStatementAstModule,
    yieldStatementAstModule
};
