"use strict";
/*global alert: true, console: true, ODSA */
$(document).ready(function () {
  // Process help button: Give a full help page for this activity
  function help() {
    window.open("mergesortHelpPRO.html", "helpwindow");
  }

  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Set click handlers
  $("#help").click(help);
  $("#about").click(about);


  // Process the reset button
  function initialize() {
    // Clear all existing arrays
    $("#arrays").html("");

    // Generate random numbers for the exercise
    initialArray = [];
    userAnswerValue = [];
    userAnswerDepth = [];
    for (var i = 0; i < arraySize; i++) {
      var randomVal = Math.floor(Math.random() * 100);
      initialArray[i] = randomVal;
      userAnswerValue[i] = randomVal;
    }

    // Log the initial state of the exercise
    var initData = {};
    initData.gen_array = initialArray;
    ODSA.AV.logExerciseInit(initData);

    // Dynamically create arrays
    arrays = {};
    initArrays(0, initialArray.length - 1, 1, 1, userAnswerDepth);

    // Reset the merge variables
    resetMergeVars();

    // Create arrays to store the user's answers and hide it because
    // it simply maintains state and is not used for display purposes
    // Need to record the order of the values and how deep in the
    // recursion they are in order to ensure a correct answer
    userAnswerValue = av.ds.array(userAnswerValue, {visible: false});
    userAnswerDepth = av.ds.array(userAnswerDepth, {visible: false});

    av.forward();
    av._undo = [];
    return [userAnswerValue, userAnswerDepth];
  }

  // Create the model solution, which is used for grading the exercise
  // - We must track the value at each horizontal position and vertical
  //   position (depth) to ensure each element is sorted in the correct order
  function modelSolution(av) {
    var modelArr = av.ds.array(initialArray, {indexed: true, layout: "array"});
    var depth = 1;
    var modelDepthArr = [];
    initDepth(0, initialArray.length - 1, depth, modelDepthArr);
    modelDepthArr = av.ds.array(modelDepthArr,
                                {indexed: true, layout: "array"});
    av.displayInit();

    var temp = [];
    mergeSort(av, modelArr, temp, modelDepthArr, 0,
              initialArray.length - 1, depth);
    modelDepthArr.element.css({"top": rowHeight + "px"});
    return [modelArr, modelDepthArr];
  }

  // Dynamically and recursively create the necessary arrays
  // Initialize all single element arrays to contain the appropriate
  // numbers from the initialArray and all other arrays to be empty
  function initArrays(left, right, level, column) {
    var numElements = right - left + 1;
    var contents = new Array(numElements);

    // Set the contents for single element arrays
    if (numElements === 1) {
      contents = [initialArray[left]];
    }

    // Dynamically create and position arrays
    var arr = av.ds.array(contents, {indexed: true, center: false,
                                     layout: "array"});

    var id = "array_" + level + "_" + column;
    arrays[id] = arr;

    // Set array attributes
    arr.element.attr("id", id);
    arr.element.attr("data-offset", left);
    setPosition(arr, level, column);

    // Attach the click handler to the array
    arr.click(function (index) { clickHandler(this, index); });

    if (left === right) {
      userAnswerDepth[left] = level;
      return;
    }

    var mid = Math.floor((left + right) / 2);
    // Recurse, passing the appropriate arguments necessary for
    // setPosition() to the next function call
    initArrays(left, mid, level + 1, 2 * column - 1, userAnswerDepth);
    initArrays(mid + 1, right, level + 1, 2 * column, userAnswerDepth);
  }

  // Calculate and set the appropriate "top" and "left" CSS values based
  // on the specified array's level of recursion, column number and the
  // number of elements in the array
  // arr - the JSAV array to set the "top" and "left" values for
  // level - the level of recursion, the full-size array is level 1
  // column - the array's column number in the current row
  function setPosition(arr, level, column) {
    // Calculate the number of arrays in the current row
    var numArrInRow = Math.pow(2, level - 1);

    // Calculate the left value of the current array by dividing
    // the width of the canvas by twice the number of arrays that should
    // appear in that row: (canvasWidth / (2 * numArrInRow))
    // Odd multiples of the resulting value define a line through the center
    // of each array in the row, found using the formula (2 * column - 1)
    // Note: while it is not used, even multiples define the center between
    // two consecutive arrays. Since we want the left value rather than the
    // center value of each array we calculate the length each array
    // (blockWidth *  arr.size()), divide this value in half and
    // subtract it from the center line to find the left value
    var left = (canvasWidth / (2 * numArrInRow)) * (2 * column - 1) -
               (blockWidth * arr.size() / 2);
    var top = rowHeight * (level - 1);

    // Set the top and left values so that all arrays are spaced properly
    arr.element.css({"left": left, "top": top});
  }

  // Initialize the modelDepthArray by calculating the starting depth
  // of each number
  function initDepth(l, r, depth, depthArray) {
    if (l === r) {
      depthArray[l] = depth;
      return;
    }

    var mid = Math.floor((l + r) / 2);
    // Recurse, passing the appropriate arguments necessary for
    // setPosition() to the next function call
    initDepth(l, mid, depth + 1, depthArray);
    initDepth(mid + 1, r, depth + 1, depthArray);
  }

  // Generate the model answer (called by modelSolution())
  function mergeSort(av, array, temp, depthArray, l, r, depth) {
    // Record the depth and return when list has one element
    if (l === r) {
      depthArray.value(l, depth);
      return;
    }

    // Select midpoint
    var mid = Math.floor((l + r) / 2);

    // Mergesort first half
    mergeSort(av, array, temp, depthArray, l, mid, depth + 1);
    // Mergesort second half
    mergeSort(av, array, temp, depthArray, mid + 1, r, depth + 1);

    // Copy subarray into temp
    for (var i = l; i <= r; i++) {
      temp[i] = array.value(i);
    }

    // Do the merge operation back to the array
    var i1 = l;
    var i2 = mid + 1;
    for (var curr = l; curr <= r; curr++) {
      if (i1 === mid + 1) {          // Left sublist exhausted
        array.value(curr, temp[i2++]);
      } else if (i2 > r) {             // Right sublist exhausted
        array.value(curr, temp[i1++]);
      } else if (temp[i1] < temp[i2]) { // Get smaller
        array.value(curr, temp[i1++]);
      } else {
        array.value(curr, temp[i2++]);
      }

      // Update the depth of each number being merged
      depthArray.value(curr, depth);
      av.stepOption("grade", true);
      av.step();
    }
    return array;
  }

  // Fixstate method for continuous feedback/fix mode
  // Uses the difference between the model and user depth array to determine
  // the absolute index and row where a value should be placed.
  // Determine the relative destination index and which column the destination array is in.
  // Find the destination array's two sublists and the first remaining element in each.
  // Compare these values to determine which should be moved to the destination array.
  // Call 'clickHandler' with the appropriate calculated values to select the element to move
  // and call it again to move it to the destination.
  function fixState(modelState) {
    // Pull the model array and state variables out of the modelState argument
    var modelArr = modelState[0];
    var modelDepthArr = modelState[1];
    var i;

    // Find the absolute index where the correct value
    // will be placed and which level it belongs in
    var destIndex = 0;
    var destDepth = 0;
    for (i = 0; i < modelDepthArr.size(); i++) {
      if (modelDepthArr.value(i) !== userAnswerDepth.value(i)) {
        destIndex = i;
        destDepth = modelDepthArr.value(i);
        break;
      }
    }

    // Determine the correct column and the relative index where
    // the correct answer will be placed
    var destColumn = 1;
    var left = 0;
    var right = modelArr.size() - 1;
    var mid = 0;

    for (i = 0; i < destDepth - 1; i++) {
      mid = Math.floor((left + right) / 2);

      if (destIndex <= mid) {
        //console.log("left: destIndex (" + destIndex + ") <= mid (" + mid + ")");  // FOR DEBUGGING
        right = mid;
        destColumn = 2 * destColumn - 1;
      } else {
        //console.log("right: destIndex (" + destIndex + ") > mid (" + mid + ")");  // FOR DEBUGGING
        left = mid + 1;
        destColumn = 2 * destColumn;
      }

      //console.log("destColumn: " + destColumn + ", left: " + left + ", right: " + right);  // FOR DEBUGGING
    }

    destIndex -= left;

    //console.log("destDepth: " + destDepth + ", destColumn: " + destColumn + ", destIndex: " + destIndex);  // FOR TESTING

    // Get the sub arrays from the hash of JSAV arrays
    var subArr1 = arrays["array_" + (destDepth + 1) + "_" + (2 * destColumn - 1)];
    var subArr2 = arrays["array_" + (destDepth + 1) + "_" + (2 * destColumn)];

    // Get the index of the first non-empty element in each sublist
    var subArr1Idx = -1;
    var subArr2Idx = -1;
    for (i = 0; i < subArr1.size(); i++) {
      if (subArr1.value(i) !== "") {
        subArr1Idx = i;
        break;
      }
    }

    for (i = 0; i < subArr2.size(); i++) {
      if (subArr2.value(i) !== "") {
        subArr2Idx = i;
        break;
      }
    }

    var srcArr;
    var srcIndex;
    if (subArr1Idx > -1 && subArr2Idx > -1) {
      if (subArr2.value(subArr2Idx) < subArr1.value(subArr1Idx)) {
        // First element of the second sublist is smallest
        srcArr = subArr2;
        srcIndex = subArr2Idx;
      } else {
        // First element of the first sublist is smallest
        srcArr = subArr1;
        srcIndex = subArr1Idx;
      }
    } else if (subArr1Idx > -1) {
      // Right sublist if exhausted
      srcArr = subArr1;
      srcIndex = subArr1Idx;
    } else if (subArr2Idx > -1) {
      // Left sublist is exhausted
      srcArr = subArr2;
      srcIndex = subArr2Idx;
    } else {
      console.log("Weird stuff happened:\ndestDepth: " + destDepth + ", destColumn: " +
          destColumn + ", destIndex: " + destIndex + "\nsubArr1 ID: " +
          subArr1.element.attr("id") + ", subArr1: " + subArr1.toString() +
          ", subArr2 ID: " + subArr2.element.attr("id") + ", subArr2: " + subArr2.toString() +
          " subArr1Idx = " + subArr1Idx + ", subArr2Idx = " + subArr2Idx);
      return;
    }

    // Select the element to move
    clickHandler(srcArr, srcIndex);

    // Select the destination where the element should be moved
    var destArr = arrays["array_" + destDepth + "_" + destColumn];
    clickHandler(destArr, destIndex);
  }

  // Click handler for all array elements
  function clickHandler(arr, index) {
    if (mergeValueIndex === -1) { // No element is currently selected,
                                  // select the current element
      // Don't let the user select an empty element
      if (arr.value(index) === "") { return; }
      arr.highlight(index);
      mergeValueArr = arr;
      mergeValueIndex = index;
      return;
    }
    else if (arr === mergeValueArr && index === mergeValueIndex) {
      // Deselect the currently selected element
      resetMergeVars();
    }
    else if (arr !== mergeValueArr) { // Decide how to handle selected element
      // Don't let the user overwrite a merged element
      if (arr.value(index) !== "") { return; }
      var arrLevel = getLevel(arr);
      var mvaLevel = getLevel(mergeValueArr);

      // Ensure the user only merges one level up, not down or too far up
      if (arrLevel === mvaLevel - 1 && mergeValueArr !== null &&
                                       mergeValueIndex > -1) {
        // Complete merge by setting the value of the current element
        // to the stored value
        arr.value(index, mergeValueArr.value(mergeValueIndex));

        // Clear values the user has already merged
        mergeValueArr.value(mergeValueIndex, "");

        // Hide arrays once the user empties them
        if (mergeValueArr.isEmpty()) {
          mergeValueArr.hide();
        }

        // Update the value in the userAnswerValue array and the depth
        // in the userAnswerDepth array
        var usrAnsIndex = findUsrAnswerIndex(arr, index);
        userAnswerValue.value(usrAnsIndex, arr.value(index));
        userAnswerDepth.value(usrAnsIndex, arrLevel);

        // Reset the merge variables so we have a clean state for an undo
        resetMergeVars();

        // Mark this as a step to be graded and a step that can be undone
        // (continuous feedback)
        exercise.gradeableStep();
      } else {
        // Deselect the current element, if the user is trying to merge down
        // rather than up
        resetMergeVars();
      }
    }
  }

  // Convenience function to reset the merge variables
  function resetMergeVars() {
    if (mergeValueArr !== null) {
      // Deselect an element after it is merged or if it is clicked again
      mergeValueArr.unhighlight(mergeValueIndex);
    }

    // Reset so the next element can be merged
    mergeValueArr = null;
    mergeValueIndex = -1;
  }

  //***************************************************************************
  //*************               Convenience Functions               ***********
  //***************************************************************************

  // Given an array and an index in that array, calculates the
  // corresponding position in the userAnswerValue array
  // - The index (starting at 0) within a given row (level) of the
  //   currently selected element
  // - Used to update the userAnswerValue array each time an element is moved
  function findUsrAnswerIndex(arr, idx) {
    return parseArrData(arr)[2] + idx;
  }

  // Return the recursion level of the given array
  // Used to ensure a user only merges an element into an array
  // directly above the current one, can't merge down or too far up
  function getLevel(arr) {
    return parseArrData(arr)[0];
  }

  // Parse the level, column and left offset from the specified array's attributes
  // - Expects array IDs matching the following pattern: "array_\d+_\d+"
  //   where the first number is the level and the second number is the column
  //   [see setPosition()]
  // - Expects array to have a "data-offset" attribute which is the offset
  //   between indices in given array and indices in userAnswerValue array
  function parseArrData(arr) {
    var id = arr.element.attr("id");
    var args = id.split("_");
    var level = parseInt(args[1], 10);
    var column = parseInt(args[2], 10);
    var arrOffset = 0;
    if (typeof arr.element.attr("data-offset") !== "undefined") {
      arrOffset = parseInt(arr.element.attr("data-offset"), 10);
    }
    return [level, column, arrOffset];
  }


  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load the interpreter created by odsaAV.js
  var config = ODSA.UTILS.loadConfig();
  var interpret = config.interpreter;

  // Variables used by "setPosition()"
  var canvasWidth = $("#container").width();     // The width of the display
  var rowHeight = 70;        // Space required for each row to be displayed
  var blockWidth = 32;       // The width of an array element

  // Variables used to keep track of the index and array of
  // currently selected element
  var mergeValueIndex = -1;
  var mergeValueArr = null;

  // Settings for the AV
  var settings = config.getSettings();

  var arraySize = 10,
      initialArray = [],
      userAnswerValue = [],
      userAnswerDepth = [],
      av = new JSAV($(".avcontainer"), {settings: settings});

  // Stores the various JSAV arrays created for the user to enter their solution
  var arrays = {};

  av.recorded();   // we are not recording an AV with an algorithm

  // Using continuous mode slows the exercise down considerably
  // (probably because it has to check that all the arrays are correct)
  var exercise = av.exercise(modelSolution, initialize,
                             {compare: [{"class": "jsavhighlight"}, {}],
                              controls: $(".jsavexercisecontrols"),
                              fix: fixState});
  exercise.reset();
});
