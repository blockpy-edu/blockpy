import { PYTHON_BLOCK_TYPES } from "../../blockTypes";
const passStatementAstModule = {
    blockType: PYTHON_BLOCK_TYPES.CST_STMT,
    statementNodeTypes: ["PassStatement"],
    statementToBlock: () => ""
};
export {
    passStatementAstModule
};
