import { blockToPythonHandlers } from "./nodes/blockToPythonHandlers";
function indent(code, spaces = 4) {
    return code.split("\n").map((line) => " ".repeat(spaces) + line).join("\n");
}
function variadicInputCodes(block, preferredPrefix, errors, fallbackInput) {
    const values = [];
    for (let i = 0; i < 32; i++) {
        const child = block.getInputTargetBlock(`${preferredPrefix}${i}`);
        if (!child) {continue;}
        const code = blockToCode(child, errors).trim();
        if (code) {values.push(code);}
    }
    if (values.length === 0 && fallbackInput) {
        const fallback = block.getInputTargetBlock(fallbackInput);
        if (fallback) {
            const code = blockToCode(fallback, errors).trim();
            if (code) {values.push(code);}
        }
    }
    return values;
}
function comprehensionClauses(block, errors) {
    return variadicInputCodes(block, "GENERATOR", errors).filter(Boolean);
}
function blockToCode(block, errors) {
    if (!block) {return "";}
    const type = block.type;
    const handler = blockToPythonHandlers[type];
    if (!handler) {
        errors.push({
            type: "unsupported_syntax",
            message: `Unknown block type: ${type}`,
            nodeType: type
        });
        return `# unknown block: ${type}`;
    }
    const ctx = {
        blockToCode,
        statementToCode,
        indent,
        variadicInputCodes,
        comprehensionClauses
    };
    return handler(block, errors, ctx);
}
function statementToCode(block, errors) {
    if (!block) {return "";}
    const lines = [];
    let current = block;
    while (current) {
        const line = blockToCode(current, errors);
        if (line) {lines.push(line);}
        current = current.getNextBlock ? current.getNextBlock() : null;
    }
    return lines.join("\n");
}
function workspaceToPython(workspace) {
    const errors = [];
    if (!workspace) {return { code: "", errors };}
    const topBlocks = workspace.getTopBlocks(true);
    const lines = [];
    for (const block of topBlocks) {
        const code = blockToCode(block, errors);
        if (code.trim()) {
            lines.push(code);
            let next = block.getNextBlock ? block.getNextBlock() : null;
            while (next) {
                const nextCode = blockToCode(next, errors);
                if (nextCode.trim()) {lines.push(nextCode);}
                next = next.getNextBlock ? next.getNextBlock() : null;
            }
        }
    }
    return { code: lines.join("\n"), errors };
}
export {
    blockToCode,
    statementToCode,
    workspaceToPython
};
