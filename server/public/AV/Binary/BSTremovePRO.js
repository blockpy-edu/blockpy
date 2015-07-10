"use strict";
/*global alert: true, BST, ODSA, PARAMS */
$(document).ready(function () {
  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Set click handlers
  $("#about").click(about);

  function initialize() {
    BST.turnAnimationOff();
    if (stack) {
      stack.clear();
    }
    stack = av.ds.stack({center: true, xtransition: 5, ytransition: -3});

    function dataTest(array) {
      var bst = av.ds.binarytree();
      bst.insert(array);
      var result = bst.height() <= maxHeight;
      bst.clear();
      return result;
    }

    //clear old binary tree
    if (jsavTree) {
      jsavTree.clear();
    }
    //generate random tree
    jsavTree = av.ds.binarytree({center: true, visible: true, nodegap: 15});
    do {
      initialArray = [];
      perfectBinTree(initialArray, 1, 10, 100, 3, 1);
      initialArray = initialArray.concat(JSAV.utils.rand.numKeys(10, 100, treeSize - 7));
    } while (!dataTest(initialArray));
    jsavTree.insert(initialArray);
    jsavTree.click(clickHandler);
    jsavTree.layout();

    //pick the values to delete and push them in the stack
    for (var i = 0; i < deleteSize; i++) {
      deleteValues[i] = initialArray[Math.floor(treeSize - 1 - i * (treeSize - 1) / (deleteSize - 1))];
      stack.addLast(deleteValues[i]);
    }
    stack.first().highlight();
    stack.layout();

    BST.restoreAnimationState();

    return jsavTree;
  }

  function modelSolution(av) {
    //helper function for finding the node
    //naive because path and node are guaranteed to exist
    function find(val) {
      var node = modelTree.root();
      while (node.value() !== val) {
        if (val < node.value()) {
          node = node.left();
        } else {
          node = node.right();
        }
      }
      return node;
    }

    //helper function for finding replacing node
    //if no left child the function will return undefined
    function findReplacingNode(root) {
      if (!root.left() !== !root.right()) {
        //only one child -> return child
        if (root.left()) {
          return root.left();
        } else {
          return root.right();
        }
      }
      var node = root.left();
      if (!node) {
        return undefined;
      }
      while (node.right()) {
        node = node.right();
      }
      return node;
    }

    //higlights and unhighlights a path between root and node
    function highlightPath(root, node, undo) {
      var n = node;
      var css;
      while (n !== root) {
        if (undo) {
          n.edgeToParent().removeClass("blueline");
	} else {
          n.edgeToParent().addClass("blueline");
	}
        n = n.parent();
      }
    }

    var modelStack = av.ds.stack({center: true});
    var i;
    for (i = 0; i < deleteSize; i++) {
      modelStack.addLast(deleteValues[i]);
    }
    modelStack.layout();

    var modelTree = av.ds.binarytree({center: true, visible: true, nodegap: 10});

    modelTree.insert(initialArray);
    modelTree.layout();

    av._undo = [];

    for (i = 0; i < deleteSize; i++) {
      //highlight the value which should be deleted
      modelStack.first().highlight();
      //node which should be deleted
      var node = find(deleteValues[i]);
      //highlight node
      node.highlight();
      //add step
      av.step();

      while (node) {
        //find possible empty node between node and root
        var empty = node;
        while (empty !== null && empty.value() !== "") {
          empty = empty.parent();
        }

        //if an empty node is found with only one child, replace the empty node with node
        //if the empty node has two children move the value of node into the empty node
        if (empty) {
          //unhighlight path
          highlightPath(empty, node, true);
          if (!empty.right() !== !empty.left()) {
            //replace node with node
            if (empty.parent().left() === empty) {
              empty.parent().left(node.remove({hide: false}));
            } else {
              empty.parent().right(node.remove({hide: false}));
            }
            modelTree.layout();
            av.stepOption("grade", true);
            av.step();
            break;
          } else {
            //insert value of node into empty node
            av.effects.moveValue(node, empty);
            empty.unhighlight();
          }
        }
        //empty this node
        node.value("");
        //if no children, remove node and move on
        if (!node.left() && !node.right()) {
          node.remove();
          modelTree.layout();
          node = null;
        } else {
          var rep = findReplacingNode(node);
          if (rep) {
            highlightPath(node, rep);
          }
          node = rep;
        }
        av.stepOption("grade", true);
        av.step();

      }

      //remove node from stack
      modelStack.removeFirst();
    }

    return modelTree;
  }


  function highlightNext() {
    stack.removeFirst();
    stack.layout();
    //higlight the next one
    if (stack.size()) {
      stack.first().highlight();
    }
  }

  var clickHandler = function () {
    if (stack.size() && !this.hasClass("jsavnullnode")) {
      //find possible empty node between this and root
      var empty = this;
      while (empty !== null && empty.value() !== "") {
        empty = empty.parent();
      }

      //if an empty node is found with only one child, replace the empty node with this
      //if the empty node has two children move the value of this into the empty node
      if (empty) {
        if (!empty.right() !== !empty.left()) {
          //replace node with this
          BST.turnAnimationOff();
          if (empty.parent().left() === empty) {
            empty.parent().left(this);
          } else {
            empty.parent().right(this);
          }
          this.show();
          BST.restoreAnimationState();
          jsavTree.layout();
          highlightNext();
          exercise.gradeableStep();
          return;
        } else {
          //insert value of this into empty node
          av.effects.moveValue(this, empty);
        }
      }
      //empty this node
      this.value("");
      //if no children, remove node and move on
      if (!this.left() && !this.right()) {
        this.remove();
        jsavTree.layout();
        highlightNext();
      }
      exercise.gradeableStep();
    }
  };

  // helper function for creating a perfect binary tree
  function perfectBinTree(arr, level, min, max, levelsInTotal, arrayIndex) {
    var diff = max - min;
    var value = JSAV.utils.rand.numKey(min + Math.floor(diff / 3), max - Math.floor(diff / 3));
    arr[arrayIndex - 1] = value;
    if (level < levelsInTotal) {
      perfectBinTree(arr, level + 1, min, value - 1, levelsInTotal, 2 * arrayIndex);
      perfectBinTree(arr, level + 1, value + 1, max, levelsInTotal, 2 * arrayIndex + 1);
    }
  }

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////

  // AV variables
  var initialArray = [],
      deleteValues = [],
      jsavTree,
      stack,
      deleteSize = 5,          //delete 5 values/nodes
      treeSize = 20,          //20 nodes
      maxHeight = 6,
      pseudo,

      // Load the configurations created by odsaAV.js
      config = ODSA.UTILS.loadConfig({default_code: "none"}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Settings for the AV
      settings = config.getSettings(),

      // Create a JSAV instance
      av = new JSAV($(".avcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  // show a JSAV code instance only if the code is defined in the parameter
  // and the parameter value is not "none"
  if (code) {
    pseudo = av.code($.extend(codeOptions, code));
  }

  var exercise = av.exercise(modelSolution, initialize,
                             {controls: $(".jsavexercisecontrols"),
                              modelDialog: {width: 700}});
  exercise.reset();
});
