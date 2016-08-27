/*
var filename = '__main__.py';
var python_source = 'a, b = 0\nfor x in y:\n    t = 0';
parse = Sk.parse(filename, python_source);
ast = Sk.astFromParse(parse.cst, filename, parse.flags);
*/

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

var iter_child_nodes = function(node) {
    var fieldList = iter_fields(node);
    var resultList = [];
    for (var i = 0; i < fieldList.length; i += 1) {
        var field = fieldList[i][0], value = fieldList[i][1];
        if (value === null) {
            continue;
        }
        if ("_astname" in value) {
            resultList.push(value);
        } else if (value.constructor === Array) {
            for (var j = 0; j < value.length; j += 1) {
                var subvalue = value[j];
                if ("_astname" in subvalue) {
                    resultList.push(subvalue);
                }
            }
        }
    }
    return resultList;
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

NodeVisitor.prototype.walk = function(node) {
    var resultList = [node];
    var childList = iter_child_nodes(node);
    for (var i = 0; i < childList.length; i += 1) {
        var child = childList[i];
        resultList.concat(this.walk(child));
    }
    return resultList;
}

NodeVisitor.prototype.visitList = function(nodes) {
    for (var j = 0; j < nodes.length; j += 1) {
        var node = nodes[j];
        if ("_astname" in node) {
            this.visit(node);
        }
    }
}

NodeVisitor.prototype.generic_visit = function(node) {
    /** Called if no explicit visitor function exists for a node. **/
    var fieldList = iter_fields(node);
    for (var i = 0; i < fieldList.length; i += 1) {
        var field = fieldList[i][0], value = fieldList[i][1];
        if (value === null) {
            continue;
        }
        if (Array === value.constructor) {
            for (var j = 0; j < value.length; j += 1) {
                var subvalue = value[j];
                if (subvalue instanceof Object && "_astname" in subvalue) {
                    this.visit(subvalue);
                }
            }
        } else if (value instanceof Object && "_astname" in value) {
            this.visit(value);
        }
    }
}

NodeVisitor.prototype.recursive_walk = function(node) {
    var todo = [node];
    var result = [];
    while (todo.length > 0) {
        node = todo.shift();
        todo = todo.concat(iter_child_nodes(node))
        result.push(node);
    }
    return result;
}

/*
function CodeAnalyzer() {
    NodeVisitor.apply(this, Array.prototype.slice.call(arguments));
    this.id = 0;
};

CodeAnalyzer.prototype = new NodeVisitor();
CodeAnalyzer.prototype.visit = function(node) {
    node._id = this.id;
    this.id += 1;
    NodeVisitor.prototype.visit.call(this, node);
    //console.log(node);
}
*/

/*
CodeAnalyzer.prototype.visit_Num = function(node) {
    node._id = this.id;
    this.id += 1;
    console.log(node.n.v);
    // NodeVisitor.prototype.visit_Num.call(this, node);
};*/

//console.log((new NodeVisitor()).visit(ast));

