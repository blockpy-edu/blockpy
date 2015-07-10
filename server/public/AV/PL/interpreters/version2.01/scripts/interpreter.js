/* global SLang : true, parser, console  */

(function () {

    "use strict";

    var A = SLang.absyn;
    var E = SLang.env;
    var ppm = "byval";   

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
    }
}
function callByValue(exp,envir) {
    var f = evalExp(A.getAppExpFn(exp),envir);
    var args = evalExps(A.getAppExpArgs(exp),envir);
    if (E.isClo(f)) {
	if (E.getCloParams(f).length !== args.length) {		
	    throw new Error("Runtime error: wrong number of arguments in " +
                            "a function call (" + E.getCloParams(f).length +
			    " expected but " + args.length + " given)");
	} else {
	    var values = evalExps(E.getCloBody(f),
			          E.update(E.getCloEnv(f),
					   E.getCloParams(f),args));
	    return values[values.length-1];
	}
    } else {
	throw f + " is not a closure and thus cannot be applied.";
    }    
}
function callByReference(exp,envir) {
    var f = evalExp(A.getAppExpFn(exp),envir);
    var args = A.getAppExpArgs(exp).map( function (arg) {
	if (A.isVarExp(arg)) {
	    return E.lookupReference(envir,A.getVarExpId(arg));
	} else {
	    throw new Error("The arguments of a function called by-ref must all be variables.");
	}
    } );
    if (E.isClo(f)) {
	if (E.getCloParams(f).length !== args.length) {		
	    throw new Error("Runtime error: wrong number of arguments in " +
                            "a function call (" + E.getCloParams(f).length +
			    " expected but " + args.length + " given)");
	} else {
	    var values = evalExps(E.getCloBody(f),
			          E.updateWithReferences(
				      E.getCloEnv(f),
				      E.getCloParams(f),args));
	    return values[values.length-1];
	}
    } else {
	throw new Error(f + " is not a closure and thus cannot be applied.");
    }    
}
function callByCopyRestore(exp,envir) {
    var f = evalExp(A.getAppExpFn(exp),envir);
    var args = A.getAppExpArgs(exp).map( function (arg) {
	if (A.isVarExp(arg)) {
	    return E.lookupReference(envir,A.getVarExpId(arg));
	} else {
	    throw new Error("The arguments of a function called by-ref must all be variables.");
	}
    } );
    // make copies
    var copies = args.map( function (arg) { return [ arg[0] ]; } );
    var restore = function ( list1, list2 ) {
	for(var i=0; i<list1.length; i++) {
	    list1[i][0] = list2[i][0];
	}
    };
    if (E.isClo(f)) {
	if (E.getCloParams(f).length !== args.length) {		
	    throw new Error("Runtime error: wrong number of arguments in " +
                            "a function call (" + E.getCloParams(f).length +
			    " expected but " + args.length + " given)");
	} else {
	    var values = evalExps(E.getCloBody(f),
			          E.updateWithReferences(
				      E.getCloEnv(f),
				      E.getCloParams(f),copies));
	    restore(args,copies);
	    return values[values.length-1];
	}
    } else {
	throw new Error(f + " is not a closure and thus cannot be applied.");
    }    
}
/* substitute in exp each one of exps for each corresponding one in vs */
function substitute(exps,vs,exp) {
    var args, appExp, index;
    if (exps.length !== vs.length) {
	throw new Error("Substitute says: 'This should never happen!'");
    } else if (exps.length === 0) {  // function with 0 parameters
	return exp;
    }
    if (A.isIntExp(exp)) {
	return exp;
    }
    else if (A.isVarExp(exp)) {
	index = vs.indexOf(A.getVarExpId(exp));
	if (index >= 0) {
	    return exps[index];
	} else {
	    return exp;
	}
    } else if (A.isPrintExp(exp)) {
	return A.createPrintExp( substitute(exps, vs, A.getPrintExpExp(exp)) );
    } else if (A.isPrint2Exp(exp)) {
	if (A.getPrint2ExpExp(exp) === null) {
	    return A.createPrint2Exp( A.getPrint2ExpString(exp), null);
	} else {	    
	    return A.createPrint2Exp( A.getPrint2ExpString(exp),
				  substitute(exps, vs, A.getPrint2ExpExp(exp)));
	}
    } else if (A.isAssignExp(exp)) {
	index = vs.indexOf( A.getAssignExpVar(exp) );
	if (index >= 0) {
	    if (A.isVarExp( exps[index] )) {
		return 	A.createAssignExp( A.getVarExpId(exps[index]),
			   substitute(exps,vs,A.getAssignExpRHS(exp)));
	    } else {
	     throw new Error("Only a variable can be " +
			     "substituted on the LHS of an assignment.");
	    }
	} else {
	    return A.createAssignExp( A.getAssignExpVar(exp),
			      substitute(exps,vs,A.getAssignExpRHS(exp)));
	}
    } else if (A.isFnExp(exp)) {
	return A.createFnExp( A.getFnExpParams(exp),
			      A.getFnExpBody(exp).map( function(e) {
				  return substitute(exps,vs,e); } ));
    }
    else if (A.isAppExp(exp)) {
	args = A.getAppExpArgs(exp).map( 
		function (arg) { return substitute(exps,vs,arg); });
	args.unshift( "args" );
	appExp =  A.createAppExp( substitute(exps,vs,A.getAppExpFn(exp)),args);
	if (exp.comesFromLetBlock) {
	    appExp.comesFromLetBlock = true;
	}
	return appExp;
    } else if (A.isPrim1AppExp(exp)) {
        return A.createPrim1AppExp(
	    A.getPrim1AppExpPrim(exp),
	    [ substitute(exps, vs, A.getPrim1AppExpArg(exp)) ]);
    } else if (A.isPrim2AppExp(exp)) {
        return A.createPrim2AppExp(
	    A.getPrim2AppExpPrim(exp),
	    substitute(exps, vs, A.getPrim2AppExpArg1(exp)),
	      substitute(exps, vs, A.getPrim2AppExpArg2(exp)) );
    } else if (A.isIfExp(exp)) {
	return A.createIfExp(
	    substitute(exps, vs, A.getIfExpCond(exp)),
	    substitute(exps, vs, A.getIfExpThen(exp)),
	    substitute(exps, vs, A.getIfExpElse(exp)));
    } else {
	throw "Error: Attempting to substitute in an invalid expression";
    }
}
function callByMacro(exp,envir) {
    var f = evalExp(A.getAppExpFn(exp),envir);
    if (E.isClo(f)) {
	if (E.getCloParams(f).length !== A.getAppExpArgs(exp).length) {		
	    throw new Error("Runtime error: wrong number of arguments in " +
                            "a function call (" + E.getCloParams(f).length +
			    " expected but " + A.getAppExpArgs(exp).length +
			    " given)");
	} else {

            var sBody = E.getCloBody(f).map( function (e) {
		                       return substitute( A.getAppExpArgs(exp),
				    			  E.getCloParams(f),
							  e); } );
	    var values = evalExps( sBody, envir);  /* dynamic scoping */
	    return values[values.length-1];
	}
    } else {
	throw new Error(f + " is not a closure and thus cannot be applied.");
    }       
}
function evalExp(exp,envir) {
    if (A.isIntExp(exp)) {
	return E.createNum(A.getIntExpValue(exp));
    }
    else if (A.isVarExp(exp)) {
	return E.lookup(envir,A.getVarExpId(exp));
    } else if (A.isPrintExp(exp)) {
	console.log( JSON.stringify(
	    evalExp( A.getPrintExpExp(exp), envir )));
    } else if (A.isPrint2Exp(exp)) {
	console.log( A.getPrint2ExpString(exp) +
		     (A.getPrint2ExpExp(exp) !== null ?
		      " " + JSON.stringify( evalExp( A.getPrint2ExpExp(exp), 
						     envir ) )
		      : ""));
    } else if (A.isAssignExp(exp)) {
	var v = evalExp(A.getAssignExpRHS(exp),envir);
	E.lookupReference(
                        envir,A.getAssignExpVar(exp))[0] = v;
	return v;
    } else if (A.isFnExp(exp)) {
	return E.createClo(A.getFnExpParams(exp),
				   A.getFnExpBody(exp),envir);
    }
    else if (A.isAppExp(exp)) {
	if (exp.comesFromLetBlock) {
	    return callByValue(exp,envir);
	} else {
	    switch (ppm) {
	    case "byval" : return callByValue(exp,envir);
	    case "byref" : return callByReference(exp,envir);
	    case "bycpr" : return callByCopyRestore(exp,envir);
	    case "bymac" : return callByMacro(exp,envir);
	    }
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
    } else if (A.isWhileExp(exp)) {
	var condition = evalExp(A.getWhileExpCond(exp),envir);
	if (E.getBoolValue(condition)) {
	    evalExps(A.getWhileExpBody(exp),envir);
	    evalExp(exp,envir);
	} else {
	    return undefined;
	}
    } else if (A.isLetRecExp(exp)) {
	var dummy = [];
	var closure = E.createClo(A.getFnExpParams(A.getLetRecExpFn(exp)),
			  A.getFnExpBody(A.getLetRecExpFn(exp)),
			  E.updateWithReferences(envir,
						 [A.getLetRecExpVar(exp)],
						 [dummy]));
	dummy[0] = closure;
	var values = evalExps(A.getLetRecExpBlock(exp),
			      E.update(envir,[A.getLetRecExpVar(exp)],
				       [closure]));
	return values[values.length-1];
    } else {
	throw "Error: Attempting to evaluate an invalid expression";
    }
}
function evalExps(list,envir) {
    return list.map( function(e) { return evalExp(e,envir); } );
}
function myEval(p) {
    if (A.isProgram(p)) {
	return evalExp(A.getProgramExp(p),E.initEnv());
    } else {
	window.alert( "The input is not a program.");
    }
}
function interpret(source,parameter_passing_mechanism) {
    var output='';
    ppm = parameter_passing_mechanism;
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
