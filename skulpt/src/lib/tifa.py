'''
Python Type Inferencer and Flow Analyzer (TIFA)
 
TIFA uses a number of simplifications of the Python language.
  * Variables cannot change type
  * Variables cannot be deleted
  * Complex types have to be homogenous
  * No introspection or reflective characteristics
  * No dunder methods
  * No closures (maybe?)
  * You cannot write a variable out of scope
  * You cannot read a mutable variable out of scope
  * No multiple inheritance
  
Additionally, it reads the following as issues:
  * Cannot read a variable without having first written to it.
  * Cannot rewrite a variable unless it has been read.
  
Important concepts:
    Issue: A problematic situation in the submitted code that will be reported
           but may not stop the execution.
    Error: A situation in execution that terminates the program.
    Name: A name of a variable
    Scope: The context of a function, with its own namespaces. Represented
           internally using numeric IDs (Scope IDs).
    Scope Chain: A stack of scopes, with the innermost scope on top.
    Fully Qualified Name: A string representation of a variable and its scope
                          chain, written using "/". For example:
                          0/1/4/my_variable_name
    Path: A single path of execution through the control flow; every program
          has at least one sequential path, but IFs, FORs, WHILEs, etc. can
          cause multiple paths. Paths are represented using numeric IDs (Path
          IDs).
    State: Information about a Name that indicates things like the variable's
           current type and whether that name has been read, set, or
           overwritten.
    Identifier: A wrapper around variables, used to hold their potential
                non-existence (which is an Issue but not an Error).
    Type: A symbolic representation of the variable's type.
    Literal: Sometimes, we need a specialized representation of a literal value
             to be passed around. This is particularly important for accessing
             elements in an tuples.
    Name Map: (Path x Fully Qualified Names) => States
'''

import ast
from pprint import pprint

def _dict_extends(d1, d2):
    d3 = {}
    for key, value in d1.items():
        d3[key] = value
    for key, value in d2.items():
        d3[key] = value
    return d3

class Type:
    '''
    Parent class for all other types, used to provide a common interface.
    
    TODO: Handle more complicated object-oriented types and custom types
    (classes).
    '''
    fields = {}
    immutable = False
    def clone(self):
        return self.__class__()
    def __str__(self):
        return str(self.__class__.__name__)
    def clone_mutably(self):
        if self.immutable:
            return self.clone()
        else:
            return self
    def index(self, i):
        return self.clone()
    def load_attr(self, attr, tifa, callee=None, callee_position=None):
        if attr in self.fields:
            return self.fields[attr]
        # TODO: Handle more kinds of common mistakes
        if attr == "append":
            tifa.report_issue('Append to non-list', 
                              {'name': tifa.identify_caller(callee), 
                               'position': callee_position, 'type': self})
        return UnknownType()
    def is_empty(self):
        return True
    

class UnknownType(Type):
    '''
    A special type used to indicate an unknowable type.
    '''

class RecursedType(Type):
    '''
    A special type used as a placeholder for the result of a
    recursive call that we have already process. This type will
    be dominated by any actual types, but will not cause an issue.
    '''

class FunctionType(Type):
    '''
    
    Special values for `returns`:
        identity: Returns the first argument's type
        element: Returns the first argument's first element's type
        void: Returns the NoneType
    '''
    def __init__(self, definition=None, name="*Anonymous", returns=None):
        if returns is not None and definition is None:
            if returns == 'identity':
                def definition(ti, ty, na, args, ca):
                    if args:
                        return args[0].clone()
                    return UnknownType()
            elif returns == 'element':
                def definition(ti, ty, na, args, ca):
                    if args:
                        return args[0].index(0)
                    return UnknownType()
            elif returns == 'void':
                def definition(ti, ty, na, args, ca):
                    return NoneType()
            else:
                def definition(ti, ty, na, args, ca):
                    return returns.clone()
        self.definition = definition
        self.name = name
        
class ClassType(Type):
    def __init__(self, name):
        self.name = name
        
class NumType(Type):
    immutable = True
    def index(self, i):
        return UnknownType()
    
class NoneType(Type):
    immutable = True
    
class BoolType(Type):
    immutable = True

class TupleType(Type):
    '''
    '''
    def __init__(self, subtypes=None):
        if subtypes is None:
            subtypes = []
        self.subtypes = subtypes
    def index(self, i):
        if isinstance(i, LiteralNum):
            return self.subtypes[i.value].clone()
        else:
            return self.subtypes[i].clone()
    def clone(self):
        return TupleType([t.clone() for t in self.subtypes])
    immutable = True

class ListType(Type):
    def __init__(self, subtype=None, empty=True):
        if subtype is None:
            subtype = UnknownType()
        self.subtype = subtype
        self.empty = empty
    def index(self, i):
        return self.subtype.clone()
    def clone(self):
        return ListType(self.subtype.clone(), self.empty)
    def load_attr(self, attr, tifa, callee=None, callee_position=None):
        if attr == 'append':
            def _append(tifa, function_type, callee, args, position):
                if args:
                    if callee:
                        tifa.append_variable(callee, ListType(args[0].clone()), 
                                             position)
                    self.empty = False
                    self.subtype = args[0]
            return FunctionType(_append, 'append')
        return Type.load_attr(self, attr, tifa, callee, callee_position)
    def is_empty(self):
        return self.empty

class StrType(Type):
    def index(self, i):
        return StrType()
    fields = _dict_extends(Type.fields, {})
    immutable = True

StrType.fields.update({
    # Methods that return strings
    "capitalize": FunctionType(name='capitalize', returns=StrType()),
    "center": FunctionType(name='center', returns=StrType()),
    "expandtabs": FunctionType(name='expandtabs', returns=StrType()),
    "join": FunctionType(name='join', returns=StrType()),
    "ljust": FunctionType(name='ljust', returns=StrType()),
    "lower": FunctionType(name='lower', returns=StrType()),
    "lstrip": FunctionType(name='lstrip', returns=StrType()),
    "replace": FunctionType(name='replace', returns=StrType()),
    "rjust": FunctionType(name='rjust', returns=StrType()),
    "rstrip": FunctionType(name='rstrip', returns=StrType()),
    "strip": FunctionType(name='strip', returns=StrType()),
    "swapcase": FunctionType(name='swapcase', returns=StrType()),
    "title": FunctionType(name='title', returns=StrType()),
    "translate": FunctionType(name='translate', returns=StrType()),
    "upper": FunctionType(name='upper', returns=StrType()),
    "zfill": FunctionType(name='zfill', returns=StrType()),
    # Methods that return numbers
    "count": FunctionType(name='count', returns=NumType()),
    "find": FunctionType(name='find', returns=NumType()),
    "rfind": FunctionType(name='rfind', returns=NumType()),
    "index": FunctionType(name='index', returns=NumType()),
    "rindex": FunctionType(name='rindex', returns=NumType()),
    # Methods that return booleans
    "startswith": FunctionType(name='startswith', returns=BoolType()),
    "endswith": FunctionType(name='endswith', returns=BoolType()),
    "isalnum": FunctionType(name='isalnum', returns=BoolType()),
    "isalpha": FunctionType(name='isalpha', returns=BoolType()),
    "isdigit": FunctionType(name='isdigit', returns=BoolType()),
    "islower": FunctionType(name='islower', returns=BoolType()),
    "isspace": FunctionType(name='isspace', returns=BoolType()),
    "istitle": FunctionType(name='istitle', returns=BoolType()),
    "isupper": FunctionType(name='isupper', returns=BoolType()),
    # Methods that return List of Strings
    "rsplit": FunctionType(name='rsplit', returns=ListType(StrType())),
    "split": FunctionType(name='split', returns=ListType(StrType())),
    "splitlines": FunctionType(name='splitlines', returns=ListType(StrType()))
})
class FileType(Type):
    def index(self, i):
        return StrType()
    fields = _dict_extends(Type.fields, {
        'close': FunctionType(name='close', returns='void'),
        'read': FunctionType(name='read', returns=StrType()),
        'readlines': FunctionType(name='readlines', returns=ListType(StrType(), False))
    })
    
