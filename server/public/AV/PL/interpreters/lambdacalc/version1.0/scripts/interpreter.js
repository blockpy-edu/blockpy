/* global LAMBDA : true, parser */

(function () {

"use strict";

/** takes in a VarExp and a lambda expression
 */
function free(x,exp) {
    if (LAMBDA.absyn.isVarExp(exp)) {
	return LAMBDA.absyn.getVarExpId(x) === LAMBDA.absyn.getVarExpId(exp);
    } else if (LAMBDA.absyn.isLambdaAbs(exp)) {
	return LAMBDA.absyn.getVarExpId(x) !== LAMBDA.absyn.getVarExpId(LAMBDA.absyn.getLambdaAbsParam(exp)) && free(x,LAMBDA.absyn.getLambdaAbsBody(exp));
    } else if (LAMBDA.absyn.isAppExp(exp)) {
	return free(x,LAMBDA.absyn.getAppExpFn(exp)) || free(x,LAMBDA.absyn.getAppExpArg(exp));
    } else {
	throw new Error("Interpreter error: " +
			"The second argument of free is not a lambda expression.");
    }
}
/** takes in a VarExp and a lambda expression
 */
function occursIn(x,exp) {
    if (LAMBDA.absyn.isVarExp(exp)) {
	return LAMBDA.absyn.getVarExpId(x) === LAMBDA.absyn.getVarExpId(exp);
    } else if (LAMBDA.absyn.isLambdaAbs(exp)) {
	return LAMBDA.absyn.getVarExpId(x) === LAMBDA.absyn.getVarExpId(LAMBDA.absyn.getLambdaAbsParam(exp)) || occursIn(x,LAMBDA.absyn.getLambdaAbsBody(exp));
    } else if (LAMBDA.absyn.isAppExp(exp)) {
	return occursIn(x,LAMBDA.absyn.getAppExpFn(exp)) || occursIn(x,LAMBDA.absyn.getAppExpArg(exp));
    } else {
	throw new Error("Interpreter error: " +
			"The second argument of occursIn is not a lambda expression.");
    }
}
/** takes in a VarExp and a lambda expression
 */
function bound(x,exp) {
    return occursIn(x,exp) && ! free(x,exp);
}
/** takes in a lambda expression and returns a list of strings
 */
function freeVars(exp) {
    if (LAMBDA.absyn.isVarExp(exp)) {
	return [ LAMBDA.absyn.getVarExpId(exp) ];
    } else if (LAMBDA.absyn.isLambdaAbs(exp)) {
	var v = LAMBDA.absyn.getVarExpId(LAMBDA.absyn.getLambdaAbsParam(exp));
	var bodyVars = freeVars(LAMBDA.absyn.getLambdaAbsBody(exp));
	var index = bodyVars.indexOf(v);
	if (index === -1) {
	    return bodyVars;
	} else {
	    return bodyVars.filter(function(x) { return  x !== v; });
	}	
    } else if (LAMBDA.absyn.isAppExp(exp)) {
	return freeVars(LAMBDA.absyn.getAppExpFn(exp))
	    .concat(freeVars(LAMBDA.absyn.getAppExpArg(exp)))
	    .reduce(function(a,x) { 
		if (a.indexOf(x)===-1) { 
		    a.push(x); return a;} else return a; },
		    []);
    }
}
/** takes in a string and a lambda expression
 */
function notFreeIn(x,exp) {
    return freeVars(exp).indexOf(x) === -1;
}
    /** takes in a string and a list of string
*/
function removeVariable (x,xs) {
    var index = xs.indexOf(x);
    if (index === -1) {
	return xs;
    } else {
	xs.splice(index,1);
	return xs;
    }
}
function newVariable(list) {
    var code = "a".charCodeAt(0);
    var last = 1+"z".charCodeAt(0);
    while (code !== last) {
	var character = String.fromCharCode(code);
	if (list.indexOf(character) === -1)
	    return character;
	code = code + 1;
    }
    throw new Error("Interpreter error: " +
		    "Too many variables in use.");
}
/** substitute lambda exp. m for variable exp x in lambda exp. e 
 */
function substitute(m,x,e) {
    var xStr = LAMBDA.absyn.getVarExpId(x);
    if (LAMBDA.absyn.isVarExp(e)) {
	return LAMBDA.absyn.getVarExpId(e) === xStr ? m : e;
    } else if (LAMBDA.absyn.isAppExp(e)) {
	return LAMBDA.absyn.createAppExp(
	    substitute(m,x,LAMBDA.absyn.getAppExpFn(e)),
	    substitute(m,x,LAMBDA.absyn.getAppExpArg(e)));
    } else if (LAMBDA.absyn.isLambdaAbs(e)) {
	var param = LAMBDA.absyn.getLambdaAbsParam(e);
	var paramStr = LAMBDA.absyn.getVarExpId(param);
	var body = LAMBDA.absyn.getLambdaAbsBody(e);
	if ( paramStr === xStr) {
	    // e is of the form ^x.B */
	    return e;
	} else if (notFreeIn(paramStr, m)) {
	    return LAMBDA.absyn.createLambdaAbs(param,substitute(m,x,body));
	} else {
	    var newVar = LAMBDA.absyn.createVarExp(
		newVariable(freeVars(m).concat(freeVars(body))));
	    return LAMBDA.absyn.createLambdaAbs(
		newVar,	
		substitute(m,x,substitute(newVar,param,body)));
	}
    }
}
function beta (e) {
    if (LAMBDA.absyn.isAppExp(e)) {
	var fn = LAMBDA.absyn.getAppExpFn(e);
	var arg = LAMBDA.absyn.getAppExpArg(e);
	if (LAMBDA.absyn.isLambdaAbs(fn)) {
	    return substitute(arg,
			      LAMBDA.absyn.getLambdaAbsParam(fn),
			      LAMBDA.absyn.getLambdaAbsBody(fn));
	} else {
	    return e;
	}
    } else {
	return e;
    }
}
function appOrder(e) {
    if (LAMBDA.absyn.isVarExp(e)) {
	return e;
    } else if (LAMBDA.absyn.isLambdaAbs(e)) {
	return 	LAMBDA.absyn.createLambdaAbs(
	    LAMBDA.absyn.getLambdaAbsParam(e),
	    appOrder( LAMBDA.absyn.getLambdaAbsBody(e)));
    } else { // application expression
	var fn = LAMBDA.absyn.getAppExpFn(e);
	var arg = LAMBDA.absyn.getAppExpArg(e);
	var fnRed = appOrder(fn);
	var argRed = appOrder(arg);
	if (LAMBDA.absyn.isLambdaAbs(fnRed)) {
	    return appOrder(beta(LAMBDA.absyn.createAppExp(fnRed,argRed)));
	} else {
	    return LAMBDA.absyn.createAppExp(fnRed,argRed);
	}

    }
}
function isBetaRedex(e) {
    return LAMBDA.absyn.isAppExp(e) &&
	LAMBDA.absyn.isLambdaAbs(LAMBDA.absyn.getAppExpFn(e));
}
function containsInnerBetaRedex(e) {
    return (LAMBDA.absyn.isLambdaAbs(e) &&
	    containsBetaRedex(LAMBDA.absyn.getLambdaAbsBody(e))) ||
	(LAMBDA.absyn.isAppExp(e) &&
	 (containsBetaRedex(LAMBDA.absyn.getAppExpFn(e)) ||
	  containsBetaRedex(LAMBDA.absyn.getAppExpArg(e)) ));
}
function containsBetaRedex(e) {
   return  isBetaRedex(e) || containsInnerBetaRedex(e);
}
function reduceLeftmostInnermostBetaRedex (e) {
    if (LAMBDA.absyn.isVarExp(e)) {
	return e;
    } else if (LAMBDA.absyn.isLambdaAbs(e)) {
	return LAMBDA.absyn.createLambdaAbs(
	    LAMBDA.absyn.getLambdaAbsParam(e),
	    reduceLeftmostInnermostBetaRedex(
		LAMBDA.absyn.getLambdaAbsBody(e)));
    } else if (LAMBDA.absyn.isAppExp(e)) {
	var fn = LAMBDA.absyn.getAppExpFn(e);
	var arg = LAMBDA.absyn.getAppExpArg(e);
	if (containsBetaRedex(fn)) {
	    return LAMBDA.absyn.createAppExp(
		reduceLeftmostInnermostBetaRedex(fn),arg);
	} else if (containsBetaRedex(arg)) {
	    return LAMBDA.absyn.createAppExp(
		fn,reduceLeftmostInnermostBetaRedex(arg));
	} else if (isBetaRedex(e)) {
	    return beta(e);
	} else {
	    return e;
	}	    
    }
}
function reduceToNormalForm(e) {
    var output = [ ];
    output.push(printExp(e));
    var eprime;
    while (true) {
	eprime = reduceLeftmostInnermostBetaRedex(e);
	if (printExp(eprime) === printExp(e)) {
	    return output;
	} else {
	    output.push(printExp(eprime));
	    e = eprime;	    
	}
    }
}
function printExp(exp) {
    if (LAMBDA.absyn.isVarExp(exp)) {
	return LAMBDA.absyn.getVarExpId(exp);
    } else if (LAMBDA.absyn.isLambdaAbs(exp)) {
	return "\u03BB" +
	    LAMBDA.absyn.getVarExpId(LAMBDA.absyn.getLambdaAbsParam(exp))  +
	    "." +
	    printExp(LAMBDA.absyn.getLambdaAbsBody(exp));
    }
    else if (LAMBDA.absyn.isAppExp(exp)) {
	return "(" +
	    printExp(LAMBDA.absyn.getAppExpFn(exp)) +
	    " " +
	    printExp(LAMBDA.absyn.getAppExpArg(exp)) +
	    ")";
    }
}
function evalExp(exp) {
    if (LAMBDA.absyn.isVarExp(exp)) {
	return LAMBDA.absyn.getVarExpId(exp);
    } else if (LAMBDA.absyn.isLambdaAbs(exp)) {
	return "^" +
	    LAMBDA.absyn.getVarExpId(LAMBDA.absyn.getLambdaAbsParam(exp))  +
	    "." +
	    evalExp(LAMBDA.absyn.getLambdaAbsBody(exp));
    }
    else if (LAMBDA.absyn.isAppExp(exp)) {
	return "(" +
	    evalExp(LAMBDA.absyn.getAppExpFn(exp)) +
	    " " +
	    evalExp(LAMBDA.absyn.getAppExpArg(exp)) +
	    ")";
    }
}
function myEval(p) {
    if (LAMBDA.absyn.isProgram(p)) {
	return reduceToNormalForm( LAMBDA.absyn.getProgramExp(p));
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
	    return value.join('\n');;
        }
    } catch (exception) {
	window.alert(exception);
        return "No output [Runtime error]";
    }
    return output;
}

LAMBDA.interpret = interpret; // make the interpreter public
}());
