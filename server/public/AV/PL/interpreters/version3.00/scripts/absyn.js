/* global SLang : true */

(function (){

"use strict";

var exports = {};

function createProgram(decls,mainBlock) {
    return ["Program", decls, mainBlock]; 
}
function isProgram(p) { 
    return p[0] === "Program"; 
}
function getProgramDecls(p) { 
    if (isProgram(p)) {
	return p[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getProgramDecls is not a program.");
    }
}				       
function getProgramMainBody(p) { 
    if (isProgram(p)) {
	return p[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getProgramMainBody is not a program.");
    }
}				       

function createVarExp(v) { 
    return ["VarExp", v]; 
}
function isVarExp(e) { 
    return e[0] === "VarExp"; 
}
function getVarExpId(e) { 
    if (isVarExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getVarExpId is not a VarExp.");
    }
}
function createIntExp(n) {
    return ["IntExp", parseInt(n)];
}
function isIntExp(e) { 
    return e[0] === "IntExp"; 
}
function getIntExpValue(e) { 
    if (isIntExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getIntExpValue is not an IntExp.");
    }
}
function createFnExp(params,body) {
    return ["FnExp",params,body];
}
function isFnExp(e) { 
    return e[0] === "FnExp"; 
}
function getFnExpParams(e) { 
    if (isFnExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getFnExpParams is not an FnExp.");
    }
}
function getFnExpBody(e) { 
    if (isFnExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getFnExpBody is not an FnExp.");
    }
}
function createAppExp(fn,args) {
    return ["AppExp",fn,args];
}
function isAppExp(e) { 
    return e[0] === "AppExp"; 
}
function getAppExpFn(e) { 
    if (isAppExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getAppExpFn is not an AppExp.");
    }
}
function getAppExpArgs(e) { 
    if (isAppExp(e)) {
	return e[2].slice(1); // eliminate the first element (i.e., "args")
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getAppExpArgs is not an AppExp.");
    }
}
function createPrim1AppExp(prim,arg) {
    return ["PrimApp1Exp",prim,arg];
}
function isPrim1AppExp(e) { 
    return e[0] === "PrimApp1Exp"; 
}
function getPrim1AppExpPrim(e) { 
    if (isPrim1AppExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrim1AppExpPrim is not a Prim1AppExp.");
    }
}
function getPrim1AppExpArg(e) { 
    if (isPrim1AppExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrim1AppExpArg is not a Prim1AppExp.");
    }
}
function createPrim2AppExp(prim,arg1,arg2) {
    return ["Prim2AppExp",prim,arg1,arg2];
}
function isPrim2AppExp(e) { 
    return e[0] === "Prim2AppExp"; 
}
function getPrim2AppExpPrim(e) { 
    if (isPrim2AppExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrim2AppExpPrim is not a Prim2AppExp.");
    }
}
function getPrim2AppExpArg1(e) { 
    if (isPrim2AppExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrim2AppExpArg is not a Prim2AppExp.");
    }
}
function getPrim2AppExpArg2(e) { 
    if (isPrim2AppExp(e)) {
	return e[3];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrim2AppExpArg is not a Prim2AppExp.");
    }
}
function createPrintExp(e) {
    return ["PrintExp", e];
}
function isPrintExp(e) { 
    return e[0] === "PrintExp"; 
}
function getPrintExpExp(e) { 
    if (isPrintExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrintExpExp is not a PrintExp.");
    }
}
function createPrint2Exp(s,e) {
    return ["Print2Exp", s, e];
}
function isPrint2Exp(e) { 
    return e[0] === "Print2Exp"; 
}
function getPrint2ExpString(e) { 
    if (isPrint2Exp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrint2ExpString is not a Print2Exp.");
    }
}
function getPrint2ExpExp(e) { 
    if (isPrint2Exp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrint2ExpExp is not a Print2Exp.");
    }
}

function createAssignExp(v,e) {
    return ["AssignExp", v, e];
}
function isAssignExp(e) { 
    return e[0] === "AssignExp"; 
}
function getAssignExpVar(e) { 
    if (isAssignExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getAssignExpVar is not an AssignExp.");
    }
}
function getAssignExpRHS(e) { 
    if (isAssignExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getAssignExpRHS is not an AssignExp.");
    }
}
function createBlock(list) {
    return ["Block",list];
}
function isBlock(b) { 
    return b[0] === "Block"; 
}
function getBlockList(b) { 
    if (isBlock(b)) {
	return b[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getBlockList is not a Block.");
    }
}
function createIfExp(condExp,thenExp,elseExp) {
    return ["IfExp",condExp,thenExp,elseExp];
}
function isIfExp(e) { 
    return e[0] === "IfExp"; 
}
function getIfExpCond(e) { 
    if (isIfExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getIfExpCond is not an IfExp.");
    }
}
function getIfExpThen(e) { 
    if (isIfExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getIfExpThen is not an IfExp.");
    }
}
function getIfExpElse(e) { 
    if (isIfExp(e)) {
	return e[3];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getIfExpElse is not an IfExp.");
    }
}
function createThisExp() { 
    return ["ThisExp"]; 
}
function isThisExp(e) { 
    return e[0] === "ThisExp"; 
}
function createNewExp(v,args) { 
    return ["NewExp", v, args]; 
}
function isNewExp(e) { 
    return e[0] === "NewExp"; 
}
function getNewExpClass(e) { 
    if (isNewExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getNewExpClass is not a NewExp.");
    }
}
function getNewExpArgs(e) { 
    if (isNewExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getNewExpArgs is not a NewExp.");
    }
}
function createMethodCall(obj,method,args) { 
    return ["MethodCall", obj, method, args]; 
}
function isMethodCall(e) { 
    return e[0] === "MethodCall"; 
}
function getMethodCallObject(e) { 
    if (isMethodCall(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getMethodCallObject is not a MethodCall.");
    }
}
function getMethodCallMethod(e) { 
    if (isMethodCall(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getMethodCallMethod is not a MethodCall.");
    }
}
function getMethodCallArgs(e) { 
    if (isMethodCall(e)) {
	return e[3];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getMethodCallArgs is not a MethodCall.");
    }
}
function createClass(name,superClass,ivars,methods) { 
    return ["Class", name, superClass, ivars, methods]; 
}
function isClass(c) { 
    return c[0] === "Class"; 
}
function getClassName(c) { 
    if (isClass(c)) {
	return c[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getClassName is not a Class.");
    }
}
function getClassSuperClass(c) { 
    if (isClass(c)) {
	return c[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getClassSuperClass is not a Class.");
    }
}
function getClassIvars(c) { 
    if (isClass(c)) {
	return c[3];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getClassIvars is not a Class.");
    }
}
function getClassMethods(c) { 
    if (isClass(c)) {
	return c[4];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getClassMethods is not a Class.");
    }
}
function createMethod(name,params,body) {
    return ["Method", name, params, body]; 
}
function isMethod(m) { 
    return m[0] === "Method"; 
}
function getMethodName(m) { 
    if (isMethod(m)) {
	return m[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getMethodName is not a Method.");
    }
}				      
function getMethodParams(m) { 
    if (isMethod(m)) {
	return m[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getMethodParams is not a Method.");
    }
}				      
function getMethodBody(m) { 
    if (isMethod(m)) {
	return m[3];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getMethodBody is not a Method.");
    }
}				      

exports.createProgram = createProgram;
exports.isProgram = isProgram;
exports.getProgramDecls = getProgramDecls;
exports.getProgramMainBody = getProgramMainBody;
exports.createVarExp = createVarExp;
exports.isVarExp = isVarExp;
exports.getVarExpId = getVarExpId;
exports.createIntExp = createIntExp;
exports.isIntExp = isIntExp;
exports.getIntExpValue = getIntExpValue;
exports.createFnExp = createFnExp;
exports.isFnExp = isFnExp;
exports.getFnExpParams = getFnExpParams;
exports.getFnExpBody = getFnExpBody;
exports.createAppExp = createAppExp;
exports.isAppExp = isAppExp;
exports.getAppExpFn = getAppExpFn;
exports.getAppExpArgs = getAppExpArgs;
exports.createPrintExp = createPrintExp;
exports.isPrintExp = isPrintExp;
exports.getPrintExpExp = getPrintExpExp;
exports.createPrint2Exp = createPrint2Exp;
exports.isPrint2Exp = isPrint2Exp;
exports.getPrint2ExpExp = getPrint2ExpExp;
exports.getPrint2ExpString = getPrint2ExpString;
exports.createAssignExp = createAssignExp;
exports.isAssignExp = isAssignExp;
exports.getAssignExpVar = getAssignExpVar;
exports.getAssignExpRHS = getAssignExpRHS;
exports.createBlock = createBlock;
exports.isBlock = isBlock;
exports.getBlockList = getBlockList;
exports.createPrim1AppExp = createPrim1AppExp;
exports.createPrim2AppExp = createPrim2AppExp;
exports.isPrim1AppExp = isPrim1AppExp;
exports.isPrim2AppExp = isPrim2AppExp;
exports.getPrim1AppExpPrim = getPrim1AppExpPrim;
exports.getPrim2AppExpPrim = getPrim2AppExpPrim;
exports.getPrim1AppExpArg = getPrim1AppExpArg;
exports.getPrim2AppExpArg1 = getPrim2AppExpArg1;
exports.getPrim2AppExpArg2 = getPrim2AppExpArg2;
exports.createIfExp = createIfExp;
exports.isIfExp = isIfExp;
exports.getIfExpCond = getIfExpCond;
exports.getIfExpThen = getIfExpThen;
exports.getIfExpElse = getIfExpElse;
exports.createThisExp = createThisExp;
exports.isThisExp = isThisExp;
exports.createNewExp = createNewExp;
exports.isNewExp = isNewExp;
exports.getNewExpClass = getNewExpClass;
exports.getNewExpArgs = getNewExpArgs;
exports.createMethodCall = createMethodCall;
exports.isMethodCall = isMethodCall;
exports.getMethodCallObject = getMethodCallObject;
exports.getMethodCallMethod = getMethodCallMethod;
exports.getMethodCallArgs = getMethodCallArgs;
exports.createClass = createClass;
exports.isClass = isClass;
exports.getClassName = getClassName;
exports.getClassSuperClass = getClassSuperClass;
exports.getClassIvars = getClassIvars;
exports.getClassMethods = getClassMethods;
exports.createMethod = createMethod;
exports.isMethod = isMethod;
exports.getMethodName = getMethodName;
exports.getMethodParams = getMethodParams;
exports.getMethodBody = getMethodBody;

SLang.absyn = exports;
}());
