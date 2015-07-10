/* global ODSA, PARAMS, ClickHandler */
(function ($) {
  "use strict";

  var oldSize = PARAMS.size || 11,
    newSize = oldSize * 2,
    probing = PARAMS.probing || "quadratic",
    oldHashArray,
    newHashArray,
    insertStack,
    initialHash,
    initialInsert,
    $oldLabel,
    $newLabel,
    $stackLabel,
    pseudo,
    config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
    interpret = config.interpreter,
    code = config.code,
    av = new JSAV($("#jsavcontainer")),
    clickHandler;

  av.recorded(); // we are not recording an AV with an algorithm

  var hashFunction = {
    linear: function (key, i, size) {
      return (key + i) % size;
    },
    quadratic: function (key, i, size) {
      return (key + i * i) % size;
    }
  };

  var hashFunctionString = {
    linear: function (key, i, size, hideAns) {
      return "<em>h(" + key + ", " + i + ") = (" + key + " + " + i + ") mod " + size + (hideAns ? "" : " = " + hashFunction.linear(key, i, size)) + "</em>";
    },
    quadratic: function (key, i, size, hideAns) {
      return "<em>h(" + key + ", " + i + ") = (" + key + " + " + i + "<sup>2</sup>) mod " + size + (hideAns ? "" : " = " + hashFunction.quadratic(key, i, size)) + "</em>";
    }
  };

  function initialize() {

    // show the code and highlight the row where mid is calculated
    if (!pseudo && code) {
      pseudo = av.code($.extend({after: {element: $(".instructions")}}, code));
      pseudo.show();
    }

    var probeMessage = interpret("av_probing") + " <strong style='color: #c00'>" +
      interpret("av_" + probing) + "</strong><br>" + hashFunctionString[probing]("k", "i", newSize, true);

    // set up click handler
    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {selectedClass: "selected"});
      // clear message when deselecting
      var origdeselect = clickHandler.deselect;
      clickHandler.deselect = function () {
        origdeselect.call(this);
        av.umsg(probeMessage);
        // remove all arrows from the old and new hash table
        oldHashArray.removeClass(true, "jsavarrow");
        newHashArray.removeClass(true, "jsavarrow");
      };
    }
    clickHandler.reset();


    // clear old structures
    if (oldHashArray) {
      clickHandler.remove(oldHashArray);
      oldHashArray.clear();
    }
    if (insertStack) {
      clickHandler.remove(insertStack);
      insertStack.clear();
    }
    if (newHashArray) {
      clickHandler.remove(newHashArray);
      newHashArray.clear();
    }
    // remove all old labels
    av.container.find(".exerciseLabel").remove();


    // generate a collision index
    var collisionIndex = Math.floor(Math.random() * newSize);

    // generate (pseudo) random input
    initialHash = generateHashValues(oldSize, newSize, collisionIndex);

    // create array
    oldHashArray = av.ds.array(initialHash, {indexed: true, center: true, autoresize: false});
    oldHashArray.layout();
    clickHandler.addArray(oldHashArray, {
      onSelect: onSelect,
      beforeDrop: beforeDrop,
      onDrop: onDrop
    });

    // generate input with at least one collision
    initialInsert = JSAV.utils.rand.numKeys(100, 900, Math.floor(oldSize / 2));
    var randomIndex = Math.floor(Math.random() * initialInsert.length);
    var collisionKey = Math.floor(JSAV.utils.rand.numKey(100, 900) / newSize) * newSize + collisionIndex;
    initialInsert[randomIndex] = collisionKey;

    // create insert stack with random input and hide it
    insertStack = av.ds.stack(initialInsert, {center: true});
    insertStack.css("min-height", oldHashArray.css("height"));
    insertStack.layout();
    insertStack.hide();
    clickHandler.addList(insertStack, {
      select: "first",
      drop: "first",
      onSelect: onSelect,
      onDrop: onDrop
    });

    // create empty array for the result
    newHashArray = av.ds.array(new Array(newSize), {indexed: true, center: true, autoresize: false});
    newHashArray.layout();
    clickHandler.addArray(newHashArray, {
      onSelect: onSelect,
      beforeDrop: beforeDrop,
      onDrop: onDrop
    });

    // create new labels
    $oldLabel = $("<p class='exerciseLabel'>" + interpret("av_old_hash") + "</p>");
    $newLabel = $("<p class='exerciseLabel'>" + interpret("av_new_hash") + "</p>");
    $stackLabel = $("<p class='exerciseLabel'>" + interpret("av_insert") + "</p>");

    // style the labels
    $oldLabel.add($newLabel).add($stackLabel)
      .css("text-align", "center")
      .css("font-weight", "bold");

    // insert the labels
    $oldLabel.insertBefore(oldHashArray.element);
    $newLabel.insertBefore(newHashArray.element);
    $stackLabel.insertBefore(insertStack.element).hide();


    // show the used probing type
    av.umsg(probeMessage);

    return newHashArray;
  }

  function modelSolution(jsav) {
    // initialize infix array
    var msOldHash = jsav.ds.array(initialHash, {
      indexed: true,
      center: true,
      autoresize: false
    });

    // initialize stack
    var msStack = jsav.ds.stack(initialInsert, {center: true});
    msStack.css("min-height", msOldHash.css("height"));
    msStack.layout();
    msStack.hide();

    // initialize result array
    var msNewHash = jsav.ds.array(new Array(newSize), {
      indexed: true,
      center: true,
      autoresize: false
    });

    jsav.displayInit();

    var i, ind;

    // rehash the values from the old table
    for (i = 0; i < msOldHash.size(); i++) {
      if (msOldHash.value(i) !== "") {
        msOldHash.addClass(i, "selected");
        var t = 0;
        while (msNewHash.value(ind = hashFunction[probing](msOldHash.value(i), t, newSize))) {
          jsav.umsg(hashFunctionString[probing](msOldHash.value(i), t, newSize) + "<br>" + interpret("av_ms_collision"), {fill: {index: ind}});
          // add arrows on top of
          msNewHash.addClass(ind, "jsavarrow");
          jsav.gradeableStep();
          t++;
        }
        jsav.umsg(hashFunctionString[probing](msOldHash.value(i), t, newSize) + "<br>" + interpret("av_ms_insert"), {fill: {index: ind}});
        // move the value from the old hash table to new hash table
        jsav.effects.moveValue(msOldHash, i, msNewHash, ind);
        msOldHash.removeClass(i, "selected");
        // remove all arrows
        msNewHash.removeClass(true, "jsavarrow");
        jsav.gradeableStep();
      }
    }

    msOldHash.hide();
    msStack.show();
    jsav.step();

    // insert the values in the stack to the new hash table
    while (msStack.size()) {
      msStack.first().addClass("selected");
      i = 0;
      while (msNewHash.value(ind = hashFunction[probing](msStack.first().value(), i, newSize))) {
        jsav.umsg(hashFunctionString[probing](msStack.first().value(), i, newSize) + "<br>" + interpret("av_ms_collision"), {fill: {index: ind}});
        msNewHash.addClass(ind, "jsavarrow");
        jsav.gradeableStep();
        i++;
      }
      jsav.umsg(hashFunctionString[probing](msStack.first().value(), i, newSize) + "<br>" + interpret("av_ms_insert"), {fill: {index: ind}});
      jsav.effects.moveValue(msStack.first(), msNewHash, ind);
      msStack.removeFirst();
      msStack.layout();
      // remove all arrows
      msNewHash.removeClass(true, "jsavarrow");
      jsav.gradeableStep();
    }

    return msNewHash;
  }


  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend", modelDialog: {width: 780}});
  exercise.reset();


  // onSelect function
  function onSelect(index) {
    var val;
    if (typeof index === "number") {
      val = this.value(index);
    } else {
      val = this.value();
    }
    av.umsg("<br><strong>{key} mod {size} = {result}</strong>", {preserve: true, fill: {
      key: val,
      size: newSize,
      result: val % newSize
    }});
  }

  // beforeDrop function
  function beforeDrop(index) {
    if (this.value(index) !== "") {
      this.addClass(index, "jsavarrow");
      av.gradeableStep();
      return false;
    }
  }

  // onDrop function
  function onDrop(index) {
    // clear hash function from the message
    av.clearumsg();
    // hide old hash table and show the insert stack if the old hash table becomes empty
    if (oldHashArray.isEmpty() && oldHashArray.isVisible()) {
      var oldfx = $.fx.off;
      $.fx.off = true;
      hideLabel($oldLabel);
      oldHashArray.hide();
      $.fx.off = oldfx;
      showLabel($stackLabel);
      insertStack.show();
    }
    // remove all arrows from the old and new hash table
    oldHashArray.removeClass(true, "jsavarrow");
    newHashArray.removeClass(true, "jsavarrow");
  }

  // functions for hiding and showing the labels (jQuery objects)
  // wrapped to work with JSAV undo
  var hideLabel = (function () {
    var func = JSAV.anim(
      function (label) { label.hide(); },
      function (label) { label.show(); }
    );
    return function (label) { func.call(av, label); };
  })();

  var showLabel = (function () {
    var func = JSAV.anim(
      function (label) { label.show(); },
      function (label) { label.hide(); }
    );
    return function (label) { func.call(av, label); };
  })();

  // generate values for the old hash table
  function generateHashValues(oldSize, newSize, collisionIndex) {
    // size of the generated values
    var size = Math.floor(oldSize / 2);

    var values = [],
      result = new Array(oldSize),
      temp, i;

    for (i = 0; i < size; i++) {
      if (typeof collisionIndex !== "undefined" && i < Math.min(3, Math.ceil(size / 2))) {
        temp = Math.floor(JSAV.utils.rand.numKey(100, 900) / newSize) * newSize + collisionIndex;
      } else {
        temp = JSAV.utils.rand.numKey(100, 900);
      }
      values.push(temp);
    }

    for (i = 0; i < size; i++) {
      var t = 0;
      while (typeof result[hashFunction[probing](values[i], t, oldSize)] !== "undefined") {
        t++;
      }
      result[hashFunction[probing](values[i], t, oldSize)] = values[i];
    }

    return result;
  }

}(jQuery));
