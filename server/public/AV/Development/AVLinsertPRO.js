/* global ODSA, ClickHandler */
(function ($) {
  "use strict";
  // AV variables
  var insertValues,
      tree,
      stack,
      insertSize = 10,
      clickHandler,

      // Configurations
      config = ODSA.UTILS.loadConfig({av_container: "jsavcontainer"}),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"));

  av.recorded(); // we are not recording an AV with an algorithm

  av.code(code, codeOptions);

  function initialize() {

    av.container.find(".jsavcanvas").css("min-height", 450);

    // create clickHandler if undefined
    if (typeof clickHandler === "undefined") {
      clickHandler = new ClickHandler(av, exercise, {selectedClass: "selected", effect: "move"});
    }
    clickHandler.reset();

    // generate values for the stack
    insertValues = generateValues(insertSize, 10, 100); //No duplicates!

    // clear possible old stack and create a new one
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
    tree = av.ds.binarytree({center: true, visible: true, nodegap: 5});
    tree.root().addClass("emptynode");
    tree.layout();
    clickHandler.addTree(tree, {
      onDrop: function () {
        //add empty nodes and remove emptynode class
        this.removeClass("emptynode");
        this.addEmptyNodes();
        tree.layout();
      },
      onSelect: function () {
        //fake select the node
        if (clickHandler.selNode) {
          clickHandler.selNode.removeClass("selected");
          if (clickHandler.selNode === this) {
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
    var modelTree = jsav.ds.binarytree({center: true, visible: true, nodegap: 5});
    modelTree.root().addClass("emptynode");
    modelTree.layout();

    jsav._undo = [];

    for (var i = 0; i < insertSize; i++) {
      //find emptynode where the value will be inserted
      var node = modelTree.root();
      var val = insertValues[i];
      while (!node.hasClass("emptynode")) {
        if (val <= node.value()) {
          node = node.left();
        } else {
          node = node.right();
        }
      }
      jsav.umsg(interpret("av_ms_insert"), { fill: { val: val } });
      node.value(val);
      node.removeClass("emptynode");
      node.highlight();
      node.addEmptyNodes(node);
      modelTree.layout();
      jsav.stepOption("grade", true);
      jsav.step();
      node.unhighlight();

      //perform rotation
      node = modelTree.getUnbalancedNode(val);
      if (node) {
        jsav.umsg(interpret("av_ms_unbalanced"));
        node.highlight();
        jsav.step();
        jsav.umsg(interpret("av_ms_rotation"));
        node.balance();
        node.unhighlight();
        modelTree.layout();
        jsav.stepOption("grade", true);
        jsav.step();
      }
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

  // create exercise and reset it
  var exercise = av.exercise(modelSolution, initialize, {feedback: "atend"});
  exercise.reset();

  // function to be called when a button is clicked
  function clickAction(node, rotateFunction) {
    if (!node || node.container !== tree) {
      window.alert(interpret("av_select_node"));
      return;
    }
    if (rotateFunction.call(node) === false) {
      window.alert(interpret("av_cannot_rotate"));
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

  av.container.find(".jsavexercisecontrols input[name='undo']").click(function () {
    clickHandler.selNode = null;
  });

}(jQuery));