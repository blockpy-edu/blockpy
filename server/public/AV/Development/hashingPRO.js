/* global ODSA, PARAMS */
(function ($) {
  "use strict";

  // AV variables
  var hashSize = PARAMS.size || 19,
      opSize = 20,
      probing = PARAMS.probing || "linear",
      hashArray,
      opStack,
      clickedIndex,
      initialOps,
      $hashLabel,
      $stackLabel,
      pseudo,

      // get the configurations from the configuration file
      config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
      interpret = config.interpreter,
      code = config.code,

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  var hashFunction = {
    linear: function (key, i, size) {
      return (key + i) % size;
    },
    quadratic: function (key, i, size) {
      return (key + i * i) % size;
    },
    double: function (key, i, size) {
      return (key + i * (7 - key % 7)) % size;
    }
  };

  var hashFunctionString = {
    linear: function (key, i, size, hideAns) {
      return "<em>h(" + key + ", " + i + ") = (" + key + " + " + i + ") mod " + size +
        (hideAns ? "" : " = " + hashFunction.linear(key, i, size)) + "</em>";
    },
    quadratic: function (key, i, size, hideAns) {
      return "<em>h(" + key + ", " + i + ") = (" + key + " + " + i + "<sup>2</sup>) mod " + size +
        (hideAns ? "" : " = " + hashFunction.quadratic(key, i, size)) + "</em>";
    },
    double: function (key, i, size, hideAns) {
      if (hideAns) {
        return "<em>h(" + key + ", " + i + ") = (" + key + " + " + i +
          " * (7 - (" + key + " mod 7))) mod " + size + "</em>";
      }
      return "<em>h(" + key + ", " + i + ") = (" + key + " + " + i +
        " * <strong style='color: #00c'>" + (7 - key % 7) + "</strong>) mod " + size +
        " = <strong>" + hashFunction.double(key, i, size) + "</strong>" +
        ",&nbsp;&nbsp;&nbsp;&nbsp;7 - (" + key + " mod 7) = <strong style='color: #00c'>" +
        (7 - key % 7) + "</strong></em>";
    }
  };

  if (code) {
    pseudo = av.code($.extend({after: {element: $(".instructions")}}, code));
    pseudo.show();
  }

  // create probeMessage and show it on the page
  var probeMessage = interpret("av_probing") + " <strong style='color: #c00'>" +
    interpret("av_" + probing) + "</strong><br>" +
    hashFunctionString[probing]("k", "i", hashSize, true);
  $("#probingMessage").html(probeMessage);


  function initialize() {

    // clear old structures
    if (hashArray) {
      hashArray.clear();
    }
    if (opStack) {
      opStack.clear();
    }
    if (clickedIndex) {
      clickedIndex.clear();
    }

    // remove all old labels
    av.container.find(".exerciseLabel").remove();

    // generate (pseudo) random input
    initialOps = generateHashOperations(opSize);

    // create operation stack
    opStack = av.ds.stack(initialOps.values, {
      center: true,
      ytransition: -9,
      xtransition: 7
    });
    opStack.css("min-height", 130);
    opStack.layout();
    for (var i = 0; i < opSize; i++) {
      opStack.get(i).addClass(initialOps.operations[i]);
    }

    // create array
    hashArray = av.ds.array(new Array(hashSize), {
      indexed: true,
      center: true,
      autoresize: false
    });
    hashArray.layout();
    hashArray.click(clickHandler);

    // create clickedIndex JSAV variable
    clickedIndex = av.variable(-1);

    // create new labels
    $hashLabel = $("<p class='exerciseLabel'>" + interpret("av_hash") + "</p>");
    $stackLabel = $("<p class='exerciseLabel'>" + interpret("av_operations") + "</p>");

    // insert the labels
    $hashLabel.insertBefore(hashArray.element);
    $stackLabel.insertBefore(opStack.element);

    // show hash function for the first element
    showModulusOfKey();

    return [hashArray, clickedIndex];
  }


  function modelSolution(jsav) {
    var i, ind;
    // initialize stack
    var msStack = jsav.ds.stack(initialOps.values, {
      center: true,
      ytransition: -9,
      xtransition: 7
    });
    msStack.css("min-height", 100);
    msStack.layout();
    for (i = 0; i < opSize; i++) {
      msStack.get(i).addClass(initialOps.operations[i]);
    }

    // initialize infix array
    var msHash = jsav.ds.array(new Array(hashSize), {
      indexed: true,
      center: true,
      autoresize: false
    });
    msHash.layout();

    var msClickedIndex = jsav.variable(-1);

    jsav.displayInit();

    function find(key, stopArray) {
      i = 0;
      var ind;
      while (stopArray.indexOf(msHash.value(ind = hashFunction[probing](key, i, hashSize))) === -1) {
        msClickedIndex.value(ind);
        msHash.addClass(ind, "jsavarrow");
        jsav.umsg(
          interpret("av_ms_collision") + "<br>" +
          hashFunctionString[probing](key, i, hashSize), {
          fill: {
            index: ind
          }
        });
        jsav.gradeableStep();
        i++;
      }
      msClickedIndex.value(ind);
      return ind;
    }

    function nextOperation() {
      msHash.removeClass(true, "jsavarrow");
      if (msStack.size()) {
        msStack.removeFirst();
        msStack.layout();
      }
      jsav.gradeableStep();
    }

    // insert the values in the stack to the new hash table
    while (msStack.size()) {
      var first = msStack.first(),
          firstValue = first.value(),
          operation = getOperationType(first);

      switch (operation) {
      case "insert":
        ind = find(firstValue, ["", "[del]"]);
        jsav.effects.moveValue(first, msHash, ind);
        jsav.umsg(interpret("av_ms_insert"), {fill: {
          index: ind
        }});
        jsav.umsg("<br>" + hashFunctionString[probing](firstValue, i, hashSize), {preserve: true});
        break;
      case "remove":
        ind = find(firstValue, ["", firstValue]);
        if (msHash.value(ind)) {
          msHash.value(ind, "[del]");
          jsav.umsg(interpret("av_ms_remove"), {fill: {
            index: ind
          }});
        } else {
          jsav.umsg(interpret("av_ms_remove_failed"), {fill: {
            key: firstValue
          }});
        }
        jsav.umsg("<br>" + hashFunctionString[probing](firstValue, i, hashSize), {preserve: true});
        break;
      case "search":
        ind = find(firstValue, ["", firstValue]);
        if (msHash.value(ind)) {
          jsav.umsg(interpret("av_ms_search"), {fill: {
            index: ind
          }});
        } else {
          jsav.umsg(interpret("av_ms_search_failed"), {fill: {
            key: firstValue
          }});
        }
        jsav.umsg("<br>" + hashFunctionString[probing](firstValue, i, hashSize), {preserve: true});
      }
      nextOperation();

    }

    return [msHash, msClickedIndex];
  }


  var clickHandler = function (index) {
    function nextOperation() {
      hashArray.removeClass(true, "jsavarrow");
      if (opStack.size()) {
        opStack.removeFirst();
        opStack.layout();
        showModulusOfKey();
      }
      exercise.gradeableStep();
    }

    if (!opStack.size()) {
      return;
    }
    var first = opStack.first(),
        operation = getOperationType(first);

    clickedIndex.value(index);

    switch (operation) {
    case "insert":
      if (this.value(index) === "" || this.value(index) === "[del]") {
        // insert element
        av.effects.moveValue(first, this, index);
        // this.value(index, first.value());
        nextOperation();
      } else {
        this.addClass(index, "jsavarrow");
        exercise.gradeableStep();
      }
      break;
    case "remove":
      if (this.value(index) === "") {
        nextOperation();
      } else if (this.value(index) === first.value()) {
        this.value(index, "[del]");
        nextOperation();
      } else {
        this.addClass(index, "jsavarrow");
        exercise.gradeableStep();
      }
      break;
    case "search":
      if (this.value(index) === "") {
        nextOperation();
      } else if (this.value(index) === first.value()) {
        nextOperation();
      } else {
        this.addClass(index, "jsavarrow");
        exercise.gradeableStep();
      }
      break;
    }
  };


  function getOperationType(node) {
    if (node.hasClass("insert")) {
      return "insert";
    } else if (node.hasClass("remove")) {
      return "remove";
    } else if (node.hasClass("search")) {
      return "search";
    } else {
      // unknown operation
      return undefined;
    }
  }


  function showModulusOfKey() {
    if (!opStack.size()) {
      return;
    }
    var val = opStack.first().value();
    av.umsg("<strong>{key} mod {size} = {result}</strong>", {fill: {
      key: val,
      size: hashSize,
      result: val % hashSize
    }});
    if (probing === "double") {
      av.umsg("<br><strong>7 - ({key} mod 7) = {result}</strong>", {preserve: true, fill: {
        key: val,
        result: 7 - val % 7
      }});
    }
  }


  // generate hash operations
  function generateHashOperations(size) {
    var values = new Array(size),
        operations = new Array(size),
        result = { values: values, operations: operations },
        i, start, end, ind1, ind2, ind3, ind4, colInd;

    // the first quarter contains insert operations
    // collissions at ind1 and ind2
    start = 0;
    end = Math.floor(size / 4);
    ind1 = Math.random() < 0.5 ? 1 : 2;
    ind2 = ind1 + Math.floor(Math.random() * (end - ind1));
    for (i = start; i < end; i++) {
      operations[i] = "insert";
      if (i === ind1 || i === ind2) {
        continue;
      }
      values[i] = JSAV.utils.rand.numKey(100, 900);
    }
    // collision index
    colInd = hashFunction[probing](values[0], 0, hashSize);
    // generate colliding values
    values[ind1] = Math.floor(JSAV.utils.rand.numKey(100, 900) / hashSize) * hashSize + colInd;
    values[ind2] = Math.floor(JSAV.utils.rand.numKey(100, 900) / hashSize) * hashSize + colInd;


    // the second quarter contains remove operations
    // attempt to remove non-existing key at ind1
    // attempt to remove already removed key at ind2
    start = end;
    end = Math.floor(size / 2);
    ind1 = start + Math.floor(Math.random() * (end - 1 - start));
    ind2 = end - 1;
    for (i = start; i < end; i++) {
      operations[i] = "remove";
      if (i === ind1 || i === ind2) {
        continue;
      }
      values[i] = values[Math.floor(Math.random() * start)];
    }
    // new key
    values[ind1] = JSAV.utils.rand.numKey(100, 900);
    // already removed key
    values[ind2] = values[(ind1 === start ? start + 1: start)];


    // the third quarter contains search operations
    // attempt to search for a non-existing key at ind3
    // attempt to search for an already removed key at ind4
    start = end;
    end += Math.floor(size / 4);
    ind3 = start + Math.floor(Math.random() * (end - 1 - start));
    ind4 = end - 1;
    for (i = start; i < end; i++) {
      operations[i] = "search";
      if (i === ind3 || i === ind4) {
        continue;
      }
      while (typeof values[i] === "undefined" ||
              values[i] === values[ind1] ||
              values[i] === values[ind2]
      ) {
        values[i] = values[Math.floor(Math.random() * start)];
      }
    }
    values[ind3] = values[ind1];
    values[ind4] = values[ind2];


    //the fourth quarter contains more insert operations
    start = end;
    end = size;
    for (i = start; i < end; i++) {
      operations[i] = "insert";
      values[i] = JSAV.utils.rand.numKey(100, 900);
    }

    return result;
  }


  var exercise = av.exercise(modelSolution, initialize, {
    feedback: "atend",
    modelDialog: {width: 760}
  });
  exercise.reset();

}(jQuery));
