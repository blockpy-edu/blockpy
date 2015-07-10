function Program(exp) {
    this.tag = "Program";
    this.exp = exp;
}
function isProgram(e) { return e.tag === "Program"; }
function VarExp(v) {
    this.tag = "VarExp";
    this.id = v;
}
function isVarExp(e) { return e.tag === "VarExp"; }
function IntExp(n) {
    this.tag = "IntExp";
    this.val = parseInt(n);
}
function isIntExp(e) { return e.tag === "IntExp"; }
function FnExp(params,body) {
    this.tag = "FnExp";
    this.params = params;
    this.body = body;
}
function isFnExp(e) { return e.tag === "FnExp"; }
function AppExp(fn,args) {
    this.tag = "AppExp";
    this.fn = fn;
    this.args = args;
}
function isAppExp(e) { return e.tag === "AppExp"; }
function PrimAppExp(prim,args) {
    this.tag = "PrimAppExp";
    this.prim = prim;
    this.args = args;
}
function isPrimAppExp(e) { return e.tag === "PrimAppExp"; }
