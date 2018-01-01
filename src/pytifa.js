/**
 * Python Type Inferencer and Flow Analyzer
 * TIFA
 *
 * Depends on Skulpt
 * 
 * TIFA uses a number of simplifications of the Python language.
 *  * Variables cannot change type
 *  * Variables cannot be deleted
 *  * Complex types have to be homogenous
 *  * No introspection or reflective characteristics
 *  * No dunder methods
 *  * No closures (maybe?)
 *  * No global variables
 *  * No multiple inheritance
 *
 * Additionally, it reads the following as issues:
 *  * Cannot read a variable without having first written to it.
 *  * Cannot rewrite a variable unless it has been read.
 *
 * @constructor
 * @this {Tifa}
 */
function Tifa() {
    NodeVisitor.apply(this, Array.prototype.slice.call(arguments));
}
Tifa.prototype = new NodeVisitor();

/**
 * Processes the AST of the given source code to generate a report.
 *
 * @param {string} code - The Python source code
 * @param {string} filename - Optional, the filename (defaults to __main__)
 */
Tifa.prototype.processCode = function(code, filename) {
    // Code
    this.source = code !== "" ? code.split("\n") : [];
    filename = filename || '__main__';
    
    // Attempt parsing - might fail!
    var parse, ast;
    try {
        parse = Sk.parse(filename, code);
        ast = Sk.astFromParse(parse.cst, filename, parse.flags);
    } catch (error) {
        this.report = {"success": false, 
                       "error": error,
                       "issues": {},
                       "variables": {}};
        return this.report;
    }
    try {
        return this.processAst(ast);
    } catch (error) {
        this.report = {"success": false, 
                       "error": error,
                       "issues": {},
                       "variables": {}};
        return this.report;
    }
}

/**
 * Given an AST, actually performs the type and flow analyses to return a
 *  report.
 *
 * @constructor
 * @this {BlockPyEditor}
 * @param {Object} main - The main BlockPy instance
 * @param {HTMLElement} tag - The HTML object this is attached to.
 */
Tifa.prototype.processAst = function(ast) {
    // Unique Global IDs
    this.PathId = 0;
    this.ScopeId = 0;
    this.AstId = 0;
    
    // Human readable names
    this.pathNames = ['*Module'];
    this.scopeNames = ['*Module'];
    this.astNames = [];
    
    // Complete record of all Names
    this.scopeChain = [this.ScopeId];
    this.pathChain = [this.PathId];
    this.nameMap = {};
    this.nameMap[this.PathId] = {};
    
    // Initialize a new, empty report
    this.initializeReport();
    
    // Traverse every node
    this.visit(ast);
    
    // Check afterwards
    this.finishScope();
    
    return this.report;
}

Tifa.prototype.initializeReport = function() {
    this.report= {
        success: true,
        variables: {},
        issues: {
            "Parser Failure": [], // Complete failure to parse the code
            "Unconnected blocks": [], // Any names with ____
            "Empty Body": [], // Any use of pass on its own
            "Unnecessary Pass": [], // Any use of pass
            "Unread variables": [], // A variable was not read after it was defined
            "Undefined variables": [], // A variable was read before it was defined
            "Possibly undefined variables": [], // A variable was read but was not defined in every branch
            "Overwritten variables": [], // A written variable was written to again before being read
            "Append to non-list": [], // Attempted to use the append method on a non-list
            "Used iteration list": [], // 
            "Unused iteration variable": [], // 
            "Non-list iterations": [], // 
            "Empty iterations": [], // 
            "Type changes": [], // 
            "Iteration variable is iteration list": [], // 
            "Unknown functions": [], // 
            "Incompatible types": [], // 
            "Return outside function": [], // 
            "Read out of scope": [], // 
            "Aliased built-in": [], // 
            "Method not in Type": [] // A method was used that didn't exist for that type
        }
    }
    return this.report;
}
Tifa.prototype.reportIssue = function(issue, data) {
    this.report.issues[issue].push(data)
}
 
/*
https://github.com/python/typeshed/blob/master/stdlib/3/builtins.pyi
List
    append
    index
    

*/

