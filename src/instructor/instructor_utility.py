from instructor import *

def is_top_level(ast_node):
    ast = parse_program()
    for element in ast.body:
        if element.ast_name == 'Expr':
            if element.value == ast_node:
                return True
        elif element == ast_node:
            return True
    return False
    
def no_nested_function_definitions():
    ast = parse_program()
    defs = ast.find_all('FunctionDef')
    for a_def in defs:
        if not is_top_level(a_def):
            gently("You have defined a function inside of another block. For instance, you may have placed it inside another function definition, or inside of a loop. Do not nest your function definition!")
            return False
    return True
    
def function_prints():
    ast = parse_program()
    defs = ast.find_all('FunctionDef')
    for a_def in defs:
        all_calls = a_def.find_all('Call')
        for a_call in all_calls:
            if a_call.func.ast_name == 'Name':
                if a_call.func.id == 'print':
                    return True
    return False

def find_function_calls(name):
    ast = parse_program()
    all_calls = ast.find_all('Call')
    calls = []
    for a_call in all_calls:
        if a_call.func.ast_name == 'Attribute':
            if a_call.func.attr == name:
                calls.append(a_call)
        elif a_call.func.ast_name == 'Name':
            if a_call.func.id == name:
                calls.append(a_call)
    return calls

def function_is_called(name):
    return len(find_function_calls(name))
    
def no_nonlist_nums():
    pass
    
def only_printing_variables():
    ast = parse_program()
    all_calls = ast.find_all('Call')
    count = 0
    for a_call in all_calls:
        if a_call.func.ast_name == 'Name' and a_call.func.id == "print":
            for arg in a_call.args:
                if arg.ast_name != "Name":
                    return False
    return True

def find_prior_initializations(node):
    if node.ast_name != "Name":
        return None
    ast = parse_program()
    assignments = ast.find_all("Assign")
    cur_line_no = node.lineno
    all_assignments = []
    for assignment in assignments:
        if assignment.has(node):
            if assignment.lineno < cur_line_no:
                all_assignments.append(assignment)
    return all_assignments
    
def prevent_unused_result():
    ast = parse_program()
    exprs = ast.find_all('Expr')
    for expr in exprs:
        if expr.value.ast_name == "Call":
            a_call = expr.value
            if a_call.func.ast_name == 'Attribute':
                if a_call.func.attr == 'append':
                    pass
                elif a_call.func.attr in ('replace', 'strip', 'lstrip', 'rstrip'):
                    gently("Remember! You cannot modify a string directly. Instead, you should assign the result back to the string variable.")
    
def prevent_builtin_usage(function_names):
    # Prevent direction calls
    ast = parse_program()
    all_calls = ast.find_all('Call')
    for a_call in all_calls:
        if a_call.func.ast_name == 'Name':
            if a_call.func.id in function_names:
                explain("You cannot use the builtin function <code>{}</code>.".format(a_call.func.id))
                return a_call.func.id
    # Prevent tricky redeclarations!
    names = ast.find_all('Name')
    seen = set()
    for name in names:
        if name.id not in seen:
            if name.ctx == "Load" and name.id in function_names:
                explain("You cannot use the builtin function <code>{}</code>. If you are naming a variable, consider a more specific name.".format(name.id))
            seen.add(name.id)
            return name.id
    return None
    
def prevent_literal(*literals):
    ast = parse_program()
    str_values = [s.s for s in ast.find_all("Str")]
    num_values = [n.n for n in ast.find_all("Num")]
    for literal in literals:
        if isinstance(literal, (int, float)):
            if literal in num_values:
                explain("Do not use the literal value <code>{}</code> in your code.".format(repr(literal)))
                return literal
        elif isinstance(literal, str):
            if literal in str_values:
                explain("Do not use the literal value <code>{}</code> in your code.".format(repr(literal)))
                return literal
    return False
def ensure_literal(*literals):
    ast = parse_program()
    str_values = [s.s for s in ast.find_all("Str")]
    num_values = [n.n for n in ast.find_all("Num")]
    for literal in literals:
        if isinstance(literal, (int, float)):
            if literal not in num_values:
                explain("You need the literal value <code>{}</code> in your code.".format(repr(literal)))
                return literal
        elif isinstance(literal, str):
            if literal not in str_values:
                explain("You need the literal value <code>{}</code> in your code.".format(repr(literal)))
                return literal
    return False
    
