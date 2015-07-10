/* global SLang : true, parser, fp */

(function () {

    "use strict";

    var A = SLang.absyn;
    var E = SLang.env;

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
	throw new Error("Wrong number of arguments given to '" + op + "'.");
    }
    for( var index = 0; index<numArgs; index++) {
	if ( ! (typeCheckerFunctions[index])(args[index]) ) {
	    throw new Error("The " + nth(index) + " argument of '" + op + "' has the wrong type.");
	}
    }
}
function applyMap(args) {
    var f = args[0];
    var list = E.getListValue(args[1]);
    var mapFunction = function (n) {
	var envir = E.update(E.getCloEnv(f),E.getCloParams(f),[E.createNum(n)]);
	return E.getNumValue( evalExp(E.getCloBody(f),envir) );
    };
    return E.createList(fp.map(mapFunction, list));
}
function applyPrimitive(prim,args) {
    switch (prim) {
    case "+": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createNum( E.getNumValue(args[0]) + E.getNumValue(args[1]));
    case "-": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createNum( E.getNumValue(args[0]) - E.getNumValue(args[1]));
    case "*": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createNum( E.getNumValue(args[0]) * E.getNumValue(args[1]));
    case "/": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createNum( E.getNumValue(args[0]) / E.getNumValue(args[1]));
    case "%": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createNum( E.getNumValue(args[0]) % E.getNumValue(args[1]));
    case "<": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createBool( E.getNumValue(args[0]) < E.getNumValue(args[1]));
    case ">": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createBool( E.getNumValue(args[0]) > E.getNumValue(args[1]));
    case "===": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isNum]);
	return E.createBool( E.getNumValue(args[0]) === E.getNumValue(args[1]));
    case "add1": 
	typeCheckPrimitiveOp(prim,args,[E.isNum]);
	return E.createNum( 1 + E.getNumValue(args[0]) );
    case "~": 
	typeCheckPrimitiveOp(prim,args,[E.isNum]);
	return E.createNum( - E.getNumValue(args[0]) );
    case "not": 
	typeCheckPrimitiveOp(prim,args,[E.isBool]);
	return E.createBool( ! E.getBoolValue(args[0]) );
    case "hd": 
	typeCheckPrimitiveOp(prim,args,[E.isList]);
	return E.createNum( fp.hd( E.getListValue(args[0]) ) );
    case "tl": 
	typeCheckPrimitiveOp(prim,args,[E.isList]);
	return E.createList( fp.tl( E.getListValue(args[0]) ) );
    case "isNull": 
	typeCheckPrimitiveOp(prim,args,[E.isList]);
	return E.createBool( fp.isNull( E.getListValue(args[0]) ) );
    case "::": 
	typeCheckPrimitiveOp(prim,args,[E.isNum,E.isList]);
	return E.createList( fp.cons( E.getNumValue(args[0]),
				      E.getListValue(args[1]) ) );
    case "->": 
	typeCheckPrimitiveOp(prim,args,[E.isClo,E.isList]);
	return applyMap(args);
    }
}
function evalExp(exp,envir) {
    if (A.isIntExp(exp)) {
	return E.createNum(A.getIntExpValue(exp));
    } else if (A.isListExp(exp)) {
	return E.createList(A.getListExpList(exp));
    }
    else if (A.isVarExp(exp)) {
	return E.lookup(envir,A.getVarExpId(exp));
    }
    else if (A.isFnExp(exp)) {
	return E.createClo(A.getFnExpParams(exp),A.getFnExpBody(exp),envir);
    }
    else if (A.isAppExp(exp)) {
	var f = evalExp(A.getAppExpFn(exp),envir);
	var args = A.getAppExpArgs(exp).map( function(arg) { return evalExp(arg,envir); } );
	if (E.isClo(f)) {
	    if (E.getCloParams(f).length !== args.length) {		
		throw new Error("Runtime error: wrong number of arguments in " +
                        "a function call (" + E.getCloParams(f).length +
			" expected but " + args.length + " given)");
	    } else {
		return evalExp(E.getCloBody(f),
			       E.update(E.getCloEnv(f),
						E.getCloParams(f),args));
	    }
	} else {
	    throw new Error(f + " is not a closure and thus cannot be applied.");
	}
    } else if (A.isPrim1AppExp(exp)) {
        return applyPrimitive(A.getPrim1AppExpPrim(exp),
			      [evalExp(A.getPrim1AppExpArg(exp),envir)]);
    } else if (A.isPrim2AppExp(exp)) {
        return applyPrimitive(A.getPrim2AppExpPrim(exp),
			      [evalExp(A.getPrim2AppExpArg1(exp),envir),
			       evalExp(A.getPrim2AppExpArg2(exp),envir)]);
    } else if (A.isIfExp(exp)) {
	if (E.getBoolValue(evalExp(A.getIfExpCond(exp),envir))) {
	    return evalExp(A.getIfExpThen(exp),envir);
	} else {
	    return evalExp(A.getIfExpElse(exp),envir);
	}
    } else {
	throw new Error("Error: Attempting to evaluate an invalid expression");
    }
}
function myEval(p) {
    if (A.isProgram(p)) {
	return evalExp(A.getProgramExp(p),E.initEnv());
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