/*
Important concepts:
    
    Assign
    AugAssign
    Import
    With
    
    Attribute lookup
    
    Scope:
        ID
    CallStack:

    Functions
    Lambdas
    
    Return/yield
    
    Ifs/While : Branch
    
    For loops
    
    Classes
    Try/except
    Break/continue
    
    PathId: int
    AstId: int
    ScopeId: int
    
    NameMap
        0 (top) =>
        bid => 
            fully-scoped-name: State
    State:
        name: str
        type: Type
        set, read, overwrite: str {yes, no, maybe}
        trace: list of TraceNode
        definition?: JS function object
    TraceNode:
        type: Type
        set, read, overwrite: str {yes, no, maybe}
    Type:
        ast: str {Unknown, Num, Str, List, Tuple, Set, Dict, Bool, None}
        empty?: boolean
        literals?: boolean
        subtype?: Type
        keys?: Type
        values?: Type
        subtypes?: list of Type
        
    Report:
        success: bool
        issues: Issue => list of IssueData
        variables: State
    IssueData: 
        name?: str
        scope?: str
        position?: int
        type?: Type
*/

Tifa.prototype.visit = function(node) {
    this.astNames.push(node._astname);
    this.AstId += 1;
    NodeVisitor.prototype.visit.call(this, node);
    this.AstId -= 1;
    this.astNames.pop();
}

Tifa.prototype.walkTargets = function(targets, type, walker) {
    for (var i = 0, len = targets.length; i < len; i++) {
        walker(targets[i], type);
    }
}

Tifa.prototype.visit_Assign = function(node) {
    // Handle value
    this.visit(node.value);
    var valueType = this.typecheck(node.value);
    // Handle targets
    this.visitList(node.targets);
    var position = Tifa.locate(node);
    var that = this;
    this.walkTargets(node.targets, valueType, function (target, type) {
        if (target._astname === 'Name') {
            that.storeVariable(target.id.v, type, position);
        } else if (target._astname == 'Tuple' || target._astname == 'List') {
            for (var i = 0, len = target.elts.length; i < len; i++) {
                var elt = targets.elts[i];
                var eltType = Tifa.indexSequenceType(type, i);
                that.walkTargets(elt, eltType, position);
            }
        }
    });
}

Tifa.prototype.visit_For = function(node) {
    // Handle the iteration list
    var iter = node.iter;
    var iterationListName = null;
    if (iter._astname === "Name" && iter.ctx.prototype._astname === "Load") {
        iterationListName = iter.id.v;
        if (Tifa.isTypeEmptyList(iterationListName)) {
            this.reportIssue("Empty iterations", 
                             {"name": iterationListName, "position": Tifa.locate(node)});
        }
        if (!(this.isTypeSequence(iterationListName))) {
            this.reportIssue("Non-list iterations", 
                             {"name": iterationListName, "position": Tifa.locate(node)});
        }
        this.iterateVariable(iterationListName, Tifa.locate(node));
    } else if (iter._astname === "List" && iter.elts.length === 0) {
        this.report["Empty iterations"].push({"name": "[]", "position": this.getLocation(node)});
    } else {
        this.visit(iter);
    }
}

Tifa.prototype.visit_Name = function(node) {
    var v = node.id.v;
    if (v == "___") {
        this.reportIssue("Unconnected blocks", {"position": Tifa.locate(node)})
    }
    if (node.ctx.prototype._astname === "Load") {
        this.loadVariable(v, Tifa.locate(node));
    }
}

/**
 *
 * @returns State
 */
Tifa.prototype.findVariable = function(fullName) {
    var state = null;
    // Find the variable if it already exists
    for (var i = 0, len = this.pathChain.length; i < len; i++) {
        var pathId = this.pathChain[i];
        var path = this.nameMap[pathId];
        if (fullName in path) {
            state = path[fullName];
            state.trace.push({
                'type': state.type,
                'set': state.set, 'read': state.read, 'over': state.over
            })
        }
    }
    return state;
}

