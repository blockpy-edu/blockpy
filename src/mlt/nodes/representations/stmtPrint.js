import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const printStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.PRINT,
    statementNodeTypes: ["PrintStatement"],
    statementToBlock: (node, source, errors, ctx) => {
        const children = ctx.allChildren(node);
        const exprNode = children.length > 1 ? children[1] : null;
        const valueXml = exprNode ? ctx.exprToBlock(exprNode, source, errors) : "";
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.PRINT, {}, valueXml ? { VALUE: valueXml } : {}, {});
    }
};
export {
    printStatementAstModule
};
