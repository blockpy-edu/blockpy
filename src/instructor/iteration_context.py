from instructor_utility import *
import instructor_append as append_api
#################8.2 Start#######################
def list_length_3_or_more():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    for assignment in assignments:
        right = assignment.value
        left = assignment.targets
        if right.ast_name == "List" and left.ast_name == "Name":
            if len(right.elts) < 3:
                explain("You must have at least three pieces")
def missing_list_initialization_8_2():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    isMissing = True
    for assignment in assignments:
        right = assignment.value
        left = assignment.targets
        if left.id == "shopping_cart":
            if right.ast_name == "List":
                isMissing = False
                break
    if isMissing:
        explain("You must set the property shopping_cart to a list containing the prices of items in the shopping cart.")
#################8.2 End#######################
#################8.3 Start#######################
def wrong_list_initialization_placement_8_3():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    is_placed_wrong = True
    lineno = None
    for assignment in assignments:
        right = assignment.value
        left = assignment.targets
        if left.id == "episode_length_list":
            lineno = left.lineno
    loops = ast.find_all("For")
    for loop in loops:
        if loop.lineno > lineno:
            is_placed_wrong = False
    if is_placed_wrong:
        explain("The list of episode lengths (episode_length_list) must be initialized before the iteration which uses this list.")
    return True
def wrong_accumulator_initialization_placement_8_3():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    is_placed_wrong = True
    lineno = None
    for assignment in assignments:
        right = assignment.value
        left = assignment.targets
        if left.id == "sum_length" and right.ast_name == "Num" and right.n == 0:
            lineno = left.lineno
    loops = ast.find_all("For")
    for loop in loops:
        if lineno == None: 
            break
        if loop.lineno > lineno:
            is_placed_wrong = False
    if is_placed_wrong:
        explain("The property to hold the sum of the episode lengths (sum_length) must be initialized before the iteration which uses this property.")
    return is_placed_wrong 
def wrong_print_8_3():
    ast = parse_program()
    for_loops = ast.find_all("For")
    has_for = len(for_loops) > 0
    for_loc = []
    wrong_print_placement = True
    for loop in for_loops:
        end_node = loop.next_tree
        if end_node != None:
            for_loc.append(end_node.lineno)
    calls = ast.find_all("Call")
    for call in calls:
        if call.func.id == "print":
            for loc in for_loc:
                if call.func.lineno >= loc:
                    wrong_print_placement = False
                    break
            if not wrong_print_placement:
                break
    if wrong_print_placement:
        explain("The output of the total length of time is not in the correct place. The total length of time should be output only once after the total length of time has been computed.")

#################8.3 End#######################
#################8.4 Start#######################
def missing_target_slot_empty_8_4():
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        iter_prop = loop.target
        if iter_prop.id == "___":
            explain("You must fill in the empty slot in the iteration.")
            return False
    return True
def missing_addition_slot_empty_8_4():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    for assignment in assignments:
        left = assignment.targets
        right = assignment.value
        if left.id == "sum_pages":
            binOp = right.find_all("BinOp")
            if len(binOp) == 1:
                binOp = binOp[0]
                if binOp.op == "Add":
                    if binOp.left.ast_name == "Name" and binOp.right.ast_name == "Name":
                        if binOp.has(left):
                            if binOp.left.id == "___" or binOp.right.id == "___":
                                explain("You must fill in the empty slot in the addition.")
                                return True
    return False
def wrong_names_not_agree_8_4():
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        iter_prop = loop.target
        list_prop = loop.iter
        if list_prop.ast_name == "Name" and iter_prop.ast_name == "Name":
            assignments = loop.find_all("Assign")
            for assignment in assignments:
                binops = assignment.find_all("BinOp")
                if len(binops) > 0:
                    lhs = assignment.targets
                    if lhs.ast_name == "Name" and lhs.id == "sum_pages":
                        for binop in binops:
                            if binop.has(lhs) and binop.op == "Add":
                                if not binop.has(iter_prop):
                                    explain("Each value of name(%s) must be added to %s." %(iter_prop.id, lhs.id))
                                    return True
    return False
