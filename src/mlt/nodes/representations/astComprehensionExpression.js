import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
function isTokenNode(type) {
    return type === "" || /^[^A-Za-z]+$/.test(type);
}
function isKeywordNode(type) {
    return (/* @__PURE__ */ new Set([
        "if",
        "else",
        "elif",
        "for",
        "in",
        "while",
        "return",
        "def",
        "class",
        "lambda",
        "yield",
        "await",
        "from",
        "import",
        "as",
        "try",
        "except",
        "finally",
        "with",
        "async",
        "pass",
        "and",
        "or",
        "not"
    ])).has(type);
}
function isIgnorableLeaf(type) {
    return type === "newline" || type === "indent" || type === "dedent" || type === "Comment";
}
function comprehensionKind(nodeType) {
    switch (nodeType) {
        case "ArrayComprehensionExpression":
            return "list";
        case "SetComprehensionExpression":
            return "set";
        case "DictionaryComprehensionExpression":
            return "dict";
        case "ComprehensionExpression":
            return "generator";
        default:
            return "list";
    }
}
function makeComprehensionFragment(text, label, ctx) {
    return ctx.makeBlock(
        PYTHON_BLOCK_TYPES.CST_EXPR,
        { NODE: label, CODE: text.trim() || "_" },
        {},
        {}
    );
}
function nextClauseBoundary(children, start) {
    for (let i = start; i < children.length; i++) {
        const type = children[i].type.name;
        if (type === "for" || type === "if") {
            return i;
        }
    }
    return children.length - 1;
}
function expressionFromSlice(children, start, endExclusive, source, errors, label, ctx) {
    if (start >= endExclusive || start < 0 || endExclusive > children.length) {
        return makeComprehensionFragment("_", label, ctx);
    }
    const slice = children.slice(start, endExclusive);
    const semantic = slice.filter((child) => {
        const type = child.type.name;
        return !isTokenNode(type) && !isKeywordNode(type) && !isIgnorableLeaf(type);
    });
    if (semantic.length === 1) {
        return ctx.exprToBlock(semantic[0], source, errors);
    }
    const raw = source.slice(slice[0].from, slice[slice.length - 1].to).trim();
    return makeComprehensionFragment(raw, label, ctx);
}
function comprehensionToStructuredBlock(node, source, errors, ctx) {
    var _a, _b;
    const children = ctx.allChildren(node);
    const firstFor = children.findIndex((c) => c.type.name === "for");
    if (firstFor === -1) {
        return ctx.makeBlock(
            PYTHON_BLOCK_TYPES.COMPREHENSION,
            { KIND: comprehensionKind(node.type.name), CODE: ctx.nodeText(node, source) },
            {},
            {}
        );
    }
    const expressionStart = isTokenNode((_b = (_a = children[0]) == null ? void 0 : _a.type.name) != null ? _b : "") ? 1 : 0;
    const eltXml = expressionFromSlice(
        children,
        expressionStart,
        firstFor,
        source,
        errors,
        "ComprehensionElt",
        ctx
    );
    const clauseXml = [];
    let i = firstFor;
    while (i < children.length) {
        const type = children[i].type.name;
        if (type === "for") {
            const inIdx = children.findIndex((c, idx) => idx > i && c.type.name === "in");
            if (inIdx <= i) {break;}
            const nextBoundary = nextClauseBoundary(children, inIdx + 1);
            const targetXml = expressionFromSlice(
                children,
                i + 1,
                inIdx,
                source,
                errors,
                "ComprehensionTarget",
                ctx
            );
            const iterXml = expressionFromSlice(
                children,
                inIdx + 1,
                nextBoundary,
                source,
                errors,
                "ComprehensionIter",
                ctx
            );
            clauseXml.push(
                ctx.makeBlock(
                    PYTHON_BLOCK_TYPES.COMPREHENSION_FOR,
                    {},
                    { TARGET: targetXml, ITER: iterXml },
                    {}
                )
            );
            i = nextBoundary;
            continue;
        }
        if (type === "if") {
            const nextBoundary = nextClauseBoundary(children, i + 1);
            const testXml = expressionFromSlice(
                children,
                i + 1,
                nextBoundary,
                source,
                errors,
                "ComprehensionTest",
                ctx
            );
            clauseXml.push(ctx.makeBlock(PYTHON_BLOCK_TYPES.COMPREHENSION_IF, {}, { TEST: testXml }, {}));
            i = nextBoundary;
            continue;
        }
        i++;
    }
    const values = { ELT: eltXml };
    clauseXml.forEach((xml, index) => {
        values[`GENERATOR${index}`] = xml;
    });
    return ctx.makeBlock(
        PYTHON_BLOCK_TYPES.COMPREHENSION,
        { KIND: comprehensionKind(node.type.name), CODE: ctx.nodeText(node, source) },
        values,
        {},
        { items: String(Math.max(1, clauseXml.length)) }
    );
}
const comprehensionAstModule = {
    blockType: PYTHON_BLOCK_TYPES.COMPREHENSION,
    expressionNodeTypes: [
        "ArrayComprehensionExpression",
        "SetComprehensionExpression",
        "DictionaryComprehensionExpression",
        "ComprehensionExpression"
    ],
    expressionToBlock: (node, source, errors, ctx) => comprehensionToStructuredBlock(node, source, errors, ctx)
};
export {
    comprehensionAstModule
};
