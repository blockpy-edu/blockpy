/*global alert: true, console: true, ODSA, PARAMS */
"use strict";
$(document).ready(function () {
  // Process help button: Give a full help page for this activity
  function help() {
    window.open("btTravHelpPRO.html", "helpwindow");
  }

  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  function comp(a, b) {
    return a - b;
  }

  JSAV._types.ds.BinaryTree.prototype.insert = function (value) {
    // helper function to recursively insert
    var ins = function (node, insval) {
      var val = node.value();
      if (!val || val === "jsavnull") { // no value in node
        node.value(insval);
      } else if (comp(val, insval) > 0) { // go left
        if (node.left()) {
          ins(node.left(), insval);
        } else {
          node.left(insval);
        }
      } else { // go right
        if (node.right()) {
          ins(node.right(), insval);
        } else {
          node.right(insval);
        }
      }
    };
    if ($.isArray(value)) { // array of values
      for (var i = 0, l = value.length; i < l; i++) {
        ins(this.root(), value[i]);
      }
    } else {
      ins(this.root(), value);
    }
    return this;
  };
  
  var postOrderTraversal = function () {
    var i = 0,
        av = this.jsav;
    var postorderNode = function (node) {
      if (node.left()) {
        postorderNode(node.left());
      }
      if (node.right()) {
        postorderNode(node.right());
      }
      node.highlight();
      av.label(i + 1, {relativeTo: node, visible: true, anchor: "right top"});
      av.stepOption("grade", true);
      av.step();
      i++;
    };
    postorderNode(this.root());
  };
  
  var preOrderTraversal = function () {
    var i = 0,
        av = this.jsav;
    var preorderNode = function (node) {
      node.highlight();
      av.label(i + 1, {relativeTo: node, visible: true, anchor: "right top"});
      i++;
      av.stepOption("grade", true);
      av.step();
      if (node.left()) {
        preorderNode(node.left());
      }
      if (node.right()) {
        preorderNode(node.right());
      }
    };
    preorderNode(this.root());
  };
  
  var inOrderTraversal = function () {
    var i = 0,
        av = this.jsav;
    var inorderNode = function (node) {
      if (node.left()) {
        inorderNode(node.left());
      }
      node.highlight();
      av.label(i + 1, {relativeTo: node, visible: true, anchor: "right top"});
      i++;
      av.stepOption("grade", true);
      av.step();
      if (node.right()) {
        inorderNode(node.right());
      }
    };
    inorderNode(this.root());
  };
  
  var levelOrderTraversal = function () {
    var i = 0,
        av = this.jsav,
        queue = [this.root()],
        curr;
    while (queue.length > 0) {
      curr = queue.shift();
      curr.highlight();
      av.label(i + 1, {relativeTo: curr, visible: true, anchor: "right top"});
      av.stepOption("grade", true);
      av.step();
      i++;
      if (curr.left()) {
        queue.push(curr.left());
      }
      if (curr.right()) {
        queue.push(curr.right());
      }
    }
  };

  JSAV._types.ds.BinaryTree.prototype.postOrderTraversal = postOrderTraversal;
  JSAV._types.ds.BinaryTree.prototype.preOrderTraversal = preOrderTraversal;
  JSAV._types.ds.BinaryTree.prototype.inOrderTraversal = inOrderTraversal;
  JSAV._types.ds.BinaryTree.prototype.levelOrderTraversal = levelOrderTraversal;
  
  JSAV._types.ds.BinaryTree.prototype.state = function (newState) {
    var state,
        i,
        queue = [this.root()],
        curr;
    if (typeof newState === "undefined") { // return the state
      // go through tree in levelorder and add true/false to the state
      // array indicating whether the node is highlighted or not
      state = [];
      while (queue.length > 0) {
        curr = queue.shift();
        state.push(curr.isHighlight());
        if (curr.left()) { queue.push(curr.left()); }
        if (curr.right()) { queue.push(curr.right()); }
      }
      return state;
    } else { // set the state
      i = 0;
      while (queue.length > 0) {
        curr = queue.shift();
        if (newState[i] && !curr.isHighlight()) {
          curr.highlight();
        } else if (!newState[i] && curr.isHighlight()) {
          curr.unhighlight();
        }
        i++;
        if (curr.left()) { queue.push(curr.left()); }
        if (curr.right()) { queue.push(curr.right()); }
      }
      return this;
    }
  };

  function modelWrapper(tt) {
    return function model(modelav) {
      var modelBst = modelav.ds.binarytree({center: true, nodegap: 15});
      modelBst.insert(tt.initData);
      modelBst.layout();
      modelav.displayInit();
      tt.modelFunction.call(modelBst);
      return modelBst;
    };
  }
  var bt;
  function initWrapper(tt) {
    return function () {
      var nodeNum = 9;
      if (bt) {
        bt.clear();
      }
      var dataTest = (function () {
        return function (dataArr) {
          var bst = tt.jsav.ds.binarytree();
          bst.insert(dataArr);
          var result = bst.height() <= 4;
          bst.clear();
          return result;
        };
      })();
      tt.jsav.canvas.find(".jsavlabel").remove();
      var initData = JSAV.utils.rand.numKeys(10, 100, nodeNum, {test: dataTest, tries: 30});
      bt = tt.jsav.ds.binarytree({center: true, visible: true, nodegap: 15});
      bt.insert(initData);
      bt.layout();
      bt.click(tt.nodeClick(tt.exercise));
      tt.bt = bt;
      tt.initData = initData;
      tt.jsav.displayInit();
      return bt;
    };
  }

  function fixFunction(modelTree) {
    // get the highlight states in model tree (see state() above)
    var modelState = modelTree.state(),
        queue = [bt.root()],
        curr,
        i = 0;
    // go through the tree in level order (like state does)
    while (queue.length > 0) {
      curr = queue.shift();
      // check if a highlight is missing
      if (modelState[i] && !curr.isHighlight()) {
        // highlight the node
        curr.highlight();
        // add a label next to the just highlighted node
        var pos = curr.jsav.canvas.find(".jsavlabel:visible").size();
        curr.jsav.label(pos + 1, {relativeTo: curr, anchor: "right top"});
      } else if (!modelState[i] && curr.isHighlight()) {
        // if we have additional highlight (shouldn't be possible due to
        // how JSAV undo works)
        curr.unhighlight();
      }
      i++;
      if (curr.left()) { queue.push(curr.left()); }
      if (curr.right()) { queue.push(curr.right()); }
    }
  }

  function TreeTraversal(modelFunction) {
    // Load the configuration created by odsaAV.js
    var config = ODSA.UTILS.loadConfig({
      "json_path": "btTravPRO.json",
      "default_code": "none"
    }),
      code = config.code;
    interpret = config.interpreter;

    this.modelFunction = modelFunction;
    var settings = config.getSettings();
    this.jsav = new JSAV($(".avcontainer"), {settings: settings});
    this.jsav.recorded();

    if (code) {
      switch (modelFunction) {
      case inOrderTraversal:
        code = code.inorder;
        break;
      case preOrderTraversal:
        code = code.preorder;
        break;
      case postOrderTraversal:
        code = code.postorder;
        break;
      case levelOrderTraversal:
        code = code.levelorder;
        break;
      }

      if (code !== config.code) {
        this.jsav.code($.extend({after: {element: $(".instructions")}, visible: true}, code));
      }
    }

    this.exercise = this.jsav.exercise(modelWrapper(this), initWrapper(this), {
      compare:  {"css": "background-color"},
      controls: $(".jsavexercisecontrols"),
      fix:      fixFunction
    });
    this.exercise.reset();
  }
  
  TreeTraversal.prototype.nodeClick = function (exercise) {
    return function () {
      if (this.element.hasClass("jsavnullnode") || this.isHighlight()) { return; }
      this.highlight();
      var pos = exercise.jsav.canvas.find(".jsavlabel:visible").size();
      exercise.jsav.label(pos + 1, {relativeTo: this, anchor: "right top"});
      exercise.gradeableStep();
    };
  };
  
  // Set click handlers
  $('#help').click(help);
  $('#about').click(about);


  //////////////////////////////////////////////////////////////////
  // Global variables
  //////////////////////////////////////////////////////////////////
  var interpret;
  window.TreeTraversal = TreeTraversal;
});