#################8.4 End#######################
def wrong_should_be_counting():#This doesn't do as it is intended to do!
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        iter_prop = loop.target
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            binops = assignment.find_all("BinOp")
            for binop in binops:
                if binop.has(iter_prop) and binop.op == "Add":
                    explain("This problem asks for the number of items in the list not the total of all the values in the list.")
def wrong_should_be_summing():#this doesn't do as it is intended to do!
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            binops = assignment.find_all("BinOp")
            for binop in binops:
                if binop.has(1) and binop.op == "Add":
                    explain("This problem asks for the total of all the values in the list not the number of items in the list.")
def wrong_cannot_sum_list():
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        list_prop = loop.iter
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            binops = assignment.find_all("BinOp")
            for binop in binops:
                if binop.has(list_prop) and binop.op == "Add":
                    explain("Addition can only be done with a single value at a time, not with an entire list at one time.")
def missing_no_print():
    prints = find_function_calls('print')
    if not prints:
        explain("Program does not output anything.")
def missing_counting_list():
    ast = parse_program()
    has_count = False
    for_loops = ast.find_all("For")
    if len(for_loops) > 0:
        for loop in for_loops:
            assignments = loop.find_all("Assign")
            if len(assignments) < 1:
                continue
            for assignment in assignments:
                binops = assignment.find_all("BinOp")
                if len(binops) < 1:
                    continue
                lhs = assignment.targets
                for binop in binops:
                    if binop.has(lhs) and binop.has(1) and binop.op == "Add":
                        has_count = True
    if not has_count:
        explain("Need to find the total number of items in the list.")
def missing_summing_list():
    ast = parse_program()
    has_total = False
    for_loops = ast.find_all("For")
    if len(for_loops) > 0:
        for loop in for_loops:
            assignments = loop.find_all("Assign")
            if len(assignments) < 1:
                continue
            iter_prop = loop.target
            for assignment in assignments:
                binops = assignment.find_all("BinOp")
                if len(binops) < 1:
                    continue
                lhs = assignment.targets
                for binop in binops:
                    if binop.has(lhs) and binop.has(iter_prop) and binop.op == "Add":
                        has_total = True
    if not has_total:
        explain("Need to find the total of all list elements.")
def missing_zero_initialization():
    ast = parse_program()
    for_loops = ast.find_all("For")
    accumulator = None
    loop_acu = None
    for loop in for_loops:
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            binops = assignment.find_all("BinOp")
            if len(binops) > 0:
                lhs = assignment.targets
                for binop in binops:
                    if binop.has(lhs) and binop.op == "Add":
                        accumulator = lhs
                        loop_acu = loop
    accu_init = False
    if accumulator != None:
        assignments = ast.find_all("Assign")
        for assignment in assignments:
            if loop_acu.lineno > assignment.lineno:
                lhs = assignment.targets
                if lhs.id == accumulator.id and assignment.has(0):
                    accu_init = True
                    break
    if accu_init == False and accumulator != None:
        explain("The addition on the first iteration step is not correct because the property <b>%s</b> does not have an initial value." %(accumulator.id,accumulator.id))
        return False
    return True
#################AVERAGE START###############
def missing_average():
    ast = parse_program()
    for_loops = ast.find_all("For")
    has_for = len(for_loops) > 0
    has_average = False
    for_loc = []
    for loop in for_loops:
        end_node = loop.next_tree
        if end_node != None:
            for_loc.append(end_node.lineno)
    if has_for:
        assignments = ast.find_all("Assign")
        if len(assignments) > 0:
            for assignment in assignments:
                binops = assignment.find_all("BinOp")
                lhs = assignment.targets
                if len(binops) != 1:
                    continue
                binop = binops[0]
                if binop.op != "Div":
                    continue
                is_after = False
                for lineno in for_loc:
                    if lineno <= binop.lineno:
                        is_after = True
                        break
                if not is_after:
                    break
                right = binop.right
                left = binop.left
                if right.ast_name == "Name" and left.ast_name == "Name":
                    if right.id != left.id and right.id != lhs.id and left.id != lhs.id:
                        has_average = True
                        break
    if not has_average:
        explain("An average value is not computed")
