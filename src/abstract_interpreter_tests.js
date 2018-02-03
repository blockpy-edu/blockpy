/*
    This file should not be loaded in any production environments, since it's just for debugging the rather complex abstract intepreter.
*/

(function() {

    function assert(condition, message) {
        if (!condition) {
            throw message || "Assertion failed";
        }
    }

    var filename = '__main__.py';
    
    var unit_tests = [
        // Importing
        ['import matplotlib.pyplot as plt\nplt.hist([1,2,3])\nplt.show()', ['Undefined variables'], []],
        ['from random import randint\na=randint(1,2)\n1+a', ['Undefined variables', 'Incompatible types'], []],
        ["import state_demographics\n\n\nincome_list = state_demographics.get(\"Per Capita Income\",\"(None)\",'')\nfilter_income = []\nfor income in income_list:\n    if income > 28000:\n        income_list.append(filter_income)\nprint(filter_income)\n", [], []],
        ["import state_demographics\n\n\nincome_list = state_demographics.get(\"Per Capita Income\",\"(None)\",'')\nnew_income_list = 0\nfor income in income_list:\n    if income > 28000:\n        new_income_list = new_income_list + 1\nprint(new_income_list)\n", [], []],
        ['l = []\nfor x in l:\n    if x > 0:\n        x', [], []],
        ['x = []\nx.append(x)\nx', [], []],
        // Overwritten in one branches
        ['a = 0\nif True:\n\ta = 1\na', ['Possibly undefined variables'], []],
        ["t = 0\nfor x in []:\n    if x:\n        t = t + 1\nprint(t)", ['Possibly undefined variables'], []],
        /*// Write aliased variables
        // Actually this isn't an issue
        ['def x(y):\n    y = y+1\ny=0\nx(y)', ['Write out of scope'], []],*/
        ["x = ''\ndef y():\n    return x\ny()", ['Unread variables'], []],
        
        // Calling functions from within functions
        ['def z():\n     return b\ndef y():\n    b = 0\n    z()\n    return b\ndef x():\n    y()\nx()',
            ['Unread variables'], ['Read out of scope']],
        // Source Code, Shouldn't catch this, Should catch this
        ['print(True)', ['Undefined variables'], []],
        ['a = 0', [], ['Unread variables']],
        ['print(a)', [], ['Undefined variables']],
        ['a = 0\nprint(a)', ['Undefined variables'], []],
        ['a = 0\na = 5', [], ['Overwritten variables']],
        ['a = 0\nb = 5', ['Overwritten variables'], ['Unread variables']],
        ['a = [1]\nprint(a)\na = [1]\nprint(a)', [], []],
        // Unconnected blocks
        ['a = ___', [], ['Unconnected blocks']],
        ['print(___)', [], ['Unconnected blocks']],
        
        ['print("dog" in input("test"))', [], []],
        ["[].replace(',','')", [], []],
        
        // Double call
        ['def x(a):\n    return a\nx(5)\nx(3)', ['Read out of scope'], []],
        
        // Chained functions
        ['def x():\n    return 0\ndef y():\n    x()\ny()', ['Read out of scope', 'Undefined variables'], []],
        
        // String indexing and slicing
        ['("a"[0] + ""[:])[:][0]', ['Incompatible types'], []],
        // List indexing and slicing
        ['([0][0] + [1,2,3][:][2])', ['Incompatible types'], []],
        
        // Returned string
        ['def pluralize(a_word):\n    return a_word+"s"\nnoun = pluralize("Dog")\nprint(noun + " can pet other " + noun)', ['Incompatible types'], []],
        
        // Update without read
        ['a = 0\na+= 1\n', ['Undefined variables'], ['Unread variables']],
        // Update and read
        ['a = 0\na+= 1\nprint(a)', ['Undefined variables', 'Unread variables'], []],
        // Iterate through non-existing list
        ['for x in y:\n\tpass', ['Unread variables'], ['Undefined variables']],
        // Iterate through list
        ['y = [1,2,3]\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], []],
        // Iterate through empty list
        ['y = []\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], ['Empty iterations']],
        // Iterated through list of strings, then iterated through an element
        ['ss = ["Testing", "Here"]\nfor a in ss:\n    print(a)\nfor b in a:\n    print(b)', ['Non-list iterations'], []],
        // Iterate through number
        ['y = 5\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], ['Non-list iterations']],
        // Iterate over iteration variable
        ['y = [1,2,3]\nfor y in y:\n\tpass', [], ['Iteration variable is iteration list']],
        // Type change
        ['a = 0\nprint(a)\na="T"\nprint(a)', [], ['Type changes']],
        // Defined in IF root branch but not the other
        ['if True:\n\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
        // Defined in both branches
        ['if True:\n\ta = 0\nelse:\n\ta = 1\nprint(a)', ['Possibly undefined variables'], []],
        // Defined in ELSE root branch but not the other
        ['if True:\n\tpass\nelse:\n\ta = 1\nprint(a)', [], ['Possibly undefined variables']],
        // Defined in IF branch but not the others
        ['if True:\n\tif False:\n\t\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
        // Defined before IF branch but not the other
        ['if True:\n\ta = 0\nif False:\t\tpass\nprint(a)', [], ['Possibly undefined variables']],
        // Defined after IF branch but not the other
        ['if True:\n\tif False:\n\t\tpass\n\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
        // Defined within both IF branch but not the other
        ['if True:\n\tif False:\n\t\ta=0\n\telse:\n\t\ta = 0\nprint(a)', [], ['Possibly undefined variables']],
        // Defined in all branches
        ['if True:\n\tif False:\n\t\ta=0\n\telse:\n\t\ta = 0\nelse:\n\ta=3\nprint(a)', ['Possibly undefined variables'], []],
        // Read in IF branch, but unset
        ['if True:\n\tprint(a)', [], ['Undefined variables']],
        // Read in ELSE branch, but unset
        ['if True:\n\tpass\nelse:\n\tprint(a)', [], ['Undefined variables']],
        // Read in both branches, but unset
        ['if True:\n\tprint(a)\nelse:\n\tprint(a)', [], ['Undefined variables']],
        // Overwritten in both branches
        ['a = 0\nif True:\n\ta = 0\nelse:\n\ta = 1', [], ['Overwritten variables']],
        // Overwritten in one branches
        ['a = 0\nif True:\n\tpass\nelse:\n\ta = 1', ['Overwritten variables'], []],
        // Overwritten in inner branch
        ['a = 0\nif True:\n\tif False:\n\t\ta = 0\nelse:\n\ta = 1', ['Overwritten variables'], []],
        // Overwritten in all branch
        ['a = 0\nif True:\n\tif False:\n\t\ta = 0\n\telse:\n\t\ta = 2\nelse:\n\ta = 1', [], ['Overwritten variables']],
        // Overwritten in all branch
        ['a = 0\nif True:\n\tprint(a)\n\tif False:\n\t\ta = 0\n\telse:\n\t\ta = 2\nelse:\n\ta = 1', ['Overwritten variables'], []],
        
        // Iterating over the result of a builtin
        ['x = range(100)\nprint(x)', ['Non-list iterations'], []],
        ['x = range(100)\nfor y in x:\n    print(y)', ['Non-list iterations'], []],
        ['x = range(100)\nfor y in x:\n    pass\nfor z in y:\n    print(z)', [], ['Non-list iterations']],
        
        // Incompatible types
        ['a = 5 + "ERROR"', [], ['Incompatible types']],
        ['a = "ERROR" * 5', ['Incompatible types'], []],
        ['-(5)+0', ['Incompatible types'], []],
        ['a=0\na+=5\na', ['Incompatible types', 'Unread variables', 'Undefined variables', 'Overwritten variables'], []],
        ['a=""\na+=5\na', ['Unread variables', 'Undefined variables', 'Overwritten variables'], ['Incompatible types']],
        ['a+=5\na', ['Unread variables', 'Overwritten variables'], ['Undefined variables']],
        ['a=0\na+=5', ['Undefined variables', 'Overwritten variables'], ['Unread variables']],
        
        // Lambda
        ['a = lambda: 0\nb=a()\nb+5', ['Incompatible types'], []],
        
        // Handle function definitions
        ['def named(x):\n\tprint(x)\n', ['Undefined variables'], ['Unread variables']],
        ['def int_func(x):\n\treturn 5\nint_func(10)', [], []],
        // Return value
        ['def x():\n    return 4\nx()', ['Unread variables'], []],
        // Actions after returning
        ['def x():\n    return 5\n    return 4\nx()', [], ['Action after return']],
        ['def x():\n  if True:\n    return 4\n  else:\n    return 3\n  a = 0\n  print(a)\nx()', [], ['Action after return']],
        // Function with subtypes
        ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first([1]))', ['Incompatible types'], []],
        ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first(["1"]))', [], ['Incompatible types']],
        ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first(1))', [], ['Incompatible types']],
        ['def add_first(a_list):\n    for element in a_list:\n        return element + 5\nprint(add_first("1"))', [], ['Incompatible types']],
        // Out of scope
        ['def x(parameter):\n    return parameter\nx(0)\nparameter', [], ['Read out of scope']],
        ['def x(parameter):\n    return parameter\nx(0)', ['Read out of scope'], []],
        
        // Append to empty list
        ['a = []\na.append(1)\nprint(a)', ['Undefined variables', 'Unread variables'], []],
        // Append to non-empty list
        ['a = [1]\na.append(1)\nprint(a)', ['Undefined variables', 'Unread variables'], []],
        // Append to undefined
        ['a.append(1)\nprint(a)', ['Unread variables'], ['Undefined variables']],
        // Append to unread
        ['a=[]\na.append(1)', ['Undefined variables'], ['Unread variables']],
        // Append to number
        ['a=1\na.append(1)\nprint(a)', [], ['Append to non-list']],
        
        // Created a new list but didn't read it
        ['old = [1,2,3]\nnew=[]\nfor x in old:\n\tnew.append(x)', [], ['Unread variables']],
        // Created a new list but didn't initialize it
        ['old = [1,2,3]\nfor x in old:\n\tnew.append(x)\nprint(new)', [], ['Undefined variables']],
        
        // Built-ins
        ['a = float(5)\nb = "test"\nprint(a+b)', [], ['Incompatible types']],
        
        // Double iteration
        ['for x,y in [(1,2), (3,4)]:\n    x, y', ['Undefined variables'], []],
        ['record = {"A": 5, "B": 6}\nfor x,y in record.items():\n    x, y', ['Undefined variables'], []],
        ['record = {"A": 5, "B": 6}\nfor x,y in record.items():\n    x+"", y+0', ['Undefined variables', "Incompatible types"], []],
        
        // Tuple, Multiple Assignment
        ['a,b = 1,2\n1+a\nb', ['Incompatible types'], []],
        
        // Sets
        ['a = set([1,2,3])\nprint(a)', ['Undefined variables'], []],
        
        // Dictionaries
        ['a = {}\na[1] = 0', [], []],
        
        // While
        ['user = input("Give a word.")\nwhile user:\n    print(user)\n    user = input("Give another word.")',
         ['Unread variables'], []],
         
        // With
        ['with open("A") as a:\n    print(a)', ['Undefined variables'], []],
        
        // List comprehensions
        ['a = [5 for x in range(100)]\nfor i in a:\n    5+i', ['Non-list iterations', 'Incompatible types'], []],
        
        // Return outside function
        ['def x():\n    return 5\nx()', ['Return outside function'], []],
        ['def x():\n    pass\nreturn 5\nx()', [], ['Return outside function']],
        
        // Classes
        ['class A:\n    y = 0\n    def __init__(self, x):\n        self.x = 0\n        self.test()\n    def test(self):\n        self.x = 5\nA()', [], []],
    ];
    
    var errors = 0;
    var analyzer = new Tifa();
    for (var i = len = unit_tests.length-1; i >= 0; i = i-1) {
        console.log("TEST", i)
        var source = unit_tests[i][0],
            nones = unit_tests[i][1],
            somes = unit_tests[i][2];
        analyzer.processCode(source);
        //console.log(source);
        if (!analyzer.report.success) {
            console.error("AI Tests: Error message in "+nones[j], "\n"+source, "\n", analyzer.report.error);
            errors += 1;
            continue;
        }
        for (var j = 0, len2 = nones.length; j < len2; j=j+1) {
            if (analyzer.report.issues[nones[j]].length > 0) {
                console.error("AI Tests: Incorrectly detected "+nones[j], "\n"+source, "\n", analyzer.report);
                errors += 1;
            }
        }
        for (var k = 0, len2 = somes.length; k < len2; k=k+1) {
            if (analyzer.report.issues[somes[k]].length == 0) {
                console.error("AI Tests: Failed to detect "+somes[k], "\n"+source, "\n", analyzer.report);
                errors += 1;
            }
        }
    }
    if (errors == 0) {
        console.log("All test cases passed!");
    } else {
        console.log(errors, "test cases failed out of", unit_tests.length);
    }
})();