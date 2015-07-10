/* global PARAMS, LAMBDA, alert */

$(document).ready(function () {

    var normalOrder = PARAMS.strategy === "normal";
    var L = LAMBDA;
    var jsavArray;
    var settings = new JSAV.utils.Settings($(".jsavsettings"));
    var av = new JSAV($('.avcontainer'), {settings: settings});
    av.recorded();
    var tell = function (msg, color) { av.umsg(msg, {color: color}); };
    var $theExpression = $("#expression");
    var correct;  // array of lamba expressions (each one as a string)
    var correctTrimmed; // same as above but with ^'s but no spaces
    var step;

    var setArrayCellsWidth = function () {
	arr.addClass(true, "defaultCellStyle");
	arr.addClass(oneChar, "oneCharWidth");
	arr.addClass(noChar,"emptyWidth");
	arr.addClass(lambdaChar,"lambdaWidth");
	arr.addClass(parenChar,"narrow");
	arr.addClass(0,"stepNumber");
    };
    var arr;
    var oneChar = function(x) { return ! parenChar(x) &&
				arr.value(x).length === 1; };
    var noChar = function(x) { return arr.value(x).length === 0; };
    var lambdaChar = function(x) { return arr.value(x).length === 3; };
    var parenChar = function(x) { 
	return arr.value(x) === '(' || arr.value(x) === ')' ||
	    arr.value(x) === ' '; 
    };
    function modelSolution(modeljsav)  {

	var correct2D = [];
	var step;
	for(var i=0; i<correct.length; i++) {
	    step = LAMBDA.mySplit(correct[i]);
	    if (i===0) {
		step.unshift("Initial &lambda; exp: ");
	    } else{
		step.unshift("Step " + i + ":");
	    }
	    correct2D.push(step);
	}
	var matrix = [ modeljsav.ds.array(correct2D[0],{left: 20}) ];
	arr = matrix[0];
	setArrayCellsWidth();

	// actual model answer (not shown in the model answer window)
	var modelArray = modeljsav.ds.array(correctTrimmed, {visible: false});
	modeljsav.displayInit();

	for(var row=1; row<correct2D.length; row++) {
	    matrix.push(modeljsav.ds.array(correct2D[row],
			{ relativeTo: matrix[matrix.length-1], 
			  left: 0, top: 0,
			  anchor: "left bottom",
			  myAnchor: "left top"}));
	    arr = matrix[row];
	    setArrayCellsWidth();

	    // invisible (used for grading)
	    modelArray.highlight(row);
	    modelArray.unhighlight(row-1);
	    modeljsav.gradeableStep();
	}

	modelArray.highlight();
	modeljsav.gradeableStep();
	modeljsav.recorded();
	return modelArray;
    }
    
    function init() {
	var vars = "uvxyz";
	var numSteps = 3;  // minimum number of reductions in this exercise
	var e;
	if (normalOrder) {
	    $("#strategy").html("normal-order");
	}
	function infiniteLoop(reduction) { return reduction[0].length > 1; }
	function tooLong(reduction) { 
	    return 35 < reduction.map(function (x) { return x[0].length; })
		.reduce(function(a,b) { return Math.max(a,b);} , -1);
	}
	function sameReduction(r1,r2) {
	    if (r1.length !== r2.length) {
		return false;
	    } else {
		for(var i=1; i<r1.length; i++) {
		    if (r1[i][0] !== r2[i][0]) {
			return false;
		    }
		}
		return true;
	    }
	}
	correct = [];
	var normalRed, applicativeRed;
	while (correct.length < numSteps+1 || correct.length > numSteps+2) {
	    e = L.getRndExp(1,2,6,vars,"");
	    normalRed = L.reduceToNormalForm(e,"normal");
	    applicativeRed = L.reduceToNormalForm(e,"applicative");   
	    if (normalOrder) {
		if ( infiniteLoop(normalRed) ||
		     sameReduction(normalRed,applicativeRed) ||
		     tooLong(normalRed) ) {
		    correct = [];
		} else {
		    correct = normalRed;
		}
	    } else { // applicative order
		if ( infiniteLoop(applicativeRed) ||
		     sameReduction(normalRed,applicativeRed) ||
		     tooLong(applicativeRed) ) {
		    correct = [];
		} else {
		    correct = applicativeRed;
		}
	    }
	}
	correct = correct.map(function(a) { return a[0]; });
	$theExpression.html(correct[0]);
        correctTrimmed = correct.map(function (x) { return x.replace(/\s+/g,''); }); 
        correctTrimmed = correctTrimmed.map(function (x) { return x.replace(/\u03BB/g,'^');}); 
	step = 1;
	// jsavArray is used for grading each step
	jsavArray = av.ds.array( correctTrimmed, {visible: false});
	return jsavArray;
    }
	
    function help() {
	alert("At each step of the " +
	      (normalOrder ? "normal" : "applicative") +
	      "-order reduction, you must pick the leftmost " +
	      (normalOrder ? "outermost" : "innermost") +		  
	      " \u03B2-redex and reduce it.");
    }

    function about() {
	alert("This exercise was developed by David Furcy.\n\nSolve it" +
	      " to demonstrate that you have mastered the process of " +
	      (normalOrder ? "normal" : "applicative") +
	      "-order reduction in the" +
	      " \u03BB-calculus.");
    }

    function submit() {
	var answer = $('#answer').val().replace(/\s+/g, '');
	$('#answer').val("");
	if(step < correct.length) {
	    if(answer === correctTrimmed[step]) {
		jsavArray.highlight(step);
		jsavArray.unhighlight(step-1);
		exercise.gradeableStep();
		$theExpression.html(correct[step]);
		step++;
	    } else {
		exercise.gradeableStep();
	    }
	} else {
	    exercise.gradeableStep();
	}
    }
    
    function done() {
	if(step < correct.length) {
	    alert("Watch out! There are more reductions to perform.");
	    exercise.gradeableStep();
	} else {
	    jsavArray.highlight();
	    alert("Correct! There are no more reductions to perform.");
	    exercise.gradeableStep();
	    
	}
    }
	
    // Function to fix exercise if an incorrect submission is entered.
    function fixState(modeljsav) {
	if(step < correct.length) {
	    jsavArray.highlight(step);
	    jsavArray.unhighlight(step-1);
	    $theExpression.html(correct[step]);
	    step++;
	} else {
	    alert("There are no more reductions to perform.");
	}
    }
	
    var exercise = av.exercise(modelSolution, init, 
			       { compare: {class: "jsavhighlight"},
				 controls: $('.jsavexercisecontrols'), 
				 fix: fixState });
    exercise.reset();

    $('#help').click(help);
    $('#about').click(about);
    $('#submit').click(submit);
    $('#done').click(done);
});