def warning_average_in_iteration():
    ast = parse_program()
    for_loops = ast.find_all("For")
    for loop in for_loops:
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            binops = assignment.find_all("BinOp")
            for binop in binops:
                if binop.op == "Div":
                    assName = assignment.targets
                    numerator = binop.left
                    denominator = binop.right
                    if numerator.ast_name == "Name" and denominator.ast_name == "Name":
                        explain("An average value is best computed after the properties name %s(total) and name(%s) are completely known rather than recomputing the average on each iteration." %(numerator.id,denominator.id))
def wrong_average_demoninator():
    ast = parse_program()
    for_loops = ast.find_all("For")
    count_vars = []
    loc_array = []
    for loop in for_loops:
        iter_prop = loop.target
        end_node = loop.next_tree
        if end_node == None:
            continue
        loc = end_node.lineno
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            if assignment.has(1):
                ass_left = assignment.targets
                ass_right = assignment.value
                if ass_right.ast_name == "BinOp" and ass_right.op == "Add":
                    if ass_right.has(ass_left):
                        count_vars.append(ass_left)
                        loc_array.append(loc)
    assignments = ast.find_all("Assign")
    denominator_wrong = False
    for assignment in assignments:
        index = 0
        for loc in loc_array:
            if assignment.lineno >= loc and assignment.value.ast_name == "BinOp":
                ass_left = assignment.targets
                binop = assignment.value
                if binop.op == "Div" and not binop.has(ass_left):
                    numerator = assignment.value.left
                    denominator = assignment.value.right
                    if numerator.id != denominator.id and denominator.id != count_vars[index].id:
                        denominator_wrong = True
            if denominator_wrong:
                break
            index = index + 1
        if denominator_wrong:
            break
    if denominator_wrong:
        explain("The average is not calculated correctly.")
    return denominator_wrong
def wrong_average_numerator():
    ast = parse_program()
    for_loops = ast.find_all("For")
    total_vars = []
    loc_array = []
    for loop in for_loops:
        iter_prop = loop.target
        end_node = loop.next_tree
        if end_node == None:
            continue
        loc = end_node.lineno
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            if assignment.has(iter_prop):
                ass_left = assignment.targets
                ass_right = assignment.value
                if ass_right.ast_name == "BinOp" and ass_right.op == "Add":
                    if ass_right.has(ass_left):
                        total_vars.append(ass_left)
                        loc_array.append(loc)
    assignments = ast.find_all("Assign")
    numerator_wrong = False
    for assignment in assignments:
        index = 0
        for loc in loc_array:
            if assignment.lineno >= loc and assignment.value.ast_name == "BinOp":
                ass_left = assignment.targets
                binop = assignment.value
                if binop.op == "Div" and not binop.has(ass_left):
                    numerator = assignment.value.left
                    denominator = assignment.value.right
                    if numerator.id != denominator.id and numerator.id != total_vars[index].id:
                        numerator_wrong = True
            if numerator_wrong:
                break
            index = index + 1
        if numerator_wrong:
            break
    if numerator_wrong:
        explain("The average is not calculated correctly.")
    return numerator_wrong
########################AVERAGE END###########################
def wrong_compare_list():
    ast = parse_program()
    for_loops = ast.find_all("For")
    is_comparing_list = False
    offending_list = ""
    for loop in for_loops:
        list_prop = loop.iter
        ifs = ast.find_all("If")
        for if_block in ifs:
            if if_block.test.has(list_prop):
                is_comparing_list = True
                offending_list = list_prop.id
                break
        if is_comparing_list:
            break
    if is_comparing_list:
        explain("Each item in the list name(%s) must be compared one item at a time." %(offending_list))
    return is_comparing_list
