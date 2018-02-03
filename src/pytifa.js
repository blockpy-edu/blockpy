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
 *  * You cannot write a variable out of scope
 *  * You cannot read a mutable variable out of scope
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
    this.report.variables = this.nameMap;
    
    // Check afterwards
    this.finishScope();
    
    this.report.topLevelVariables = {};
    var mainPathVars = this.nameMap[this.pathChain[0]]
    for (var fullName in mainPathVars) {
        var splitName = fullName.split("/");
        if (splitName.length == 2 && splitName[0] == this.scopeChain[0]) {
            this.report.topLevelVariables[splitName[1]] = mainPathVars[fullName];
        }
    }
    
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
            "Malformed Conditional": [], // An if/else with empty else or if
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
            "Not a function": [], // Attempt to call non-function as function
            "Action after return": [],
            "Incompatible types": [], // 
            "Return outside function": [], // 
            "Read out of scope": [], // 
            "Write out of scope": [], // Attempted to modify a variable in a higher scope
            "Aliased built-in": [], // 
            "Method not in Type": [], // A method was used that didn't exist for that type
            "Submodule not found": [],
            "Module not found": []
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
        definition?: JS function object
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
    // Actions after return?
    if (this.scopeChain.length > 1) {
        var returnState = this.findVariablesScope("*return");
        if (returnState.exists && returnState.inScope) {
            if (returnState.state.set == "yes") {
                this.reportIssue("Action after return", {"position": Tifa.locate(node)});
            }
        }
    }
    // No? All good.
    this.astNames.push(node._astname);
    this.AstId += 1;
    var result = NodeVisitor.prototype.visit.call(this, node);
    this.AstId -= 1;
    this.astNames.pop();
    if (result === undefined) {
        return Tifa._UNKNOWN_TYPE();
    } else {
        return result;
    }
}

Tifa.prototype.visit_Assign = function(node) {
    // Handle value
    var valueType = this.visit(node.value);
    // Handle targets
    this.visitList(node.targets);
    var position = Tifa.locate(node);
    var that = this;
    // TODO: Properly handle assignments with subscripts
    this.walkTargets(node.targets, valueType, (function action(target, type) {
        if (target._astname === 'Name') {
            that.storeVariable(target.id.v, type, position);
        } else if (target._astname == 'Tuple' || target._astname == 'List') {
            for (var i = 0, len = target.elts.length; i < len; i++) {
                var elt = target.elts[i];
                var eltType = Tifa.indexSequenceType(type, i);
                action(elt, eltType);
            }
        }
    }));
}

Tifa.prototype.visit_AugAssign = function(node) {
    // Handle value
    var right = this.visit(node.value);
    // Handle target
    var left = this.visit(node.target);
    var name = this.identifyCaller(node.target);
    // Handle op
    var position = Tifa.locate(node);
    
    // Handle operation
    this.loadVariable(name, position);
    var opLookup = Tifa.VALID_BINOP_TYPES[node.op.name];
    if (left.name == "Unknown" || right.name == "Unknown") {
        return Tifa._UNKNOWN_TYPE();
    } else if (opLookup) {
        opLookup = opLookup[left.name];
        if (opLookup) {
            opLookup = opLookup[right.name];
            if (opLookup) {
                var resultType = opLookup(left, right);
                this.storeVariable(name, resultType, position);
                return resultType;
            }
        }
    }
    this.reportIssue("Incompatible types", 
                     {"left": left, "right": right, 
                      "operation": node.op.name, 
                      "position": position});
    return Tifa._UNKNOWN_TYPE();
}

Tifa.prototype.visit_Import = function(node) {
    // Handle names
    var position = Tifa.locate(node);
    for (var i = 0, len = node.names.length; i < len; i++) {
        var module = node.names[i];
        var asname = module.asname === null ? module.name : module.asname;
        var moduleType = this.loadModule(module.name.v, position);
        this.storeVariable(asname.v, moduleType, position);
    }
}

Tifa.prototype.visit_ImportFrom = function(node) {
    // Handle names
    var position = Tifa.locate(node);
    for (var i = 0, len = node.names.length; i < len; i++) {
        if (node.module === null) {
            var alias = node.names[i];
            var asname = alias.asname === null ? alias.name : alias.asname;
            var moduleType = this.loadModule(alias.name.v, position);
            var nameType = this.loadBuiltinAttr(moduleType, null, alias.name.v, position);
            this.storeVariable(asname.v, nameType, position);
        } else {
            var moduleName = node.module.v;
            var alias = node.names[i];
            var asname = alias.asname === null ? alias.name : alias.asname;
            var moduleType = this.loadModule(moduleName, position);
            var nameType = this.loadBuiltinAttr(moduleType, null, alias.name.v, position);
            this.storeVariable(asname.v, nameType, position);
        }
    }
}

Tifa.prototype.visit_BinOp = function(node) {
    // Handle left and right
    var left = this.visit(node.left);
    var right = this.visit(node.right);
    
    // Handle operation
    var opLookup = Tifa.VALID_BINOP_TYPES[node.op.name];
    if (left.name == "Unknown" || right.name == "Unknown") {
        return Tifa._UNKNOWN_TYPE();
    } else if (opLookup) {
        opLookup = opLookup[left.name];
        if (opLookup) {
            opLookup = opLookup[right.name];
            if (opLookup) {
                return opLookup(left, right);
            }
        }
    }
    this.reportIssue("Incompatible types", 
                     {"left": left, "right": right, 
                      "operation": node.op.name, 
                      "position": Tifa.locate(node)});
    return Tifa._UNKNOWN_TYPE();
}

Tifa.prototype.visit_UnaryOp = function(node) {
    // Handle operand
    var operand = this.visit(node.operand);
    
    if (node.op.name == "Not") {
        return Tifa._BOOL_TYPE();
    } else if (operand.name == "Unknown") {
        return Tifa._UNKNOWN_TYPE();
    } else {
        var opLookup = Tifa.VALID_UNARYOP_TYPES[node.op.name];
        if (opLookup) {
            opLookup = opLookup[operand.name];
            if (opLookup) {
                return opLookup(operand);
            }
        }
    }
    return Tifa._UNKNOWN_TYPE();
}

