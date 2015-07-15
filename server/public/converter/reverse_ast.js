    
/* ----- expr_context ----- */
function expr_context() {
}
expr_context.prototype.Load = function() {}
expr_context.prototype.Store = function() {}
expr_context.prototype.Del = function() {}
expr_context.prototype.AugLoad = function() {}
expr_context.prototype.AugStore = function() {}
expr_context.prototype.Param = function() {}

/* ----- boolop ----- */
function boolop() {
}
boolop.prototype.And = function() {}
boolop.prototype.Or = function() {}

/* ----- operator ----- */
function operator() {
}
operator.prototype.Add = function() {}
operator.prototype.Sub = function() {}
operator.prototype.Mult = function() {}
operator.prototype.Div = function() {}
operator.prototype.Mod = function() {}
operator.prototype.Pow = function() {}
operator.prototype.LShift = function() {}
operator.prototype.RShift = function() {}
operator.prototype.BitOr = function() {}
operator.prototype.BitXor = function() {}
operator.prototype.BitAnd = function() {}
operator.prototype.FloorDiv = function() {}

/* ----- unaryop ----- */
function unaryop() {
}
unaryop.prototype.Invert = function() {}
unaryop.prototype.Not = function() {}
unaryop.prototype.UAdd = function() {}
unaryop.prototype.USub = function() {}

/* ----- cmpop ----- */
function cmpop() {
}
cmpop.prototype.Eq = function() {}
cmpop.prototype.NotEq = function() {}
cmpop.prototype.Lt = function() {}
cmpop.prototype.LtE = function() {}
cmpop.prototype.Gt = function() {}
cmpop.prototype.GtE = function() {}
cmpop.prototype.Is = function() {}
cmpop.prototype.IsNot = function() {}
cmpop.prototype.In_ = function() {}
cmpop.prototype.NotIn = function() {}

function ReverseAST(source) {
    this.source = source;
    this.expr_context = new expr_context();
    this.boolop = new boolop();
    this.operator = new operator();
    this.unaryop = new unaryop();
    this.cmpop = new cmpop();
}

ReverseAST.prototype.identifier = function(node) {
    return Sk.ffi.remapToJs(node);
}

ReverseAST.prototype.recursiveMeasure = function(node, nextBlockLine) {
    if (node === undefined)  {
        return;
    }
    var myNext = nextBlockLine;
    if ("orelse" in node && node.orelse.length > 0) {
        if (node.orelse.length == 1 && node.orelse[0].constructor.name == "If_") {
            myNext = node.orelse[0].lineno-1;
        } else {
            myNext = node.orelse[0].lineno-1-1;
        }
    }
    this.heights.push(nextBlockLine);
    if ("body" in node) {
        for (var i = 0; i < node.body.length; i++) {
            var next;
            if (i+1 == node.body.length) {
                next = myNext;
            } else {
                next = node.body[i+1].lineno-1;
            }
            this.recursiveMeasure(node.body[i], next);
        }
    }
    if ("orelse" in node) {
        for (var i = 0; i < node.orelse.length; i++) {
            var next;
            if (i == node.orelse.length) {
                next = nextBlockLine;
            } else {
                next = 1+(node.orelse[i].lineno-1);
            }
            this.recursiveMeasure(node.orelse[i], next);
        }
    }
}

ReverseAST.prototype.measureNode = function(node) {
    this.heights = [];
    this.recursiveMeasure(node, this.source.length-1);
    this.heights.shift();
}

ReverseAST.prototype.getSourceCode = function(from, to) {
    var lines = this.source.slice(from-1, to);
    // Strip out any starting indentation.
    if (lines.length > 0) {
        var indentation = lines[0].search(/\S/);
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].substring(indentation);
        }
    }
    return lines.join("\n");
}

