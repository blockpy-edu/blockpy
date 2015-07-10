/* global ODSA */
(function ($) {
  "use strict";
  // AV variables
  var initialArray,
      tree,
      treeSize = 25,

      // Load the configurations created by odsaAV.js
      config = ODSA.UTILS.loadConfig({av_container: "jsavcontainer"}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  av.code(code, codeOptions);

  function initialize() {

    initialArray = generateValues(treeSize, 10, 100); //No duplicates!

    //clear old binary tree
    if (tree) {
      tree.clear();
    }
    //create binary tree
    tree = av.ds.rbtree({center: true, visible: true, nodegap: 5});
    for (var i = 0; i < treeSize; i++) {
      //find emptynode where the value will be inserted
      var node = tree.insert(initialArray[i]);
      // fix the tree by recoloring nodes and performing rotations
      node.repair();
    }
    colorTreeRed(tree.root());
    tree.layout();
    tree.click(function () {
      this.toggleColor();
    });
    
    return tree;
  }

  function modelSolution(jsav) {
    var modelTree = jsav.ds.rbtree({center: true, visible: true, nodegap: 5});

    jsav._undo = [];

    for (var i = 0; i < treeSize; i++) {
      //find emptynode where the value will be inserted
      var node = modelTree.insert(initialArray[i]);
      // fix the tree by recoloring nodes and performing rotations
      node.repair();
      modelTree.layout();
    }
    jsav.stepOption("grade", true);
    jsav.step();
    jsav.umsg(interpret("av_ms_example"));
    jsav.displayInit();

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

  function colorTreeRed(node) {
    if (!node) {
      return;
    }
    node.colorRed();
    colorTreeRed(node.left());
    colorTreeRed(node.right());
  }

  function blackNodesBetweenRootAndLeaves(root) {
    if (!root) {
      return 0;
    }
    var left = blackNodesBetweenRootAndLeaves(root.left());
    var right = blackNodesBetweenRootAndLeaves(root.right());
    if (left === right && left !== -1) {
      return left + (root.hasClass("blacknode") ? 1 : 0);
    } else {
      return -1;
    }
  }

  function redHaveOnlyBlackChildren(root) {
    if (!root) {
      return true;
    }
    if (!redHaveOnlyBlackChildren(root.left())) {
      return false;
    }
    if (!redHaveOnlyBlackChildren(root.right())) {
      return false;
    }
    if (root.isRed() &&
      (
        (root.left() && root.left().isRed()) ||
        (root.right() && root.right().isRed())
      )
    ) {
      return false;
    }
    return true;
  }

  JSAV._types.Exercise.prototype.grade = function () {
    var score = 0;
    //black root
    score += tree.root().hasClass("blacknode") ? 1 : 0;
    //paths from the leaves to the roots have an equal amount of black nodes
    score += blackNodesBetweenRootAndLeaves(tree.root()) > 0 ? 1 : 0;
    //red nodes only have black children 
    score += redHaveOnlyBlackChildren(tree.root()) ? 1 : 0;

    score = score === 3 ? 1 : 0;
    
    this.score = {
      correct: score,
      fix: 0,
      student: score,
      total: 1,
      undo: 0
    };
    return this.score;
  };

  var exercise = av.exercise(modelSolution, initialize, {
    compare: { css: "background-color" },
    modelDialog: { minWidth: "700px" },
    feedback: "atend"
  });
  exercise.reset();

}(jQuery));