Tifa.prototype.visit_BoolOp = function(node) {
    // Handle left and right
    var values = [];
    for (var i=0, len=node.values.length; i < len; i+= 1) {
        values[i] = this.visit(node.values[i]);
    }
    
    // TODO: Truthiness is not supported! Probably need a Union type
    
    // Handle operation
    return Tifa._BOOL_TYPE();
}

Tifa.prototype.visit_Compare = function(node) {
    // Handle left and right
    var left = this.visit(node.left);
    var comparators = [];
    for (var i=0, len=node.comparators.length; i < len; i+= 1) {
        comparators[i] = this.visit(node.comparators[i]);
    }
    
    // Handle ops
    for (var i=0, len=comparators.length; i < len; i+= 1) {
        var op = node.ops[i];
        var right = comparators[i];
        switch (op.name) {
            case "Eq": case "NotEq": case "Is": case "IsNot":
                break;
            case "Lt": case "LtE": case "GtE": case "Gt": 
                if (left.name != right.name ||
                    (left.name != "Num" && left.name != "Bool" &&
                     left.name != "Str" && left.name != "List" &&
                     left.name != "Set" && left.name != "Tuple" )) {
                    this.reportIssue("Incompatible types", 
                                     {"left": left, "right": right, 
                                      "operation": op.name, 
                                      "position": Tifa.locate(node)});
                }
                break;
            case "In": case "NotIn":
                if (right.name != "Str" && right.name != "List" &&
                    right.name != "Set" && right.name != "Tuple" &&
                    right.name != "Dict") {
                    this.reportIssue("Incompatible types", 
                                     {"left": left, "right": right, 
                                      "operation": op.name, 
                                      "position": Tifa.locate(node)});
                }
                break;
        } 
    }
    return Tifa._BOOL_TYPE();
}

Tifa.prototype.visit_Call = function(node) {
    var position = Tifa.locate(node);
    // Handle func part (Name or Attribute)
    var functionType = this.visit(node.func);
    var calleeName = this.identifyCaller(node);
    // Handle args
    var arguments = [];
    for (var i = 0, len = node.args.length; i < len; i++) {
        var arg = this.visit(node.args[i]);
        arguments.push(arg);
    }
    // Handle keywords
    // Handle starargs
    // Handle kwargs
    if (functionType.name == 'Function') {
        var result = functionType.definition(this, functionType, calleeName, arguments, position);
        return result;
    }
    this.reportIssue("Not a function", {"position": position});
    return Tifa._UNKNOWN_TYPE();
}

Tifa.prototype.IfExp = function(node) {
    // Visit the conditional
    this.visit(node.test);
    
    // Visit the body
    var body = this.visit(node.body);
    
    // Visit the orelse
    var orelse = this.visit(node.orelse);

    if (body.name != orelse.name) {
        // TODO: Union type?
        return Tifa._UNKNOWN_TYPE();
    } else {
        return body;
    }
}

Tifa.prototype.visit_If = function(node) {
    var position = Tifa.locate(node);
    
    // Visit the conditional
    this.visit(node.test);
    
    if (node.orelse.length == 1 && node.orelse[0]._astname == "Pass") {
        this.reportIssue("Malformed Conditional", {"position": position});
    } else if (node.body.length == 1 && node.orelse.length &&
               node.body[0]._astname == "Pass") {
        this.reportIssue("Malformed Conditional", {"position": position});
    }
    
    // Visit the bodies
    var thisPathId = this.PathId;
    this.PathId += 1;
    var ifPathId = this.PathId;
    this.pathNames.push(ifPathId+'i');
    this.pathChain.unshift(ifPathId);
    this.nameMap[ifPathId] = {};
    for (var i = 0, len = node.body.length; i < len; i++) {
        this.visit(node.body[i]);
    }
    this.pathNames.pop()
    this.pathChain.shift();
    
    this.PathId += 1;
    var elsePathId = this.PathId;
    this.pathNames.push(elsePathId+'e');
    this.pathChain.unshift(elsePathId);
    this.nameMap[elsePathId] = {};
    for (var i = 0, len = node.orelse.length; i < len; i++) {
        this.visit(node.orelse[i]);
    }
    this.pathNames.pop()
    this.pathChain.shift();
    
    // Combine two paths into one
    for (var ifName in this.nameMap[ifPathId]) {
        if (ifName in this.nameMap[elsePathId]) {
            var combined = this.combineStates(this.nameMap[ifPathId][ifName],
                                              this.nameMap[elsePathId][ifName],
                                              position)
        } else {
            var combined = this.combineStates(this.nameMap[ifPathId][ifName], 
                                              this.nameMap[thisPathId][ifName], 
                                              position)
        }
        this.nameMap[thisPathId][ifName] = combined;
    }
    for (var elseName in this.nameMap[elsePathId]) {
        if (!(ifName in this.nameMap[elsePathId])) {
            var combined = this.combineStates(this.nameMap[elsePathId][elseName], 
                                              this.nameMap[thisPathId][elseName],
                                              position)
            this.nameMap[thisPathId][elseName] = combined;
        }
    }
}

Tifa.prototype.visit_While = function(node) {
    // Visit the conditional
    this.visit(node.test);
    
    // Visit the bodies
    var thisPathId = this.PathId;
    this.PathId += 1;
    var ifPathId = this.PathId;
    this.pathNames.push(ifPathId+'i');
    this.pathChain.unshift(ifPathId);
    this.nameMap[ifPathId] = {};
    this.pathNames.pop()
    this.pathChain.shift();
    
    this.PathId += 1;
    var elsePathId = this.PathId;
    this.pathNames.push(elsePathId+'e');
    this.pathChain.unshift(elsePathId);
    this.nameMap[elsePathId] = {};
    for (var i = 0, len = node.orelse.length; i < len; i++) {
        this.visit(node.orelse[i]);
    }
    this.visit(node.test);
    this.pathNames.pop()
    this.pathChain.shift();
    
    // Combine two paths into one
    for (var ifName in this.nameMap[ifPathId]) {
        if (ifName in this.nameMap[elsePathId]) {
            var combined = this.combineStates(this.nameMap[ifPathId][ifName],
                                              this.nameMap[elsePathId][ifName],
                                              Tifa.locate(node))
        } else {
            var combined = this.combineStates(this.nameMap[ifPathId][ifName], 
                                              this.nameMap[elsePathId][thisPathId], 
                                              Tifa.locate(node))
        }
        this.nameMap[thisPathId][ifName] = combined;
    }
    for (var elseName in this.nameMap[elsePathId]) {
        if (!(ifName in this.nameMap[elsePathId])) {
            var combined = this.combineStates(this.nameMap[elsePathId][elseName], 
                                              this.nameMap[elsePathId][thisPathId],
                                              Tifa.locate(node))
            this.nameMap[thisPathId][elseName] = combined;
        }
    }
}

