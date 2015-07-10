/*global ODSA, PARAMS, ClickHandler */
(function ($) {
  "use strict";
  var arraySize = PARAMS.size ? parseInt(PARAMS.size, 10): 10,
    pivotSelectionMethod = PARAMS.pivot || "middle",     // use the last element in the bound as the pivot
    noPivotSize = PARAMS.nopivotsize ? parseInt(PARAMS.nopivotsize, 10): 1,
    swapOptions = {arrow: false, highlight: false, swapClasses: true},
    initialArray,
    array,
    stack,
    mode,
    pivotInBound,
    pseudo,
    clickHandler,
    config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
    interpret = config.interpreter,
    code = config.code,
    av = new JSAV($("#jsavcontainer"));

  var pivotFunction = {
    last: function (left, right) { return right; },
    middle: function (left, right) { return Math.floor((right + left) / 2); },
    medianof3: function (left, right, arr) {
      var mid = this.middle(left, right);
      var median = [arr.value(left), arr.value(mid), arr.value(right)].sort(function (a, b) { return a - b; })[1];
      if (arr.value(right) === median) {
        return right;
      } else if (arr.value(mid) === median) {
        return mid;
      }
      return left;
    }
  };

  av.recorded(); // we are not recording an AV with an algorithm

  function initialize() {

    exercise.jsav.container.find(".jsavcanvas").css({height: 350});

    if (!pseudo && code) {
      pseudo = av.code($.extend({after: {element: $(".instructions")}, visible: true}, code));
      pseudo.hide("comments_and_findpivot");
    }

    //set up click handler
    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {effect: "swap", selectedClass: "selected", inactiveClass: "inactive"});
    }
    clickHandler.reset();

    //generate random infix and insert in the array
    initialArray = JSAV.utils.rand.numKeys(10, 125, arraySize);

    // initialize array
    if (array) {
      clickHandler.remove(array);
      array.clear();
    }
    array = av.ds.array(initialArray, {indexed: true, layout: "bar"});
    array.element.css({top: 40});
    array.layout();
    clickHandler.addArray(array, {
      onSelect: function (index) {
        switch (mode.value()) {
        case 0:
          //return true to tell clickHandler to select the item
          return true;
        case 1:
          extendStackValue("Left", index);
          array.toggleArrow(index);
          av.umsg(interpret("right_endpoint"));
          mode.value(2);
          av.step();
          break;
        case 2:
          extendStackValue("Right", index);
          av.umsg("");
          var left = getCurrentValue("Left", stack);
          var right = index;
          array.toggleArrow(left);
          focusOn(array, left, right);
          if (right - left >= noPivotSize) {
            highlightAndSwapPivot(array, left, right);
            pivotInBound.value(1);
          } else {
            pivotInBound.value(0);
          }
          mode.value(0);
          exercise.gradeableStep();
          break;
        }
        //disable selecting
        return false;
      },
      onDrop: function (index) {
        // don't grade steps when there is no pivot
        // in other words let the user sort the highlighted area in any way
        if (!pivotInBound.value()) {
          return false;
        }
      }
    });


    //stack
    if (stack) {
      clickHandler.remove(stack);
      stack.clear();
    }
    stack = av.ds.stack({xtransition: 5, ytransition: 25, center: false});
    // stack = av.ds.list({nodegap: 15, layout: "vertical", center: false, autoresize: false});
    stack.element.css({width: 180, position: "absolute"});
    stack.element.css({top: 250, left: av.canvas.width() / 2 - 90});
    stack.addFirst("Left: 0, Right: " + (arraySize - 1));
    stack.layout();

    // mode variable
    // 0 when swapping
    // 1 when selecting left endpoint
    // 2 when selecting right endpoint
    if (mode) {
      mode.clear();
    }
    mode = av.variable(0);

    // pivot in bound variable
    // 0 no pivot in the selected bound
    // 1 pivot in selected bound
    if (pivotInBound) {
      pivotInBound.clear();
    }
    pivotInBound = av.variable(1);

    // clear all the Raphael elements
    av.getSvg().clear();

    // add text
    var font = {
      "font-size": 16,
      "font-family": "Times New Roman",
      "font-weight": "bold"
    };
    var canvasWidth = exercise.jsav.container.find(".jsavcanvas").width();
    av.getSvg().text(canvasWidth / 2, 20, interpret("table_to_be_sorted")).attr(font);
    av.getSvg().text(canvasWidth / 2, 230, interpret("call_stack")).attr(font);

    //hide old umsg messages
    av.umsg("");

    focusOn(array, 0, arraySize - 1);

    return array;
  }

  function modelSolution(jsav) {
    //array
    var modelArray = jsav.ds.array(initialArray, {indexed: true, layout: "bar"});

    // var modelStack = jsav.ds.list({nodegap: 15, layout: "vertical", center: false, autoresize: false});
    var modelStack = jsav.ds.stack({xtransition: 5, ytransition: 25, center: false});
    modelStack.element.css({width: 180, position: "absolute"});
    modelStack.element.css({top: 200, left: jsav.canvas.width() / 2 - 90});

    jsav.canvas.css({height: 350});

    jsav._undo = [];

    function modelRadix(left, right) {
      var partitionHasPivot = false;

      modelStack.addFirst("Left: " + left + ", Right: " + right);
      modelStack.layout();

      focusOn(modelArray, left, right);
      if (right - left >= noPivotSize) {
        if (highlightAndSwapPivot(modelArray, left, right) !== right) {
          jsav.umsg(interpret("ms_put_pivot_to_the_right"), {preserve: true});
        }
        partitionHasPivot = true;
      }

      // add a step if not first call
      if (left !== 0 || right !== arraySize - 1) {
        jsav.stepOption("grade", true);
        jsav.step();
      } else {
        jsav.displayInit();
      }

      if (partitionHasPivot) {
        var i = left;
        var j = right - 1;

        do {
          while (modelArray.value(i) < modelArray.value(right)) {
            i++;
          }
          while (j >= left && modelArray.value(j) >= modelArray.value(right)) {
            j--;
          }
          if (i < j) {
            modelArray.swap(i, j, swapOptions);
            jsav.umsg(interpret("ms_partition"));
            jsav.stepOption("grade", true);
            jsav.step();
          }
        } while (i < j);

        // swap i and right
        if (i !== right) {
          modelArray.swap(i, right, swapOptions);
          jsav.umsg(interpret("ms_put_pivot_into_correct_position"));
          jsav.stepOption("grade", true);
          jsav.step();
        }

        // call function recursivley for both sides
        if (i - left > 1) {
          jsav.umsg(interpret("ms_call_left"));
          modelRadix(left, i - 1);
        }
        if (right - i > 1) {
          jsav.umsg(interpret("ms_call_right"));
          modelRadix(i + 1, right);
        }
      } else {
        // sort it in one step
        jsav.umsg(interpret("ms_no_pivot"), {fill: {size: noPivotSize}});
        for (var k = left; k < right; k++) {
          var min = k;
          for (var l = k + 1; l <= right; l++) {
            if (modelArray.value(l) < modelArray.value(min)) {
              min = l;
            }
          }
          if (min !== k) {
            modelArray.swap(k, min, swapOptions);
          }
        }
        jsav.step();
      }

      // return
      returnClick(modelArray, modelStack);
      jsav.umsg(interpret("ms_return"), {fill: {left: left, right: right}});
      jsav.stepOption("grade", true);
      jsav.step();
    }

    modelRadix(0, arraySize - 1);

    return modelArray;
  }

  // create excercise
  var exercise = av.exercise(modelSolution, initialize,
                             { compare:  {css: "background-color"},
                               feedback: "atend",
                               modelDialog: {width: 750}});
  // edit reset function so that it calls highlightAndSwapPivot when done
  var origreset = exercise.reset;
  exercise.reset = function () {
    origreset.apply(this);
    highlightAndSwapPivot(array, 0, arraySize - 1);
    av.displayInit();
  };
  exercise.reset();


  var $callButton = $("#callButton");
  var $returnButton = $("#returnButton");

  // add buttons if they don't exist
  if ($callButton.length === 0) {
    $callButton = $("<button id='callButton'>" + interpret("call") + "</button>");
    $("#jsavcontainer .jsavcanvas").append($callButton);
  }
  if ($returnButton.length === 0) {
    $returnButton = $("<button id='returnButton'>" + interpret("return") + "</button>");
    $("#jsavcontainer .jsavcanvas").append($returnButton);
  }

  //position buttons
  $callButton.css({position: "absolute", left: 50, top: 250, width: 100});
  $returnButton.css({position: "absolute", left: 50, top: 280, width: 100});
  //add click handlers
  $callButton.click(function () {
    mode.value(1);
    clickHandler.deselect();
    stack.addFirst("");
    stack.layout();
    av.umsg(interpret("left_endpoint"));
    av.step();
  });
  $returnButton.click(function () {
    returnClick(array, stack);
    if (getCurrentValue("Right", stack) - getCurrentValue("Left", stack) >= noPivotSize) {
      pivotInBound.value(1);
    } else {
      pivotInBound.value(0);
    }
    exercise.gradeableStep();
  });



  //returns the value of Left or Right of the topmost item of the stack
  function getCurrentValue(name, stack) {
    var result;
    var value;
    if (stack.first()) {
      value = stack.first().value();
    } else {
      value = "Left: " + 0 + ", Right: " + (arraySize - 1);
    }
    var parts = value.split(", ");
    parts.forEach(function (val) {
      var newparts = val.split(": ");
      if (newparts[0] === name) {
        result = newparts[1];
      }
    });
    return parseInt(result, 10);
  }

  //extends the value of the topmost element on the stack
  function extendStackValue(name, value) {
    var oldvalue = stack.first().value();
    if (!oldvalue) {
      oldvalue = name + ": " + value;
    } else {
      oldvalue += ", " + name + ": " + value;
    }
    stack.first().value(oldvalue);
  }

  function highlightAndSwapPivot(arr, first, last) {
    var index = pivotFunction[pivotSelectionMethod](first, last, arr);

    if (index !== last) {
      arr.swap(index, last, swapOptions);
    }

    arr.addClass(last, "pivot");

    return index;
  }

  // fades out all the squares outside of [first, last]
  function focusOn(arr, first, last) {
    arr.removeClass(function (index) {
      return index >= first && index <= last;
    },
    "inactive");
    arr.addClass(function (index) {
      return index < first || index > last;
    },
    "inactive");
  }

  //pops the stack and focuses on the previous range
  function returnClick(array, stack) {
    if (stack.size()) {
      // remove pivots from the range
      array.removeClass(function (index) {
        return index >= getCurrentValue("Left", stack) && index <= getCurrentValue("Right", stack);
      }, "pivot");

      // add green background
      array.addClass(function (index) {
        return index >= getCurrentValue("Left", stack) && index <= getCurrentValue("Right", stack);
      }, "greenbg");

      stack.removeFirst();
      stack.layout();
    }
    if (stack.size()) {
      focusOn(array,
        getCurrentValue("Left", stack),
        getCurrentValue("Right", stack));
    } else {
      focusOn(array, 0, arraySize - 1);
    }
  }

}(jQuery));
