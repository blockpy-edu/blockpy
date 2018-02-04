#Post-Test BlockPy #1: Sum
import school_scores
from post_test_feedbackAPI import *
from ins_test_8_5 import *
m_iteration_group()
m_missing_addition_slot_empty()
m_wrong_should_be_summing()
m_wrong_duplicate_var_in_add()
m_wrong_cannot_sum_list()
m_missing_summing_list()
m_missing_zero_initialization()
m_missing_no_print()
temps = school_scores.get("Test-takers","Year","2015")
total = sum(temps)
outputs = get_output()
if str(total) in outputs:
    if len(outputs) == 1:
        set_success()
    else:
        gently("The output of the total number of students is not in the correct place. The total total number of students should be output only once after the total number of students has been computed.<br><br><i>(print_placement)<i></br>")
else:
    gently("Not quite right!<br><br><i>(catch_all)<i></br>")
#####################
#Post-Test BlockPy #2: count filter
import state_demographics
from post_test_feedbackAPI import *
from ins_test_8_5 import *
def wrong_decision_body():
	match = find_match("if ___:\n    _targets_ = _targets_ + 1")
	if not match:
		explain("Your update statement is not in the correct place.<br><br><i>(dec_body)<i></br>")
		return True
	return False
def wrong_comparison():
	match = find_match("if __exp__:\n    pass")
	if match:
		__exp__ = match.get_std_exp("__exp__")
		if not __exp__.numeric_logic_check(1, "var > 28000"):
			explain("In this problem you should be finding per capita income above 28000 degrees.<br><br><i>(comp_py2)<i></br>")
			return True
	return False
m_iteration_group()
m_missing_zero_initialization()
m_missing_no_print()
match = find_match("for ___ in ___:\n    if ___:\n        pass")
if not match:
	explain("You need to evaluate a decision for each element of the list.<br><br><i>(extern_for)<i></br>")
wrong_compare_list()
wrong_for_inside_if()
wrong_comparison()
wrong_decision_body()
missing_if_in_for()
wrong_should_be_counting()
missing_counting_list()
capita_list = state_demographics.get("Per Capita Income","(None)",'')
high_capita = [x for x in capita_list if x>28000]
outputs = get_output()
if str(len(high_capita)) in outputs:
    if len(outputs) == 1:
        set_success()
    else:
        gently("The output of the total number of states is not in the correct place. The the total number of states should be output only once after the the total number of states has been computed.<br><br><i>(print_placement)<i></br>")
else:
    gently("Not quite right!<br><br><i>(catch_all)<i></br>")
###############
#Post-Test BlockPy #3: histogram w/conversion
import publishers
from instructor_utility import *
from ins_test_8_5 import *
from post_test_feedbackAPI import *

m_itergrp_2()
m_append_group()
def wrong_conversion():#this is actually kind of difficult to do in our language at the moment
    ast = parse_program()
    loops = ast.find_all("For")
    has_conversion = False
    conversion_var = ""
    for loop in loops:
        binops = loop.find_all("BinOp")
        iter_prop = loop.target
        conversion_var = iter_prop.id
        for binop in binops:
            if binop.has(iter_prop) and binop.has(0.94) and binop.op == "Mult":
                conversion_var = iter_prop.id
                has_conversion = True
                break
    if conversion_var != "" and not has_conversion:
        explain("The conversion of <code>{0!s}</code> to euros is not correct.<br><br><i>(conv_py3)<i></br>".format(conversion_var))
wrong_conversion()
m_histogram_group()
v = get_output()
if not ins_cont.plot_group_error():
    first_plot = v[0][0]
    if first_plot["type"] != "hist":
        explain("You should be making a histogram!<br><br><i>(not_histo)<i></br>")
    else:
        dollars_list = publishers.get("sale price","(None)",'')
        student_data = first_plot["data"]
        if len(student_data) != len(dollars_list):
            explain("The list you plotted has less data than the original list of publisher prices. That shoudn't be the case!<br><br><i>(dropped_value)<i></br>")
        for correct, theirs in zip(dollars_list, student_data):
            correct = correct * .94
            if abs(correct - theirs) > .1:
                gently("The numbers that you are plotting don't seem to be quite correct!<br><br><i>(catch_all)<i></br>")
        ins_cont.all_labels_present()
        set_success()