Tifa.prototype.visit_ListComp = function(node) {
    // TODO: Handle comprehension scope
    var generators = node.generators;
    for (var i = 0, len = generators.length; i < len; i++) {
        this.visit(generators[i]);
    }
    var elt = node.elt;
    return Tifa._LIST_OF_TYPE(this.visit(elt));
}

Tifa.prototype.visit_SetComp = function(node) {
    // TODO: Handle comprehension scope
    var generators = node.generators;
    for (var i = 0, len = generators.length; i < len; i++) {
        this.visit(generators[i]);
    }
    var elt = node.elt;
    return Tifa._SET_OF_TYPE(this.visit(elt));
}

Tifa.prototype.visit_SetComp = function(node) {
    // TODO: Handle comprehension scope
    var generators = node.generators;
    for (var i = 0, len = generators.length; i < len; i++) {
        this.visit(generators[i]);
    }
    var key = node.key;
    var value = node.value;
    return Tifa._DICT_OF_TYPE(this.visit(key), this.visit(value));
}

Tifa.prototype.visit_GeneratorExp = function(node) {
    // TODO: Handle comprehension scope
    var generators = node.generators;
    for (var i = 0, len = generators.length; i < len; i++) {
        this.visit(generators[i]);
    }
    var elt = node.elt;
    return Tifa._GENERATOR_OF_TYPE(this.visit(elt));
}

Tifa.prototype.visit_comprehension = function(node) {
    // Handle the iteration list
    var position = Tifa.locate(node);
    var iter = node.iter;
    var iterType;
    var iterListName = null;
    if (iter._astname === "Name") {
        iterListName = iter.id.v;
        if (iterListName == "___") {
            this.reportIssue("Unconnected blocks", {"position": position})
        }
        var state = this.iterateVariable(iterListName, Tifa.locate(node));
        iterType = state.type;
    } else {
        iterType = this.visit(iter);
    }
    if (Tifa.isTypeEmptyList(iterType)) {
        this.reportIssue("Empty iterations", {"position": position, "name": iterListName});
    }
    if (!(Tifa.isTypeSequence(iterType))) {
        this.reportIssue("Non-list iterations", {"position": position, "name": iterListName});
    }
    var iterSubtype = null;
    if (iterType !== null) {
        iterSubtype = Tifa.indexSequenceType(iterType, 0);
    }
    
    // Handle the iteration variable
    var iterVariableName = null;
    var that = this;
    (function walkTarget(target, type) {
        if (target._astname === 'Name') {
            if (iterVariableName == null) {
                iterVariableName = target.id.v;
            }
            that.storeIterVariable(target.id.v, type, position);
        } else if (target._astname == 'Tuple' || target._astname == 'List') {
            for (var i = 0, len = target.elts.length; i < len; i++) {
                var elt = target.elts[i];
                var eltType = Tifa.indexSequenceType(type, i);
                walkTarget(elt, eltType, position);
            }
        }
    })(node.target, iterSubtype);
    
    if (iterVariableName && iterListName && iterListName == iterVariableName) {
        this.reportIssue("Iteration variable is iteration list", 
                         {"name": iterVariableName, "position": position});
    }

    // Handle the bodies
    for (var i = 0, len = node.ifs.length; i < len; i++) {
        this.visit(node.ifs[i]);
    }
}

Tifa.prototype.visit_For = function(node) {
    // Handle the iteration list
    var position = Tifa.locate(node);
    var iter = node.iter;
    var iterType;
    var iterListName = null;
    if (iter._astname === "Name") {
        iterListName = iter.id.v;
        if (iterListName == "___") {
            this.reportIssue("Unconnected blocks", {"position": position})
        }
        var state = this.iterateVariable(iterListName, Tifa.locate(node));
        iterType = state.type;
    } else {
        iterType = this.visit(iter);
    }
    if (Tifa.isTypeEmptyList(iterType)) {
        this.reportIssue("Empty iterations", {"position": position, "name": iterListName});
    }
    if (!(Tifa.isTypeSequence(iterType))) {
        this.reportIssue("Non-list iterations", {"position": position, "name": iterListName});
    }
    var iterSubtype = null;
    if (iterType !== null) {
        iterSubtype = Tifa.indexSequenceType(iterType, 0);
    }
    
    // Handle the iteration variable
    var iterVariableName = null;
    var that = this;
    (function walkTarget(target, type) {
        if (target._astname === 'Name') {
            if (iterVariableName == null) {
                iterVariableName = target.id.v;
            }
            that.storeIterVariable(target.id.v, type, position);
        } else if (target._astname == 'Tuple' || target._astname == 'List') {
            for (var i = 0, len = target.elts.length; i < len; i++) {
                var elt = target.elts[i];
                var eltType = Tifa.indexSequenceType(type, i);
                walkTarget(elt, eltType, position);
            }
        }
    })(node.target, iterSubtype);
    
    if (iterVariableName && iterListName && iterListName == iterVariableName) {
        this.reportIssue("Iteration variable is iteration list", 
                         {"name": iterVariableName, "position": position});
    }

    // Handle the bodies
    for (var i = 0, len = node.body.length; i < len; i++) {
        this.visit(node.body[i]);
    }
    for (var i = 0, len = node.orelse.length; i < len; i++) {
        this.visit(node.orelse[i]);
    }
}

