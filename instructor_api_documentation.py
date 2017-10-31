'''
This file documents the Python Instructor API. 
The format is Google Style Python Docstrings, based on
`http://sphinxcontrib-napoleon.readthedocs.io/en/latest/example_google.html`


'''


## Core functions

def compliment(message):
    '''
    Adds message to the list of complimentary feedback.
    
    Args:
        message (str): The text string to display to the user in the Feedback 
                       panel as complimentary feedback. This will appear as 
                       a tooltip.
        
    '''

def set_success():
    '''
    Marks the problem as completely correct. This immediately ends execution 
    by throwing a GracefulExit exception.
    '''

def explain(message, priority="medium", line=None):
    '''
    Gives student the message as corrective feedback (and higlights line 
    number). If this function is called multiple times, the student is given the
    first feedback of the highest priority found. By default, this overrides
    the analyzer and runtime errors that are given - if you want to avoid overriding
    those, then use `gently`.
    
    Args:
        message (str): The HTML string to display to the user in the Feedback
                       panel as corrective feedback. 
		priority (str): Either "low", "medium", or "high", indicating the
                        ordering of the feedback if multiple occur. Also "student"
                        is an option to put it after the analyzer and runtime
                        errors, and "verifier" will put it before syntax errors.
		line (int): The specific line number to highlight for the user.
    '''

def gently(message):
    '''
    Gives students the message as corrective feedback, at a priority level
    below the analyzer and runtime errors - that way, it can be used to
    more "gently" guide the student.
    '''

def suppress(type, subtype):
    '''
    Suppresses feedback of the given "type".  When also given a subtype, it
    instead suppresses the subtype (which is typically a specific error message
    or type of exception). Multiple subtypes can be specified with multiple
    calls, each call suppressing additional feedback.
    
    Args:
        type (str): Either 'verifier', 'parser', 'analyzer', or 'student',
                    corresponding to the phase of execution feedback that will
                    be suppressed.
        subtype (str): A specific type of exception (if 'student') or
                       specific type of issue (if 'analyzer'). Available issues:
                        - 'Unconnected blocks'
                        - 'Iteration variable is iteration list'
                        - "Undefined variables"
                        - "Possibly undefined variables"
                        - "Unread variables"
                        - "Overwritten variables"
                        - "Empty iterations"
                        - "Non-list iterations"
                        - "Incompatible types"
    '''
    
def run_student():
    '''
    Reruns the students' submitted code ("__main__") as a function call.
    This allows the instructor to run the student code under new conditions.
    After a call to run_student(), the instructor will most likely want
    to use get_output() or some other function to access the new state.
    If the students' code failed to parse, then the body is instead replaced
    with "pass" to prevent compilation errors.
    If the students' code raises an exception, that exception is caught and
    returned by the function. This is necessary to avoid the Instructor feedback
    hijacking the runtime exceptions that students would see.
    
    Returns:
        Exception or None: If the students' code fails for some reason, the
                           raised exception is returned. Otherwise, the None
                           value is returned.
    '''

def get_output():
    '''
    Returns a List containing the students' output from the last run. Note that
    multiple invocations of run_student(), without calls to reset_output(), will
    possibly result in duplicate output.
    Different types of student output are represented differently:
        - Print: Represented as strings WITHOUT the trailing newline.
        - Plot: Represented as Lists of "Plot Dictionaries". Each call to 
                plot(), hist(), and scatter() adds another "Plot Dictionary" to
                the list, and the list is only "snipped off" when show() is
                called. Each "Plot Dictionary" contains two fields:
                    "type": One of "hist", "line", or "scatter".
                    "data": A 1- or 2- dimensional list of numeric data.
    
    Returns:
        list: The output that the students code generated on its last execution.
    '''
    
def queue_input(input):
    '''
    Add a new string to be set as input when the "input" function is called.
    You can repeatedly queue_input to satisfy loops, too.
    If there are no queued inputs, a blank string will be returned.
    
    Args:
        input (str): The string to queue for input.
    '''
    
def reset_output():
    '''
    Removes any output generated on a previous run of the student code. This is
    typically used between executions of the `run_student` function.
    '''
    
