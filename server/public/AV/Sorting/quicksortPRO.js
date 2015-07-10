"use strict";
// /*jslint noempty: false */
/*global alert: true, ODSA */
$(document).ready(function () {
  // Process help button: Give a full help page for this activity
  function help() {
    window.open("quicksortHelpPRO.html", 'helpwindow');
  }

  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  $('#help').click(help);
  $('#about').click(about);


  // Processes the reset button
  function initialize() {
    // Clear existing array
    if (userArr) {
      userArr.clear();
    }

    // Generate random numbers for the exercise
    initialArray = [];
    for (var i = 0; i < arraySize; i++) {
      initialArray[i] = Math.floor(Math.random() * 100);
    }

    // Log the initial state of the exercise
    var initData = {};
    initData.gen_array = initialArray;
    ODSA.AV.logExerciseInit(initData);

    // Create the array the user will intereact with
    userArr = av.ds.array(initialArray, {
      indexed: true,
      layout: arrayLayout.val()
    });

    // Assign a click handler function to the user array
    userArr.click(function (index) {
      clickHandler(this, index);
    });

    resetStateVars();

    av.forward();
    av._undo = [];

    av.umsg(interpret("av_c1"));

    // Return the array containing the user's answer and the state
    // variables we use to grade their solution
    return [userArr, pivotIndex, pivotMoved, partitioned, left, right];
  }

  // Create the model solution used for grading the exercise
  function modelSolution(av) {
    var modelArr = av.ds.array(initialArray, {
      indexed: true,
      layout: arrayLayout.val()
    });

    // ModelSolution vars used for fixing the state
    var msPivotIndex = av.variable(-1);
    var msPivotMoved = av.variable(false);
    var msPartitioned = av.variable(false);
    var msLeft = av.variable(-1);
    var msRight = av.variable(-1);

    // Initialize the display or else the model answer won't show up until
    // the second step of the slideshow
    av.displayInit();

    quicksort(av, modelArr, 0, modelArr.size() - 1, msPivotIndex,
      msPivotMoved, msPartitioned, msLeft, msRight);

    // Return model array and all state variables needed to grade/fix state
    return [modelArr, msPivotIndex, msPivotMoved, msPartitioned,
      msLeft, msRight
    ];
  }

  /**
   * Sorts the specified array using quicksort while marking various
   * steps where the model answer will be compared against the user's
   * solution for grading purposes
   */
  function quicksort(av, arr, i, j, msPivotIndex, msPivotMoved,
    msPartitioned, msLeft, msRight) {
    // Select the pivot
    var pIndex = Math.floor((i + j) / 2);
    arr.highlightBlue(pIndex);
    av.umsg(interpret("av_c2"));
    av.step();

    // Move the pivot to the end of the list being sorted
    av.umsg(interpret("av_c3"));
    arr.swapWithStyle(pIndex, j);
    msPivotIndex.value(j);
    msPivotMoved.value(true);
    av.stepOption("grade", true);
    av.step();

    // Partition the array
    // k will be the first position in the right subarray
    av.umsg(interpret("av_c4"));
    var k = partition(arr, i, j - 1, arr.value(j));
    arr.setLeftArrow(i);
    arr.setRightArrow(j - 1);
    msLeft.value(i);
    msRight.value(j - 1);
    msPartitioned.value(true);
    msPivotMoved.value(false);
    av.stepOption("grade", true);
    av.step();

    arr.clearLeftArrow(i);
    arr.clearRightArrow(j - 1);

    av.umsg(interpret("av_c5"));
    // If the pivot is already in its final location, don't need to swap it
    if (k !== j) {
      arr.swapWithStyle(j, k);
      msPivotMoved.value(true);
      msPivotIndex.value(k);
      av.stepOption("grade", true);
      av.step();
    }

    av.umsg(interpret("av_c6"));
    arr.markSorted(k);
    resetMSStateVars(msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
    av.stepOption("grade", true);
    av.step();

    // Sort left partition
    if ((k - i) > 1) {
      quicksort(av, arr, i, k - 1, msPivotIndex, msPivotMoved,
        msPartitioned, msLeft, msRight);
    } else if ((k - i) === 1) {
      // If the sublist is a single element, mark it as sorted
      av.umsg(interpret("av_c7"));
      arr.markSorted(i);
      resetMSStateVars(msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
      av.stepOption("grade", true);
      av.step();
    }

    // Sort right partition
    if ((j - k) > 1) {
      quicksort(av, arr, k + 1, j, msPivotIndex, msPivotMoved,
        msPartitioned, msLeft, msRight);
    } else if ((j - k) === 1) {
      // If the sublist is a single element, mark it as sorted
      av.umsg(interpret("av_c8"));
      arr.markSorted(j);
      resetMSStateVars(msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
      av.stepOption("grade", true);
      av.step();
    }
  }

  /**
   * Partitions the elements of an array within the specified range
   * so that all values less than the pivot value are farthest to
   * the left and values larger than the pivot are farthest to the right
   *
   * arr - the array containing the elements to partition
   * l - the left endpoint of the range to partition
   * r - the right endpoint of the range to partition
   * pivot - the value to compare all the elements against
   */
  function partition(arr, l, r, pivot) {
    while (l <= r) {
      // Move bounds inward until they meet
      while (arr.value(l) < pivot) {
        l++;
      }
      while ((r >= l) && (arr.value(r) >= pivot)) {
        r--;
      }
      if (r > l) {
        arr.swap(l, r);
      }
    }
    // Return first position in right partition
    return l;
  }

  // Fixstate function called if continuous feedback/fix mode is used
  function fixState(modelState) {
    // Pull the model array and state variables out of the modelState argument
    var modelArray = modelState[0];
    var pIndex = modelState[1];
    var pMoved = modelState[2];
    var part = modelState[3];
    var l = modelState[4];
    var r = modelState[5];

    // Get the raw array elements so we can access their list of class names
    var modArrElems = JSAV.utils._helpers.getIndices($(modelArray.element).find("li"));
    var userArrElems = JSAV.utils._helpers.getIndices($(userArr.element).find("li"));

    for (var i = 0; i < modelArray.size(); i++) {
      // Fix any incorrect values
      userArr.value(i, modelArray.value(i));

      // Ensure the classes of each element in the user array match those in the model solution
      userArrElems[i].className = modArrElems[i].className;

      // Clear any arrows the user put in the wrong place
      userArr.clearLeftArrow(i);
      userArr.clearRightArrow(i);
    }

    // Make sure the value of each user state variable is correct
    pivotIndex.value(pIndex.value());
    pivotMoved.value(pMoved.value());
    partitioned.value(part.value());
    left.value(l.value());
    right.value(r.value());

    // Fix the message being displayed
    av.umsg(interpret("av_c1"));

    if (pivotMoved.value() && !partitioned.value()) {
      av.umsg(interpret("av_c9"));
    } else if (partitioned.value() && !pivotMoved.value()) {
      av.umsg(interpret("av_c15"));
    } else if (partitioned.value() && pivotMoved.value()) {
      av.umsg(interpret("av_c6"));
    }
  }

  // Click handler for all array elements
  function clickHandler(arr, index) {
    if (!partitioned.value()) {
      if (pivotIndex.value() === -1) {
        // Select the pivot
        pivotIndex.value(index);
        arr.highlightBlue(index);
      } else if (pivotIndex.value() === index && !pivotMoved.value()) {
        // Deselect the pivot unless it has already been moved
        pivotIndex.value(-1);
        arr.unhighlightBlue(index);
      } else if (!pivotMoved.value()) {
        // Move the selected pivot to the specified index
        swapPivot(pivotIndex.value(), index);
        av.umsg(interpret("av_c9"));
      } else if (left.value() === -1) {
        // Select the left end of the range to partition
        left.value(index);
        arr.setLeftArrow(index);

        if (right.value() === -1) {
          av.umsg(interpret("av_c10"));
        } else {
          av.umsg(interpret("av_c11"));
        }
      } else if (right.value() === -1) {
        // Select the right end of the range to partition
        right.value(index);
        arr.setRightArrow(index);
        av.umsg(interpret("av_c12"));
      } else if (right.value() === index) {
        // Deselect the right end of the range to partition
        arr.clearRightArrow(index);
        right.value(-1);

        // Guide the user by telling them they just deselected the right endpoint
        av.umsg(interpret("av_c13"));
      } else if (left.value() === index) {
        // Deselect the left end of the range to partition
        arr.clearLeftArrow(index);
        left.value(-1);

        // Guide the user by telling them they just deselected the left endpoint
        av.umsg(interpret("av_c14"));
      }
    } else {
      if (pivotIndex.value() === -1) {
        // Select the pivot
        pivotIndex.value(index);
        arr.highlightBlue(index);
      } else if (pivotIndex.value() === index) {
        // Deselect the pivot
        pivotIndex.value(-1);
        arr.unhighlightBlue(index);
      } else {
        // Move the pivot to its final location
        swapPivot(pivotIndex.value(), index);
      }
    }
  }

  // Convenience function to swap the pivot from one position to another
  // and set the appropriate user state variables
  function swapPivot(pIndex, newPIndex) {
    // Move the selected pivot to the specified index
    userArr.swapWithStyle(pIndex, newPIndex);
    pivotIndex.value(newPIndex);
    pivotMoved.value(true);

    // Mark this as a step to be graded and a step that can be undone
    // (continuous feedback)
    exercise.gradeableStep();
  }


  // Reset the variables used for each iteration of the algorithm
  function resetStateVars() {
    pivotIndex.value(-1);
    pivotMoved.value(false);
    partitioned.value(false);
    left.value(-1);
    right.value(-1);
  }

  // Reset the model solution variables
  function resetMSStateVars(msPivotIndex, msPivotMoved,
    msPartitioned, msLeft, msRight) {
    msPivotIndex.value(-1);
    msPivotMoved.value(false);
    msPartitioned.value(false);
    msLeft.value(-1);
    msRight.value(-1);
  }

  // Perform the partition operation on the user array
  // using the pivot value and range specified by the user
  function partitionButton() {
    // Input validation
    if (pivotIndex.value() === -1) {
      alert("Select a pivot element");
      return;
    }

    if (left.value() === -1 || right.value() === -1) {
      alert("You must select the range to partition");
      return;
    }

    partition(userArr, left.value(), right.value(), userArr.value(pivotIndex.value()));

    // Update state variables and clear left and right marker arrows
    partitioned.value(true);
    pivotMoved.value(false);
    userArr.clearLeftArrow(left.value());
    userArr.clearRightArrow(right.value());

    // Mark this as a step to be graded and a step that can be undone
    // (continuous feedback)
    exercise.gradeableStep();

    av.umsg(interpret("av_c15"));
  }

  // Mark the currently selected element as sorted
  function markSortedButton() {
    // Input validation
    if (pivotIndex.value() === -1) {
      alert("Select an element to mark as sorted");
      return;
    }

    userArr.markSorted(pivotIndex.value());
    resetStateVars();

    // Mark this as a step to be graded and a step that can be undone (continuous feedback)
    exercise.gradeableStep();

    av.umsg(interpret("av_c1"));
  }

  // Attach the button handlers
  $('#partition').click(partitionButton);
  $('#markSorted').click(markSortedButton);


  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load the interpreter created by odsaAV.js
  var interpret = ODSA.UTILS.loadConfig().interpreter;

  // settings for the AV
  var settings = new JSAV.utils.Settings($(".jsavsettings"));
  // add the layout setting preference
  var arrayLayout = settings.add("layout", {
    "type": "select",
    "options": {
      "bar": "Bar",
      "array": "Array"
    },
    "label": "Array layout: ",
    "value": "array"
  });

  var arraySize = 2,
    initialArray = [],
    av = new JSAV($('.avcontainer'), {
      settings: settings
    });

  av.recorded(); // we are not recording an AV with an algorithm

  // Initialize the variables
  var userArr; // JSAV array
  var pivotIndex = av.variable(-1);
  var pivotMoved = av.variable(false);
  var partitioned = av.variable(false);
  var left = av.variable(-1);
  var right = av.variable(-1);

  // Instantiate the exercise
  // modelSolution:
  //   - Creates the model answer that is accessible on the page
  //   - Creates the model answer used to grade the student's answer
  //   - Returns a list containing the model array and all state
  //     variables used for grading and fixing the state if the user makes a mistake
  // initialize: Function to initialize and return the array the user
  //   interacts with and the state variables we use to grade their answer
  // [{css: "background-color"}, {}, {}, {}, {}, {}]
  //   - Defines how to grade each value returned from 'initialize' and 'modelSolution'
  //   - The values and the background-color css properties of both array will be compared
  //   - Each of the state variables will only be compared by value
  // {fix: fixState}: The function to call to fix the state of the exercise
  // if the user makes a mistake in 'fix' mode
  var exercise = av.exercise(modelSolution, initialize, {
    compare: [{
      "class": ["processing", "sorted"]
    }, {}, {}, {}, {}, {}],
    controls: $('.jsavexercisecontrols'),
    fix: fixState
  });
  exercise.reset();
});