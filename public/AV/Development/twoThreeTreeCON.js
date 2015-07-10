/**
 * Creates global functions that serve to facilitate the creation and manipulation of 2-3 trees.
 */
(function () {
  "use strict";

  /**
   * Creates a new array tree. The values are hard coded, this method only work for this instance.
   * @param jsav The JSAV that will draw the array nodes.
   * @returns {Array} A list of all the array nodes that were created.
   */
  function getArrayNodes(jsav) {
    var arrays = [];
    arrays.push(jsav.ds.array([18, 31]));
    arrays.push(jsav.ds.array([12, ""]));
    arrays.push(jsav.ds.array([23, 30]));
    arrays.push(jsav.ds.array([48, ""]));
    arrays.push(jsav.ds.array([10, ""]));
    arrays.push(jsav.ds.array([15, ""]));
    arrays.push(jsav.ds.array([20, 21]));
    arrays.push(jsav.ds.array([24, ""]));
    arrays.push(jsav.ds.array([31, ""]));
    arrays.push(jsav.ds.array([45, 47]));
    arrays.push(jsav.ds.array([50, 52]));
    return arrays;
  }

  /**
   * Draws the edges between array nodes. The edges are hard coded, this function only works for this instance.
   * @param jsav The JSAV that will draw the edges.
   * @param array_nodes The array nodes where the edges will be drawn from and to.
   * @param array_node_length The length of each array node.
   * @param edge_properties The properties of each edge.
   * @returns {Array} A list of all the lines that were created.
   */
  function getArrayNodesEdges(jsav, array_nodes, array_node_length, edge_properties) {
    var lines = [];
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[0], array_nodes[1], 0, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[0], array_nodes[2], 1, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[0], array_nodes[3], 2, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[1], array_nodes[4], 0, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[1], array_nodes[5], 1, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[2], array_nodes[6], 0, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[2], array_nodes[7], 1, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[2], array_nodes[8], 2, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[3], array_nodes[9], 0, array_node_length));
    lines.push(window.twothreetree.drawEdge(jsav, edge_properties, array_nodes[3], array_nodes[10], 1, array_node_length));
    return lines;
  }

  /**
   * This function positions a row of arrays.
   * @param array_nodes The array of nodes to be positioned.
   * @param top The top value for all noes.
   * @param container_width The width of the container that the array nodes are in.
   * @param row_width The desired width that all the nodes will take up.
   * @param left_offset Optional left offset for all nodes.
   */
  function positionRow(array_nodes, top, container_width, row_width, left_offset) {
    var total_width, node_width, offset, left, i;
    node_width = extractNumber(array_nodes[0].css("width"));
    total_width = node_width * array_nodes.length;
    offset = (row_width - total_width) / (array_nodes.length - 1);

    if (typeof(left_offset) === "undefined") {
      left_offset = 0;
    }
    left = (container_width - row_width) / 2 + left_offset;

    for (i = 0; i < array_nodes.length; i += 1) {
      array_nodes[i].css({"left": left + "px", "top": top + "px", "position": "absolute"});
      left +=  node_width + offset;
    }
  }

  /**
   * Draws a lines from one array node to another.
   * @param jsav The JSAV object where the line will be drawn.
   * @param properties The properties of the line.
   * @param arrayFrom The array node where the line is coming from.
   * @param arrayTo The array node where the line is going to.
   * @param edgeIndex The index of the arrayFrom where the line starts.
   * @param length The length of each array node (list size).
   * @returns {*} A JSAV line object.
   */
  function drawEdge(jsav, properties, arrayFrom, arrayTo, edgeIndex, length) {
    var top, left, height, width, step, x1, y1, x2, y2;

    // Get coordinates for the x1 and y1 of the edge.
    height = extractNumber(arrayFrom.css("height"));
    width = extractNumber(arrayFrom.css("width"));
    top = extractNumber(arrayFrom.css("top"));
    left = extractNumber(arrayFrom.css("left"));
    step = width / length;

    x1 = left + (step * edgeIndex);
    y1 = top + height;

    // Get coordinates for the x2 and y2 of the edge.
    height = extractNumber(arrayTo.css("height"));
    width = extractNumber(arrayTo.css("width"));
    top = extractNumber(arrayTo.css("top"));
    left = extractNumber(arrayTo.css("left"));

    x2 = left  + (width / 2);
    y2 = top + 1;

    // Create line and return object.
    return jsav.g.line(x1, y1, x2, y2, properties);
  }

  /**
   * Turns a string to a float number.
   * @param pixels The string to convert to string. This string has to end in "px".
   * @returns {Number} The float number equivalent of the pixel value.
   */
  function extractNumber(pixels) {
    return parseFloat(pixels.substring(0, pixels.length - 2));
  }

  function toggleArrayHighlight(array_node) {
    if (array_node.css(array_highlight_property) === "none") {
      array_node.css(array_highlight_add);
    } else {
      array_node.css(array_highlight_remove);
    }
  }

  function toggleEdgeHighlight(line) {
    if (line.css(edge_highlight_property) === "#000") {
      line.css(edge_highlight_add);
    } else {
      line.css(edge_highlight_remove);
    }
  }

  // Highlight properties for arrays.
  var array_highlight_property = "box-shadow";
  var array_highlight_add = {"box-shadow": "0 0 15px 5px #2B92FF"};
  var array_highlight_remove = {"box-shadow": "none"};

  // Highlight properties for line edges.
  var edge_highlight_property = "stroke";
  var edge_highlight_add = {"stroke": "#2B92FF", "stroke-width": 3.0};
  var edge_highlight_remove = {"stroke": "black", "stroke-width": 1.0};


  var twothreetree = {};
  twothreetree.drawEdge = drawEdge;
  twothreetree.positionRow = positionRow;
  twothreetree.getArrayNodes = getArrayNodes;
  twothreetree.getArrayNodesEdges = getArrayNodesEdges;
  twothreetree.toggleArrayHiglight = toggleArrayHighlight;
  twothreetree.toggleEdgeHiglight = toggleEdgeHighlight;
  window.twothreetree = twothreetree;
}());

