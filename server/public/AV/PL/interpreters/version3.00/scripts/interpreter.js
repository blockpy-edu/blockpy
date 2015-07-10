/* global SLang : true, parser, console  */

(function () {

    "use strict";

    var A = SLang.absyn;
    var E = SLang.env;
    var classEnv;
    var defaultValue = E.createNum( -12345 );
    
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
/* helper functions for OOP */
function elaborateDecls(decls) {
    classEnv = decls;
    //classEnv.unshift(A.createClass("Object",null,[],[]));
}
function lookupClass(name,classes) {
    for(var i = 0; i<classes.length; i++) {
	if (name === classes[i][1]) { 
	    return classes[i];
	}
    }
    throw new Error("Class unknown: " + name);
}
function lookupMethod(name,methods) {
    for(var i = 0; i<methods.length; i++) {
	if (name === methods[i][1]) { 
	    return methods[i];
	}
    }
    return A.createMethod("_invalidName",null,null);
    //throw new Error("Method unknown: " + name);
}
/* given an object and a class name cName, returns the list of slices
   starting at cName */
function viewObjectAs(object,cName) {
    object = E.getObjectState(object);
    for(var i=0; i<object.length; i++) {
	if (cName === object[i][0]) {
	    return E.createObject(object.slice(i));  
	}
    }
    throw new Error("Not an object: " + JSON.stringify(object));
}
function getClassName(state) {
    if (state.length > 0 ) {
	return state[0][0];
    } else {
	throw new Error("Not an object: " + JSON.stringify(state));
    }
}
/* given a class definition, return the corresponding slice */
function makeSlice(classDef) {
    return [ classDef[1],
	     A.getClassIvars(classDef).map( 
		 function (ignore_name) { return [ defaultValue ]; })
	   ];
}
/* given a list of slices, return the environment in which each field is bound to its value */
function buildFieldEnv(slices) {
    var env = E.createEmptyEnv();
    var theClass, fields, refs;
    for(var i=slices.length-1; i>=0; i--) {
	theClass = lookupClass(slices[i][0],classEnv);
	fields = A.getClassIvars(theClass);
	refs = slices[i][1];
	env = E.updateWithReferences(env,fields,refs);
    }
    return env;
}
/* given a class name, return an instance of the class, that is, an array
   of slices */
function makeNewObject(className) {
    var helper = function (name) {
        var theClass, result;
	if (name === "Object") {
	    return [ ];
	} else {
	    theClass = lookupClass(name,classEnv);
	    result = helper(A.getClassSuperClass(theClass));
	    result.unshift(makeSlice(theClass));
	    return result;
	}
    };
    return E.createObject(helper(className));
}
function applyMethod(method,className,object,args) {
    var values, params;
    var theClass = lookupClass(className,classEnv);
    var obj = viewObjectAs(object,className);
    params = A.getMethodParams(method).slice(0);
    params.unshift("_this");
    params.unshift("_super");
    args.unshift(object);
    args.unshift(E.createClassName(A.getClassSuperClass(theClass)));
    values = evalExps(A.getMethodBody(method),
		      E.update(buildFieldEnv(E.getObjectState(obj)),
			       params,args));
    return values[values.length-1];
}
function findAndInvokeMethod(methodName, className, object, args) {
    var theClass, method, methods;
    if (className === "Object") {
	throw new Error("Unknown method: " + methodName);
    } else {
	theClass = lookupClass(className, classEnv);
	methods = A.getClassMethods(theClass);
        method = lookupMethod(methodName, methods);
        if (A.getMethodName(method) === "_invalidName") {
	    return findAndInvokeMethod(methodName, 
				       A.getClassSuperClass(theClass),
				       object, args);
	} else {
	    return applyMethod(method,className,object,args);
	}
    }
}
function evalExp(exp,envir) {
    var f, v, args, values, obj, sup;
    if (A.isIntExp(exp)) {
	return E.createNum(A.getIntExpValue(exp));
    } else if (A.isVarExp(exp)) {
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
	v = evalExp(A.getAssignExpRHS(exp),envir);
	E.lookupReference(
                        envir,A.getAssignExpVar(exp))[0] = v;
	return v;
    } else if (A.isFnExp(exp)) {
	return E.createClo(A.getFnExpParams(exp),
				   A.getFnExpBody(exp),envir);
    } else if (A.isAppExp(exp)) {
	f = evalExp(A.getAppExpFn(exp),envir);
	args = evalExps(A.getAppExpArgs(exp),envir);
	if (E.isClo(f)) {
	    if (E.getCloParams(f).length !== args.length) {		
		throw new Error("Runtime error: wrong number of arguments in " +
				"a function call (" + E.getCloParams(f).length +
				" expected but " + args.length + " given)");
	    } else {
		values = evalExps(E.getCloBody(f),
			          E.update(E.getCloEnv(f),
					   E.getCloParams(f),args));
		return values[values.length-1];
	    }
	} else {
	    throw f + " is not a closure and thus cannot be applied.";
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
    } else if (A.isThisExp(exp)) {
	return E.lookup(envir,"_this");
    } else if (A.isNewExp(exp)) {
	args = evalExps(A.getNewExpArgs(exp),envir);
	obj = makeNewObject(A.getNewExpClass(exp));
	findAndInvokeMethod("initialize",A.getNewExpClass(exp),obj,args);
        return obj;
    } else if (A.isMethodCall(exp)) {
	obj = evalExp(A.getMethodCallObject(exp),envir);
	args = evalExps(A.getMethodCallArgs(exp),envir);
	return findAndInvokeMethod(A.getMethodCallMethod(exp),
				   getClassName(E.getObjectState(obj)),
				   obj, 
				   args
				   );
    } else {
	throw new Error("Error: Attempting to evaluate an invalid expression");
    }
}
function evalExps(list,envir) {
    return list.map( function(e) { return evalExp(e,envir); } );
}
function myEval(p) {
    var values;
    if (A.isProgram(p)) {
	elaborateDecls(A.getProgramDecls(p));
	values = evalExps(A.getProgramMainBody(p),E.createEmptyEnv());
	return values[values.length-1];
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