def prevent_advanced_iteration():
    ast = parse_program()
    if ast.find_all('While'):
        explain("You should not use a <code>while</code> loop to solve this problem.")
    prevent_builtin_usage(['sum', 'map', 'filter', 'reduce', 'len', 'max', 'min',
                           'max', 'sorted', 'all', 'any', 'getattr', 'setattr',
                           'eval', 'exec', 'iter'])

COMPARE_OP_NAMES = {
    "==": "Eq", 
    "<": "Lt", 
    "<=": "Lte", 
    ">=": "Gte", 
    ">": "Gt", 
    "!=": "NotEq", 
    "is": "Is", 
    "is not": "IsNot", 
    "in": "In_", 
    "not in": "NotIn"}
BOOL_OP_NAMES = {
    "and": "And",
    "or": "Or"}
BIN_OP_NAMES = {
    "+": "Add",
    "-": "Sub",
    "*": "Mult",
    "/": "Div",
    "//": "FloorDiv",
    "%": "Mod",
    "**": "Pow",
    ">>": "LShift",
    "<<": "RShift",
    "|": "BitOr",
    "^": "BitXor",
    "&": "BitAnd",
    "@": "MatMult"}
UNARY_OP_NAMES = {
    #"+=": "UAdd",
    #"-=": "USub",
    "not": "Not",
    "~": "Invert"
}
def ensure_operation(op_name, root=None):
    if root is None:
        root = parse_program()
    result = find_operation(op_name, root)
    if result == False:
        gently("You are not using the <code>{}</code> operator.".format(op_name))
    return result
def prevent_operation(op_name, root=None):
    if root is None:
        root = parse_program()
    result = find_operation(op_name, root)
    if result != False:
        gently("You may not use the <code>{}</code> operator.".format(op_name))
    return result
    
def find_operation(op_name, root):    
    if op_name in COMPARE_OP_NAMES:
        compares = root.find_all("Compare")
        for compare in compares:
            for op in compare.ops:
                if op == COMPARE_OP_NAMES[op_name]:
                    return compare
    elif op_name in BOOL_OP_NAMES:
        boolops = root.find_all("BoolOp")
        for boolop in boolops:
            if boolop.op == BOOL_OP_NAMES[op_name]:
                return boolop
    elif op_name in BIN_OP_NAMES:
        binops = root.find_all("BinOp")
        for binop in binops:
            if binop.op == BIN_OP_NAMES[op_name]:
                return binop
    elif op_name in UNARY_OP_NAMES:
        unaryops = root.find_all("UnaryOp")
        for unaryop in unaryops:
            if unaryop.op == UNARY_OP_NAMES[op_name]:
                return unaryop
    return False
'''
    
    mod.no_nonlist_nums = new Sk.builtin.func(function(source) {
        Sk.builtin.pyCheckArgs("no_nonlist_nums", arguments, 1, 1);
        Sk.builtin.pyCheckType("source", "string", Sk.builtin.checkString(source));
        
        source = source.v;
        
        var num_list = getNonListNums(source);
        
        var count = 0;
        for (var i = 0, len = num_list.length; i < len; i = i+1) {
            if (num_list[i].v != 0 && num_list[i].v != 1) {
                return Sk.ffi.remapToPy(true);
            }
        }
        return Sk.ffi.remapToPy(false);
    });


    
    /**
     * Given source code as a string, return a list of all of the AST elements
     * that are Num (aka numeric literals) but that are not inside List elements.
     *
     * @param {String} source - Python source code.
     * @returns {Array.number} The list of JavaScript numeric literals that were found.
     */
    function getNonListNums(source) {
        if (!(source in parses)) {
            var parse = Sk.parse("__main__", source);
            parses[source] = Sk.astFromParse(parse.cst, "__main__", parse.flags);
        }
        var ast = parses[source];
        var visitor = new NodeVisitor();
        var insideList = false;
        var nums = [];
        visitor.visit_List = function(node) {
            insideList = true;
            this.generic_visit(node);
            insideList = false;
        }
        visitor.visit_Num = function(node) {
            if (!insideList) {
                nums.push(node.n);
            }
            this.generic_visit(node);
        }
        visitor.visit(ast);
        return nums;
    }
    
    
 '''