ReverseAST.prototype.convertBody = function(node)
{
    // Empty body. Boring!
    if (node.length == 0) {
        return null;
    }
    
    // This is tricked by semicolons. Hard to get around that...
    // TODO: Force semicolon breaks in a preprocessor, and extract comments too
    
    // Build the actual blocks
    var from = node[0].lineno;
    var to = this.heights.shift();
    var firstChild = this.convertStatement(node[0], this.getSourceCode(from, to)); // XML Block
    var currentChild = firstChild;
    for (var i = 1; i < node.length; i++) {
        from = node[i].lineno;
        to = this.heights.shift();
        var newChild = this.convertStatement(node[i], this.getSourceCode(from, to));
        if (newChild !== null) {
            var nextElement = document.createElement("next");
            nextElement.appendChild(newChild);
            if (currentChild !== null) {
                if (firstChild === null) {
                    firstChild = currentChild;
                }
                currentChild.appendChild(nextElement);
            } else if (firstChild === null) {
                firstChild = newChild;
            }
            currentChild = newChild;
        }
    }
    return firstChild;
}

function block(type, fields, values, settings, mutations, statements) {
    var newBlock = document.createElement("block");
    // Settings
    newBlock.setAttribute("type", type);
    for (var setting in settings) {
        var settingValue = settings[setting];
        newBlock.setAttribute(setting, settingValue);
    }
    // Mutations
    if (mutations !== undefined && Object.keys(mutations).length > 0) {
        var newMutation = document.createElement("mutation");
        for (var mutation in mutations) {
            var mutationValue = mutations[mutation];
            if (mutation.charAt(0) == '@') {
                newMutation.setAttribute(mutation.substr(1), mutationValue);
            } else if (mutationValue.constructor === Array) {
                for (var i = 0; i < mutationValue.length; i++) {
                    var mutationNode = document.createElement(mutation);
                    mutationNode.setAttribute("name", mutationValue[i]);
                    newMutation.appendChild(mutationNode);
                }
            } else {
                var mutationNode = document.createElement("arg");
                mutationNode.setAttribute("name", mutation);
                mutationNode.appendChild(mutationValue);
                newMutation.appendChild(mutationNode);
            }
        }
        newBlock.appendChild(newMutation);
    }
    // Fields
    for (var field in fields) {
        var fieldValue = fields[field];
        var newField = document.createElement("field");
        newField.setAttribute("name", field);
        newField.appendChild(document.createTextNode(fieldValue));
        newBlock.appendChild(newField);
    }
    // Values
    for (var value in values) {
        var valueValue = values[value];
        var newValue = document.createElement("value");
        newValue.setAttribute("name", value);
        newValue.appendChild(valueValue);
        newBlock.appendChild(newValue);
    }
    // Statements
    if (statements !== undefined && Object.keys(statements).length > 0) {
        for (var statement in statements) {
            var statementValue = statements[statement];
            var newStatement = document.createElement("statement");
            newStatement.setAttribute("name", statement);
            newStatement.appendChild(statementValue);
            newBlock.appendChild(newStatement);
        }
    }
    return newBlock;
}

raw_block = function(text) {
    return block("raw_block", { "TEXT": text });
}

ReverseAST.prototype.convert = function(node) {
    return this[node.constructor.name](node);
}

ReverseAST.prototype.convertStatement = function(node, full_source) {
    try {
        return this.convert(node);
    } catch (e) {
        console.error(e);
        return raw_block(full_source);
    }
}

/* ----- Nodes ---- */
/*
 * NO LINE OR COLUMN NUMBERS
 * Module
 * body: asdl_seq
 */
ReverseAST.prototype.Module = function(node)
{
    return this.convertBody(node.body);
}

/*
 * NO LINE OR COLUMN NUMBERS
 * Interactive
 * body: asdl_seq
 */
ReverseAST.prototype.Interactive = function(body)
{
    return this.convertBody(node.body);
}

/*
 * NO LINE OR COLUMN NUMBERS
 * TODO
 * body: expr_ty
 */
ReverseAST.prototype.Expression = function(body)
{
    this.body = body;
}

/*
 * NO LINE OR COLUMN NUMBERS
 *
 * body: asdl_seq
 */
ReverseAST.prototype.Suite = function(body)
{
    this.asdl_seq(node.body);
}

/*
 *
 * name: identifier
 * args: arguments__ty
 * body: asdl_seq
 * decorator_list: asdl_seq
 */
ReverseAST.prototype.FunctionDef = function(node)
{
    var name = node.name;
    var args = node.args;
    var body = node.body;
    var decorator_list = node.decorator_list;
    if (decorator_list.length > 0) {
        throw new Error("Decorators are not implemented.");
    }
    return block("procedures_defnoreturn", {
        "NAME": this.identifier(name)
    }, {
    }, {
        "inline": "false"
    }, {
        "args": this.arguments_(args)
    }, {
        "STACK": this.convertBody(body)
    });
}

