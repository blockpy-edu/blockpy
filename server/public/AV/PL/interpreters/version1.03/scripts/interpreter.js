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
	typeCheckPrimitiveOp(prim,args,[isNum,isNum]);
	return createNum( getNumValue(args[0]) + getNumValue(args[1]));
    case "*": 
	typeCheckPrimitiveOp(prim,args,[isNum,isNum]);
	return createNum( getNumValue(args[0]) * getNumValue(args[1]));
    case "add1": 
	typeCheckPrimitiveOp(prim,args,[isNum]);
	return createNum( 1 + getNumValue(args[0]) );
    }
}


function myEval(p) {
    if (isProgram(p)) {
	return evalExp(getProgramExp(p),initEnv());
    } else {
	alert( "The input is not a program.");
    }
}
function evalExp(exp,env) {
    if (isIntExp(exp)) {
	return createNum(getIntExpValue(exp));
    }
    else if (isVarExp(exp)) {
	return lookup(env,getVarExpId(exp));
    }
    else if (isFnExp(exp)) {
	return createClo(getFnExpParams(exp),getFnExpBody(exp),env);
    }
    else if (isAppExp(exp)) {
	var f = evalExp(getAppExpFn(exp),env);
	var args = getAppExpArgs(exp).map( function(arg) { return evalExp(arg,env); } );
	if (isClo(f)) {
	    return evalExp(getCloBody(f),update(getCloEnv(f),getCloParams(f),args));
	}
	else {
	    throw f + " is not a closure and thus cannot be applied.";
	}
    } else if (isPrimAppExp(exp)) {
        return applyPrimitive(getPrimAppExpPrim(exp),
			      getPrimAppExpArgs(exp).map( function(arg) { 
                                  return evalExp(arg,env); } ));
    } else {
	throw "Error: Attempting to evaluate an invalid expression";
    }
}
function valueToString(value) {
    if (isNum(value)) {
	return getNumValue(value)+"";
    }
    else if (isClo(value)) {
	return "Closure( params=" + getCloParams(value) + " , body="+ 
	expToString(getCloBody(value)) + " , env=" + envToString(getCloEnv(value)) +" )";
    }
}

function interpret(source) {
    var output='';

    try {
        if (source === '') {
            alert('Nothing to interpret: you must provide some input!');
	} else {
	    var ast = parser.parse(source);
	    var value = myEval( ast );
            return valueToString(value);
        }
    } catch (exception) {
	alert(exception);
        return "No output [Runtime error]";
    }
    return output;
}
// the code below is not functional
function stringRepresentation(value) {
    switch (value[0]) {
    case "Num": 
	return getNumValue(value);
    case "Clo":
	return;
    }
}
function expToString(exp) {
    return "<omitted>";
}
function envToString(e) {
    function aux(e) {
	if (isEmptyEnv(e)) {
	    return "EmptyEnv";
	} else {
	    var result = "|| " + aux(getEnvEnv(e));
            var bindings = getEnvBindings(e);
	    for(var i=0; i<bindings.length; i++) {
		result = bindings[i][0] + " = " +valueToString(bindings[i][1]) + " " + result;
	    }
	    return result;
	}
    }

    return "{ " + aux(e) + " }";
}
