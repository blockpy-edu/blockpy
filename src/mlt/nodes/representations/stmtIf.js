import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const ifStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.IF,
    statementNodeTypes: ["IfStatement"],
    statementToBlock: (node, source, errors, ctx) => {
        const children = ctx.allChildren(node);
        const condNode = children.find(
            (c) => c.type.name !== "if" && c.type.name !== "elif" && c.type.name !== "else" && c.type.name !== ":" && c.type.name !== "Body" && c.type.name !== "ElseClause" && c.type.name !== "ElifClause"
        );
        const bodies = ctx.childrenByType(node, "Body");
        const elseClause = ctx.childByType(node, "ElseClause");
        const condXml = condNode ? ctx.exprToBlock(condNode, source, errors) : ctx.makeBlock(PYTHON_BLOCK_TYPES.BOOLEAN, { VALUE: "True" }, {}, {});
        const bodyXml = bodies[0] ? ctx.statementsInBody(bodies[0], source, errors) : "";
        let elseXml = "";
        if (elseClause) {
            const elseBody = ctx.childByType(elseClause, "Body");
            elseXml = elseBody ? ctx.statementsInBody(elseBody, source, errors) : "";
        }
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.IF,
            {},
            { CONDITION: condXml },
            { BODY: bodyXml, ...elseXml ? { ELSE: elseXml } : {} }
        );
    }
};
export {
    ifStatementAstModule
};
