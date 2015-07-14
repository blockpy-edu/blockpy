/**
 * @license
 * Kennel
 *
 * Copyright 2015 Austin Cory Bart
 * https://github.com/RealTimeWeb/corgis-blockly
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
 /**
 * @fileoverview Core Library for Converting a Skulpt AST to a Blockly XML Tree
 * @author acbart@vt.edu (Austin Cory Bart)
 */
'use strict';

/**
 * @constructor 
 */
function PythonToBlocks() {
};

PythonToBlocks.prototype.raw_block = function(text) {
    var RawBlock = document.createElement("block");
    RawBlock.setAttribute("type", "raw_block");
    var Field = document.createElement("field");
    Field.setAttribute("name", "TEXT");
    Field.appendChild(document.createTextNode(text));
    RawBlock.appendChild(Field);
    return RawBlock;
}
PythonToBlocks.prototype._createRawExpression = function(body) {
    return this._createSimpleBlock("raw_expression", "TEXT", body.$r().v);
}
PythonToBlocks.prototype._createLogicBoolean = function(truth) {
    if (truth) {
        return this._createSimpleBlock("logic_boolean", "BOOL", "TRUE");
    } else {
        return this._createSimpleBlock("logic_boolean", "BOOL", "FALSE");
    }
}

PythonToBlocks.prototype._createString = function(value) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "text");
    var Field = document.createElement("field");
    Field.setAttribute("name", "TEXT");
    Field.appendChild(document.createTextNode(value.s.v));
    Raw.appendChild(Field);
    return Raw;
}

PythonToBlocks.prototype._createNone = function() {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "logic_null");
    Raw.setAttribute("inline", "false");
    return Raw;
}



var skulptToBlockly_logicOperations = function(op) {
    switch (op) {
        case "Eq": return "EQ";
        case "NotEq": return "NEQ";
        case "Lt": return "LT";
        case "Gt": return "GT";
        case "LtE": return "LTE";
        case "GtE": return "GTE";
        case "And": return "AND";
        case "Or": return "OR";
        // Is, IsNot, In, NotIn
        default: return "Error";
    }
}
var skulptToBlockly_mathArithmetic = function(op) {
    switch (op) {
        case "Add": return "ADD";
        case "Sub": return "MINUS";
        case "Div": case "FloorDiv": return "DIVIDE";
        case "Mult": return "MULTIPLY";
        case "Pow": return "POWER";
        case "Mod": return "MODULO";
        default: return "Error";
    }
}

PythonToBlocks.prototype.convertAugAssign_ = function(expression) {
    //math_change
    // TODO
    throw "Augmented Assignment is not currently supported.";
}

PythonToBlocks.prototype._createLogicCompare = function(expression) {
    return this._createBinaryBlock("logic_compare", "true", "OP",
                                   skulptToBlockly_logicOperations(expression.ops[0].name),
                                   this._convertExpression("", expression.left),
                                   this._convertExpression("", expression.comparators[0]))
}
PythonToBlocks.prototype._createBinOp = function(expression) {
    return this._createBinaryBlock("math_arithmetic", "true", "OP",
                                   skulptToBlockly_mathArithmetic(expression.op.name),
                                   this._convertExpression("", expression.left),
                                   this._convertExpression("", expression.right))
}
PythonToBlocks.prototype.createAppendBlock_ = function(func, args) {
    var Block_ = document.createElement("block");
    Block_.setAttribute("type", "lists_append");
    Block_.setAttribute("inline", "false");
    if (args.length === 1) {
        var ItemValue = document.createElement("value");
        ItemValue.setAttribute("name", "ITEM");
        ItemValue.appendChild(this._convertExpression("", args[0]));
        Block_.appendChild(ItemValue);
    } else {
        throw "Incorrect number of arguments to append";
    }
    var ListValue = document.createElement("value");
    ListValue.setAttribute("name", "LIST");
    ListValue.appendChild(this._convertExpression("", func.value));
    Block_.appendChild(ListValue);
    return Block_;
}
PythonToBlocks.prototype.createDictSubscript_ = function(expression) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "dict_get_literal");
    Raw.setAttribute("inline", "false");
    //console.log(expression.slice);
    if (expression.slice.value.constructor.name == "Str") {
        var ItemValue = document.createElement("field");
        ItemValue.setAttribute("name", "ITEM");
        //TODO: Handle Index
        ItemValue.appendChild(document.createTextNode(expression.slice.value.s.v));
        Raw.appendChild(ItemValue);
    } else {
        throw "Non-string indexes not supported yet";
    }
    var DictValue = document.createElement("value");
    DictValue.setAttribute("name", "DICT");
    DictValue.appendChild(this._convertExpression("", expression.value));
    Raw.appendChild(DictValue);
    return Raw;
}
PythonToBlocks.prototype._createLogicOperation = function(expression) {
    return this._createBinaryBlock("logic_operation", "true", "OP",
                                   skulptToBlockly_logicOperations(expression.op.name),
                                   this._convertExpression("", expression.values[0]),
                                   this._convertExpression("", expression.values[1]))
}
PythonToBlocks.prototype._createLogicNegate = function(expression) {
    return this._createUnaryBlock("logic_negate", "false", "BOOL",
                                  this._convertExpression("", expression.operand));
}

