import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
function forStatementToBlock(node, source, errors, ctx) {
    var _a;
    const children = ctx.allChildren(node);
    const inIdx = children.findIndex((c) => c.type.name === "in");
    if (inIdx < 1) {
        return ctx.makeCstStmtBlock(node, source);
    }
    const varNode = children[inIdx - 1];
    const bodyNodes = ctx.childrenByType(node, "Body");
    const hasElseToken = children.some((c) => c.type.name === "else");
    const bodyNode = (_a = bodyNodes[0]) != null ? _a : null;
    const elseBodyNode = hasElseToken && bodyNodes.length > 1 ? bodyNodes[bodyNodes.length - 1] : null;
    const bodyIdx = children.findIndex((c) => c.type.name === "Body");
    const iterNode = bodyIdx > inIdx + 1 ? children[inIdx + 1] : null;
    const varName = ctx.nodeText(varNode, source);
    const iterXml = iterNode ? ctx.exprToBlock(iterNode, source, errors) : ctx.makeBlock(PYTHON_BLOCK_TYPES.LIST, {}, {}, {});
    const bodyXml = bodyNode ? ctx.statementsInBody(bodyNode, source, errors) : "";
    if (elseBodyNode) {
        const elseXml = ctx.statementsInBody(elseBodyNode, source, errors);
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.FOR_ELSE,
            { VAR: varName },
            { ITER: iterXml },
            { BODY: bodyXml, ...elseXml ? { ELSE: elseXml } : {} }
        );
    }
    return ctx.makeBlock(
        PYTHON_BLOCK_TYPES.FOR,
        { VAR: varName },
        { ITER: iterXml },
        { BODY: bodyXml }
    );
}
const forStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.FOR,
    statementNodeTypes: ["ForStatement"],
    statementToBlock: forStatementToBlock
};
const forElseStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.FOR_ELSE
};
export {
    forElseStatementAstModule,
    forStatementAstModule
};
