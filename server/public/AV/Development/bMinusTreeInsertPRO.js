/* global ODSA, PARAMS, ClickHandler */
(function ($) {
  "use strict";
  // AV variables
  var insertValues,
      tree,
      stack,
      nodeSize = parseInt(PARAMS.nodesize || 3, 10),
      insertSize = Math.min(20, parseInt(PARAMS.insertsize || nodeSize * 4, 10)),

      // Configurations
      config = ODSA.UTILS.loadConfig({av_container: "jsavcontainer"}),
      interpret = config.interpreter,
      code = config.code,
      settings = config.getSettings(),
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"), {settings: settings});

  if (nodeSize < 3) {
    window.alert("Split doesn't work correctly for internal nodes when" +
      " nodesize is less than 3.\n Nodesize has been set to 3.");
    nodeSize = 3;
  }

  av.recorded(); // we are not recording an AV with an algorithm

  av.code(code, codeOptions);

  function initialize() {

    av.container.find(".jsavcanvas").css("min-height", 450);

    // generate values for the stack
    insertValues = generateValues(insertSize, 10, 100); //No duplicates!

    // clear possible old stack and create a new one
    if (stack) {
      stack.clear();
    }
    var $stackcontainer = $("#stackcontainer");
    stack = av.ds.stack(insertValues, {center: true, element: $stackcontainer.append("<div></div>").find("div")});
    stack.layout();
    $stackcontainer.css("min-height", $stackcontainer.height());

    //clear old binary tree
    if (tree) {
      tree.clear();
    }
    //create binary tree
    tree = new av.ds.arraytree({nodesize: nodeSize});

    tree.layout();

    tree.click(function (index) {
      if (isFull(this)) {
        // click on non-leaf node -> split this node
        splitNode(this);
      } else {
        // insert value to node
        insertValueToNode(this, stack);
      }
    });

    return tree;
  }

  function modelSolution(jsav) {
    var modelStack = jsav.ds.stack(insertValues, { center: true });
    modelStack.layout();
    var modelTree = jsav.ds.arraytree(3);
    modelTree.layout();

    jsav.displayInit();

    function keyFilter(v) { return v && v <= val; }
    function checkAndSplit(node) {
      if (isFull(node)) {
        jsav.umsg(interpret("av_ms_split"));
        splitNode(node);
        return true;
      }
      return false;
    }
    while (modelStack.size()) {
      // the value we are inserting
      var val = modelStack.first().value();
      jsav.umsg(interpret("av_ms_search"), {fill: {val: val}});
      // find the node
      var node = modelTree.root();
      do {
        if (!node.hasClass("ms-highlight")) {
          node.addClass("ms-highlight");
        }
        jsav.step();
        // split the node if it is full
        if (checkAndSplit(node)) {
          node = node.parent();
        }
        if (node.childnodes.length) {
          // the position of the next child we want to explore
          var pos = node.value().filter(keyFilter).length;
          node.removeClass("ms-highlight");
          node = node.child(pos);
          node.addClass("ms-highlight");
        }
      } while (node.childnodes.length || isFull(node));
      // insert the value into the found node
      jsav.umsg(interpret("av_ms_insert"), {fill: {val: val}});
      insertValueToNode(node, modelStack);
      if (node !== tree.root()) {
        node.removeClass("ms-highlight");
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

  function isFull(node) {
    return node.value().every(function (v) { return typeof v === "number"; });
  }

  function splitNode(node) {
    var tree = node.container,
        av = tree.jsav,
        nodeSize = tree.options.nodesize,
        parent = node.parent(),
        arr = node.value(),
        sliceInd = Math.ceil(nodeSize / 2),
        left = arr.slice(0, sliceInd),
        right = arr.slice(sliceInd);
    // if there is no parent we are in the root node
    // -> create new root node and set 'node' as child of new root
    if (!parent) {
      parent = tree.newNode(new Array(nodeSize).join(",").split(","));
      tree.root(parent, {hide: false});
      parent.addChild(node);
    }
    // create a new node and give the right half to it
    var newNode = tree.newNode(right, parent),
        parentChildIndex = parent.childnodes.indexOf(node),
        newParentValues = parent.value().slice(0, -1),
        newParentChildNodes = parent.childnodes.slice(0);
    // add the new node to the parents child node array
    newParentChildNodes.splice(parentChildIndex + 1, 0, newNode);
    // set the new child nodes to the parent
    parent._setchildnodes(newParentChildNodes);
    // if the split node was a non-leaf node
    if (node.childnodes.length) {
      // give half of the child nodes to the new node
      var childSliceInd = Math.floor((nodeSize + 1) / 2),
          leftChildren = node.childnodes.slice(0, childSliceInd),
          rightChildren = node.childnodes.slice(childSliceInd);
      node._setchildnodes(leftChildren);
      rightChildren.forEach(function (node) {
        node.parent(newNode);
      });
      newNode._setchildnodes(rightChildren);
      // give new values for the parent node
      newParentValues.splice(parentChildIndex, 0, left[sliceInd - 1]);
      // remove the value that was given to the parent node from 'node'
      left[sliceInd - 1] = "";
    } else {
      // give new values for the parent node
      newParentValues.splice(parentChildIndex, 0, right[0]);
    }
    // give the left half of the values to node
    node.value(left);
    // set new values for the parent node
    parent.value(newParentValues);
    // position the new node on top of node
    newNode.element.position({of: node.element});
    // move ms-highlight class to parent node if it exists
    if (node.hasClass("ms-highlight")) {
      node.removeClass("ms-highlight");
      node.parent().addClass("ms-highlight");
    }
    // call the layout function
    tree.layout();
    av.gradeableStep();
  }

  function insertValueToNode(node, stack) {
    if (!stack.size()) { return; } // return if stack is empty
    var newValues = node.value().slice(0, -1).concat(stack.first().value()).sort(function (a, b) {
      if (a === "") { a = 1000; }
      if (b === "") { b = 1000; }
      return a - b;
    });
    node.value(newValues);
    stack.removeFirst();
    stack.layout();
    stack.jsav.gradeableStep();
  }

  // create exercise and reset it
  var exercise = av.exercise(modelSolution, initialize, {
    feedback: "atend",
    modelDialog: {
      width: 750
    }
  });
  exercise.reset();

}(jQuery));