/*
 * name: identifier
 * args: arguments__ty
 * bases: asdl_seq
 * body: asdl_seq
 * decorator_list: asdl_seq
 */
ReverseAST.prototype.ClassDef = function(node)
{
    this.name = name;
    this.bases = bases;
    this.body = body;
    this.decorator_list = decorator_list;
    throw new Error("Not implemented");
}

/*
 * value: expr_ty
 *
 */
ReverseAST.prototype.Return_ = function(node)
{
    var value = node.value;
    // No field, one title, one setting
    return block("procedures_return", {}, {
        "VALUE": this.convert(value)
    }, {
        "inline": "false"
    });
}

/*
 * targets: asdl_seq
 *
 */
ReverseAST.prototype.Delete_ = function(/* {asdl_seq *} */ targets)
{
    this.targets = targets;
    // TODO
    throw new Error("Delete is not implemented");
}

/*
 * targets: asdl_seq
 * value: expr_ty
 */
ReverseAST.prototype.Assign = function(node)
{
    var targets = node.targets;
    var value = node.value;
    if (targets.length == 0) {
        throw new Error("Nothing to assign to!");
    } else if (targets.length == 1) {
        return block("variables_set", {
            "VAR": this.Name_str(targets[0]) //targets
        }, {
            "VALUE": this.convert(value)
        });
    } else {
        //TODO
        throw new Error("Multiple Assigment Targets Not implemented");
    }
}

/*
 * target: expr_ty
 * op: operator_ty
 * value: expr_ty
 */
ReverseAST.prototype.AugAssign = function(node)
{
    var target = node.target;
    var op = node.op;
    var value = node.value;
    if (op.name != "Add") {
        //TODO
        throw new Error("Only addition is currently supported for augmented assignment!");
    } else {
        return block("math_change", {
            "VAR": this.Name_str(target)
        }, {
            "DELTA": this.convert(value)
        });
    }
}

/*
 * dest: expr_ty
 * values: asdl_seq
 * nl: bool
 *
 */
ReverseAST.prototype.Print = function(node)
{
    var dest = node.dest;
    var values = node.values;
    var nl = node.nl;
    
    if (values.length == 1) {
        return block("text_print", {}, {
            "TEXT": this.convert(values[0])
        });
    } else {
        return block("text_print_multiple", {}, 
            this.convertElements("PRINT", values), 
        {
            "inline": "true"
        }, {
            "@items": values.length
        });
    }
}

/*
 * target: expr_ty
 * iter: expr_ty
 * body: asdl_seq
 * orelse: asdl_seq
 *
 */
ReverseAST.prototype.For_ = function(node) {
    var target = node.target;
    var iter = node.iter;
    var body = node.body;
    var orelse = node.orelse;
    
    if (orelse.length > 0) {
        // TODO
        throw new Error("Or-else block of For is not implemented.");
    }
    
    return block("controls_forEach", {
        "VAR": this.Name_str(target)
    }, {
        "LIST": this.convert(iter)
    }, {
        "inline": "false"
    }, {}, {
        "DO": this.convertBody(body)
    });
}

/*
 * test: expr_ty
 * body: asdl_seq
 * orelse: asdl_seq
 */
ReverseAST.prototype.While_ = function(node) {
    var test = node.test;
    var body = node.body;
    var orelse = node.orelse;
    if (orelse.length > 0) {
        // TODO
        throw new Error("Or-else block of While is not implemented.");
    }
    return block("controls_while", {}, {
        "BOOL": this.convert(test)
    }, {}, {}, {
        "DO": this.convertBody(body)
    });
}

/*
 * test: expr_ty
 * body: asdl_seq
 * orelse: asdl_seq
 *
 */
