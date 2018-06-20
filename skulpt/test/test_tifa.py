from tifa import Tifa
import sys
import unittest

unit_tests = [
    # Source Code, Shouldn't catch this, Should catch this
    ['a', [], ['Undefined variables']],
    ['print(True)', ['Undefined variables'], []],
    ['a = 0', [], ['Unread variables']],
    ['print(a)', [], ['Undefined variables']],
    ['a = 0\nprint(a)', ['Undefined variables'], []],
    ['a = 0\na = 5', [], ['Overwritten variables']],
    ['a = 0\nb = 5', ['Overwritten variables'], ['Unread variables']],
    ['a = [1]\nprint(a)\na = [1]\nprint(a)', [], []],
    # Unconnected blocks
    ['a = ___', [], ['Unconnected blocks']],
    ['print(___)', [], ['Unconnected blocks']],
    
    ['print("dog" in input("test"))', [], []],
    ["[].replace(',','')", [], []],
    
    # Double call
    ['def x(a):\n    return a\nx(5)\nx(3)', ['Read out of scope'], []],
    
    # Chained functions
    ['def x():\n    return 0\ndef y():\n    x()\ny()', ['Read out of scope', 'Undefined variables'], []],
    
    # String indexing and slicing
    ['("a"[0] + ""[:])[:][0]', ['Incompatible types'], []],
    # List indexing and slicing
    ['([0][0] + [1,2,3][:][2])', ['Incompatible types'], []],
    
    # Returned string
    ['def pluralize(a_word):\n    return a_word+"s"\nnoun = pluralize("Dog")\nprint(noun + " can pet other " + noun)', ['Incompatible types'], []],
    
    # Update without read
    ['a = 0\na+= 1', ['Undefined variables'], ['Unread variables']],
    # Update and read
    ['a = 0\na+= 1\nprint(a)', ['Undefined variables', 'Unread variables'], []],
    # Iterate through non-existing list
    ['for x in y:\n\tpass', ['Unread variables'], ['Undefined variables']],
    # Iterate through list
    ['y = [1,2,3]\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], []],
    # Iterate through empty list
    ['y = []\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], ['Empty iterations']],
    # Iterated through list of strings, then iterated through an element
    ['ss = ["Testing", "Here"]\nfor a in ss:\n    print(a)\nfor b in a:\n    print(b)', ['Non-list iterations'], []],
    # Iterate through number
    ['y = 5\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], ['Non-list iterations']],
    # Iterate over iteration variable
    ['y = [1,2,3]\nfor y in y:\n\tpass', [], ['Iteration variable is iteration list']],
    # Type change
    ['a = 0\nprint(a)\na="T"\nprint(a)', [], ['Type changes']],
    # Defined in IF root branch but not the other
    ['if True:\n\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
    # Defined in both branches
    ['if True:\n\ta = 0\nelse:\n\ta = 1\nprint(a)', ['Possibly undefined variables'], []],
    # Defined in ELSE root branch but not the other
    ['if True:\n\tpass\nelse:\n\ta = 1\nprint(a)', [], ['Possibly undefined variables']],
    # Defined in IF branch but not the others
    ['if True:\n\tif False:\n\t\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
    # Defined before IF branch but not the other
    ['if True:\n\ta = 0\nif False:\t\tpass\nprint(a)', [], ['Possibly undefined variables']],
    # Defined after IF branch but not the other
    ['if True:\n\tif False:\n\t\tpass\n\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
    # Defined within both IF branch but not the other
    ['if True:\n\tif False:\n\t\ta=0\n\telse:\n\t\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
    # Defined in all branches
    ['if True:\n\tif False:\n\t\ta=0\n\telse:\n\t\ta = 0\nelse:\n\ta=3\nprint(a)', ['Possibly undefined variables'], []],
    # Read in IF branch, but unset
    ['if True:\n\tprint(a)', [], ['Undefined variables']],
    # Read in ELSE branch, but unset
    ['if True:\n\tpass\nelse:\n\tprint(a)', [], ['Undefined variables']],
    # Read in both branches, but unset
    ['if True:\n\tprint(a)\nelse:\n\tprint(a)', [], ['Undefined variables']],
    # Overwritten in both branches
    ['a = 0\nif True:\n\ta = 0\nelse:\n\ta = 1', [], ['Overwritten variables']],
    # Overwritten in one branches
    ['a = 0\nif True:\n\tpass\nelse:\n\ta = 1', ['Overwritten variables'], []],
    # Overwritten in inner branch
    ['a = 0\nif True:\n\tif False:\n\t\ta = 0\nelse:\n\ta = 1', ['Overwritten variables'], []],
    # Overwritten in all branch
    ['a = 0\nif True:\n\tif False:\n\t\ta = 0\n\telse:\n\t\ta = 2\nelse:\n\ta = 1', [], ['Overwritten variables']],
    # Overwritten in all branch
    ['a = 0\nif True:\n\tprint(a)\n\tif False:\n\t\ta = 0\n\telse:\n\t\ta = 2\nelse:\n\ta = 1', ['Overwritten variables'], []],
    
    # Iterating over the result of a builtin
    ['x = range(100)\nprint(x)', ['Non-list iterations'], []],
    ['x = range(100)\nfor y in x:\n    print(y)', ['Non-list iterations'], []],
    ['x = range(100)\nfor y in x:\n    pass\nfor z in y:\n    print(z)', [], ['Non-list iterations']],
    
    # Incompatible types
    ['a = 5 + "ERROR"', [], ['Incompatible types']],
    ['a = "ERROR" * 5', ['Incompatible types'], []],
    ['-(5)+0', ['Incompatible types'], []],
    ['a=0\na+=5\na', ['Incompatible types', 'Unread variables', 'Undefined variables', 'Overwritten variables'], []],
    ['a=""\na+=5\na', ['Unread variables', 'Undefined variables', 'Overwritten variables'], ['Incompatible types']],
    ['a+=5\na', ['Unread variables', 'Overwritten variables'], ['Undefined variables']],
    ['a=0\na+=5', ['Undefined variables', 'Overwritten variables'], ['Unread variables']],
    
    # Lambda
    ['a = lambda: 0\nb=a()\nb+5', ['Incompatible types'], []],
    
    # Handle function definitions
    ['def named(x):\n\tprint(x)\n', ['Undefined variables'], ['Unread variables']],
    ['def int_func(x):\n\treturn 5\nint_func(10)', [], []],
    # Return value
    ['def x():\n    return 4\nx()', ['Unread variables'], []],
    # Actions after returning
    ['def x():\n    return 5\n    return 4\nx()', [], ['Action after return']],
    ['def x():\n  if True:\n    return 4\n  else:\n    return 3\n  a = 0\n  print(a)\nx()', [], ['Action after return']],
    # Function with subtypes
    ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first([1]))', ['Incompatible types'], []],
    ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first(["1"]))', [], ['Incompatible types']],
    ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first(1))', [], ['Non-list iterations']],
    ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first("1"))', [], ['Incompatible types']],
    # Out of scope
    ['def x(parameter):\n    return parameter\nx(0)\nparameter', [], ['Read out of scope']],
    ['def x(parameter):\n    return parameter\nx(0)', ['Read out of scope'], []],
    
    # Append to empty list
    ['a = []\na.append(1)\nprint(a)', ['Undefined variables', 'Unread variables'], []],
    # Append to non-empty list
    ['a = [1]\na.append(1)\nprint(a)', ['Undefined variables', 'Unread variables'], []],
    # Append to undefined
    ['a.append(1)\nprint(a)', ['Unread variables'], ['Undefined variables']],
    # Append to unread
    ['a=[]\na.append(1)', ['Undefined variables'], ['Unread variables']],
    # Append to number
    ['a=1\na.append(1)\nprint(a)', [], ['Append to non-list']],
    
    # Append and index
    ['x=[]\nx.append(1)\nx[0]+1', ['Incompatible types'], []],
    
    # Created a new list but didn't read it
    ['old = [1,2,3]\nnew=[]\nfor x in old:\n\tnew.append(x)', [], ['Unread variables']],
    # Created a new list but didn't initialize it
    ['old = [1,2,3]\nfor x in old:\n\tnew.append(x)\nprint(new)', [], ['Undefined variables']],
    
    # Built-ins
    ['a = float(5)\nb = "test"\nprint(a+b)', [], ['Incompatible types']],
    
    # Double iteration
    ['for x,y in [(1,2), (3,4)]:\n    x, y', ['Undefined variables'], []],
    ['record = {"A": 5, "B": 6}\nfor x,y in record.items():\n    x, y', ['Undefined variables'], []],
    ['record = {"A": 5, "B": 6}\nfor x,y in record.items():\n    x+"", y+0', ['Undefined variables', "Incompatible types"], []],
    
    # Tuple, Multiple Assignment
    ['a,b = 1,2\n1+a\nb', ['Incompatible types'], []],
    ['tuple_box = (6, 8, 4)\nprint(tuple_box[0])', [], []],
    
    # Sets
    ['a = set([1,2,3])\nprint(a)', ['Undefined variables'], []],
    
    # Dictionaries
    ['a = {}\na[1] = 0', [], []],
    ['a = {"x": 5, "y": "T"}\na["x"]+5', ['Incompatible types'], []],
    ["x=[{'a': 0, 'b': True}, {'a': 1, 'b': False}]\ny=x[0]\nz=y['a']+0", ['Incompatible types'], []],
    ["x=[{'a': 0, 'b': True}, {'a': 1, 'b': False}]\nnot x[1]['b']", ['Incompatible types'], []],
    ["ls=[{'a': 0, 'b': True}, {'a': 1, 'b': False}]\nfor x in ls:\n    x['a']+0", ['Incompatible types'], []],
    ['dict = {"T": "V"}\nfor key,value in dict:\n    print(key)', [], []],
    
    # While
    ['user = input("Give a word.")\nwhile user:\n    print(user)\n    user = input("Give another word.")',
     ['Unread variables'], []],
     
    # With
    ['with open("A") as a:\n    print(a)', ['Undefined variables'], []],
    
    # List comprehensions
    ['a = [5 for x in range(100)]\nfor i in a:\n    5+i', ['Non-list iterations', 'Incompatible types'], []],
    
    # Return outside function
    ['def x():\n    return 5\nx()', ['Return outside function'], []],
    ['def x():\n    pass\nreturn 5\nx()', [], ['Return outside function']],
    
    # Classes
    ['class A:\n    y = 0\n    def __init__(self, x):\n        self.x = 0\n        self.test()\n    def test(self):\n        self.x = 5\nA()', [], []],
    
    # Mutable Types
    ['def t():\n    x = []\n    x.append(1)\n    return x\nfor x in t():\n    x + 1', ['Incompatible types'], []],
    # Importing
    ['import matplotlib.pyplot as plt\nplt.hist([1,2,3])\nplt.show()', ['Undefined variables'], []],
    ['from random import randint\na=randint(1,2)\n1+a', ['Undefined variables', 'Incompatible types'], []],
    
    ["import state_demographics\n\n\nincome_list = state_demographics.get(\"Per Capita Income\",\"(None)\",'')\nfilter_income = []\nfor income in income_list:\n    if income > 28000:\n        income_list.append(filter_income)\nprint(filter_income)\n", [], []],
    ["import state_demographics\n\n\nincome_list = state_demographics.get(\"Per Capita Income\",\"(None)\",'')\nnew_income_list = 0\nfor income in income_list:\n    if income > 28000:\n        new_income_list = new_income_list + 1\nprint(new_income_list)\n", [], []],
    ['l = []\nfor x in l:\n    if x > 0:\n        x', [], []],
    ['x = []\nx.append(x)\nx', [], []],
    ['def x(y):\n    y\nx()', [], []],
    ['def x():\n    return\nx()', [], []],
    ['def y():\n    x()\ndef x():\n    y()\nx()', [], ['Recursive Call']],
    ['def x():\n    x()\nx()', [], ['Recursive Call']],
    ['b= 0\nif True:\n    if True:\n        b=0\nb', ['Possibly undefined variables'], []],
    # Overwritten in one branches
    ['a = 0\nif True:\n\ta = 1\na', ['Possibly undefined variables'], []],
    ["t = 0\nfor x in []:\n    if x:\n        t = t + 1\nprint(t)", ['Possibly undefined variables'], []],
    ["x = ''\ndef y():\n    return x\ny()", ['Unread variables'], []],
    
    # Calling functions from within functions
    ['def z():\n     return b\ndef y():\n    b = 0\n    z()\n    return b\ndef x():\n    y()\nx()',
    ['Unread variables'], ['Read out of scope']],
    
    # While loop with possibly unused body
    ['a = 10\nwhile a:\n    a -= 1', ['Unread variables'], []],
    ['a = 10\nwhile True:\n    a -= 1', [], ['Unread variables']],
    ['while True:\n    a=0\na', [], ['Possibly undefined variables']],
    ['a=0\nwhile True:\n    a=0\na', ['Possibly undefined variables'], []],
    
    # Generators
    ['[1]+[a for a in [1,2,3]]', ['Unread variables', "Incompatible types"], []],
    ['{4}+{a for a in [1,2,3]}', ['Unread variables', "Incompatible types"], []],
    ['3 in {a:a for a in [1,2,3]}', ['Unread variables', "Incompatible types"], []],
    ['4 in (a for a in [1,2,3])', ['Unread variables', "Incompatible types"], []],
]

class TestCode(unittest.TestCase):
    pass

SILENCE_EXCEPT = None
class o:
    def fail(s, message):
        print(message)
self = o()

def make_tester(code, nones, somes):
    def test_code(self):
        tifa = Tifa(False)
        try:
            tifa.process_code(code)
        except Exception as e:
            raise type(e)(str(e) +
                      ' in code:\n%s' % code)
        if not tifa.report['success']:
            self.fail("Error message in\n"+code+"\n"+str(tifa.report['error']))
        for none in nones:
            if tifa.report['issues'][none]:
                self.fail("Incorrectly detected "+none+"\n"+code+"\n")
        for some in somes:
            if not tifa.report['issues'][some]:
                self.fail("Failed to detect "+some+"\n"+code+"\n")
    return test_code
for i, (code, nones, somes) in enumerate(unit_tests):
    if SILENCE_EXCEPT is None or SILENCE_EXCEPT == i:
        #setattr(TestCode, 'test_code_{:02}'.format(i), make_tester(code, nones, somes))
        make_tester(code, nones, somes)(self)

#if __name__ == '__main__':
    #unittest.main()
tifa = Tifa(False)
tifa.process_code('''
a = 0
for y in [1,2,3]:
    print(a + y)
with open("lacrimosa.txt") as inp:
    for line in inp:
        print(line.strip())
''')
print(tifa.report)