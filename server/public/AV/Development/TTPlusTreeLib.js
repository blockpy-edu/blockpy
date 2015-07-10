"use strict";

// Helper functions for miscellaneous features.
(function ($) {
  // Get global variable
  var global;
  if (window.ttplustree) {
    global = window.ttplustree;
  } else {
    global = window.ttplustree = {};
  }

  global.rect_padding = 10;

  // Draw rectangle around node1 and node2. Assumes that node1 is to the left
  // of node2 and that both nodes are horizontally aligned.
  global.drawRectangle = function (jsav, rect, node1, node2) {
    var padding = global.rect_padding;
    var n1p = $(node1.array.element).position();
    var n2p = $(node2.array.element).position();
    var width = $(node1.array.element).outerWidth();
    var height = $(node1.array.element).outerHeight();

    var x = n1p.left - padding + 3;
    var y = n1p.top - padding + 3;
    var w = (n2p.left + width) - (n1p.left) + (padding * 2);
    var h = height + (padding * 2);

    if (rect) {
      rect.hide();
    }
    rect = jsav.g.rect(x, y, w, h);
    rect.addClass("node-split-rect");
    return rect;
  };

  // Draw arrows between all leaf nodes.
  global.drawLeafArrows = function (jsav, leafList, arrowList) {
    // Add as many elements to the leafs arrows arrays as there are leafs
    while (arrowList.length !== leafList.length) {
      if (arrowList.length < leafList.length) {
        arrowList.push(null);
      } else if (arrowList.length > leafList.length) {
        var edge = arrowList.pop();
        if (edge) {
          edge.hide();
        }
      }
    }

    // Draw the arrows
    for (var i = 0; i < leafList.length - 1; i++) {
      var p1 = $(leafList[i].array.element).position();
      var p2 = $(leafList[i + 1].array.element).position();
      var w1 = $(leafList[i].array.element).outerWidth();
      var h1 = $(leafList[i].array.element).outerHeight();
      var h2 = $(leafList[i + 1].array.element).outerHeight();

      var x1 = p1.left + w1,
        y1 = p1.top + (h1 / 2),
        x2 = p2.left,
        y2 = p2.top + (h2 / 2);

      if (!arrowList[i]) {
        arrowList[i] = jsav.g.line(x1, y1, x2, y2, {"arrow-end": "classic", "stroke-width": 3.0});
      } else {
        arrowList[i].movePoints([[0, x1, y1], [1, x2, y2]]);
      }
    }
  };

  global.moveNodes = function (nodes, left, top) {
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].move(left, top);
    }
  };

  /**
   * Find the specified key
   * @param av JSAV object
   * @param key The key to find
   * @param root The root node of the tree
   */
  global.findKey = function (av, key, root, helper_node) {
    var curr_node = root;
    var prev_node = null;
    // Iterate until a leaf node is reached.
    while (!curr_node.isLeaf) {
      var has_right_key = (curr_node.length() === 2);
      var lkey = curr_node.value(0);
      var rkey = null;
      if (has_right_key) {
        rkey = curr_node.value(1);
      }
      var follow_child = -1;
      if (key < lkey) { // Go left child
        follow_child = 0;
        av.umsg("<b>" + key + "</b> is less than " + lkey +
          ". The left child is followed.<br><b>" + key + "</b> &lt; " + lkey);
      } else if (!has_right_key && lkey <= key) { // Go center child
        follow_child = 1;
        av.umsg("<b>" + key + "</b> is greater than or equal to " + lkey +
          ". The center child is followed.<br>" + lkey + " &lt;= <b>" + key + "</b>");
      } else if (has_right_key && lkey <= key && key < rkey) {
        follow_child = 1;
        av.umsg("<b>" + key + "</b> is greater than or equal to " + lkey + " and less than " + rkey +
          ". The center child is followed.<br>" + lkey + " &lt;= <b>" + key + "</b> &lt; " + rkey);
      } else if (has_right_key && rkey <= key) { // Go to right child
        follow_child = 2;
        av.umsg("<b>" + key + "</b> is greater than or equal to " + rkey +
          ". The right child is followed.<br>" + rkey + " &lt;= <b>" + key + "</b>");
      }

      // Un-hilight previous node
      if (prev_node !== null) {
        prev_node.highlightToggle();
        prev_node.unhighlightEdges();
      }
      // Higlight current node.
      curr_node.highlightToggle();
      if (!curr_node.isLeaf) {
        curr_node.highlightToggleEdge(follow_child);
      }

      // Update node pointers and step through slide show.
      prev_node = curr_node;
      curr_node = curr_node.child(follow_child);
      av.step();
    }

    // Display success/failure message
    if (isLeafEqual(key, curr_node)) {
      av.umsg("We have found the correct leaf node.");
    } else {
      av.umsg("Oops, no exact was found.");
    }

    // Un-highlight previous node.
    prev_node.highlightToggle();
    prev_node.unhighlightEdges();
    curr_node.highlightToggle();
    if (helper_node) {
      helper_node.highlightToggle();
    }
    av.step();

    return curr_node;
  };

  // Determines if the given leaf node contains the specified key.
  function isLeafEqual(key, leaf) {
    // Iterate over all leaf keys
    for (var i = 0; i < leaf.length(); i++) {
      if (leaf.value(i).indexOf(key) === 0) {
        return true; // Found a match
      }
    }
    return false; // Did not find a match
  }
}(jQuery));

