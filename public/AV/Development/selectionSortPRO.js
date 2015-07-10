/* global ODSA, JSAV */
(function ($) {
  "use strict";
  var arraySize = 10,
      initialArray,
      barArray,
      sorted,
      pseudo,

      // get the configurations from the configuration file
      config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
      interpret = config.interpreter,
      code = config.code,

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  if (code) {
    pseudo = av.code(code, {after: {element: $(".instructions")}});
    pseudo.show();
  }

  function initialize() {

    // initialize sorted variable to keep track of how many bars have been sorted
    if (sorted) {
      sorted.clear();
    }
    sorted = av.variable(0);

    // generate random values for the array
    initialArray = [];
    for (var i = 0; i < arraySize; i++) {
      initialArray[i] = Math.floor(Math.random() * 100) + 10;
    }
    // initialize the array
    if (barArray) {
      barArray.clear();
    }
    barArray = av.ds.array(initialArray, {indexed: true, layout: "bar"});
    barArray.highlight(0);
    barArray.click(clickHandler);

    // highlight
    pseudo.highlight(6);
    
    return barArray;
  }

  function modelSolution(jsav) {
    var modelArray = jsav.ds.array(initialArray, {indexed: true, layout: "bar"});

    jsav._undo = [];

    // highlight the first bar
    modelArray.highlight(0);
    jsav.step();

    for (var i = 0; i < arraySize - 1; i++) {
      // find the smallest value on the right side of the highlighted bar
      var j = i + 1;
      var min = i;
      while (j < arraySize) {
        if (modelArray.value(j) < modelArray.value(min)) {
          min = j;
        }
        j++;
      }
      // unhighlight the bar
      modelArray.unhighlight(i);
      if (min !== i) {
        // swap the smallest value with the bar which was highlighted
        modelArray.swap(min, i);
      }
      // paint the sorted bar green
      modelArray.addClass(i, "greenbg");
      // highlight the next bar unless we are done
      if (i + 1 !== arraySize - 1) {
        modelArray.highlight(i + 1);
      } else {
        modelArray.addClass(arraySize - 1, "greenbg");
      }
      jsav.stepOption("grade", true);
      jsav.step();
    }

    return modelArray;
  }

  // a function to handle all click events on the array
  var clickHandler = function (index) {
    
    if (sorted.value() === index) {
      // clicking on the highlighted bar will turn it green and highlight the next bar
      this.unhighlight(index);
      this.addClass(index, "greenbg");
      sorted.value(sorted.value() + 1);
      if (sorted.value() !== arraySize - 1) {
        this.highlight(index + 1);
      } else {
        this.addClass(index + 1, "greenbg");
      }
      exercise.gradeableStep();
    } else if (index > sorted.value()) {
      // clicking on a bar to the right of the highlighted bar will swap these two bars
      this.unhighlight(sorted.value());
      this.swap(sorted.value(), index);
      this.addClass(sorted.value(), "greenbg");
      sorted.value(sorted.value() + 1);
      if (sorted.value() !== arraySize - 1) {
        this.highlight(sorted.value());
      } else {
        this.addClass(arraySize - 1, "greenbg");
      }
      exercise.gradeableStep();
    } else {
      // swap a green bar with the higlighted bar, just because you can
      this.unhighlight(sorted.value());
      this.addClass(sorted.value(), "greenbg");
      this.swap(index, sorted.value());
      sorted.value(sorted.value() + 1);
      this.highlight(sorted.value());
      exercise.gradeableStep();
    }
    
  };

  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend"});
  exercise.reset();

}(jQuery));