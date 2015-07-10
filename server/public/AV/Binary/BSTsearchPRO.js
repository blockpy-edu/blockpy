"use strict";
/*global alert: true, BST, ODSA, PARAMS */
$(document).ready(function () {
  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Set click handlers
  $("#about").click(about);

  // auxillary function for creating a perfect binary tree
  // inserts the values in the initialData[] array in level order
  function calculateInitialData(level, min, max, levelsInTotal, arrayIndex) {
    var diff = max - min;
    var value = JSAV.utils.rand.numKey(min + Math.floor(diff / 3),
                                       max - Math.floor(diff / 3));
    initialData[arrayIndex - 1] = value;
    if (level < levelsInTotal) {
      calculateInitialData(level + 1, min, value - 1,
                           levelsInTotal, 2 * arrayIndex);
      calculateInitialData(level + 1, value + 1,
                           max, levelsInTotal, 2 * arrayIndex + 1);
    }
  }

  function getIndex(node, root) {
    if (node === root) {
      return 0;
    }

    if (node.parent().left() === node) {
      return (getIndex(node.parent(), root) + 1) * 2 - 1;
    } else {
      return (getIndex(node.parent(), root) + 1) * 2;
    }
  }

  function initialize() {
    if (jsavBinaryTree) {
      jsavBinaryTree.clear();
    }
    jsavBinaryTree = av.ds.binarytree(
                             {center: true, visible: true, nodegap: 15});
    jsavBinaryTree.root("?");
    jsavBinaryTree.root().addClass("emptynode");
    jsavBinaryTree.click(clickHandler);
    jsavBinaryTree.layout();

    calculateInitialData(1, 100, 1000, levels, 1);
    keyToFind = initialData[JSAV.utils.rand.numKey(Math.floor(nodeNum / 2), nodeNum)];
    $key.html("<li>" + keyToFind + "</li>");
    av.ds.array($key, {indexed: false}).css(0, {"background-color": "#ddf"}).toggleArrow(0);

    // set min-height for the canvas
    av.container.find(".jsavcanvas").css("min-height", 442);

    return jsavBinaryTree;
  }

  function modelSolution(av) {
    av.ds.array([keyToFind], {indexed: false}).css(0, {"background-color": "#ddf"});
    var modelTree = av.ds.binarytree({center: true, visible: true, nodegap: 15});
    av._undo = [];

    modelTree.root("?");
    modelTree.root().addClass("emptynode");
    modelTree.layout();

    var node = modelTree.root();

    while (node.value() !== keyToFind) {
      var index = getIndex(node, modelTree.root());
      node.removeClass("emptynode");
      node.value(initialData[index]);
      node.highlight();
      if ((index + 1) * 2 < nodeNum) {
        node.left("?");
        node.left().addClass("emptynode");
        node.right("?");
        node.right().addClass("emptynode");
        if (node.value() > keyToFind) {
          node = node.left();
        } else {
          node = node.right();
        }
      }
      modelTree.layout();
      av.stepOption("grade", true);
      av.step();
    }

    return modelTree;
  }

  var clickHandler = function () {
    if (!this.isHighlight()) {
      var index = getIndex(this, jsavBinaryTree.root());
      this.removeClass("emptynode");
      this.value(initialData[index]);
      this.highlight();
      if ((index + 1) * 2 < nodeNum) {
        BST.turnAnimationOff();
        this.left("?");
        this.left().addClass("emptynode");
        this.right("?");
        this.right().addClass("emptynode");
        BST.restoreAnimationState();
      }
      jsavBinaryTree.layout();
      exercise.gradeableStep();
    }
  };


  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////

  // AV variables
  var levels = 6,
      nodeNum = Math.pow(2, levels) - 1,
      keyToFind,
      pseudo,
      initialData = [],
      jsavBinaryTree,
      $key = $('#keyToFind'),

      // Load the configurations created by odsaAV.js
      config = ODSA.UTILS.loadConfig({default_code: "none"}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Settings for the AV
      settings = new config.getSettings(),

      // create a JSAV instance
      av = new JSAV($(".avcontainer"), {settings: settings});

  av.recorded(); // we are not recording an AV with an algorithm

  // show a JSAV code instance only if the code is defined in the parameter
  // and the parameter value is not "none"
  if (code) {
    pseudo = av.code($.extend(codeOptions, code));
  }

  var exercise = av.exercise(modelSolution, initialize,
                             { compare: [{ "css": "background-color" }, {}],
                               controls: $(".jsavexercisecontrols") });
  exercise.reset();
});
