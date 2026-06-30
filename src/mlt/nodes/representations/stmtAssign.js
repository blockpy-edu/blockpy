import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const assignStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.ASSIGN,
    statementNodeTypes: ["AssignStatement"],
    statementToBlock: (node, source, errors, ctx) => {
        const children = ctx.allChildren(node);
        const assignOpIdx = children.findIndex((c) => c.type.name === "AssignOp");
        if (assignOpIdx < 1) {
            return ctx.makeCstStmtBlock(node, source);
        }
        const lhsNode = children[assignOpIdx - 1];
        const rhsNode = children[assignOpIdx + 1];
        const varName = ctx.nodeText(lhsNode, source);
        const valueXml = rhsNode ? ctx.exprToBlock(rhsNode, source, errors) : ctx.makeBlock(PYTHON_BLOCK_TYPES.NONE, {}, {}, {});
        return ctx.makeBlock(PYTHON_BLOCK_TYPES.ASSIGN, { VAR: varName }, { VALUE: valueXml }, {});
    }
};
export {
    assignStatementAstModule
};
