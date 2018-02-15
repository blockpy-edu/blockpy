from instructor import *
def iteration_group():
    list_initialization_misplaced()
    wrong_target_is_list()
    wrong_list_repeated_in_for()
    missing_iterator_initialization()
    list_not_initialized_on_run()
    wrong_iterator_not_list()
    missing_target_slot_empty()
    missing_for_slot_empty()
    wrong_target_reassigned()
def iteration_group_on_change():
    wrong_target_is_list()
    wrong_list_repeated_in_for()
    wrong_iterator_not_list()
def all_for_loops():
    ast = parse_program()
    return ast.find_all("For")
#this conflics with list_repeated_in_for
def wrong_target_is_list():
    for_loops = all_for_loops()
    for loop in for_loops:
        iter_prop = loop.target
        if iter_prop.ast_name == "Name" and iter_prop.data_type == "List":
            explain('The variable <code>{0!s}</code> is a list and should not be placed in the iteration variable slot of the "for" block<br><br><i>(target_is_list)<i></br>.'.format(iter_prop.id))
    return False
#this conflics with list_in_wrong_slot_in_for
def wrong_list_repeated_in_for():
    for_loops = all_for_loops()
    for loop in for_loops:
        iter_prop = loop.target
        list_prop = loop.iter
        if iter_prop.ast_name == "Name" and list_prop.ast_name == "Name" and iter_prop.id == list_prop.id and iter_prop.data_type == "List":
            explain('The <code>{0!s}</code> variable can only appear once in the "for" block <br><br><i>(list_repeat)<i></br>'.format(list_prop.id))
    return False
#this isn't consistent with the pattern you wrote
def missing_iterator_initialization():
    ast = parse_program()
    for_loops = all_for_loops()
    for loop in for_loops:
        list_prop = loop.iter
        if list_prop.ast_name != "List" and (list_prop.data_type != "List" or def_use_error(list_prop)):
            if list_prop.id == "___":
                explain("The slot to hold a list in the iteration is empty.<br><br><i>(no_iter_init-blank)<i></br>".format(list_prop.id))
            else:
                explain("The variable <code>{0!s}</code> is in the list slot of the iteration but is not a list.<br><br><i>(no_iter_init)<i></br>".format(list_prop.id))
            return True
    return False
#TODO: We need to cover the different cases for these
def wrong_iterator_not_list():
    for_loops = all_for_loops()
    for loop in for_loops:
        list_prop = loop.iter
        if list_prop.ast_name != "List" and list_prop.data_type != "List" and list_prop.id != "___":
            if list_prop.ast_name == "Name":
                explain("The variable <code>{0!s}</code> has been set to something that is not a list but is placed in the iteration block that must be a list.<br><br><i>(iter_not_list)<i></br>".format(list_prop.id))
                return True
    return False
def missing_target_slot_empty():
    for_loops = all_for_loops()
    for loop in for_loops:
        iter_prop = loop.target
        if iter_prop.id == "___":
            explain("You must fill in the empty slot in the iteration.<br><br><i>(target_empty)<i></br>")
            return True
    return False
def list_not_initialized_on_run():
    for_loops = all_for_loops()
    for loop in for_loops:
        list_prop = loop.iter
        if list_prop.data_type == None:
            explain("The list in your for loop has not been initialized<br><br><i>(no_list_init)<i></br>")
def list_initialization_misplaced():
    for_loops = all_for_loops()
    for loop in for_loops:
        list_prop = loop.iter
        if list_prop.data_type == "List" and def_use_error(list_prop):
            explain("Initialization of <code>{0!s}</code> is a list but either in the wrong place or redefined<br><br><i>(list_init_misplaced)<i></br>".format(list_prop.id))
def missing_for_slot_empty():
    for_loops = all_for_loops()
    is_missing = False
    for loop in for_loops:
        list_prop = loop.iter
        iter_prop = loop.target
        if list_prop.ast_name == "Name" and list_prop.id == "___":
            is_missing = True
            break
        if iter_prop.ast_name == "Name" and iter_prop.id == "___":
            is_missing = True
            break
    if is_missing:
        explain("You must fill in the empty slot in the iteration.<br><br><i>(for_incomplete)<i></br>")
def wrong_target_reassigned():
    ast = parse_program()
    for_loops = all_for_loops()
    is_reassigned = False
    iter_props = []
    for loop in for_loops:
        iter_props.append(loop.target)
    assignments = ast.find_all("Assign")
    off_prop = ""
    for assignment in assignments:
        left = assignment.targets
        for iter_prop in iter_props:
            if left.id == iter_prop.id:
                off_prop = left.id
                is_reassigned = True
                break
        if is_reassigned:
            break
    if is_reassigned:
        explain("The variable <code>{0!s}</code> has been reassigned. The iteration variable shouldn't be reassigned<br><br><i>(target_reassign)<i></br>".format(off_prop))