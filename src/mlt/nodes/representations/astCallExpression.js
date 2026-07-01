import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
function extractCallArguments(argListNode, source, errors, ctx) {
    const args = ctx.meaningfulChildren(argListNode);
    return args.map((arg) => ctx.exprToBlock(arg, source, errors));
}
const funcCallAstModule = {
    blockType: PYTHON_BLOCK_TYPES.FUNC_CALL,
    expressionNodeTypes: ["CallExpression"],
    expressionToBlock: (node, source, errors, ctx) => {
        const children = ctx.allChildren(node);
        if (children.length < 1) {
            return ctx.makeCstExprBlock(node, source);
        }
        const funcNode = children[0];
        const funcName = ctx.nodeText(funcNode, source);
        const argListNode = ctx.childByType(node, "ArgList");
        let argBlocks = [];
        if (argListNode) {
            argBlocks = extractCallArguments(argListNode, source, errors, ctx);
        }
        if (funcName === "print") {
            return ctx.makeBlock(
                PYTHON_BLOCK_TYPES.PRINT,
                {},
                argBlocks[0] ? { VALUE: argBlocks[0] } : {},
                {}
            );
        }
        const values = {};
        argBlocks.forEach((arg, index) => {
            values[`ARG${index}`] = arg;
        });
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.FUNC_CALL,
            { NAME: funcName },
            values,
            {},
            { argc: String(argBlocks.length) }
        );
    }
};
const printCallAstModule = {
    blockType: PYTHON_BLOCK_TYPES.PRINT
};
export {
    funcCallAstModule,
    printCallAstModule
};
