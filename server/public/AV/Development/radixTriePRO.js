/* global ODSA, ClickHandler */
(function ($) {
  "use strict";
  JSAV._types.ds.BinaryTreeNode.prototype.createLabel = function (val) {
    if (this.label) {
      this.label.clear();
    }
    this.label = this.jsav.label(val, {container: this.element});
    this.label.element.css({
      left: this.element.outerWidth() - 10,
      top: - this.label.element.outerHeight() + 10
    });
  };

  JSAV._types.ds.BinaryTreeNode.prototype.clearLabel = function () {
    if (!this.label) { return; }
    this.label.clear();
  };

  JSAV._types.ds.BinaryTreeNode.prototype.getLabel = function () {
    return this.label;
  };

  //modified to remove label when value is empty and create label when it's not empty
  JSAV._types.ds.BinaryTreeNode.prototype._setvalue = JSAV.anim(function (newValue) {
    var oldVal = this.value(),
      valtype = typeof(newValue);
    if (typeof oldVal === "undefined") { oldVal = ""; }
    if (valtype === "object") { valtype = "string"; }
    this.element
      .removeClass("jsavnullnode")
      .find(".jsavvalue")
      .html(this._valstring(newValue))
      .end()
      .attr({"data-value": newValue, "data-value-type": valtype});
    if (newValue === "") {
      this.clearLabel();
    } else if (newValue !== "jsavnull") {
      this.createLabel(getBinary(newValue));
    }
    if (newValue === "jsavnull") {
      this.element.addClass("jsavnullnode");
    }
    return [oldVal];
  });

  // AV varialbles
  var insertArray,
      tree,
      stack,
      stackLabels,
      insertSize = 6,
      clickHandler,

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

    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {
        selectedClass: "selected",
        removeNodes: false,
        selectEmpty: true
      });
    }
    clickHandler.reset();

    //generate values. 65 = A, 80 = 0
    insertArray = generateValues(insertSize, 65, 80);
    //convert the values into characters and push them into the stack
    var i;
    for (i = 0; i < insertSize; i++) {
      insertArray[i] = String.fromCharCode(insertArray[i]);
      // stack.addLast(insertArray[i]);
    }
    //clear the old stack
    if (stack) {
      clickHandler.remove(stack);
      stack.clear();
    }
    //create a new stack
    stack = av.ds.stack(insertArray, {center: true});
    stack.layout();
    clickHandler.addList(stack, {
      select: "first",
      drop: "first",
      keep: false
    });

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
      clickHandler.remove(tree);
      tree.clear();
    }
    //create a new tree
    tree = av.ds.binarytree({center: true, visible: true, nodegap: 15});
    tree.root("");
    tree.root().addClass("emptynode");
    tree.layout();
    clickHandler.addTree(tree, {
      onSelect: function () {
        // select the value if 
        if (this.value()) {
          return true;
        }
        // don't continue (and don't select the node) if it doesn't have the class "emptynode" 
        if (!this.hasClass("emptynode")) {
          return false;
        }
        // The user has clicked on an empty node, so we remove the empty node class and give the node two children
        this.removeClass("emptynode");
        this.left("");
        this.left().element.addClass("emptynode");
        this.right("");
        this.right().element.addClass("emptynode");
        // call layout function for the tree
        this.container.layout();
        exercise.gradeableStep();
        // don't select the node
        return false;
      },
      onDrop: function () {
        this.removeClass("emptynode");
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
        this.container.layout();
        if (stack.first() && !stack.first().value()) {
          stack.removeFirst();
        }
        if (stack.size()) {
          stackLabels[insertSize - stack.size()].show();
        }
        stack.layout();
      }
    });

    return tree;
  }

  function modelSolution(jsav) {
    jsav._undo = [];

    var modelStack = jsav.ds.stack(insertArray, {center: true});
    modelStack.layout();
    var l = jsav.label(getBinary(insertArray[0]), { container: modelStack.first().element });
    l.element.css({
      left: modelStack.first().element.outerWidth() - 10,
      top: - l.element.outerHeight() + 10
    });

    var modelTree = jsav.ds.binarytree({center: true, visible: true, nodegap: 10});
    modelTree.root("");
    modelTree.root().addClass("emptynode");
    modelTree.layout();

    jsav.displayInit();

    for (var i = 0; i < insertSize; i++) {
      var val = getBinary(insertArray[i]);
      var level = 0;
      var node = modelTree.root();
      //find the node where the value should be inserted
      while (!node.hasClass("emptynode") && node.value() === "") {
        if (val.charAt(level) === "0") {
          node = node.left();
        } else {
          node = node.right();
        }
        level += 1;
      }
      if (node.hasClass("emptynode")) {
        //insert value and add empty nodes
        node.value(insertArray[i]);
        node.left("");
        node.left().element.addClass("emptynode");
        node.right("");
        node.right().element.addClass("emptynode");
        node.removeClass("emptynode");
      } else {
        // level += 1;
        while (val.charAt(level) === getBinary(node.value()).charAt(level)) {
          node = node.child(parseInt(val.charAt(level), 10))
            .removeClass("emptynode")
            .value(node.value());
          node.parent().value("");
          node.left("");
          node.left().element.addClass("emptynode");
          node.right("");
          node.right().element.addClass("emptynode");
          level += 1;
        }
        //insert value
        node.child(parseInt(val.charAt(level), 10))
          .removeClass("emptynode")
          .value(insertArray[i])
          .left("")
          .element.addClass("emptynode");
        node.child(parseInt(val.charAt(level), 10))
          .right("")
          .element.addClass("emptynode");
        //move value from node to the sibling of the newly inserted node
        node.child(1 - parseInt(val.charAt(level), 10))
          .removeClass("emptynode")
          .value(node.value())
          .left("")
          .element.addClass("emptynode");
        node.child(1 - parseInt(val.charAt(level), 10))
          .right("")
          .element.addClass("emptynode");
        node.value("");
      }

      modelTree.layout();
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

  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend", grader: "finder"});
  exercise.reset();

}(jQuery));