PythonToBlocks.prototype._createBuiltinBlock = function(type, fields) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", type);
    Raw.setAttribute("inline", "true");
    for (var i = 0; i < fields.length; i+= 1) {
        var name = fields[i][0],
            value = fields[i][1];
        var Field_ = document.createElement("field");
        Field_.setAttribute("name", name);
        Field_.appendChild(document.createTextNode(value));
        Raw.appendChild(Field_);
    }
    
    return Raw;
}

PythonToBlocks.prototype._createPlot = function(expression) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "plot_line");
    Raw.setAttribute("inline", "false");
    
    var Value_ = document.createElement("value");
    Value_.setAttribute("name", "y_values");
    Value_.appendChild(this._convertExpression("", expression.args[0]));
    Raw.appendChild(Value_);
    
    return Raw;
}

PythonToBlocks.prototype._createCallBlock = function(expression) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "procedures_callreturn");
    Raw.setAttribute("inline", "false");
    
    var Mutation = document.createElement("mutation");
    Mutation.setAttribute("name", expression.func.id.v);
    
    for (var i = 0; i < expression.args.length; i+= 1) {
        var Argument_ = document.createElement("arg");
        Argument_.setAttribute("name", "ARG"+i);
        Argument_.appendChild(this._convertExpression("", expression.args[i]));
        Mutation.appendChild(Argument_);
    }
    Raw.appendChild(Mutation);
    
    for (var i = 0; i < expression.args.length; i+= 1) {
        var Value_ = document.createElement("value");
        Value_.setAttribute("name", "ARG"+i);
        Value_.appendChild(this._convertExpression("", expression.args[i]));
        Raw.appendChild(Value_);
    }
        
    return Raw;
}

PythonToBlocks.prototype.createDict_ = function(expression) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "dicts_create_with");
    Raw.setAttribute("inline", "false");
    
    var Mutation = document.createElement("mutation");
    Mutation.setAttribute("items", expression.keys.length);
    Raw.appendChild(Mutation);
    
    for (var i = 0; i < expression.keys.length; i+= 1) {
        var Value = document.createElement("value");
        Value.setAttribute("name", "VALUE"+i);
        Value.appendChild(this._convertExpression("", expression.values[i]));
        Raw.appendChild(Value);
        var Field_ = document.createElement("field");
        Field_.setAttribute("name", "KEY"+i);
        Field_.appendChild(this._convertExpression("", expression.keys[i]));
        Raw.appendChild(Field_);
    }
        
    return Raw;
}

PythonToBlocks.prototype._createList = function(expression) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "lists_create_with");
    Raw.setAttribute("inline", "false");
    
    var Mutation = document.createElement("mutation");
    Mutation.setAttribute("items", expression.elts.length);
    Raw.appendChild(Mutation);
    
    for (var i = 0; i < expression.elts.length; i+= 1) {
        var Value = document.createElement("value");
        Value.setAttribute("name", "ADD"+i);
        Value.appendChild(this._convertExpression("", expression.elts[i]));
        Raw.appendChild(Value);
    }
        
    return Raw;
}