def wrong_for_inside_if():
    ast = parse_program()
    if_blocks = ast.find_all("If")
    if_inside_for = False
    for if_block in if_blocks:
        loops = if_block.find_all("For")
        if len(loops) > 0:
            if_inside_for = True
            break
    if if_inside_for:
        explain("The iteration should not be inside the decision block.")
    return if_inside_for
###########################9.1 START############################
def wrong_list_initialization_9_1():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    has_call = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_list":
            call = assignment.find_all("Call")
            if len(call) == 1:
                args = call.args
                if len(args) == 3:
                    if args[0] == "Precipitation" and args[1] == "Location" and args[2] == "Blacksburg, VA":
                        has_call = True
                        break
    if not has_call:
        explain("The list of rainfall amounts (rainfall_list) is not initialized properly.")
    return not has_call
def wrong_accumulator_initialization_9_1():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    has_assignment = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_sum" and assignment.value.ast_name == "Num":
            if assignment.value.n == 0:
                has_assignment = True
                break
    if not has_assignment:
        explain("The property to hold the total value of the rainfall amounts (rainfall_sum) is not initialized properly.")
    return not has_assignment
def wrong_accumulation_9_1():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    has_assignment = False
    for assignment in assignments:
        target = assignment.targets
        if target.id == "rainfall_sum":
            if assignment.value.ast_name == "BinOp":
                binop = assignment.value
                if binop.op == "Add":
                    left = binop.left
                    right = binop.right
                    if (left.id == "rainfall_sum" or right.id == "rainfall_sum") and (left.id == "rainfall" or right.id == "rainfall"):
                        has_assignment = True
                        break
    if not has_assignment:
        explain("The addition of each rainfall amount to rainfall_sum is not correct.")
    return not has_assignment
def wrong_list_initialization_placement_9_1():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    loops = ast.find_all("For")
    list_init = None
    init_after_loop = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_list":
            list_init = assignment
            break
    if list_init != None:
        for loop in loops:
            if loop.lineno > list_init.lineno:
                init_after_loop = True
                break
    if list_init == None or not init_after_loop:
        explain("The list of rainfall amount (rainfall_list) must be initialized before the iteration that uses this list.")
def wrong_accumulator_initialization_placement_9_1():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    loops = ast.find_all("For")
    list_init = None
    init_after_loop = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_sum":
            list_init = assignment
            break
    for loop in loops:
        if loop.lineno > list_init.lineno:
            init_after_loop = True
            break
    if list_init == None or not init_after_loop:
        explain("The property for the sum of all the rainfall amounts (rainfall_sum) must be initialized before the iteration which uses this property.")
def wrong_iteration_body_9_1():
    ast = parse_program()
    loops = ast.find_all("For")
    assignment_in_for = False
    for loop in loops:
        assignments = loop.find_all("Assign")
        for assignment in assignments:
            if assignment.targets.id == "rainfall_sum":
                assignment_in_for = True
                break
        if assignment_in_for:
            break
    if not assignment_in_for:
        explain("The addition of each rainfall amount to the total rainfall is not in the correct place.")
def wrong_print_9_1():
    ast = parse_program()
    for_loops = ast.find_all("For")
    has_for = len(for_loops) > 0
    for_loc = []
    wrong_print_placement = True
    for loop in for_loops:
        end_node = loop.next_tree
        if end_node != None:
            for_loc.append(end_node.lineno)
    calls = ast.find_all("Call")
    for call in calls:
        if call.func.id == "print":
            for loc in for_loc:
                if call.func.lineno >= loc:
                    wrong_print_placement = False
                    break
            if not wrong_print_placement:
                break
    if wrong_print_placement:
        explain("The output of the total rainfall amount is not in the correct place. The total rainfall should be output only once after the total rainfall has been computed.")