def log(message):
    '''
    Print the given message to the JS console in the browser. This is useful
    for debugging purposes.
    
    Args:
        message: The logging message. Any kind of data is allowable, and will
                 be printed as JavaScript (using remapToJs).)
    '''
    
def log_ast():
    '''
    Prints the AST to the JS console in the browser. This is useful for
    debugging purposes.
    '''
    
def log_variables():
    '''
    Prints a mapping between the names of the programs' variables and their
    estimated type (according to the abstract interpreter) to the JS console
    in the browser. This is useful for debugging purposes.
    '''
    
def log_behavior():
    '''
    Prints a list of each variables' read/write behavior to the JS console
    in the browser. This is useful for debugging purposes.
    '''
    
def log_trace():
    '''
    Prints a list of each step of the programs' execution to the JS console
    in the browser. This is useful for debugging purposes.
    '''
    
def log_issues():
    '''
    Prints a list of all found Abstract Interperter issues to the JS console
    in the browser. This is useful for debugging purposes.
    '''

class StudentData():
    '''
    A class that wraps a dictionary of data created after the execution of
    the students' code. 
    A common use case for this is to require students to declare a particular
    function, and then to access that function via the singleton instance of
    this class.
    
    Attributes:
        data (dict): A dictionary containing all the students' data. In other
                     words, if they declare a variable named "alpha", you can
                     access that variable's final value via
    
                        student['alpha']

                     Because this is a dictionary, you can also test membership,
                     access element dynamically, and anything else you may want.
    '''
    
    def get_values_by_type(type):
        '''
        Returns a list of values from the students' data where each value
        will have the given type.
        
        Args:
            type (type): A python type (e.g., int or str) that will be used
                         in the comparison. Does not respect inheritance!
        Returns:
            list: A list of the values with that type.
        '''
    
    def get_names_by_type(type):
        '''
        Returns a list of the variable names from the students' data where each
        variable's final value will have the given type.
        
        Args:
            type (type): A python type (e.g., int or str) that will be used
                         in the comparison. Does not respect inheritance!
        Returns:
            list of str: A list of the variables with that type.
        '''

student = StudentData()
'''
A top-level variable that holds all of the students' created data. 
Acts as a convenient singleton for the code.
'''

def analyze_program():
    '''
    Triggers the analyzer to run so that type information can be available
    on the AST nodes.
    '''

    
def parse_program():
    '''
    Returns the root node of the AST of the student code as an AstNode.
    See the AstNode class for more information.
    
    Returns:
        AstNode: The root node of the AST
    '''
    
def get_program():
    '''
    Returns the students' code as a string.
    
    Returns:
        String: The string representation of the student code.
    '''
    

def def_use_error(node):
    '''
    Determines if the given AstNode (with the astname "Name"), and if so,
    if the name associated with that node has not been initialized according
    to the Analyzer.
    
    Args:
        node (AstNode): The Name node to analyze.
        
    Returns:
        bool: Returns whether the associated name has been initialized.
    '''
        
