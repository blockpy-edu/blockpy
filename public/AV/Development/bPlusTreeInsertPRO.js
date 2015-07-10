/* global ODSA, PARAMS, ClickHandler */
(function ($) {
  "use strict";
  // AV variables
  var insertValues,
      tree,
      stack,
      nodeSize = parseInt(PARAMS.nodesize || 3, 10),
      insertSize = Math.min(20, parseInt(PARAMS.insertsize || nodeSize * 6, 10)),

      // Configurations
      config = ODSA.UTILS.loadConfig({av_container: "jsavcontainer"}),
      interpret = config.interpreter,
      code = config.code,
      settings = config.getSettings(),
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Create a JSAV instance
      av = new JSAV($("#jsavcontainer"), {settings: settings});

  if (nodeSize < 2) {
    window.alert("Split doesn't work correctly for internal nodes when" +
      " nodesize is less than 2.\n Nodesize has been set to 2.");
    nodeSize = 2;
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
      if (this.childnodes.length) { return; }
      insertAndSplit(this, stack);
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

    while (modelStack.size()) {
      // the value we are inserting
      var val = modelStack.first().value();
      jsav.umsg(interpret("av_ms_search"), {fill: {val: val}});
      // find the node
      var node = modelTree.root();
      while (node.childnodes.length) {
        // the position of the next child we want to explore
        var pos = node.value().filter(keyFilter).length;
        node = node.child(pos);
      }
      // insert the value into the found node
      jsav.umsg(interpret("av_ms_insert"), {fill: {val: val}});
      insertAndSplit(node, modelStack);
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

  function updateStack(stack) {
    if (!stack) { return; }
    stack.removeFirst();
    stack.layout();
  }

  // TODO: shorten or split this function
  function insertAndSplit(node, stackOrValue) {
    var stack, val;
    if (typeof stackOrValue === "number") {
      val = stackOrValue;
    } else {
      stack = stackOrValue;
      val = stack.first().value();
    }
    // return if stack is empty
    if (stack && !stack.size()) { return; }
    // set variable values
    var tree = node.container,
        av = tree.jsav,
        nodeSize = tree.options.nodesize,
        parent = node.parent(),
        newValues = node.value().concat(val).sort(function (a, b) {
          if (a === "") { a = 1000; }
          if (b === "") { b = 1000; }
          return a - b;
        }),
        sliceInd = (stack ? Math.floor(nodeSize / 2) + 1 : Math.ceil((nodeSize + 2) / 2)),
        left = newValues.slice(0, sliceInd),
        right = newValues.slice(sliceInd);
    // if there is empty space in the node
    // insert the value and return
    if (!isFull(node)) {
      node.value(newValues);
      if (stack) { // if we are in a leaf node
        updateStack(stack);
        av.gradeableStep();
      }
      return;
    }
    // else -> node is full, start splitting
    // if there is no parent we are in the root node
    // -> create new root node and set 'node' as child of new root
    if (!parent) {
      parent = tree.newNode(new Array(nodeSize).join(",").split(","));
      tree.root(parent, {hide: false});
      parent.addChild(node);
    }
    // create a new node and give the right half of the values to it
    var newNode = tree.newNode(right, parent),
        parentChildIndex = parent.childnodes.indexOf(node),
        newParentChildNodes = parent.childnodes.slice(0),
        newParentValue;
    // add the new node to the parents child node array
    newParentChildNodes.splice(parentChildIndex + 1, 0, newNode);
    // set the new child nodes to the parent
    parent._setchildnodes(newParentChildNodes);
    // if the split node was a non-leaf node
    if (node.childnodes.length) {
      // give half of the child nodes to the new node
      var childSliceInd = Math.ceil((nodeSize + 2) / 2),
          leftChildren = node.childnodes.slice(0, childSliceInd),
          rightChildren = node.childnodes.slice(childSliceInd);
      node._setchildnodes(leftChildren);
      rightChildren.forEach(function (node) {
        node.parent(newNode);
      });
      newNode._setchildnodes(rightChildren);
      // give new values for the parent node
      newParentValue = left[sliceInd - 1];
      // remove the value that was given to the parent node from 'node'
      left[sliceInd - 1] = "";
    } else {
      // give new values for the parent node
      newParentValue = right[0];
    }
    // give the left half of the values to node
    node.value(left);
    // position the new node on top of node
    newNode.element.position({of: node.element});
    // insert new values for the parent node
    insertAndSplit(parent, newParentValue);
    // if we are in a leaf node
    if (stack) {
      // update the stack
      updateStack(stack);
      // call the layout function
      tree.layout();
      // end step and make it gradeable
      av.gradeableStep();
    }
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
