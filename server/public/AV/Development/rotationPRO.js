/* global ODSA, PARAMS, console */
(function ($) {
  "use strict";
  var initialArray = [],
      tree,
      treeNodes,
      nodeSelected,
      selectedNode,
      selectedPointer,
      rotationType = PARAMS.rotation || "single",
      difficulty = PARAMS.diff || "hard",
      $layoutButton = $("#layoutButton"),
      $nullButton = $("#nullButton"),
      $gradeButton,
      hasCheckedModelAnswer = false,
      config = ODSA.UTILS.loadConfig({'av_container': 'jsavcontainer'}),
      interpret = config.interpreter,
      code = config.code,
      pseudo,
      av = new JSAV($("#jsavcontainer"));

  if (code) {
    pseudo = av.code($.extend({after: {element: $(".instructions")}}, code[rotationType]));
  } else {
    pseudo = av.code();
  }

  if (code && code.struct) {
    av.code($.extend({after: {element: $(".instructions")}}, code.struct));
  }

  function initialize() {

    // clear old structures
    if (tree) {
      tree.element.remove();
    }
    if (nodeSelected) {
      nodeSelected.clear();
    }
    if (selectedPointer) {
      selectedPointer.clear();
    }

    // create binary pointer tree
    tree = av.ds.binarypointertree({center: true, visible: true, nodegap: 15});
    initialArray = unbalancedTree({
      minNodes: 12,
      maxNodes: 18,
      maxHeight: 8,
      rotationType: rotationType,
      difficulty: difficulty
    });
    tree.insert(initialArray);
    treeNodes = getNodes(tree);
    tree.click(clickHandler);
    tree.layout();

    // jsav variable
    // not selected  0
    // selected      1 
    nodeSelected = av.variable(0);
    selectedPointer = av.variable(0);

    // disable the grade button and enable the layout button
    $gradeButton = $(".jsavexercisecontrols input[name='grade']");
    $gradeButton.attr("disabled", true);
    $layoutButton.attr("disabled", false);
    // set hasCheckedModelAnswer to false
    hasCheckedModelAnswer = false;
    
    return tree;
  }

  function modelSolution(jsav) {
    var msTree = jsav.ds.binarypointertree({center: true, visible: true, nodegap: 15});
    msTree.insert(initialArray);
    msTree.layout();

    jsav.displayInit();

    var last = initialArray[initialArray.length - 1],
        unbalancedNode = msTree.getUnbalancedNode(last),
        lastInserted = unbalancedNode;

    while (lastInserted.left() || lastInserted.right()) {
      if (lastInserted.value() >= last) {
        lastInserted = lastInserted.left();
      } else {
        lastInserted = lastInserted.right();
      }
    }

    // highlight the last inserted node
    lastInserted.addClass("highlighted");
    jsav.umsg(interpret("av_ms_last"));
    jsav.step();

    // unhighlight the last inserted node and hightlight the unbalanced node
    lastInserted.removeClass("highlighted");
    unbalancedNode.addClass("highlighted");
    jsav.umsg(interpret("av_ms_unbalanced"));
    jsav.step();

    // balance the tree
    unbalancedNode.removeClass("highlighted");
    unbalancedNode.balance();
    msTree.layout();
    jsav.umsg(interpret("av_ms_after_rotation"));

    jsav.gradeableStep();

    return msTree;
  }

  // generates an array which can be inserted to a tree so that it will be unbalanced tree
  function unbalancedTree(options) {
    var defaults = {
      minNodes: 7,
      maxNodes: 10,
      maxHeight: 6,
      rotationType: "single",
      difficulty: "hard"
    };

    options = $.extend({}, defaults, options);

    if (["single", "double"].indexOf(options.rotationType) === -1) {
      console.warn("Rotation type \"" + options.rotationType + "\" does not exist. Falling back to single rotation.");
      options.rotationType = "single";
    }
    if (["easy", "hard"].indexOf(options.difficulty) === -1) {
      console.warn("Difficulty \"" + options.difficulty + "\" does not exist. Falling back to hard difficulty.");
      options.difficulty = "hard";
    }
    
    while (true) {
      var arr = [];
      var bt = av.ds.binarytree();
      for (var i = 0; i < options.maxNodes; i++) {
        var rand;
        do {
          rand = JSAV.utils.rand.numKey(10, 100);
        } while ($.inArray(rand, arr) !== -1);
        arr[i] = rand;
        bt.insert(arr[i]);
        if (bt.height() > options.maxHeight) {
          bt.clear();
          break;
        }
        var node = bt.getUnbalancedNode(arr[i]);
        if (node &&
            getRotationType(node) === options.rotationType &&
            node !== bt.root() &&
            i >= options.minNodes &&
             ((options.difficulty === "hard" && node.left() && node.right()) ||
              (options.difficulty === "easy" && !(node.left() && node.right()))))
        {
          bt.clear();
          return arr; //done
        } else if (node) {
          // wrong kind of rotation or not enough nodes -> balance tree
          node.balance();
          treeToArray(bt.root(), arr);
        }
      }
      bt.clear();
    }
  }

  function getRotationType(node) {
    if ((height(node.left()) > height(node.right()) &&
      height(node.left().left()) > height(node.left().right())) ||
      (height(node.right()) > height(node.left()) &&
      height(node.right().right()) > height(node.right().left()))) {
      return "single";
    } else {
      return "double";
    }
  }

  // returns the height of the node and 0 if node is undefined/null
  function height(node) {
    if (node) {
      return node.height();
    }
    return 0;
  }

  // writes the tree in preorder
  function treeToArray(root, arr, index) {
    index = index || 0;
    arr[index] = root.value();
    if (root.left()) {
      index = treeToArray(root.left(), arr, index + 1);
    }
    if (root.right()) {
      index = treeToArray(root.right(), arr, index + 1);
    }
    return index;
  }

  // returns an array with all the nodes in the tree
  function getNodes(tree) {
    var root = tree.root(),
        stack = [root],
        i = 0;

    while (stack[i]) {
      var node = stack[i];
      if (node.left()) {
        stack.push(node.left());
      }
      if (node.right()) {
        stack.push(node.right());
      }
      i++;
    }
    return stack;
  }

  // returns a string with errors
  function getErrors(tree) {
    var root = tree.root(),
        stack = [root],
        visited = [],
        errors = "";

    while (stack[0]) {
      var node = stack.shift();
      if (visited.indexOf(node) !== -1) {
        // multiple parents, possible loop
        errors += interpret("av_too_many_parents").replace("{val}", node.value()) + "\n";
        node.addClass("loop");
      } else {
        if (node.left()) {
          stack.push(node.left());
        }
        if (node.right()) {
          stack.push(node.right());
        }
        visited.push(node);
      }
    }
    var unvisited = initialArray.length - visited.length;
    if (unvisited) {
      if (unvisited === 1) {
        errors += interpret("av_1_not_part_of_tree") + "\n";
      } else {
        errors += interpret("av_not_part_of_tree").replace("{num}", unvisited) + "\n";
      }
      for (var i = 0; i < treeNodes.length; i++) {
        if (visited.indexOf(treeNodes[i]) === -1) {
          treeNodes[i].addClass("loose");
        }
      }
    }
    return errors;
  }

  // JSAV undoable functions for enabling and disabling jQuery buttons
  var enableButton = JSAV.utils.getUndoableFunction(
    av,
    function (button) { button.attr("disabled", false); },
    function (button) { button.attr("disabled", true); }
  );
  var disableButton = JSAV.utils.getUndoableFunction(
    av,
    function (button) { button.attr("disabled", true); },
    function (button) { button.attr("disabled", false); }
  );

  // click handler for binary pointer tree nodes
  var clickHandler = function (event) {
    if (this.value() === "jsavnull" || $layoutButton.attr("disabled")) {
      return;
    }
    if (nodeSelected.value()) {
      if (this !== selectedNode) {
        selectedNode.child(selectedPointer.value(), this, {hide: false});
        selectedNode.pointers[selectedPointer.value()].layout();
        av.step();
      }
      selectedNode.removeClass("selected-left");
      selectedNode.removeClass("selected-right");
      selectedNode = null;
      nodeSelected.value(0);
      $nullButton.attr("disabled", true);
    } else {
      if (event.target.className.indexOf("jsavpointerarea") !== -1) {
        selectedNode = this;
        nodeSelected.value(1);
        $nullButton.attr("disabled", false);
        if (event.target.className.indexOf("left") !== -1) {
          selectedPointer.value(0);
          this.addClass("selected-left");
        } else {
          selectedPointer.value(1);
          this.addClass("selected-right");
        }
      }
    }
  };

  // change the language on the buttons
  $layoutButton.html(interpret("av_redraw"));
  $nullButton.html(interpret("av_null"));

  // add click handlers
  $layoutButton.click(function () {
    for (var i = 0; i < treeNodes.length; i++) {
      treeNodes[i].removeClass("loop");
      treeNodes[i].removeClass("loose");
    }
    var errors = getErrors(tree);
    if (errors) {
      window.alert(interpret("av_error") + "\n" + errors);
      return;
    }
    tree.layout();
    exercise.gradeableStep();
    disableButton($layoutButton);
    // don't enable the grade button if the user has checked the model answer
    if (!hasCheckedModelAnswer) {
      enableButton($gradeButton);
    }
  });
  $nullButton.click(function () {
    if (nodeSelected.value()) {
      selectedNode.child(selectedPointer.value(), null, {hide: false});
      av.step();
      selectedNode.removeClass("selected-left");
      selectedNode.removeClass("selected-right");
      selectedNode = null;
      nodeSelected.value(0);
      $nullButton.attr("disabled", true);
    }
  });

  // set hasCheckedModelAnswer to true when the user opens the model answer
  $("body").on("jsav-log-event", function (event, eventData) {
    if (eventData.type === "jsav-exercise-model-open") {
      hasCheckedModelAnswer = true;
    }
  });

  var exercise = av.exercise(modelSolution, initialize, {
    feedback: "atend",
    modelDialog: {width: 780}
  });
  exercise.reset();
}(jQuery));