class DictType(Type):
    def __init__(self, empty=False, literals=None, keys=None, values=None):
        self.empty = empty
        self.literals = literals
        self.values = values
        self.keys = keys
    def clone(self):
        return DictType(self.empty, self.literals, self.keys, self.values)
    def is_empty(self):
        return self.empty
    def index(self, i):
        if self.empty:
            return UnknownType()
        elif self.literals is not None:
            for literal, value in zip(self.literals, self.values):
                if are_literals_equal(literal, i):
                    return value.clone()
            return UnknownType()
        else:
            return self.keys.clone()
    def load_attr(self, attr, tifa, callee=None, callee_position=None):
        if attr == 'items':
            def _items(tifa, function_type, callee, args, position):
                if self.literals is None:
                    return ListType(TupleType([self.keys, self.values]))
                else:
                    return ListType(TupleType([self.literals[0].type(),
                                               self.values[0]]))
            return FunctionType(_items, 'items')
        elif attr == 'keys':
            def _keys(tifa, function_type, callee, args, position):
                if self.literals is None:
                    return ListType(self.keys)
                else:
                    return ListType(self.literals[0].type())
            return FunctionType(_keys, 'keys')
        elif attr == 'values':
            def _items(tifa, function_type, callee, args, position):
                if self.literals is None:
                    return ListType(self.values)
                else:
                    return ListType(self.values[0])
            return FunctionType(_values, 'values')
        return Type.load_attr(self, attr, tifa, callee, callee_position)

class ModuleType(Type):
    def __init__(self, name="*UnknownModule", submodules=None, fields=None):
        self.name = name
        if submodules is None:
            submodules = {}
        self.submodules = submodules
        if fields is None:
            fields = {}
        self.fields = fields

class SetType(ListType):
    pass

class GeneratorType(ListType):
    pass

# Custom parking class in blockpy    
class TimeType(Type): pass
class DayType(Type): pass
    
MODULES = {
    'matplotlib': ModuleType('matplotlib',
        submodules={
            'pyplot': ModuleType('pyplot', fields={
                'plot': FunctionType(name='plot', returns=NoneType()),
                'hist': FunctionType(name='hist', returns=NoneType()),
                'scatter': FunctionType(name='scatter', returns=NoneType()),
                'show': FunctionType(name='show', returns=NoneType()),
                'xlabel': FunctionType(name='xlabel', returns=NoneType()),
                'ylabel': FunctionType(name='ylabel', returns=NoneType()),
                'title': FunctionType(name='title', returns=NoneType()),
            })
        }),
    'pprint': ModuleType('pprint',
        fields={
            'pprint': FunctionType(name='pprint', returns=NoneType())
        }),
    'random': ModuleType('random',
        fields={
            'randint': FunctionType(name='randint', returns=NumType())
        }),
    'turtle': ModuleType('turtle',
        fields={
            'forward': FunctionType(name='forward', returns=NoneType()),
            'backward': FunctionType(name='backward', returns=NoneType()),
            'color': FunctionType(name='color', returns=NoneType()),
            'right': FunctionType(name='right', returns=NoneType()),
            'left': FunctionType(name='left', returns=NoneType()),
        }),
    'parking': ModuleType('parking',
        fields={
            'Time': FunctionType(name='Time', returns=TimeType()),
            'now': FunctionType(name='now', returns=TimeType()),
            'Day': FunctionType(name='Day', returns=DayType()),
            'today': FunctionType(name='today', returns=DayType()),
        }),
    'math': ModuleType('math',
        fields={
            'ceil': FunctionType(name='ceil', returns=NumType()),
            'copysign': FunctionType(name='copysign', returns=NumType()),
            'fabs': FunctionType(name='fabs', returns=NumType()),
            'factorial': FunctionType(name='factorial', returns=NumType()),
            'floor': FunctionType(name='floor', returns=NumType()),
            'fmod': FunctionType(name='fmod', returns=NumType()),
            'frexp': FunctionType(name='frexp', returns=NumType()),
            'fsum': FunctionType(name='fsum', returns=NumType()),
            'gcd': FunctionType(name='gcd', returns=NumType()),
            'isclose': FunctionType(name='isclose', returns=BoolType()),
            'isfinite': FunctionType(name='isfinite', returns=BoolType()),
            'isinf': FunctionType(name='isinf', returns=BoolType()),
            'isnan': FunctionType(name='isnan', returns=BoolType()),
            'ldexp': FunctionType(name='ldexp', returns=NumType()),
            'modf': FunctionType(name='modf', returns=NumType()),
            'trunc': FunctionType(name='trunc', returns=NumType()),
            'log': FunctionType(name='log', returns=NumType()),
            'log1p': FunctionType(name='log1p', returns=NumType()),
            'log2': FunctionType(name='log2', returns=NumType()),
            'log10': FunctionType(name='log10', returns=NumType()),
            'pow': FunctionType(name='pow', returns=NumType()),
            'sqrt': FunctionType(name='sqrt', returns=NumType()),
            'acos': FunctionType(name='acos', returns=NumType()),
            'sin': FunctionType(name='sin', returns=NumType()),
            'cos': FunctionType(name='cos', returns=NumType()),
            'tan': FunctionType(name='tan', returns=NumType()),
            'asin': FunctionType(name='asin', returns=NumType()),
            'acos': FunctionType(name='acos', returns=NumType()),
            'atan': FunctionType(name='atan', returns=NumType()),
            'atan2': FunctionType(name='atan2', returns=NumType()),
            'hypot': FunctionType(name='hypot', returns=NumType()),
            'degrees': FunctionType(name='degrees', returns=NumType()),
            'radians': FunctionType(name='radians', returns=NumType()),
            'sinh': FunctionType(name='sinh', returns=NumType()),
            'cosh': FunctionType(name='cosh', returns=NumType()),
            'tanh': FunctionType(name='tanh', returns=NumType()),
            'asinh': FunctionType(name='asinh', returns=NumType()),
            'acosh': FunctionType(name='acosh', returns=NumType()),
            'atanh': FunctionType(name='atanh', returns=NumType()),
            'erf': FunctionType(name='erf', returns=NumType()),
            'erfc': FunctionType(name='erfc', returns=NumType()),
            'gamma': FunctionType(name='gamma', returns=NumType()),
            'lgamma': FunctionType(name='lgamma', returns=NumType()),
            'pi': NumType(),
            'e': NumType(),
            'tau': NumType(),
            'inf': NumType(),
            'nan': NumType(),
        }),
}

def _builtin_sequence_constructor(sequence_type):
    '''
    Helper function for creating constructors for the Set and List types.
    These constructors use the subtype of the arguments.
    
    Args:
        sequence_type (Type): A function for creating new sequence types.
    '''
    def sequence_call(tifa, function_type, callee, args, position):
        # TODO: Should inherit the emptiness too
        return_type = sequence_type(empty=True)
        if args:
            return_type.subtype = args[0].index(LiteralNum(0))
        return return_type
    return sequence_call
    
def _builtin_zip(tifa, function_type, callee, args, position):
    '''
    Definition of the built-in zip function, which consumes a series of
    sequences and returns a list of tuples, with each tuple composed of the
    elements of the sequence paired (or rather, tupled) together.
    '''
    if args:
        tupled_types = TupleType(subtypes=[])
        for arg in args:
            tupled_types.append(arg.index(0))
        return ListType(tupled_types)
    return ListType(empty=True)

