var filename = '__main__.py';
var python_source = 'a, b = 0';
parse = Sk.parse(filename, python_source);
ast = Sk.astFromParse(parse.cst, filename, parse.flags);

var iter_fields = function(node) {
    /** Yield a tuple of ``(fieldname, value)`` for each field in ``node._fields``
    that is present on *node*. **/
    var fieldList = [];
    for (var i = 0; i < node._fields.length; i += 2) {
        var field = node._fields[i];
        if (field in node) {
            fieldList.push([field, node[field]]);
        }
    }
    return fieldList;
}

function NodeVisitor() {};

NodeVisitor.prototype.visit = function(node) {
    /** Visit a node. **/
    var method_name = 'visit_' + node._astname;
    if (method_name in this) {
        return this[method_name](node);
    } else {
        return this.generic_visit(node);
    }
}

NodeVisitor.prototype.generic_visit = function(node) {
    /** Called if no explicit visitor function exists for a node. **/
    var fieldList = iter_fields(node);
    for (var i = 0; i < fieldList.length; i += 1) {
        var field = fieldList[i][0], value = fieldList[i][1];
        if (Array === value.constructor) {
            for (var j = 0; j < value.length; j += 1) {
                var subvalue = value[j];
                if ("_astname" in subvalue) {
                    this.visit(subvalue);
                }
            }
        } else if ("_astname" in value) {
            this.visit(value);
        }
    }
}
function CodeAnalyzer() {
    NodeVisitor.apply(this, Array.prototype.slice.call(arguments));
};

CodeAnalyzer.prototype = new NodeVisitor();
CodeAnalyzer.prototype.visit_Num = function(node) {
    console.log(node.n.v);
    // NodeVisitor.prototype.visit_Num.call(this, node);
};

var ca = new CodeAnalyzer();
var nv = new NodeVisitor();
console.log("Old", nv, nv.visit(ast));
console.log("New", ca, ca.visit(ast));

console.log((new NodeVisitor()).visit(ast));

function AbstractInterpreter() {
    this.identifiers = {
        /*"True": [{"type": "bool", "action": "set"}],
        "False": [{"type": "bool", "action": "set"}],
        "None": [{"type": "None", "action": "set"}]*/
    };
}

AbstractInterpreter.prototype.analyze = function(python_source) {
    console.log(python_source);
    this.source = python_source.split("\n");
    var filename = 'user_code.py';
    // Attempt parsing - might fail!
    var parse, ast, symbol_table, error;
    try {
        parse = Sk.parse(filename, python_source);
        ast = Sk.astFromParse(parse.cst, filename, parse.flags);
        symbol_table = Sk.symboltable(ast, filename, python_source, filename, parse.flags);
    } catch (e) {
        error = e;
        return {"error": error, "message": "Parsing error"};
    }
    var converted = this.process(ast);
    if (converted !== null) {
        for (var block = 0; block < converted.length; block+= 1) {
            converted[block];
        }
    }
    
    var validatedIdentifiers = this.validateIdentifierActions();
    var validatedNoEmptyLoops = this.validateNoEmptyLoops();
    
    return {"No Misordered Access": validatedIdentifiers, 
            "No empty loops": validatedNoEmptyLoops,
            "identifiers": this.identifiers};
}
    
AbstractInterpreter.prototype.validateNoEmptyLoops = function() {
    for (var name in this.identifiers) {
        var identifierList = this.identifiers[name];
        for (var i = 0; i < identifierList.length; i++) {
            var action = identifierList[i].action;
            var type = identifierList[i].type;
            if (action == "for" && type == "list>empty") {
                return false;
            }
        }
    }
    return true;
}

AbstractInterpreter.prototype.validateIdentifierActions = function() {
    /**

    node.col_offset
    node.col_endoffset
    node.lineno
    node.endlineno

    **/
    for (var name in this.identifiers) {
        var identifierList = this.identifiers[name];
        for (var i = 0; i < identifierList.length; i++) {
            var type = identifierList[i].type;
            if (type == "ERROR") {
                return false;
            }
        }
    }
    return true;
}