ReverseAST.prototype.If_ = function(node)
{
    var test = node.test;
    var body = node.body;
    var orelse = node.orelse;
    
    var IF_values = {"IF0": this.convert(test)};
    var DO_values = {"DO0": this.convertBody(body)};
    
    var elseifCount = 0;
    var elseCount = 0;
    var potentialElseBody = null;
    
    // Handle weird orelse stuff
    if (orelse !== undefined) {
        if (orelse.length == 1 && orelse[0].constructor.name == "If_") {
            // This is an 'ELIF'
            while (orelse.length == 1  && orelse[0].constructor.name == "If_") {
                this.heights.shift();
                elseifCount += 1;
                body = orelse[0].body;
                test = orelse[0].test;
                orelse = orelse[0].orelse;
                DO_values["DO"+elseifCount] = this.convertBody(body);
                if (test !== undefined) {
                    IF_values["IF"+elseifCount] = this.convert(test);
                }
            }
        }
        if (orelse !== undefined && orelse.length > 0) {
            // Or just the body of an Else statement
            elseCount += 1;
            DO_values["ELSE"] = this.convertBody(orelse);
        }
    }
    
    return block("controls_if", {
    }, IF_values, {
        "inline": "false"
    }, {
        "@elseif": elseifCount,
        "@else": elseCount
    }, DO_values);
}

/*
 * context_expr: expr_ty
 * optional_vars: expr_ty
 * body: asdl_seq
 */
ReverseAST.prototype.With_ = function(node)
{
    var context_expr = node.context_expr;
    var optional_vars = node.optional_vars;
    var body = node.body;
    throw new Error("With_ not implemented");
}

/*
 * type: expr_ty
 * inst: expr_ty
 * tback: expr_ty
 */
ReverseAST.prototype.Raise = function(node)
{
    var type = node.type;
    var inst = node.inst;
    var tback = node.tback;
    throw new Error("Raise not implemented");
}

/*
 * body: asdl_seq
 * handlers: asdl_seq
 * orelse: asdl_seq
 *
 */
ReverseAST.prototype.TryExcept = function(node)
{
    var body = node.body;
    var handlers = node.handlers;
    var orelse = node.orelse;
    throw new Error("TryExcept not implemented");
}

/*
 * body: asdl_seq
 * finalbody: asdl_seq
 *
 */
ReverseAST.prototype.TryFinally = function(node)
{
    var body = node.body;
    var finalbody = node.finalbody;
    throw new Error("TryExcept not implemented");
}

/*
 * test: expr_ty
 * msg: expr_ty
 */
ReverseAST.prototype.Assert = function(node)
{
    var test = node.test;
    var msg = node.msg;
    throw new Error("Assert not implemented");
}

/*
 * names: asdl_seq
 *
 */
ReverseAST.prototype.Import_ = function(node)
{
    var names = node.names;
    // The import statement isn't used in blockly because it happens implicitly
    return null;
}

/*
 * module: identifier
 * names: asdl_seq
 * level: int
 *
 */
ReverseAST.prototype.ImportFrom = function(node)
{
    var module = node.module;
    var names = node.names;
    var level = node.level;
    // The import statement isn't used in blockly because it happens implicitly
    return null;
}

/*
 * body: expr_ty
 * globals: expr_ty
 * locals: expr_ty
 *
 */
ReverseAST.prototype.Exec = function(node) {
    var body = node.body;
    var globals = node.globals;
    var locals = node.locals;
    throw new Error("Exec not implemented");
}

/*
 * names: asdl_seq
 *
 */
ReverseAST.prototype.Global = function(node)
{
    var names = node.names;
    throw new Error("Globals not implemented");
}

/*
 * value: expr_ty
 *
 */
ReverseAST.prototype.Expr = function(node) {
    var value = node.value;
    
    var converted = this.convert(value);
    if (converted.constructor == Array) {
        return converted[0];
    } else {
        return block("raw_empty", {}, {
            "VALUE": this.convert(value)
        });
    }
}

/*
 *
 *
 */
ReverseAST.prototype.Pass = function() {
    return block("controls_pass");
}

/*
 *
 *
 */
ReverseAST.prototype.Break_ = function() {
    return block("controls_flow_statements", {
        "FLOW": "BREAK"
    });
}

/*
 *
 *
 */
ReverseAST.prototype.Continue_ = function() {
    return block("controls_flow_statements", {
        "FLOW": "CONTINUE"
    });
}

/*
 * TODO: what does this do?
 *
 */
ReverseAST.prototype.Debugger_ = function() {
    return null;
}

ReverseAST.prototype.booleanOperator = function(op) {
    switch (op.name) {
        case "And": return "AND";
        case "Or": return "OR";
        default: throw new Error("Operator not supported:"+op.name);
    }
}

