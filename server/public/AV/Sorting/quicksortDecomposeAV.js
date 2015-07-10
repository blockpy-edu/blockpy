"use strict";
/*global alert: true, ODSA, console */
(function ($) {
  var jsav;   // for JSAV library object

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));

  // Initialize the arraysize dropdown list
  ODSA.AV.initArraySize(5, 12, 8);

  // Process About button: Pop up a message with an Alert
  function about() {
    var mystring = "Quicksort Algorithm Visualization\nWritten by Daniel Breakiron\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during Summer, 2012\nLast update: July, 2012\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Execute the "Run" button function
  function runIt() {
    var arrValues = ODSA.AV.processArrayValues();

    // If arrValues is null, the user gave us junk which they need to fix
    if (arrValues) {
      ODSA.AV.reset(true);
      jsav = new JSAV($('.avcontainer'));

      // Initialize the original array
      var arr = jsav.ds.array(arrValues, {indexed: true});
      jsav.displayInit();
      // BEGIN QUICKSORT IMPLEMENTATION

      // Save the left edge of the original array so sublists can be positioned relative to it
//      leftEdge = parseFloat(arr.element.css("left"));
      leftEdge = 200; // Hack because arr.element.css is returning "auto" instead of position
      var level = 1;
      var leftOffset = 0;
      quicksort(arr, level, leftOffset);

      // END QUICKSORT IMPLEMENTATION

      jsav.umsg("Done sorting!");
      jsav.recorded(); // mark the end
    }
  }

  // The space required for each row to be displayed
  var leftEdge = 0;

  function quicksort(arr, level, leftOffset)
  {
    var left = 0;
    var right = arr.size() - 1;

    // Correctly position the array
    setPosition(arr, level, leftOffset);

    jsav.umsg("Select the pivot");
    var pivotIndex = Math.floor((left + right) / 2);
    arr.highlightBlue(pivotIndex);
    jsav.step();

    jsav.umsg("Move the pivot to the end");
    arr.swapWithStyle(pivotIndex, right);
    jsav.step();

    jsav.umsg("Partition the subarray");
    arr.setLeftArrow(left);
    arr.setRightArrow(right - 1);
    jsav.step();
    // finalPivotIndex will be the final position of the pivot
    var finalPivotIndex = partition(arr, left, right - 1, arr.value(right));

    jsav.umsg("When the right bound crosses the left bound, all elements to the left of the left bound are less than the pivot and all elements to the right are greater than or equal to the pivot");
    jsav.step();

    jsav.umsg("Move the pivot to its final location");
    arr.toggleArrow(finalPivotIndex);
    arr.swapWithStyle(right, finalPivotIndex);
    arr.markSorted(finalPivotIndex);
    jsav.step();

    // Create and display sub-arrays

    // Sort left partition
    var subArr1 = arr.slice(left, finalPivotIndex);
    if (subArr1.length === 1) {
      jsav.umsg("Left sublist contains a single element which means it is sorted");
      arr.toggleArrow(finalPivotIndex - 1);
      jsav.step();
      arr.toggleArrow(finalPivotIndex - 1);
      arr.markSorted(left);
    }
    else if (subArr1.length > 1) {
      var avSubArr1 = jsav.ds.array(subArr1, {indexed: true, center: false});
      jsav.umsg("Call quicksort on the left sublist");
      jsav.step();
      quicksort(avSubArr1, level + 1, leftOffset);
    }

    // Sort right partition
    var subArr2 = arr.slice(finalPivotIndex + 1, right + 1);
    if (subArr2.length === 1) {
      jsav.umsg("Right sublist contains a single element which means it is sorted");
      arr.toggleArrow(finalPivotIndex + 1);
      jsav.step();
      arr.toggleArrow(finalPivotIndex + 1);
      arr.markSorted(finalPivotIndex + 1);
    }
    else if (subArr2.length > 1) {
      var avSubArr2 = jsav.ds.array(subArr2, {indexed: true, center: false});
      jsav.umsg("Call quicksort on the right sublist");
      jsav.step();
      quicksort(avSubArr2, level + 1, leftOffset + finalPivotIndex + 1);
    }
  }

  function partition(arr, left, right, pivotVal) {
    var origLeft = left;

    while (left <= right) {
      // Move the left bound inwards
      jsav.umsg("Move the left bound to the right until it reaches a value greater than or equal to the pivot");
      jsav.step();
      while (arr.value(left) < pivotVal) {
        jsav.umsg("Step right");
        arr.clearLeftArrow(left);
        left++;
        arr.setLeftArrow(left);
        jsav.step();
      }

      arr.highlight(left);
      jsav.umsg("That is as far as we go this round");
      jsav.step();

      // Move the right bound inwards
      jsav.umsg("Move the right bound to the left until it crosses the left bound or finds a value less than the pivot");
      jsav.step();
      // If its desirable to have the right bound continue into sorted sections, replace origLeft with 0
      while ((right > origLeft) && (right >= left) && (arr.value(right) >= pivotVal)) {
        jsav.umsg("Step left");
        arr.clearRightArrow(right);
        right--;
        arr.setRightArrow(right);
        jsav.step();
      }

      if (right > left) {
        arr.highlight(right);
        jsav.umsg("That is as far as we go this round");
        jsav.step();
        // Swap highlighted elements
        jsav.umsg("Swap the selected values");
        arr.swap(left, right);
        jsav.step();
        arr.unhighlight([left, right]);
      }
      else {
        jsav.umsg("Bounds have crossed");
        arr.unhighlight(left);
        jsav.step();
        break;
      }
    }

    // Clear the arrows and mark the final position of the pivot
    arr.clearLeftArrow(left);
    arr.clearRightArrow(right);
    arr.toggleArrow(left);

    // Return first position in right partition
    return left;
  }

  /**
   * Calculates and sets the appropriate 'top' and 'left' CSS values based
   * on the specified array's level of recursion and number of blocks the array should be offset from the left
   *
   * arr - the JSAV array to set the 'top' and 'left' values for
   * level - the level of recursion, the full-size array is level 1
   * leftOffset - the number of blocks from the left the array should be positioned
   */
  function setPosition(arr, level, leftOffset) {
    console.log("In setPosition with level " + level + " and leftOffset " + leftOffset + ". Also, leftEdge is " + leftEdge);
    var blockWidth = 46;
    var rowHeight = 80;
    var left = leftEdge + leftOffset * blockWidth;
    var top = rowHeight * (level - 1);
    console.log("Position for array: " + left + ", " + top);
    // Set the top and left values so that all arrays are spaced properly
    arr.element.css({"left": left, "top": top});
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#run').click(runIt);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
