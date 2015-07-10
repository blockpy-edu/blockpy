/* global SLang : true, parser */

(function () {

"use strict";

function nth(n) {
    switch (n+1) {
    case 1: return "first";
    case 2: return "second";
    case 3: return "third";
    default: return (n+1) + "th";
    }
}
function typeCheckPrimitiveOp(op,args,typeCheckerFunctions) {
    var numArgs = typeCheckerFunctions.length;
    if (args.length !== numArgs) {
	throw "Wrong number of arguments given to '" + op + "'.";
    }
    for( var index = 0; index<numArgs; index++) {
	if ( ! (typeCheckerFunctions[index])(args[index]) ) {
	    throw "The " + nth(index) + " argument of '" + op + "' has the wrong type.";
	}
    }
}

function applyPrimitive(prim,args) {
    switch (prim) {
    case "+": 
	typeCheckPrimitiveOp(prim,args,[SLang.env.isNum,SLang.env.isNum]);
	return SLang.env.createNum( SLang.env.getNumValue(args[0]) + SLang.env.getNumValue(args[1]));
    case "*": 
	typeCheckPrimitiveOp(prim,args,[SLang.env.isNum,SLang.env.isNum]);
	return SLang.env.createNum( SLang.env.getNumValue(args[0]) * SLang.env.getNumValue(args[1]));
    case "add1": 
	typeCheckPrimitiveOp(prim,args,[SLang.env.isNum]);
	return SLang.env.createNum( 1 + SLang.env.getNumValue(args[0]) );
    }
}
function evalExp(exp,envir) {
    if (SLang.absyn.isIntExp(exp)) {
	return SLang.env.createNum(SLang.absyn.getIntExpValue(exp));
    }
    else if (SLang.absyn.isVarExp(exp)) {
	return SLang.env.lookup(envir,SLang.absyn.getVarExpId(exp));
    }
    else if (SLang.absyn.isFnExp(exp)) {
	return SLang.env.createClo(SLang.absyn.getFnExpParams(exp),SLang.absyn.getFnExpBody(exp),envir);
    }
    else if (SLang.absyn.isAppExp(exp)) {
	var f = evalExp(SLang.absyn.getAppExpFn(exp),envir);
	var args = SLang.absyn.getAppExpArgs(exp).map( function(arg) { return evalExp(arg,envir); } );
	if (SLang.env.isClo(f)) {
	    if (SLang.env.getCloParams(f).length !== args.length) {		
		throw new Error("Runtime error: wrong number of arguments in " +
                        "a function call (" + SLang.env.getCloParams(f).length +
			" expected but " + args.length + " given)");
	    } else {
		return evalExp(SLang.env.getCloBody(f),
			       SLang.env.update(SLang.env.getCloEnv(f),
						SLang.env.getCloParams(f),args));
	    }
	} else {
	    throw f + " is not a closure and thus cannot be applied.";
	}
    } else if (SLang.absyn.isPrimAppExp(exp)) {
        return applyPrimitive(SLang.absyn.getPrimAppExpPrim(exp),
			      SLang.absyn.getPrimAppExpArgs(exp).map( function(arg) { 
                                  return evalExp(arg,envir); } ));
    } else {
	throw "Error: Attempting to evaluate an invalid expression";
    }
}
function myEval(p) {
    if (SLang.absyn.isProgram(p)) {
	return evalExp(SLang.absyn.getProgramExp(p),SLang.env.initEnv());
    } else {
	window.alert( "The input is not a program.");
    }
}
/*
function expToString(exp) {
    return "<omitted>";
}
function valueToString(value) {

function envToString(e) {
    function aux(e) {
	if (SLang.env.isEmptyEnv(e)) {
	    return "EmptyEnv";
	} else {
	    var result = "|| " + aux(SLang.env.getEnvEnv(e));
            var bindings = SLang.env.getEnvBindings(e);
	    for(var i=0; i<bindings.length; i++) {
		result = bindings[i][0] + " = " +valueToString(bindings[i][1]) + " " + result;
	    }
	    return result;
	}
    }

    return "{ " + aux(e) + " }";
}

    if (SLang.env.isNum(value)) {
	return SLang.env.getNumValue(value)+"";
    }
    else if (SLang.env.isClo(value)) {
	return "Closure( params=" + SLang.env.getCloParams(value) + " , body="+ 
	expToString(SLang.env.getCloBody(value)) + " , env=" + envToString(SLang.env.getCloEnv(value)) +" )";
    }
}
*/
function interpret(source) {
    var output='';

    try {
        if (source === '') {
            window.alert('Nothing to interpret: you must provide some input!');
	} else {
	    var ast = parser.parse(source);
	    var value = myEval( ast );
            return JSON.stringify(value);
        }
    } catch (exception) {
	window.alert(exception);
        return "No output [Runtime error]";
    }
    return output;
}

SLang.interpret = interpret; // make the interpreter public

}());
