import { registerAddBlock } from "./add";
import {
    addAstModule,
    boolOpAstModule,
    compareAstModule,
    divideAstModule,
    moduloAstModule,
    multiplyAstModule,
    powerAstModule,
    subtractAstModule
} from "./astBinaryExpression";
import { funcCallAstModule, printCallAstModule } from "./astCallExpression";
import { comprehensionAstModule } from "./astComprehensionExpression";
import { dictAstModule, listAstModule, tupleAstModule } from "./astCollections";
import { cstExpressionAstModule, parenthesizedAstModule } from "./astFallbackExpression";
import {
    booleanAstModule,
    noneAstModule,
    numberAstModule,
    stringAstModule,
    variableAstModule
} from "./astLiterals";
import { attrAstModule, indexAstModule } from "./astMemberExpression";
import { notAstModule } from "./astUnaryExpression";
import { registerAssignBlock } from "./assign";
import { registerAttrBlock } from "./attr";
import { registerBooleanBlock } from "./boolean";
import { registerBoolOpBlock } from "./boolOp";
import { registerCompareBlock } from "./compare";
import { registerComprehensionBlock } from "./comprehension";
import { registerComprehensionForBlock } from "./comprehensionFor";
import { registerComprehensionIfBlock } from "./comprehensionIf";
import { registerCstExprBlock } from "./cstExpr";
import { registerCstStmtBlock } from "./cstStmt";
import { registerDecoratedBlock } from "./decorated";
import { registerDictBlock } from "./dict";
import { registerDivideBlock } from "./divide";
import { registerErrorBlock } from "./error";
import { registerExprStmtBlock } from "./exprStmt";
import { registerForBlock } from "./for";
import { registerForElseBlock } from "./forElse";
import { registerFuncCallBlock } from "./funcCall";
import { registerFuncDefBlock } from "./funcDef";
import { registerIfBlock } from "./if";
import { registerImportBlock } from "./import";
import { registerIndexBlock } from "./index";
import { registerListBlock } from "./list";
import { registerModuloBlock } from "./modulo";
import { registerMultiplyBlock } from "./multiply";
import { registerNoneBlock } from "./none";
import { registerNotBlock } from "./not";
import { registerNumberBlock } from "./number";
import { registerPowerBlock } from "./power";
import { registerPrintBlock } from "./print";
import { registerReturnBlock } from "./return";
import { assignStatementAstModule } from "./stmtAssign";
import { decoratedStatementAstModule } from "./stmtDecorated";
import { expressionStatementAstModule, yieldStatementAstModule } from "./stmtExpression";
import { forElseStatementAstModule, forStatementAstModule } from "./stmtFor";
import { functionDefinitionAstModule } from "./stmtFunctionDefinition";
import { ifStatementAstModule } from "./stmtIf";
import { importStatementAstModule } from "./stmtImport";
import { passStatementAstModule } from "./stmtPass";
import { printStatementAstModule } from "./stmtPrint";
import { returnStatementAstModule } from "./stmtReturn";
import { whileElseStatementAstModule, whileStatementAstModule } from "./stmtWhile";
import { registerStringBlock } from "./string";
import { registerSubtractBlock } from "./subtract";
import { registerTryBlock } from "./try";
import { registerTupleBlock } from "./tuple";
import { registerUnsupportedBlock } from "./unsupported";
import { registerVariableBlock } from "./variable";
import { registerWhileBlock } from "./while";
import { registerWhileElseBlock } from "./whileElse";
const registerBlocks = [
    registerNumberBlock,
    registerStringBlock,
    registerBooleanBlock,
    registerNoneBlock,
    registerVariableBlock,
    registerAssignBlock,
    registerAddBlock,
    registerSubtractBlock,
    registerMultiplyBlock,
    registerDivideBlock,
    registerModuloBlock,
    registerPowerBlock,
    registerCompareBlock,
    registerBoolOpBlock,
    registerNotBlock,
    registerIfBlock,
    registerWhileBlock,
    registerWhileElseBlock,
    registerForBlock,
    registerForElseBlock,
    registerFuncDefBlock,
    registerFuncCallBlock,
    registerExprStmtBlock,
    registerReturnBlock,
    registerListBlock,
    registerTupleBlock,
    registerDictBlock,
    registerPrintBlock,
    registerImportBlock,
    registerComprehensionForBlock,
    registerComprehensionIfBlock,
    registerComprehensionBlock,
    registerAttrBlock,
    registerIndexBlock,
    registerTryBlock,
    registerDecoratedBlock,
    registerCstExprBlock,
    registerCstStmtBlock,
    registerUnsupportedBlock,
    registerErrorBlock
];
const astNodeModules = [
    numberAstModule,
    stringAstModule,
    booleanAstModule,
    noneAstModule,
    variableAstModule,
    addAstModule,
    subtractAstModule,
    multiplyAstModule,
    divideAstModule,
    moduloAstModule,
    powerAstModule,
    compareAstModule,
    boolOpAstModule,
    notAstModule,
    printCallAstModule,
    funcCallAstModule,
    listAstModule,
    tupleAstModule,
    dictAstModule,
    attrAstModule,
    indexAstModule,
    comprehensionAstModule,
    parenthesizedAstModule,
    cstExpressionAstModule,
    assignStatementAstModule,
    expressionStatementAstModule,
    yieldStatementAstModule,
    ifStatementAstModule,
    whileElseStatementAstModule,
    whileStatementAstModule,
    forElseStatementAstModule,
    forStatementAstModule,
    functionDefinitionAstModule,
    decoratedStatementAstModule,
    returnStatementAstModule,
    importStatementAstModule,
    passStatementAstModule,
    printStatementAstModule
];
function collectExpressionHandlers() {
    var _a;
    const handlers = {};
    for (const module of astNodeModules) {
        if (!module.expressionNodeTypes || !module.expressionToBlock) {continue;}
        for (const type of module.expressionNodeTypes) {
            (_a = handlers[type]) != null ? _a : handlers[type] = [];
            handlers[type].push(module.expressionToBlock);
        }
    }
    return handlers;
}
function collectStatementHandlers() {
    var _a;
    const handlers = {};
    for (const module of astNodeModules) {
        if (!module.statementNodeTypes || !module.statementToBlock) {continue;}
        for (const type of module.statementNodeTypes) {
            (_a = handlers[type]) != null ? _a : handlers[type] = [];
            handlers[type].push(module.statementToBlock);
        }
    }
    return handlers;
}
const pythonExpressionHandlers = collectExpressionHandlers();
const pythonStatementHandlers = collectStatementHandlers();
function registerNodeRepresentationBlocks(blockly) {
    for (const register of registerBlocks) {
        register(blockly);
    }
}
export {
    pythonExpressionHandlers,
    pythonStatementHandlers,
    registerNodeRepresentationBlocks
};
