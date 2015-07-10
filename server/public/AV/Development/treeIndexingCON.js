/*global ODSA */
"use strict";
$(document).ready(function () {

  /**
   * Toggles the highlighting of a node.
   * @param node The node to highlight/un-highlight
   */
  function toggleNodeHighlight(node) {

    if (node.css(node_highlight_property) === node_highlight_default) {
      node.css(node_highlight_add);
    } else {
      node.css(node_highlight_remove);
    }
  }

  /**
   * This function determines the default box shadow effect that JSAV applies to
   * tree nodes. This is because tree nodes initially have a box shadow around
   * them. The purpose of this method is so that the toggleNodeHighlight
   * function can set the box shadow effect back to the original settings.
   * Otherwise each highlighted node would look different after being toggled
   * off.
   * @param node The node to get the default box shadow effect from.
   */
  function setNodeHighlightDefault(node) {
    node_highlight_default = node.css(node_highlight_property);
    node_highlight_remove["box-shadow"] = node_highlight_default;
  }

  // CSS highlight property to be modified.
  var node_highlight_property = "box-shadow";
  // The default CSS property.
  var node_highlight_default;
  // The CSS to add the highlighting effect.
  var node_highlight_add = {"box-shadow": "0 0 12px 8px rgba(0, 0, 0, 0.5)"};
  // The CSS to remove the highlighting effect.
  var node_highlight_remove = {"box-shadow": "node"};

  window.toggleNodeHighlight = toggleNodeHighlight;
  window.setNodeHighlightDefault = setNodeHighlightDefault;
});



/**
 * Creates a diagram to demonstrate how a binary search tree might be laid out on disk.
 *
 * Container ID: pagedBSTCON
 */
$(document).ready(function () {
  var av_name = "pagedBST_CON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(
                 {"av_name": av_name, "json_path": "AV/Development/treeIndexingCON.json"});

  var jsav = new JSAV(av_name);

  var n = [10, 5, 15, 3, 8, 13, 18, 2, 4, 7, 9, 12, 14, 17, 19];
  var colors = ["#7BFF95", "#77CCFF", "#FF6F52", "#FFDE70", "#E39BCF"];

  var bst = jsav.ds.binarytree({nodegap: 30});
  var nodes = [
    bst.root(n[0])
  ];
  nodes[0].css({"background-color": colors[0]});

  bst.layout();

  var recs = [];

  // Create rectangles
  var x = 20, y = 300, w = 120, h = 50, num = 5;
  for (var i = 0; i < num; i++) {
    recs.push(jsav.g.rect(x, y, w, h, {"stroke-width": 2, "fill": colors[i]}));
    x += w;
  }

  // Create labels
  var t = 295, l = 30, v = false;
  var labels = [
    jsav.label(n[0], {visible: v, left: (l + 0) + "px", top: (t + 0) + "px"}),
    jsav.label(n[1], {visible: v, left: (l + 40) + "px", top: (t + 0) + "px"}),
    jsav.label(n[2], {visible: v, left: (l + 80) + "px", top: (t + 0) + "px"}),
    jsav.label(n[3], {visible: v, left: (l + 120) + "px", top: (t + 0) + "px"}),
    jsav.label(n[4], {visible: v, left: (l + 160) + "px", top: (t + 0) + "px"}),
    jsav.label(n[5], {visible: v, left: (l + 200) + "px", top: (t + 0) + "px"}),
    jsav.label(n[6], {visible: v, left: (l + 240) + "px", top: (t + 0) + "px"}),
    jsav.label(n[7], {visible: v, left: (l + 280) + "px", top: (t + 0) + "px"}),
    jsav.label(n[8], {visible: v, left: (l + 320) + "px", top: (t + 0) + "px"}),
    jsav.label(n[9], {visible: v, left: (l + 360) + "px", top: (t + 0) + "px"}),
    jsav.label(n[10], {visible: v, left: (l + 400) + "px", top: (t + 0) + "px"}),
    jsav.label(n[11], {visible: v, left: (l + 440) + "px", top: (t + 0) + "px"}),
    jsav.label(n[12], {visible: v, left: (l + 480) + "px", top: (t + 0) + "px"}),
    jsav.label(n[13], {visible: v, left: (l + 520) + "px", top: (t + 0) + "px"}),
    jsav.label(n[14], {visible: v, left: (l + 560) + "px", top: (t + 0) + "px"})
  ];

  var messages = [
    "Paged BST demo. The bottom square represents blocks on disk.",
      "Insert " + n[0] + " into BST."
  ];
  jsav.umsg(messages.shift());
  nodes[0].hide();
  jsav.displayInit();

  jsav.umsg(messages.shift());
  nodes[0].show();
  labels[0].show();
  jsav.step();

  var node = 0, flag = true;
  for (i = 1; i < n.length; i++) {
    jsav.umsg("Insert " + n[i] + " into the tree.");
    var new_node;
    if (flag) {
      new_node = nodes[node].left(n[i]);
      new_node.css({"background-color": colors[Math.floor(i / 3)]});
      nodes.push(new_node);
      flag = false;
    } else {
      new_node = nodes[node].right(n[i]);
      new_node.css({"background-color": colors[Math.floor(i / 3)]});
      nodes.push(new_node);
      flag = true;
      node++;
    }
    bst.layout();
    labels[i].show();
    jsav.step();
  }

  jsav.recorded();
});