/**
 * Creates a diagram that illustrates what a 2-3 tree looks likes.
 *
 * Container ID: twoThreeTreeCON
 */
(function () {
  "use strict";

  var jsav = new JSAV("twoThreeTreeCON");

  // Create all the arrays that represent the nodes in the 2-3 tree.
  var arrays = window.twothreetree.getArrayNodes(jsav);
  // Position the array nodes.
  var width = 560;
  window.twothreetree.positionRow(arrays.slice(0, 1), 0, width, 70);
  window.twothreetree.positionRow(arrays.slice(1, 4), 80, width, 450);
  window.twothreetree.positionRow(arrays.slice(4), 160, width, 560);

  // Create lines that connect all the nodes.
  var properties = {"stroke-width": 1.5};
  var length = 2;
  window.twothreetree.getArrayNodesEdges(jsav, arrays, length, properties);
}());

/**
 * Creates a slide show that demonstrates a simple insertion to a 2-3 tree.
 *
 * Container ID: simpleInsertCON
 */
(function () {
  "use strict";
  var jsav = new JSAV("simpleInsertCON");

  // Create all the arrays that represent the nodes in the 2-3 tree.
  var arrays = window.twothreetree.getArrayNodes(jsav);
  // Position the array nodes.
  var width = 700;
  window.twothreetree.positionRow(arrays.slice(0, 1), 0, width, 70);
  window.twothreetree.positionRow(arrays.slice(1, 4), 80, width, 450);
  window.twothreetree.positionRow(arrays.slice(4), 160, width, 560);

  // Create lines that connect all the nodes.
  var properties = {"stroke-width": 1.5};
  var length = 2;
  var lines = window.twothreetree.getArrayNodesEdges(jsav, arrays, length, properties);

  var messages = [
    "Simple insert into the 2-3 tree. We want to insert the key 14 into the tree.",
    "The value is first compared against the root node. Since 14 is less than the left value of the root node, the left child node is followed next.",
    "This node has only one element, and 14 is greater than 12 so the center child is followed next.",
    "A leaf node has being reached. Since the leaf node has an empty space the new node can be inserted here. The key 15 has to be shifted to the right to make room for the new key (14).",
    "Now the key 14 can be inserted into the tree.",
    "The insertion is complete."
  ];

  /* 1st Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.label("Insert:", {left: "55px", top: "5px"});
  var insert = jsav.ds.array([14], {left: "100px", top: "0px"});
  jsav.displayInit();

  /* 2nd Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  arrays[0].highlight(0);
  window.twothreetree.toggleEdgeHiglight(lines[0]);
  jsav.step();

  /* 3rd Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[1]);
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  window.twothreetree.toggleEdgeHiglight(lines[0]);
  arrays[0].unhighlight(0);
  arrays[1].highlight(0);
  window.twothreetree.toggleEdgeHiglight(lines[4]);
  jsav.step();

  /* 4th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[5]);
  window.twothreetree.toggleArrayHiglight(arrays[1]);
  window.twothreetree.toggleEdgeHiglight(lines[4]);
  arrays[1].unhighlight(0);
  jsav.step();

  /* 5th Slide *************************************************************/
  jsav.umsg(messages.shift());
  arrays[5].swap(0, 1, {arrow: false});
  jsav.step();

  /* 5th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[5]);
  jsav.effects.moveValue(insert, 0, arrays[5], 0);
  jsav.step();

  jsav.recorded();

}());


/**
 * Creates a slide show that demonstrates how a key can be promoted in a 2-3 tree.
 *
 * Container ID: promoteCON
 */
(function () {
  "use strict";
  var jsav = new JSAV("promoteCON");

  // Create all the arrays that represent the nodes in the 2-3 tree.
  var arrays = window.twothreetree.getArrayNodes(jsav);
  // Position the array nodes.
  var width = 700;
  window.twothreetree.positionRow(arrays.slice(0, 1), 0, width, 70);
  window.twothreetree.positionRow(arrays.slice(1, 4), 80, width, 450);
  window.twothreetree.positionRow(arrays.slice(4), 160, width, 560);

  // Create lines that connect all the nodes.
  var properties = {"stroke-width": 1.5};
  var length = 2;
  var lines = window.twothreetree.getArrayNodesEdges(jsav, arrays, length, properties);

  var messages = [
    "A simple node-splitting insert for a 2-3 tree. We want to insert the key 55 into the tree. ",
    "The key is first compared against the root node. Since 55 is more than the right key of the root node, the right child node if followed.",
    "This node has only one element, and 55 is greater than 48 so the center child is followed next.",
    "A leaf node has being reached. Since the leaf node has no empty spaces it will have to be split.",
    "Next we have to rearrange the keys. First the largest key 55 goes to the new node.",
    "The smallest key 50 goes to the old node. In this case it stays in the same place.",
    "The middle key 52 gets promoted. Because the parent node has space available, the key can just be inserted in the parent node.",
    "The pointers can be updated now.",
    "The insertion is complete"
  ];

  /* 1st Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.label("Insert:", {left: "55px", top: "5px"});
  var insert = jsav.ds.array([55], {left: "100px", top: "0px"});
  jsav.displayInit();

  /* 2nd Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  arrays[0].highlight(1);
  window.twothreetree.toggleEdgeHiglight(lines[2]);
  jsav.step();

  /* 3rd Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[3]);
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  window.twothreetree.toggleEdgeHiglight(lines[2]);
  arrays[0].unhighlight(1);
  arrays[3].highlight(0);
  window.twothreetree.toggleEdgeHiglight(lines[9]);
  jsav.step();

  /* 4th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[10]);
  window.twothreetree.toggleArrayHiglight(arrays[3]);
  window.twothreetree.toggleEdgeHiglight(lines[9]);
  arrays[3].unhighlight(0);
  jsav.step();

  /* 5th Slide *************************************************************/
  jsav.umsg(messages.shift());
  arrays.push(jsav.ds.array(["", ""], {visible: false}));
  window.twothreetree.positionRow(arrays.slice(4), 160, width + 80, 639);
  arrays[11].show();
  window.twothreetree.toggleArrayHiglight(arrays[11]);
  jsav.step();

  /* 6th Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.effects.moveValue(insert, 0, arrays[11], 0);
  jsav.step();

  /* 7th Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.step();

  /* 8th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[3]);
  window.twothreetree.toggleArrayHiglight(arrays[11]);
  window.twothreetree.toggleArrayHiglight(arrays[10]);
  jsav.effects.moveValue(arrays[10], 1, arrays[3], 1);
  arrays[3].highlight(1);
  jsav.step();

  /* 9th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.drawEdge(jsav, properties, arrays[3], arrays[11], 2, length);
  arrays[3].unhighlight(1);
  window.twothreetree.toggleArrayHiglight(arrays[3]);
  jsav.step();

  // Mark the slide show as finished.
  jsav.recorded();

}());


/**
 * Creates a slide show that demonstrates how a node can be split in a 2-3 tree.
 *
 * Container ID: splitCON
 */
(function () {
  "use strict";
  var jsav = new JSAV("splitCON");

  // Create all the arrays that represent the nodes in the 2-3 tree.
  var arrays = window.twothreetree.getArrayNodes(jsav);
  // Position the array nodes.
  var width = 800;
  window.twothreetree.positionRow(arrays.slice(0, 1), 80, width, 70);
  window.twothreetree.positionRow(arrays.slice(1, 4), 160, width, 480);
  window.twothreetree.positionRow(arrays.slice(4), 240, width, 560);

  // Create lines that connect all the nodes.
  var properties = {"stroke-width": 1.5};
  var length = 2;
  var lines = window.twothreetree.getArrayNodesEdges(jsav, arrays, length, properties);

  var messages = [
    "Example of inserting a record that causes the 2-3 tree root to split. We want to insert the key 19 into the tree.",
    "The key is first compared against the root node. Since 19 is more than the left key and less than the right key of the root node, the center child node is followed next.",
    "This node has only two elements, and 19 is less than 23 so the left child is followed next.",
    "A leaf node has being reached. Since the leaf node has no empty spaces it will have to be split.",
    "Next we have to rearrange the keys. First the largest key (21) goes in the new node.",
    "The middle key (20) has to be promoted.",
    "The smallest key (19) goes is the old node",
    "The parent node is full, so the promoted element cannot be inserted. Therefore the parent node has to be split.",
    "Again, the largest key (30) goes in the new node, the smallest key (20) goes is the old node, and the middle key (23) is promoted",
    "The pointers can now be updated",
    "The parent node is full so the promoted element cannot be inserted. Therefore the parent node has to be split. Because the parent node is the root node, a new root has to be created as well.",
    "Again, the largest key (31) goes in the new node, the smallest key (18) stays in the old node, and the middle key (23) is promoted.",
    "The pointers can now be updated.",
    "The insertion is complete."
  ];

  /* 1st Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.label("Insert:", {left: "55px", top: "5px"});
  jsav.label("Promote:", {left: "35px", top: "55px"});
  var insert = jsav.ds.array([19], {left: "100px", top: "0px"});
  var promote = jsav.ds.array([""], {left: "100px", top: "50px"});
  jsav.displayInit();

  /* 2nd Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  window.twothreetree.toggleEdgeHiglight(lines[1]);
  jsav.step();

  /* 3rd Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[2]);
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  window.twothreetree.toggleEdgeHiglight(lines[1]);
  arrays[2].highlight(0);
  window.twothreetree.toggleEdgeHiglight(lines[5]);
  jsav.step();

  /* 4th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[6]);
  window.twothreetree.toggleArrayHiglight(arrays[2]);
  window.twothreetree.toggleEdgeHiglight(lines[5]);
  arrays[2].unhighlight(0);
  jsav.step();

  /* 5th Slide *************************************************************/
  jsav.umsg(messages.shift());
  arrays.splice(7, 0, jsav.ds.array(["", ""], {visible: false}));
  window.twothreetree.positionRow(arrays.slice(4), 240, width, 640);
  arrays[7].show();
  for (var i = 3; i < lines.length; i += 1) {
    lines[i].hide();
  }
  lines.splice(3, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[4], 0, length));
  lines.splice(4, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[5], 1, length));
  lines.splice(5, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[6], 0, length));
  lines.splice(6, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[8], 1, length));
  lines.splice(7, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[9], 2, length));
  lines.splice(8, 1, window.twothreetree.drawEdge(jsav, properties, arrays[3], arrays[10], 0, length));
  lines.splice(9, 1, window.twothreetree.drawEdge(jsav, properties, arrays[3], arrays[11], 1, length));
  window.twothreetree.toggleArrayHiglight(arrays[7]);
  jsav.step();

  /* 6th Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.effects.moveValue(arrays[6], 1, arrays[7], 0);
  jsav.step();

  /* 7th Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.effects.moveValue(arrays[6], 0, promote, 0);
  jsav.step();

  /* 8th Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.effects.moveValue(insert, 0, arrays[6], 0);
  jsav.step();

  /* 9th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[6]);
  window.twothreetree.toggleArrayHiglight(arrays[7]);
  arrays.splice(3, 0, jsav.ds.array(["", ""], {visible: false}));
  window.twothreetree.positionRow(arrays.slice(1, 5), 160, width, 550);
  arrays[3].show();
  window.twothreetree.toggleArrayHiglight(arrays[2]);
  window.twothreetree.toggleArrayHiglight(arrays[3]);
  for (i = 0; i < lines.length; i += 1) {
    lines[i].hide();
  }
  lines.splice(0, 1, window.twothreetree.drawEdge(jsav, properties, arrays[0], arrays[1], 0, length));
  lines.splice(1, 1, window.twothreetree.drawEdge(jsav, properties, arrays[0], arrays[2], 1, length));
  lines.splice(2, 1, window.twothreetree.drawEdge(jsav, properties, arrays[0], arrays[4], 2, length));
  lines.splice(3, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[5], 0, length));
  lines.splice(4, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[6], 1, length));
  lines.splice(5, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[7], 0, length));
  lines.splice(6, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[9], 1, length));
  lines.splice(7, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[10], 2, length));
  lines.splice(8, 1, window.twothreetree.drawEdge(jsav, properties, arrays[4], arrays[11], 0, length));
  lines.splice(9, 1, window.twothreetree.drawEdge(jsav, properties, arrays[4], arrays[12], 1, length));
  jsav.step();

  /* 10th Slide *************************************************************/
  jsav.umsg(messages.shift());
  jsav.effects.moveValue(arrays[2], 1, arrays[3], 0);
  jsav.effects.moveValue(promote, 0, arrays[2], 0);
  promote.value(0, 23);
  jsav.step();

  /* 11th Slide *************************************************************/
  jsav.umsg(messages.shift());
  for (i = 3; i < lines.length; i += 1) {
    lines[i].hide();
  }
  lines.splice(3, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[5], 0, length));
  lines.splice(4, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[6], 1, length));
  lines.splice(5, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[7], 0, length));
  lines.splice(6, 1, window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[8], 1, length));
  lines.splice(7, 1, window.twothreetree.drawEdge(jsav, properties, arrays[3], arrays[9], 0, length));
  lines.splice(8, 1, window.twothreetree.drawEdge(jsav, properties, arrays[3], arrays[10], 1, length));
  lines.splice(9, 1, window.twothreetree.drawEdge(jsav, properties, arrays[4], arrays[11], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[4], arrays[12], 1, length));
  jsav.step();

  /* 12th Slide *************************************************************/
  jsav.umsg(messages.shift());
  window.twothreetree.toggleArrayHiglight(arrays[2]);
  window.twothreetree.toggleArrayHiglight(arrays[3]);
  arrays.splice(0, 0, jsav.ds.array(["", ""], {visible: false}));
  arrays.splice(2, 0, jsav.ds.array(["", ""], {visible: false}));
  window.twothreetree.positionRow(arrays.slice(0, 1), 0, width, 80);
  window.twothreetree.positionRow(arrays.slice(1, 3), 80, width, 400);
  arrays[0].show();
  arrays[2].show();
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  window.twothreetree.toggleArrayHiglight(arrays[1]);
  window.twothreetree.toggleArrayHiglight(arrays[2]);
  for (i = 0; i < 3; i += 1) {
    lines[i].hide();
  }
  lines.splice(0, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[3], 0, length));
  lines.splice(1, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[4], 1, length));
  lines.splice(2, 1, window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[6], 2, length));
  jsav.step();

  /* 13th Slide *************************************************************/
  jsav.umsg(messages.shift());