/*
 * op: boolop_ty
 * values: asdl_seq
 */
ReverseAST.prototype.BoolOp = function(node) {
    var op = node.op;
    var values = node.values;
    // TODO: is there ever a case where it's != 2 values?
    return block("logic_operation", {
        "OP": this.booleanOperator(op)
    }, {
        "A": this.convert(values[0]),
        "B": this.convert(values[1])
    }, {
        "inline": "true"
    });
}

ReverseAST.prototype.binaryOperator = function(op) {
    switch (op.name) {
        case "Add": return "ADD";
        case "Sub": return "MINUS";
        case "Div": case "FloorDiv": return "DIVIDE";
        case "Mult": return "MULTIPLY";
        case "Pow": return "POWER";
        case "Mod": return "MODULO";
        default: throw new Error("Operator not supported:"+op.name);
    }
}

/*
 * left: expr_ty
 * op: operator_ty
 * right: expr_ty
 */
ReverseAST.prototype.BinOp = function(node)
{
    var left = node.left;
    var op = node.op;
    var right = node.right;
    return block("math_arithmetic", {
        "OP": this.binaryOperator(op) // TODO
    }, {
        "A": this.convert(left),
        "B": this.convert(right)
    }, {
        "inline": true
    });
}

/*
 * op: unaryop_ty
 * operand: expr_ty
 */
ReverseAST.prototype.UnaryOp = function(node)
{
    var op = node.op;
    var operand = node.operand;
    if (op.name == "Not") {
        return block("logic_negate", {}, {
            "BOOL": this.convert(operand) 
        }, {
            "inline": "false"
        });
    } else {
        throw new Error("Other unary operators are not implemented yet.");
    }
}

/*
 * args: arguments__ty
 * body: expr_ty
 */
ReverseAST.prototype.Lambda = function(node) {
    var args = node.args;
    var body = node.body;
    throw new Error("Lambda functions are not implemented yet.");
}

/*
 * test: expr_ty
 * body: expr_ty
 * orelse: expr_ty
 */
ReverseAST.prototype.IfExp = function(node)
{
    var test = node.test;
    var body = node.body;
    var orelse = node.orelse;
    throw new Error("Inline IF expressions are not implemented yet.");
}

/*
 * keys: asdl_seq
 * values: asdl_seq
 */
ReverseAST.prototype.Dict = function(node) {
    var keys = node.keys;
    var values = node.values;
    
    var keyList = [];
    var valueList = [];
    for (var i = 0; i < keys.length; i+= 1) {
        if (keys[i].constructor.name != "Str") {
            throw new Error("Dictionary Keys should be Strings.");
        }
        keyList["KEY"+i] = this.Str_value(keys[i]);
        valueList["VALUE"+i] = this.convert(values[i]);
    }
    
    return block("dicts_create_with", keyList, valueList, {
        "inline": "false"
    }, {
        "@items": keys.length
    });
}

/*
 * elts: asdl_seq
 *
 */
ReverseAST.prototype.Set = function(node)
{
    var elts = node.elts;
    throw new Error("Sets are not implemented");
}

/*
 * elt: expr_ty
 * generators: asdl_seq
 */
ReverseAST.prototype.ListComp = function(node)
{
    var elt = node.elt;
    var generators = node.generators;
    throw new Error("List Comprehensions are not implemented"); 
}

/*
 * elt: expr_ty
 * generators: asdl_seq
 */
ReverseAST.prototype.SetComp = function(node)
{
    var elt = node.elt;
    var generators = node.generators;
    throw new Error("Set Comprehensions are not implemented"); 
}

/*
 * key: expr_ty
 * value: expr_ty
 * generators: asdl_seq
 */
ReverseAST.prototype.DictComp = function(node)
{
    var key = node.key;
    var value = node.value;
    var generators = node.generators;
    throw new Error("Dictionary Comprehensions are not implemented"); 
}

/*
 * elt: expr_ty
 * generators: asdl_seq
 */
ReverseAST.prototype.GeneratorExp = function(node) {
    var elt = node.elt;
    var generators = node.generators;
    throw new Error("Generator Expresions are not implemented"); 
}

/*
 * value: expr_ty
 *
 */