###########################9.1 END############################
###########################9.2 START############################
def wrong_list_initialization_9_2():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    has_call = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_list":
            call = assignment.find_all("Call")
            if len(call) == 1:
                args = call.args
                if len(args) == 3:
                    if args[0] == "Precipitation" and args[1] == "Location" and args[2] == "Blacksburg, VA":
                        has_call = True
                        break
    if not has_call:
        explain("The list of rainfall amounts (rainfall_list) is not initialized properly.")
    return not has_call
def wrong_accumulator_initialization_9_2():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    has_assignment = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_count" and assignment.value.ast_name == "Num":
            if assignment.value.n == 0:
                has_assignment = True
                break
    if not has_assignment:
        explain("The property to hold the total value of the rainfall amounts (rainfall_count) is not initialized properly.")
    return not has_assignment
def wrong_accumulation_9_2():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    has_assignment = False
    for assignment in assignments:
        target = assignment.targets
        if target.id == "rainfall_count":
            if assignment.value.ast_name == "BinOp":
                binop = assignment.value
                if binop.op == "Add":
                    left = binop.left
                    right = binop.right
                    if (left.id == "rainfall_count" or right.id == "rainfall_count") and (left.ast_name == "Num" or right.ast_name == "Num"):
                        if left.ast_name == "Num":
                            num_node = left
                        else:
                            num_node = right
                        if num_node.n == 1:
                            has_assignment = True
                        break
    if not has_assignment:
        explain("The adding of another day with rainfall to the total count of days with rainfall (rainfall_count) is not correct.")
    return not has_assignment
def wrong_list_initialization_placement_9_2():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    loops = ast.find_all("For")
    list_init = None
    init_after_loop = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_list":
            list_init = assignment
            break
    for loop in loops:
        if loop.lineno > list_init.lineno:
            init_after_loop = True
            break
    if list_init == None or not init_after_loop:
        explain("The list of rainfall amount (rainfall_list) must be initialized before the iteration that uses this list.")
def wrong_accumulator_initialization_placement_9_2():
    ast = parse_program()
    assignments = ast.find_all("Assign")
    loops = ast.find_all("For")
    list_init = None
    init_after_loop = False
    for assignment in assignments:
        if assignment.targets.id == "rainfall_count":
            list_init = assignment
            break
    if list_init != None:
        for loop in loops:
            if loop.lineno > list_init.lineno:
                init_after_loop = True
                break
    if list_init == None or not init_after_loop:
        explain("The property for the count of the number of days having rain (rainfall_count) must be initialized before the iteration which uses this property.")
def wrong_iteration_body_9_2():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_if = False
    for loop in loops:
        if_blocks = loop.find_all("If")
        for if_block in if_blocks:
            test = if_block.test
            if test.numeric_logic_check(1, "var > 0"):
                correct_if = True
                break
        if correct_if:
            break
    if not correct_if:
        explain("The test (if) to determine if a given amount of rainfall is greater than (>) zero is not in the correct place.")
    return not correct_if
def wrong_decision_body_9_2():
    ast = parse_program()
    if_blocks = ast.find_all("If")
    assignment_in_if = False
    for if_block in if_blocks:
        test = if_block.test
        if test.numeric_logic_check(1, "var > 0"):
            assignments = if_block.find_all("Assign")
            for assignment in assignments:
                if assignment.targets.id == "rainfall_count":
                    if assignment.value.ast_name == "BinOp":
                        binop = assignment.value
                        if binop.has(1) and binop.has(assignment.targets):
                            assignment_in_if = True
                            break
        if assignment_in_if:
            break
    if not assignment_in_if:
        explain("The increase by 1 in the number of days having rainfall (rainfall_count) is not in the correct place.")
