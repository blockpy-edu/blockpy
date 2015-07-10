"use strict";
/*global alert: true, ODSA, console */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Execute the "Run" button function
  function runIt() {
    var arrValues = ODSA.AV.processArrayValues();

    // If arrValues is null, the user gave us junk which they need to fix
    if (arrValues) {
      ODSA.AV.reset(true);
      av = new JSAV($(".avcontainer"), {settings: settings});

      // Initialize the original array
      var arr = av.ds.array(arrValues, {indexed: true, layout: arrayLayout.val()});
      av.umsg(interpret("av_c18"));
      av.displayInit();

      quicksort(arr, 0, arr.size() - 1);

      av.umsg(interpret("av_c1"));
      av.recorded(); // mark the end
    }
  }

  function quicksort(arr, left, right)
  {
    av.umsg(interpret("av_c2"));
    var pivotIndex = Math.floor((left + right) / 2);
    arr.addClass(pivotIndex, "processing");
    av.step();

    av.umsg(interpret("av_c3"));
    arr.swapWithStyle(pivotIndex, right);
    av.step();

    av.umsg(interpret("av_c4"));
    arr.setLeftArrow(left);
    arr.setRightArrow(right - 1);
    av.step();
    // finalPivotIndex will be the final position of the pivot
    var finalPivotIndex = partition(arr, left, right - 1, arr.value(right));

    av.umsg(interpret("av_c5"));
    av.step();

    av.umsg(interpret("av_c6"));
    arr.toggleArrow(finalPivotIndex);
    arr.swapWithStyle(right, finalPivotIndex);
    arr.removeClass(finalPivotIndex, "processing");
    arr.addClass(finalPivotIndex, "deemph");
    av.step();

    // Sort left partition
    var subArr1 = arr.slice(left, finalPivotIndex);
    if (subArr1.length === 1) {
      av.umsg(interpret("av_c7"));
      arr.toggleArrow(finalPivotIndex - 1);
      av.step();
      arr.toggleArrow(finalPivotIndex - 1);
      arr.addClass(left, "deemph");
    }
    else if (subArr1.length > 1) {
      av.umsg(interpret("av_c8"));
      av.step();
      quicksort(arr, left, finalPivotIndex - 1);
    }

    // Sort right partition
    var subArr2 = arr.slice(finalPivotIndex + 1, right + 1);
    if (subArr2.length === 1) {
      av.umsg(interpret("av_c9"));
      arr.toggleArrow(finalPivotIndex + 1);
      av.step();
      arr.toggleArrow(finalPivotIndex + 1);
      arr.addClass(finalPivotIndex + 1, "deemph");
    }
    else if (subArr2.length > 1) {
      av.umsg(interpret("av_c10"));
      av.step();
      quicksort(arr, finalPivotIndex + 1, right);
    }
  }

  function partition(arr, left, right, pivotVal) {
    var origLeft = left;

    while (left <= right) {
      // Move the left bound inwards
      av.umsg(interpret("av_c11"));
      av.step();
      while (arr.value(left) < pivotVal) {
        av.umsg(interpret("av_c12"));
        arr.clearLeftArrow(left);
        left++;
        arr.setLeftArrow(left);
        av.step();
      }

      arr.highlight(left);
      av.umsg(interpret("av_c13"));
      av.step();

      // Move the right bound inwards
      av.umsg(interpret("av_c14"));
      av.step();
      // If its desirable to have the right bound continue into sorted sections, replace origLeft with 0
      while ((right > origLeft) && (right >= left) && (arr.value(right) >= pivotVal)) {
        av.umsg(interpret("av_c15"));
        arr.clearRightArrow(right);
        right--;
        arr.setRightArrow(right);
        av.step();
      }

      if (right > left) {
        arr.highlight(right);
        av.umsg(interpret("av_c13"));
        av.step();
        // Swap highlighted elements
        av.umsg(interpret("av_c16"));
        arr.swap(left, right);
        av.step();
        arr.unhighlight([left, right]);
      }
      else {
        av.umsg(interpret("av_c17"));
        arr.unhighlight(left);
        av.step();
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

  // Connect action callbacks to the HTML entities
  $("#about").click(about);
  $("#run").click(runIt);
  $("#reset").click(ODSA.AV.reset);

  var av;   // for JSAV library object

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter;       // get the interpreter

  // Placeholder text translation needs to be set explicitly
  $("#arrayValues").attr("placeholder", interpret("av_arrValsPlaceholder"));

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));
  // add the layout setting preference
  var arrayLayout = settings.add("layout", {"type": "select",
    "options": {"bar": "Bar", "array": "Array"},
    "label": "Array layout: ", "value": "array"});

  // Initialize the arraysize dropdown list
  ODSA.AV.initArraySize(5, 12, 8);
});
