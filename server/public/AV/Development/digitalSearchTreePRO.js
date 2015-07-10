/* global ODSA */
(function ($) {
  "use strict";
  // AV variables
  var insertArray,
      tree,
      stack,
      stackLabels,
      insertSize = 10,

      // Load the configurations created by odsaAV.js
      config = ODSA.UTILS.loadConfig({"av_container": "jsavcontainer"}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true, lineNumbers: false},

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  if (code) {
    av.code(code[1], codeOptions);
    av.code(code[0], codeOptions);
  }

  function initialize() {

    av.container.find(".jsavcanvas").css("min-height", 450);

    //generate values. 65 = A, 80 = 0
    insertArray = generateValues(insertSize, 65, 80);
    //clear the old stack
    if (stack) {
      stack.clear();
    }
    //create a new stack
    stack = av.ds.stack({center: true});
    //convert the values into characters and push them into the stack
    var i;
    for (i = 0; i < insertSize; i++) {
      insertArray[i] = String.fromCharCode(insertArray[i]);
      stack.addLast(insertArray[i]);
    }
    stack.layout();

    //contains references to the labels of the stack nodes
    stackLabels = [];
    //put labels on the stack nodes and hide all except the first one by default
    for (i = 0; i < insertSize; i++) {
      var l = av.label(getBinary(insertArray[i]), {container: stack.get(i).element, visible: i === 0});
      l.element.css({
        left: stack.last().element.outerWidth() - 10,
        top: - l.element.outerHeight() + 10
      });
      stackLabels.push(l);
    }

    //clear the old tree
    if (tree) {
      tree.clear();
    }
    //create a new tree
    tree = av.ds.binarytree({center: true, visible: true, nodegap: 15});
    tree.root("");
    tree.root().addClass("emptynode");
    tree.click(clickHandler);
    tree.layout();

    return tree;
  }

  function modelSolution(jsav) {
    jsav._undo = [];

    var modelStack = jsav.ds.stack({center: true});
    var i;
    for (i = 0; i < insertSize; i++) {
      modelStack.addLast(insertArray[i]);
    }
    modelStack.layout();
    var l = jsav.label(getBinary(insertArray[0]), {container: modelStack.first().element});
    l.element.css({
      left: modelStack.first().element.outerWidth() - 10,
      top: - l.element.outerHeight() + 10
    });

    var modelTree = jsav.ds.binarytree({center: true, visible: true, nodegap: 10});
    modelTree.root("");
    modelTree.root().addClass("emptynode");
    modelTree.layout();

    jsav.displayInit();

    for (i = 0; i < insertSize; i++) {
      var val = getBinary(insertArray[i]);
      var level = 0;
      var node = modelTree.root();
      //find the node where the value should be inserted
      while (node.value() !== "") {
        if (val.charAt(level) === "0") {
          node = node.left();
        } else {
          node = node.right();
        }
        level += 1;
      }
      //insert value and add empty nodes
      node.value(insertArray[i]);
      node.left("");
      node.left().element.addClass("emptynode");
      node.right("");
      node.right().element.addClass("emptynode");
      modelTree.layout();
      node.removeClass("emptynode");
      //add label to tree node
      l = jsav.label(val, {container: node.element});
      l.element.css({
        left: node.element.outerWidth() - 10,
        top: - l.element.outerHeight() + 10
      });

      modelStack.removeFirst();
      modelStack.layout();
      if (modelStack.first()) {
        //add label to stack node
        l = jsav.label(getBinary(insertArray[i + 1]), {container: modelStack.first().element});
        l.element.css({
          left: modelStack.first().element.outerWidth() - 10,
          top: - l.element.outerHeight() + 10
        });
      }

      jsav.stepOption("grade", true);
      jsav.step();
    }

    return modelTree;
  }

  var clickHandler = function () {
    if (stack.size()) {
      //insert value into this node
      this.value(stack.first().value());
      //add label to inserted node
      var l = av.label(getBinary(this.value()), {
        container: this.element
      });
      l.element.css({
        left: this.element.outerWidth() - 10,
        top: - l.element.outerHeight() + 10
      });
      //remove value from the stack
      stack.removeFirst();
      stack.layout();
      //show the next label
      if (stack.size()) {
        stackLabels[insertSize - stack.size()].show();
      }
      if (!this.left()) {
        //add empty node on the left side
        this.left("");
        this.left().element.addClass("emptynode");
      }
      if (!this.right()) {
        //add empty node on the right side
        this.right("");
        this.right().element.addClass("emptynode");
      }
      //update tree
      tree.layout();
      //remove class for dashed border
      this.removeClass("emptynode");
      //gradeable step
      exercise.gradeableStep();
    }
  };

  //generate values without duplicates
  function generateValues(n, min, max) {
    var arr = [];
    var val;
    for (var i = 0; i < n; i++) {
      do {
        val = Math.floor(min + Math.random() * (max - min));
      } while ($.inArray(val, arr) !== -1);
      arr.push(val);
    }
    return arr;
  }

  function getBinary(char) {
    var binLen = 4;
    if (typeof char === "string") {
      char = char.charCodeAt(0);
    }
    return new Array(binLen + 1 - (char % 64).toString(2).length).join("0") + (char % 64).toString(2);
  }

  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend"});
  exercise.reset();

}(jQuery));