def wrong_print_9_2():
    ast = parse_program()
    for_loops = ast.find_all("For")
    has_for = len(for_loops) > 0
    for_loc = []
    wrong_print_placement = True
    for loop in for_loops:
        end_node = loop.next_tree
        if end_node != None:
            for_loc.append(end_node.lineno)
    calls = ast.find_all("Call")
    for call in calls:
        if call.func.id == "print":
            for loc in for_loc:
                if call.func.lineno >= loc:
                    wrong_print_placement = False
                    break
            if not wrong_print_placement:
                break
    if wrong_print_placement:
        explain("The output of the total number of days with rainfall is not in the correct place. The total number of days should be output only once after the total number of days has been computed.")
    return wrong_print_placement
###########################9.2 END############################
###########################9.6 START############################
def wrong_comparison_9_6():
    ast = parse_program()
    if_blocks = ast.find_all("If")
    if_error = False
    for if_block in if_blocks:
        if not if_block.has(80):
            if_error = True
            break
        elif not if_block.test.numeric_logic_check(1, "var > 80"):
            if_error = True
            break
    if if_error:
        explain("In this problem you should be finding temperatures above 80 degrees.")
    return if_error
###########################9.6 END############################
###########################10.2 START############################
def wrong_conversion_10_2():
    ast = parse_program()
    loops = ast.find_all("For")
    has_conversion = False
    conversion_var = ""
    for loop in loops:
        binops = loop.find_all("BinOp")
        iter_prop = loop.target
        conversion_var = iter_prop.id
        for binop in binops:
            if binop.has(iter_prop) and binop.has(0.4) and binop.op == "Mult":
                conversion_var = iter_prop.id
                has_conversion = True
                break
    if conversion_var != "" and not has_conversion:
        explain("The conversion of %s to inches is not correct." %(conversion_var))
###########################10.2 END############################
###########################10.3 START############################
def wrong_filter_condition_10_3():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_if = False
    for loop in loops:
        if_blocks = loop.find_all("If")
        for if_block in if_blocks:
            test = if_block.test
            if test.numeric_logic_check(1, "var > 0") or test.numeric_logic_check(1, "var != 0"):
                correct_if = True
                break
    if not correct_if:
        explain("The condition used to filter the year when artists died is not correct.")
    return not correct_if
###########################10.3 END############################
###########################10.4 START############################
def wrong_and_filter_condition_10_4():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_if = False
    for loop in loops:
        if_blocks = loop.find_all("If")
        for if_block in if_blocks:
            test = if_block.test
            if test.numeric_logic_check(1, "32 <= temp && temp <= 50"):
                correct_if = True
                break
    if not correct_if:
        explain("The condition used to filter the temperatures into the specified range of temperatures is not correct.")
    return not correct_if
def wrong_nested_filter_condition_10_4():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_if = False
    for loop in loops:
        if_blocks = loop.find_all("If")
        for if_block in if_blocks:
            test1 = if_block.test
            if_blocks2 = if_block.find_all("If")
            for if_block2 in if_blocks2:
                test2 = if_block2.test
                if test1.numeric_logic_check(1, "32 <= temp") and test2.numeric_logic_check(1,"temp <= 50"):
                    correct_if = True
                    break
                elif test2.numeric_logic_check(1, "32 <= temp") and test1.numeric_logic_check(1,"temp <= 50"):
                    correct_if = True
                    break
    if not correct_if:
        explain("The decisions used to filter the temperatures into the specified range of temperatures is not correct.")
    return not correct_if
###########################10.4 END############################
#########################10.5 START###############################
def wrong_conversion_problem_10_5():
    ast = parse_program()
    loops = ast.find_all("For")
    is_wrong_conversion = False
    for loop in loops:
        iter_prop = loop.target
        binops = loop.find_all("BinOp")
        for binop in binops:
            if not (binop.op == "Mult" and binop.has(iter_prop) and binop.has(0.62)):
                is_wrong_conversion = True
                break
        if is_wrong_conversion:
            break
    if is_wrong_conversion:
        log("wrong_conversion_problem_10_5")
        explain("The conversion from kilometers to miles is not correct.")