PythonToBlocks.prototype.convertReturn_ = function(parent, statement) {
    var Block_ = document.createElement("block");
    Block_.setAttribute("type", "procedures_return");
    Block_.setAttribute("inline", "false");
    
    var returnValue = this._convertExpression(parent, statement.value);
    var ValueTitle = document.createElement("value");
    ValueTitle.setAttribute("name", "VALUE");
    ValueTitle.appendChild(returnValue);
    Block_.appendChild(ValueTitle);
    
    return Block_;
}

PythonToBlocks.prototype._createPrint = function(parent, statement) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", "text_print_multiple");
    Raw.setAttribute("inline", "false");
    
    var Mutation = document.createElement("mutation");
    Mutation.setAttribute("items", statement.values.length);
    Raw.appendChild(Mutation);
    
    if (statement.nl) {
        // Add support for no line break (also, "dest"?)
    }
    
    for (var i = 0; i < statement.values.length; i+= 1) {
        var Value = document.createElement("value");
        Value.setAttribute("name", "PRINT"+i);
        Value.appendChild(this._convertExpression("", statement.values[i]));
        Raw.appendChild(Value);
    }
        
    return Raw;
}

PythonToBlocks.prototype._createBinaryBlock = function(type, inline, title, choice, valueA, valueB) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", type);
    Raw.setAttribute("inline", inline);
    var Title = document.createElement("title");
    Title.setAttribute("name", title);
    Title.appendChild(document.createTextNode(choice));
    Raw.appendChild(Title);
    var ValueTitle = document.createElement("value");
    ValueTitle.setAttribute("name", "A");
    ValueTitle.appendChild(valueA);
    Raw.appendChild(ValueTitle);
    ValueTitle = document.createElement("value");
    ValueTitle.setAttribute("name", "B");
    ValueTitle.appendChild(valueB);
    Raw.appendChild(ValueTitle);
    return Raw;
}

PythonToBlocks.prototype._createUnaryBlock = function(type, inline, title, value) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", type);
    Raw.setAttribute("inline", inline);
    var ValueTitle = document.createElement("value");
    ValueTitle.setAttribute("name", title);
    ValueTitle.appendChild(value);
    Raw.appendChild(ValueTitle);
    return Raw;
}

PythonToBlocks.prototype._createSimpleBlock = function(type, name, value) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", type);
    var Field = document.createElement("field");
    Field.setAttribute("name", name);
    Field.appendChild(document.createTextNode(value));
    Raw.appendChild(Field);
    return Raw;
}

PythonToBlocks.prototype._createMathNumber = function(body) {
    return this._createSimpleBlock("math_number", "NUM", body.n.v);
}

PythonToBlocks.prototype._createVariableGet = function(body) {
    return this._createSimpleBlock("variables_get", "VAR", body.id.v);
}

//<block type="math_number"> <title name="NUM">0</title> </block>
PythonToBlocks.prototype._convertAssignment = function(parent, statement) {
    
    // Handle expr_context
    if (statement.targets.length == 1) {
        var var_name = statement.targets[0].id.v;
        var var_value = this._convertExpression(parent, statement.value);
        
        var Assignment = document.createElement("block");
        Assignment.setAttribute("type", "variables_set");
        Assignment.setAttribute("inline", "false");
        
        var VariableTitle = document.createElement("title");
        VariableTitle.setAttribute("name", "VAR");
        VariableTitle.appendChild(document.createTextNode(var_name));
        Assignment.appendChild(VariableTitle);
        
        var ValueTitle = document.createElement("value");
        ValueTitle.setAttribute("name", "VALUE");
        ValueTitle.appendChild(var_value);
        Assignment.appendChild(ValueTitle);
        
        return Assignment;
    } else {
        return this._createRawBlock(statement);
    }
}

