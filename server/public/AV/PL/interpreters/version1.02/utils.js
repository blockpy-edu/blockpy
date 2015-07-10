var grammarWindow = null;

function openGrammarWindow() {
   if (grammarWindow === null || grammarWindow.closed)
	window.open('grammar.htm', 'SLang1_Grammar ',
                    'scrollbars=yes,height=600,width=600,resizable=yes').focus();
};


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
};

