//LinearIndexing Proficiency Exercise


"use strict";
/*global alert: true, ODSA */
(function ($) {
  $(document).ready(function () {
    /* **************************************************************
    *  This first section is generic initialization that all AVs    *
    *  will need, including initialization for the OpenDSA library  *
    *  The first line you need to set to use your form's name       *
    ************************************************************** */
	function about() {
      alert("LinearIndexing Algorithm Visualization\nWritten by Daniel Breakiron\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/OpenDSA/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }
	
	$('#about').click(about);
    // settings for the AV
    var settings = new JSAV.utils.Settings($(".jsavsettings"));

    // add the layout setting preference
    var arrayLayout = settings.add("layout", {"type": "select",
          "options": {"bar": "Bar", "array": "Array"},
          "label": "Array layout: ", "value": "array"});

    var av = new JSAV($('.avcontainer'), {settings: settings});
	
    av.recorded();

    // Create a convenience function named tell 
    var tell = function (msg, color) { av.umsg(msg, {color: color}); };

    var ArraySize = 4; // Size of the exercise array


    /* **************************************************************
    *        Everything below this is specific to this AV           *
    ************************************************************** */

    var incrs = [], // The array of increments
        $theArray = $("#profArray"),
		$theArrays = $("#profArrays"),
		$solArray = $("#solArray"),
		array = [],
        initialArray = [], // needed for model answer
        theArray,
		theArrays,
		solArray;
  
    //creates the initial labels for the exercise
    function InitialLabels() {

	var fragLabel1 = av.label("1", {left : 102, top: 310});
	var fragLabel2 = av.label("2001", {left : 208, top: 310});
	var fragLabel3 = av.label("2003", {left : 245, top: 310});
	var fragLabel4 = av.label("5688", {left : 351, top: 310});
	var fragLabel5 = av.label("5894", {left : 388, top: 310});
	var fragLabel6 = av.label("9942", {left : 494, top: 310});
	var fragLabel7 = av.label("10528", {left : 531, top: 310});
	var fragLabel8 = av.label("10984", {left : 630, top: 310});	
	var fragLabel8 = av.label("3000", {left : 137, top: 173});
    }
	
    // Initialize all data structures for the exercise 
    function initialize() {
    
      var htmldata = "";
      htmldata = "<li>" + 1 + "</li><li>" + 2003 + "</li><li>" + 5894 + "</li><li>" + 10528 + "</li>";
      $theArray.html(htmldata);
	  
	  var htmldata2 = "";
      htmldata2 = "<li>"  + "</li><li>" + "</li><li>" +  "</li><li>" + "</li>";
      $theArrays.html(htmldata2);
	  
	  var htmldata3 = "";
      htmldata3 = "<li>" + 1200 + "</li><li>" + 1860 + "</li><li>" + 2700 + "</li><li>" + 2920 + "</li><li>" + 3000 + "</li><li>" + 4200 + "</li><li>" + 5500 + "</li>";
      $solArray.html(htmldata3);
      
      // Log the initial state of the exercise
      InitialLabels();
	  
      var initData = {};
      initData.gen_array = initialArray;
      initData.gen_incrs = incrs;
      ODSA.AV.logExerciseInit(initData);

      theArray = av.ds.array($theArray, {center: false, layout: arrayLayout.val()}).css({"x": "295", "y": "10"});
	  av.forward();
	  theArrays = av.ds.array($theArrays, {left: true, layout: arrayLayout.val()}).css({"x": "-3", "y": "20"});
	  av.forward();
	  solArray = av.ds.array($solArray, {left: true, layout: arrayLayout.val()}).css({"x": "0", "y": "30"});
	  
      return theArrays;
    }

    //This function deals with the logic for the model solution
    function modelSolution(jsav) {
     var modelarr = jsav.ds.array([1 ,2003 ,5894 ,10528], {top: 50, left: 200});
     jsav.displayInit();
  
     modelarr.highlight(1);
     jsav.stepOption("grade", true);
     jsav.step();
	 
	 var modelarr = jsav.ds.array([,,,,], {top: 100, left: 200});
	 modelarr.highlight(1);
     jsav.stepOption("grade", true);
     jsav.step();
	 
	 var solarr = jsav.ds.array([1200 ,1860 ,2700 ,2920, 3000, 4200, 5500], {top: 50, left: 200});
	 solarr.highlight(4);
	 jsav.stepOption("grade", true);
     jsav.step();
		    
     return modelarr;
    }

    // Process help button: Give a full help page for this activity
    // We might give them another HTML page to look at.
    function help() {
      window.open("shellsorthelpPRO.html", 'helpwindow');
    }

    // Process About button: Pop up a message with an Alert
    function about() {
      alert("LinearIndexing Algorithm Visualization\nWritten by Daniel Breakiron\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/OpenDSA/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }

    // Initialize the exercise
    // Defines the function to call on reset (initialize()), and the
    //  function to call to generate the model answer (modelSolution())
    var exer = av.exercise(modelSolution, initialize,
                           { compare:  [{css: "background-color"}, {}],
                             controls: $('.jsavexercisecontrols')});
    exer.reset();
    
    // register click handlers for the array indices
    theArray.click(function (index) {
	
	  if (theArray.isHighlight(1)){
	  return;
	  }
      if (!theArray.isHighlight(index)) {
        
		theArray.highlight(index);
		if(theArray.isHighlight(1)){
        exer.gradeableStep();
		theArray.unhighlight(0);
		theArray.unhighlight(2);
		theArray.unhighlight(3);
		av.step();
		}
		}
        
     
      av.step();
    });
	
	theArrays.click(function (index) {
	
	  if (theArrays.isHighlight(1)){
	  return;
	  }
      if (!theArrays.isHighlight(index)) {
        theArrays.highlight(index);
        if(theArrays.isHighlight(1)){
        exer.gradeableStep();
		theArrays.unhighlight(0);
		theArrays.unhighlight(2);
		theArrays.unhighlight(3);
		av.step();
		}
      } else {
        theArrays.unhighlight(index);
      }
      av.step();
    });
	
	solArray.click(function (index) {
	
	if(solArray.isHighlight(4)){
	return;
	}
      if (!solArray.isHighlight(index)) {
        solArray.highlight(index);
		if (solArray.isHighlight(4)){
        exer.gradeableStep();
		solArray.unhighlight(0);
		solArray.unhighlight(1);
		solArray.unhighlight(2);
		solArray.unhighlight(3);
		solArray.unhighlight(5);
		solArray.unhighlight(6);
		}
      } else {
        solArray.unhighlight(index);
      }
      av.step();
    });

    // Connect the action callbacks to the HTML entities
    $('#help').click(help);
    $('#about').click(about);
  });
}(jQuery));
