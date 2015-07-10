/* global ODSA, JSAV*/
(function ($) {
  "use strict";

  // AV variables
  var arraySize = 26,
      key,
      initialArray = [],
      array,
      keyholder,
      $findLabel,
      clickState,
      lowIndex,
      highIndex,
      lowPointer,
      highPointer,
      returnValue,
      interLine,
      pseudo,

      // get the configurations from the configuration file
      config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
      interpret = config.interpreter,
      code = config.code,
      settings = config.getSettings(),

      // create a JSAV instance
      av = new JSAV($("#jsavcontainer"), { autoresize: false, settings: settings });

  av.recorded(); // we are not recording an AV with an algorithm

  // show the code and highlight the row where mid is calculated
  if (code) {
    pseudo = av.code($.extend({after: {element: $(".instructions")}}, code));
    pseudo.show();
    pseudo.highlight("highlight");
    pseudo.addClass("return", "returnline");
    // toggle with double click
    pseudo.element.dblclick(function () {
      pseudo.element.toggleClass("collapsed");
    });
    pseudo.element.attr("title", "Double click to toggle code");
  }

  function initialize() {
    //generate random array with ascending values
    var min = 1 + Math.floor(Math.random() * 20),
        max = 120 + Math.floor(Math.random() * 20);
    key = (min + max) / 2;
    for (var i = 0; i < arraySize; i++) {
      initialArray[i] = min + Math.floor((max - min) / (1 + Math.exp((arraySize / 2 - i) * 0.5)));
    }

    // generate a random key, the value of which is between the min and max of the array
    if (JSAV.utils.rand.random() > 0.5) {
      key = Math.ceil(5 * (min + max) / 7);
    } else {
      key = Math.floor(2 * (min + max) / 7);
    }

    // clear old elements
    if ($findLabel) {
      $findLabel.remove();
    }
    [keyholder, array, clickState, lowIndex, highIndex, lowPointer, highPointer, returnValue]
      .forEach(function (item) { if (item) { item.clear(); } });

    // hide return box
    $("form.returnbox")[0].reset();
    $("#returndone").css("visibility", "hidden");

    // insert key into the array (the blue box)
    keyholder = av.ds.array([key], {indexed: false});
    keyholder.css(0, {
      "background-color": "#ddf",
      "border": "none"
    });
    $findLabel = $("<p>" + interpret("av_find_label") + "</p>").css({
      "text-align": "center",
      "font-weight": "bold",
      "margin-bottom": -15
    }).insertBefore(keyholder.element);

    // create the array
    array = av.ds.array(initialArray, {indexed: true, layout: "bar", autoresize: false});
    array.click(barClickHandler);
    array.layout();

    // clear all the Raphael elements
    av.getSvg().clear();

    // save the coordinate of the array
    var arrayX = array.element.offset().left - av.canvas.offset().left;
    var arrayY = array.element.offset().top - av.canvas.offset().top + 150;
    // draw a blue line to represent the value we are looking for
    var lineY = arrayY - 130 * key / array.value(arraySize - 1);
    var lineWidth = array.element.width();
    av.g.line(arrayX, lineY, arrayX + lineWidth, lineY, {stroke: "#00f", "stroke-width": 3, opacity: 0.2});
    // draw the interLine
    interLine = av.g.line(arrayX, lineY, arrayX + lineWidth, lineY, {stroke: "#f00", "stroke-width": 3, opacity: 0.2});
    drawLine(array, 0, arraySize - 1, interLine);

    // initialize state variable
    clickState = av.variable(-1);
    returnValue = av.variable(-1337);
    lowIndex = av.variable(0);
    highIndex = av.variable(arraySize - 1);

    var pointerOpts = {
      anchor: "center bottom",
      myAnchor: "center top",
      top: 10,
      left: -20,
      arrowAnchor: "center bottom"
    };
    lowPointer = av.pointer("low", array.index(0), pointerOpts);
    pointerOpts.left = 20;
    highPointer = av.pointer("high", array.index(arraySize - 1), pointerOpts);

    pointerClickHandler(lowPointer);
    pointerClickHandler(highPointer);

    // av.umsg(interpret("av_select_low"));
    printIntersection(av, lowIndex.value(), highIndex.value());
    av.forward();

    return [array, lowIndex, highIndex, returnValue];
  }

  function modelSolution(jsav) {
    jsav.ds.array([key], {indexed: false}).css(0, {
      "background-color": "#ddf",
      "border": "none"
    });
    var modelArray = jsav.ds.array(initialArray, {indexed: true, layout: "bar", autoresize: false});

    if (code) {
      jsav.code(code).highlight(code.tags.highlight);
    }

    var modelLow = jsav.variable(0),
        modelHigh = jsav.variable(arraySize - 1),
        modelReturn = jsav.variable(-1337),
        low = 0,
        high = arraySize - 1,
        mid;

    var pointerOpts = {
      anchor: "center bottom",
      myAnchor: "center top",
      top: 10,
      left: -20,
      arrowAnchor: "center bottom"
    };
    var lowPointer = jsav.pointer("low", modelArray.index(0), pointerOpts);
    pointerOpts.left = 20;
    var highPointer = jsav.pointer("high", modelArray.index(arraySize - 1), pointerOpts);

    // draw the blue line
    var arrayX = modelArray.element.offset().left - jsav.canvas.offset().left,
        arrayY = modelArray.element.offset().top - jsav.canvas.offset().top + 150,
        lineY = arrayY - 130 * key / initialArray[arraySize - 1],
        lineWidth = modelArray.element.width();
    jsav.g.line(arrayX, lineY, arrayX + lineWidth, lineY, {
      stroke: "#00f",
      "stroke-width": 3,
      opacity: 0.2
    });

    // create the interLine
    var interLine = jsav.g.line(arrayX, lineY, arrayX + lineWidth, lineY, {
      stroke: "#f00",
      "stroke-width": 3,
      opacity: 0.2
    });
    drawLine(modelArray, 0, arraySize - 1, interLine);


    jsav._undo = [];

    while (initialArray[low] < key && initialArray[high] >= key) {
      // highlight guesstimate
      mid = intersectionX(low, high);
      mid = Math.floor(mid * 100) / 100;
      jsav.umsg(interpret("av_ms_intersect"), {fill: {
        inter: mid,
        key: key,
        newmid: Math.floor(mid)
      }});
      refLines(jsav, code, "guess_calculations");
      jsav.step();
      mid = Math.floor(mid);
      // modelArray.highlight(mid);
      if (initialArray[mid] < key) {
        low = mid + 1;
        lowPointer.target(modelArray.index(low));
        jsav.umsg(interpret("av_ms_arr_mid_lt_key"), {fill: {
          arr_at_mid: initialArray[mid],
          key: key,
          mid_plus_1: mid + 1
        }});
        refLines(jsav, code, "tbl_mid_lt_key");
      } else if (initialArray[mid] > key) {
        high = mid - 1;
        highPointer.target(modelArray.index(high));
        jsav.umsg(interpret("av_ms_arr_mid_gt_key"), {fill: {
          arr_at_mid: initialArray[mid],
          key: key,
          mid_minus_1: mid - 1
        }});
        refLines(jsav, code, "tbl_mid_gt_key");
      } else {
        jsav.umsg("<br/>" + interpret("av_ms_found"), {preserve: true, fill: {mid: mid}});
      }
      // update low and high variables
      modelLow.value(low);
      modelHigh.value(high);
      // draw Line
      drawLine(modelArray, low, high, interLine);
      if (modelArray.value(mid) === key) {
        modelReturn.value(mid);
        jsav.gradeableStep();
        return [modelArray, modelLow, modelHigh, modelReturn];
      }
      // grade step
      jsav.gradeableStep();
    }
    if (initialArray[low] >= key) {
      jsav.umsg(interpret("av_ms_loop_stopped_1"), {fill: { low: low }});
      if (initialArray[low] === key) {
        jsav.umsg("<br/>" + interpret("av_ms_found"), {preserve: true, fill: { mid: low }});
        modelReturn.value(low);
      } else {
        jsav.umsg("<br/>" + interpret("av_ms_not_found"), {preserve: true});
        modelReturn.value(-1);
      }
    } else {
      jsav.umsg(interpret("av_ms_loop_stopped_2"), {fill: { high: high }});
      jsav.umsg("<br/>" + interpret("av_ms_not_found"), {preserve: true});
      modelReturn.value(-1);
    }
    jsav.gradeableStep();
    return [modelArray, modelLow, modelHigh, modelReturn];
  }

  // updates and shows the interpolation line
  function drawLine(array, low, high, line) {
    var arrayX = array.element.offset().left - array.element.parent().offset().left,
        arrayY = array.element.offset().top - array.element.parent().offset().top + 150,
        barWidth = array.element.find(".jsavnode:eq(0)").outerWidth(true),
        dy = - (array.value(high) - array.value(low)) * 130 / array.value(arraySize - 1),
        dx = (high - low) * barWidth,
        k = (dx ? dy / dx : 0),
        x0 = arrayX + 2 + barWidth * low,
        y0 = arrayY - 130 * array.value(low) / array.value(arraySize - 1),
        b = y0 - k * x0,
        x1 = arrayX + 2,
        y1 = k * x1 + b,
        x2 = arrayX + 2 + barWidth * arraySize,
        y2 = k * x2 + b;

    line.movePoints([[0, x1, y1], [1, x2, y2]]);
  }

  function intersectionX(low, high) {
    var result = low + ((key - initialArray[low]) * (high - low) / (initialArray[high] - initialArray[low]));
    return Math.floor(result * 100) / 100;
  }

  function printIntersection(av, low, high) {
    var x = intersectionX(low, high);
    if (isFinite(x)) {
      av.umsg(interpret("av_lines_intersect") + " (" + x + ", " + key + ")");
    } else {
      av.umsg(interpret("av_lines_dont_intersect"));
    }
  }

  function refLines(av, code, lineTag) {
    if (!code) {
      return;
    }
    var lines = code.tags[lineTag];
    if (typeof lines === "number") {
      av.umsg(" " + interpret("av_line"), {preserve: true, fill: {first: lines}});
    } else if (typeof lines === "object") {
      av.umsg(" " + interpret("av_lines"), {preserve: true, fill: {first: lines[0], second: lines[1]}});
    }
  }

  var showHidden = JSAV.utils.getUndoableFunction(
    av,
    function (element) { element.css("visibility", "visible"); },
    function (element) { element.css("visibility", "hidden"); }
  );

  var pointerClickHandler = function (pointer) {
    var pointers = [lowPointer, highPointer],
        pointerIndex = pointers.indexOf(pointer);
    // click handler
    function handler() {
      switch (clickState.value()) {
      case -1:
        // nothing selected -> select pointer
        clickState.value(pointerIndex);
        pointer.addClass("selected");
        break;
      case pointerIndex:
        // this pointer was selected -> deselect
        clickState.value(-1);
        pointer.removeClass("selected");
        break;
      default:
        // another pointer was selected -> deselect and select this one
        pointers.forEach(function (p) { p.removeClass("selected"); });
        clickState.value(pointerIndex);
        pointer.addClass("selected");
        break;
      }
    }
    // assign click handler to pointer area and pointer arrow
    pointer.element.click(handler);
    pointer.arrow.click(handler);
  };

  function barClickHandler(index) {
    var pointers = [lowPointer, highPointer];
    if (clickState.value() === -1) { return; }
    // update pointer target
    pointers[clickState.value()].target(array.index(index));
    // update low/high index
    [lowIndex, highIndex][clickState.value()].value(index);
    // update line
    drawLine(array, lowIndex.value(), highIndex.value(), interLine);
    // update intersection message
    printIntersection(av, lowIndex.value(), highIndex.value());
    // unselect pointer
    pointers[clickState.value()].removeClass("selected");
    clickState.value(-1);
    // mark step
    exercise.gradeableStep();
  }

  $("form.returnbox").submit(function () {
    returnValue.value(parseInt($("#returninput").val(), 10));
    showHidden($("#returndone"));
    exercise.gradeableStep();
    return false;
  });

  var exercise = av.exercise(modelSolution, initialize, {
    // compare: [{class: "jsavhighlight"}],
    feedback: "atend",
    modelDialog: {width: 760}
  });
  exercise.reset();

}(jQuery));
