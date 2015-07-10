 "use strict";

var LAMBDA = {};

$(function () {

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
    function createFalse() {
    return createLambdaAbs(createVarExp("x"),
			   createLambdaAbs(createVarExp("y"),
					   createVarExp("y")));
}
function createTrue() {
    return createLambdaAbs(createVarExp("x"),
			   createLambdaAbs(createVarExp("y"),
					   createVarExp("x")));
}
function createNumber( n ) {
    var helper = function (n) {
	if (n === 0) {
	    return createVarExp("x");
	} else {
	    return createAppExp(createVarExp("f"), helper(n-1));		
	}
    };
	
    return createLambdaAbs(createVarExp("f"),
			   createLambdaAbs(createVarExp("x"),
					   helper(n)));
}
function createSucc() {
    return createLambdaAbs(createVarExp("n"),
			   createLambdaAbs(createVarExp("f"),
					   createLambdaAbs(
					       createVarExp("x"),
					       createAppExp(
						   createVarExp("f"),
						   createAppExp(
						       createAppExp(
							   createVarExp("n"),
							   createVarExp("f")),
						       createVarExp("x"))))));
}
function createPlus() {
    return createLambdaAbs(
	createVarExp("m"),
	createLambdaAbs(
	    createVarExp("n"),
	    createLambdaAbs(
		createVarExp("f"),
		createLambdaAbs(
		    createVarExp("x"),
		    createAppExp(
			createAppExp(createVarExp("n"),createVarExp("f")),
			createAppExp(
			    createAppExp(createVarExp("m"),createVarExp("f")),
			    createVarExp("x"))
		    )))));
}
function createAddition(op1,op2) {
    return createAppExp(createAppExp(createPlus(),op1), op2);
}
function createTimes() {
    return createLambdaAbs(
	createVarExp("m"),
	createLambdaAbs(
	    createVarExp("n"),
	    createLambdaAbs(
		createVarExp("f"),
		createAppExp(
		    createVarExp("m"),
		    createAppExp(createVarExp("n"),createVarExp("f"))))));
}
function createMultiplication(op1,op2) {
    return createAppExp(createAppExp(createTimes(),op1), op2);
}
function createAnd() {
    return createLambdaAbs(createVarExp("p"),
			   createLambdaAbs(
			       createVarExp("q"),
			       createAppExp(
				   createAppExp(
				       createVarExp("p"),
				       createVarExp("q")),
				   createFalse())));
}
function createOr() {
    return createLambdaAbs(createVarExp("p"),
			   createLambdaAbs(
			       createVarExp("q"),
			       createAppExp(
				   createAppExp(
				       createVarExp("p"),
				       createTrue()),
				   createVarExp("q"))));
}
function createNot() {
    return createLambdaAbs(createVarExp("p"),
			   createAppExp(
			       createAppExp(
				   createVarExp("p"),
				   createFalse()),
			       createTrue()));
}
function createNegation(op) {
    return createAppExp( createNot(), op);
}
function createDisjunction(op1,op2) {
    return createAppExp( createAppExp( createOr(), op1 ), op2 );
}
function createConjunction(op1,op2) {
    return createAppExp( createAppExp( createAnd(), op1 ), op2 );
}
function doesNotContainAnApp(e) {
    return isVarExp(e) ||
	(isLambdaAbs(e) && doesNotContainAnApp(getLambdaAbsBody(e))) ||
	(isAppExp(e) && doesNotContainAnApp(getAppExpFn(e)) &&
	 doesNotContainAnApp(getAppExpArg(e)));
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
exports.createTrue = createTrue;
exports.createFalse = createFalse;
exports.createSucc = createSucc;
exports.createNumber = createNumber;
exports.createNegation = createNegation;
exports.createConjunction = createConjunction;
exports.createDisjunction = createDisjunction;
exports.createAddition = createAddition;
exports.createMultiplication = createMultiplication;
exports.doesNotContainAnApp = doesNotContainAnApp;
LAMBDA.absyn = exports;


});
