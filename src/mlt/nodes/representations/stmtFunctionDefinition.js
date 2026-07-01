import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const functionDefinitionAstModule = {
    blockType: PYTHON_BLOCK_TYPES.FUNC_DEF,
    statementNodeTypes: ["FunctionDefinition"],
    statementToBlock: (node, source, errors, ctx) => {
        const nameNode = ctx.childByType(node, "VariableName");
        const paramListNode = ctx.childByType(node, "ParamList");
        const bodyNode = ctx.childByType(node, "Body");
        const funcName = nameNode ? ctx.nodeText(nameNode, source) : "f";
        const params = paramListNode ? ctx.nodeText(paramListNode, source).replace(/^\(/, "").replace(/\)$/, "") : "";
        const bodyXml = bodyNode ? ctx.statementsInBody(bodyNode, source, errors) : "";
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.FUNC_DEF,
            { NAME: funcName, PARAMS: params },
            {},
            { BODY: bodyXml }
        );
    }
};
export {
    functionDefinitionAstModule
};
