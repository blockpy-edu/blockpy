// denoted values in the interpreted language:
//  Num, Clo

function Num(n) {
    this.tag = "Num";
    this.n = n;
}
function isNum(value) {
    return value.tag === "Num";
}
function Clo(params,body,env) {
    this.tag = "Clo";
    this.params = params;
    this.body = body;
    this.env = env;
}
function isClo(value) {
    return value.tag === "Clo";
}

// implementation of the environment

// data constructors
function EmptyEnv() {
    this.tag = "EmptyEnv";
}
function isEmptyEnv(env) {
    return env.tag === "EmptyEnv";
}
function Env(bindings,env) {
    this.tag = "Env";
    this.bindings = bindings;
    this.env = env;
}
function isEnv(env) {
    return env.tag === "Env";
}

// accessor
function lookup (e,variable) {
    if (isEmptyEnv(e))
	throw "Runtime error: No binding for " + variable;
    else if ( e.bindings[ variable ] !== undefined )
	return e.bindings[ variable ];
    else
	return lookup(e.env,variable);
}
function update(e,variables,values) {
    var bindings =  {};
    for(index = 0; index < variables.length; index++)
	bindings[ variables[index] ]  = values[index];
    return new Env(bindings,e);
}
function initEnv() {
    return update(new EmptyEnv(), ["x","y"], [ new Num(5), new Num(6)]);
}
