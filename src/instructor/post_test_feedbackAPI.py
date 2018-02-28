import ins_test_8_5 as stm85
from instructor import*
#for each problem
def m_itergrp_2():
    stm85.m_list_initialization_misplaced()#list_init_misplaced
    stm85.m_wrong_target_is_list()#target_is_list
    stm85.m_wrong_list_repeated_in_for()#list_repeat#should be moved before target_is_list
    stm85.m_missing_iterator_initialization()#no_iter_init,no_iter_init-blank
    stm85.m_list_not_initialized_on_run()#no_list_init
    stm85.m_wrong_iterator_not_list()#iter_not_list
    stm85.m_missing_target_slot_empty()#target_empty
    stm85.m_missing_for_slot_empty()#for_incomplete


def missing_addition_slot_empty():
    matches = find_matches("___ = __exp1__ + __exp2__")
    if matches:
        for match in matches:
            __exp1__ = match.get_std_exp("__exp1__")
            __exp2__ = match.get_std_exp("__exp2__")
            cond1 = __exp1__.ast_name == "Name" and __exp1__.id == '___'
            cond2 = __exp2__.ast_name == "Name" and __exp2__.id == '___'
            if cond1 or cond2:
                explain('You must fill in the empty slot in the addition.<br><br><i>(add_empty)<i></br>')
                return True
    return False
def wrong_compare_list():
    matches = find_matches("for ___ in _list_:\n    if __exp__:\n        pass")
    if matches:
        for match in matches:
            _list_ = match.get_std_name("_list_")
            __exp__ = match.get_std_exp("__exp__")
            if __exp__.has(_list_):
                explain('Each item in the list <code>{0!s}</code> must be compared one item at a time.<br><br><i>(comp_list)<i></br>'.format(_list_.id))
                return True
    return False
def wrong_for_inside_if():#for the actual specification, we don't cover this syntax
    match = find_match("if ___:\n    for ___ in ___:\n        pass")
    if match:
        explain('The iteration should not be inside the decision block.<br><br><i>(for_in_if)<i></br>')
        return True
    return False
def missing_if_in_for():#interesting case we don't cover exactly regarding syntax of specification
    matches = find_matches("for _item_ in ___:\n    if __exp__:\n        pass")
    if matches:
        for match in matches:
            _item_ = match.get_std_name("_item_")
            __exp__ = match.get_std_exp("__exp__")
            if not (match and __exp__.has(_item_)):
                explain("The arrangement of decision and iteration is not correct for the filter pattern.<br><br><i>(missing_if_in_for)<i></br>")
                return True
    else:
    	explain("The arrangement of decision and iteration is not correct for the filter pattern.<br><br><i>(missing_if_in_for)<i></br>")
    	return True
    return False
def wrong_should_be_counting():
    match = find_match("for _item_ in ___:\n    ___ = ___ + _item_")
    if match:
        explain('This problem asks for the number of items in the list not the total of all the values in the list.<br><br><i>(not_count)<i></br>')
        return True
    return False
def missing_counting_list():
    match = find_match("for ___ in ___:\n    _sum_ = _sum_ + 1")
    if not match:
        explain('Count the total number of items in the list using iteration.<br><br><i>(miss_count_list)<i></br>')
        return True
    return False
def missing_append_in_iteration():#TODO: implement matcher function that takes an AST node!
    match = find_match("for ___ in ___:\n    ___.append(___)")
    if not match:
        explain("You must construct a list by appending values one at a time to the list.<br><br><i>(app_in_iter)<i></br>")
        return True
    return False
def missing_append_list_initialization():
    matches = find_matches("for ___ in ___:\n    _target_.append(___)")
    if matches:
        for match in matches:
            _target_ = match.get_std_name("_target_")
            if def_use_error(_target_):
                explain("The list variable <code>{0!s}</code> must be initialized.<br><br><i>(no_app_list_init)<i></br>".format(_target_.id))
                return True
    return False
def wrong_append_list_initiatization():
    matches = find_matches("for ___ in ___:\n    _target_.append(___)")
    if matches:
        for match in matches:
            _target_ = match.get_std_name("_target_")
            found = find_match("{0!s} = []".format(_target_.id))#This doesn't work because it uses the raw name, and doesn't save to the symbol table
            if found:
                _target_2 = found.get_std_name("_target_")
            if (not found) or _target_2.lineno >= _target_.lineno:#in theory, should use first body of both instead of lineno
                explain("The list variable <code>{0!s}</code> is either not initialized correctly or mistaken for another variable. The list you append to should be initialized to an empty list.<br><br><i>(app_list_init)<i></br>".format(_target_.id))
                return True
    return False
def wrong_not_append_to_list():
    matches = find_matches("for ___ in ___:\n    _target_.append(___)")
    if matches:
        for match in matches:
            _target_ = match.get_std_name("_target_")
            if _target_.data_type != "List" and _target_.id != "___":
                explain("Values can only be appended to a list. The variable <code>{0!s}</code> is either not initialized, not initialized correctly, or is confused with another variable.<br><br><i>(app_not_list)<i></br>".format(_target_.id))
                return True
    return False
def append_list_wrong_slot():
    matches = find_matches("_target_.append(_item_)")
    if matches:
        for match in matches:
            _item_ = match.get_std_name("_item_")
            _target_ = match.get_std_name("_target_")
            if _item_.data_type == "List":
                explain("You should not append a list (<code>{0!s}</code>) to <code>{1!s}</code>.<br><br><i>(app_list_slot)<i></br>".format(_item_.id, _target_.id))
                return True
    return False

def histogram_argument_not_list():
    matches = find_matches("plt.hist(_argument_)")
    if matches:
        for match in matches:
            _argument_ = match.get_std_name("_argument_")
            if _argument_.data_type != "List":
                if _argument_.id == "___":
                    explain("Making a histogram requires a list; the list is missing.<br><br><i>(hist_arg_not_list_blank)<i></br>")
                    return True
                else:
                    explain("Making a histogram requires a list; <code>{0!s}</code> is not a list.<br><br><i>(hist_arg_not_list)<i></br>".format(_argument_.id))
                    return True
    return False
def histogram_wrong_list():
    matches = find_matches("for ___ in ___:\n    _target_.append(___)\nplt.hist(_list_)")
    if matches:
        for match in matches:
            _target_ = match.get_std_name("_target_")
            _list_ = match.get_std_name("_list_")
            if _target_.id != _list_.id:
                explain("The list created in the iteration is not the list being used to create the histogram.<br><br><i>(histo_wrong_list)<i></br>")
                return True
    return False
def histogram_missing():
    match = find_match("plt.hist(___)")
    if not match:
        explain("The program should display a histogram.<br><br><i>(histo_missing)<i></br>")
        return True
    return False
def plot_show_missing():
    match = find_match("plt.show()")
    if not match:
        explain("The plot must be explicitly shown to appear in the Printer area.<br><br><i>(plot_show_missing)<i></br>")
        return True
    return False

def m_append_group():
    missing_append_in_iteration()
    missing_append_list_initialization()
    wrong_append_list_initiatization()
    wrong_not_append_to_list()
    append_list_wrong_slot()
def m_histogram_group():
    histogram_argument_not_list()
    histogram_wrong_list()
    histogram_missing()
    plot_show_missing()
