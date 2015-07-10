"use strict";

/* global LAMBDA : true, parser, MathJax, console, exp, order */

$(function () {

    var maxReductionSteps = 15;
    var arr;

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
	return freeVars(LAMBDA.absyn.getAppExpFn(exp)).concat(freeVars(LAMBDA.absyn.getAppExpArg(exp))).reduce(function(a,x) { 
		if (a.indexOf(x)===-1) { 
		    a.push(x); return a;} else { return a; } },
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
	if (list.indexOf(character) === -1) {
	    return character;
	}
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
		newVariable(freeVars(m).concat(freeVars(body)).concat(xStr)));
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
function reduceLeftmostOutermostBetaRedex (e) {
    var param, body, fn, arg, e2;
    if (LAMBDA.absyn.isVarExp(e)) {
	    return e;
    } else if (LAMBDA.absyn.isLambdaAbs(e)) {
	param = LAMBDA.absyn.getLambdaAbsParam(e);
	body = reduceLeftmostOutermostBetaRedex(
	    LAMBDA.absyn.getLambdaAbsBody(e));
	return LAMBDA.absyn.createLambdaAbs(param,body);	
    } else if (LAMBDA.absyn.isAppExp(e)) {
	fn = LAMBDA.absyn.getAppExpFn(e);
	arg = LAMBDA.absyn.getAppExpArg(e);
	if (isBetaRedex(e)) {
	    return beta(e);
	} else {
	    if (containsBetaRedex(fn)) {
		e2 = reduceLeftmostOutermostBetaRedex(fn);
		return LAMBDA.absyn.createAppExp(e2,arg);
	    } else if (containsBetaRedex(arg)) {
		return LAMBDA.absyn.createAppExp(
		    fn,reduceLeftmostOutermostBetaRedex(arg));
	    } else {
		return e;
	    }	    
	}
    }
}
function findLeftmostOutermostBetaRedex (e) {
    var fn, arg;
    if (LAMBDA.absyn.isVarExp(e)) {
	return "no beta redex";
    } else if (LAMBDA.absyn.isLambdaAbs(e)) {
	return findLeftmostOutermostBetaRedex(LAMBDA.absyn.getLambdaAbsBody(e));
    } else if (LAMBDA.absyn.isAppExp(e)) {
	if (isBetaRedex(e)) {
	    return e;
	} else {
	    fn = LAMBDA.absyn.getAppExpFn(e);
	    arg = LAMBDA.absyn.getAppExpArg(e);
	    if (containsBetaRedex(fn)) {
		return findLeftmostOutermostBetaRedex(fn);
	    } else if (containsBetaRedex(arg)) {
		return findLeftmostOutermostBetaRedex(arg);
	    } else {
		return "no beta redex";
	    }
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
function alreadySeen(str,array) {
    for(var i=0; i<array.length-1; i++) {
	if (str === array[i][0]) {
	    return true;
	}
    }
    return false;
}
function reduceToNormalForm(e,order) {
    var isApplicative = order === "applicative";
    var output = [ ];
    var redex, redexStr, start, length, eStr, prefix, suffix, reducedStr;
    var numReductions = 0;
    output.push( [ printExp(e) ] );
    while (true) {
	if (isApplicative) {
	    redex = findLeftmostInnermostBetaRedex(e);
	}  else {
	    redex = findLeftmostOutermostBetaRedex(e);
	}
	if (redex === "no beta redex") {
	    return output;
	} else {
	    numReductions += 1;
	    if (numReductions > maxReductionSteps) {
		output[0].push("We stopped here because there were " +
			       "too many steps in the reduction.");
		return output;
	    }
	    redexStr = printExp(redex);
	    eStr = printExp(e);
	    length = redexStr.length;
	    start = eStr.indexOf(redexStr);
	    prefix = eStr.substr(0,start);
	    suffix = eStr.substr(start+length);
	    reducedStr = prefix + printExp(beta(redex)) + suffix;
	    output.push( [ reducedStr, 
			   myLength(eStr.substr(0,start)),
			   myLength(eStr.substr(0,start+length-1)) ]);
	    if (alreadySeen(reducedStr,output)) {
		output[0].push("We stopped here because an infinite loop " +
			       "was detected.");
		return output;
	    }

	     if (isApplicative) {
		 e = reduceLeftmostInnermostBetaRedex (e);
	     } else {
		 e = reduceLeftmostOutermostBetaRedex (e);
	     }
	}
    }
}
function getNumNodes(exp) {
    if (LAMBDA.absyn.isVarExp(exp)) {
	return 3;
    } else if (LAMBDA.absyn.isLambdaAbs(exp)) {
	return 5 + getNumNodes(LAMBDA.absyn.getLambdaAbsBody(exp));
    } else if (LAMBDA.absyn.isAppExp(exp)) {
	return 3 + getNumNodes(LAMBDA.absyn.getAppExpFn(exp)) +
	    getNumNodes(LAMBDA.absyn.getAppExpArg(exp));
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
function getFreeBoundVariables(exp) {
    function helper(e,vs) {
	if (LAMBDA.absyn.isVarExp(e)) {
	    if (vs.indexOf(LAMBDA.absyn.getVarExpId(e)) === -1) {
		return "?";   // free or unknown
	    } else {
		return "+";   // bound
	    }
	} else if (LAMBDA.absyn.isAppExp(e)) {
	    return "(" +
		helper(LAMBDA.absyn.getAppExpFn(e),vs) +
		" " +
		helper(LAMBDA.absyn.getAppExpArg(e),vs) +
		")";
	} else if (LAMBDA.absyn.isLambdaAbs(e)) {
	    var v = LAMBDA.absyn.getVarExpId(LAMBDA.absyn.getLambdaAbsParam(e));
	    return "\u03BB" + v +"." +
		helper(LAMBDA.absyn.getLambdaAbsBody(e),vs+v);
	}	    
    }
    var output = helper(exp,"");
    return output;
}
function lexicalAddress (e) {
    function helper (e,list) {
	if (LAMBDA.absyn.isVarExp(e)) {
	    var address = list.indexOf(LAMBDA.absyn.getVarExpId(e));
	    return address === -1 ? "?" : String(address);
	} else if (LAMBDA.absyn.isAppExp(e)) {
	    return "(" + helper(LAMBDA.absyn.getAppExpFn(e),list) + " " +
		helper(LAMBDA.absyn.getAppExpArg(e),list) + ")";
	} else if (LAMBDA.absyn.isLambdaAbs(e)) {
	    var v = LAMBDA.absyn.getVarExpId(
		LAMBDA.absyn.getLambdaAbsParam(e));
	    return "\u03BB" +  v + "." + 
		helper(LAMBDA.absyn.getLambdaAbsBody(e),v +list);	    
	}
    }	   		  
    return helper(e,"");
}
function listLambdas(exp) {
    var a = [];
    function helper(e) {
	if (LAMBDA.absyn.isAppExp(e)) {
	    helper(LAMBDA.absyn.getAppExpFn(e));
	    helper(LAMBDA.absyn.getAppExpArg(e));
	} else if (LAMBDA.absyn.isLambdaAbs(e)) {
	    a = a.concat([e]);
	    helper(LAMBDA.absyn.getLambdaAbsBody(e));
	}
    }
    helper(exp);
    return a;
}
function labelBoundVariables (e,chosenLambda) {
    function localPrintExp(exp) {
	if (LAMBDA.absyn.isVarExp(exp)) {
	    return LAMBDA.absyn.getVarExpId(exp);
	} else if (LAMBDA.absyn.isLambdaAbs(exp)) {
	    if (exp === chosenLambda) {
		return "\u03BB@." + 
		    helper(LAMBDA.absyn.getLambdaAbsBody(exp),
			   LAMBDA.absyn.getVarExpId(
			       LAMBDA.absyn.getLambdaAbsParam(exp)).toUpperCase());
	    } else {
		return "\u03BB" +
		    LAMBDA.absyn.getVarExpId(
			LAMBDA.absyn.getLambdaAbsParam(exp))  +  "." +
		    localPrintExp(LAMBDA.absyn.getLambdaAbsBody(exp));
	    }
	}
	else if (LAMBDA.absyn.isAppExp(exp)) {
	    return "(" +
		localPrintExp(LAMBDA.absyn.getAppExpFn(exp)) +
		" " +
		localPrintExp(LAMBDA.absyn.getAppExpArg(exp)) +
	    ")";
	}
    }

    function helper(e,vs) {
	var v;
	if (LAMBDA.absyn.isVarExp(e)) {
	    v = LAMBDA.absyn.getVarExpId(e);
	    if (vs.indexOf(v) === -1) {
		if (vs.indexOf(v.toUpperCase())  !== -1) {
		    return "#"; // bound to the selected lambda
		} else {
		    return v;   // free
		} 
	    } else {
		return v;   // bound to some other lambda
	    }
	} else if (LAMBDA.absyn.isAppExp(e)) {
	    return "(" +
		helper(LAMBDA.absyn.getAppExpFn(e),vs) +
		" " +
		helper(LAMBDA.absyn.getAppExpArg(e),vs) +
		")";
	} else if (LAMBDA.absyn.isLambdaAbs(e)) {
	    v = LAMBDA.absyn.getVarExpId(LAMBDA.absyn.getLambdaAbsParam(e));
	    return "\u03BB" + v +"." +
		helper(LAMBDA.absyn.getLambdaAbsBody(e),v+vs);
	}	    
    }

    return localPrintExp(e);
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
function myEval(p,order) {
    if (LAMBDA.absyn.isProgram(p)) {
	return reduceToNormalForm( LAMBDA.absyn.getProgramExp(p),order);
    } else {
	window.alert( "The input is not a program.");
    }
}
function interpret(source, order) {
    var output='';

    try {
        if (source === '') {
            window.alert('Nothing to interpret: you must provide some input!');
	} else {
	    var ast = parser.parse(source);
	    var value = myEval( ast, order );
	    startAV(value,order);
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
function loadArray(chars) {   
    for(var index=0; index<chars.length; index++) {
	arr.value(index,chars[index]);
    }
    for(index=chars.length; index<arr.size(); index++) {
	arr.value(index,"");
    }
}
function setArrayCellsWidth (highlight,range) {
    arr.removeClass(true,"oneCharWidth");
    arr.removeClass(true,"emptyWidth");
    arr.removeClass(true,"lambdaWidth");
    arr.removeClass(true,"parenWidth");
    arr.addClass(true, "defaultCellStyle");
    arr.addClass(oneChar, "oneCharWidth");
    arr.addClass(noChar,"emptyWidth");
    arr.addClass(lambdaChar,"lambdaWidth");
    arr.addClass(parenChar,"parenWidth");
    if (highlight !== undefined) {
	if (highlight) {
	    arr.removeClass(true,"unhighlightCell");
	    arr.addClass(range, "highlightCell");
	} else {
	    arr.removeClass(true,"highlightCell");
	    arr.addClass(range, "unhighlightCell");
	}
    }
}
var oneChar = function(x) { return arr.value(x).length === 1; };
var noChar = function(x) { return arr.value(x).length === 0; };
var lambdaChar = function(x) { return arr.value(x).length === 3; };
var parenChar = function(x) { 
    return arr.value(x) === '(' || arr.value(x) === ')' ||
	arr.value(x) === ' '; 
};

function startAV(exps,order) {
    var redexType = order === "applicative" ? "innermost" : "outermost";
    if (typeof MathJax !== 'undefined') {
      MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [ ['$$', '$$'], ["\\[", "\\]"] ],
          processEscapes: true
        },
        "HTML-CSS": {
          scale: "80"
        }
      });
      $('.avcontainer').on("jsav-message", function () {
        // invoke MathJax to do conversion again
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      });
      $(".avcontainer").on("jsav-updatecounter", function () {
        // invoke MathJax to do conversion again
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      });
    }
    JSAV.init();
    JSAV.ext.SPEED = 50;

    // Make sure that we initialize everything if this is being re-created
    $(".jsavcontrols").html("");
    $(".jsavcanvas").empty();

    var av = new JSAV($(".avcontainer"));
    var numCols = Math.max.apply(null, exps.map(function(x) 
						{ return myLength(x[0]); }));   
    //av.clear(); // new fiix by Ville that I need to test
    arr = av.ds.array(fillIn(1,numCols));
    loadArray(mySplit(exps[0][0]));
    

    setArrayCellsWidth();

    av.umsg("<h2>Initial \u03BB-expression:</h2>");
    av.displayInit();

    for(var slide=1; slide<exps.length; slide++) {
	// %%%%%%%%%%%%%%%% new slide %%%%%%%%%%%%%%%%%%%%%%%
	av.umsg("<h2>[&beta;-reduction #" + slide + 
		"] Find the leftmost " + redexType + " \u03B2-redex</h2>");
	av.step();
	// %%%%%%%%%%%%%%%% new slide %%%%%%%%%%%%%%%%%%%%%%%
	av.umsg("<h2>[\u03B2-reduction #" + slide + "] The leftmost " + 
		  redexType + " \u03B2-redex is highlighted below</h2>");
	loadArray(mySplit(exps[slide-1][0]));
	setArrayCellsWidth(true,fillIn(exps[slide][1],exps[slide][2]));
	av.step();
	// %%%%%%%%%%%%%%%% new slide %%%%%%%%%%%%%%%%%%%%%%%
	av.clearumsg();
	av.umsg("<h2>[\u03B2-reduction #" + slide +
		"] Reduce the \u03B2-redex</h2>");
	av.step();
	// %%%%%%%%%%%%%%%% new slide %%%%%%%%%%%%%%%%%%%%%%%
	av.umsg("<h2>[\u03B2-reduction #" + slide +
		"] Completed the \u03B2-reduction</h2>");
	loadArray(mySplit(exps[slide][0]));
	setArrayCellsWidth(false,fillIn(exps[slide][1],exps[slide][2]));
	av.step();
    }
    if (exps[0].length > 1) {
	av.label("<h2>" + exps[0][1] + "</h2>");
    } else {
	av.label("<h2>The \u03BB-expression above is in \u03B2-normal form.</h2>");
    }
    av.recorded();
}


// this code is only used when creating slide shows
// for now, only applicative order reductions is supported
// to support normal order, put the second argument (order) back in below
// and modify the HTML templates for slide shows
    function interpretForSlideShow(source,order) {
	var output='';
	try {
	    return  myEval( parser.parse(source), order );
	} catch (exception) {
            return "No output [Runtime error]";
	}
	return output;
    }

// end of code for slide shows

LAMBDA.interpret = interpret; // make the interpreter public
LAMBDA.interpretForSlideShow = interpretForSlideShow; // only used for slide shows
LAMBDA.printExp = printExp;
LAMBDA.mySplit = mySplit;
LAMBDA.setArrayCellsWidth = setArrayCellsWidth;
LAMBDA.oneChar = oneChar;
LAMBDA.noChar = noChar;
LAMBDA.lambdaChar = lambdaChar;
LAMBDA.parenChar = parenChar;
LAMBDA.getNumNodes = getNumNodes;
LAMBDA.getFreeBoundVariables = getFreeBoundVariables;
LAMBDA.reduceToNormalForm = reduceToNormalForm;
LAMBDA.lexicalAddress = lexicalAddress;
LAMBDA.listLambdas = listLambdas;
LAMBDA.labelBoundVariables = labelBoundVariables;
LAMBDA.free = free;
LAMBDA.substitute = substitute;

});

// the code below is only used when creating slide shows
if (typeof running_in_node !== 'undefined') {
    (function () {
	var a = LAMBDA.interpretForSlideShow(exp, order);
	if (a === "No output [Runtime error]") {
	    console.log("[ ['Syntax error in the input...','... no reduction to perform.']];\n");
	} else {
	    console.log( "[" );
	    if (a.length>0) {
		console.log( "[ '" + a[0][0] + "'" +
			     (a[0].length === 2 ? 
			      ", '" + a[0][1] + "' ]" :
			      " ]") +
			     (a.length > 1 ? "," : "" ));
	    }
	    for(var i=1; i<a.length; i++) {
		var line = "[ '" + a[i][0] + "'";
		for (var j = 1; j<a[i].length; j++) {
		    line = line + ", " + a[i][j];
		}
		line = line + "]";
		if (i < a.length-1) {
		    line = line + ",";
		}
		console.log(line);
	    }
	    console.log( "];\n");
	}
    })();
}
