# Gets the current output
get_output()

# Removes the current result of get_output in preparation of a run_code()
reset_output()

# Runs the student code
run_code()

# data: string
log(data)

# list of dictionaries, 
# {"line": int, "step" : int, "modules": list[string], "properties": list[dictionaries]}
# See get_property results for the dictionaries
trace

# string (students' code)
code

# Immediately exits and marks student as successful
set_success()

# message: string
# Immediately exits and marks student as incorrect
set_feedback(message)

# name: string
# returns a dictionary with "type", "name", "value"
get_property(name)

# code: string (always just pass the code variable from above)
# name: string (the capitalized name of the component e.g., "For")
# Counts the number of statements
# https://greentreesnakes.readthedocs.io/en/latest/nodes.html#control-flow
count_components(code, name)

# code: string (always just pass the code variable from above)
# name: string (the name of a function, e.g., "print")
calls_function(code, name)

# name: string (the name of the variable we are looking for)
# Returns the final value of a property
get_value_by_name(name)

# type: a Python type (e.g,. int, float, str, list)
# Returns a list of all the values of that type
get_value_by_type(type)

# code: string (always just pass the code variable from above)
# Returns true if there are any numeric literals besides 0 or 1 outside of any List literals
no_nonlist_nums(code)