Tifa.prototype.storeVariable = function(name, type, position) {
    var fullName = this.ScopeId + "/" + name;
    var state = this.findVariable(fullName);
    if (state === null) {
        // Create a new instance of the variable on the current path
        state = {'name': name, 'trace': [], 'type': type,
                 'read': 'no', 'set': 'yes', 'over': 'no'};
        this.nameMap[this.PathId][fullName] = state;
    } else {
        // Type change?
        if (Tifa.areTypesEqual(type, state.type)) {
            this.reportIssue("Type changes", 
                             {'name': name, 'position':position,
                              'old': state.type, 'new': type})
        }
        state.type = type;
        // Overwritten?
        if (state.set == 'yes' && state.read == 'no') {
            state.over = 'yes';
        } else {
            state.set = 'yes';
            state.read = 'no';
        }
    }
}

Tifa.prototype.loadVariable = function(name, position) {
    var fullName = this.ScopeId + "/" + name;
    var state = this.findVariable(fullName);
    if (state === null) {
        // Create a new instance of the variable on the current path
        state = {'name': name, 'trace': [], 'type': '*Unknown',
                 'read': 'yes', 'set': 'no', 'over': 'no'};
        this.nameMap[this.PathId][fullName] = state;
        this.reportIssue("Undefined variables", 
                         {'name': name, 'position':position})
    } else {
        if (state.set == 'no') {
            this.reportIssue("Undefined variables", 
                             {'name': name, 'position':position})
        }
        if (state.set == 'maybe') {
            this.reportIssue("Possibly undefined variables", 
                             {'name': name, 'position':position})
        }
        state.read = 'yes';
    }
}

Tifa.prototype.finishScope = function() {
    var pathId = this.pathChain[0];
    //console.log("Finishing Scope", this.scopeChain, "on path", pathId, "; variables:", this.nameMap);
    for (var name in this.nameMap[pathId]) {
        if (Tifa.sameScope(name, this.scopeChain)) {
            var state = this.nameMap[pathId][name];
            if (state.over == 'yes') {
                this.reportIssue('Overwritten variables', 
                                 {'name': state.name, 'position': 0}) // TODO position
            }
            if (state.read == 'no') {
                this.reportIssue('Unread variables', 
                                 {'name': state.name})
            }
        }
    }
}

Tifa.prototype.typecheck = function(node) {
    /** Visit a node. **/
    var method_name = 'typecheck_' + node._astname;
    if (method_name in this) {
        return this[method_name](node);
    } else {
        return {"name": "*Unknown"}
    }
}
Tifa.prototype.typecheck_Num = function(node) {
    return {'name': 'Num'}
}
Tifa.prototype.typecheck_Bool = function(node) {
    return {'name': 'Bool'}
}
Tifa.prototype.typecheck_Str = function(node) {
    return {'name': 'Str'}
}
Tifa.prototype.typecheck_Name = function(node) {
    var name = node.id.v;
    var path = this.nameMap[this.PathId];
    var fullName = (this.ScopeId ? this.ScopeId + "/" : "") + name;
    if (fullName in path) {
        return path[fullName];
    } else {
        return {'name': '*Unknown'}
    }
}

Tifa.locate = function(node) {
    return {"column": node.col_offset, "line": node.lineno};
}

Tifa.indexSequenceType= function(type, i) {
    if (type.name == "Tuple") {
        return type.subtypes[i];
    } else if (type.name == "List") {
        return type.subtype;
    } else if (type.name == "Str") {
        return {"name": 'Str'}
    }
}

Tifa.areTypesEqual = function(left, right) {
    if (left === null || right === null) {
        return false;
    } else if (left.name === "Unknown" || right.type === "Unknown") {
        return false;
    } else if (left.name === "List" && right.name === "List") {
        if (left.empty || right.empty) {
            return true;
        } else {
            return Tifa.areTypesEqual(left.subtype, right.subtype);
        }
    } else {
        return left.name == right.name;
    }
}

Tifa.isTypeEmptyList = function(type) {
    return (type.name === "List" && type.empty);
}
Tifa.isTypeSequence = function(type) {
    return arrayContains(type.name, ["List", "Set", "Tuple", "Str", "File"]);
}

Tifa.sameScope = function(fullName, scopeChain) {
    var nameScopes = fullName.split("/").slice(0, -1);
    var checkingScopes = scopeChain.reverse();
    if (nameScopes.length != checkingScopes.length) {
        return false;
    }
    for (var i = 0, len = checkingScopes.length; i < len; i++) {
        if (nameScopes[i] != checkingScopes[i]) {
            return false;
        }
    }
    return true;
}