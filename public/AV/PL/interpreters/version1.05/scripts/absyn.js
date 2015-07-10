/* global SLang : true */

(function (){

"use strict";

var exports = {};

function createProgram(e) {
    return ["Program", e]; 
}
function isProgram(e) { 
    return e[0] === "Program"; 
}
function getProgramExp(e) { 
    if (isProgram(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getProgramExp is not a program.");
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
function createRealExp(n) {
    return ["RealExp", parseFloat(n)];
}
function isRealExp(e) { 
    return e[0] === "RealExp"; 
}
function getRealExpValue(e) { 
    if (isRealExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getRealExpValue is not a RealExp.");
    }
}

function createGt1Exp(reals) {
    return ["Gt1Exp", reals];
}
function isGt1Exp(e) { 
    return e[0] === "Gt1Exp"; 
}
function getGt1ExpList(e) { 
    if (isGt1Exp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getGt1ExpList is not a Gt1Exp.");
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
function createPrimAppExp(prim,args) {
    return ["PrimAppExp",prim,args];
}
function isPrimAppExp(e) { 
    return e[0] === "PrimAppExp"; 
}
function getPrimAppExpPrim(e) { 
    if (isPrimAppExp(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrimAppExpPrim is not a PrimAppExp.");
    }
}
function getPrimAppExpArgs(e) { 
    if (isPrimAppExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getPrimAppExpArgs is not a PrimAppExp.");
    }
}


exports.createProgram = createProgram;
exports.isProgram = isProgram;
exports.getProgramExp = getProgramExp;
exports.createVarExp = createVarExp;
exports.isVarExp = isVarExp;
exports.getVarExpId = getVarExpId;
exports.createIntExp = createIntExp;
exports.isIntExp = isIntExp;
exports.getIntExpValue = getIntExpValue;
exports.createRealExp = createRealExp;
exports.isRealExp = isRealExp;
exports.getRealExpValue = getRealExpValue;
exports.createGt1Exp = createGt1Exp;
exports.isGt1Exp = isGt1Exp;
exports.getGt1ExpList = getGt1ExpList;
exports.createFnExp = createFnExp;
exports.isFnExp = isFnExp;
exports.getFnExpParams = getFnExpParams;
exports.getFnExpBody = getFnExpBody;
exports.createAppExp = createAppExp;
exports.isAppExp = isAppExp;
exports.getAppExpFn = getAppExpFn;
exports.getAppExpArgs = getAppExpArgs;
exports.createPrimAppExp = createPrimAppExp;
exports.isPrimAppExp = isPrimAppExp;
exports.getPrimAppExpPrim = getPrimAppExpPrim;
exports.getPrimAppExpArgs = getPrimAppExpArgs;

SLang.absyn = exports;
}());
