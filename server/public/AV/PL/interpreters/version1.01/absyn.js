function Program(exp) {
    this.tag = "Program";
    this.exp = exp;
}
function isProgram(p) {
    return p.tag === "Program";
}
function VarExp(s) {
    this.tag = "VarExp";
    this.id = s;
}
function IntExp(n) {
    this.tag = "IntExp";
    this.integer = parseInt(n);
}
function FnExp(params,body) {
    this.tag = "FnExp";
    this.params = params;
    this.body = body;
}
function AppExp(fn,args) {
    this.tag = "AppExp";
    this.fn = fn;
    this.args = args;
}
function PrimAppExp(prim,args) {
    this.tag = "PrimAppExp";
    this.prim = prim;
    this.args = args;
}
