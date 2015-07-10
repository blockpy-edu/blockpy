"use strict";
/*global alert: true, ODSA */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Process clear button: Clear the output textbox
  function Clear() {
    av.clearumsg();
    InitFlag = false;
  }

  // Initialize theArray to be size random numbers
  function initArray(size) {
    var i;
    theArray.length = 0; // Out with the old
    // Give random numbers in range 0..9999
    for (i = 0; i < size; i++) {
      theArray[i] = Math.floor(Math.random() * 10000);
    }
    ASize = size;
  }

  // Change the array size
  function Change() {
    // Validate arraysize
    var newVal = Number($("#arraysize").val());
    if (isNaN(newVal) || (newVal < 1) || (newVal > 10000)) {
      alert(interpret("av_c1"));
      return;
    }
    if (newVal !== ASize) {
      ASize = newVal;
      InitFlag = false;
      initArray(ASize);
    }
  }

  // Swap two elements of an array
  function swap(A, i, j) {
    var temp = A[i];
    A[i] = A[j];
    A[j] = temp;
  }

  // Do an incremental insertion sort
  function insertionSort(A, start, incr) {
    var i, j;
    for (i = start + incr; i < A.length; i += incr) {
      for (j = i; (j >= incr) && (A[j] < A[j - incr]); j -= incr) {
        comps += 1;
        swaps += 1;
        swap(A, j, j - incr);
      }
      if (j >= incr) { comps += 1; }
    }
  }

  // Verify that the array really is sorted
  function checkArray(A) {
    var i;
    for (i = 1; i < A.length; i++) {
      if (A[i] < A[i - 1]) {
        alert(interpret("av_c2"));
        return;
      }
    }
  }
      
  // Validate the increment series
  function checkIncrements() {
    var i,
        num,
        prev = Number.MAX_VALUE;

    // Convert user's increments to an array,
    var incrs = $("#increments").val().match(/[0-9]+/g) || [];
    for (i = 0; i < incrs.length; i++) {
      incrs[i] = Number(incrs[i]);
      if (isNaN(incrs[i]) || incrs[i] < 0 || incrs[i] > prev) {
        alert(interpret("av_c3"));
        return null;
      }
      prev = incrs[i];
    }
    if (incrs[incrs.length - 1] !== 1) {
      alert(interpret("av_c3"));
      return null;
    }
    return incrs;
  }

  // Main action: Result of clicking "Run" button
  function RunIt() {
    var i, j;
    var incr, curr;
    var tempArray = []; // This is the working copy of the array

    // Validate the user's increments
    var incrs = checkIncrements();
    if (!incrs) { return; }

    // This should only happen the very first time we run
    if (theArray.length !== ASize) { initArray(ASize); }
      
    // Log the initial state of the exercise
    var initData = {};
    initData.user_array_len = ASize;
    initData.gen_array = theArray;
    initData.user_incrs = incrs;
    ODSA.AV.logExerciseInit(initData);

    if (!InitFlag) {
      av.umsg(interpret("av_c4") + ASize, {color: "blue"});
      // First we run a standard insertion sort
      // Copy to the working array
      tempArray = theArray.slice(0);
      comps = 0;
      swaps = 0;
      insertionSort(tempArray, 0, 1);
      checkArray(tempArray);
      av.umsg(interpret("av_c5") + comps + interpret("av_c6") + swaps +
              interpret("av_c7"));

      // Next we do the "divide by twos" series
      // Copy to the working array
      tempArray = theArray.slice(0);
      comps = 0;
      swaps = 0;
      j = 1;
      while (j * 2 < ASize) { j = j * 2; }
      for (incr = j; incr >= 1; incr = incr / 2) {
        for (curr = 0; curr < incr; curr++) {
          insertionSort(tempArray, curr, incr);
        }
      }
      checkArray(tempArray);
      av.umsg(interpret("av_c8") + comps + interpret("av_c6") + swaps +
              interpret("av_c7"));
      twosComps = comps;
      twosSwaps = swaps;
      InitFlag = true;
    }

    // Now we are ready to run the user's series
    // Copy to the working array
    tempArray = theArray.slice(0);
    comps = 0;
    swaps = 0;
    for (i = 0; i < incrs.length; i += 1) {
      for (curr = 0; curr < incrs[i]; curr++) {
        insertionSort(tempArray, curr, incrs[i]);
      }
    }
    checkArray(tempArray);
    av.umsg(interpret("av_c9") + $("#increments").val() +
            interpret("av_c10") + comps + interpret("av_c6") + swaps +
            interpret("av_c7"));
    if ((comps < twosComps) && (swaps < twosSwaps)) { // Give user credit
      // Give user proficiency credit
      ODSA.AV.awardCompletionCredit();
      av.umsg(interpret("av_c11"));
    }
  }

  // Action callbacks to the various HTML entities.
  $("#about").click(about);
  $("#run").click(RunIt);
  $("#clear").click(Clear);
  $("#arraysize").focusout(Change);
  $("#increments").focusout(checkIncrements);


  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter;       // get the interpreter

  // Placeholder text translation needs to be set explicitly
  $("#increments").attr("placeholder", interpret("av_incrementsPlaceholder"));

  // Create the AV object. We turn off slideshow mode, since this is a
  // "static" form-based activity
  var av = new JSAV("ssperform", {"animationMode": "none"});

  // The permanent array of numbers.
  // This is "permanent" in that we want to use the same values
  // each time that we sort, so that we can compare costs.
  // It only changes when the user re-sets the array size, at which
  // time a new set of random numbers is drawn.
  var theArray = [];

  var ASize = parseInt($("#arraysize").val(), 10); // Array size

  var comps; // Count for comparisions
  var swaps; // Count for swaps
  // These are stored to compare later against user's series for credit
  var twosComps; // Number of comparisons for Divide-by-2's series
  var twosSwaps; // Number of swaps for Divide-by-2's series

  // True if we have already printed baseline info;
  // False means we need to print it out again on "run", and toggle
  var InitFlag = false;
});
