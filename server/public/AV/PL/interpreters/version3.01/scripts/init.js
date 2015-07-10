/* global SLang : true, console */

(function () {

    "use strict";

    window.SLang = {};
    window.SLang.grammarWindow = null;


    function go(n) {
	document.getElementById('interpreterinput').value=SLang.samples[n][1]; 
	document.getElementById('interpreteroutput').value=
	    SLang.interpret(document.getElementById('interpreterinput').value);
    }


    function openGrammarWindow() {
	if (SLang.grammarWindow === null || SLang.grammarWindow.closed) {
	    window.open('grammar.html', 'SLang1_Grammar ',
			'scrollbars=yes,height=600,width=700,resizable=yes').focus();
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
	var testValue;
	var count = 0;
	var samples = SLang.samples;
	var n = samples.length-1;
	console.log("==============================================");
	console.log("            Running test suite");
	console.log("==============================================");
	for(var i=1; i<=n; i++) {
	    console.log("=============================================");
	    console.log("                  Test #" + i);
	    console.log("=============================================");
	    console.log("Program:");
	    console.log("--------");
	    console.log(samples[i][1]);
	    console.log("\nPrinted output:");	    
	    console.log("---------------");
	    testValue = SLang.interpret(samples[i][1]);
	    console.log("Return value:");
	    console.log("-------------");
	    console.log(testValue);


        }
    }
    
    SLang.go = go;
    SLang.openGrammarWindow = openGrammarWindow;
    SLang.toggleTestPrograms = toggleTestPrograms;
    SLang.runTestSuite = runTestSuite;

}());
