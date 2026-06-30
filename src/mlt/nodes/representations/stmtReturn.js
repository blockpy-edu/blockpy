import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const returnStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.RETURN,
    statementNodeTypes: ["ReturnStatement"],
    statementToBlock: (node, source, errors, ctx) => {
        const children = ctx.allChildren(node);
        const exprNode = children.length > 1 ? children[1] : null;
        const valueXml = exprNode ? ctx.exprToBlock(exprNode, source, errors) : "";
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.RETURN, {}, valueXml ? { VALUE: valueXml } : {}, {});
    }
};
export {
    returnStatementAstModule
};
