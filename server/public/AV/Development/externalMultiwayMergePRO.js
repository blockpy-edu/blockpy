(function ($) {
  "use strict";
  /*global alert: true, ODSA */
  $(document).ready(function () {
    var initData, bh,
        settings = new JSAV.utils.Settings($(".jsavsettings")),
        jsav = new JSAV($('.avcontainer'), {settings: settings}),
        exercise,
	arr1, arr2, arr3, arr4,
	input1, input2, input3,
	invoutputarr,
        swapIndex,
        currentinvisoutput,
        invoutput,
        output;

    jsav.recorded();

    function init() {
      var inputlabel1 = jsav.label("Input Runs", {left: 140, top: 200});
      var outputlabel1 = jsav.label("Output Buffer", {left: 350, top: 250});
      var disklabel = jsav.label("Disk", {left: 475, top: 170});
      var nodeNum = 3;
      currentinvisoutput = jsav.variable(0);
      if(arr1)
      {
	arr1.clear();
      }
      if(arr2)
      {
	arr2.clear();
      }
      if(arr3)
      {
	arr3.clear();
      }
      if(arr4)
      {
	arr4.clear();
      }
      if(invoutputarr)
      {
	invoutputarr.clear();
      }
      invoutput = ["", "", "", "", "", "", "", "", ""];
      output = ["", "", ""];
      input1 = JSAV.utils.rand.numKeys(10, 100, nodeNum);
      input2 = JSAV.utils.rand.numKeys(10, 100, nodeNum);
      input3 = JSAV.utils.rand.numKeys(10, 100, nodeNum);
      input1.sort();
      input2.sort();
      input3.sort();
      // Create an array object under control of JSAV library
      arr1 = jsav.ds.array(input1, {indexed: false, left: 135, top: 230});
      arr2 = jsav.ds.array(input2, {indexed: false, left: 135, top: 280});
      arr3 = jsav.ds.array(input3, {indexed: false, left: 135, top: 330});
      arr4 = jsav.ds.array(output, {indexed: false, left: 350, top: 280});
      invoutputarr = jsav.ds.array(invoutput, {indexed: false, left: 350, top: 200, visible: true});
      // Log the initial state of the exercise
      var exInitData = {};
      exInitData.gen_array = input1;
      ODSA.AV.logExerciseInit(exInitData);

      swapIndex = jsav.variable(-1);
      jsav._undo = [];
      jsav.displayInit();


      // click handler
      arr1.click(clickHandler);
      arr2.click(clickHandler);
      arr3.click(clickHandler);
      arr4.click(clickHandler);

      return [invoutputarr, arr1, arr2, arr3, arr4, currentinvisoutput];
    }

    function fixState(modelState) {
      var modelinvoutputarr = modelState[0];
      var modelarr1 = modelState[1];
      var modelarr2 = modelState[2];
      var modelarr3 = modelState[3];
      var modelarr4 = modelState[4];
      var modelinvisoutput = modelState[5];
      
      var invoutputsize = modelinvoutputarr.size();
      var arrsize1 = arr1.size();
      var arrsize2 = arr2.size();
      var arrsize3 = arr3.size();
      var arrsize4 = arr4.size();

      // check invoutputarr
      for (var i = 0; i < invoutputsize; i++)
      {
	invoutputarr.value(i, modelinvoutputarr.value(i));
      }

      // check arr1
      for (var j = 0; j < arrsize1; j++)
      {
	arr1.value(j, modelarr1.value(j));
      }

      // check arr2
      for (var k = 0; k < arrsize2; k++)
      {
	arr2.value(k, modelarr2.value(k));
      }

      // check arr3
      for (var l = 0; l < arrsize3; l++)
      {
	arr3.value(l, modelarr3.value(l));
      }

      // check arr1
      for (var m = 0; m < arrsize4; m++)
      {
	arr4.value(m, modelarr4.value(m));
      }
      // only swaps are graded so swapIndex cannot be anything else after correct step
      swapIndex.value(-1); 
      // check invis array "size"
      currentinvisoutput.value(modelinvisoutput.value());
    }

    function model(modeljsav) {
      var setWhite = function (index, arr) {
         arr.css(index, {"background-color": "#FFFFFF", "color": "black" });
      };

      var setYellow = function (index, arr) {
         arr.css(index, {"background-color": "#FFFF00", "color": "black" });
      };

      var highlight_background_color = "#2B44CF";
      var highlight = function (index, arr) {
         arr.css(index, {"background-color": highlight_background_color, "color": "white"});
      };

      var modelarr1 = modeljsav.ds.array(input1, {indexed: false, left: 85, top: 30});
      var modelarr2 = modeljsav.ds.array(input2, {indexed: false, left: 85, top: 80});
      var modelarr3 = modeljsav.ds.array(input3, {indexed: false, left: 85, top: 130});
      var modelarr4 = modeljsav.ds.array(output, {indexed: false, left: 300, top: 80});
      var modelinvoutputarr = modeljsav.ds.array(invoutput, {indexed: false, left: 300, top: 0, visible: true});
      var inputlabel2 = modeljsav.label("Input Runs", {left: 90, top: 0});
      var outputlabel2 = modeljsav.label("Output Buffer", {left: 300, top: 50});
      var disklabel2 = modeljsav.label("Disk", {left: 425, top: -25});

      modeljsav.displayInit();
      var currentoutput = 0;
      var currentinvoutput = modeljsav.variable(0);
      var currentinput1 = 0;
      var currentinput2 = 0;
      var currentinput3 = 0;
      modeljsav._undo = [];

      while (modelinvoutputarr.value(8) == "") {
        modeljsav.umsg("We must look at the first value of each input run.");
 	setWhite(0, modelarr4);
  	setWhite(1, modelarr4);
        setWhite(2, modelarr4);
        setYellow(currentinput1, modelarr1);
        setYellow(currentinput2, modelarr2);
        setYellow(currentinput3, modelarr3);

        modeljsav.step();
	// arr1 value is smallest
	if(((modelarr1.value(currentinput1) <= modelarr2.value(currentinput2)) && 
		(modelarr1.value(currentinput1) <= modelarr3.value(currentinput3))) ||
	//must check if other inputs are out of bounds 
	(currentinput2 == 3 && (modelarr1.value(currentinput1) <= modelarr3.value(currentinput3))) ||
	(currentinput3 == 3 && (modelarr1.value(currentinput1) <= modelarr2.value(currentinput2))) ||
        (currentinput2 == 3 && currentinput3 == 3))
	{
  	   modeljsav.umsg("The value "+modelarr1.value(currentinput1)+" is removed and sent to the output because it is the smallest value.");   
  	   modeljsav.effects.moveValue(modelarr1, currentinput1, modelarr4, currentoutput);
  	   setYellow(currentoutput, modelarr4);
  	   setWhite(currentinput1, modelarr1);
  	   setWhite(currentinput2, modelarr2);
  	   setWhite(currentinput3, modelarr3);
	   currentoutput += 1;
	   currentinput1 += 1;
           modeljsav.stepOption("grade", true);
           modeljsav.step();
	} 
	// arr2 value is smallest
	else if(((modelarr2.value(currentinput2) <= modelarr1.value(currentinput1)) && 
		(modelarr2.value(currentinput2) <= modelarr3.value(currentinput3))) ||
	//must check if other inputs are out of bounds 
	(currentinput1 == 3 && (modelarr2.value(currentinput2) <= modelarr3.value(currentinput3))) ||
	(currentinput3 == 3 && (modelarr2.value(currentinput2) <= modelarr1.value(currentinput1))) ||
	(currentinput1 == 3 && currentinput3 == 3))
	{
  	   modeljsav.umsg("The value "+modelarr2.value(currentinput2)+" is removed and sent to the output because it is the smallest value.");   
  	   modeljsav.effects.moveValue(modelarr2, currentinput2, modelarr4, currentoutput);
  	   setYellow(currentoutput, modelarr4);
  	   setWhite(currentinput1, modelarr1);
  	   setWhite(currentinput2, modelarr2);
  	   setWhite(currentinput3, modelarr3);
	   currentoutput += 1;
	   currentinput2 += 1;
           modeljsav.stepOption("grade", true);
           modeljsav.step();
	} 
	// arr3 value is smallest
	else if(((modelarr3.value(currentinput3) <= modelarr1.value(currentinput1)) && 
		(modelarr3.value(currentinput3) <= modelarr2.value(currentinput2))) ||
	//must check if other inputs are out of bounds 
	(currentinput1 == 3 && (modelarr3.value(currentinput3) <= modelarr2.value(currentinput2))) ||
	(currentinput2 == 3 && (modelarr3.value(currentinput3) <= modelarr1.value(currentinput1))) ||
	(currentinput1 == 3 && currentinput2 == 3))
	{
  	   modeljsav.umsg("The value "+modelarr3.value(currentinput3)+" is removed and sent to the output because it is the smallest value."); 
  	   modeljsav.effects.moveValue(modelarr3, currentinput3, modelarr4, currentoutput);
  	   setYellow(currentoutput, modelarr4);
  	   setWhite(currentinput1, modelarr1);
  	   setWhite(currentinput2, modelarr2);
  	   setWhite(currentinput3, modelarr3);
	   currentoutput += 1;
	   currentinput3 += 1;
           modeljsav.stepOption("grade", true);
           modeljsav.step();
	}

        //check if arr4 needs to be output
        if(modelarr4.value(2) !== "")
	{
	   modeljsav.umsg("We must write the output buffer to the disk.");   
  	   modeljsav.effects.moveValue(modelarr4, 0, modelinvoutputarr, currentinvoutput.value());
	   modeljsav.effects.moveValue(modelarr4, 1, modelinvoutputarr, currentinvoutput.value() + 1);
	   modeljsav.effects.moveValue(modelarr4, 2, modelinvoutputarr, currentinvoutput.value() + 2);
	   setYellow(0, modelarr4);
	   setYellow(1, modelarr4);
	   currentinvoutput.value(currentinvoutput.value() + 3);
           currentoutput = 0;
           modeljsav.stepOption("grade", true);
           modeljsav.step();
	}

      }

      return [modelinvoutputarr, modelarr1, modelarr2, modelarr3, modelarr4, currentinvoutput];
    }

var firstSelection, secondSelection;

    function clickHandler(index) {
      jsav._redo = []; // clear the forward stack, should add a method for this in lib
      var sIndex = swapIndex.value();
      if (sIndex === -1) { // if first click
	firstSelection = this;
        firstSelection.css(index, {"font-size": "145%"});
        swapIndex.value(index);
      } else if (sIndex === index) {
	secondSelection = this;
	if(firstSelection === secondSelection)
	{
        	firstSelection.css(index, {"font-size": "100%"});
        	swapIndex.value(-1);
        	firstSelection = null;
        	secondSelection = null;
	}
	// different entities were selected
	else
	{
		firstSelection.css(sIndex, {"font-size": "100%"});
        	jsav.effects.moveValue(firstSelection, sIndex, secondSelection, index);
        	firstSelection = null;
        	secondSelection = null;
        	swapIndex.value(-1);
        	exercise.gradeableStep();
	}
      } else { // second click will swap
        secondSelection = this;
	if(firstSelection === secondSelection)
	{
        	firstSelection.css([sIndex, index], {"font-size": "100%"});
        	firstSelection.swap(sIndex, index, {});
	}
	// different entities were selected
	else
	{
		firstSelection.css(sIndex, {"font-size": "100%"});
        	jsav.effects.moveValue(firstSelection, sIndex, secondSelection, index);
	}
        firstSelection = null;
        secondSelection = null;
        swapIndex.value(-1);
        exercise.gradeableStep();
      }
    }

    // Process About button: Pop up a message with an Alert
    function about() {
      alert("Multiway Merge Proficiency Exercise\nWritten by Josh Horn\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/OpenDSA/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }

    exercise = jsav.exercise(model, init,
                             { compare:  { css: "background-color" },
                               controls: $('.jsavexercisecontrols'),
                               fix: fixState });
    exercise.reset();

    $("#outputbuffer").click(function () {
      if(currentinvisoutput >= invoutputarr.size()) {
	return;
      }
      jsav.effects.moveValue(arr4, 0, invoutputarr, currentinvisoutput.value());
      jsav.effects.moveValue(arr4, 1, invoutputarr, currentinvisoutput.value() + 1);
      jsav.effects.moveValue(arr4, 2, invoutputarr, currentinvisoutput.value() + 2);
      currentinvisoutput.value(currentinvisoutput.value() + 3);
      exercise.gradeableStep();
    });

    $("#about").click(about);});

}(jQuery));
