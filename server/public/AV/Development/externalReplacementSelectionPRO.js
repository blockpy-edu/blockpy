/*global alert: true, ODSA */
$(document).ready(function () {
  "use strict";
  // Process help button: Give a full help page for this activity
  function help() {
    window.open("extRSHelpPRO.html", "helpwindow");
  }

  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  function init() {
    var nodeNum = 10;
    if (bh) {
      bh.clear();
    }
    if (inputarray) {
      inputarray.clear();
    }
    if (outputarray) {
      outputarray.clear();
    }
    // Generate array and tree data
    initoutput = ["", "", "", "", ""];
    initinput = JSAV.utils.rand.numKeys(10, 100, 5);
    initData = JSAV.utils.rand.numKeys(10, 100, nodeNum); // Tree data
    // Create labels
    jsav.label("Input:", {left: 650, top: 250});
    jsav.label("Output:", {left: 10, top: 250});
    // Create arrays
    inputarray = jsav.ds.array(initinput, {indexed: false, left: 650, top: 290});
    outputarray = jsav.ds.array(initoutput, {indexed: false, left: 10, top: 290});

    // Log the initial state of the exercise
    var exInitData = {};
    exInitData.gen_array = initData;
    ODSA.AV.logExerciseInit(exInitData);

    var exInitOutput = {};
    exInitOutput.gen_array = initoutput;
    ODSA.AV.logExerciseInit(exInitOutput);

    var exInitInput = {};
    exInitInput.gen_array = initinput;
    ODSA.AV.logExerciseInit(exInitInput);

    // Create binary heap tree
    bh = jsav.ds.binheap(initData,
      { nodegap: 25,
        compare: function (a, b) {
          return a - b;
        }
      });

    swapIndex = jsav.variable(-1);
    jsav._undo = [];
    jsav.displayInit();

    // click handler
    inputarray.click(clickHandler);
    outputarray.click(clickHandler);
    bh.click(clickHandler);

    return [bh, outputarray, inputarray];
    //    return [bh, outputarray];
  }

  function fixState(modelState) {
    var modelHeap = modelState[0];
    var modelinputarray = modelState[2];
    var modeloutputarray = modelState[1];
    var outputsize = modeloutputarray.size();
    var inputsize = modelinputarray.size();

    // check output
    for (var j = 0; j < outputsize; j++) {
      outputarray.value(j, modeloutputarray.value(j));
    }

    // check input
    for (var k = 0; k < inputsize; k++) {
      inputarray.value(k, modelinputarray.value(k));
    }

    // check bh
    var size = modelHeap.size();
    swapIndex.value(-1); // only swaps are graded so swapIndex cannot be anything else after correct step
    for (var i = 0; i < size; i++) {
      bh.css(i, {"background-color": modelHeap.css(i, "background-color")});
      bh.value(i, modelHeap.value(i));
    }
    bh.heapsize(modelHeap.heapsize());
  }

  function model(modeljsav) {
    // Create binary heap tree
    var modelbh = modeljsav.ds.binheap(initData,
      { nodegap: 20,
        compare: function (a, b) {
          return a - b;
        }
      });

    modelbh.origswap = modelbh.swap; // store original heap grade function
    // set all steps that include a swap to be gradable
    modelbh.swap = function (ind1, ind2, opts) {
      this.origswap(ind1, ind2, opts);
      this.jsav.stepOption("grade", true);
    };

    // Create labels
    modeljsav.label("Input:", {left: 650, top: 230});
    modeljsav.label("Output:", {left: 10, top: 230});

    // Create arrays
    var modelinputarray = modeljsav.ds.array(initinput, {indexed: false, left: 650, top: 270});
    var modeloutputarray = modeljsav.ds.array(initoutput, {indexed: false, left: 10, top: 270});

    modeljsav.displayInit(); // Set initial setup for model answer
    var currentoutput = 0;
    var currentinput = 0;

    modeljsav._undo = [];
    while (modelinputarray.value(4) !== "") {
      modeljsav.umsg("We start by sending the root to the output.");
      modeljsav.step();

//      modeljsav.effects.moveValue(modelbh, 0, modeloutputarray, currentoutput);
//      modeloutputarray.value(currentoutput, modelbh.value(0));
//      modelbh.value(0, "");
      modelbh.moveValue(modelbh, 0, modeloutputarray, currentoutput);

      currentoutput++;
      modeljsav.stepOption("grade", true);
      modeljsav.step();

      // swap with last value
      if (modeloutputarray.value(currentoutput - 1) > modelinputarray.value(currentinput)) {
        modeljsav.umsg("<br/>...The heap now takes an input", {preserve: true});

//        modeljsav.effects.moveValue(modelinputarray, currentinput, modelbh, 0);
//        modelbh.value(0, modelinputarray.value(currentinput));
//        modelinputarray.value(currentinput, "");
        modelbh.moveValue(modelinputarray, currentinput, modelbh, 0);

        currentinput++;
        modeljsav.stepOption("grade", true);
        modeljsav.step();
        modeljsav.umsg("The value is too small for this run and is swapped with the end of the array");
        modelbh.swap(0, modelbh.heapsize() - 1);
        modeljsav.stepOption("grade", true);
        modeljsav.step();

        modeljsav.umsg("<br/>...decrement the heap size", {preserve: true});
        modelbh._treenodes[modelbh.heapsize() - 1].edgeToParent().hide();
        modelbh.css(modelbh.heapsize() - 1, {"background-color": "#ddd"});
        modelbh.heapsize(modelbh.heapsize() - 1);
        modeljsav.stepOption("grade", true);
        modeljsav.step();
        modeljsav.umsg("<br/>...and restore the heap property", {preserve: true});
        modelbh.heapify(1);
      }
      else { // normal insert
        modeljsav.umsg("<br/>...The heap now takes an input", {preserve: true});

//        modeljsav.effects.moveValue(modelinputarray, currentinput, modelbh, 0);
//        modelbh.value(0, modelinputarray.value(currentinput));
//        modelinputarray.value(currentinput, "");
        modelbh.moveValue(modelinputarray, currentinput, modelbh, 0);

        currentinput++;
        modeljsav.stepOption("grade", true);
        modeljsav.step();
        modeljsav.umsg("<br/>...and restore the heap property", {preserve: true});
        modelbh.heapify(1);
      }
    }
    return [modelbh, modeloutputarray, modelinputarray];
    //    return [modelbh, modeloutputarray];
  }

  function clickHandler(index, entity) {
    if (bh.heapsize() === 0 || index >= bh.heapsize()) {
      return;
    }
    jsav._redo = []; // clear the forward stack, should add a method for this in lib
    var prevIndex = swapIndex.value();

    if (prevIndex === -1) { // if first click
      firstSelection = (entity === bh) ? bh : this;
      firstSelection.css(index, {"font-size": "145%"});
      swapIndex.value(index);
    } else if (prevIndex === index) {
      secondSelection = (entity === bh) ? bh : this;
      if (firstSelection === secondSelection) {
        firstSelection.css(index, {"font-size": "100%"});
        swapIndex.value(-1);
        firstSelection = null;
        secondSelection = null;
      } else { // different entities were selected
        firstSelection.css(prevIndex, {"font-size": "100%"});

//        jsav.effects.moveValue(firstSelection, prevIndex, secondSelection, index);
//        secondSelection.value(index, firstSelection.value(prevIndex));
//        firstSelection.value(prevIndex, "");
        bh.moveValue(firstSelection, prevIndex, secondSelection, index);

        firstSelection = null;
        secondSelection = null;
        swapIndex.value(-1);
        exercise.gradeableStep();
      }
    } else { // second click will swap
      secondSelection = (entity === bh) ? bh : this;
      if (firstSelection === secondSelection) {
        firstSelection.css([prevIndex, index], {"font-size": "100%"});
        firstSelection.swap(prevIndex, index, {});
      }
      else { // different entities were selected
        firstSelection.css(prevIndex, {"font-size": "100%"});

//        jsav.effects.moveValue(firstSelection, prevIndex, secondSelection, index);
//        secondSelection.value(index, firstSelection.value(prevIndex));
//        firstSelection.value(prevIndex, "");
        bh.moveValue(firstSelection, prevIndex, secondSelection, index);
      }
      firstSelection = null;
      secondSelection = null;
      swapIndex.value(-1);
      exercise.gradeableStep();
    }
  }

  $("#decrement").click(function () {
    if (bh.heapsize() === 0) {
      alert("Heapsize is already zero, cannot decrement!");
      return;
    }
    bh._treenodes[bh.heapsize() - 1].edgeToParent().hide();
    bh.heapsize(bh.heapsize() - 1);
    bh.css(bh.heapsize(), {"background-color": "#ddd"});
    exercise.gradeableStep();
  });
  $("#about").click(about);
  $("#help").click(help);

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load the interpreter created by odsaAV.js
  var interpret = ODSA.UTILS.loadConfig().interpreter;

  var settings = new JSAV.utils.Settings($(".jsavsettings")),
    jsav = new JSAV($('.avcontainer'), {settings: settings}),
    exercise,
    swapIndex;

  var bh, inputarray, outputarray; // Data structures
  var initData, initinput, initoutput; // Generated data
  var firstSelection, secondSelection; // Click handler selection structures

  jsav.recorded();

  exercise = jsav.exercise(model, init,
    { compare: { css: "background-color" },
      controls: $('.jsavexercisecontrols'),
      fix: fixState
    });

  $(".jsavcontainer").on("click", ".jsavbinarytree .jsavbinarynode", function () {
    var index = $(this).data("jsav-heap-index") - 1;
    // passes bh to the handler to tell it the tree was clicked
    clickHandler(index, bh);
  });

  exercise.reset();
});