BUILTINS = {
    # Void Functions
    "print": FunctionType(name="print", returns=NoneType()),
    # Math Functions
    "int": FunctionType(name="int", returns=NumType()),
    "abs": FunctionType(name="abs", returns=NumType()),
    "float": FunctionType(name="float", returns=NumType()),
    "len": FunctionType(name="len", returns=NumType()),
    "ord": FunctionType(name="ord", returns=NumType()),
    "pow": FunctionType(name="pow", returns=NumType()),
    "round": FunctionType(name="round", returns=NumType()),
    "sum": FunctionType(name="sum", returns=NumType()),
    # Boolean Functions
    "bool": FunctionType(name="bool", returns=BoolType()),
    "all": FunctionType(name="all", returns=BoolType()),
    "any": FunctionType(name="any", returns=BoolType()),
    "isinstance": FunctionType(name="isinstance", returns=BoolType()),
    # String Functions
    "input": FunctionType(name="input", returns=StrType()),
    "str": FunctionType(name="str", returns=StrType()),
    "chr": FunctionType(name="chr", returns=StrType()),
    "repr": FunctionType(name="repr", returns=StrType()),
    # File Functions
    "open": FunctionType(name="open", returns=FileType()),
    # List Functions
    "map": FunctionType(name="map", returns=ListType()),
    "list": FunctionType(name="list", 
                         definition=_builtin_sequence_constructor(ListType)),
    # Set Functions
    "set": FunctionType(name="set", 
                         definition=_builtin_sequence_constructor(SetType)),
    # Dict Functions
    "dict": FunctionType(name="dict", returns=DictType()),
    # Pass through
    "sorted": FunctionType(name="sorted", returns='identity'),
    "reversed": FunctionType(name="reversed", returns='identity'),
    "filter": FunctionType(name="filter", returns='identity'),
    # Special Functions
    "range": FunctionType(name="range", returns=ListType(NumType())),
    "dir": FunctionType(name="dir", returns=ListType(StrType())),
    "max": FunctionType(name="max", returns='element'),
    "min": FunctionType(name="min", returns='element'),
    "zip": FunctionType(name="zip", returns=_builtin_zip)
}
    
def merge_types(left, right):
    # TODO: Check that lists/sets have the same subtypes
    if isinstance(left, (ListType, SetType, GeneratorType)):
        if left.empty:
            return right.subtype
        else:
            return left.subtype.clone()
    elif isinstance(left, TupleType):
        return left.subtypes + right.subtypes
    
NumType_any = lambda *x: NumType()
StrType_any = lambda *x: StrType()
BoolType_any = lambda *x: BoolType()
VALID_BINOP_TYPES = {
    ast.Add: {NumType: {NumType: NumType_any}, 
              StrType :{StrType: StrType_any}, 
              ListType: {ListType: merge_types},
              TupleType: {TupleType: merge_types}},
    ast.Sub: {NumType: {NumType: NumType_any}, 
              SetType: {SetType: merge_types}},
    ast.Div: {NumType: {NumType: NumType_any}},
    ast.FloorDiv: {NumType: {NumType: NumType_any}},
    ast.Mult: {NumType: {NumType: NumType_any, 
                     StrType: StrType_any, 
                     ListType: lambda l,r: r, 
                     TupleType: lambda l,r: r},
             StrType: {NumType: StrType_any},
             ListType: {NumType: lambda l,r: l},
             TupleType: {NumType: lambda l,r: l}},
    ast.Pow: {NumType: {NumType: NumType_any}},
    # TODO: Should we allow old-fashioned string interpolation?
    # Currently, I vote no because it makes the code harder and is bad form.
    ast.Mod: {NumType: {NumType: NumType_any}},
    ast.LShift: {NumType: {NumType: NumType_any}},
    ast.RShift: {NumType: {NumType: NumType_any}},
    ast.BitOr: {NumType: {NumType: NumType_any}, 
                BoolType: {NumType: NumType_any,
                         BoolType: BoolType_any}, 
                SetType: {SetType: merge_types}},
    ast.BitXor: {NumType: {NumType: NumType_any}, 
                BoolType: {NumType: NumType_any,
                         BoolType: BoolType_any}, 
                SetType: {SetType: merge_types}},
    ast.BitAnd: {NumType: {NumType: NumType_any}, 
                BoolType: {NumType: NumType_any,
                         BoolType: BoolType_any}, 
                SetType: {SetType: merge_types}}
}
VALID_UNARYOP_TYPES = {
    ast.UAdd: {NumType: NumType},
    ast.USub: {NumType: NumType},
    ast.Invert: {NumType: NumType}
}
    
def are_types_equal(left, right):
    '''
    Determine if two types are equal.
    
    This could be more Polymorphic - move the code for each type into
    its respective class instead.
    '''
    if left is None or right is None:
        return False
    elif isinstance(left, UnknownType) or isinstance(right, UnknownType):
        return False
    elif type(left) is not type(right):
        return False
    elif isinstance(left, (GeneratorType, ListType)):
        if left.empty or right.empty:
            return True
        else:
            return are_types_equal(left.subtype, right.subtype)
    elif isinstance(left, TupleType):
        if left.empty or right.empty:
            return True
        elif len(left.subtypes) != len(right.subtypes):
            return False
        else:
            for l, r in zip(left.subtypes, right.subtypes):
                if not are_types_equal(l, r):
                    return False
            return True
    elif isinstance(left, DictType):
        if left.empty or right.empty:
            return True
        elif left.literals is not None and right.literals is not None:
            if len(left.literals) != len(right.literals):
                return False
            else:
                for l, r in zip(left.literals, right.literals):
                    if not are_types_equal(l, r):
                        return False
                for l, r in zip(left.values, right.values):
                    if not are_types_equal(l, r):
                        return False
                return True
        elif left.literals is not None or right.literals is not None:
            return False
        else:
            keys_equal = are_types_equal(left.keys, right.keys)
            values_equal = are_types_equal(left.values, right.values)
            return keys_equal and values_equal
    else:
        return True
        
def are_literals_equal(first, second):
    if first is None or second is None:
        return False
    elif type(first) != type(second):
        return False
    else:
        if isinstance(first, LiteralTuple):
            if len(first.value) != len(second.value):
                return False
            for l, s in zip(first.value, second.value):
                if not are_literals_equal(l, s):
                    return False
            return True
        else:
            return first.value == second.value

class LiteralValue:
    '''
    A special literal representation of a value, used to represent access on
    certain container types.
    '''
    def __init__(self, value):
        self.value = value
    
class LiteralNum(LiteralValue):
    '''
    Used to capture indexes of containers.
    '''    
    def type(self):
        return NumType()

class LiteralBool(LiteralValue):
    def type(self):
        return BoolType()
class LiteralStr(LiteralValue):
    def type(self):
        return StrType()
class LiteralTuple(LiteralValue):
    def type(self):
        return TupleType(self.value)
        
class Identifier:
    '''
    A representation of an Identifier, encapsulating its current level of
    existence, scope and State.
    
    Attributes:
        exists (bool): Whether or not the variable actually is defined anywhere.
                       It is possible that a variable was retrieved that does
                       not actually exist yet, which indicates it might need to
                       be created.
        in_scope (bool): Whether or not the variable exists in the current
                         scope. Used to detect the presence of certain kinds
                         of errors where the user is using a variable from
                         a different scope.
        scoped_name (str): The fully qualified name of the variable, including
                           its scope chain.
        state (State): The current state of the variable.
    '''
    def __init__(self, exists, in_scope=False, scoped_name="UNKNOWN", state=""):
        self.exists = exists
        self.in_scope = in_scope
        self.scoped_name = scoped_name
        self.state = state

    
