from instructor import*
#this conflicts with list_repeated_in_for
def m_wrong_target_is_list():
    match = find_match("for _item_ in ___:\n    pass")
    if match:
        _item_ = match.get_std_name("_item_")
        if _item_.data_type == "List":
            explain('The variable <code>{0!s}</code> is a list and should not be placed in the iteration variable slot of the "for" block<br><br><i>(target_is_list)<i></br>.'.format(_item_.id))
            return True
    return False
#this conflics with list_in_wrong_slot_in_for
def m_wrong_list_repeated_in_for():
    match = find_match("for _item_ in _item_:\n    pass")
    if match:
        _item_ = match.get_std_name("_item_")
        if _item_.data_type == "List":
            explain('The <code>{0!s}</code> variable can only appear once in the "for" block <br><br><i>(list_repeat)<i></br>'.format(_item_.id))
            return True
    return False
#this isn't consistent with the pattern you wrote
def m_missing_iterator_initialization():
    match = find_match("for ___ in _list_:\n    pass")
    if match:
        _list_ = match.get_std_name("_list_")
        if _list_.data_type != "List":
            if _list_.id == "___":
                explain("The slot to hold a list in the iteration is empty.<br><br><i>(no_iter_init-blank)<i></br>")
                return True
            else:
                explain("The variable <code>{0!s}</code> is in the list slot of the iteration but is not a list.<br><br><i>(no_iter_init)<i></br>".format(_list_.id))
            return True
    return False
#TODO: We need to cover the different cases for these
def m_wrong_iterator_not_list():
    match = find_match("for ___ in _item_:\n    pass")
    if match:
        _item_ = match.get_std_name("_item_")
        if _item_.data_type != "List":
            explain("The variable <code>{0!s}</code> has been set to something that is not a list but is placed in the iteration block that must be a list.<br><br><i>(iter_not_list)<i></br>".format(_item_.id))
            return True
    return False
def m_missing_target_slot_empty():
    match = find_match("for _item_ in ___:\n    pass")
    if match:
        _item_ = match.get_std_name("_item_")
        if _item_.id == "___":
            explain("You must fill in the empty slot in the iteration.<br><br><i>(target_empty)<i></br>")
            return True
    return False
def m_list_not_initialized_on_run():
    match = find_match("for ___ in _item_:\n    pass")
    if match:
        _item_ = match.get_std_name("_item_")
        if _item_.data_type == None:
            explain("The list in your for loop has not been initialized<br><br><i>(no_list_init)<i></br>")
            return True
    return False
def m_list_initialization_misplaced():
    match = find_match("for ___ in _item_:\n    pass")
    if match:
        _item_ = match.get_std_name("_item_")
        if _item_.data_type == "List" and def_use_error(_item_):
            explain("Initialization of <code>{0!s}</code> is a list but either in the wrong place or redefined<br><br><i>(list_init_misplaced)<i></br>".format(_item_.id))
            return True
    return False
def m_missing_for_slot_empty():
    match = find_match("for _item_ in _list_:\n    pass")
    if match:
        _item_ = match.get_std_name("_item_")
        _list_ = match.get_std_name("_list_")
        if _item_.id == "___" or _list_.id == "___":
            explain("You must fill in the empty slot in the iteration.<br><br><i>(for_incomplete)<i></br>")
            return True
    return False
def m_wrong_target_reassigned():
    match = find_match("for _item_ in ___:\n   _item_ = ___")
    if match:
        _item_ = match.get_std_name("_item_")
        explain("The variable <code>{0!s}</code> has been reassigned. The iteration variable shouldn't be reassigned<br><br><i>(target_reassign)<i></br>".format(_item_.id))
        return True
    return False
def m_hard_code_8_5():#TODO: This one's weird
    match = find_matches("print(__num__)")
    if match:
        for m in match:
            __num__ = m.get_std_exp("__num__")
            if len(__num__.find_all("Num")) > 0:
                explain("Use iteration to calculate the sum.<br><br><i>(hard_code_8.5)<i></br>")
def m_wrong_modifying_list_8_5():
    match = find_match("[20473, 27630, 17849, 19032, 16378]")
    if not match:
        explain("Don't modify the list<br><br><i>(mod_list_8.5)<i></br>")
#this has some issues in that it can be tricked if we don't do multiple matches
def m_missing_zero_initialization():
    matches = find_matches("for ___ in ___:\n    ___ = _sum_ + ___")
    if matches:
        for match in matches:
            _sum_ = match.get_std_name("_sum_")
            if def_use_error(_sum_):
                explain("The addition on the first iteration step is not correct because either the variable <code>{0!s}</code> has not been initialized to an appropriate initial value or it has not been placed in an appropriate location<br><br><i>(miss_zero_init)<i></br>".format(_sum_.id))
                return True
    return False
def m_wrong_duplicate_var_in_add():
    match = find_match("for ___ in ___:\n    _sum_ + _sum_")
    if match:
        explain("You are adding the same variable twice; you need two different variables in your addition.<br><br><i>(dup_var)<i></br>")
def m_wrong_cannot_sum_list():
    match = find_match("for ___ in _list_:\n    ___ = ___ + _list_")
    if match:
        explain("Addition can only be done with a single value at a time, not with an entire list at one time.<br><br><i>(sum_list)<i></br>")
        return True
    return False
def m_wrong_should_be_summing():
    match = find_match("for ___ in _list_:\n    ___ = ___ + 1")
    if match:
        explain("This problem asks for the total of all the values in the list not the number of items in the list.<br><br><i>(not_sum)<i></br>")
        return True
    return False
def m_missing_summing_list():
    match = find_match("for _item_ in ___:\n    _total_ = _total_ + _item_")
    if not match:
        explain("Sum the total of all list elements using iteration.<br><br><i>(miss_sum_list)<i></br>")
        return True
    return False
def m_wrong_printing_list():
    matches = find_matches("print(__exp__)")
    if matches:
        for match in matches:
            __exp__ = match.get_std_exp("__exp__")
            cond1 = __exp__.ast_name == "Name" and __exp__.data_type != "Num"
            cond2 = __exp__.ast_name == 'List'
            if cond1 or cond2:
                explain("You should be printing a single value.<br><br><i>(list_print)<i></br>")
                return False
    return True
def m_dup_var_8_5():
    match = find_match("_item_ + _item_")
    if match:
        explain("You are adding the same variable twice; you need two different variables in your addition.<br><br><i>(dup_var_8.5)<i></br>")
        return True
    return False
def m_missing_no_print():
    match = find_match("print(___)")
    if not match:
        explain("Program does not output anything.<br><br><i>(no_print)<i></br>")
        return True
    return False
def m_iteration_group():
    m_list_initialization_misplaced()#list_init_misplaced
    m_wrong_target_is_list()#target_is_list
    m_wrong_list_repeated_in_for()#list_repeat#should be moved before target_is_list
    m_missing_iterator_initialization()#no_iter_init,no_iter_init-blank
    m_list_not_initialized_on_run()#no_list_init
    m_wrong_iterator_not_list()#iter_not_list
    m_missing_target_slot_empty()#target_empty
    m_missing_for_slot_empty()#for_incomplete
    m_wrong_target_reassigned()#target_reassign
def m_iteration_group_on_change():
    m_wrong_target_is_list()
    m_wrong_list_repeated_in_for()
    m_wrong_iterator_not_list()