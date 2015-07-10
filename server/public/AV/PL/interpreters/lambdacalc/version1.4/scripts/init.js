/* global LAMBDA : true */

(function () {

    "use strict";

    window.LAMBDA = {};
    window.LAMBDA.grammarWindow = null;


    function go(n) {
	document.getElementById('interpreterinput').value=LAMBDA.samples[n]; 
	document.getElementById('interpreteroutput').value=
	    LAMBDA.interpret(document.getElementById('interpreterinput').value);
    }


    function openGrammarWindow() {
	if (LAMBDA.grammarWindow === null || LAMBDA.grammarWindow.closed) {
	    window.open('grammar.htm', 'Lambda_Calculus_Grammar ',
			'scrollbars=yes,height=700,width=600,resizable=yes').focus();
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

    LAMBDA.go = go;
    LAMBDA.openGrammarWindow = openGrammarWindow;
    LAMBDA.toggleTestPrograms = toggleTestPrograms;

}());
