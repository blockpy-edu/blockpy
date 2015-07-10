/* global LAMBDA : true */

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
function createLambdaAbs(param,body) {
    return ["LambdaAbs",param,body];
}
function isLambdaAbs(e) { 
    return e[0] === "LambdaAbs"; 
}
function getLambdaAbsParam(e) { 
    if (isLambdaAbs(e)) {
	return e[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getLambdaAbsParam is not a LambdaAbs.");
    }
}
function getLambdaAbsBody(e) { 
    if (isLambdaAbs(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getLambdaAbsBody is not a LambdaAbs.");
    }
}
function createAppExp(fn,arg) {
    return ["AppExp",fn,arg];
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
function getAppExpArg(e) { 
    if (isAppExp(e)) {
	return e[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getAppExpArg is not an AppExp.");
    }
}


exports.createProgram = createProgram;
exports.isProgram = isProgram;
exports.getProgramExp = getProgramExp;
exports.createVarExp = createVarExp;
exports.isVarExp = isVarExp;
exports.getVarExpId = getVarExpId;
exports.createLambdaAbs = createLambdaAbs;
exports.isLambdaAbs = isLambdaAbs;
exports.getLambdaAbsParam = getLambdaAbsParam;
exports.getLambdaAbsBody = getLambdaAbsBody;
exports.createAppExp = createAppExp;
exports.isAppExp = isAppExp;
exports.getAppExpFn = getAppExpFn;
exports.getAppExpArg = getAppExpArg;

LAMBDA.absyn = exports;
}());
