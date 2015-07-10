"use strict";
/*global alert: true, ODSA */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Partial Shellsort. Sweep with the given increment
  function sweep(av, arr, incr, modelmode) {
    var j,
        numElem,
        highlightFunction = function (index) { return index % incr === j; };
    for (j = 0; j < incr; j++) {         // Sort each sublist
      // Highlight the sublist
      numElem = Math.ceil(arr.size() / incr);
      if (j + (incr * (numElem - 1)) >= arr.size()) {
        numElem = numElem - 1;
      }
      if (numElem === 1) {
        return;
      } else {
        arr.highlight(highlightFunction);
        modelmode.value("SORTING");
        av.stepOption("grade", true);
        av.umsg(interpret("av_c1"));
        av.step();
      }
      inssort(av, arr, j, incr);
      arr.unhighlight(highlightFunction);
      modelmode.value("SELECTING");
      av.umsg(interpret("av_c2"));
      av.stepOption("grade", true);
      av.step();
    }
  }

  // Insertion sort using increments
  function inssort(av, arr, start, incr) {
    var i, j;
    for (i = start + incr; i < arr.size(); i += incr) {
      for (j = i; j >= incr; j -= incr) {
        if (parseInt(arr.value(j), 10) < parseInt(arr.value(j - incr), 10)) {
          arr.swap(j, j - incr); // swap the two indices
          av.umsg(interpret("av_c3"));
          av.step();
        } else {
          break; // Done pushing element, leave for loop
        }
      }
    }
  }

  // generates the model answer; calls sweep() implemented above
  function shellsort(av) {
    var modelarr = av.ds.array(initialArray,
                               {indexed: true, layout: arrayLayout.val()}),
        modelmode = av.variable("SORTING");
    var i;
    av.displayInit();
    for (i = 0; i < incrs.length; i += 1) {
      if (incrs[i] < modelarr.size()) {
        sweep(av, modelarr, incrs[i], modelmode); // run sweep to create AV
      }
      modelmode.value("FIRSTSELECTING");
      modelarr.unhighlight();
      av.umsg(interpret("av_c4"));
      av.stepOption("grade", true);
      av.step();
    }
    return [modelarr, modelmode];
  }
      
  // Generate a random (but constrained) set of four increments
  // (tuned for an array size of 10)
  function generateIncrements() {
    incrs[0] = Math.floor(Math.random() * 3) + 6; // incrs[0]: 6 to 8
    incrs[2] = Math.floor(Math.random() * 3) + 2; // incrs[2]: 2 to 4
    // incrs[1] is something between incrs[0] and incrs[2]
    incrs[1] = Math.floor(Math.random() * (incrs[0] - incrs[2] - 1)) + incrs[2] + 1;
    incrs[3] = 1; // Always end in 1
  }
    
  // Process reset button: Re-initialize everything, including the increments
  function initialize() {
    generateIncrements();
    $('#increments').val(incrs);
    
    if (theArray) {
      theArray.clear();
    }
    initialArray = JSAV.utils.rand.numKeys(10, 99, ArraySize);
    theArray = av.ds.array(initialArray,
                           {indexed: true, layout: arrayLayout.val()});
    // register click handlers for the array indices
    theArray.click(function (index) { clickHandler(index); });

    // Log the initial state of the exercise
    var initData = {};
    initData.gen_array = initialArray;
    initData.gen_incrs = incrs;
    ODSA.AV.logExerciseInit(initData);

    currIncrIndex = av.variable(0);
    currSublist = av.variable(0);
    mode = av.variable("SELECTING");
    swapIndex = -1;
    av.umsg(interpret("av_c5") + incrs[currIncrIndex.value()]);
    av.forward();
    av._undo = [];
    return [theArray, mode];
  }

  // Process help button: Give a full help page for this activity
  function help() {
    window.open("shellsortHelpPRO.html", 'helpwindow');
  }

  // Process Done selecting button: change the message, array status
  function selecting() {
    // Don't do anything if user not in SELECTING mode
    if (mode.value() !== "SELECTING" && mode.value() !== "FIRSTSELECTING") {
      return;
    }
    mode.value("SORTING");
    av.umsg(interpret("av_c6"));
    exer.gradeableStep(); // mark this as a gradeable step;
                          // also handles continuous feedback
  }

  // Process Done sorting Sublist button: change the message, array status
  function sorting() {
    // Don't do anything if user not in SORTING mode
    if (mode.value() !== "SORTING") { return; }
    mode.value("SELECTING");
    av.umsg(interpret("av_c7") + incrs[currIncrIndex.value()] + interpret("av_c8"));
    theArray.unhighlight();
    if (currSublist.value() > 0) {
      theArray.toggleArrow(currSublist.value());
    }
    theArray.toggleArrow(currSublist.value() + 1);
    currSublist.value(currSublist.value() + 1);
      
    exer.gradeableStep(); // mark this as a gradeable step;
                          // also handles continuous feedback
  }

  // Process Done Increment button: change the message, array status
  function incrementing() {
    // Don't do anything if user not in SELECTING mode
    if (mode.value() !== "SELECTING") { return; }
    var currIndex = currIncrIndex.value();
    if (currIndex < 3) {
      theArray.unhighlight();
      currIncrIndex.value(currIndex + 1);
      theArray.toggleArrow(currSublist.value());
      currSublist.value(0);
      av.umsg(interpret("av_c9") + incrs[currIndex + 1]);
    } else {
      av.umsg(interpret("av_c10"));
    }
    mode.value("FIRSTSELECTING");
    exer.gradeableStep(); // mark this as a gradeable step;
                          // also handles continuous feedback
  }

  // function that will be called by the exercise if continuous feedback mode
  // is used and the fix errors mode is on.
  function fixState(modelState) {
    var modelArray = modelState[0],
        size = modelArray.size(),
        modelMode = modelState[1];
    for (var i = 0; i < size; i++) {
      var val = modelArray.value(i),
          hl = modelArray.isHighlight(i);
      if (theArray.isHighlight(i) !== hl) { // fix highlights
        if (hl) { theArray.highlight(i); } else { theArray.unhighlight(i); }
      }
      if (val !== theArray.value(i)) { // fix values
        theArray.value(i, val);
      }
    }
    var modelModeVal = modelMode.value();
    // every gradable step changes the mode, so we can use it to deduce the
    // action we should take. this will set the state of the exercise correctly
    if (modelModeVal === "SORTING") {
      // if the mode in model answer is sorting, we should call selecting
      // since after selecting(), the mode will be sorting
      selecting();
    } else if (modelModeVal === "SELECTING") {
      sorting();
    } else if (modelModeVal === "FIRSTSELECTING") {
      incrementing();
    }
  }

  // Click handler for all array elements
  function clickHandler(index) {
    av._redo = []; // clear the forward stack, should add a method for this in lib
    if (mode.value() === "SELECTING" || mode.value() === "FIRSTSELECTING") {
      // in selecting mode, highlight index
      if (!theArray.isHighlight(index)) {
        theArray.highlight(index);
      } else {
        theArray.unhighlight(index);
      }
      av.step();
    } else if (mode.value() === "SORTING") { // in sorting mode
      if (swapIndex === -1) { // if first click
        theArray.addClass(index, "enlarge");
        swapIndex = index;
        av.forward();
      } else { // second click will swap
        if (swapIndex !== index) {
          theArray.swap(swapIndex, index);
        }
        theArray.removeClass(swapIndex, "enlarge");
        swapIndex = -1;
        av.forward();
      }
    }
  }

  // Connect the action callbacks to the HTML entities
  $('#help').click(help);
  $('#about').click(about);
  $('#selecting').click(selecting);
  $('#sorting').click(sorting);
  $('#incrementing').click(incrementing);

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter;       // get the interpreter

  // settings for the AV
  var settings = new JSAV.utils.Settings($(".jsavsettings"));

  // add the layout setting preference
  var arrayLayout = settings.add("layout", {"type": "select",
        "options": {"bar": "Bar", "array": "Array"},
        "label": "Array layout: ", "value": "array"});

  //containing HTML element with id ShellsortProficiency.
  var av = new JSAV($('.avcontainer'), {settings: settings});
  av.recorded();

  var ArraySize = 10; // Size of the exercise array

  var incrs = [],        // The array of increments
      initialArray = [], // Needed for model answer
      theArray,          // JSAV array
      mode,
      currIncrIndex,     // Index for the student's current increment
      currSublist = 0,   // Current sublist number
      swapIndex;         // Array index for last user click
      
  // Initialize the exercise
  // Defines the function to call on reset (initialize()), and the
  //  function to call to generate the model answer (shellsort())
  var exer = av.exercise(shellsort, initialize,
               {compare: [{"class": "jsavhighlight"}, {}],
                controls: $('.jsavexercisecontrols'), fix: fixState});

  exer.reset();
});