class AstNode():
    '''
    A representation of the students' Abstract Syntax Tree. Can be traversed
    and analyzed in order to make assertions about the students' code.
    The fields of the AstNode, in addition to the two listed below, are the
    fields listed in the Green Tree Snakes documentation.
    
    https://greentreesnakes.readthedocs.io/en/latest/nodes.html
    
    Attributes:
        ast_name (str): The type of AST Node of this node (e.g. "Name", "For", 
                        "Assign", etc.). For a complete list, see the Green Tree
                        Snakes API, which closely mimics our own. 
                        Some notable exceptions are:
                            - Assign: Currently, Assign.targets returns a single
                                      AstNode instead of a list.
                            - Op Nodes: For nodes with an "ops" field, this
                                        only returns the FIRST operator, so no
                                        comparison operator chaining.
        data_type 
            if this node is a Name node, returns the first data type that this variable has taken on
        next_tree
            For the AST node to which this node belongs, returns the next node in that AST that is NOT
            in this node's subtree.
    '''
    def __init__(self, id):
        '''
        This should NOT be used by an instructor, this is strictly used
        internally to match up with the already parsed Skulpt AST.
        
        Args:
            id (int): The index for the AST node when doing an in-order
                      traversal of the tree.
        '''
        
    def __eq__(self, other):
        '''
        If other is an AstNode, checks whether they are the same AstNode. If
        both nodes originate from the same AST, then a return true will indicate
        it is the same node, and false will indicate it's a different node. If
        it's not an AstNode, this will crash the program
        
        Args:
            other (AstNode): The other AstNode to compare to.
        
        Returns:
            bool: A boolean indicating if they are equal.
        '''
        
    def has(self, astNode):
        '''
        Returns whether the given astNode is a Name astNode (or a number) AND
        if the name of the variable associated with astNode node is in the
        subtree of this node.
        
        Args:
            astNode (AstNode or int): The potential child node to find.
            
        Returns:
            bool: Whether the node is a descendent.
        '''
        
    def find_all(self, type):
        '''
        Returns all AstNodes in this node's subtrees that are an AstNode of the
        given type.
        
        Args:
            type (str): The ast name to search for ("For", "Assign", "BinOp", 
                        etc.). A complete list of options can be found in the
                        Green Tree Snakes documentation.

        Returns:
            list of AstNode: The AstNodes descended from this one.
        '''
    def numeric_logic_check(self, mag, expr):
        '''
        Returns whether the numerical logical expression represented by the AST self likely
        equivalent to the numerical logical expression represented by expr.  Likely is determined by
        testing boundary conditions
        Args:
            mag (number): a tolerance value with which to check against. This is used for checking
                            boundary conditions
            expr (string): A string written in JAVASCRIPT syntax that is equivalent to the logic
                            that you want self to be equivalent to. Eval is run on this string
        Returns:
            None: This means that either there was more than one variable in expr or self,
                    that self wasn't a Compare or BoolOp node, or that
            True: This means that self matched all detectable edge cases testing between expr and self within
                    the specified tolerance mag.
            False: This means that self and expr didn't return the same thing for one of the automatically
                    generated test inputs.
        '''
## instructor_utility.py

def ensure_literal(*literals):
    '''
    Raises an Explanation if the literal values (strings, ints, floats) are not
    in the source code.
    
    Args:
        *literals (int, float or str): Any literal value.
    Returns: False if the literals were all in the code, otherwise
             returns the first missing literal value.
    '''
def prevent_literal(*literals):
    '''
    Raises an Explanation if the literal values (strings, ints, floats) are
    in the source code.
    
    Args:
        *literals (int, float or str): Any literal value.
    Returns: False if the literals were not in the code, otherwise
             returns the first present literal value.
    '''
    
def ensure_operation(op_name, root=None):
    '''
    Gently rebukes if the given operator is not found in the source code.
    
    Args:
        op_name (str): The name of the operator, as it is written in Python
                       (e.g., "==" and not "Eq"). Works for BoolOps, BinOps,
                       UnaryOps, and Compares.
    Returns: False if the operator was not in the code, otherwise returns the
             first AST node apperance of the operator.
    '''
def prevent_operation(op_name, root=None):
    '''
    Gently rebukes if the given operator is found in the source code.
    
    Args:
        op_name (str): The name of the operator, as it is written in Python
                       (e.g., "==" and not "Eq"). Works for BoolOps, BinOps,
                       UnaryOps, and Compares.
    Returns: False if the operator was not in the code, otherwise returns the
             first AST node apperance of the operator.
    '''

def function_is_called(name):
    '''
    Returns whether the given function or method has been called from within
    the students' code.
    
    Args:
        name (str): The name of the function or method (e.g., "sum").
    
    Returns:
        bool: Whether the function or method is called.
    '''
    
def only_printing_variables():
    '''
    Returns whether the students' code is only printing variables, as opposed
    to the anything else (e.g., literal values).
    
    Returns:
        bool: Whether any print function calls print non-variables.
    '''
def find_prior_initializations(node):
    '''
    Given a name ast node at a specific location in code, returns a list of
    all previous assignments that have written to that name

    Returns:
        None if node is not a Name node, otherwise returns a (possibly empty)
        list
    '''
    
def prevent_builtin_usage(names):
    '''
    Checks that a given list of function names are not being called, and
    explains a warning if they are. Also prevents against simply redeclaring
    the function_names.
    
    Args:
        names (list of str): A list of the function names to check for.
    
    Returns:
        None: No usages occurred
        str: The name of the first function that was used.
    '''

