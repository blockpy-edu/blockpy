from instructor import *
from instructor_utility import *

def files_not_handled_correctly(*filenames):
    if filenames and isinstance(filenames[0], int):
        num_filenames = filenames[0]
        actual_filenames = False
    else:
        num_filenames = len(filenames)
        actual_filenames = True
    ast = parse_program()
    calls = ast.find_all("Call")
    called_open = []
    closed = []
    for a_call in calls:
        if a_call.func.ast_name == 'Name':
            if a_call.func.id == 'open':
                if not a_call.args:
                    gently("You have called the <code>open</code> function without any arguments. It needs a filename.")
                    return True
                called_open.append(a_call)
            elif a_call.func.id == 'close':
                explain("You have attempted to call <code>close</code> as a function, but it is actually a method of the file object.")
                return True
        elif a_call.func.ast_name == 'Attribute':
            if a_call.func.attr == 'open':
                gently("You have attempted to call <code>open</code> as a method, but it is actually a built-in function.")
                return True
            elif a_call.func.attr == 'close':
                closed.append(a_call)
        
    if len(called_open) < num_filenames:
        gently("You have not opened all the files you were supposed to.")
        return True
    elif len(called_open) > num_filenames:
        gently("You have opened more files than you were supposed to.")
        return True
    withs = ast.find_all("With")
    if len(withs) + len(closed) < num_filenames:
        gently("You have not closed all the files you were supposed to.")
        return True
    elif len(withs) + len(closed) > num_filenames:
        gently("You have closed more files than you were supposed to.")
        return True
    if actual_filenames:
        ensure_literal(*filenames)
    return False
