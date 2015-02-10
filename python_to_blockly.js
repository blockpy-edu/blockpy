function Python2Blockly() {
    this.XML = document.createElement("xml");
    this.XML.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    
    this.current = this.XML;
    this.parent = [];
    
    //Node.appendChild( document.createElement("testingOne") );
    //Node.appendChild( document.createElement("TestingTwo") );
    //Node.appendChild( document.createElement("TestingThree") );
};

Python2Blockly.prototype._createRawBlock = function(body) {
    return this._createSimpleBlock("raw_block", "TEXT", body);
}
Python2Blockly.prototype._createRawExpression = function(body) {
    return this._createSimpleBlock("raw_expression", "TEXT", body.toString());
}
Python2Blockly.prototype._createLogicBoolean = function(truth) {
    if (truth) {
        return this._createSimpleBlock("logic_boolean", "BOOL", "TRUE");
    } else {
        return this._createSimpleBlock("logic_boolean", "BOOL", "FALSE");
    }
}

skulptToBlockly_logicOperations = function(op) {
    switch (op) {
        case "Eq": return "EQ";
        case "NotEq": return "NEQ";
        case "Lt": return "LT";
        case "Gt": return "GT";
        case "LtE": return "LTE";
        case "GtE": return "GTE";
        case "And": return "AND";
        case "Or": return "OR";
        default: return "Error";
    }
}
Python2Blockly.prototype._createLogicCompare = function(expression) {
    return this._createBinaryBlock("logic_compare", "true", "OP",
                                   skulptToBlockly_logicOperations(expression.ops[0].name),
                                   this._convertExpression("", expression.left),
                                   this._convertExpression("", expression.comparators[0]))
}
Python2Blockly.prototype._createLogicOperation = function(expression) {
    return this._createBinaryBlock("logic_operation", "true", "OP",
                                   skulptToBlockly_logicOperations(expression.op.name),
                                   this._convertExpression("", expression.values[0]),
                                   this._convertExpression("", expression.values[1]))
}
Python2Blockly.prototype._createBinaryBlock = function(type, inline, title, choice, valueA, valueB) {
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

Python2Blockly.prototype._createSimpleBlock = function(type, name, value) {
    var Raw = document.createElement("block");
    Raw.setAttribute("type", type);
    var Title = document.createElement("title");
    Title.setAttribute("name", name);
    Title.appendChild(document.createTextNode(value));
    Raw.appendChild(Title);
    return Raw;
}

Python2Blockly.prototype._createMathNumber = function(body) {
    return this._createSimpleBlock("math_number", "NUM", body.n.v);
}

Python2Blockly.prototype._createVariableGet = function(body) {
    return this._createSimpleBlock("variables_get", "VAR", body.id.v);
}

//<block type="math_number"> <title name="NUM">0</title> </block>
Python2Blockly.prototype._convertAssignment = function(parent, statement) {
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

Python2Blockly.prototype._convertIf = function(parent, statement) {
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
    while ("orelse" in walker && walker.orelse.length > 0) {
        potentialElseBody = walker.orelse;
        walker = walker.orelse[0];
        console.log(walker);
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

Python2Blockly.prototype._convertExpression = function(parent, expression) {
    switch (expression.constructor.name) {
        case "Name":
            switch (expression.id.v) {
                case "True":  return this._createLogicBoolean(true);
                case "False": return this._createLogicBoolean(false);
                case "None":  
                default:      return this._createVariableGet(expression);
            }
        case "Num":
            return this._createMathNumber(expression);
        case "Compare":
            return this._createLogicCompare(expression);
        case "BoolOp":
            return this._createLogicOperation(expression);
    }
    return this._createRawExpression(expression);
}

Python2Blockly.prototype._hasNextStatement = function(statement) {
    switch (statement.constructor.name) {
        case "Import_": return true;
        case "Expr": return false;
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
Python2Blockly.prototype._convertStatement = function(parent, statement) {
    switch (statement.constructor.name) {
        case "Import_":
            console.warn(": Everyone walk the dinosaur");
            break;
        case "Expr":
            return this._convertExpression(parent, statement.value);
        case "FunctionDef":
            console.warn(": Function declaration.");
            //convertBody(statement.body, 1+indent);
            //console.warn("Body: "+statement.body);
            break;
        case "If_":
            return this._convertIf(parent, statement);
        case "For_":
            console.warn(": Iteration");
            //convertBody(statement.body, 1+indent);
            break;
        case "Assign":
            return this._convertAssignment(parent, statement);
        default:
            console.log(": "+statement.constructor.name);
            break;
    }
    return this._createRawBlock(this.sourceCodeLines[statement.lineno-1]);
}

Python2Blockly.prototype._convertBody = function(parent, statements) {
    var current = parent;
    for (var i = 0; i < statements.length; i+= 1) {
        if (statements[i].constructor.name != "Pass") {
            var node = this._convertStatement(parent,statements[i]);
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

Python2Blockly.prototype.convert = function(python_source) {
    console.log("-------------------");
    var filename = 'user_code.py';
    var parse_tree, symbol_table, error_message;
    try {
        parse_tree = Sk.astFromParse(Sk.parse(filename, python_source), filename);
        symbol_table = Sk.symboltable(parse_tree, filename);
        error_message = false;
    } catch (e) {
        error_message = e;
    }
    this.sourceCodeLines = python_source.split("\n");
    
    if (error_message !== false) {
        console.log("Error: "+error_message);
    } else {
        this._convertBody(this.XML, parse_tree.body);
    }
    return this.XML;
}


/*
Python2Blockly.prototype._convertBody = function(statements, indent) {
    for (var i = 0; i < statements.length; i+= 1) {
        convertStatement(statements[i], indent);
    }
}

<block type="variables_set" inline="false" x="12" y="48">
    <title name="VAR">item</title>
    <value name="VALUE">
        <block type="math_number">
            <title name="NUM">0</title>
        </block>
    </value>
    <next>

function convertAssignment(assignment) {
    if (assignments.targets.length == 1) {
    } else {
        for (var i = 0; i < assignment.targets.length; i+= 1) {
            console.log("ASSIGN = "+assignment.targets[i].id.v);
        }
    }
}

function convertStatement(statement, indent) {
    console.log(statement);
    switch (statement.constructor.name) {
        case "Import_":
            console.warn(indent+": Everyone walk the dinosaur");
            break;
        case "FunctionDef":
            console.warn(indent+": Function declaration.");
            convertBody(statement.body, 1+indent);
            //console.warn("Body: "+statement.body);
            break;
        case "If_":
            console.warn(indent+": Conditional");
            convertBody(statement.body, 1+indent);
            break;
        case "For_":
            console.warn(indent+": Iteration");
            convertBody(statement.body, 1+indent);
            break;
        case "Assign":
            convertAssignment(statement);
        default:
            console.log(indent+": "+statement.constructor.name);
            break;
    }
}

function convert_code(python_source) {
    console.log("-------------------");
    var filename = 'user_code.py';
    var parse_tree, symbol_table, error_message;
    try {
        parse_tree = Sk.astFromParse(Sk.parse(filename, code), filename);
        symbol_table = Sk.symboltable(parse_tree, filename);
        error_message = false;
    } catch (e) {
        error_message = e;
    }
    
    if (error_message !== false) {
        console.log("Error: "+error_message);
    } else {
        convertBody(parse_tree.body, 0);
    }
}
*/