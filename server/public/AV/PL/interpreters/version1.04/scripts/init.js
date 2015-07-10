/* global SLang : true */

(function () {

    "use strict";

    window.SLang = {};
    window.SLang.grammarWindow = null;


    function go(n) {
	document.getElementById('interpreterinput').value=SLang.samples[n][0]; 
	document.getElementById('interpreteroutput').value=
	    SLang.interpret(document.getElementById('interpreterinput').value);
    }


    function openGrammarWindow() {
	if (SLang.grammarWindow === null || SLang.grammarWindow.closed) {
	    window.open('grammar.htm', 'SLang1_Grammar ',
			'scrollbars=yes,height=600,width=650,resizable=yes').focus();
	}
    }

    function toggleTestPrograms() {
	var testDiv = document.getElementById("tests");
	var testButton = document.getElementById("testsButton");
	if (testDiv.style.display === "" || testDiv.style.display === "none") {
	    // tests are not visible: show them
	    testDiv.style.display = "block";
	    testButton.value = "Hide Test Programs";
	} else {
	    // tests are visible: hide them
	    testDiv.style.display = "none";
	    testButton.value = "Show Test Programs";
	}
    }


    function runTestSuite() {
	var testOutput, testExpected;
	var count = 0;
	var samples = SLang.samples;
	var n = samples.length-1;
	console.log("==============================================");
	console.log("            Running test suite");
	console.log("==============================================");
	for(var i=1; i<=n; i++) {
	    testOutput = SLang.interpret(samples[i][0]);
	    testExpected = samples[i][1];
	    if (testOutput === testExpected) {
		count++;
	    } else {
		console.log("---------------------------------------");
		console.log("Failed test #" + i + ": " + samples[i][0]);
		console.log("\tCorrect: " + testExpected);
		console.log("\tOutput:  " + testOutput);
	    }
        }
	if (count === n) {
	    console.log("Passed all " + n  + " tests.")
	} else {
	    console.log("Failed " + (n-count) + " test(s).")
	}
    }

    SLang.go = go;
    SLang.openGrammarWindow = openGrammarWindow;
    SLang.toggleTestPrograms = toggleTestPrograms;
    SLang.runTestSuite = runTestSuite;

}());