AbstractInterpreter.prototype.process = function(node, is_top_level) {
    try {
        return this[node._astname](node, is_top_level);
    } catch (error) {
        return {"error": error, "message": "Unknown command: "+node._astname};
    }
}

AbstractInterpreter.prototype.If = function(node, is_top_level) {
    var test = node.test;
    var body = node.body;
    var orelse = node.orelse;
    
    var trueUniverse = this.processBody(body);
    var falseUniverse = this.processBody(orelse);
    
    var evaluatedTest = this.process(test);
    
    return {"Condition": evaluatedTest, "True": trueUniverse, "False": falseUniverse}
}

/*
 * target: expr_ty
 * iter: expr_ty
 * body: asdl_seq
 * orelse: asdl_seq
 *
 */
AbstractInterpreter.prototype.For = function(node) {
    var target = node.target;
    var iter = node.iter;
    var body = node.body;
    var orelse = node.orelse;
    
    var processedIter = this.process(iter);
    
    var name = this.identifier(target.id);
    this.addIdentifier(name, {
        "action": "for",
        //"node": node
        "type": processedIter,
    });
    
    this.processBody(orelse, false);
    this.processBody(body, false);
    this.process(target);
    
    return error;
}

AbstractInterpreter.prototype.Assign = function(node, is_top_level) {
    var targets = node.targets;
    var value = node.value;
    
    var processedValue = this.process(value);
    
    for (var i = 0; i < targets.length; i+= 1) {
        var name = this.identifier(targets[i].id);
        this.addIdentifier(name, {
            "action": "set",
            "type": processedValue.type,
            "value": processedValue.value,
            //"node": node
        });
        this.process(target);
    }
    
    return "ASSIGN";
}

/*
 * n: object
 *
 */
AbstractInterpreter.prototype.Num = function(node)
{
    var n = node.n;
    return {
        "type": "number",
        "value": Sk.ffi.remapToJs(n)
    };
}

AbstractInterpreter.prototype.Expr = function(node, is_top_level) {
    var value = node.value;   
    var converted = this.process(value);
    return "EXPR:";
}

AbstractInterpreter.prototype.addIdentifier = function(name, value) {
    if (name in this.identifiers) {
        this.identifiers[name].push(value);
    } else {
        this.identifiers[name] = [value];
    }
}

/*
 * id: identifier
 * ctx: expr_context_ty
 */
AbstractInterpreter.prototype.Name = function(node)
{
    var id = node.id;
    var ctx = node.ctx;
    
    var name = this.identifier(id);
    var identifierList = this.identifiers[name];
    var currentValue;
    
    if (identifierList && identifierList.length > 0) {
        currentValue = identifierList[identifierList.length-1].type;
    } else {
        currentValue = {"type": "ERROR", "value": "ERROR"}
    }
    this.addIdentifier(name, {
        "action": "get",
        "type": currentValue.type,
        "value": currentValue.value
        //"node": node
    });
    
    return currentValue;
}

AbstractInterpreter.prototype.identifier = function(node) {
    return Sk.ffi.remapToJs(node);
}

/*
 * elts: asdl_seq
 * ctx: expr_context_ty
 *
 */
AbstractInterpreter.prototype.List = function(node) {
    var elts = node.elts;
    var ctx = node.ctx;
    
    var processedElements = [];
    var previousType = "empty";
    var error = null;
    for (var i = 0; i < elts.length; i++) {
        var elt = elts[i];
        var processedElt = this.process(elt);
        processedElements.push(processedElt);
        var thisType = processedElt.type;
        if (thisType != previousType && previousType != "empty") {
            error = {"type": "ERROR"}
        }
        previousType = thisType;
    }
    return error || {"type": "list>"+previousType}
}

AbstractInterpreter.prototype.Module = function(node, is_top_level) {
    return this.processBody(node.body, true);
}

AbstractInterpreter.prototype.processBody = function(node, is_top_level) {
    var children = []
    for (var i = 0; i < node.length; i++) {
        var newChild = this.process(node[i], is_top_level);
        children.push(newChild);
    }
    return children;
}