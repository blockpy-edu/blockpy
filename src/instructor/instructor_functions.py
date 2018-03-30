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
    
GREEN_CHECK = "<td style='font-weight: bold;color: green;text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;'>&#10004;</td>"
RED_X = "<td>&#10060;</td>"
def output_test(name, *tests):
    if name in student.data:
        the_function = student.data[name]
        if callable(the_function):
            result = ("<table class='blockpy-feedback-unit table table-condensed table-bordered table-hover'>"
                      "<tr class='active'><th></th><th>Arguments</th><th>Expected</th><th>Actual</th></tr>"
                      )
            success = True
            success_count = 0
            for test in tests:
                inp = test[:-1]
                inputs = ', '.join(["<code>{}</code>".format(repr(i)) for i in inp])
                out = test[-1]
                tip = ""
                if isinstance(out, tuple):
                    tip = out[1]
                    out = out[0]
                template = "<td><code>{}</code></td>"+("<td><pre>{}</pre></td>"*2)
                reset_output()
                the_function(*inp)
                test_out = get_output()
                if isinstance(out, str):
                    if len(test_out) < 1:
                        message = template.format(inputs, repr(out), "<i>No output</i>", tip)
                        message = "<tr class=''>"+RED_X+message+"</tr>"
                        if tip:
                            message += "<tr class='info'><td colspan=4>"+tip+"</td></tr>"
                        success = False
                    elif len(test_out) > 1:
                        message = template.format(inputs, repr(out), "<i>Too many outputs</i>", tip)
                        message = "<tr class=''>"+RED_X+message+"</tr>"
                        if tip:
                            message += "<tr class='info'><td colspan=4>"+tip+"</td></tr>"
                        success = False
                    elif out not in test_out:
                        message = template.format(inputs, repr(out), repr(test_out[0]), tip)
                        message = "<tr class=''>"+RED_X+message+"</tr>"
                        if tip:
                            message += "<tr class='info'><td colspan=4>"+tip+"</td></tr>"
                        success = False
                    else:
                        message = template.format(inputs, repr(out), repr(test_out[0]), tip)
                        message = "<tr class=''>"+GREEN_CHECK+message+"</tr>"
                        success_count += 1
                elif out != test_out:
                    message = template.format(inputs, repr(out), repr(test_out[0]), tip)
                    message = "<tr class=''>"+RED_X+message+"</tr>"
                    if tip:
                        message += "<tr class='info'><td colspan=4>"+tip+"</td></tr>"
                    success = False
                result += message
            if success:
                return the_function
            else:
                result = "I ran your function <code>{}</code> on some new arguments, and it gave the wrong output {}/{} times.".format(name, len(tests)-success_count, len(tests))+result
                gently(result+"</table>")
                return None
        else:
            gently("You defined {}, but did not define it as a function.".format(name))
            return None
    else:
        gently("The function <code>{}</code> was not defined.".format(name))
        return None

    
'''
Show a table
'''
def unit_test(name, *tests):
    if name in student.data:
        the_function = student.data[name]
        if callable(the_function):
            result = ("<table class='blockpy-feedback-unit table table-condensed table-bordered table-hover'>"
                      "<tr class='active'><th></th><th>Arguments</th><th>Returned</th><th>Expected</th></tr>"
                      )
            success = True
            success_count = 0
            for test in tests:
                inp = test[:-1]
                inputs = ', '.join(["<code>{}</code>".format(repr(i)) for i in inp])
                out = test[-1]
                tip = ""
                if isinstance(out, tuple):
                    tip = out[1]
                    out = out[0]
                message = ("<td><code>{}</code></td>"*3)
                test_out = the_function(*inp)
                message = message.format(inputs, repr(test_out), repr(out))
                if (isinstance(out, float) and 
                    isinstance(test_out, (float, int)) and
                    abs(out-test_out) < DELTA):
                    message = "<tr class=''>"+GREEN_CHECK+message+"</tr>"
                    success_count += 1
                elif out != test_out:
                    #gently(message)
                    message = "<tr class=''>"+RED_X+message+"</tr>"
                    if tip:
                        message += "<tr class='info'><td colspan=4>"+tip+"</td></tr>"
                    success = False
                else:
                    message = "<tr class=''>"+GREEN_CHECK+message+"</tr>"
                    success_count += 1
                result += message
            if success:
                return the_function
            else:
                result = "I ran your function <code>{}</code> on some new arguments, and it failed {}/{} tests.".format(name, len(tests)-success_count, len(tests))+result
                gently(result+"</table>")
                return None
        else:
            gently("You defined {}, but did not define it as a function.".format(name))
            return None
    else:
        gently("The function <code>{}</code> was not defined.".format(name))
        return None
