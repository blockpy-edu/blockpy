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
    case "-": 
	typeCheckPrimitiveOp(prim,args,[SLang.env.isNum,SLang.env.isNum]);
	return SLang.env.createNum( SLang.env.getNumValue(args[0]) - SLang.env.getNumValue(args[1]));

    }
}
function evalExp(exp,envir) {
    if (SLang.absyn.isIntExp(exp)) {
	return SLang.env.createNum(SLang.absyn.getIntExpValue(exp));
    } else if (SLang.absyn.isRealExp(exp)) {
	return SLang.env.createRealNum(SLang.absyn.getRealExpValue(exp));
    } else if (SLang.absyn.isGt1Exp(exp)) {
	var gt1 = function (reals) {
            if (reals.length === 0) {
		throw new Error( "gt1: wrong argument list" );
	    } else {
		var firstValue = SLang.env.getRealNumValue(evalExp(reals[0]));
		if (firstValue > 1.0) {
		    return SLang.env.createRealNum(firstValue);
		} else  {
		    reals.shift();
		    return gt1(reals);
		}
	    }
	};
	return gt1( SLang.absyn.getGt1ExpList(exp) );
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
