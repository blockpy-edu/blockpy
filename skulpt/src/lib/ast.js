var $builtinmodule = function (name) {
    var mod = {};
    
    /**
     * Consumes an AST Node (JS version). Return a list of tuples of 
     * ``(fieldname, value)`` for each field in ``node._fields`` that is
     * present on *node*.
     */
    var iter_fieldsJs = function(node) {
        var fieldList = [];
        for (var i = 0; i < node._fields.length; i += 2) {
            var field = node._fields[i];
            if (field in node) {
                fieldList.push([field, node[field]]);
            }
        }
        return fieldList;
    }
    
    mod.iter_fields = function(node) {
        var fieldList = [];
        for (var i = 0; i < node._fields.length; i += 2) {
            var field = node._fields[i];
            var value = Sk.ffi.remapToPy(node[field]);
            if (field in node) {
                var item = Sk.builtin.tuple([Sk.builtin.str(field), value]);
                fieldList.push(item);
            }
        }
        return Sk.builtin.list(fieldList);
    };

    var iter_child_nodesJS = function(node) {
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
    
    mod.iter_child_nodes = function(node) {
        
    }

    NodeVisitor = function($gbl, $loc) {
        // Takes in Python Nodes, not JS Nodes
        $loc.visit = function(node) {
            /** Visit a node. **/
            var method_name = 'visit_' + node._astname;
            if (method_name in $loc) {
                return $loc[method_name](node);
            } else {
                return $loc.generic_visit(node);
            }
        }
        $loc.walk = function(node) {
            
        }
    }
    mod.NodeVisitor = Sk.misceval.buildClass(mod, NodeVisitor, "NodeVisitor", []);

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
    
    AST = function($gbl, $loc) {
        var copyFromJsNode = function(self, key, jsNode) {
            if (key in self.jsNode) {
                Sk.abstr.sattr(self, key, Sk.ffi.remapToPy(jsNode[key]), true);
            }
        }
        $loc.__init__ = new Sk.builtin.func(function (self, jsNode) {
            self.jsNode = jsNode;
            self.astname = jsNode._astname;
            var fieldListJs = iter_fieldsJs(jsNode);
            var _fields = [];
            for (var i = 0; i < fieldListJs.length; i += 1) {
                var field = fieldListJs[i][0], value = fieldListJs[i][1];
                if (value === null) {
                    value = Sk.builtin.none.none$;
                } else if (Array === value.constructor) {
                    subvalues = [];
                    for (var j = 0; j < value.length; j += 1) {
                        var subvalue = value[j];
                        var constructorName = functionName(subvalue.constructor);
                        if (subvalue instanceof Object && "_astname" in subvalue) {
                            subvalue = Sk.misceval.callsim(mod[constructorName], subvalue);
                            subvalues.push(subvalue);
                        }
                        // No AST nodes have primitive list values, just
                        //  lists of AST nodes
                    }
                    value = Sk.builtin.list(subvalues);
                } else if (value instanceof Object && "_astname" in value) {
                    var constructorName = functionName(value.constructor)
                    value = Sk.misceval.callsim(mod[constructorName], value);
                } // Else already a Python value
                Sk.abstr.sattr(self, field, value, true);
                _fields.push(Sk.builtin.tuple([Sk.builtin.str(field), value]));
            }
            Sk.abstr.sattr(self, '_fields', Sk.builtin.list(_fields), true);
            copyFromJsNode(self, 'lineno', self.jsNode);
            copyFromJsNode(self, 'col_offset', self.jsNode);
            copyFromJsNode(self, 'endlineno', self.jsNode);
            copyFromJsNode(self, 'col_endoffset', self.jsNode);
        });
        $loc.__str__ = new Sk.builtin.func(function (self) {
            return Sk.builtin.str("<_ast."+self.astname+" object>");
        });
        $loc.__repr__ = $loc.__str__;
    }
    mod.AST = Sk.misceval.buildClass(mod, AST, "AST", []);
    
    mod.parse = function parse(source, filename) {
        if (filename === undefined) {
            filename = '<unknown>';
        }
        var parse = Sk.parse(filename, Sk.ffi.remapToJs(source));
        ast = Sk.astFromParse(parse.cst, filename, parse.flags);
        return Sk.misceval.callsim(mod.Module, ast);
        // Walk tree and create nodes (lazily?)
    }
    
    /*
    mod.Module = function ($gbl, $loc) {
        Sk.abstr.superConstructor(mod.OrderedDict, this, items);
    }*/
    
    function functionName(fun) {
        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    }
    
    var INHERITANCE_MAP = {
        'mod': [Module, Interactive, Expression, Suite],
        'stmt': [FunctionDef, ClassDef, Return_,
                  Delete_, Assign, AugAssign,
                  For_, While_, If_, With_,
                  Raise, TryExcept, TryFinally, Assert,
                  Import_, ImportFrom, Exec, Global, Expr, 
                  Pass, Break_, Continue_, Debugger_],
        'expr': [BoolOp, BinOp, UnaryOp, Lambda, IfExp,
                 Dict, Set, ListComp, SetComp, DictComp,
                 GeneratorExp, Yield, Compare, Call, Repr,
                 Num, Str, Attribute, Subscript, Name, List, Tuple],
        'expr_context': [Load, Store, Del, AugLoad, AugStore, Param],
        'slice': [Ellipsis, Slice, ExtSlice, Index],
        'boolop': [And, Or],
        'operator': [Add, Sub, Mult, Div, Mod, Pow, LShift,
                     RShift, BitOr, BitXor, BitAnd, FloorDiv],
        'unaryop': [Invert, Not, UAdd, USub],
        'cmpop': [Eq, NotEq, Lt, LtE, Gt, GtE, Is, IsNot, In_, NotIn],
        'comprehension': [],
        'excepthandler': [ExceptHandler],
        'arguments_': [],
        'keyword': [],
        'alias': []
    };
    
    for (var base in INHERITANCE_MAP) {
        var baseClass = function($gbl, $loc) { return this;};
        mod[base] = Sk.misceval.buildClass(mod, baseClass, base, [mod.AST]);
        for (var i=0; i < INHERITANCE_MAP[base].length; i++) {
            var nodeType = INHERITANCE_MAP[base][i];
            var nodeName = functionName(nodeType);
            var nodeClass = function($gbl, $loc) { return this;};
            mod[nodeName] = Sk.misceval.buildClass(mod, nodeClass, nodeName, [mod[base]])
        }
    }
    
    return mod;
};