$(document).ready(function () {
  var av_name = "rebalanceBST_CON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(
                 {"av_name": av_name, "json_path": "AV/Development/treeIndexingCON.json"});

  var jsav = new JSAV(av_name);

  var n = [10, 5, 15, 3, 8, 13, 18, 2, 4, 7, 9, 12, 14, 17, 19];  // Tree node values.
  var colors = ["#7BFF95", "#77CCFF", "#FF6F52", "#FFDE70", "#E39BCF"]; // Tree node colors.

  // Create bst
  var bst = jsav.ds.binarytree({nodegap: 40});
  var nodes = [bst.root(n[0])]; // Node array
  nodes[0].css({"background-color": colors[0]});  // Color root node.

  // Create tree
  var node = 0, flag = true, i;
  for (i = 1; i < n.length; i++) {
    var new_node;
    if (flag) {
      new_node = nodes[node].left(n[i]);
      new_node.css({"background-color": colors[Math.floor(i / 3)]});
      nodes.push(new_node);
      flag = false;
    } else {
      new_node = nodes[node].right(n[i]);
      new_node.css({"background-color": colors[Math.floor(i / 3)]});
      nodes.push(new_node);
      flag = true;
      node++;
    }
  }

  bst.layout();

  // Create rectangles
  var recs = [];
  var x = 20, y = 300, w = 120, h = 50, num = 5;
  for (i = 0; i < num; i++) {
    recs.push(jsav.g.rect(x, y, w, h, {"stroke-width": 2, "fill": colors[i]}));
    x += w;
  }

  // Create labels
  var t = 295, l = 30, v = true;
  var labels = [
    jsav.label(n[0], {visible: v, left: (l + 0) + "px", top: (t + 0) + "px"}),
    jsav.label(n[1], {visible: v, left: (l + 40) + "px", top: (t + 0) + "px"}),
    jsav.label(n[2], {visible: v, left: (l + 75) + "px", top: (t + 0) + "px"}),
    jsav.label(n[3], {visible: v, left: (l + 120) + "px", top: (t + 0) + "px"}),
    jsav.label(n[4], {visible: v, left: (l + 160) + "px", top: (t + 0) + "px"}),
    jsav.label(n[5], {visible: v, left: (l + 200) + "px", top: (t + 0) + "px"}),
    jsav.label(n[6], {visible: v, left: (l + 240) + "px", top: (t + 0) + "px"}),
    jsav.label(n[7], {visible: v, left: (l + 280) + "px", top: (t + 0) + "px"}),
    jsav.label(n[8], {visible: v, left: (l + 320) + "px", top: (t + 0) + "px"}),
    jsav.label(n[9], {visible: v, left: (l + 360) + "px", top: (t + 0) + "px"}),
    jsav.label(n[10], {visible: v, left: (l + 400) + "px", top: (t + 0) + "px"}),
    jsav.label(n[11], {visible: v, left: (l + 440) + "px", top: (t + 0) + "px"}),
    jsav.label(n[12], {visible: v, left: (l + 480) + "px", top: (t + 0) + "px"}),
    jsav.label(n[13], {visible: v, left: (l + 520) + "px", top: (t + 0) + "px"}),
    jsav.label(n[14], {visible: v, left: (l + 560) + "px", top: (t + 0) + "px"})
  ];

  var messages = [
    "This is the same tree as the previous slide show. Lets try to find the key 9.",
    "First we look at the root. First disk access",
    "Since 10 is more than 9 we follow the left child.",
    "Since 5 if less than 9 we follow the right child. Second disk access",
    "Since 8 is less than 9 we follow the right child. Third disk access",
    "We found the node.",
    "This search could be made more efficient if we rearranged the layout of node on disk.",
    "This is one possible layout.",
    "Lets find the key 9 again.",
    "This time it only takes 2 disk accesses.",
    "The problem with this layout is that it is difficult to maintain, especially when trying to maintain a complete tree. For example, lets try to remove the root node.",
    "Next we need to rearrange the remaining nodes.",
    "As you can see a simple node removal may require access to several nodes."
  ];

  jsav.label("Disk Accesses:", {visible: true, left: 0, top: 0});
  var disk_access_count = jsav.ds.array([0], {left: 150, top: 0});
  disk_access_count.css({height: 30, width: 30});

  jsav.umsg(messages.shift());
  setNodeHighlightDefault(nodes[0]);
  jsav.displayInit();
  /* 1st Slide ***************************************************************/

  /* 2nd Slide ***************************************************************/
  jsav.umsg(messages.shift());
  jsav.step();

  /* 3rd Slide ***************************************************************/
  jsav.umsg(messages.shift());
  toggleNodeHighlight(nodes[0]);
  disk_access_count.value(0, 1);
  jsav.step();

  /* 4th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  toggleNodeHighlight(nodes[0]);
  toggleNodeHighlight(nodes[1]);
  jsav.step();

  /* 5th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  toggleNodeHighlight(nodes[1]);
  toggleNodeHighlight(nodes[4]);
  disk_access_count.value(0, 2);
  jsav.step();

  /* 6th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  toggleNodeHighlight(nodes[4]);
  toggleNodeHighlight(nodes[10]);
  disk_access_count.value(0, 3);
  jsav.step();

  /* 7th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  toggleNodeHighlight(nodes[10]);
  disk_access_count.value(0, "");
  jsav.step();

  /* 8th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  for (i = 0; i < n.length; i++) {
    if (i < 3) {
      nodes[i].css({"background-color": colors[0]});
    } else if (i < 7) {
      nodes[i].css({"background-color": colors[i - 2]});
    } else if (i < 9) {
      nodes[i].css({"background-color": colors[1]});
    } else if (i < 11) {
      nodes[i].css({"background-color": colors[2]});
    } else if (i < 13) {
      nodes[i].css({"background-color": colors[3]});
    }
  }
  labels[0].text(n[0]);
  labels[1].text(n[1]);
  labels[2].text(n[2]);
  labels[3].text(n[3]);
  labels[4].text(n[7]);
  labels[5].text(n[8]);
  labels[6].text(n[4]);
  labels[7].text(n[9]);
  labels[8].text(n[10]);
  labels[9].text(n[5]);
  labels[10].text(n[11]);
  labels[11].text(n[12]);
  labels[12].text(n[6]);
  labels[13].text(n[13]);
  labels[14].text(n[14]);
  jsav.step();

  /* 9th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  jsav.step();

  /* 10th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  toggleNodeHighlight(nodes[0]);
  toggleNodeHighlight(nodes[1]);
  toggleNodeHighlight(nodes[4]);
  toggleNodeHighlight(nodes[10]);
  disk_access_count.value(0, 2);
  jsav.step();

  /* 11th Slide ***************************************************************/
  jsav.umsg(messages.shift());
  toggleNodeHighlight(nodes[0]);
  toggleNodeHighlight(nodes[1]);
  toggleNodeHighlight(nodes[4]);
  toggleNodeHighlight(nodes[10]);
  disk_access_count.value(0, "");
//  jsav.step();

// CAS: The remaining slides temporarily commented out
// because the rebalancing gets the tree wrong, it is no longer a BST

  /* 12th Slide ***************************************************************/
//  jsav.umsg(messages.shift());
//  toggleNodeHighlight(nodes[0]);
//  nodes[0].value("");
//  disk_access_count.value(0, 1);
//  labels[0].text("");
//  jsav.step();

  /* 13th Slide ***************************************************************/
//  toggleNodeHighlight(nodes[2]);
//  toggleNodeHighlight(nodes[0]);
//  jsav.effects.moveValue(nodes[2], nodes[0]);
//  disk_access_count.value(0, 1);
//  labels[2].css({left: "30px"});
//  jsav.step();

  /* 14th Slide ***************************************************************/
//  toggleNodeHighlight(nodes[6]);
//  toggleNodeHighlight(nodes[2]);
//  jsav.effects.moveValue(nodes[6], nodes[2]);
//  disk_access_count.value(0, 2);
//  labels[12].css({left: "105px"});
//  jsav.step();

  /* 15th Slide ***************************************************************/
//  toggleNodeHighlight(nodes[14]);
//  toggleNodeHighlight(nodes[6]);
//  jsav.effects.moveValue(nodes[14], nodes[6]);
//  disk_access_count.value(0, 2);
//  labels[14].css({left: "510px"});
//  jsav.step();

  /* 16th Slide ***************************************************************/
//  jsav.umsg(messages.shift());
//  toggleNodeHighlight(nodes[14]);
//  nodes[14].remove();
//  jsav.step();

  jsav.recorded();
});
