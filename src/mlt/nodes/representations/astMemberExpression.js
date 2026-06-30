import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const attrAstModule = {
    blockType: PYTHON_BLOCK_TYPES.ATTR,
    expressionNodeTypes: ["MemberExpression"],
    expressionToBlock: (node, source, errors, ctx) => {
        const parts = ctx.meaningfulChildren(node);
        if (parts.length >= 2) {
            const leftXml = ctx.exprToBlock(parts[0], source, errors);
            const rightPart = parts[1];
            if (rightPart.type.name === "PropertyName") {
                return ctx.makeBlock(
                    PYTHON_BLOCK_TYPES.ATTR,
                    { ATTR: ctx.nodeText(rightPart, source) },
                    { OBJ: leftXml },
                    {}
                );
            }
            return ctx.makeBlock(
                PYTHON_BLOCK_TYPES.INDEX,
                {},
                { VALUE: leftXml, INDEX: ctx.exprToBlock(rightPart, source, errors) },
                {}
            );
        }
        return ctx.makeCstExprBlock(node, source);
    }
};
const indexAstModule = {
    blockType: PYTHON_BLOCK_TYPES.INDEX
};
export {
    attrAstModule,
    indexAstModule
};
