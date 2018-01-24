from instructor import *
from instructor_utility import *

def ensure_prints(count):
    prints = find_function_calls('print')
    if not prints:
        gently("You are not using the print function!")
        return False
    elif len(prints) > count:
        gently("You are printing too many times!")
        return False
    elif len(prints) < count:
        gently("You are not printing enough things!")
        return False
    else:
        for a_print in prints:
            if not is_top_level(a_print):
                gently("You have a print function that is not at the top level. That is incorrect for this problem!")
                return False
    return prints