class State:
    '''
    A representation of a variable at a particular point in time of the program.
    
    Attributes:
        name (str): The name of the variable, without its scope chain
        trace (list of State): A recursive definition of previous States for
                               this State.
        type (Type): The current type of this variable.
        method (str): One of 'store', 'read', (TODO). Indicates the change that
                      occurred to this variable at this State.
        position (dict): A Position dictionary indicating where this State
                         change occurred in the source code.
        read (str): One of 'yes', 'no', or 'maybe'. Indicates if this variable
                    has been read since it was last changed. If merged from a
                    diverging path, it is possible that it was "maybe" read.
        set (str): One of 'yes', 'no', or 'maybe'. Indicates if this variable
                    has been set since it was last read. If merged from a 
                    diverging path, it is possible that it was "maybe" changed.
        over (str): One of 'yes', 'no', or 'maybe'. Indicates if this variable
                    has been overwritten since it was last set. If merged from a 
                    diverging path, it is possible that it was "maybe" changed.
        over_position (dict): A Position indicating where the State was
                              previously set versus when it was overwritten.
        
    '''
    def __init__(self, name, trace, type, method, position, 
                 read='maybe', set='maybe', over='maybe', over_position=None):
        self.name = name
        self.trace = trace
        self.type = type
        self.method = method
        self.position = position
        self.over_position = over_position
        self.read = read
        self.set = set
        self.over = over
    
    def copy(self, method, position):
        '''
        Make a copy of this State, copying this state into the new State's trace
        '''
        return State(self.name, [self], self.type, method, position,
                     self.read, self.set, self.over, self.over_position)

    def __str__(self):
        '''
        Create a string representation of this State.
        '''
        return "{method}(r:{read},s:{set},o:{over},{type})".format(
            method=self.method,
            read=self.read[0],
            set=self.set[0],
            over=self.over[0],
            type=self.type.__class__.__name__
        )
    def __repr__(self):
        '''
        Create a string representation of this State.
        '''
        return str(self)
        
ORDERABLE_TYPES = (NumType, BoolType, StrType, ListType, DayType, TimeType, 
                   SetType, TupleType)
INDEXABLE_TYPES = (StrType, ListType, SetType, TupleType, DictType)
                     
