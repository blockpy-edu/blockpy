import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const ARITH_OPS = {
    "+": PYTHON_BLOCK_TYPES.ADD,
    "-": PYTHON_BLOCK_TYPES.SUBTRACT,
    "*": PYTHON_BLOCK_TYPES.MULTIPLY,
    "/": PYTHON_BLOCK_TYPES.DIVIDE,
    "%": PYTHON_BLOCK_TYPES.MODULO,
    "**": PYTHON_BLOCK_TYPES.POWER
};
const COMPARE_OPS = /* @__PURE__ */ new Set(["==", "!=", "<", "<=", ">", ">="]);
const addAstModule = {
    blockType: PYTHON_BLOCK_TYPES.ADD,
    expressionNodeTypes: ["BinaryExpression"],
    expressionToBlock: (node, source, errors, ctx) => {
        const children = ctx.allChildren(node);
        if (children.length < 3) {
            return ctx.makeCstExprBlock(node, source);
        }
        const leftNode = children[0];
        const opNode = children[1];
        const rightNode = children[2];
        const op = ctx.nodeText(opNode, source);
        const left = ctx.exprToBlock(leftNode, source, errors);
        const right = ctx.exprToBlock(rightNode, source, errors);
        if (op in ARITH_OPS) {
            return ctx.makeBlock(ARITH_OPS[op], {}, { LEFT: left, RIGHT: right }, {});
        }
        if (COMPARE_OPS.has(op)) {
            return ctx.makeBlock(
                PYTHON_BLOCK_TYPES.COMPARE,
                { OP: op },
                { LEFT: left, RIGHT: right },
                {}
            );
        }
        if (op === "and" || op === "or") {
            return ctx.makeBlock(
                PYTHON_BLOCK_TYPES.BOOL_OP,
                { OP: op },
                { LEFT: left, RIGHT: right },
                {}
            );
        }
        return ctx.makeCstExprBlock(node, source);
    }
};
const subtractAstModule = {
    blockType: PYTHON_BLOCK_TYPES.SUBTRACT
};
const multiplyAstModule = {
    blockType: PYTHON_BLOCK_TYPES.MULTIPLY
};
const divideAstModule = {
    blockType: PYTHON_BLOCK_TYPES.DIVIDE
};
const moduloAstModule = {
    blockType: PYTHON_BLOCK_TYPES.MODULO
};
const powerAstModule = {
    blockType: PYTHON_BLOCK_TYPES.POWER
};
const compareAstModule = {
    blockType: PYTHON_BLOCK_TYPES.COMPARE
};
const boolOpAstModule = {
    blockType: PYTHON_BLOCK_TYPES.BOOL_OP
};
export {
    addAstModule,
    boolOpAstModule,
    compareAstModule,
    divideAstModule,
    moduloAstModule,
    multiplyAstModule,
    powerAstModule,
    subtractAstModule
};
