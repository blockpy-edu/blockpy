function myEval(p) {
    if (isProgram(p)) {
	return evalExp(p.exp,initEnv());
    } else 
	alert( "The input is not a program.");
}
function evalExp(exp,env) {
    if (isIntExp(exp))
	return new Num(exp.val);
    else if (isVarExp(exp))
	return lookup(env,exp.id);
    else if (isFnExp(exp))
	return new Clo(exp.params,exp.body,env);
    else if (isAppExp(exp)) {
	var f = evalExp(exp.fn,env);
	var args = exp.args.map( function(arg) { return evalExp(arg,env); } );
	if (isClo(f)) {
	    return evalExp(f.body,update(f.env,f.params,args));
	}
	else
	    throw f + " is not a closure and thus cannot be applied.";
    } else if (isPrimAppExp(exp))  
        return applyPrimitive(exp.prim,exp.args.map( function(arg) { 
                                                return evalExp(arg,env); } ));
    else
	throw "Error: Attempting to evaluate an invalid expression";
}
function interpret(source) {
    var output='';
    try {
        if (source === '')
            alert('Nothing to interpret: you must provide some input!');
        else {
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
function applyPrimitive(prim,args) {
    switch (prim) {
    case "+": 
	typeCheckPrimitiveOp(prim,args,[isNum,isNum]);
	return new Num( args[0].n + args[1].n);
    case "*": 
	typeCheckPrimitiveOp(prim,args,[isNum,isNum]);
	return new Num( args[0].n * args[1].n);
    case "add1": 
	typeCheckPrimitiveOp(prim,args,[isNum,]);
	return new Num( 1 + args[0].n );
    }
}
function typeCheckPrimitiveOp(op,args,typeCheckerFunctions) {
    var numArgs = typeCheckerFunctions.length;
    if (args.length !== numArgs)
	throw "Wrong number of arguments given to '" + op + "'.";
    for( var index = 0; index<numArgs; index++)
	if ( ! (typeCheckerFunctions[index])(args[index]) )
	    throw "The " + nth(index) + " argument of '" + op + "' has the wrong type.";
}
// the code below is not functional
function stringRepresentation(value) {
    switch (value.tag) {

    case "Num": 
	return value.n;
    case "Clo":
	return;
    }
}
function expToString(exp) {
    return "<omitted>";
}
function envToString(e) {
    function aux(e) {
	if (isEmptyEnv(e))
	    return "EmptyEnv";
	else {
	    var result = "|| " + aux(e.env);
            var bindings = e.bindings;
	    for( var p in bindings) {
		if (bindings.hasOwnProperty(p))
		    result = p + ":" + valueToString(bindings[p]) + " " + result;
	    }
	    return result;
	}
    }

    return "{ " + aux(e) + " }";
}
function valueToString(value) {
    if (isNum(value)) {
	return value.n+"";
    }
    else if (isClo(value))
	return "Closure( params=" + value.params + " , body="+ 
	    expToString(value.body) + " , env=" + envToString(value.env) +" )";
}
function nth(n) {
    switch (n+1) {
    case 1: return "first";
    case 2: return "second";
    case 3: return "third";
    default: return (n+1) + "th";
    }
}
