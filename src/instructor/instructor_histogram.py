from instructor_utility import *
def histogram_group():
    histogram_argument_not_list()
    histogram_wrong_list()
    histogram_missing()
    plot_show_missing()
'''
Name: histogram_missing
Pattern:

Missing
   plt.hist(___)

Feedback: The program should display a histogram.

'''
def histogram_missing():
    ast = parse_program()
    calls = ast.find_all("Call")
    plotting = False
    for call in calls:
        if call.func.attr == "hist" and call.func.value.id == "plt":
            plotting = True
            break
    if plotting == False:
        explain("The program should display a histogram.<br><br><i>(histo_missing)<i></br>")
    return not plotting
'''
Name: plot_show_missing
Pattern:
Missing
   plt.show()

Feedback: The plot must be explicitly shown to appear in the Printer area.
'''
def plot_show_missing():
    ast = parse_program()
    calls = ast.find_all("Call")
    plotting = False
    for call in calls:
        if call.func.attr == "show" and call.func.value.id == "plt":
            plotting = True
            break
    if plotting == False:
        explain("The plot must be explicitly shown to appear in the Printer area.<br><br><i>(plot_show_missing)<i></br>")
    return not plotting
'''
Name: histogram_argument_not_list
Pattern:
   plt.hist(<argument>)
Where type(<argument>) is not "list"

Feedback: Making a histogram requires a list; <argument> is not a list.

'''
def histogram_argument_not_list():
    ast = parse_program()
    calls = ast.find_all("Call")
    arg_name = ""
    for call in calls:
        if call.func.attr == "hist" and call.func.value.id == "plt":
            arg = call.args[0]
            if arg != None and not (arg.data_type == "List" or arg.ast_name == "List"):
                arg_name = arg.id
                break
    if arg_name != "":
        if arg_name == "___":
            explain("Making a histogram requires a list; the list is missing.<br><br><i>(hist_arg_not_list_blank)<i></br>")
        else:
            explain("Making a histogram requires a list; <code>{0!s}</code> is not a list.<br><br><i>(hist_arg_not_list)<i></br>".format(arg_name))
    return arg_name != ""
'''
Name: histogram_wrong_list
Pattern:

for ___ in ___:
   <target>.append(___)
plt.hist(<list>)

where name(<target>) != name(<list>)

Feedback: The list created in the iteration is not the list being used to create the histogram.

'''

def histogram_wrong_list():
    ast = parse_program()
    loops = ast.find_all("For")
    append_targets = []
    for loop in loops:
        calls = loop.find_all("Call")
        for call in calls:
            if call.func.attr == "append":
                append_targets.append(call.func.value)
    all_proper_plot = True
    #should probably actually check for the location of plt.hist
    calls = ast.find_all("Call")
    for call in calls:
        if call.func.attr == "hist" and call.func.value.id == "plt":
            arg = call.args[0]
            proper_plot = False
            if arg.ast_name == "Name":
                for name in append_targets:
                    if name.id == arg.id:
                        proper_plot = True
                        break
                if not proper_plot:
                    all_proper_plot = False
                    break
            else:
                all_proper_plot = False
                break
    if not all_proper_plot:
        explain("The list created in the iteration is not the list being used to create the histogram.<br><br><i>(histo_wrong_list)<i></br>")
    return not all_proper_plot