ReverseAST.prototype.Yield = function(node)
{
    var value = value;
    throw new Error("Yield expression is not implemented");
}


ReverseAST.prototype.compareOperator = function(op) {
    switch (op.name) {
        case "Eq": return "EQ";
        case "NotEq": return "NEQ";
        case "Lt": return "LT";
        case "Gt": return "GT";
        case "LtE": return "LTE";
        case "GtE": return "GTE";
        case "In": return "IN";
        case "NotIn": return "NOTIN";
        // Is, IsNot, In, NotIn
        default: throw new Error("Operator not supported:"+op.name);
    }
}

/*
 * left: expr_ty
 * ops: asdl_int_seq
 * asdl_seq: comparators
 */
ReverseAST.prototype.Compare = function(node)
{
    var left = node.left;
    var ops = node.ops;
    var comparators = node.comparators;
    
    if (ops.length != 1) {
        throw new Error("Only one comparison operator is supported");
    } else if (ops[0].name == "In" || ops[0].name == "NotIn") {
        return block("logic_isIn", {
            "OP": this.compareOperator(ops[0])
        }, {
            "ITEM": this.convert(left),
            "LIST": this.convert(comparators[0])
        }, {
            "inline": "true"
        });
    } else {
        return block("logic_compare", {
            "OP": this.compareOperator(ops[0])
        }, {
            "A": this.convert(left),
            "B": this.convert(comparators[0])
        }, {
            "inline": "true"
        });
    }
    
}

convertStockSymbols = function(symbol) {
    switch (symbol) {
        case 'FB': case "Facebook":
            return "Facebook";
        case "AAPL": case "Apple":
            return "Apple";
        case "MSFT": case "Microsoft":
            return "Microsoft";
        case "GOOG": case "Google":
            return "Google";
        default:
            throw new Error("Unknown Stock Symbol.");
    }
}