def wrong_filter_problem_atl1_10_5():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_filter = False
    for loop in loops:
        iter_prop = loop.target
        if_blocks = loop.find_all("If")
        for if_block in if_blocks:
            cond = if_block.test
            append_list = append_api.find_append_in(if_block)
            for append in append_list:
                expr = append.args[0]
                #this check seens unnecessary
                if expr.ast_name == "BinOp" and expr.op == "Mult" and expr.has(0.62) and expr.has(iter_prop):
                    if not cond.numeric_logic_check(0.1, "var * 0.62 > 10"):
                        log("wrong_filter_problem_atl1_10_5")
                        explain("You are not correctly filtering out values from the list.")
def wrong_filter_problem_atl2_10_5():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_filter = False
    for loop in loops:
        iter_prop = loop.target
        assignments = loop.find_all("Assign")
        if_blocks = loop.find_all("If")
        for assignment in assignments:
            for if_block in if_blocks:
                if if_block.lineno > assignment.lineno:
                    miles = assignment.targets
                    expr = assignment.value
                    cond = if_block.test
                    append_list = append_api.find_append_in(if_block)
                    for append in append_list:
                        if append.has(miles):
                            if expr.ast_name == "BinOp" and expr.op == "Mult" and expr.has(0.62) and expr.has(iter_prop):
                                if not cond.numeric_logic_check(0.1, "var > 10"):
                                    log("wrong_filter_problem_atl2_10_5")
                                    explain("You are not correctly filtering out values from the list.")
def wrong_append_problem_atl1_10_5():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_filter = False
    for loop in loops:
        iter_prop = loop.target
        if_blocks = loop.find_all("If")
        for if_block in if_blocks:
            cond = if_block.test
            append_list = append_api.find_append_in(if_block)
            for append in append_list:
                expr = append.args[0]
                #this is an approximation of what's written in the code because we don't have tree matching
                cond_binops = cond.find_all("BinOp")
                if len(cond_binops) == 1:
                    if not (expr.ast_name == "BinOp" and expr.op == "Mult" and expr.has(0.62) and expr.has(iter_prop)):
                        #if not cond.numeric_logic_check(0.1, "var * 0.62 > 10"):#in theory should check this
                        log("wrong_append_problem_atl1_10_5")
                        explain("You are not appending the correct values.")
def wrong_append_problem_atl2_10_5():
    ast = parse_program()
    loops = ast.find_all("For")
    correct_filter = False
    for loop in loops:
        iter_prop = loop.target
        assignments = loop.find_all("Assign")
        if_blocks = loop.find_all("If")
        for assignment in assignments:
            for if_block in if_blocks:
                if if_block.lineno > assignment.lineno:
                    miles = assignment.targets
                    expr = assignment.value
                    cond = if_block.test
                    append_list = append_api.find_append_in(if_block)
                    for append in append_list:
                        append_var = append.args[0]
                        if expr.ast_name == "BinOp" and expr.op == "Mult" and expr.has(0.62) and expr.has(iter_prop):
                            if cond.numeric_logic_check(0.1, "var > 10"):
                                if append_var.ast_name == "Name" and append_var.id != miles.id:
                                    log("wrong_append_problem_atl2_10_5")
                                    explain("You are not appending the correct values")
#########################10.5 END###############################
def wrong_debug_10_6():
    ast = parse_program()
    #cheating because using length of 1
    loops = ast.find_all("For")
    bad_change = False
    if len(loops) != 1:
        bad_change = True
    else:
        append_calls = append_api.find_append_in(loops[0])
        if len(append_calls) != None:
        	bad_change = True
    if not bad_change:
        item = loops[0].target
        list1 = loops[0].iter
        list2 = append_calls[0].func.value.id
        if list1.id != "quakes" or list2.id != "quakes_in_miles":
            bad_change = True
    if bad_change:
        explain("This is not one of the two changes needed. Undo the change and try again.")
def wrong_debug_10_7():
    ast = parse_program()
    if_blocks = ast.find_all("If")
    if len(if_blocks) > 1 or if_blocks[0].test.left.id != "book":
        explain("This is not the change needed. Undo the change and try again.")
