from instructor import *

DELTA = 0.001

def match_signature(name, length, *parameters):
    ast = parse_program()
    defs = ast.find_all('FunctionDef')
    for a_def in defs:
        if a_def._name == name:
            found_length = len(a_def.args.args)
            if found_length < length:
                gently("The function named <code>{}</code> has fewer parameters ({}) than expected ({}).".format(name, found_length, length))
            elif found_length > length:
                gently("The function named <code>{}</code> has more parameters ({}) than expected ({}).".format(name, found_length, length))
            elif parameters:
                for parameter, arg in zip(parameters, a_def.args.args):
                    if arg.id != parameter:
                        gently("Error in definition of <code>{}</code>. Expected a parameter named {}, instead found {}.".format(name, parameter, arg.id))
                else:
                    return a_def
            else:
                return a_def
    else:
        gently("No function named <code>{}</code> was found.".format(name))
    return None
    
def unit_test(name, *tests):
    if name in student.data:
        the_function = student.data[name]
        if callable(the_function):
            for test in tests:
                inp = test[:-1]
                out = test[-1]
                tip = ""
                if isinstance(out, tuple):
                    tip = "<br><br>"+out[1]
                    out = out[0]
                message = "Your <code>{}</code> function did not produce the correct output for the values {}.<br>Expected: <code>{}</code><br>Actual: <code>{}</code>{}"
                test_out = the_function(*inp)
                inputs = ', '.join(["<code>{}</code>".format(repr(i)) for i in inp])
                message = message.format(name, inputs, repr(out), repr(test_out), tip)
                if (isinstance(out, float) and 
                    isinstance(test_out, (float, int)) and
                    abs(out-test_out) < DELTA):
                    continue
                elif out != test_out:
                    gently(message)
                    return None
            else:
                return the_function
        else:
            gently("You defined {}, but did not define it as a function.".format(name))
            return None
    else:
        gently("The function <code>{}</code> was not defined.".format(name))
        return None
