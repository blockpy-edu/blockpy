/* global SLang : true */

(function(){

"use strict";


var exports = {};

// denoted values in the interpreted language SLang 1
//  Num, Clo, RealNum

function createNum(n) {
    return ["Num",n];
}
function isNum(value) {
    return value[0] === "Num";
}
function getNumValue(value) {
    if (isNum(value)) {
	return value[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getNumValue is not a Num value.");
    }
}
function createRealNum(r) {
    return ["RealNum",r];
}
function isRealNum(value) {
    return value[0] === "RealNum";
}
function getRealNumValue(value) {
    if (isRealNum(value)) {
	return value[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getRealNumValue is not a RealNum value.");
    }
}
function createClo(params,body,env) {
    return ["Clo",params,body,env];
}
function isClo(value) {
    return value[0] === "Clo";
}
function getCloParams(value) {
    if (isClo(value)) {
	return value[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getCloParams is not a Clo value.");
    }
}
function getCloBody(value) {
    if (isClo(value)) {
	return value[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getCloBody is not a Clo value.");
    }
}
function getCloEnv(value) {
    if (isClo(value)) {
	return value[3];
    } else {
	throw new Error("Interpreter error: "  +
		      	"The argument of getCloEnv is not a Clo value.");
    }
}

// implementation of the environment

// data constructors
function createEmptyEnv() {
    return ["EmptyEnv"];
}
function isEmptyEnv(env) {
    return env[0] === "EmptyEnv";
}
function createEnv(bindings,env) {
    return ["Env",bindings,env];
}
function isEnv(env) {
    return env[0] === "Env";
}
function getEnvBindings (env) {
    if (isEnv(env)) {
	return env[1];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getEnvBindings is not an environment.");
    }
}
function getEnvEnv (env) {
    if (isEnv(env)) {
	return env[2];
    } else {
	throw new Error("Interpreter error: "  +
			"The argument of getEnvEnv is not an environment.");	
    }
}

// accessor
function getValue(v,bindings) {
    var value = bindings.filter(function (p) { return p[0]===v; });
    if (value.length === 0) {
	return undefined;
    } else {
	return value[0][1];
    }
}
function lookup (e,variable) {
    if (isEmptyEnv(e)) {
	throw new Error("Runtime error: No binding for " + variable);
    } else {
	return getValue(variable,e[1]) || lookup(e[2],variable);
    }
}

// mutators
function update(e,variables,values) {
    var bindings =  [];
    for(var index = 0; index < variables.length; index++) {
	bindings.push( [ variables[index] , values[index] ]);
    }
    return createEnv(bindings,e);
}
function initEnv() {
    return update(createEmptyEnv(), ["x","y"], [ createNum(5), createNum(6)]);
}

exports.createNum = createNum;
exports.isNum = isNum;
exports.getNumValue = getNumValue;
exports.createRealNum = createRealNum;
exports.isRealNum = isRealNum;
exports.getRealNumValue = getRealNumValue;
exports.createClo = createClo;
exports.isClo = isClo;
exports.getCloParams = getCloParams;
exports.getCloBody = getCloBody;
exports.getCloEnv = getCloEnv;
exports.createEmptyEnv = createEmptyEnv;
exports.isEmptyEnv = isEmptyEnv;
exports.createEnv = createEnv;
exports.isEnv = isEnv;
exports.getEnvBindings = getEnvBindings;
exports.getEnvEnv = getEnvEnv;
exports.getValue = getValue;
exports.lookup = lookup;
exports.update = update;
exports.initEnv = initEnv;

SLang.env = exports;

}());
