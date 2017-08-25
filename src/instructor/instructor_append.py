from instructor_utility import *
def find_append_in(node):
    appendList = []
    calls = node.find_all("Call")
    for node in calls:
        if node.func.attr == "append":
            appendList.append(node)
    return appendList
def missing_append_in_iteration():
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        if len(find_append_in(loop)):
            return False
    explain("You must construct a list by appending values one at a time to the list.")
    return True
def not_append_to_list():
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        append_nodes = find_append_in(loop)
        for node in append_nodes:
            listNode = node.func.value
            if listNode.data_type != "List":
                explain("Values can only be appended to a list. The property name(%s) is either not initialized or is confused with another property." %(listNode.id))
def  append_list_not_initialized():
    ast = parse_program()
    for_loops = ast.find_all("For")
    loop_appends = []
    for loop in for_loops:
        loop_appends.extend(find_append_in(loop));
    assignments = ast.find_all("Assign")
    for append_call in loop_appends:
        append_loc = append_call.lineno
        append_var = append_call.func.value
        found_init = False
        for assignment in assignments:
            if assignment.has(append_var) and assignment.lineno < append_loc:
                found_init = True
                break
        if found_init == False:
            explain("The list property name(%s) must be initialized." %(append_var.id))
            return True
    return False

def append_list_initiatization_wrong():
    ast = parse_program()
    for_loops = ast.find_all("For")
    loop_appends = []
    for loop in for_loops:
        loop_appends.extend(find_append_in(loop));
    assignments = ast.find_all("Assign")
    for append_call in loop_appends:
        append_loc = append_call.lineno
        append_var = append_call.func.value
        init_fail = False
        for assignment in assignments:
            if assignment.has(append_var) and assignment.lineno < append_loc:
                if assignment.value.ast_name == "List":
                    if len(elts) != 0:
                        init_fail = True
                else:#or if its not even a list
                    init_fail = True
            if init_fail:
                explain("The list property name(%s) is not initialized correctly." %(append_var.id))
                return
def append_list_wrong_slot():
	ast = parse_program()
	append_calls = find_append_in(ast)
	for append_call in append_calls:
		arg = append_call.args[0]
		caller = append_call.func.value
		if arg.ast_name == "Name":
			if arg.data_type == "List":
				explain("You should not append a list (%s) to %s." %(arg.id, caller.id))