Tifa.prototype.visit_ClassDef = function(node) {
    var className = node.name.v;
    var position = Tifa.locate(node);
    this.storeVariable(className, {"type": "Class"}, position)
    // TODO: Define a new scope definition that executes the body
    // TODO: find __init__, execute that
    this.generic_visit(node);
}

Tifa.prototype.visit_FunctionDef = function(node) {
    // Name
    var functionName = node.name.v;
    var position = Tifa.locate(node);
    var state = this.storeVariable(functionName, {"name": "Function"}, position);
    var definitionsScope = this.scopeChain.slice(0);
    state.type.definition = function(analyzer, callType, callName, parameters, callPosition) {
        // Manage scope
        analyzer.ScopeId += 1;
        var oldScope = analyzer.scopeChain.slice(0);
        analyzer.scopeChain = definitionsScope.slice(0);
        analyzer.scopeChain.unshift(analyzer.ScopeId);
        // Process arguments
        var args = node.args.args;
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            var name = Sk.ffi.remapToJs(arg.id);
            var parameter = Tifa.copyType(parameters[i]);
            analyzer.storeVariable(name, parameter, position)
        }
        for (var i = 0, len = node.body.length; i < len; i++) {
            analyzer.visit(node.body[i]);
        }
        var returnState = analyzer.findVariablesScope("*return");
        var returnValue = Tifa._NONE_TYPE();
        if (returnState.exists && returnState.inScope) {
            returnValue = analyzer.loadVariable("*return", callPosition).type;
        }
        // Return scope
        analyzer.finishScope();
        analyzer.scopeChain.shift();
        analyzer.scopeChain = oldScope;
        return returnValue;
    }
    return state.type;
}

Tifa.prototype.visit_Lambda = function(node) {
    // Name
    var position = Tifa.locate(node);
    var definitionsScope = this.scopeChain.slice(0);
    var functionType = { "name": "Function"};
    functionType.definition = function(analyzer, callType, callName, parameters, callPosition) {
        // Manage scope
        analyzer.ScopeId += 1;
        var oldScope = analyzer.scopeChain.slice(0);
        analyzer.scopeChain = definitionsScope.slice(0);
        analyzer.scopeChain.unshift(analyzer.ScopeId);
        // Process arguments
        var args = node.args.args;
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            var name = Sk.ffi.remapToJs(arg.id);
            var parameter = Tifa.copyType(parameters[i]);
            analyzer.storeVariable(name, parameter, position)
        }
        var returnValue = analyzer.visit(node.body);
        // Return scope
        analyzer.finishScope();
        analyzer.scopeChain.shift();
        analyzer.scopeChain = oldScope;
        return returnValue;
        
    }
    return functionType;
}

Tifa.prototype.visit_Return = function(node) {
    if (this.scopeChain.length == 1) {
        this.reportIssue("Return outside function", {"position": Tifa.locate(node)});
    }
    var valueType = this.visit(node.value);
    var position = Tifa.locate(node);
    this.returnVariable(valueType, position)
}

Tifa.prototype.visit_Attribute = function(node) {
    // Handle value
    var valueType = this.visit(node.value);
    // Handle attr
    var position = Tifa.locate(node);
    var attrType = this.loadBuiltinAttr(valueType, node.value, node.attr.v, position);
    // Handle ctx
    //TODO: Handling contexts
    return attrType;
}

Tifa.prototype.visit_Subscript = function(node) {
    // Handle value
    var valueType = this.visit(node.value);
    // Handle slice
    switch (node.slice._astname) {
        case "Index": return Tifa.indexSequenceType(valueType, 0);
        case "Slice": return valueType;
    }
}

Tifa.prototype.visit_Name = function(node) {
    var name = node.id.v;
    if (name == "___") {
        this.reportIssue("Unconnected blocks", {"position": Tifa.locate(node)})
    }
    if (node.ctx.prototype._astname === "Load") {
        if (name == "True" || name == "False") {
            return Tifa._BOOL_TYPE();
        } else if (name == "None") {
            return Tifa._NONE_TYPE();
        } else {
            var variable = this.findVariablesScope(name);
            var builtin = Tifa.loadBuiltin(name);
            if (!variable.exists && builtin) {
                return builtin;
            } else {
                var state = this.loadVariable(name, Tifa.locate(node));
                return state.type;
            }
        }
    } else {
        var variable = this.findVariablesScope(name);
        if (variable.exists) {
            return variable.state.type;
        } else {
            return Tifa._UNKNOWN_TYPE();
        }
    }
}


Tifa.prototype.visit_Num = function(node) {
    return Tifa._NUM_TYPE();
}
Tifa.prototype.visit_Bool = function(node) {
    return Tifa._BOOL_TYPE();
}
Tifa.prototype.visit_Str = function(node) {
    return Tifa._STR_TYPE();
}
Tifa.prototype.visit_List = function(node) {
    var type = Tifa._LIST_TYPE();
    if (node.elts.length == 0) {
        type.empty = true;
    } else {
        type.empty = false;
        // TODO: confirm homogenous subtype
        for (var i = 0, len = node.elts.length; i < len; i++) {
            type.subtype = this.visit(node.elts[i]);
        }
    }
    return type;
}
Tifa.prototype.visit_Dict = function(node) {
    var type = Tifa._DICT_TYPE();
    if (node.keys.length == 0) {
        type.empty = true;
    } else {
        type.empty = false;
        for (var i = 0, len = node.keys.length; i < len; i++) {
            type.keys = this.visit(node.keys[i]);
            type.values = this.visit(node.values[i]);
        }
    }
    return type;
}
Tifa.prototype.visit_Tuple = function(node) {
    var type = Tifa._TUPLE_TYPE();
    if (node.elts.length == 0) {
        type.empty = true;
    } else {
        type.empty = false;
        type.subtypes = [];
        // TODO: confirm homogenous subtype
        for (var i = 0, len = node.elts.length; i < len; i++) {
            type.subtypes.push(this.visit(node.elts[i]));
        }
    }
    return type;
}