PythonToBlocks.prototype._convertFor = function(parent, statement) {
    var For_ = document.createElement("block");
    For_.setAttribute("type", "controls_forEach");
    For_.setAttribute("inline", "false");
    
    var TargetTitle = document.createElement("title");
    TargetTitle.setAttribute("name", "VAR");
    TargetTitle.appendChild(this._convertExpression(For_, statement.target));
    For_.appendChild(TargetTitle);
    
    var IterValue = document.createElement("value");
    IterValue.setAttribute("name", "LIST");
    IterValue.appendChild(this._convertExpression(For_, statement.iter));
    For_.appendChild(IterValue);
    
    var BodyStatement = document.createElement("statement");
    BodyStatement.setAttribute("name", "DO");
    this._convertBody(BodyStatement, statement.body);
    For_.appendChild(BodyStatement);
    
    if (statement.orelse) {
        // TODO: Need to have a orelse block in the For_
    }
    
    return For_;
}

PythonToBlocks.prototype._convertFunctionDef = function(parent, statement) {
    var Def_ = document.createElement("block");
    Def_.setAttribute("type", "procedures_defnoreturn");
    Def_.setAttribute("inline", "false");
    
    var DefTitle = document.createElement("title");
    DefTitle.setAttribute("name", "NAME");
    DefTitle.appendChild(document.createTextNode(statement.name.v));
    Def_.appendChild(DefTitle);
    
    if (statement.decorator_list) {
        // TODO
    }
    
    // statement.args.kwarg
    // statement.args.vararg
    // statement.args.defaults
    var Mutation = document.createElement("mutation");
    for (var i = 0; i < statement.args.args.length; i += 1) {
        var Argument = document.createElement("arg");
        Argument.setAttribute("name", statement.args.args[i].id.v);
        Mutation.appendChild(Argument);
    }
    Def_.appendChild(Mutation);
    
    var BodyStatement = document.createElement("statement");
    BodyStatement.setAttribute("name", "STACK");
    this._convertBody(BodyStatement, statement.body);
    Def_.appendChild(BodyStatement);
    
    return Def_;
    
}

PythonToBlocks.prototype._convertIf = function(parent, statement) {
    var If_ = document.createElement("block");
    If_.setAttribute("type", "controls_if");
    If_.setAttribute("inline", "false");
    
    if (statement.test) {
        var Test = document.createElement("value");
        Test.setAttribute("name", "IF0");
        Test.appendChild(this._convertExpression(If_, statement.test));
        If_.appendChild(Test);
    }
        
    var MutationCounter = document.createElement("mutation");
    If_.appendChild(MutationCounter);

    
    var BodyStatement = document.createElement("statement");
    BodyStatement.setAttribute("name", "DO0");
    this._convertBody(BodyStatement, statement.body);
    If_.appendChild(BodyStatement);
    
    var walker = statement;
    var elseifCount = 0;
    var elseCount = 0;
    var potentialElseBody = null;
    while ("orelse" in walker && walker.orelse.length > 0) {
        potentialElseBody = walker.orelse;
        walker = walker.orelse[0];
        var BodyStatement = document.createElement("statement");
        if (walker.constructor.name == "If_") {
            // Elseif
            elseifCount += 1;
            BodyStatement.setAttribute("name", "DO"+elseifCount);
            this._convertBody(BodyStatement, walker.body);
            
            if (walker.test) {
                var Test = document.createElement("value");
                Test.setAttribute("name", "IF"+elseifCount);
                Test.appendChild(this._convertExpression(If_, walker.test));
                If_.appendChild(Test);
            }
        } else {
            // Else
            elseCount += 1;
            BodyStatement.setAttribute("name", "ELSE");
            this._convertBody(BodyStatement, potentialElseBody);
        }
        If_.appendChild(BodyStatement);
    }
    
    MutationCounter.setAttribute("elseif", elseifCount);
    MutationCounter.setAttribute("else", elseCount);
    
    return If_;
}

