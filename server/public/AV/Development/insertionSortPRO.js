/* global ClickHandler */
(function ($) {
  "use strict";
  var arraySize = 10,
    initialArray,
    barArray,
    clickHandler,
    av = new JSAV($("#jsavcontainer")),
    code = av.code(
      "public static void insertionSort(int[] table) {\n" +
      "   for (int i = 1; i < table.length; i++) {\n" +
      "       int j = i;\n" +
      "       while (j > 0 && table[j - 1] > table[j]) {\n" +
      "           swap(table, j - 1, j);\n" +
      "           j--;\n" +
      "       }\n" +
      "   }\n" +
      "}");

  av.recorded(); // we are not recording an AV with an algorithm

  function initialize() {

    // initialize click handler
    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {
        selectedClass: "selected",
        effect: "swap"
      });
    }
    clickHandler.reset();

    // initialize the array
    initialArray = [];
    for (var i = 0; i < arraySize; i++) {
      initialArray[i] = Math.floor(Math.random() * 100) + 10;
    }
    if (barArray) {
      clickHandler.remove(barArray);
      barArray.clear();
    }
    barArray = av.ds.array(initialArray, {indexed: true, layout: "bar"});
    barArray.layout();
    clickHandler.addArray(barArray);

    // show the code and highlight the necessary row
    code.show();
    code.highlight(5);

    return barArray;
  }

  function modelSolution(jsav) {
    var modelArray = jsav.ds.array(initialArray, {indexed: true, layout: "bar"});
    
    jsav._undo = [];

    for (var i = 1; i < arraySize; i++) {
      var j = i;
      while (j > 0 && modelArray.value(j - 1) > modelArray.value(j)) {
        jsav.umsg('Shift "' + modelArray.value(j) + '" to the left.<br/>&nbsp;&nbsp;i: ' + i + '<br/>&nbsp;&nbsp;j: ' + j);
        modelArray.swap(j, j - 1);
        jsav.stepOption("grade", true);
        jsav.step();
        j--;
      }
    }

    return modelArray;
  }


  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend"});
  exercise.reset();

  // bind a function to handle all click events on the array
  // barArray.click(function(index) {
    
  //   // the first click will select an index and save it
  //   if (swapIndex.value() === -1) {
  //     swapIndex.value(index);
  //     this.addClass(index, "selected");
  //   } else if (swapIndex.value() === index) {
  //     this.removeClass(swapIndex.value(), "selected");
  //     swapIndex.value(-1);
  //   } else { // swap
  //     this.removeClass(swapIndex.value(), "selected");
  //     this.swap(index, swapIndex.value());
  //     swapIndex.value(-1);
  //     exercise.gradeableStep();
  //   }
  // });

}(jQuery));