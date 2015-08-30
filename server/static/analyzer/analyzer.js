function parseBody(statements, indent) {
    for (var i = 0; i < statements.length; i+= 1) {
        parseStatement(statements[i], indent);
    }
}

function parseAssignment(assignment) {
    for (var i = 0; i < assignment.targets.length; i+= 1) {
        console.log("ASSIGN = "+assignment.targets[i].id.v);
    }
}

function parseStatement(statement, indent) {
    console.log(statement);
    switch (statement.constructor.name) {
        case "Import_":
            console.warn(indent+": Everyone walk the dinosaur");
            break;
        case "FunctionDef":
            console.warn(indent+": Function declaration.");
            parseBody(statement.body, 1+indent);
            //console.warn("Body: "+statement.body);
            break;
        case "If_":
            console.warn(indent+": Conditional");
            parseBody(statement.body, 1+indent);
            break;
        case "For_":
            console.warn(indent+": Iteration");
            parseBody(statement.body, 1+indent);
            break;
        case "Assign":
            parseAssignment(statement);
        default:
            console.log(indent+": "+statement.constructor.name);
            break;
    }
}

function analyze_code() {
    console.log("-------------------");
    var filename = 'user_code.py';
    var code = $("#python-output").text();
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
        parseBody(parse_tree.body, 0);
    }
}