/*global ODSA, ClickHandler*/
(function ($) {
  "use strict";
  // AV variables
  var arraySize = 15, // size needs to be odd
      initialArray = [],
      jsavArray,
      evaluatorArrays = [],
      stack,
      clickHandler,

      // configurations
      config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true, lineNumbers: false},

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  av.code(code, codeOptions);

  function initialize() {
    av.container.find(".jsavcanvas").height(600);

    // create ClickHandler
    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {selectedClass: "selected"});
    }
    clickHandler.reset();

    // generate random postfix expression and put it in the array
    var numbersInArray = 0,
        randomVal,
        i;
    for (i = 0; i < arraySize; i++) {
      // determine if the next character should be an operand or an operator.
      if (numbersInArray < i - numbersInArray + 2 || JSAV.utils.rand.random() < (Math.ceil(arraySize / 2) - numbersInArray) / (arraySize - i))
      {
        randomVal = JSAV.utils.rand.numKey(1, 10);
        numbersInArray++;
      } else {
        randomVal = JSAV.utils.rand.random() < 0.5 ? "+" : "*";
      }
      initialArray[i] = randomVal;
    }

    // create array
    if (jsavArray) {
      clickHandler.remove(jsavArray);
      jsavArray.clear();
    }
    jsavArray = av.ds.array(initialArray, {indexed: true});
    jsavArray.element.css("top", 50);
    jsavArray.layout();
    clickHandler.addArray(jsavArray);

    // create stack
    if (stack) {
      clickHandler.remove(stack);
      stack.clear();
    }
    stack = av.ds.list({nodegap: 15, layout: "vertical", center: true});
    stack.addFirst("");
    stack.first().addClass("greybg");
    stack.css("top", 150);
    clickHandler.addList(stack, {select: "first", drop: "first", keep: true});
    stack.layout();

    // clear all the Raphael elements
    av.getSvg().clear();

    // add text
    var font = {
      "font-size": 16,
      "font-family": "Times New Roman",
      "font-weight": "bold"
    };
    var canvasWidth = exercise.jsav.container.find(".jsavcanvas").width();
    av.getSvg().text(canvasWidth / 2, 20, interpret("av_postfix_expression")).attr(font);
    av.getSvg().text(canvasWidth / 2, 200, interpret("av_operand_stack")).attr(font);

    // draw the Evaluator
    var rect_x = 50;
    var rect_y = 220;
    av.g.rect(rect_x, rect_y, 200, 120, {r: 20});
    av.getSvg().text(rect_x + 100, rect_y + 15, interpret("av_evaluator"));

    for (i = 0; i < 3; i++) {
      if (evaluatorArrays[i]) {
        clickHandler.remove(evaluatorArrays[i]);
        evaluatorArrays[i].clear();
      }
      evaluatorArrays[i] = av.ds.array([""], {indexed: false, center: false});
      evaluatorArrays[i].element.css({"top": rect_y + 30, "left": rect_x + 15 + 60 * i, "position": "absolute"});
      if (i === 0 || i === 2) {
        evaluatorArrays[i].element.children().css({
          "border": "none",
          "box-shadow": "none",
          "cursor": "default"
        });
      }
      evaluatorArrays[i].layout();
    }
    clickHandler.addArray(
      evaluatorArrays[1],
      {onDrop: function () {
        // grade using the clickHandler only if the evaluator won't run
        // if the evaluator does run, it will mark the steps as gradeable
        // clickHandler won't grade if the returned value is false
        var result = "+*".indexOf(this.value(0)) === -1 || stack.size() <= 2;
        runEvaluator(evaluatorArrays, stack, av);
        return result;
      }}
      );

    return [jsavArray, evaluatorArrays[1]];
  }

  function modelSolution(jsav) {
    // make the canvas bigger
    jsav.container.find(".jsavcanvas").css({height: 250});
    // array
    var modelArray = jsav.ds.array(initialArray);
    // stack
    var modelStack = jsav.ds.list({nodegap: 15, layout: "vertical", center: true});
    modelStack.addFirst("");
    modelStack.first().addClass("greybg");
    modelStack.layout();
    // evaluator
    var rect_x = 50;
    var rect_y = 100;
    jsav.g.rect(rect_x, rect_y, 200, 120, {r: 20});
    jsav.svg.text(rect_x + 100, rect_y + 15, interpret("av_evaluator"));
    var modelEvalAr = [];
    var i;

    for (i = 0; i < 3; i++) {
      modelEvalAr[i] = jsav.ds.array([""], {indexed: false, center: false});
      modelEvalAr[i].element.css({"top": rect_y + 30, "left": rect_x + 15 + 60 * i, "position": "absolute"});
      if (i === 0 || i === 2) {
        modelEvalAr[i].element.children().css({
          "border": "none",
          "box-shadow": "none"
        });
      }
      modelEvalAr[i].layout();
    }

    jsav._undo = [];

    // model solution
    for (i = 0; i < arraySize; i++) {
      if ("+*".indexOf(modelArray.value(i)) === -1) {
        // move the operand into the stack
        modelStack.addFirst();
        jsav.effects.moveValue(modelArray, i, modelStack.first());
        modelStack.layout();
        jsav.umsg(interpret("av_ms_com_operand"));
        jsav.stepOption("grade", true);
        jsav.step();
      } else {
        // move the operator to the evaluator
        jsav.effects.moveValue(modelArray, i, modelEvalAr[1], 0);
        jsav.umsg(interpret("av_ms_com_operator"));
        jsav.step();
        // "run the evaluator"
        // move the first value
        jsav.effects.moveValue(modelStack.first(), modelEvalAr[0], 0);
        modelStack.removeFirst();
        modelStack.layout();
        // move the second value
        jsav.effects.moveValue(modelStack.first(), modelEvalAr[2], 0);
        modelStack.removeFirst();
        modelStack.layout();
        jsav.umsg(interpret("av_ms_com_pop"));
        jsav.step();
        // animate operator
        //  if ($.fx.off === false) {
        //      animateOperator(modelEvalAr[1], jsav);
        //  }
        // caluculate result
        var result;
        if (modelEvalAr[1].value(0) === "+") {
          result = parseInt(modelEvalAr[0].value(0), 10) + parseInt(modelEvalAr[2].value(0), 10);
        } else {
          result = parseInt(modelEvalAr[0].value(0), 10) * parseInt(modelEvalAr[2].value(0), 10);
        }
        // clear the evaluator and show the result
        modelEvalAr[0].value(0, "");
        modelEvalAr[1].value(0, result);
        modelEvalAr[2].value(0, "");
        jsav.umsg(interpret("av_ms_com_eval"));
        jsav.stepOption("grade", true);
        jsav.step();
        // move the value back into the stack
        modelStack.addFirst();
        jsav.effects.moveValue(modelEvalAr[1], 0, modelStack.first());
        modelStack.layout();
        jsav.umsg(interpret("av_ms_com_push"), {preserve: true});
        jsav.stepOption("grade", true);
        jsav.step();
      }
    }

    return [modelArray, modelEvalAr[1]];
  }

  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend", modelDialog: {width: 780}});
  exercise.reset();

  function runEvaluator(arr, stack, jsav) {
    var result;
    if (arr[1].value(0) === "+" || arr[1].value(0) === "*") {
      //  pop two values from the stack if it is big enough
      if (stack.size() > 2) {
        jsav.effects.moveValue(stack.first(), arr[0], 0);
        drawPopArrow(stack, arr[0], jsav);
        stack.removeFirst();
        stack.layout();
        setTimeout(function () {
          jsav.effects.moveValue(stack.first(), arr[2], 0);
          drawPopArrow(stack, arr[2], jsav);
          stack.removeFirst();
          stack.layout();
        }, 700);
      } else {
        return;
      }
    } else {
      return;
    }

    // wait until the values have been popped, then calculate the result
    setTimeout(function () {
      if (arr[1].value(0) === "+") {
        result = parseInt(arr[0].value(0), 10) + parseInt(arr[2].value(0), 10);
      } else if (arr[1].value(0) === "*") {
        result = parseInt(arr[0].value(0), 10) * parseInt(arr[2].value(0), 10);
      }

      // start operator animation
      animateOperator(arr[1], av);

      // empty the calculator
      arr[0].value(0, "");
      arr[1].value(0, result);
      arr[2].value(0, "");

      if (jsav === av) {
        exercise.gradeableStep();
      } else {
        jsav.stepOption("grade", true);
        jsav.step();
      }

    }, 1400);

  }


  function drawPopArrow(st, arr, jsav) {
    // draw arrow from the calculator to the stack
    var $val1 = st.first().element,
      $val2 = arr.element,
      off1 = $val1.offset(),
      off2 = $val2.offset(),
      coff = jsav.canvas.offset(),
      x1 = off1.left - coff.left,
      x2 = off2.left - coff.left + $val2.outerWidth() / 2,
      y1 = off1.top - coff.top + $val1.outerHeight() / 2,
      y2 = off2.top - coff.top,
      curve = 20,
      cx1 = x1 - curve,
      cx2 = x2,
      cy1 = y1,
      cy2 = y2 - curve,
      arrowStyle = "classic-wide-long";

    // var arr = av.getSvg().path("M" + x1 + "," + y1 + "C" + cx1 + "," + cy1 + " " + cx2 + "," + cy2 + " " + x2 + "," + y2).attr({"arrow-end": arrowStyle, "stroke-width": 10, "stroke":"pink"});
    arr = drawpath(
      jsav.svg,
      "M" + x1 + "," + y1 + " C" + cx1 + "," + cy1 + " " + cx2 + "," + cy2 + " " + x2 + "," + y2,
      500,
      {"arrow-end": arrowStyle, "stroke-width": 10, "stroke": "pink"},
      function () { arr.remove(); }
    );

    // remove the arrow
    setTimeout(function () { arr.remove(); }, 700);
  }


  function drawpath(canvas, pathstr, duration, attr, callback) {
    var guide_path = canvas.path(pathstr).attr({ stroke: "none", fill: "none" });
    var path = canvas.path(guide_path.getSubpath(0, 30)).attr(attr);
    var total_length = guide_path.getTotalLength(guide_path);
    var last_point = guide_path.getPointAtLength(0);
    var start_time = new Date().getTime();
    var interval_length = 10;
    var result = path;

    var interval_id = setInterval(function ()
    {
      var elapsed_time = new Date().getTime() - start_time;
      var this_length = Math.max(30, elapsed_time / duration * total_length);
      var subpathstr = guide_path.getSubpath(0, this_length);
      attr.path = subpathstr;
      path.animate(attr, interval_length - 1);
      if (elapsed_time >= duration) {
        clearInterval(interval_id);
        if (typeof callback !== "undefined") {
          callback();
        }
        guide_path.remove();
      }
    }, interval_length);
    return result;
  }

  function animateOperator(arr, jsav) {
    var opSign = jsav.svg.text(
      arr.element.offset().left - jsav.canvas.offset().left + arr.element.outerWidth() / 2,
      arr.element.offset().top - jsav.canvas.offset().top + arr.element.outerHeight() / 2,
      arr.value(0)
    );
    opSign.animate({"font-size": 400, "opacity": 0}, 500, "<",
      function () {
        // remove the operator sign when the animation is done
        opSign.remove();
      }
    );
  }
}(jQuery));