class Tifa(ast.NodeVisitor):
    '''
    
    Args:
        python_3 (bool): Whether to parse the code in regular PYTHON_3 mode or
                         the modified AST that Skulpt uses.
    '''
    
    def __init__(self, python_3=True):
        self.PYTHON_3 = python_3

    @staticmethod
    def _error_report(error):
        '''
        Return a new unsuccessful report with an error present.
        '''
        return {"success": False, 
                "error": error,
                "issues": {},
                "variables": {}}
    
    @staticmethod
    def _initialize_report():
        '''
        Return a successful report with possible set of issues.
        '''
        return {"success": True,
                "variables": {},
                "issues": {
                    "Parser Failure": [], # Complete failure to parse the code
                    "Unconnected blocks": [], # Any names with ____
                    "Empty Body": [], # Any use of pass on its own
                    "Malformed Conditional": [], # An if/else with empty else or if
                    "Unnecessary Pass": [], # Any use of pass
                    "Unread variables": [], # A variable was not read after it was defined
                    "Undefined variables": [], # A variable was read before it was defined
                    "Possibly undefined variables": [], # A variable was read but was not defined in every branch
                    "Overwritten variables": [], # A written variable was written to again before being read
                    "Append to non-list": [], # Attempted to use the append method on a non-list
                    "Used iteration list": [], # 
                    "Unused iteration variable": [], # 
                    "Non-list iterations": [], # 
                    "Empty iterations": [], # 
                    "Type changes": [], # 
                    "Iteration variable is iteration list": [], # 
                    "Unknown functions": [], # 
                    "Not a function": [], # Attempt to call non-function as function
                    "Recursive Call": [],
                    "Incorrect Arity": [],
                    "Action after return": [],
                    "Incompatible types": [], # 
                    "Return outside function": [], # 
                    "Read out of scope": [], # 
                    "Write out of scope": [], # Attempted to modify a variable in a higher scope
                    "Aliased built-in": [], # 
                    "Method not in Type": [], # A method was used that didn't exist for that type
                    "Submodule not found": [],
                    "Module not found": [],
                    "Else on loop body": [], # Used an Else on a For or While
                }
        }
    
    def report_issue(self, issue, data=None):
        '''
        Report the given issue with associated metadata, including the position
        if not explicitly included.
        '''
        if data is None:
            data = {}
        if 'position' not in data:
            data['position'] = self.locate()
        self.report['issues'][issue].append(data)
        
    def locate(self, node=None):
        '''
        Return a dictionary representing the current location within the
        AST.
        
        Returns:
            Position dict: A dictionary with the fields 'column' and 'line',
                           indicating the current position in the source code.
        '''
        if node is None:
            if self.node_chain:
                node = self.node_chain[-1]
            else:
                node = self.final_node
        return {'column': node.col_offset, 'line': node.lineno}
        
                
    def process_code(self, code, filename="__main__"):
        '''
        Processes the AST of the given source code to generate a report.
        
        Args:
            code (str): The Python source code
            filename (str): The filename of the source code (defaults to __main__)
        Returns: 
            Report: The successful or successful report object
        '''
        # Code
        self.source = code.split("\n") if code else []
        filename = filename
        
        # Attempt parsing - might fail!
        try:
            ast_tree = ast.parse(code, filename)
            return self.process_ast(ast_tree)
        except Exception as error:
            self.report = Tifa._error_report(error)
            raise error
            return self.report;
    
    def process_ast(self, ast_tree):
        '''
        Given an AST, actually performs the type and flow analyses to return a 
        report.
        
        Args:
            ast (Ast): The AST object
        Returns:
            Report: The final report object created (also available as a field).
        '''
        self._reset()
        # Initialize a new, empty report
        self.report = Tifa._initialize_report()
        # Traverse every node
        self.visit(ast_tree);
        
        # Check afterwards
        self.report['variables'] = self.name_map
        self._finish_scope()
        
        # Collect top level variables
        self._collect_top_level_varaibles()
        #print(self.report['variables'])
        
        return self.report
    
    def _collect_top_level_varaibles(self):
        '''
        Walk through the variables and add any at the top level to the
        top_level_variables field of the report.
        '''
        self.report['top_level_variables'] = {}
        main_path_vars = self.name_map[self.path_chain[0]]
        for full_name in main_path_vars:
            split_name = full_name.split("/")
            if len(split_name) == 2 and split_name[0] == str(self.scope_chain[0]):
                name = split_name[1]
                self.report['top_level_variables'][name] = main_path_vars[full_name]
    
    def _reset(self):
        '''
        Reinitialize fields for maintaining the system
        '''
        # Unique Global IDs
        self.path_id = 0;
        self.scope_id = 0;
        self.ast_id = 0;
        
        # Human readable names
        self.path_names = ['*Module'];
        self.scope_names = ['*Module'];
        self.node_chain = [];
        
        # Complete record of all Names
        self.scope_chain = [self.scope_id]
        self.path_chain = [self.path_id]
        self.name_map = {}
        self.name_map[self.path_id] = {}
        self.definition_chain = []
        self.path_parents = {}
        self.final_node = None
        
    def find_variable_scope(self, name):
        '''
        Walk through this scope and all enclosing scopes, finding the relevant
        identifier given by `name`.
        
        Args:
            name (str): The name of the variable
        Returns:
            Identifier: An Identifier for the variable, which could potentially
                        not exist.
        '''
        for scope_level, scope in enumerate(self.scope_chain):
            for path_id in self.path_chain:
                path = self.name_map[path_id]
                full_name = "/".join(map(str, self.scope_chain[scope_level:]))+"/"+name
                if full_name in path:
                    is_root_scope = (scope_level==0)
                    return Identifier(True, is_root_scope, 
                                      full_name, path[full_name])
                        
        return Identifier(False)
    
    def find_variable_out_of_scope(self, name):
        '''
        Walk through every scope and determine if this variable can be found
        elsewhere (which would be an issue).
        
        Args:
            name (str): The name of the variable
        Returns:
            Identifier: An Identifier for the variable, which could potentially
                        not exist.
        '''
        for path in self.name_map.values():
            for full_name in path:
                unscoped_name = full_name.split("/")[-1]
                if name == unscoped_name:
                    return Identifier(True, False, unscoped_name, path[full_name])
        return Identifier(False)
    
    def find_path_parent(self, path_id, name):
        if name in self.name_map[path_id]:
            return Identifier(True, state=self.name_map[path_id][name])
        else:
            path_parent = self.path_parents.get(path_id)
            if path_parent is None:
                return Identifier(False)
            else:
                return self.find_path_parent(path_parent, name)
        
    def _finish_scope(self):
        '''
        Walk through all the variables present in this scope and ensure that
        they have been read and not overwritten.
        '''
        path_id = self.path_chain[0]
        for name in self.name_map[path_id]:
            if Tifa.in_scope(name, self.scope_chain):
                state = self.name_map[path_id][name]
                if state.over == 'yes':
                    position = state.over_position
                    self.report_issue('Overwritten variables', 
                                     {'name': state.name, 'position': position})
                if state.read == 'no':
                    self.report_issue('Unread variables', 
                                     {'name': state.name, 'type': state.type})
        
    def visit(self, node):
        '''
        Process this node by calling its appropriate visit_*
        
        Args:
            node (AST): The node to visit
        Returns:
            Type: The type calculated during the visit.
        '''
        # Start processing the node
        self.node_chain.append(node)
        self.ast_id += 1
        
        # Actions after return?
        if len(self.scope_chain) > 1:
            return_state = self.find_variable_scope("*return")
            if return_state.exists and return_state.in_scope:
                if return_state.state.set == "yes":
                    self.report_issue("Action after return")
        
        # No? All good, let's enter the node
        self.final_node = node
        result = ast.NodeVisitor.visit(self, node)
        
        # Pop the node out of the chain
        self.ast_id -= 1
        self.node_chain.pop()
        
        # If a node failed to return something, return the UNKNOWN TYPE
        if result == None:
            return UnknownType()
        else:
            return result
            
    def _visit_nodes(self, nodes):
        '''
        Visit all the nodes in the given list.
        
        Args:
            nodes (list): A list of values, of which any AST nodes will be
                          visited.
        '''
        for node in nodes:
            if isinstance(node, ast.AST):
                self.visit(node)
                
    def walk_targets(self, targets, type, walker):
        '''
        Iterate through the targets and call the given function on each one.
        
        Args:
            targets (list of Ast nodes): A list of potential targets to be
                                         traversed.
            type (Type): The given type to be unraveled and applied to the
                         targets.
            walker (Ast Node, Type -> None): A function that will process
                                             each target and unravel the type.
        '''
        for target in targets:
            walker(target, type)
    
    def _walk_target(self, target, type):
        '''
        Recursively apply the type to the target
        
        Args:
            target (Ast): The current AST node to process
            type (Type): The type to apply to this node
        '''
        if isinstance(target, ast.Name):
            self.store_iter_variable(target.id, type, self.locate(target))
            return target.id
        elif isinstance(target, (ast.Tuple, ast.List)):
            result = None
            for i, elt in enumerate(target.elts):
                elt_type = type.index(LiteralNum(i))
                potential_name = self._walk_target(elt, elt_type)
                if potential_name is not None and result is None:
                    result = potential_name
            return result
            
    def visit_Assign(self, node):
        '''
        Simple assignment statement:
        __targets__ = __value__
        
        Args:
            node (AST): An Assign node
        Returns:
            None
        '''
        # Handle value
        value_type = self.visit(node.value);
        # Handle targets
        self._visit_nodes(node.targets);
        
        # TODO: Properly handle assignments with subscripts
        def action(target, type):
            if isinstance(target, ast.Name):
                self.store_variable(target.id, type)
            elif isinstance(target, (ast.Tuple, ast.List)):
                for i, elt in enumerate(target.elts):
                    eltType = type.index(LiteralNum(i))
                    action(elt, eltType)
            elif isinstance(target, ast.Subscript):
                pass
                # TODO: Handle minor type changes (e.g., appending to an inner list)
        self.walk_targets(node.targets, value_type, action)
        
    def visit_AugAssign(self, node):
        # Handle value
        right = self.visit(node.value)
        # Handle target
        left = self.visit(node.target)
        # Target is always a Name, Subscript, or Attribute
        name = self.identify_caller(node.target)
        
        # Handle operation
        self.load_variable(name)
        if isinstance(left, UnknownType) or isinstance(right, UnknownType):
            return UnknownType()
        elif isinstance(left, RecursedType) or isinstance(right, RecursedType):
            return RecursedType()
        elif type(node.op) in VALID_BINOP_TYPES:
            op_lookup = VALID_BINOP_TYPES[type(node.op)]
            if type(left) in op_lookup:
                op_lookup = op_lookup[type(left)]
                if type(right) in op_lookup:
                    op_lookup = op_lookup[type(right)]
                    result_type = op_lookup(left, right)
                    self.store_variable(name, result_type)
                    return result_type
        
        self.report_issue("Incompatible types", 
                         {"left": left, "right": right, 
                          "operation": node.op})
                          
    def visit_Attribute(self, node):
        # Handle value
        value_type = self.visit(node.value)
        # Handle ctx
        # TODO: Handling contexts
        # Handle attr
        return value_type.load_attr(node.attr, self, node.value, self.locate())
    
    def visit_BinOp(self, node):
        # Handle left and right
        left = self.visit(node.left)
        right = self.visit(node.right)
        
        # Handle operation
        if isinstance(left, UnknownType) or isinstance(right, UnknownType):
            return UnknownType()
        elif isinstance(left, RecursedType) or isinstance(right, RecursedType):
            return RecursedType()
        elif type(node.op) in VALID_BINOP_TYPES:
            op_lookup = VALID_BINOP_TYPES[type(node.op)]
            if type(left) in op_lookup:
                op_lookup = op_lookup[type(left)]
                if type(right) in op_lookup:
                    op_lookup = op_lookup[type(right)]
                    return op_lookup(left, right)
                    
        self.report_issue("Incompatible types", 
                         {"left": left, "right": right, 
                          "operation": node.op});
        return UnknownType()
        
    def visit_Bool(self, node):
        return BoolType()
    
    
    def visit_BoolOp(self, node):
        # Handle left and right
        values = []
        for value in node.values:
            values.append(self.visit(value))   
        
        # TODO: Truthiness is not supported! Probably need a Union type
        # TODO: Literals used as truthy value
        
        # Handle operation
        return BoolType()
    
    def visit_Call(self, node):
        # Handle func part (Name or Attribute)
        function_type = self.visit(node.func)
        callee = self.identify_caller(node)
        
        # Handle args
        arguments = [self.visit(arg) for arg in node.args]
        
        # TODO: Handle keywords
        # TODO: Handle starargs
        # TODO: Handle kwargs
        if isinstance(function_type, FunctionType):
            # Test if we have called this definition before
            if function_type.definition not in self.definition_chain:
                self.definition_chain.append(function_type.definition)
                # Function invocation
                result = function_type.definition(self, function_type, callee, 
                                                  arguments, self.locate())
                self.definition_chain.pop()
                return result
            else:
                self.report_issue("Recursive Call", {"name": callee})
        else:
            self.report_issue("Not a function", {"name": callee})
        return UnknownType()
        
    def visit_ClassDef(self, node):
        class_name = node.name
        self.store_variable(class_name, ClassType)
        # TODO: Define a new scope definition that executes the body
        # TODO: find __init__, execute that
        self.generic_visit(node)
    
    def visit_Compare(self, node):
        # Handle left and right
        left = self.visit(node.left)
        comparators = [self.visit(compare) for compare in node.comparators]
        
        # Handle ops
        if isinstance(left, RecursedType):
            return BoolType()
        for op, right in zip(node.ops, comparators):
            if isinstance(right, RecursedType):
                continue
            if isinstance(op, (ast.Eq, ast.NotEq, ast.Is, ast.IsNot)):
                continue
            elif isinstance(op, (ast.Lt, ast.LtE, ast.GtE, ast.Gt)):
                if are_types_equal(left, right):
                    if isinstance(left, ORDERABLE_TYPES):
                        continue
            elif isinstance(op, (ast.In, ast.NotIn)):
                if isinstance(right, INDEXABLE_TYPES):
                    continue
            self.report_issue("Incompatible types",
                              {"left": left, "right": right,
                               "operation": op})
        return BoolType()
      
    def _visit_collection_loop(self, node):
        # Handle the iteration list
        iter = node.iter
        iter_list_name = None
        if isinstance(iter, ast.Name):
            iter_list_name = iter.id
            if iter_list_name == "___":
                self.report_issue("Unconnected blocks", 
                                  {"position": self.locate(iter)})
            state = self.iterate_variable(iter_list_name)
            iter_type = state.type
        else:
            iter_type = self.visit(iter)
        
        if iter_type.is_empty():
            self.report_issue("Empty iterations", 
                              {"name": iter_list_name, 
                               "position": self.locate(iter)})
            
        if not isinstance(iter_type, INDEXABLE_TYPES):
            self.report_issue("Non-list iterations", 
                              {"name": iter_list_name, 
                               "position": self.locate(iter)})
            
        iter_subtype = iter_type.index(LiteralNum(0))
        
        # Handle the iteration variable
        iter_variable_name = self._walk_target(node.target, iter_subtype)
        
        if iter_variable_name and iter_list_name:
            if iter_variable_name == iter_list_name:
                self.report_issue("Iteration variable is iteration list", 
                                  {"name": iter_variable_name,
                                   "position": self.locate(node.target)})

    def visit_comprehension(self, node):
        self._visit_collection_loop(node)
        # Handle the bodies
        self.visit_statements(node.ifs)
    
    def visit_Dict(self, node):
        '''
        Three types of dictionaries
        - empty
        - uniform type
        - record
        '''
        type = DictType()
        if not node.keys:
            type.empty = True
        else:
            type.empty = True
            all_literals = True
            keys, values, literals = [], [], []
            for key, value in zip(node.keys, node.values):
                key, value = self.visit(key), self.visit(value)
                literal = Tifa.get_literal(key)
                if literal is not None:
                    literals.append(literal)
                    values.append(value)
                else:
                    all_literals = False;
            if all_literals:
                type.literals = literals
                type.values = values
            else:
                type.keys = key;
                type.values = value;
        return type
    
    def visit_DictComp(self, node):
        # TODO: Handle comprehension scope
        for generator in node.generators:
            self.visit(generator)
        keys = self.visit(node.key)
        values = self.visit(node.value)
        return DictType(keys=keys, values=values)
    
    def visit_For(self, node):
        self._visit_collection_loop(node)
        # Handle the bodies
        self.visit_statements(node.body)
        self.visit_statements(node.orelse)
        
    def visit_FunctionDef(self, node):
        # Name
        function_name = node.name
        position = self.locate()
        definitions_scope = self.scope_chain[:]
        def definition(tifa, call_type, call_name, parameters, call_position):
            function_scope = Tifa.NewScope(self, definitions_scope)
            with function_scope:
                # Process arguments
                args = node.args.args
                if len(args) != len(parameters):
                    self.report_issue('Incorrect Arity', {"position": position})
                # TODO: Handle special types of parameters
                for arg, parameter in zip(args, parameters):
                    name = arg.arg if self.PYTHON_3 else arg.id
                    if parameter is not None:
                        parameter = parameter.clone_mutably()
                        self.store_variable(name, parameter, position)
                if len(args) < len(parameters):
                    for undefined_parameter in parameters[len(args):]:
                        self.store_variable(name, UnknownType(), position)
                self.visit_statements(node.body)
                return_state = self.find_variable_scope("*return")
                return_value = NoneType()
                # If the pseudo variable exists, we load it and get its type
                if return_state.exists and return_state.in_scope:
                    return_state = self.load_variable("*return", call_position)
                    return_value = return_state.type
            return return_value
        function = FunctionType(definition=definition, name=function_name)
        self.store_variable(function_name, function)
        return function
    
    def visit_GeneratorExp(self, node):
        # TODO: Handle comprehension scope
        for generator in node.generators:
            self.visit(generator)
        return GeneratorType(self.visit(node.elt))
        
    def visit_If(self, node):
        # Visit the conditional
        self.visit(node.test);
        
        if len(node.orelse) == 1 and isinstance(node.orelse[0], ast.Pass):
            self.report_issue("Malformed Conditional")
        elif len(node.body) == 1 and isinstance(node.body[0], ast.Pass):
            if node.orelse:
                self.report_issue("Malformed Conditional")
        
        # Visit the bodies
        this_path_id = self.path_id
        if_path = Tifa.NewPath(self, this_path_id, "i")
        with if_path:
            for statement in node.body:
                self.visit(statement)
        else_path = Tifa.NewPath(self, this_path_id, "e")
        with else_path:
            for statement in node.orelse:
                self.visit(statement)
        
        # Combine two paths into one
        # Check for any names that are on the IF path
        self.merge_paths(this_path_id, if_path.id, else_path.id)
        
    def visit_IfExp(self, node):
        # Visit the conditional
        self.visit(node.test)
        
        # Visit the body
        body = self.visit(node.body)
        
        # Visit the orelse
        orelse = self.visit(node.orelse)

        if are_types_equal(body, orelse):
            return body
            
        # TODO: Union type?
        return UnknownType()
    
    def visit_Import(self, node):
        # Handle names
        for alias in node.names:
            asname = alias.asname or alias.name
            module_type = self.load_module(alias.name)
            self.store_variable(asname, module_type)
            
    def visit_ImportFrom(self, node):
        # Handle names
        for alias in node.names:
            if node.module is None:
                asname = alias.asname or alias.name
                module_type = self.load_module(alias.name)
            else:
                module_name = node.module;
                asname = alias.asname or alias.name
                module_type = self.load_module(module_name)
            name_type = module_type.load_attr(alias.name, self, 
                                              callee_position=self.locate())
            self.store_variable(asname, name_type)
    
    def visit_Lambda(self, node):
        # Name
        position = self.locate()
        definitions_scope = self.scope_chain[:]
        
        def definition(tifa, call_type, call_name, parameters, call_position):
            function_scope = Tifa.NewScope(self, definitions_scope)
            with function_scope:
                # Process arguments
                args = node.args.args
                if len(args) != len(parameters):
                    self.report_issue('Incorrect Arity', {"position": position})
                # TODO: Handle special types of parameters
                for arg, parameter in zip(args, parameters):
                    name = arg.arg if self.PYTHON_3 else arg.id
                    if parameter is not None:
                        parameter = parameter.clone_mutably()
                        self.store_variable(name, parameter, position)
                if len(args) < len(parameters):
                    for undefined_parameter in parameters[len(args):]:
                        self.store_variable(name, UnknownType(), position)
                return_value = self.visit(node.body)
            return return_value
        return FunctionType(definition=definition)
    
    def visit_List(self, node):
        type = ListType()
        if node.elts:
            type.empty = False
            # TODO: confirm homogenous subtype
            for elt in node.elts:
                type.subtype = self.visit(elt)
        else:
            type.empty = True
        return type
            
    def visit_ListComp(self, node):
        # TODO: Handle comprehension scope
        for generator in node.generators:
            self.visit(generator)
        return ListType(self.visit(node.elt))
            
    def visit_Name(self, node):
        name = node.id
        if name == "___":
            self.report_issue("Unconnected blocks")
        if isinstance(node.ctx, ast.Load):
            if name == "True" or name == "False":
                return BoolType()
            elif name == "None":
                return NoneType()
            else:
                variable = self.find_variable_scope(name)
                builtin = BUILTINS.get(name)
                if not variable.exists and builtin:
                    return builtin
                else:
                    state = self.load_variable(name)
                    return state.type
        else:
            variable = self.find_variable_scope(name)
            if variable.exists:
                return variable.state.type
            else:
                return UnknownType()
    
    def visit_Num(self, node):
        return NumType()
        
    def visit_Return(self, node):
        if len(self.scope_chain) == 1:
            self.report_issue("Return outside function")
        if node.value is not None:
            self.return_variable(self.visit(node.value))
        else:
            self.return_variable(NoneType())
        
    def visit_SetComp(self, node):
        # TODO: Handle comprehension scope
        for generator in node.generators:
            self.visit(generator)
        return SetType(self.visit(node.elt))
    
    def visit_statements(self, nodes):
        # TODO: Check for pass in the middle of a series of statement
        if any(isinstance(node, ast.Pass) for node in nodes):
            pass
        return [self.visit(statement) for statement in nodes]
                
    def visit_Str(self, node):
        return StrType()
        
    def visit_Subscript(self, node):
        # Handle value
        value_type = self.visit(node.value)
        # Handle slice
        if isinstance(node.slice, ast.Index):
            return value_type.index(Tifa.get_literal(node.slice.value))
        elif isinstance(node.slice, ast.Slice):
            return value_type
    
    def visit_Tuple(self, node):
        type = TupleType()
        if not node.elts:
            type.empty = True
            type.subtypes = []
        else:
            type.empty = False
            # TODO: confirm homogenous subtype
            type.subtypes = [self.visit(elt) for elt in node.elts]
        return type
    
    def visit_UnaryOp(self, node):
        # Handle operand
        operand = self.visit(node.operand)
        
        if isinstance(node.op, ast.Not):
            return BoolType()
        elif isinstance(operand, UnknownType):
            return UnknownType()
        elif type(node.op) in VALID_UNARYOP_TYPES:
            op_lookup = VALID_UNARYOP_TYPES[type(node.op)]
            if type(node.op) in op_lookup:
                op_lookup = op_lookup[type(node.op)]
                if type(operand) in op_lookup:
                    op_lookup = op_lookup[type(operand)]
                    return op_lookup(operand)
        return UnknownType()
        
    def visit_While(self, node):
        # Visit conditional
        self.visit(node.test)
        
        # Visit the bodies
        this_path_id = self.path_id
        # One path is that we never enter the body
        empty_path = Tifa.NewPath(self, this_path_id, "e")
        with empty_path:
            pass
        # Another path is that we loop through the body and check the test again
        body_path = Tifa.NewPath(self, this_path_id, "w")
        with body_path:
            for statement in node.body:
                self.visit(statement)
            # Revisit conditional
            self.visit(node.test);
        # If there's else bodies (WEIRD) then we should check them afterwards
        if node.orelse:
            self.report_issue("Else on loop body")
            for statement in node.orelse:
                self.visit(statement)
        
        # Combine two paths into one
        # Check for any names that are on the IF path
        self.merge_paths(this_path_id, body_path.id, empty_path.id)
        
    def visit_With(self, node):
        if self.PYTHON_3:
            for item in node.items:
                type_value = self.visit(item.context_expr)
                self.visit(item.optional_vars)
                self._walk_target(item.optional_vars, type_value)
        else:
            type_value = self.visit(node.context_expr)
            #self.visit(node.optional_vars)
            self._walk_target(node.optional_vars, type_value)
        # Handle the bodies
        self.visit_statements(node.body)
        
    def _scope_chain_str(self, name=None):
        '''
        Convert the current scope chain to a string representation (divided 
        by "/").
        
        Returns:
            str: String representation of the scope chain.
        '''
        if name:
            return "/".join(map(str, self.scope_chain)) + "/" + name
        else:
            return "/".join(map(str, self.scope_chain))
        
    def identify_caller(self, node):
        '''
        Figures out the variable that was used to kick off this call,
        which is almost always the relevant Name to track as being updated.
        If the origin wasn't a Name, nothing will need to be updated so None
        is returned instead.
        
        TODO: Is this sufficient?
        
        Args:
            node (AST): An AST node
        Returns:
            str or None: The name of the variable or None if no origin could
                         be found.
        '''
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Call):
            return self.identify_caller(node.func)
        elif isinstance(node, (ast.Attribute, ast.Subscript)):
            return self.identify_caller(node.value)
        return None
        
    def iterate_variable(self, name):
        '''
        Update the variable by iterating through it - this doesn't do anything
        fancy yet.
        '''
        return self.load_variable(name)
    
    def store_iter_variable(self, name, type, position=None):
        state = self.store_variable(name, type, position)
        state.read = 'yes'
        return state
    
    def return_variable(self, type):
        return self.store_variable("*return", type)
        
    def append_variable(self, name, type, position=None):
        return self.store_variable(name, type, position)
        
    def store_variable(self, name, type, position=None):
        '''
        Update the variable with the given name to now have the new type.
        
        Args:
            name (str): The unqualified name of the variable. The variable will
                        be assumed to be in the current scope.
            type (Type): The new type of this variable.
        Returns:
            State: The new state of the variable.
        '''
        if position is None:
            position = self.locate()
        full_name = self._scope_chain_str(name)
        current_path = self.path_chain[0]
        variable = self.find_variable_scope(name)
        if not variable.exists:
            # Create a new instance of the variable on the current path
            new_state = State(name, [], type, 'store', position, 
                              read='no', set='yes', over='no')
            self.name_map[current_path][full_name] = new_state
        else:
            new_state = self.trace_state(variable.state, "store")
            if not variable.in_scope:
                self.report_issue("Write out of scope", {'name': name})
            # Type change?
            if not are_types_equal(type, variable.state.type):
                self.report_issue("Type changes", 
                                 {'name': name, 'old': variable.state.type, 
                                  'new': type})
            new_state.type = type
            # Overwritten?
            if variable.state.set == 'yes' and variable.state.read == 'no':
                new_state.over_position = position
                new_state.over = 'yes'
            else:
                new_state.set = 'yes'
                new_state.read = 'no'
            self.name_map[current_path][full_name] = new_state
        return new_state
    
    def load_variable(self, name, position=None):
        '''
        Retrieve the variable with the given name.
        
        Args:
            name (str): The unqualified name of the variable. If the variable is
                        not found in the current scope or an enclosing sope, all
                        other scopes will be searched to see if it was read out
                        of scope.
        Returns:
            State: The current state of the variable.
        '''
        full_name = self._scope_chain_str(name)
        current_path = self.path_chain[0]
        variable = self.find_variable_scope(name)
        if position is None:
            position = self.locate()
        if not variable.exists:
            out_of_scope_var = self.find_variable_out_of_scope(name)
            # Create a new instance of the variable on the current path
            if out_of_scope_var.exists:
                self.report_issue("Read out of scope", {'name': name})
            else:
                self.report_issue("Undefined variables", {'name': name})
            new_state = State(name, [], UnknownType(), 'load', position,
                              read='yes', set='no', over='no')
            self.name_map[current_path][full_name] = new_state
        else:
            new_state = self.trace_state(variable.state, "load")
            if variable.state.set == 'no':
                self.report_issue("Undefined variables", {'name': name})
            if variable.state.set == 'maybe':
                self.report_issue("Possibly undefined variables", {'name': name})
            new_state.read = 'yes';
            if not variable.in_scope:
                self.name_map[current_path][variable.scoped_name] = new_state
            else:
                self.name_map[current_path][full_name] = new_state
        return new_state
        
    def load_module(self, chain):
        '''
        Finds the module in the set of available modules.
        
        Args:
            chain (str): A chain of module imports (e.g., "matplotlib.pyplot")
        Returns:
            ModuleType: The specific module with its members, or an empty
                        module type.
        '''
        module_names = chain.split('.')
        if module_names[0] in MODULES:
            base_module = MODULES[module_names[0]]
            for module in module_names:
                if (isinstance(base_module, ModuleType) and 
                    module in base_module.submodules):
                    base_module = base_module.submodules[module]
                else:
                    self.report_issue("Submodule not found", {"name": chain})
            return base_module
        else:
            self.report_issue("Module not found", {"name": chain})
            return ModuleType()
            
    def combine_states(self, left, right):
        state = State(left.name, [left], left.type, 'branch', self.locate(),
                      read=left.read, set=left.set, over=left.over,
                      over_position=left.over_position)
        if right is None:
            state.read = 'no' if left.read == 'no' else 'maybe'
            state.set = 'no' if left.set == 'no' else 'maybe'
            state.over = 'no' if left.over == 'no' else 'maybe'
        else:
            if not are_types_equal(left.type, right.type):
                self.report_issue("Type changes", {'name': left.name, 
                                                   'old': left.type, 
                                                   'new': right.type})
            state.read = Tifa.match_rso(left.read, right.read)
            state.set = Tifa.match_rso(left.set, right.set)
            state.over = Tifa.match_rso(left.over, right.over)
            if left.over == 'no':
                state.over_position = right.over_position
            state.trace.append(right)
        return state
    
    def merge_paths(self, parent_path_id, left_path_id, right_path_id):
        '''
        Combines any variables on the left and right path into the parent
        name space.
        
        Args:
            parent_path_id (int): The parent path of the left and right branches
            left_path_id (int): One of the two paths
            right_path_id (int): The other of the two paths.
        '''
        # Combine two paths into one
        # Check for any names that are on the IF path
        for left_name in self.name_map[left_path_id]:
            left_state = self.name_map[left_path_id][left_name]
            right_identifier = self.find_path_parent(right_path_id, left_name)
            if right_identifier.exists:
                # Was on both IF and ELSE path
                right_state = right_identifier.state
            else:
                # Was only on IF path, potentially on the parent path
                right_state = self.name_map[parent_path_id].get(left_name)
            combined = self.combine_states(left_state, right_state)
            self.name_map[parent_path_id][left_name] = combined
        # Check for names that are on the ELSE path but not the IF path
        for right_name in self.name_map[right_path_id]:
            if right_name not in self.name_map[left_path_id]:
                right_state = self.name_map[right_path_id][right_name]
                # Potentially on the parent path
                parent_state = self.name_map[parent_path_id].get(right_name)
                combined = self.combine_states(right_state, parent_state)
                self.name_map[parent_path_id][right_name] = combined
    
    def trace_state(self, state, method):
        '''
        Makes a copy of the given state with the given method type.
        
        Args:
            state (State): The state to copy (as in, we trace a copy of it!)
            method (str): The operation being applied to the state.
        Returns:
            State: The new State
        '''
        return state.copy(method, self.locate())
    
    @staticmethod
    def in_scope(full_name, scope_chain):
        '''
        Determine if the fully qualified variable name is in the given scope
        chain.
        
        Args:
            full_name (str): A fully qualified variable name
            scope_chain (list): A representation of a scope chain.
        Returns:
            bool: Whether the variable lives in this scope
        '''
        # Get this entity's full scope chain
        name_scopes = full_name.split("/")[:-1]
        # against the reverse scope chain
        checking_scopes = [str(s) for s in scope_chain[::-1]]
        return name_scopes == checking_scopes
    
    @staticmethod
    def match_rso(left, right):
        if left == right:
            return left
        else:
            return "maybe"
    
    @staticmethod
    def get_literal(node):
        if isinstance(node, ast.Num):
            return LiteralNum(node.n)
        elif isinstance(node, ast.Str):
            return LiteralStr(node.s)
        elif isinstance(node, ast.Tuple):
            values = []
            for elt in node.elts:
                subvalue = Tifa.get_literal(elt)
                if subvalue is not None:
                    values.append(subvalue)
                else:
                    return None
            return LiteralTuple(values)
        elif isinstance(node, ast.Name):
            if node.id == "None":
                return LiteralNone()
            elif node.id == "False":
                return LiteralBool(False)
            elif node.id == "True":
                return LiteralBool(True)
        return None

    
    class NewPath:
        '''
        Context manager for entering and leaving execution paths (e.g., if
        statements).)
        
        Args:
            tifa (Tifa): The tifa instance, so we can modify some of its
                         properties that track variables and paths.
            origin_path (int): The path ID parent to this one.
            name (str): The symbolic name of this path, typically 'i' for an IF
                        body and 'e' for ELSE body.
        
        Fields:
            id (int): The path ID of this path
        '''
        def __init__(self, tifa, origin_path, name):
            self.tifa = tifa
            self.name = name
            self.origin_path = origin_path
            self.id = None
        def __enter__(self):
            self.tifa.path_id += 1
            self.id = self.tifa.path_id
            self.tifa.path_names.append(str(self.id)+self.name)
            self.tifa.path_chain.insert(0, self.id)
            self.tifa.name_map[self.id] = {}
            self.tifa.path_parents[self.id] = self.origin_path
        def __exit__(self, type, value, traceback):
            self.tifa.path_names.pop()
            self.tifa.path_chain.pop(0)
        
    class NewScope:
        '''
        Context manager for entering and leaving scopes (e.g., inside of
        function calls).
        
        Args:
            tifa (Tifa): The tifa instance, so we can modify some of its
                         properties that track variables and paths.
            definitions_scope_chain (list of int): The scope chain of the 
                                                   definition
        '''
        def __init__(self, tifa, definitions_scope_chain):
            self.tifa = tifa
            self.definitions_scope_chain = definitions_scope_chain
        def __enter__(self):
            # Manage scope
            self.old_scope = self.tifa.scope_chain[:]
            # Move to the definition's scope chain
            self.tifa.scope_chain = self.definitions_scope_chain[:]
            # And then enter its body's new scope
            self.tifa.scope_id += 1
            self.tifa.scope_chain.insert(0, self.tifa.scope_id)
        def __exit__(self, type, value, traceback):
            # Finish up the scope
            self.tifa._finish_scope()
            # Leave the body
            self.tifa.scope_chain.pop(0)
            # Restore the scope
            self.tifa.scope_chain = self.old_scope
        