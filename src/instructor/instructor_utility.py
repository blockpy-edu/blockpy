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
    
def prevent_advanced_iteration():
    ast = parse_program()
    if ast.find_all('While'):
        explain("You should not use a <code>while</code> loop to solve this problem.")
    prevent_builtin_usage(['sum', 'map', 'filter', 'reduce', 'len', 'max', 'min',
                           'max', 'sorted', 'all', 'any', 'getattr', 'setattr',
                           'eval', 'exec', 'iter'])

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