/* global ODSA, ClickHandler */
(function ($) {
  "use strict";
  // AV variables
  var insertValues = [],
      tree,
      stack,
      insertSize = 10,
      clickHandler,

      // Load the configurations created by odsaAV.js
      config = ODSA.UTILS.loadConfig({av_container: "jsavcontainer"}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true, lineNumbers: false},

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  av.code(code, codeOptions);

  function initialize() {

    av.container.find(".jsavcanvas").css("min-height", 475);

    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {selectedClass: "selected", effect: "move"});
    }
    clickHandler.reset();
    
    // generate values
    insertValues = generateValues(insertSize, 10, 100); //No duplicates!
    if (stack) {
      clickHandler.remove(stack);
      stack.clear();
    }
    stack = av.ds.stack(insertValues, {center: true, element: $("#stackcontainer").append("<div></div>").find("div")});
    stack.layout();
    clickHandler.addList(stack, {
      select: "first",
      drop: "first",
      onSelect: function () {
        if (clickHandler.selNode) {
          clickHandler.selNode.removeClass("selected");
        }
      }
    });

    //clear old binary tree
    if (tree) {
      clickHandler.remove(tree);
      tree.clear();
    }
    //create binary tree
    tree = av.ds.rbtree({center: true, visible: true, nodegap: 5});
    tree.root().addClass("emptynode");
    tree.layout();
    clickHandler.addTree(tree, {
      onDrop: function () {
        this.removeClass("emptynode");
        this.addEmptyNodes();
        tree.layout();
      },
      onSelect: function () {
        //fake select the node
        if (clickHandler.selNode) {
          clickHandler.selNode.removeClass("selected");
          if (clickHandler.selNode === this) {
            //deselect
            clickHandler.selNode = null;
            return false;
          }
        }
        this.addClass("selected");
        clickHandler.selNode = this;
        return false;
      }
    });

    return tree;
  }

  function modelSolution(jsav) {
    var modelTree = jsav.ds.rbtree({center: true, visible: true, nodegap: 5});
    modelTree.root().addClass("emptynode");
    modelTree.layout();

    jsav._undo = [];

    for (var i = 0; i < insertSize; i++) {
      //find emptynode where the value will be inserted
      var node = modelTree.insert(insertValues[i]).removeClass("emptynode");
      modelTree.addEmptyNodes();
      modelTree.layout();
      jsav.stepOption("grade", true);
      jsav.step();
      // fix the tree by recoloring nodes and performing rotations
      if (node.repair() !== false) {
        modelTree.layout();
        if (i === insertSize - 1) {
          jsav.stepOption("grade", true);
        }
        jsav.step();
      }
    }

    return modelTree;
  }

  // create buttoncontainer if it doesn't exist
  if ($("#buttoncontainer").length === 0) {
    $("#jsavcontainer .jsavcanvas").prepend(
      '<div id="buttoncontainer" style="margin: auto; text-align: center; padding: 15px">' +
      '  <button id="buttonL">Single Rotation Left</button>' +
      '  <button id="buttonLR">Double Rotation LR</button>' +
      '  <button id="buttonRL">Double Rotation RL</button>' +
      '  <button id="buttonR">Single Rotation Right</button>' +
      '<br>' +
      '<button id="buttonColor">Toggle Color</button>' +
      '</div>');
  }

  // create stackcontainer if it doesn't exist
  if ($("#stackcontainer").length === 0) {
    $("#jsavcontainer .jsavcanvas").prepend('<div id="stackcontainer" style="margin: auto; padding: 15px"></div>');
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

  var exercise = av.exercise(modelSolution, initialize,
                             { compare: {css: "background-color"},
                               feedback: "atend", grader: "finder"});
  exercise.reset();

  function clickAction(node, rotateFunction) {
    if (!node || node.container !== tree) {
      window.alert("Please, select a node first!");
      return;
    }
    if (rotateFunction.call(node) === false) {
      window.alert("Unable to perform this rotation on the selected node!");
      return;
    }
    clickHandler.selNode = null;
    node.removeClass("selected");
    tree.layout();
    exercise.gradeableStep();
  }

  var btn = JSAV._types.ds.BinaryTreeNode.prototype;
  $("#buttonL").click(function () {
    clickAction(clickHandler.selNode, btn.rotateLeft);
  });
  $("#buttonLR").click(function () {
    clickAction(clickHandler.selNode, btn.rotateLR);
  });
  $("#buttonRL").click(function () {
    clickAction(clickHandler.selNode, btn.rotateRL);
  });
  $("#buttonR").click(function () {
    clickAction(clickHandler.selNode, btn.rotateRight);
  });
  $("#buttonColor").click(function () {
    if (!clickHandler.selNode) {
      window.alert("Select a node first!");
      return;
    }
    clickHandler.selNode.toggleColor();
    exercise.gradeableStep();
  });
  av.container.find(".jsavexercisecontrols input[name='undo']").click(function () {
    clickHandler.selNode = null;
  });

}(jQuery));