//  jsav.effects.moveValue(promote, 0, arrays[2], 0);
  jsav.effects.moveValue(promote, 0, arrays[0], 0);
//  jsav.effects.moveValue(arrays[1], 1, arrays[1], 0);
  jsav.effects.moveValue(arrays[1], 1, arrays[2], 0);
//  arrays[0].value(0, 18);
  jsav.step();

  /* 14th Slide *************************************************************/
  jsav.umsg(messages.shift());
  for (i = 0; i < lines.length; i += 1) {
    lines[i].hide();
  }
  lines = [];
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[0], arrays[1], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[0], arrays[2], 1, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[3], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[1], arrays[4], 1, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[5], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[2], arrays[6], 1, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[3], arrays[7], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[3], arrays[8], 1, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[4], arrays[9], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[4], arrays[10], 1, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[5], arrays[11], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[5], arrays[12], 1, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[6], arrays[13], 0, length));
  lines.push(window.twothreetree.drawEdge(jsav, properties, arrays[6], arrays[14], 1, length));
  window.twothreetree.toggleArrayHiglight(arrays[0]);
  window.twothreetree.toggleArrayHiglight(arrays[1]);
  window.twothreetree.toggleArrayHiglight(arrays[2]);
  jsav.step();

  // Mark the slide show as finished.
  jsav.recorded();

}());