Tifa.prototype.visit_With = function(node) {
    var typeValue = this.visit(node.context_expr),
        position = Tifa.locate(node),
        that = this;
    this.visitList(node.optional_vars);
    (function walkTarget(target, type) {
        if (target._astname === 'Name') {
            that.storeVariable(target.id.v, type, position);
        } else if (target._astname == 'Tuple' || target._astname == 'List') {
            for (var i = 0, len = target.elts.length; i < len; i++) {
                var elt = target.elts[i];
                var eltType = Tifa.indexSequenceType(type, i);
                walkTarget(elt, eltType, position);
            }
        }
    })(node.optional_vars, typeValue);
    // Handle the bodies
    for (var i = 0, len = node.body.length; i < len; i++) {
        this.visit(node.body[i]);
    }
}

Tifa.prototype.identifyCaller = function (node) {
    switch (node._astname) {
        case "Name":
            return node.id.v;
        case "Call":
            return this.identifyCaller(node.func);
        case "Attribute": case "Subscript":
            return this.identifyCaller(node.value);
        default:
            return null;
    }
}

Tifa.prototype.findVariableOutOfScope = function (name) {
    for (var pathId in this.nameMap) {
        var path = this.nameMap[pathId];
        for (var fullName in path) {
            var unscopedName = /[^/]*$/.exec(fullName)[0];
            if (unscopedName == name) {
                return {'exists': true, 'inScope': false, 'scopedName': unscopedName, 'state': path[fullName]};
            }
        }
    }
    return {'exists': false, 'inScope': false, 'state': path[fullName]}
}

Tifa.prototype.findVariablesScope = function (name) {
    for (var j = 0, slen = this.scopeChain.length; j < slen; j++) {
        for (var i = 0, plen = this.pathChain.length; i < plen; i++) {
            var pathId = this.pathChain[i];
            var path = this.nameMap[pathId];
            var fullName = this.scopeChain.slice(j).join("/") + "/" + name;
            if (fullName in path) {
                if (j == 0) {
                    return {'exists': true, 'inScope': true, 'scopedName': fullName, 'state': path[fullName]};
                } else {
                    return {'exists': true, 'inScope': false, 'scopedName': fullName, 'state': path[fullName]};
                }
            }
        }
    }
    return {'exists': false};
}

Tifa.prototype.storeVariable = function(name, type, position) {
    var fullName = this.scopeChain.join("/") + "/" + name;
    var currentPath = this.pathChain[0];
    var variable = this.findVariablesScope(name);
    if (!variable.exists) {
        // Create a new instance of the variable on the current path
        newState = {'name': name, 'trace': [], 'type': type,
                    'read': 'no', 'set': 'yes', 'over': 'no'};
        this.nameMap[currentPath][fullName] = newState;
    } else {
        newState = Tifa.traceState(variable.state, "store");
        if (!variable.inScope) {
            this.reportIssue("Write out of scope", 
                             {'name': name, 'position':position})
        }
        // Type change?
        if (!Tifa.areTypesEqual(type, variable.state.type)) {
            this.reportIssue("Type changes", 
                             {'name': name, 'position':position,
                              'old': variable.state.type, 'new': type})
        }
        newState.type = type;
        // Overwritten?
        if (variable.state.set == 'yes' && variable.state.read == 'no') {
            newState.over = 'yes';
        } else {
            newState.set = 'yes';
            newState.read = 'no';
        }
        this.nameMap[currentPath][fullName] = newState;
    }
    return newState;
}

Tifa.prototype.storeIterVariable = function(name, type, position) {
    var state = this.storeVariable(name, type, position);
    state.read = 'yes';
    return state;
}

Tifa.prototype.appendVariable = function(name, type, position) {
    var state = this.storeVariable(name, type, position);
    return state;
}

Tifa.prototype.returnVariable = function(type, position) {
    return this.storeVariable("*return", type, position);
}

Tifa.prototype.loadVariable = function(name, position) {
    var fullName = this.scopeChain.join("/") + "/" + name;
    var currentPath = this.pathChain[0];
    var variable = this.findVariablesScope(name);
    var outOfScopeVar = this.findVariableOutOfScope(name);
    if (!variable.exists) {
        // Create a new instance of the variable on the current path
        if (outOfScopeVar.exists) {
            this.reportIssue("Read out of scope", 
                             {'name': name, 'position':position})
        } else {
            this.reportIssue("Undefined variables", 
                             {'name': name, 'position':position})
        }
        state = {'name': name, 'trace': [], 'type': Tifa._UNKNOWN_TYPE(),
                 'read': 'yes', 'set': 'no', 'over': 'no'};
        this.nameMap[currentPath][fullName] = state;
        return state;
    } else {
        var newState = Tifa.traceState(variable.state, "load");
        if (variable.state.set == 'no') {
            this.reportIssue("Undefined variables", 
                             {'name': name, 'position':position})
        }
        if (variable.state.set == 'maybe') {
            this.reportIssue("Possibly undefined variables", 
                             {'name': name, 'position':position})
        }
        newState.read = 'yes';
        if (!variable.inScope) {
            this.nameMap[currentPath][variable.scopedName] = newState;
        } else {
            this.nameMap[currentPath][fullName] = newState;
        }
        return newState;
    }
}

Tifa.prototype.iterateVariable = function(name, position) {
    return this.loadVariable(name, position);
}

Tifa.prototype.finishScope = function() {
    var pathId = this.pathChain[0];
    for (var name in this.nameMap[pathId]) {
        if (Tifa.sameScope(name, this.scopeChain)) {
            var state = this.nameMap[pathId][name];
            if (state.over == 'yes') {
                this.reportIssue('Overwritten variables', 
                                 {'name': state.name, 'position': 0}) // TODO position
            }
            if (state.read == 'no') {
                this.reportIssue('Unread variables', 
                                 {'name': state.name, 'type': state.type})
            }
        }
    }
}

Tifa.prototype.walkTargets = function(targets, type, walker) {
    for (var i = 0, len = targets.length; i < len; i++) {
        walker(targets[i], type);
    }
}