var _STOCK_MAP = {
    'FB': "Facebook", 'Facebook': "Facebook",
    "AAPL": "Apple", 'Apple': "Apple",
    "MSFT": "Microsoft", 'Microsoft': "Microsoft",
    "GOOG": "Google", 'Google': "Google"
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

PythonToBlocks.prototype._convertExpression = function(parent, expression) {
    switch (expression.constructor.name) {
        case "Name":
            switch (expression.id.v) {
                case "True":  return this._createLogicBoolean(true);
                case "False": return this._createLogicBoolean(false);
                case "None":  return this._createNone();
                default:      return this._createVariableGet(expression);
            }
        case "Call":
            if (expression.func.constructor.name == "Attribute") {
                // Check if its a special function - TODO make this smarter
                switch (expression.func.attr.v) {
                    case "append":
                        return this.createAppendBlock_(expression.func, expression.args);
                    default: break;
                }
                switch (expression.func.value.id.v) {
                case "weather":
                    switch (expression.func.attr.v) {
                    case "get_temperature": default:
                        return this._createBuiltinBlock("weather_temperature", 
                                                        [["CITY", expression.args[0].s.v]]);
                    case "get_report":
                        return this._createBuiltinBlock("weather_report", 
                                                        [["CITY", expression.args[0].s.v]]);
                    case "get_forecasts":
                        return this._createBuiltinBlock("weather_forecasts", 
                                                        [["CITY", expression.args[0].s.v]]);
                    case "get_highs_lows":
                        return this._createBuiltinBlock("weather_highs_lows", 
                                                        [["CITY", expression.args[0].s.v]]);
                    case "get_all_forecasted_temperatures":
                        return this._createBuiltinBlock("weather_all_forecasts", []);
                    case "get_forecasted_reports":
                        return this._createBuiltinBlock("weather_report_forecasts", 
                                                        [["CITY", expression.args[0].s.v]]);
                    }
                case "earthquakes":
                    switch (expression.func.attr.v) {
                    case "get":
                        return this._createBuiltinBlock("earthquake_get",
                                                        [["PROPERTY", expression.args[0].s.v]]);
                    case "get_both":
                        return this._createBuiltinBlock("earthquake_both", []);
                    case "get_all": default:
                        return this._createBuiltinBlock("earthquake_all", []);
                    }
                case "stocks":
                    switch (expression.func.attr.v) {
                    case "get_current": default:
                        return this._createBuiltinBlock("stocks_current",
                                                        [["TICKER", _STOCK_MAP[expression.args[0].s.v]]]);
                    case "get_past":
                        return this._createBuiltinBlock("stocks_past",
                                                        [["TICKER", _STOCK_MAP[expression.args[0].s.v]]]);
                    }
                case "crime":
                    switch (expression.func.attr.v) {
                    case "get_property_crimes":
                        return this._createBuiltinBlock("crime_state",
                                                        [["TYPE", "property"],
                                                         ["STATE", toTitleCase(expression.args[0].s.v)]]);
                    case "get_violent_crimes":
                        return this._createBuiltinBlock("crime_state",
                                                        [["TYPE", "violent"],
                                                         ["STATE", toTitleCase(expression.args[0].s.v)]]);
                    case "get_by_year":
                        return this._createBuiltinBlock("crime_year",
                                                        [["YEAR", expression.args[0].s.v]]);
                    case "get_all": default:
                        return this._createBuiltinBlock("crime_all",
                                                        []);
                    }
                case "books":
                    return this._createBuiltinBlock("books_get", []);
                case "plt":
                    switch (expression.func.attr.v) {
                    case "title":
                        return this._createBuiltinBlock("plot_title",
                                                        [["TEXT", expression.args[0].s.v]]);
                    case "plot":
                        return this._createPlot(expression);
                    case "show": default:
                        return this._createBuiltinBlock("plot_show", []);
                    }
                default:  return this._createCallBlock(expression.func.attr.v);
                }
            } else if (expression.func.constructor.name == "Name") {
                return this._createCallBlock(expression);
            }
        case "Attribute":
            throw "Attribute access is not currently supported.";
        case "Subscript":
            return this.createDictSubscript_(expression);
        case "Dict":
            return this.createDict_(expression);
        case "Tuple":
            throw "Tuples are not currently supported.";
        case "Set":
            throw "Sets are not currently supported.";
        case "List":
            return this._createList(expression);
        case "Num":
            return this._createMathNumber(expression);
        case "Str":
            return this._createString(expression);
        case "Compare":
            return this._createLogicCompare(expression);
        case "UnaryOp":
            return this._createLogicNegate(expression);
        case "BinOp":
            return this._createBinOp(expression);
        case "Lambda":
            throw "Lambdas are not currently supported.";
        case "IfExp":
            throw "Inline If Expressions are not currently supported.";
        case "ListComp":
            throw "List Comprehensions are not currently supported.";
        case "DictComp":
            throw "Dictionary Comprehensions are not currently supported.";
        case "GeneratorExp":
            throw "Generators Expressions are not currently supported.";
        case "Yield":
            throw "Yield Expressions are not currently supported.";
        case "Repr":
            throw "Repr expressions are not currently supported.";
        case "BoolOp":
            return this._createLogicOperation(expression);
    }
    return this._createRawExpression(expression);
}

PythonToBlocks.prototype._hasNextStatement = function(statement) {
    switch (statement.constructor.name) {
        case "Import_": return true;
        case "Expr":
            if (statement.value.constructor.name == "Call") {
                if (statement.value.func && statement.value.func.constructor.name == "Attribute") {
                    if (statement.value.func.value && statement.value.func.value.id.v == "plt") {
                        return true;
                    }
                    return true;
                }
            }
            return false;
        case "FunctionDef": return false;
        case "If_": return true;
        case "For_": return true;
        case "Assign": return true;
        default: return true;
    }
}

/*
Main dispatch function
*/
PythonToBlocks.prototype._convertStatement = function(parent, statement) {
    switch (statement.constructor.name) {
        case "Import_":
            return null;
        case "ImportFrom":
            return null;
        case "Return_":
            return this.convertReturn_(parent, statement);
        case "Expr":
            return this._convertExpression(parent, statement.value);
        case "With":
            throw "With is not currently supported.";
        case "While":
            throw "While loops are not currently supported.";
        case "ClassDef":
            throw "Class definitions are not currently supported.";
        case "FunctionDef":
            return this._convertFunctionDef(parent, statement);
        case "Print":
            return this._createPrint(parent, statement);
        case "If_":
            return this._convertIf(parent, statement);
        case "For_":
            return this._convertFor(parent, statement);
        case "AugAssign":
            return this.convertAugAssign_(parent, statement);
        case "Assign":
            return this._convertAssignment(parent, statement);
        case "Delete":
            throw "Deletion is not currently supported.";
        // Raise, TryExcept, TryFinally, Assert, Global, Break, Continue, Pass
        default:
            //console.log(statement);
            break;
    }
    return this._createRawBlock(statement);//this.sourceCodeLines[statement.lineno-1]);
}

PythonToBlocks.prototype._convertBody = function(parent, statements) {
    var current = parent;
    for (var i = 0; i < statements.length; i+= 1) {
        if (statements[i].constructor.name != "Pass") {
            var node = this._convertStatement(parent,statements[i]);
            if (node == null) {
                continue;
            }
            if (!this._hasNextStatement(statements[i])) {
                current = parent;
            }
            if (current == parent) {
                current.appendChild(node);
                current = node;
            } else {
                var Next = document.createElement("next");
                Next.appendChild(node);
                current.appendChild(Next);
                current = node;
            }
            if (!this._hasNextStatement(statements[i])) {
                current = parent;
            }
        }
    }
}

PythonToBlocks.prototype.convert = function(python_source) {
    this.reverse = new ReverseAST(python_source.split("\n"));
    var xml = document.createElement("xml");
    xml.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    var filename = 'user_code.py';
    var ast, symbol_table, error_message;
    try {
        var parse = Sk.parse(filename, python_source);
        ast = Sk.astFromParse(parse.cst, filename, parse.flags);
        symbol_table = Sk.symboltable(ast, filename, python_source, filename, parse.flags);
        error_message = false;
        console.log("AST:", ast);
    } catch (e) {
        error_message = e;
        console.log(error_message);
    }
    this.sourceCodeLines = python_source.split("\n");
    this.reverse.measureNode(ast);
    
    xml.appendChild(this.raw_block(python_source))
    var converted = this.reverse.convert(ast);
    var other_xml = document.createElement("xml");
    if (converted !== null) {
        other_xml.appendChild(converted);
    }
    xml = other_xml;
    console.log(converted);
    return {"xml": new XMLSerializer().serializeToString(xml), "errors": error_message};
}