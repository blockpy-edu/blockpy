/* global ODSA, ClickHandler */
(function ($) {
  "use strict";

  var arraySize = 15, // size needs to be odd
    initialInfix = [],
    infixArray,
    resultArray,
    stack,
    bitBucket,
    pseudo,
    $infixLabel,
    $stackLabel,
    $postfixLabel,
    config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
    interpret = config.interpreter,
    code = config.code,
    av = new JSAV($("#jsavcontainer")),
    clickHandler;

  av.recorded(); // we are not recording an AV with an algorithm

  function initialize() {

    // show the code and highlight the row where mid is calculated
    if (!pseudo && code) {
      pseudo = av.code(code, {after: {element: $(".instructions")}});
      pseudo.show();
      pseudo.element.css({width: "auto"});
      pseudo.css(true, {whiteSpace: "normal"});
    }

    // set up click handler
    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {selectedClass: "selected"});
    }
    clickHandler.reset();

    // generate random infix
    initialInfix = generateRandomInfix(arraySize, 2, false);

    // create array with infix expression
    if (infixArray) {
      clickHandler.remove(infixArray);
      infixArray.clear();
    }
    infixArray = av.ds.array(initialInfix, {indexed: false, center: true});
    infixArray.layout();
    clickHandler.addArray(infixArray);

    // add stack and set click handler
    if (stack) {
      clickHandler.remove(stack);
      stack.clear();
    }
    stack = av.ds.list({nodegap: 15, center: false});
    stack.addFirst("");
    stack.first().addClass("greybg");
    stack.css("left", 200);
    stack.layout();
    clickHandler.addList(stack, {
      keep: true,
      select: "first",
      drop: "first",
      onDrop: function () { restoreInfix(infixArray).call(this); }
    });

    // create empty array for the result
    if (resultArray) {
      clickHandler.remove(resultArray);
      resultArray.clear();
    }
    resultArray = av.ds.array(new Array(arraySize - 4), {indexed: false, center: true});
    resultArray.layout();
    clickHandler.addArray(resultArray,
      { onDrop: function () { restoreInfix(infixArray).call(this); }
    });

    // create the bit bucket
    if (typeof bitBucket === "undefined") {
      bitBucket = av.ds.array([interpret("av_bit_bucket")], {indexed: false, center: false});
      bitBucket.element.css({top: 115, left: 60, position: "absolute", width: "auto"});
      bitBucket.css(0, {padding: 5});
      clickHandler.addArray(bitBucket, {
        onSelect: function () { return false; },
        onDrop: restoreInfix(infixArray),
        effect: "toss"
      });
    }

    // remove all old labels
    av.container.find(".exerciseLabel").remove();

    // create new labels
    $infixLabel = $("<p class='exerciseLabel'>" + interpret("av_infix_expression") + "</p>");
    $stackLabel = $("<p class='exerciseLabel'>" + interpret("av_stack") + "</p>");
    $postfixLabel = $("<p class='exerciseLabel'>" + interpret("av_postfix_expression") + "</p>");

    // style the labels
    $infixLabel.add($stackLabel).add($postfixLabel)
      .css("text-align", "center")
      .css("font-weight", "bold");

    // insert the labels
    $infixLabel.insertBefore(infixArray.element);
    $stackLabel.insertBefore(stack.element);
    $postfixLabel.insertBefore(resultArray.element);

    return resultArray;
  }

  function modelSolution(jsav) {
    // initialize infix array
    var modelArray = jsav.ds.array(initialInfix);
    // initialize stack
    var modelStack = jsav.ds.list({nodegap: 15, layout: "horizontal", center: false});
    modelStack.addFirst("");
    modelStack.first().addClass("greybg");
    modelStack.css({top: 30, left: 200});
    modelStack.layout();
    // initialize result array
    var modelResultArray = jsav.ds.array(new Array(arraySize - 4));
    modelResultArray.element.css(
      {top: 165,
      left: (jsav.canvas.outerWidth() - modelResultArray.element.outerWidth()) / 2,
      "position": "absolute"});
    // initialize bit bucket
    var modelBitBucket = jsav.ds.array([interpret("av_bit_bucket")], {indexed: false, center: false});
    modelBitBucket.element.css({top: 75, left: 60, position: "absolute", width: "auto"});
    modelBitBucket.css(0, {padding: 5});

    jsav.canvas.css({height: 250});

    jsav._undo = [];

    // postfix index
    var postfixInd = 0;
    
    var node;

    for (var i = 0; i < arraySize; i++) {
      var newChar = initialInfix[i];
      var type;
      if (parseInt(newChar, 16)) {
        type = "operand";
      } else {
        type = newChar;
      }

      switch (type) {
      case "operand":
        // move operand into the expression
        jsav.effects.moveValue(modelArray, i, modelResultArray, postfixInd++);
        restoreInfix(modelArray).call(this);
        jsav.umsg(interpret("av_ms_com_operand"));
        jsav.stepOption("grade", true);
        jsav.step();
        break;
      case "(":
        // push the left parenthesis to the stack
        modelStack.addFirst();
        jsav.effects.moveValue(modelArray, i, modelStack.first());
        restoreInfix(modelArray).call(this);
        modelStack.layout();
        jsav.umsg(interpret("av_ms_com_leftpar"));
        jsav.stepOption("grade", true);
        jsav.step();
        break;
      case ")":
        // throw the right parenthesis into the bit bucket and pop operators into the expression
        modelArray.value(i, "");
        restoreInfix(modelArray).call(this);
        jsav.umsg(interpret("av_ms_com_rightpar"));
        //  jsav.stepOption("grade", true);
        jsav.step();
        node = modelStack.first();
        while (node.value() !== "(") {
          jsav.effects.moveValue(node, modelResultArray, postfixInd++);
          modelStack.removeFirst();
          modelStack.layout();
          jsav.stepOption("grade", true);
          jsav.step();
          node = modelStack.first();
        }
        // pop the left parenthesis into the bit bucket
        modelStack.removeFirst();
        modelStack.layout();
        jsav.stepOption("grade", true);
        jsav.step();
        break;
      case "*":
        // pop possible * from the stack into the expression
        node = modelStack.first();
        while (node.value() === "*") {
          jsav.effects.moveValue(node, modelResultArray, postfixInd++);
          modelStack.removeFirst();
          modelStack.layout();
          jsav.umsg(interpret("av_ms_com_mul"));
          jsav.stepOption("grade", true);
          jsav.step();
          node = modelStack.first();
        }
        // push the * into the stack
        modelStack.addFirst();
        jsav.effects.moveValue(modelArray, i, modelStack.first());
        restoreInfix(modelArray).call(this);
        modelStack.layout();
        jsav.umsg(interpret("av_ms_com_mulpush"));
        jsav.stepOption("grade", true);
        jsav.step();
        break;
      case "+":
        // pop possible * and + from the stack into the expression
        node = modelStack.first();
        while (node.value() === "*" || node.value() === "+") {
          jsav.umsg(interpret("av_ms_com_ge_prec"), { fill: {
            operator: node.value()
          } });
          jsav.effects.moveValue(node, modelResultArray, postfixInd++);
          modelStack.removeFirst();
          modelStack.layout();
          jsav.stepOption("grade", true);
          jsav.step();
          node = modelStack.first();
        }
        // push the + into the stack
        modelStack.addFirst();
        jsav.effects.moveValue(modelArray, i, modelStack.first());
        restoreInfix(modelArray).call(this);
        modelStack.layout();
        jsav.umsg(interpret("av_ms_com_pluspush"));
        jsav.stepOption("grade", true);
        jsav.step();
        break;
      }
    }

    // empty the stack into the expression
    node = modelStack.first();
    while (node.value() !== "") {
      jsav.effects.moveValue(node, modelResultArray, postfixInd++);
      modelStack.removeFirst();
      modelStack.layout();
      jsav.umsg(interpret("av_ms_com_rest"));
      jsav.stepOption("grade", true);
      jsav.step();
      node = modelStack.first();
    }

    return modelResultArray;
  }

  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend", modelDialog: {width: 780}});
  exercise.reset();

  // generates a random infix expression
  // only made to work with the exercise
  // initial call should be made with odd length
  function generateRandomInfix(length, parentheses, endWithOperator) {
    var operand;
    if (length === 0) {
      return [];
    }
    if (length === 1) {
      if (endWithOperator) {
        return JSAV.utils.rand.random() < 0.5 ? ["+"] : ["*"];
      } else {
        operand = Math.ceil(JSAV.utils.rand.random() * 15).toString(16);
        return [operand];
      }
    }

    var minLengthForParentheses = parentheses * 5 + parentheses - 1 + (endWithOperator && parentheses ? 1 : 0);

    if (JSAV.utils.rand.random() < minLengthForParentheses / length) {
      // return array with parentheses
      if (parentheses - 1 > 0 &&
          length >= 11 + (endWithOperator ? 1 : 0) &&
          JSAV.utils.rand.random() < 0.5) {
        // parentheses inside parentheses
        if (length <= 12) {
          return ["("].concat(generateRandomInfix(9, 1, false),
                    [")"],
                    generateRandomInfix(length - 11, parentheses - 2, endWithOperator));
        } else {
          return ["("].concat(generateRandomInfix(9, 1, false),
                    [")"],
                    generateRandomInfix(1, 0, true),
                    generateRandomInfix(length - 12, parentheses - 2, endWithOperator));
        }
      }
      var parInside = Math.min(JSAV.utils.rand.random() < 0.5 ? 3 : 5, length - 2);
      if (length <= parInside + 3) {
        return ["("].concat(generateRandomInfix(parInside, 0, false),
                  [")"],
                  generateRandomInfix(length - parInside - 2, parentheses - 1, endWithOperator));

      } else {
        return ["("].concat(generateRandomInfix(parInside, 0, false),
                  [")"],
                  generateRandomInfix(1, 0, true),
                  generateRandomInfix(length - parInside - 3, parentheses - 1, endWithOperator));
      }
    }

    // no parentheses
    // return operand + operator
    operand = Math.ceil(JSAV.utils.rand.random() * 15).toString(16);
    return [operand].concat(generateRandomInfix(1, 0, true),
                generateRandomInfix(length - 2, parentheses, endWithOperator));

  }

  // returns a function which:
  // restores the infix expression after an element has been moved
  // away from the expression
  // paints the restored index grey to mark that it has been used
  function restoreInfix(array) {
    return function () {
      for (var i = 0; i < arraySize; i++) {
        if (array.value(i) === "") {
          array.value(i, initialInfix[i]);
          array.addClass(i, "greybg");
          return false;
        }
      }
      return true;
    };
  }
}(jQuery));
