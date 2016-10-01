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
    var analyzer;

    //var python_source = 'sum([1,2])/len([4,5,])\ntotal=0\ntotal=total+1\nimport weather\nimport matplotlib.pyplot as plt\ncelsius_temperatures = []\nexisting=weather.get_forecasts("Miami, FL")\nfor t in existing:\n    celsius = (t - 32) / 2\n    celsius_temperatures.append(celsius)\nplt.plot(celsius_temperatures)\nplt.title("Temperatures in Miami")\nplt.show()';
    var python_source = 'if 5:\n    a = 0\n    b = 0\n    c = 0\nelif "yes":\n    a = 3\n    b = 3\nelse:\n    a = 5\n    if True:\n        b = 7\n    else:\n        b = 3\nprint(a)\nprint(b)';
    
    var unit_tests = [
        // Source Code, Shouldn't catch this, Should catch this
        ['a = 0', [], ['Unread variables']],
        ['print(a)', [], ['Undefined variables']],
        ['a = 0\nprint(a)', ['Undefined variables'], []],
        ['a = 0\na = 5', [], ['Overwritten variables']],
        ['a = 0\nb = 5', ['Overwritten variables'], ['Unread variables']],
        ['a = [1]\nprint(a)\na = [1]\nprint(a)', [], []],
        // Iterating over the result of a builtin
        ['x = xrange(100)\nprint(x)', ['Non-list iterations'], []],
        // Unconnected blocks
        ['a = ___', [], ['Unconnected blocks']],
        ['print(___)', [], ['Unconnected blocks']],
        // Incompatible types
        ['a = 5 + "ERROR"', [], ['Incompatible types']],
        // Update without read
        ['a = 0\na+= 1\n', ['Undefined variables'], ['Unread variables']],
        // Update and read
        ['a = 0\na+= 1\nprint(a)', ['Undefined variables', 'Unread variables'], []],
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
        // Iterate through non-existing list
        ['for x in y:\n\tpass', ['Unread variables'], ['Undefined variables']],
        // Iterate through list
        ['y = [1,2,3]\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], []],
        // Iterate through empty list
        ['y = []\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], ['Empty iterations']],
        // Iterate through number
        ['y = 5\nfor x in y:\n\tpass', ['Unread variables', 'Undefined variables'], ['Non-list iterations']],
        // Iterate over iteration variable
        ['y = [1,2,3]\nfor y in y:\n\tpass', [], ['Iteration variable is iteration list']],
        // Created a new list but didn't read it
        ['old = [1,2,3]\nnew=[]\nfor x in old:\n\tnew.append(x)', [], ['Unread variables']],
        // Created a new list but didn't initialize it
        ['old = [1,2,3]\nfor x in old:\n\tnew.append(x)\nprint(new)', [], ['Undefined variables']],
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
    ];
    
    var errors = 0;
    for (var i = 0, len = unit_tests.length; i < len; i = i+1) {
        var source = unit_tests[i][0],
            nones = unit_tests[i][1],
            somes = unit_tests[i][2];
        analyzer = new AbstractInterpreter(source);
        for (var j = 0, len2 = nones.length; j < len2; j=j+1) {
            if (analyzer.report[nones[j]].length > 0) {
                console.error("AI Tests: Incorrectly detected "+nones[j], "\n"+source);
                errors += 1;
            }
        }
        for (var k = 0, len2 = somes.length; k < len2; k=k+1) {
            if (analyzer.report[somes[k]].length == 0) {
                console.error("AI Tests: Failed to detect "+somes[k], "\n"+source);
                errors += 1;
            }
        }
    }
    if (errors == 0) {
        console.log("All test cases passed!");
    } else {
        console.log(errors, "test cases failed");
    }
})();