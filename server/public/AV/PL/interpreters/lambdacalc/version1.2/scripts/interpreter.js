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
function beta(e) {
    var e2;
    if (LAMBDA.absyn.isAppExp(e)) {
	var fn = LAMBDA.absyn.getAppExpFn(e);
	var arg = LAMBDA.absyn.getAppExpArg(e);
	if (LAMBDA.absyn.isLambdaAbs(fn)) {
	    e2 = substitute(arg,
			    LAMBDA.absyn.getLambdaAbsParam(fn),
			    LAMBDA.absyn.getLambdaAbsBody(fn));
	    e2.redex = true;
	    return e2;
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
	var param, body, fn, arg, e2;
	if (LAMBDA.absyn.isVarExp(e)) {
	return e;
    } else if (LAMBDA.absyn.isLambdaAbs(e)) {
	param = LAMBDA.absyn.getLambdaAbsParam(e);
	body = reduceLeftmostInnermostBetaRedex(
	    LAMBDA.absyn.getLambdaAbsBody(e));
	return LAMBDA.absyn.createLambdaAbs(param,body);	
    } else if (LAMBDA.absyn.isAppExp(e)) {
	fn = LAMBDA.absyn.getAppExpFn(e);
	arg = LAMBDA.absyn.getAppExpArg(e);
	if (containsBetaRedex(fn)) {
	    e2 = reduceLeftmostInnermostBetaRedex(fn);
	    return LAMBDA.absyn.createAppExp(e2,arg);
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
function findLeftmostInnermostBetaRedex (e) {
    var fn, arg;
    if (LAMBDA.absyn.isVarExp(e)) {
	return "no beta redex";
    } else if (LAMBDA.absyn.isLambdaAbs(e)) {
	return findLeftmostInnermostBetaRedex(LAMBDA.absyn.getLambdaAbsBody(e));
    } else if (LAMBDA.absyn.isAppExp(e)) {
	fn = LAMBDA.absyn.getAppExpFn(e);
	arg = LAMBDA.absyn.getAppExpArg(e);
	if (containsBetaRedex(fn)) {
	    return findLeftmostInnermostBetaRedex(fn);
	} else if (containsBetaRedex(arg)) {
	    return findLeftmostInnermostBetaRedex(arg);
	} else if (isBetaRedex(e)) {
	    return e;
	} else {
	    return "no beta redex";
	}
    }
}
function reduceToNormalForm(e) {
    var output = [ ];
    var redex, redexStr, start, length, eStr, prefix, suffix, reducedStr;
    output.push( [ printExp(e) ] );
    while (true) {
	redex = findLeftmostInnermostBetaRedex(e);
	if (redex === "no beta redex") {
	    return output;
	} else {
	    redexStr = printExp(redex);
	    eStr = printExp(e);
	    length = redexStr.length;
	    start = eStr.indexOf(redexStr);
	    prefix = eStr.substr(0,start);
	    suffix = eStr.substr(start+length);
	    reducedStr = printExp(beta(redex));
	    output.push( [ prefix + reducedStr + suffix, 
			   myLength(eStr.substr(0,start)),
			   myLength(eStr.substr(0,start+length-1)) ]);
	    e = reduceLeftmostInnermostBetaRedex (e);
	}
    }
}
/*
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
*/
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
	    startAV(value);
	    return value.join('\n');
        }
    } catch (exception) {
	window.alert(exception);
        return "No output [Runtime error]";
    }
    return output;
}

function mySplit(s) {
    var output = [];
    var index;
    while (s.length > 0) {
	if (s[0] !== "\u03bb") {
	    output.push(s[0]);
	    s = s.substr(1);
	} else {
	    index = s.indexOf(".");
	    output.push(s.substr(0,index+1));
	    s = s.substr(index+1);
	}
    }
    
    return output;
}
function myLength(s) {
    var output=0;
    var index;
    while (s.length > 0) {
	if (s[0] !== "\u03bb") {
	    output += 1;
	    s = s.substr(1);
	} else {
	    index = s.indexOf(".");
	    output += 1;
	    s = s.substr(index+1);
	}
    }
    return output;
}
function fillIn(start,end) {
    if (start === end) {
	return [end];
    } else {
	var a=fillIn(start+1,end);
	a.unshift(start);
	return a;
    }
}
function loadArray(arr,chars) {
    for(var index=0; index<chars.length; index++) {
	arr.value(index,chars[index]);
    }
    for(index=chars.length; index<arr.size(); index++) {
	arr.value(index,"");
    }
}
function startAV(exps) {
    var defaultCellStyle =  {"border": "none", 
			     "width" : "25px", 
			     "min-width" : "25px",
			     "box-shadow" : "none" };
    var oneCharWidth = 	{"width" : "8px", "min-width" : "5px" };
    var highlightCell = { "background-color" : "#F88" };
    var av = new JSAV("container");
    var numCols = Math.max.apply(null, exps.map(function(x) { return myLength(x[0]); }));
    var arr = av.ds.array(mySplit(exps[0][0]));
    //loadArray(arr,mySplit(exps[0][0]));
    var lambdaExp;
    var oneChar = function(x) { return arr.value(x).length === 1; };
    arr.css(true, defaultCellStyle);
    arr.css( function(x) { return arr.value(x).length === 1; }, 
	     oneCharWidth);
    av.umsg("<h2>Initial \u03BB-expression:</h2>", { "font-weight" : "bold"});
    av.displayInit();


    for(var slide=1; slide<exps.length; slide++) {
	av.umsg("<h2>[\u03B2-reduction #" + slide + 
		"] Find the leftmost innermost \u03B2-redex</h2>");
	av.step();
	av.umsg("<h2>[\u03B2-reduction #" + slide + 
		"] The leftmost innermost \u03B2-redex is highlighted in red</h2>");

	lambdaExp = exps[slide-1][0];
	arr.hide();
	arr = av.ds.array(mySplit(lambdaExp));
	//loadArray(arr,mySplit(lambdaExp));
	arr.css(true, defaultCellStyle)
	    .css(oneChar, oneCharWidth)
	    .css(fillIn(exps[slide][1],exps[slide][2]), highlightCell);
	av.step();
	av.clearumsg();
	av.umsg("<h2>[\u03B2-reduction #" + slide +"] Reduce the \u03B2-redex</h2>");
	av.step();
	arr.hide();
	av.umsg("<h2>[\u03B2-reduction #" + slide +"] Completed the \u03B2-reduction</h2>");
	arr = av.ds.array(mySplit(exps[slide][0]));
	//loadArray(arr,mySplit(exps[slide][0]));
	arr.css(true, defaultCellStyle);
	arr.css(oneChar, oneCharWidth);
	av.step();

    }
    av.label("<h2>The \u03BB-expression above is in \u03B2-normal form.</h2>");
    av.recorded();
}

LAMBDA.interpret = interpret; // make the interpreter public
}());