Tifa.cloneType = function (aType){
    switch (aType.name) {
        case "List": case "Set": case "Generator":
            return Tifa._LIST_OF_TYPE(Tifa.cloneType(aType.subtype));
        case "Dict":
            return Tifa._DICT_OF_TYPE(Tifa.cloneType(aType.keys),
                                      Tifa.cloneType(aType.values));
        case "Tuple":
            var newTuple = Tifa._TUPLE_TYPE();
            newTuple.subtypes = aType.subtypes.map(t => Tifa.cloneType(t));
            return newTuple;
        case "Module":
            var newModule = Tifa._MODULE_TYPE();
            for (var name in aType.submodules) {
                newModule.submodules[name] = Tifa.cloneType(aType.submodules[name]);
            }
            for (var name in aType.fields) {
                newModule.fields[name] = Tifa.cloneType(aType.fields[name]);
            }
            return newModule;
        case "Bool": case "Num": case "Str": case "File":
        case "None": case "*Unknown":
            return {"name": aType.name};
    }
}

// Type Definitions
Tifa._BOOL_TYPE = function() { return {'name': 'Bool'} };
Tifa._NUM_TYPE = function() { return {'name': 'Num'} };
Tifa._MODULE_TYPE = function() { return {'name': 'Module', 'submodules': {}, 'fields': {} }};
Tifa._STR_TYPE = function() { return {'name': 'Str'} };
Tifa._FILE_TYPE = function() { return {'name': 'File'} };
Tifa._SET_TYPE = function() { return {'name': 'Str', "subtype": Tifa._UNKNOWN_TYPE(), "empty": false} };
Tifa._LIST_TYPE = function(isEmpty) { return {'name': 'List', "subtype": Tifa._UNKNOWN_TYPE(), "empty": !!isEmpty} };
Tifa._DICT_TYPE = function() { return {'name': 'Dict', "empty": false, "keys": Tifa._UNKNOWN_TYPE(), "values": Tifa._UNKNOWN_TYPE()} };
Tifa._GENERATOR_OF_TYPE = function(subtype) { return {'name': 'Generator', "empty": false, "subtype": subtype} };
Tifa._LIST_OF_TYPE = function(subtype) { return {'name': 'List', "empty": false, "subtype": subtype} };
Tifa._SET_OF_TYPE = function(subtype) { return {'name': 'Set', "empty": false, "subtype": subtype} };
Tifa._DICT_OF_TYPE = function(keytype, valuetype) { 
    return {'name': 'Set', "empty": false, "keys": keytype, "values": valuetype} };
Tifa._TUPLE_TYPE = function() { return {'name': 'Tuple', "subtypes": []} };
Tifa._NONE_TYPE = function() { return {'name': 'None'} };
Tifa._UNKNOWN_TYPE = function() { return {'name': '*Unknown'} };

Tifa.VALID_BINOP_TYPES = {
    'Add': {'Num': {'Num': Tifa._NUM_TYPE}, 
            'Str' :{'Str': Tifa._STR_TYPE}, 
            'List': {'List': Tifa.mergeTypes},
            'Tuple': {'Tuple': Tifa.mergeTypes}},
    'Sub': {'Num': {'Num': Tifa._NUM_TYPE}, 
            'Set': {'Set': Tifa.mergeTypes}},
    'Div': {'Num': {'Num': Tifa._NUM_TYPE}},
    'FloorDiv': {'Num': {'Num': Tifa._NUM_TYPE}},
    'Mult': {'Num': {'Num': Tifa._NUM_TYPE, 
                     'Str': Tifa._STR_TYPE, 
                     'List': (l, r) => r, 
                     'Tuple': (l, r) => r},
             'Str': {'Num': Tifa._STR_TYPE},
             'List': {'Num': (l, r) => l},
             'Tuple': {'Num': (l, r) => l}},
    'Pow': {'Num': {'Num': Tifa._NUM_TYPE}},
    // Should we allow old-fashioned string interpolation?
    // Currently, I vote no because it makes the code harder and is bad form.
    'Mod': {'Num': {'Num': Tifa._NUM_TYPE}},
    'LShift': {'Num': {'Num': Tifa._NUM_TYPE}},
    'RShift': {'Num': {'Num': Tifa._NUM_TYPE}},
    'BitOr': {'Num': {'Num': Tifa._NUM_TYPE}, 
              'Bool': {'Num': Tifa._NUM_TYPE,
                       'Bool': Tifa._BOOL_TYPE}, 
              'Set': {'Set': Tifa.mergeTypes}},
    'BitXor': {'Num': {'Num': Tifa._NUM_TYPE}, 
              'Bool': {'Num': Tifa._NUM_TYPE,
                       'Bool': Tifa._BOOL_TYPE}, 
              'Set': {'Set': Tifa.mergeTypes}},
    'BitAnd': {'Num': {'Num': Tifa._NUM_TYPE}, 
              'Bool': {'Num': Tifa._NUM_TYPE,
                       'Bool': Tifa._BOOL_TYPE}, 
              'Set': {'Set': Tifa.mergeTypes}},
}
Tifa.VALID_UNARYOP_TYPES = {
    'UAdd': {'Num': Tifa._NUM_TYPE},
    'USub': {'Num': Tifa._NUM_TYPE},
    'Invert': {'Num': Tifa._NUM_TYPE}
}

Tifa.locate = function(node) {
    return {"column": node.col_offset, "line": node.lineno};
}

