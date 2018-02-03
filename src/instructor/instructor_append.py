from instructor_utility import *
def append_group_on_change():
    wrong_not_append_to_list()
def append_group():
    missing_append_in_iteration()
    missing_append_list_initialization()
    wrong_append_list_initiatization()
    wrong_not_append_to_list()
    append_list_wrong_slot()
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
    explain("You must construct a list by appending values one at a time to the list.<br><br><i>(app_in_iter)<i></br>")
    return True
def wrong_not_append_to_list():
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        append_nodes = find_append_in(loop)
        for node in append_nodes:
            listNode = node.func.value
            if listNode.data_type != "List" and listNode.id != "___":
                explain("Values can only be appended to a list. The variable <code>{0!s}</code> is either not initialized, not initialized correctly, or is confused with another variable.<br><br><i>(app_not_list)<i></br>".format(listNode.id))
def missing_append_list_initialization():
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
        if found_init == False and append_var.id != "___":
            explain("The list variable <code>{0!s}</code> must be initialized.<br><br><i>(no_app_list_init)<i></br>".format(append_var.id))
            return True
    return False

def wrong_append_list_initiatization():
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
                    if len(assignment.value.elts) != 0:
                        init_fail = True
                else:#or if its not even a list
                    init_fail = True
            if init_fail and append_var.id != "___":
                explain("The list variable <code>{0!s}</code> is either not initialized correctly or mistaken for another variable. The list you append to should be initialized to an empty list.<br><br><i>(app_list_init)<i></br>".format(append_var.id))
                return
def append_list_wrong_slot():
    ast = parse_program()
    append_calls = find_append_in(ast)
    for append_call in append_calls:
        arg = append_call.args[0]
        caller = append_call.func.value
        if arg.ast_name == "Name":
            if arg.data_type == "List" and caller.id != "___":
                explain("You should not append a list (<code>{0!s}</code>) to <code>{1!s}</code>.<br><br><i>(app_list_slot)<i></br>".format(arg.id, caller.id))