// Helper function for tree nodes
(function ($) {
  // Get global variable
  var global;
  if (window.ttplustree) {
    global = window.ttplustree;
  } else {
    global = window.ttplustree = {};
  }

  // Initialize a new tree node.
  global.newNode = function (jsav, keys, isLeaf, values) {
    if (isLeaf) {
      for (var i = 0; i < keys.length; i++) {
        keys[i] = keys[i] + '<br><div class="leaf-node-value">' + values[i] + '</div>';
      }
    }
    var arr = jsav.ds.array(keys, {left: "0", top: "0"});
    if (isLeaf) {
      arr.element.addClass('leaf-node');
    } else {
      arr.element.addClass('internal-node');
    }
    return new global.node(jsav, arr, isLeaf).center();
  };

  // Node constructor.
  global.node = function (jsav, arr, isLeaf) {
    this.jsav = jsav;
    this.array = arr;
    if (isLeaf) {
      this.isLeaf = isLeaf;
    } else {
      this.isLeaf = false;
    }
    this.children = [];
    this.edges = [];
  };

  // Add functions to node prototype.
  var nodeproto = global.node.prototype;

  // Get/Set node value.
  nodeproto.value = function (idx, key, value) {
    if (!key && key !== "") {
      return this.array.value(idx);
    }
    if (this.isLeaf && value) {
      key = key + '<br><div class="leaf-node-value">' + value + '</div>';
    }
    this.array.value(idx, key);
  };

  // Get array node length
  nodeproto.length = function () {
    if (this.value(1) !== "") {
      return 2;
    } else {
      return 1;
    }
  };

  // Shift the position of the node.
  nodeproto.move = function (left, top) {
    this.array.css({"left": "+=" + left + "px", "top": "+=" + top + "px"});
  };

  // Move the node horizontally to the center of the canvas.
  nodeproto.center = function () {
    var canvas = $(this.array.element).parent();
    var cw = $(canvas).outerWidth();
    var aw = $(this.array.element).outerWidth();
    var left_offset = (cw / 2) - (aw / 2);
    this.array.css({left: left_offset + "px", top: "15px"});
    return this;
  };

  // Add child node to this node.
  nodeproto.addChild = function (newChild) {
    this.children.push(newChild);
    this.edges.push(null);
    this.drawEdge(this.children.length - 1);
  };

  // Insert child node at specified index.
  nodeproto.insertChild = function (idx, newChild) {
    this.children.splice(idx, 0, newChild);
    this.edges.splice(idx, 0, null);
  };

  // Remove child at specified index.
  nodeproto.removeChild = function (idx) {
    // Remove child and edge
    var child = this.children.splice(idx, 1);
    var edge = this.edges.splice(idx, 1);
    // Hide edge
    if (edge[0]) {
      edge[0].hide();
    }
    // Return child
    return child[0];
  };

  // Draw edge from this node to child node.
  nodeproto.drawEdge = function (child_idx) {
    // Calculate edge position
    var pos = $(this.array.element).position();
    var c_pos = $(this.children[child_idx].array.element).position();
    var x1 = pos.left,
      y1 = pos.top,
      x2 = c_pos.left,
      y2 = c_pos.top;

    // Adjust coordinates to align edges with arrays
    var left_off = ($(this.array.element).outerWidth() / $(this.array.element).children('li').size()) * child_idx;
    var top_off = $(this.array.element).outerHeight();
    x1 += left_off;
    y1 += top_off;
    x2 += $(this.children[child_idx].array.element).outerWidth() / 2;
    y2 += 2;

    if (child_idx === 0) {
      x1 += 2;
      y1 -= 1;
    } else if (child_idx === 2) {
      x1 -= 2;
      y1 -= 1;
    }

    // Set edge to right position
    if (!this.edges[child_idx]) {
      this.edges[child_idx] = this.jsav.g.line(x1, y1, x2, y2);
    } else {
      this.edges[child_idx].movePoints([[0, x1, y1], [1, x2, y2]]);
    }
  };

  // Draw/Update all edges to all children of this node.
  nodeproto.updateEdges = function (recursive) {
    for (var i = 0; i < this.edges.length; i++) {
      this.drawEdge(i);
      if (recursive) {
        this.children[i].updateEdges(recursive);
      }
    }
    return this;
  };

  // Traverse tree and get all leafs recursively.
  nodeproto.getLeafs = function () {
    if (this.isLeaf) {
      return [this];
    } else {
      var result = [];
      for (var i = 0; i < this.children.length; i++) {
        result = result.concat(this.children[i].getLeafs());
      }
      return result;
    }
  };

  // Hide all edges.
  nodeproto.hideEdges = function () {
    for (var i = 0; i < this.edges.length; i++) {
      this.edges[i].hide();
    }
    return this;
  };

  // Hide edge at specified index.
  nodeproto.hideEdge = function (idx) {
    this.edges[idx].hide();
  };

  // Show all edges.
  nodeproto.showEdges = function () {
    for (var i = 0; i < this.edges.length; i++) {
      this.edges[i].show();
    }
    return this;
  };

  // Show edge at specified index.
  nodeproto.showEdge = function (idx) {
    this.edges[idx].show();
    return this;
  };

  // Toggle node highlighting.
  nodeproto.highlightToggle = function () {
    if (this.array.isHighlight()) {
      this.array.unhighlight();
    } else {
      this.array.highlight();
    }
  };

  // Toggle edge highlighting. Index specified which edge is highlighted.
  nodeproto.highlightToggleEdge = function (idx) {
    this.edges[idx].toggleClass('highlight-edge');
  };

  // Un-highlight all edges of this node.
  nodeproto.unhighlightEdges = function () {
    for (var i = 0; i < this.edges.length; i++) {
      this.edges[i].removeClass('highlight-edge');
    }
  };

  // Get child at specified index.
  nodeproto.child = function (pos) {
    return this.children[pos];
  };

}(jQuery));