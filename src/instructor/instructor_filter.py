from instructor_utility import *
'''
Name: missing_if_in_for
Pattern:
missing
for <item> in ___ :
    if …<item> … :

Feedback: The arrangement of decision and iteration is not correct for the filter pattern.

'''
def missing_if_in_for():
	ast = parse_program()
	loops = ast.find_all("For")
	for loop in loops:
		iter_prop = loop.target
		ifs = loop.find_all("If")
		for if_block in ifs:
			if if_block.has(iter_prop):
				return False
	explain("The arrangement of decision and iteration is not correct for the filter pattern.")
	return True
'''
Name: append_not_in_if
Pattern:
missing
if … :
   ___.append(___)

Feedback: Only items satisfying some condition should be appended to the list.

'''
def append_not_in_if():
	ast = parse_program()
	ifs = ast.find_all("If")
	for if_block in ifs:
		calls = if_block.find_all("Call")
		for node in calls:
        	if node.func.attr == "append":
            	return False
    explain("Only items satisfying some condition should be appended to the list.")
    return True