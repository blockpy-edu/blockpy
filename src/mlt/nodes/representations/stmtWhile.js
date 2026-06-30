import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
function whileStatementToBlock(node, source, errors, ctx) {
    var _a;
    const children = ctx.allChildren(node);
    const condNode = children.find(
        (c) => c.type.name !== "while" && c.type.name !== ":" && c.type.name !== "Body" && c.type.name !== "\u26A0"
    );
    const bodyNodes = ctx.childrenByType(node, "Body");
    const hasElseToken = children.some((c) => c.type.name === "else");
    const bodyNode = (_a = bodyNodes[0]) != null ? _a : null;
    const elseBodyNode = hasElseToken && bodyNodes.length > 1 ? bodyNodes[bodyNodes.length - 1] : null;
    const condXml = condNode ? ctx.exprToBlock(condNode, source, errors) : ctx.makeBlock(PYTHON_BLOCK_TYPES.BOOLEAN, { VALUE: "True" }, {}, {});
    const bodyXml = bodyNode ? ctx.statementsInBody(bodyNode, source, errors) : "";
    if (elseBodyNode) {
        const elseXml = ctx.statementsInBody(elseBodyNode, source, errors);
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.WHILE_ELSE,
            {},
            { CONDITION: condXml },
            { BODY: bodyXml, ...elseXml ? { ELSE: elseXml } : {} }
        );
    }
    return ctx.makeBlock(PYTHON_BLOCK_TYPES.WHILE, {}, { CONDITION: condXml }, { BODY: bodyXml });
}
const whileStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.WHILE,
    statementNodeTypes: ["WhileStatement"],
    statementToBlock: whileStatementToBlock
};
const whileElseStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.WHILE_ELSE
};
export {
    whileElseStatementAstModule,
    whileStatementAstModule
};