def prevent_advanced_iteration():
    '''
    Checks that the program does not use While loops or any of the built-in
    functions for processing lists (e.g., sum or len).
    '''
    
##instructor_filter
def missing_if_in_for():
    '''
    '''
def append_not_in_if():
    '''
    '''
##iteration_context
def list_length_3_or_more():
    '''
    '''
def missing_list_initialization_8_2():
    '''
    '''
def wrong_list_initialization_placement_8_3():
    '''
    '''
def wrong_accumulator_initialization_placement_8_3():
    '''
    '''
def wrong_iteration_body_8_3():
    '''
    '''
def wrong_print_8_3():
    '''
    '''
def missing_target_slot_empty_8_4():
    '''
    '''
def missing_addition_slot_empty_8_4():
    '''
    '''
def wrong_names_not_agree_8_4():
    '''
    '''
def wrong_should_be_counting():
    '''
    '''
def wrong_should_be_summing():
    '''
    '''
def wrong_cannot_sum_list():
    '''
    '''
def missing_no_print():
    '''
    '''
def missing_counting_list():
    '''
    '''
def missing_summing_list():
    '''
    '''
def missing_zero_initialization():
    '''
    '''
def missing_average():
    '''
    '''
def warning_average_in_iteration():
    '''
    '''
def wrong_average_demoninator():
    '''
    '''
def wrong_average_numerator():
    '''
    '''
def wrong_compare_list():
    '''
    '''
def wrong_for_inside_if():
    '''
    '''
def wrong_list_initialization_9_1():
    '''
    '''
def wrong_accumulator_initialization_9_1():
    '''
    '''
def wrong_accumulation_9_1():
    '''
    '''
def wrong_list_initialization_placement_9_1():
    '''
    '''
def wrong_accumulator_initialization_placement_9_1():
    '''
    '''
def wrong_iteration_body_9_1():
    '''
    '''
def wrong_print_9_1():
    '''
    '''
def wrong_list_initialization_9_2():
    '''
    '''
def wrong_accumulator_initialization_9_2():
    '''
    '''
def wrong_accumulation_9_2():
    '''
    '''
def wrong_list_initialization_placement_9_2():
    '''
    '''
def wrong_accumulator_initialization_placement_9_2():
    '''
    '''
def wrong_iteration_body_9_2():
    '''
    '''
def wrong_decision_body_9_2():
    '''
    '''
def wrong_print_9_2():
    '''
    '''
def wrong_comparison_9_6():
    '''
    '''
def wrong_conversion_10_2():
    '''
    '''
def wrong_filter_condition_10_3():
    '''
    '''
def wrong_and_filter_condition_10_4():
    '''
    '''
def wrong_nested_filter_condition_10_4():
    '''
    '''
def wrong_conversion_problem_10_5():
    '''
    '''
def wrong_filter_problem_atl1_10_5():
    '''
    '''
def wrong_filter_problem_atl2_10_5():
    '''
    '''
def wrong_append_problem_atl1_10_5():
    '''
    '''
def wrong_append_problem_atl2_10_5():
    '''
    '''
def wrong_debug_10_6():
    '''
    '''
def wrong_debug_10_7():
    '''
    '''
##instructor_histogram
def histogram_missing():
    '''
    '''
def plot_show_missing():
    '''
    '''
def histogram_argument_not_list():
    '''
    '''
def histogram_wrong_list():
    '''
    '''
##instructor_append
def find_append_in(node):
    '''
    '''
def missing_append_in_iteration():
    '''
    '''
def wrong_not_append_to_list():
    '''
    '''
def missing_append_list_initialization():
    '''
    '''
def wrong_append_list_initiatization():
    '''
    '''
def append_list_wrong_slot():
    '''
    '''
##instructor_iteration
def all_for_loops():
    '''
    '''
def wrong_target_is_list():
    '''
    '''
def wrong_list_repeated_in_for():
    '''
    '''
def missing_iterator_initialization():
    '''
    '''
def wrong_iterator_not_list():
    '''
    '''
def missing_target_slot_empty():
    '''
    '''
def list_not_initialized_on_run():
    '''
    '''
def list_initialization_misplaced():
    '''
    '''
def missing_for_slot_empty():
    '''
    '''