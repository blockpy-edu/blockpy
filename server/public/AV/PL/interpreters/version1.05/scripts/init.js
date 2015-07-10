/* global SLang : true */

(function () {

    "use strict";

    window.SLang = {};
    window.SLang.grammarWindow = null;


    function go(n) {
	document.getElementById('interpreterinput').value=SLang.samples[n]; 
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

    SLang.go = go;
    SLang.openGrammarWindow = openGrammarWindow;
    SLang.toggleTestPrograms = toggleTestPrograms;

}());