toTitleCase = function(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
            
ReverseAST.prototype.KNOWN_MODULES = {
    "weather": {
        "get_temperature": ["weather_temperature", "CITY"],
        "get_report": ["weather_report", "CITY"],
        "get_forecasts": ["weather_forecasts", "CITY"],
        "get_highs_lows": ["weather_highs_lows", "CITY"],
        "get_all_forecasted_temperatures": ["weather_all_forecasts"],
        "get_forecasted_reports": ["weather_report_forecasts", "CITY"]
    }, 
    "earthquakes": {
        "get": ["earthquake_get", "PROPERTY"],
        "get_both": ["earthquake_both"],
        "get_all": ["earthquake_all"]
    },
    "stocks": {
        "get_current": ["stocks_current", ["TICKER", convertStockSymbols]],
        "get_past": ["stocks_past", ["TICKER", convertStockSymbols]]
    },
    "crime": {
        // STATE = toTitleCase
        "get_property_crimes": ["crime_state", ["STATE", toTitleCase],
                                              ["TYPE", "property"]],
        "get_violent_crimes": ["crime_state",  ["STATE", toTitleCase],
                                              ["TYPE", "violent"]],
        "get_by_year": ["crime_year", "YEAR"],
        "get_all": ["crime_all"]
    },
    "books": {
        "get_all": ["books_get"]
    },
    "plt": {
        "title": ["*plot_title", "TEXT"],
        "show": ["*plot_show"]
    }
};
ReverseAST.prototype.KNOWN_FUNCTIONS = ["append", "strip", "rstrip", "lstrip"];
ReverseAST.prototype.CallAttribute = function(func, args, keywords, starargs, kwargs) {
    var name = this.identifier(func.attr);
    if (func.value.constructor.name == "Name") {
        var module = this.identifier(func.value.id);
        if (module == "plt" && name == "plot") {
            if (args.length == 1) {
                return [block("plot_line", {}, {
                    "y_values": this.convert(args[0])
                }, {"inline": "false"})];
            } else if (args.length == 2) {
                return [block("plot_lineXY", {}, {
                    "x_values": this.convert(args[0]),
                    "y_values": this.convert(args[1])
                }, {"inline": "false"})];
            } else {
                throw new Error("Incorrect number of arguments to plt.plot");
            }
        } else if (module in this.KNOWN_MODULES && name in this.KNOWN_MODULES[module]) {
            var definition = this.KNOWN_MODULES[module][name];
            var blockName = definition[0];
            var isExpression = true;
            if (blockName.charAt(0) == "*") {
                blockName = blockName.slice(1);
                isExpression = false;
            }
            var fields = {};
            for (var i = 0; i < args.length; i++) {
                var argument = definition[1+i];
                if (typeof argument ==  "string") {
                    fields[argument] = this.Str_value(args[i]);
                } else {
                    var argumentName = argument[0];
                    var argumentMapper = argument[1];
                    fields[argumentName] = argumentMapper(this.Str_value(args[i]));
                }
            }
            for (var i = 1+args.length; i < definition.length; i++) {
                var first = definition[i][0];
                var second = definition[i][1];
                fields[first] = second;
            }
            if (isExpression) {
                return block(blockName, fields);
            } else {
                return [block(blockName, fields)];
            }
        }
    } 
    if (this.KNOWN_FUNCTIONS.indexOf(name) > -1) {
        switch (name) {
            case "append":
                if (args.length !== 1) {
                    throw new Error("Incorrect number of arguments to .append");
                }
                // Return as statement
                return [block("lists_append", {}, {
                    "ITEM": this.convert(args[0]),
                    "LIST": this.convert(func.value)
                }, {
                    "inline": "true"
                })];
            case "strip":
                return block("text_trim", { "MODE": "BOTH" }, 
                    { "TEXT": this.convert(func.value) });
            case "lstrip":
                return block("text_trim", { "MODE": "LEFT" }, 
                    { "TEXT": this.convert(func.value) });
            case "rstrip":
                return block("text_trim", { "MODE": "RIGHT" }, 
                    { "TEXT": this.convert(func.value) });
            default: throw new Error("Unknown function call!");
        }
    } else {
        console.log(func, args, keywords, starargs, kwargs);
        throw new Error("Unknown function call or not implemented");
    }
}

/*
 * func: expr_ty
 * args: asdl_seq
 * keywords: asdl_seq
 * starargs: expr_ty
 * kwargs: expr_ty
 *
 */
ReverseAST.prototype.Call = function(node) {
    var func = node.func;
    var args = node.args;
    var keywords = node.keywords;
    var starargs = node.starargs;
    var kwargs = node.kwargs;
    
    switch (func.constructor.name) {
        case "Name":
            if (starargs !== null && starargs.length > 0) {
                throw new Error("*args (variable arguments) are not implemented yet.");
            } else if (kwargs !== null && kwargs.length > 0) {
                throw new Error("**args (keyword arguments) are not implemented yet.");
            }
            var arguments = {};
            var argumentsMutation = {"@name": this.identifier(func.id)};
            for (var i = 0; i < args.length; i+= 1) {
                arguments["ARG"+i] = this.convert(args[i]);
                argumentsMutation[i] = this.convert(args[i]);
            }
            return block("procedures_callreturn", {}, arguments, {
                "inline": "false"
            }, argumentsMutation);
        // Direct function call
        case "Attribute":
        // Module function call
            return this.CallAttribute(func, args, keywords, starargs, kwargs);
    }
}

/*
 * value: expr_ty
 *
 */
ReverseAST.prototype.Repr = function(node)
{
    var value = node.value;
    throw new Error("Repr is not yet implemented");
}

/*
 * n: object
 *
 */
ReverseAST.prototype.Num = function(node)
{
    var n = node.n;
    return block("math_number", {"NUM": Sk.ffi.remapToJs(n)});
}

/*
 * s: string
 *
 */
ReverseAST.prototype.Str = function(node)
{
    var s = node.s;
    return block("text", {"TEXT": Sk.ffi.remapToJs(s)});
}

ReverseAST.prototype.Str_value = function(node) {
    var s = node.s;
    return Sk.ffi.remapToJs(s);
}

/*
 * value: expr_ty
 * attr: identifier
 * ctx: expr_context_ty
 *
 */
ReverseAST.prototype.Attribute = function(node)
{
    var value = node.value;
    var attr = node.attr;
    var ctx = node.ctx;
    
    throw new Error("Attribute access not implemented");
}

/*
 * value: expr_ty
 * slice: slice_ty
 * ctx: expr_context_ty
 *
 */
ReverseAST.prototype.Subscript = function(node)
{
    var value = node.value;
    var slice = node.slice;
    var ctx = node.ctx;
    
    if (slice.value.constructor.name !== "Str") {
        throw new Error("Currently, dictionary access only works for strings!");
    }
    
    return block("dict_get_literal", {
        "ITEM": this.Str_value(slice.value)
    }, {
        "DICT": this.convert(value)
    });
}

/*
 * id: identifier
 * ctx: expr_context_ty
 */
ReverseAST.prototype.Name = function(node)
{
    var id = node.id;
    var ctx = node.ctx;
    switch (this.Name_str(node)) {
        case "True":
            return block("logic_boolean", {"BOOL": "TRUE"});
        case "False":
            return block("logic_boolean", {"BOOL": "FALSE"});
        default:
            return block('variables_get', {
                "VAR": this.identifier(id)
            });
    }
}

/*
 * id: identifier
 * ctx: expr_context_ty
 */
ReverseAST.prototype.Name_str = function(node)
{
    var id = node.id;
    var ctx = node.ctx;
    return this.identifier(id);
}

ReverseAST.prototype.convertElements = function(key, values) {
    var output = {};
    for (var i = 0; i < values.length; i++) {
        output[key+i] = this.convert(values[i]);
    }
    return output;
}

/*
 * elts: asdl_seq
 * ctx: expr_context_ty
 *
 */
ReverseAST.prototype.List = function(node) {
    var elts = node.elts;
    var ctx = node.ctx;
    
    return block("lists_create_with", {}, 
        this.convertElements("ADD", elts)
    , {
        "inline": "false"
    }, {
        "@items": elts.length
    });
}

/*
 * elts: asdl_seq
 * ctx: expr_context_ty
 */
ReverseAST.prototype.Tuple = function(node)
{
    var elts = node.elts;
    var ctx = node.ctx;
    
    throw new Error("Tuples not implemented");
}

/*
 *
 *
 */
ReverseAST.prototype.Ellipsis = function() {
    throw new Error("Ellipsis not implemented");
}

/*
 * lower: expr_ty
 * upper: expr_ty
 * step: expr_ty
 *
 */
ReverseAST.prototype.Slice = function(node)
{
    var lower = node.lower;
    var upper = node.upper;
    var step = node.step;
    
    throw new Error("Slices not implemented");
}

/*
 * dims: asdl_seq
 *
 */
ReverseAST.prototype.ExtSlice = function(node)
{
    var dims = node.dims;
    
    throw new Error("ExtSlice is not implemented.");
}

/*
 * value: expr_ty
 *
 */
ReverseAST.prototype.Index = function(value)
{
    var value = node.value;
    
    throw new Error("Index is not implemented");
}

/*
 * target: expr_ty
 * iter: expr_ty
 * ifs: asdl_seq
 *
 */
ReverseAST.prototype.comprehension = function(node)
{
    var target = node.target;
    var iter = node.iter;
    var ifs = node.ifs;
    
    throw new Error("Comprehensions not implemented.");
}

/*
 * type: expr_ty
 * name: expr_ty
 * body: asdl_seq
 *
 */
ReverseAST.prototype.ExceptHandler = function(node)
{
    var type = node.type;
    var name = node.name;
    var body = node.boy;
    
    throw new Error("Except handlers are not implemented");
}

ReverseAST.prototype.argument_ = function(node) {
    var id = node.id;
    return this.identifier(id);
}

/*
 * args: asdl_seq
 * vararg: identifier
 * kwarg: identifier
 * defaults: asdl_seq
 *
 */
ReverseAST.prototype.arguments_ = function(node)
{
    var args = node.args;
    var vararg = node.vararg;
    var kwarg = node.kwarg;
    var defaults = node.defaults;
    
    var allArgs = [];
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        allArgs.push(this.argument_(arg));
    }
    return allArgs;
}

/*
 * arg: identifier
 * value: expr_ty
 *
 */
ReverseAST.prototype.keyword = function(node)
{
    var arg = node.arg;
    var value = node.value;
    
    throw new Error("Keywords are not implemented");
}

/*
 * name: identifier
 * asname: identifier
 *
 */
ReverseAST.prototype.alias = function(node)
{
    var name = node.name;
    var asname = node.asname;
    
    throw new Error("Aliases are not implemented");
}
