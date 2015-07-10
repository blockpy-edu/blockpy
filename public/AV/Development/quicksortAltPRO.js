"use strict";
/*jslint noempty: false */
/*global alert: true, ODSA */
(function ($) {
  $(document).ready(function () {
    // Process help button: Give a full help page for this activity
    // We might give them another HTML page to look at.
    function help() {
      window.open("quicksortHelpPRO.html", 'helpwindow');
    }

    // Process about button: Pop up a message with an Alert
    function about() {
      alert("Insertion Sort Algorithm Visualization\nWritten by Daniel Breakiron\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/OpenDSA/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }

    $('#help').click(help);
    $('#about').click(about);

    //*****************************************************************************
    //*************       QUICKSORT PROFICIENCY EXERCISE CODE         *************
    //*****************************************************************************

    // settings for the AV
    var settings = new JSAV.utils.Settings($(".jsavsettings"));
    // add the layout setting preference
    var arrayLayout = settings.add("layout", {"type": "select",
          "options": {"bar": "Bar", "array": "Array"},
          "label": "Array layout: ", "value": "array"});

    var arraySize = 10,
      initialArray = [],
      av = new JSAV($('.avcontainer'), {settings: settings}),
      pseudocode = 
        "void quicksort(Comparable[] A, int i, int j) { // Quicksort\n"+
        "  int pivotindex = findpivot(A, i, j);  // Pick a pivot\n"+
        "  swap(A, pivotindex, j);               // Stick pivot at end\n"+
        "  // k will be the first position in the right subarray\n"+
        "  int k = partition(A, i, j-1, A[j]);\n"+
        "  swap(A, k, j);                        // Put pivot in place\n"+
        "  if ((k-i) > 1) quicksort(A, i, k-1);  // Sort left partition\n"+
        "  if ((j-k) > 1) quicksort(A, k+1, j);  // Sort right partition\n"+
        "}",
      code = av.code(
        // code temporarily hardcoded
        pseudocode,
        {
          // url: "../../SourceCode/Processing/Sorting/Quicksort.pde",
          // startAfter: "/* *** ODSATag: Quicksort *** */",
          // endBefore: "/* *** ODSAendTag: Quicksort *** */",
          after: {element: $("p.instructions")}
      }),
      msCode;

    av.recorded();     // we are not recording an AV with an algorithm

    // Initialize the variables
    var userArr;
    var pivotIndex = av.variable(-1);
    var pivotMoved = av.variable(false);
    var partitioned = av.variable(false);
    var left = av.variable(-1);
    var right = av.variable(-1);

    /**
     * Processes the reset button
     *     - Clears existing arrays
     *     - Generates a new set of random numbers to sort
     *     - Initializes the array the user will sort
     */
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
      userArr = av.ds.array(initialArray, {indexed: true, layout: arrayLayout.val()});

      // Assign a click handler function to the user array
      userArr.click(function (index) {
        clickHandler(this, index);
      });

      resetStateVars();

      code.show();

      av.forward();
      av._undo = [];

      av.umsg("Select the pivot and then click on where it should be moved to.");
      code.setCurrentLine(1);

      // Return the array containing the user's answer and the state variables we use to grade their solution
      return [userArr, pivotIndex, pivotMoved, partitioned, left, right];
    }

    /**
     * Creates the model solution which is used for grading the exercise
     */
    function modelSolution(jsav) {
      var modelArr = jsav.ds.array(initialArray, {indexed: true, layout: arrayLayout.val()});

      // ModelSolution vars used for fixing the state
      var msPivotIndex = jsav.variable(-1);
      var msPivotMoved = jsav.variable(false);
      var msPartitioned = jsav.variable(false);
      var msLeft = jsav.variable(-1);
      var msRight = jsav.variable(-1);

      // Add the code into the model solution
      msCode = jsav.code(pseudocode);
      msCode.show();

      // Initialize the display or else the model answer won't show up until the second step of the slideshow
      jsav.displayInit();

      quicksort(jsav, modelArr, 0, modelArr.size() - 1, msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);

      // Return the model array and all the state variables we want to use for grading and fixing the state
      return [modelArr, msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight];
    }

    /**
     * Sorts the specified array using quicksort while marking various
     * steps where the model answer will be compared against the user's
     * solution for grading purposes
     */
    function quicksort(jsav, arr, i, j, msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight) {
      // Select the pivot
      var pIndex = Math.floor((i + j) / 2);
      arr.highlightBlue(pIndex);
      jsav.umsg("Select the pivot");
      msCode.setCurrentLine(1);
      jsav.step();

      // Move the pivot to the end of the list being sorted
      jsav.umsg("Move the pivot to the end");
      msCode.setCurrentLine(2);
      arr.swapWithStyle(pIndex, j);
      msPivotIndex.value(j);
      msPivotMoved.value(true);
      jsav.stepOption("grade", true);
      jsav.step();

      // Partition the array
      // k will be the first position in the right subarray
      jsav.umsg("Partition the subarray");
      msCode.setCurrentLine(4);
      var k = partition(arr, i, j - 1, arr.value(j));
      arr.setLeftArrow(i);
      arr.setRightArrow(j - 1);
      msLeft.value(i);
      msRight.value(j - 1);
      msPartitioned.value(true);
      msPivotMoved.value(false);
      jsav.stepOption("grade", true);
      jsav.step();

      arr.clearLeftArrow(i);
      arr.clearRightArrow(j - 1);

      jsav.umsg("Put the pivot value into its correct location");
      msCode.setCurrentLine(5);
      // If the pivot is already in its final location, don't need to swap it
      if (k !== j) {
        arr.swapWithStyle(j, k);
        msPivotMoved.value(true);
        msPivotIndex.value(k);
        jsav.stepOption("grade", true);
        jsav.step();
      }

      jsav.umsg("Mark the pivot location as sorted");
      arr.markSorted(k);
      resetMSStateVars(msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
      jsav.stepOption("grade", true);
      jsav.step();

      // Sort left partition
      msCode.setCurrentLine(6);
      if ((k - i) > 1) {
        quicksort(jsav, arr, i, k - 1, msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
      } else if ((k - i) === 1) {
        // If the sublist is a single element, mark it as sorted
        jsav.umsg("Mark the single value on the left side as sorted");
        arr.markSorted(i);
        resetMSStateVars(msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
        jsav.stepOption("grade", true);
        jsav.step();
      }

      // Sort right partition
      msCode.setCurrentLine(7);
      if ((j - k) > 1) {
        quicksort(jsav, arr, k + 1, j, msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
      } else if ((j - k) === 1) {
        // If the sublist is a single element, mark it as sorted
        jsav.umsg("Mark the single value on the right side as sorted");
        arr.markSorted(j);
        resetMSStateVars(msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight);
        jsav.stepOption("grade", true);
        jsav.step();
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
        while (arr.value(l) < pivot) { l++; }
        while ((r >= l) && (arr.value(r) >= pivot)) { r--; }
        if (r > l) {
          arr.swap(l, r);
        }
      }
      // Return first position in right partition
      return l;
    }

    /**
     * Function that will be called by the exercise if continuous feedback mode
     * is used and the "fix incorrect step" mode is on.
     */
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
    }

    /**
     * Click handler for all array elements
     */
    function clickHandler(arr, index) {
      if (!partitioned.value()) {
        if (pivotIndex.value() === -1) {
          // Select the pivot
          pivotIndex.value(index);
          arr.highlightBlue(index);
          code.setCurrentLine(2);
        } else if (pivotIndex.value() === index && !pivotMoved.value()) {
          // Deselect the pivot unless it has already been moved
          pivotIndex.value(-1);
          arr.unhighlightBlue(index);
          code.setCurrentLine(-1);
          code.setCurrentLine(1);
        } else if (!pivotMoved.value()) {
          // Move the selected pivot to the specified index
          swapPivot(pivotIndex.value(), index);
          av.umsg("Select the partition\'s left endpoint");
          code.setCurrentLine(4);
        } else if (left.value() === -1) {
          // Select the left end of the range to partition
          left.value(index);
          arr.setLeftArrow(index);

          if (right.value() === -1) {
            av.umsg("Select the partition\'s right endpoint, then click on 'Partition'.");
            code.setCurrentLine(4);
          } else {
            av.umsg("Click 'Partition'");
            code.setCurrentLine(4);
          }
        } else if (right.value() === -1) {
          // Select the right end of the range to partition
          right.value(index);
          arr.setRightArrow(index);
          av.umsg("");
          code.setCurrentLine(4);
        } else if (right.value() === index) {
          // Deselect the right end of the range to partition
          arr.clearRightArrow(index);
          right.value(-1);

          // Guide the user by telling them they just deselected the right endpoint
          av.umsg("Select the right endpoint, then click on 'Partition'.");
          code.setCurrentLine(4);
        } else if (left.value() === index) {
          // Deselect the left end of the range to partition
          arr.clearLeftArrow(index);
          left.value(-1);

          // Guide the user by telling them they just deselected the left endpoint
          av.umsg("Select the left endpoint");
          code.setCurrentLine(4);
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

    /**
     * Convenience function that swaps the pivot from one position to another
     * and sets the appropriate user state variables
     */
    function swapPivot(pIndex, newPIndex) {
      // Move the selected pivot to the specified index
      userArr.swapWithStyle(pIndex, newPIndex);
      pivotIndex.value(newPIndex);
      pivotMoved.value(true);

      // Mark this as a step to be graded and a step that can be undone (continuous feedback)
      exercise.gradeableStep();
    }

    /**
     * Reset the variables used for each iteration of the algorithm
     */
    function resetStateVars() {
      pivotIndex.value(-1);
      pivotMoved.value(false);
      partitioned.value(false);
      left.value(-1);
      right.value(-1);
    }

    /**
     * Resets the model solution variables
     */
    function resetMSStateVars(msPivotIndex, msPivotMoved, msPartitioned, msLeft, msRight) {
      msPivotIndex.value(-1);
      msPivotMoved.value(false);
      msPartitioned.value(false);
      msLeft.value(-1);
      msRight.value(-1);
    }

    /**
     * Performs the partition operation on the user array
     * using the pivot value and range specified by the user
     */
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

      partition(userArr, left.value(), right.value() + 1, userArr.value(pivotIndex.value()));

      // Update state variables and clear left and right marker arrows
      partitioned.value(true);
      pivotMoved.value(false);
      userArr.clearLeftArrow(left.value());
      userArr.clearRightArrow(right.value());

      // Mark this as a step to be graded and a step that can be undone (continuous feedback)
      exercise.gradeableStep();

      av.umsg("Done partitioning. Now click on the position where the pivot should be moved to, and click 'Mark Selected as Sorted'.");
      code.setCurrentLine(5);
    }

    /**
     * Marks the currently selected element as sorted
     */
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

      av.umsg("Select the pivot and then click on where it should be moved to.");
      code.setCurrentLine(-1);
      code.setCurrentLine(1);
    }

    // Attach the button handlers
    $('#partition').click(partitionButton);
    $('#markSorted').click(markSortedButton);

    /*
     * Instantiate the exercise
     *    modelSolution - function name
     *        - Creates the model answer that is accessible on the page
     *        - Creates the model answer used to grade the student's answer
     *        - Returns a list containing the model array and all state
     *              variables used for grading and fixing the state if the user makes a mistake
     *    initialize - function name
     *        - Initializes and returns the array the user interacts with and the state variables we use to grade their answer
     *    [{css: "background-color"}, {}, {}, {}, {}, {}]
     *        - Defines how to grade each value returned from 'initialize' and 'modelSolution'
     *            - The values and the background-color css properties of both array will be compared
     *            - Each of the state variables will only be compared by value
     *    {fix: fixState}
     *        - Defines the name of the function to call to fix the state of the exercise if the user makes a mistake in 'fix' mode
     */
    var exercise = av.exercise(modelSolution, initialize,
                   [{css: "background-color"}, {}, {}, {}, {}, {}],
                   {controls: $('.jsavexercisecontrols'), fix: fixState });
    exercise.reset();
  });
}(jQuery));
