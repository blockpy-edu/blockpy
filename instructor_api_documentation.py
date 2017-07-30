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
    first feedback of the highest priority found.
    
    Args:
        message (str): The HTML string to display to the user in the Feedback
                       panel as corrective feedback. 
		priority (str): Either "low", "medium", or "high", indicating the
                        ordering of the feedback if multiple occur.
		line (int): The specific line number to highlight for the user.
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

    
def parse_program()
    '''
    Returns the root node of the AST of the student code as an AstNode.
    See the AstNode class for more information.
    
    Returns:
        AstNode: The root node of the AST
    '''
    

	def def_use_error(node)
		description: if node is an AST Name node and variable has not been initialized
			returns false, otherwise returns true
	class AstNode
		def __init__(self, id)
			description: This should NOT be used by an instructor, this is strictly used internally to
				match up with the already parsed Skulpt AST. "id" is used as the index for the AST node
				when doing an in-order traversal of the tree
		def __eq__(self, other)
			description: if other is an AstNode, checks whether they are the same AstNode.  If both nodes
				originate from the same AST, then a return true will indicate it is the same node, and false
				will indicate it's a different node. If it's not an AstNode, this will crash the program
		def has(self, astNode)
			description: returns true astNode is a Name astNode, or a number, AND if it is in the subtree of this node
		def find_all(self, type)
			type: a string denoting an AST node, e.g. "For", "Assign", "BinOp", etc.
			description: returns all AstNodes in this node's subtrees that are an ast Node of type
		data_type
			if this node is a Name node, returns the first data type that this variable has taken on
		ast_name
			returns the type of ast node this node (e.g. Name, For, Assign, etc.)
		Types of AST Nodes See greentree snakes API, which closely mimics our nodes, with some notable exceptions noted below
			Assign
				right now, Assign.targets returns a SINGLE AstNode instead of an array of AstNodes
			For nodes with ops, only returns the FIRST operator, so no comparison operator chaining


