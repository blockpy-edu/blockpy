import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const decoratedStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.DECORATED,
    statementNodeTypes: ["DecoratedStatement"],
    statementToBlock: (node, source, _errors, ctx) => {
        const decorators = ctx.childrenByType(node, "Decorator").map((decorator) => ctx.nodeText(decorator, source).trim()).join(", ");
        const target = ctx.meaningfulChildren(node).find((child) => child.type.name !== "Decorator");
        const targetCode = target ? ctx.nodeText(target, source) : "";
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.DECORATED,
            {
                DECORATORS: decorators || "@decorator",
                TARGET: targetCode || ctx.nodeText(node, source)
            },
            {},
            {}
        );
    }
};
export {
    decoratedStatementAstModule
};
