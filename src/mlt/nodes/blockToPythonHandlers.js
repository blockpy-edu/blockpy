import { PYTHON_BLOCK_TYPES } from "../pythonBlocks";
import { blockToPython as addBlockToPython } from "./representations/add";
import { blockToPython as assignBlockToPython } from "./representations/assign";
import { blockToPython as attrBlockToPython } from "./representations/attr";
import { blockToPython as booleanBlockToPython } from "./representations/boolean";
import { blockToPython as boolOpBlockToPython } from "./representations/boolOp";
import { blockToPython as compareBlockToPython } from "./representations/compare";
import { blockToPython as comprehensionBlockToPython } from "./representations/comprehension";
import { blockToPython as comprehensionForBlockToPython } from "./representations/comprehensionFor";
import { blockToPython as comprehensionIfBlockToPython } from "./representations/comprehensionIf";
import { blockToPython as cstExprBlockToPython } from "./representations/cstExpr";
import { blockToPython as cstStmtBlockToPython } from "./representations/cstStmt";
import { blockToPython as decoratedBlockToPython } from "./representations/decorated";
import { blockToPython as dictBlockToPython } from "./representations/dict";
import { blockToPython as divideBlockToPython } from "./representations/divide";
import { blockToPython as errorBlockToPython } from "./representations/error";
import { blockToPython as exprStmtBlockToPython } from "./representations/exprStmt";
import { blockToPython as forBlockToPython } from "./representations/for";
import { blockToPython as forElseBlockToPython } from "./representations/forElse";
import { blockToPython as funcCallBlockToPython } from "./representations/funcCall";
import { blockToPython as funcDefBlockToPython } from "./representations/funcDef";
import { blockToPython as ifBlockToPython } from "./representations/if";
import { blockToPython as importBlockToPython } from "./representations/import";
import { blockToPython as indexBlockToPython } from "./representations/index";
import { blockToPython as listBlockToPython } from "./representations/list";
import { blockToPython as moduloBlockToPython } from "./representations/modulo";
import { blockToPython as multiplyBlockToPython } from "./representations/multiply";
import { blockToPython as noneBlockToPython } from "./representations/none";
import { blockToPython as notBlockToPython } from "./representations/not";
import { blockToPython as numberBlockToPython } from "./representations/number";
import { blockToPython as powerBlockToPython } from "./representations/power";
import { blockToPython as printBlockToPython } from "./representations/print";
import { blockToPython as returnBlockToPython } from "./representations/return";
import { blockToPython as stringBlockToPython } from "./representations/string";
import { blockToPython as subtractBlockToPython } from "./representations/subtract";
import { blockToPython as tryBlockToPython } from "./representations/try";
import { blockToPython as tupleBlockToPython } from "./representations/tuple";
import { blockToPython as unsupportedBlockToPython } from "./representations/unsupported";
import { blockToPython as variableBlockToPython } from "./representations/variable";
import { blockToPython as whileBlockToPython } from "./representations/while";
import { blockToPython as whileElseBlockToPython } from "./representations/whileElse";
const blockToPythonHandlers = {
    [PYTHON_BLOCK_TYPES.NUMBER]: numberBlockToPython,
    [PYTHON_BLOCK_TYPES.STRING]: stringBlockToPython,
    [PYTHON_BLOCK_TYPES.BOOLEAN]: booleanBlockToPython,
    [PYTHON_BLOCK_TYPES.NONE]: noneBlockToPython,
    [PYTHON_BLOCK_TYPES.VARIABLE]: variableBlockToPython,
    [PYTHON_BLOCK_TYPES.ASSIGN]: assignBlockToPython,
    [PYTHON_BLOCK_TYPES.ADD]: addBlockToPython,
    [PYTHON_BLOCK_TYPES.SUBTRACT]: subtractBlockToPython,
    [PYTHON_BLOCK_TYPES.MULTIPLY]: multiplyBlockToPython,
    [PYTHON_BLOCK_TYPES.DIVIDE]: divideBlockToPython,
    [PYTHON_BLOCK_TYPES.MODULO]: moduloBlockToPython,
    [PYTHON_BLOCK_TYPES.POWER]: powerBlockToPython,
    [PYTHON_BLOCK_TYPES.COMPARE]: compareBlockToPython,
    [PYTHON_BLOCK_TYPES.BOOL_OP]: boolOpBlockToPython,
    [PYTHON_BLOCK_TYPES.NOT]: notBlockToPython,
    [PYTHON_BLOCK_TYPES.IF]: ifBlockToPython,
    [PYTHON_BLOCK_TYPES.WHILE]: whileBlockToPython,
    [PYTHON_BLOCK_TYPES.WHILE_ELSE]: whileElseBlockToPython,
    [PYTHON_BLOCK_TYPES.FOR]: forBlockToPython,
    [PYTHON_BLOCK_TYPES.FOR_ELSE]: forElseBlockToPython,
    [PYTHON_BLOCK_TYPES.FUNC_DEF]: funcDefBlockToPython,
    [PYTHON_BLOCK_TYPES.FUNC_CALL]: funcCallBlockToPython,
    [PYTHON_BLOCK_TYPES.RETURN]: returnBlockToPython,
    [PYTHON_BLOCK_TYPES.LIST]: listBlockToPython,
    [PYTHON_BLOCK_TYPES.TUPLE]: tupleBlockToPython,
    [PYTHON_BLOCK_TYPES.DICT]: dictBlockToPython,
    [PYTHON_BLOCK_TYPES.PRINT]: printBlockToPython,
    [PYTHON_BLOCK_TYPES.EXPR_STMT]: exprStmtBlockToPython,
    [PYTHON_BLOCK_TYPES.IMPORT]: importBlockToPython,
    [PYTHON_BLOCK_TYPES.ATTR]: attrBlockToPython,
    [PYTHON_BLOCK_TYPES.INDEX]: indexBlockToPython,
    [PYTHON_BLOCK_TYPES.COMPREHENSION]: comprehensionBlockToPython,
    [PYTHON_BLOCK_TYPES.COMPREHENSION_FOR]: comprehensionForBlockToPython,
    [PYTHON_BLOCK_TYPES.COMPREHENSION_IF]: comprehensionIfBlockToPython,
    [PYTHON_BLOCK_TYPES.DECORATED]: decoratedBlockToPython,
    [PYTHON_BLOCK_TYPES.CST_EXPR]: cstExprBlockToPython,
    [PYTHON_BLOCK_TYPES.CST_STMT]: cstStmtBlockToPython,
    [PYTHON_BLOCK_TYPES.TRY]: tryBlockToPython,
    [PYTHON_BLOCK_TYPES.UNSUPPORTED]: unsupportedBlockToPython,
    [PYTHON_BLOCK_TYPES.ERROR]: errorBlockToPython
};
export {
    blockToPythonHandlers
};
