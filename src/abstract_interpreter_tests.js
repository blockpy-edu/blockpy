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
        ['a = 0\nprint(a)\na="T"\nprint(a)', [], ['Type changes']],
    ];
    
    for (var i = 0, len = unit_tests.length; i < len; i = i+1) {
        var source = unit_tests[i][0],
            nones = unit_tests[i][1],
            somes = unit_tests[i][2];
        analyzer = new AbstractInterpreter(source);
        analyzer.analyze()
        for (var j = 0, len = nones.length; j < len; j=j+1) {
            if (analyzer.report[nones[j]].length > 0) {
                console.error("AI Tests: Incorrectly detected "+nones[j], "\n"+source);
            }
        }
        for (var k = 0, len = somes.length; k < len; k=k+1) {
            if (analyzer.report[somes[k]].length == 0) {
                console.error("AI Tests: Failed to detect "+somes[k], "\n"+source);
            }
        }
    }
})();