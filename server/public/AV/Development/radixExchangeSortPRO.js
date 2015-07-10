/* global ODSA, ClickHandler */
(function ($) {
  "use strict";
  var arraySize = 10,
    bits = 3,
    colorBits = true,
    initialArray,
    array,
    stack,
    mode,
    pseudo,
    clickHandler,
    config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
    interpret = config.interpreter,
    code = config.code,
    av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  pseudo = av.code($.extend({after: {element: $(".instructions")}, visible: true}, code));

  function initialize() {
    
    exercise.jsav.container.find(".jsavcanvas").css({height: 350});

    // set up click handler
    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {effect: "swap", selectedClass: "selected"});
    }
    clickHandler.reset();

    // generate random infix and insert in the array
    initialArray = JSAV.utils.rand.numKeys(0, Math.pow(2, bits), arraySize);
    for (var i = 0; i < arraySize; i++) {
      // convert into binary
      initialArray[i] = initialArray[i].toString(2);
      // add leading zeros
      initialArray[i] =
        new Array(bits + 1 - initialArray[i].length).join("0") + initialArray[i];
      if (colorBits) {
        // add <span class="bit"> around all bits
        initialArray[i] = '<span class="bit">' + initialArray[i].split("").join('</span><span class="bit">') + '</span>';
      }
    }

    // initialize array
    if (array) {
      clickHandler.remove(array);
      array.clear();
    }
    array = av.ds.array(initialArray, {indexed: true});
    array.element.css({top: 40});
    array.layout();
    clickHandler.addArray(array, {onSelect:
      function (index) {
        switch (mode.value()) {
        case 0:
          // return true to tell clickHandler to select the item
          return true;
        case 1:
          extendStackValue("Left", index);
          av.umsg(interpret("av_right_endpoint"));
          mode.value(2);
          av.step();
          break;
        case 2:
          extendStackValue("Right", index);
          av.umsg("");
          focusOn(array, getCurrentValue("Left", stack), index, getCurrentValue("Bit", stack));
          mode.value(0);
          exercise.gradeableStep();
          break;
        }
        // disable selecting
        return false;
      }
    });


    // stack
    if (stack) {
      clickHandler.remove(stack);
      stack.clear();
    }
    stack = av.ds.stack({xtransition: 5, ytransition: 25, center: false});
    //  stack = av.ds.list({nodegap: 15, layout: "vertical", center: false, autoresize: false});
    stack.element.css({width: 180, position: "absolute"});
    stack.element.css({top: 200, left: av.canvas.width() / 2 - 90});
    stack.addFirst("Bit: " + (bits - 1) + ", Left: 0, Right: " + (arraySize - 1));
    stack.layout();
    
    // mode variable
    // 0 when swapping
    // 1 when selecting left endpoint
    // 2 when selecting right endpoint
    if (mode) {
      mode.clear();
    }
    mode = av.variable(0);

    //  clear all the Raphael elements
    av.getSvg().clear();

    //  add text
    var font = {
      "font-size": 16,
      "font-family": "Times New Roman",
      "font-weight": "bold"
    };
    var canvasWidth = exercise.jsav.container.find(".jsavcanvas").width();
    av.getSvg().text(canvasWidth / 2, 20, interpret("av_table_to_be_sorted")).attr(font);
    av.getSvg().text(canvasWidth / 2, 180, interpret("av_call_stack")).attr(font);

    // hide old umsg messages
    av.umsg("");

    focusOn(array, 0, arraySize - 1, bits - 1);

    return array;
  }

  function modelSolution(jsav) {
    // array
    var modelArray = jsav.ds.array(initialArray, {indexed: true});

    //  var modelStack = jsav.ds.list({nodegap: 15, layout: "vertical", center: false, autoresize: false});
    var modelStack = jsav.ds.stack({xtransition: 5, ytransition: 25, center: false});
    modelStack.element.css({width: 180, position: "absolute"});
    modelStack.element.css({top: 100, left: jsav.canvas.width() / 2 - 90});

    jsav.canvas.css({height: 350});

    jsav._undo = [];

    //  $(".jsavforward").click(function () {
    //    if (jsav.container.hasClass("jsavplaying")) {
    //      jsav.container.removeClass("jsavplaying");
    //    }
    //  });
    //  $(".jsavbackward").click(function () {
    //    if (jsav.container.hasClass("jsavplaying")) {
    //      jsav.container.removeClass("jsavplaying");
    //    }
    //  });

    // get the bit from the array at index
    // removes possible spans
    function getBit(arr, index, bit) {
      return parseInt(arr.value(index).replace(/<\/?span[^>]*>/g, "").charAt(bits - 1 - bit), 10);
    }

    function modelRadix(bit, left, right) {
      modelStack.addFirst("Bit: " + bit + ", Left: " + left + ", Right: " + right);
      modelStack.layout();

      focusOn(modelArray, left, right, bit);

      // add a step if not first call
      if (left !== 0 || right !== arraySize - 1) {
        jsav.stepOption("grade", true);
        jsav.step();
      } else {
        jsav.displayInit();
      }

      var i = left;
      var j = right;

      while (i < j) {
        while (i <= right && getBit(modelArray, i, bit) === 0) {
          i++;
        }
        while (j >= left && getBit(modelArray, j, bit) === 1) {
          j--;
        }
        if (i < j) {
          modelArray.swap(i, j);
          jsav.stepOption("grade", true);
          jsav.step();
        }
      }

      // call function recursivley for both sides
      if (bit > 0) {
        if (left < j) {
          modelRadix(bit - 1, left, j);
        }
        if (right > i) {
          modelRadix(bit - 1, i, right);
        }
      }

      // return
      returnClick(modelArray, modelStack);
      jsav.stepOption("grade", true);
      jsav.step();
    }

    modelRadix(bits - 1, 0, arraySize - 1);

    return modelArray;
  }

  // create excercise
  var exercise = av.exercise(modelSolution, initialize,
                             { compare: {css: "background-color"},
                               feedback: "atend"});
  exercise.reset();


  var $callButton = $("#callButton");
  var $returnButton = $("#returnButton");
  
  //  add buttons if they don't exist
  if ($callButton.length === 0) {
    $callButton = $("<button>" + interpret("av_call") + "</button>");
    $("#jsavcontainer .jsavcanvas").append($callButton);
  }
  if ($returnButton.length === 0) {
    $returnButton = $("<button>" + interpret("av_return") + "</button>");
    $("#jsavcontainer .jsavcanvas").append($returnButton);
  }

  // position buttons
  $callButton.css({position: "absolute", left: 50, top: 200, width: 100});
  $returnButton.css({position: "absolute", left: 50, top: 230, width: 100});
  // add click handlers
  $callButton.click(function () {
    mode.value(1);
    clickHandler.deselect();
    stack.addFirst("Bit: " + (getCurrentValue("Bit", stack) - 1));
    stack.layout();
    av.umsg(interpret("av_left_endpoint"));
    av.step();
  });
  $returnButton.click(function () {
    returnClick(array, stack);
    exercise.gradeableStep();
  });



  // returns the value of Bit, Left or Right of the topmost item of the stack
  function getCurrentValue(name, stack) {
    var result;
    var value;
    if (stack.first()) {
      value = stack.first().value();
    } else {
      value = "Bit: " + bits + ", Left: " + 0 + ", Right: " + (arraySize - 1);
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

  // extends the value of the topmost element on the stack
  function extendStackValue(name, value) {
    var oldvalue = stack.first().value();
    oldvalue += ", " + name + ": " + value;
    stack.first().value(oldvalue);
  }

  // paints all the squares outside of [first, last] grey
  function focusOn(arr, first, last, bit) {
    arr.removeClass(true, "greybg");
    arr.addClass(function (index) {
      return index < first || index > last;
    },
    "greybg");
    if (colorBits && typeof bit === "number") {
      // uncolor all bits
      arr.element.find(".bit").removeClass("coloredbit");
      // color the wanted bits
      arr.element.find(".jsavvalue").find(".bit:eq(" + (bits - 1 - bit) + ")").addClass("coloredbit");
      var i;
      if (bit === bits) {
        // remove all bit classes
        for (i = 0; i < arraySize; i++) {
          var $temp = arr.element.find(".jsavvaluelabel:eq(" + i + ")");
          $temp.html($temp.text());
        }
      }
      // update the real values of the elements
      for (i = 0; i < arraySize; i++) {
        var v = arr.element.find("li:eq(" + i + ") .jsavvaluelabel").html();
        arr.value(i, v);
      }
    }
  }

  // pops the stack and focuses on the previous range
  function returnClick(array, stack) {
    if (stack.size()) {
      stack.removeFirst();
      stack.layout();
    }
    if (stack.size()) {
      focusOn(array,
        getCurrentValue("Left", stack),
        getCurrentValue("Right", stack),
        getCurrentValue("Bit", stack));
    } else {
      focusOn(array, 0, arraySize - 1, bits);
    }
  }

}(jQuery));