Tifa.indexSequenceType= function(type, i) {
    if (type.name == "Tuple") {
        return Tifa.cloneType(type.subtypes[i]);
    } else if (type.name == "List") {
        return Tifa.cloneType(type.subtype);
    } else if (type.name == "Generator") {
        return Tifa.cloneType(type.subtype);
    } else if (type.name == "Str") {
        return Tifa._STR_TYPE();
    } else if (type.name == "File") {
        return Tifa._STR_TYPE();
    } else if (type.name == "Dict") {
        return Tifa.cloneType(type.keys);
    } else {
        return Tifa._UNKNOWN_TYPE();
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
    return arrayContains(type.name, ["List", "Set", "Tuple", "Str", "File", "Dict"]);
}

Tifa.sameScope = function(fullName, scopeChain) {
    var nameScopes = fullName.split("/").slice(0, -1);
    var checkingScopes = scopeChain.slice().reverse();
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

Tifa.prototype.combineStates = function(left, right, position) {
    var state = {'name': left.name, 'trace': left.trace, 'type': left.type,
                 'read': left.read, 'set': left.set, 'over': left.over};
    if (right == null) {
        state.read = left.read == 'no' ? 'no' : 'maybe';
        state.set = left.set == 'no' ? 'no' : 'maybe';
        state.over = left.over == 'no' ? 'no' : 'maybe';
    } else {
        if (!Tifa.areTypesEqual(left.type, right.type)) {
            this.reportIssue("Type changes", 
                             {'name': left.name, 'position':position,
                             'old': left.type, 'new': right.type})
        }
        state.read = Tifa.matchRSO(left.read, right.read);
        state.set = Tifa.matchRSO(left.set, right.set);
        state.over = Tifa.matchRSO(left.over, right.over);
    }
    return state;
}

Tifa.matchRSO = function(left, right) {
    if (left == right) {
        return left;
    } else {
        return "maybe";
    }
}

Tifa.traceState = function(state, method) {
    var newState = {
        'type': state.type, 'method': method, 'trace': [],//state.trace.slice(0),
        'set': state.set, 'read': state.read, 'over': state.over,
        'name': state.name
    };
    newState.trace.push(state);
    return newState;
}

/**
 * Correctly clones a type, returning mutable types unchanged.
 */
Tifa.copyType = function(type) {
    switch (type.name) {
        // Immutable types:
        case "Str": return Tifa._STR_TYPE();
        case "Num": return Tifa._NUM_TYPE();
        case "Tuple": return Tifa._TUPLE_TYPE();
        // Mutable types:
        default: return type;
    }
}

Tifa.mergeTypes = function(left, right) {
    // TODO: Check that lists/sets have the same subtypes
    switch (left.name) {
        case "List": return (left.empty ? right.subtype : Tifa.cloneType(left.subtype));
        case "Set": return (left.empty ? right.subtype : Tifa.cloneType(left.subtype));
        case "Tuple": return left.subtypes.concat(right.subtypes);
    }
}

Tifa.defineSupplier = function(returnType) {
    return { "name": "Function",
             "definition": function (analyzer, type, name, args, position) {
                return returnType;
              }
    };
}
Tifa.defineIdentity = function(returnType) {
    return { "name": "Function",
             "definition": function (analyzer, type, name, args, position) {
                 if (args.length) {
                    return args[0];
                 }
                 return Tifa._UNKNOWN_TYPE();
              }
    };
}
Tifa.defineFunction = function(definition) {
    return { "name": "Function", "definition": definition};
}

Tifa.loadBuiltin = function(name) {
    switch (name) {
        // Void functions
        case "print": return Tifa.defineSupplier(Tifa._NONE_TYPE());
        // Math functions
        case "int": case "abs": case "float": case "len":
        case "ord": case "pow": case "round": case "sum":
            return Tifa.defineSupplier(Tifa._NUM_TYPE());
        // Boolean functions
        case "bool": case "all": case "any": case "isinstance":
            return Tifa.defineSupplier(Tifa._BOOL_TYPE());
        // String functions
        case "input": case "str": case "chr": case "repr":
            return Tifa.defineSupplier(Tifa._STR_TYPE());
        // File functions
        case "open": 
            return Tifa.defineSupplier(Tifa._FILE_TYPE());
        // List functions
        case "map": return Tifa.defineSupplier(Tifa._LIST_TYPE());
        case "list":
            return Tifa.defineFunction(
                function (analyzer, functionType, callee, args, position) {
                    var returnType = Tifa._LIST_TYPE();
                    if (args.length) {
                        returnType.subtype = Tifa.indexSequenceType(args[0], 0);
                        // TODO: Should inherit the emptiness too
                        returnType.empty = true;
                    } else {
                        returnType.empty = true;
                    }
                    return returnType;
                }
            );
        // Set functions
        case "set": 
            return Tifa.defineFunction(
                function (analyzer, functionType, callee, args, position) {
                    var returnType = Tifa._SET_TYPE();
                    if (args.length) {
                        returnType.subtype = Tifa.indexSequenceType(args[0], 0);
                        // TODO: Should inherit the emptiness too
                        returnType.empty = true;
                    } else {
                        returnType.empty = true;
                    }
                    return returnType;
                }
            );
        // Dict functions
        case "dict": 
            return Tifa.defineSupplier(Tifa._DICT_TYPE());
        // Pass through
        case "sorted": case "reversed": case "filter":
            return Tifa.defineIdentity();
        // Special functions
        case "range": return Tifa.defineSupplier(Tifa._LIST_OF_TYPE(Tifa._NUM_TYPE()));
        case "dir": return Tifa.defineSupplier(Tifa._LIST_OF_TYPE(Tifa._STR_TYPE()));
        case "max": case "min":
            return Tifa.defineFunction(
                function (analyzer, functionType, callee, args, position) {
                    if (args.length) {
                        return Tifa.indexSequenceType(args[0], 0);
                    }
                    return Tifa._UNKNOWN_TYPE();
                }
            );
        case "zip":
            return Tifa.defineFunction(
                function (analyzer, functionType, callee, args, position) {
                    if (args.length) {
                        var tupledTypes = Tifa._TUPLE_TYPE();
                        tupledTypes.subtypes = [];
                        for (var i=0, len=args.length; i<len; i+=1) {
                            tupledTypes.subtypes[i] = Tifa.indexSequenceType(args[i],0);
                        }
                        return Tifa._LIST_OF_TYPE(tupledTypes);
                    } else {
                        var emptyList = Tifa._LIST_TYPE(true);
                        return emptyList;
                    }
                }
            );
    }
}

Tifa.MODULES = {
    'matplotlib': {
        'name': 'Module',
        'submodules': {
            'pyplot': {
                'name': 'Module',
                'fields': {
                    'plot': Tifa.defineSupplier(Tifa._NONE_TYPE()),
                    'hist': Tifa.defineSupplier(Tifa._NONE_TYPE()),
                    'scatter': Tifa.defineSupplier(Tifa._NONE_TYPE()),
                    'show': Tifa.defineSupplier(Tifa._NONE_TYPE()),
                    'xlabel': Tifa.defineSupplier(Tifa._NONE_TYPE()),
                    'ylabel': Tifa.defineSupplier(Tifa._NONE_TYPE()),
                    'title': Tifa.defineSupplier(Tifa._NONE_TYPE()),
                }
            }
        }
    },
    'pprint': {
        'name': "Module",
        'fields': {
            'pprint': Tifa.defineSupplier(Tifa._NONE_TYPE())
        }
    },
    'random': {
        'name': "Module",
        'fields': {
            'randint': Tifa.defineSupplier(Tifa._NUM_TYPE())
        }
    },
    'turtle': {
        'name': "Module",
        'fields': {
            'forward': Tifa.defineSupplier(Tifa._NONE_TYPE()),
            'backward': Tifa.defineSupplier(Tifa._NONE_TYPE()),
            'color': Tifa.defineSupplier(Tifa._NONE_TYPE()),
            'right': Tifa.defineSupplier(Tifa._NONE_TYPE()),
            'left': Tifa.defineSupplier(Tifa._NONE_TYPE()),
        }
    },
    'math': {
        'name': "Module",
        'fields': {
            'ceil': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'copysign': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'fabs': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'factorial': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'floor': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'fmod': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'frexp': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'fsum': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'gcd': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'isclose': Tifa.defineSupplier(Tifa._BOOL_TYPE()),
            'isfinite': Tifa.defineSupplier(Tifa._BOOL_TYPE()),
            'isinf': Tifa.defineSupplier(Tifa._BOOL_TYPE()),
            'isnan': Tifa.defineSupplier(Tifa._BOOL_TYPE()),
            'ldexp': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'modf': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'trunc': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'exp': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'expm1': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'log': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'log1p': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'log2': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'log10': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'pow': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'sqrt': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'acos': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'sin': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'cos': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'tan': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'asin': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'acos': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'atan': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'atan2': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'hypot': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'degrees': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'radians': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'sinh': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'cosh': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'tanh': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'asinh': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'acosh': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'atanh': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'erf': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'erfc': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'gamma': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'lgamma': Tifa.defineSupplier(Tifa._NUM_TYPE()),
            'pi': Tifa._NUM_TYPE(),
            'e': Tifa._NUM_TYPE(),
            'tau': Tifa._NUM_TYPE(),
            'inf': Tifa._NUM_TYPE(),
            'nan': Tifa._NUM_TYPE(),
        }
    }
}

Tifa.prototype.loadModule = function(chain, position) {
    var moduleNames = chain.split('.');
    if (moduleNames[0] in Tifa.MODULES) {
        var baseModule = Tifa.MODULES[moduleNames[0]];
        for (var i=1, len=moduleNames.length; i<len; i++) {
            if (baseModule.name == "Module" && 
                moduleNames[i] in baseModule.submodules) {
                baseModule = baseModule.submodules[moduleNames[i]];
            } else {
                this.reportIssue("Submodule not found",
                                 {"name": chain, "position": position})
            }
        }
        return baseModule;
    } else {
        this.reportIssue("Module not found",
                         {"name": chain, "position": position});
        return Tifa._MODULE_TYPE();
    }
}

Tifa.prototype.loadBuiltinAttr = function(type, func, attr, position) {
    switch (type.name) {
        case "File":
            switch (attr) {
                case "close": return Tifa.defineFunction(
                    function (analyzer, functionType, callee, args, position) {}
                );
                case "read": return Tifa.defineSupplier(Tifa._STR_TYPE());
                case "readlines": return Tifa.defineSupplier(Tifa._LIST_OF_TYPE(Tifa._STR_TYPE()));
            }
            break;
        case "List":
            switch (attr) {
                case "append": return Tifa.defineFunction(
                    function (analyzer, functionType, callee, args, position) {
                        if (callee) {
                            analyzer.appendVariable(callee, Tifa._LIST_OF_TYPE(Tifa.cloneType(type.subtype)), position);
                        }
                        type.empty = false;
                        type.subtype = args[0];
                    }
                );
            };
            break;
        case "Dict":
            switch (attr) {
                case "items": return Tifa.defineFunction(
                    function (analyzer, functionType, callee, args, position) {
                        return Tifa._LIST_OF_TYPE({
                            'name': 'Tuple', 'subtypes': [type.keys, type.values], 'empty': false
                        });
                    }
                );
            };
            break;
        case "Module":
            if ("fields" in type) {
                if (attr in type.fields) {
                    return type.fields[attr];
                } else {
                    return Tifa._UNKNOWN_TYPE();
                }
            } else {
                return Tifa._UNKNOWN_TYPE();
            }
            break;
        case "Str":
            switch (attr) {
                // Strings
                case "capitalize": case "center": case "expandtabs":
                case "join": case "ljust": case "lower": 
                case "lstrip": case "replace": case "rjust":
                case "rstrip": case "strip": case "swapcase":
                case "title": case "translate": case "upper":
                case "zfill":
                    return Tifa.defineSupplier(Tifa._STR_TYPE());
                // Numbers
                case "count": case "find": case "index":
                case "rfind": case "rindex":
                    return Tifa.defineSupplier(Tifa._NUM_TYPE());
                //Booleans
                case "endswith": case "isalnum": case "isalpha":
                case "isdigit": case "islower": case "isspace":
                case "istitle": case "isupper": case "startswith":
                    return Tifa.defineSupplier(Tifa._BOOL_TYPE());
                // Lists
                case "rsplit": case "split": case "splitlines":
                    return Tifa.defineSupplier(Tifa._LIST_OF_TYPE(Tifa._STR_TYPE()));
            }
            break;
    }
    // Catch mistakes
    if (attr == "append") {
        this.reportIssue('Append to non-list', 
                         {'name': this.identifyCaller(func), 
                          'position': position,
                          'type': type})
    }
    return Tifa._NONE_TYPE();
}

