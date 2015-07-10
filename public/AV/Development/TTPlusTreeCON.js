"use strict";

(function () {
  var global = window.ttplustree;
  var av = new JSAV("tree");
  var leafList = [];
  var arrowList = [];

  var msg = [
    "Insert key-value pair (52, B).",
    "The 2-3+ plus tree is empty, so create a new leaf node and set is as the root node.",
    "Set the key-value pair (52, B) ",
    "Insert key-value pair (46, X).",
    "The root node is a leaf node, and the right key-value pair is empty. Since 46 is less than 52, we can move 52 over to the right and insert 46 on the left",
    "Insert key-value pair (33, D).",
    "The root node is a leaf node, and it is full. The root leaf node must be split.",
    "The middle (46) and highest (52) key go to the new node. The lowest key (33) goes to the old node and the smallest key on the new node gets promoted",
    "Link the two leaf nodes together.",
    "A new internal node is created. This is going to become the new root node",
    "Set the key of the internal node and add links to the leaf node.",
    "Insert key-value pair (22, J).",
    "First look at the root node. The new key (22) is less than the left value, so we follow the left child.",
    "This is a leaf node and there is space to insert the new key.",
    "The new key (22) is less than 33, so the key 33 is moved to the right and the new key is placed on the left.",
    "Insert key-value pair (71, M).",
    "First look at the root node. The new key (71) is greater than the left value, so we follow the center child.",
    "This is a leaf node and there is no more space to insert the new key.",
    "The leaf node has to be split.",
    "The middle (52) and highest (71) key values go to the new node. The lowest (46) key value stays in the old node and the smallest key on the new node gets promoted.",
    "Link the leaf nodes together",
    "The lowest value in the new node gets promoted and the links to the leaf nodes get updated",
    "Insert key-value pair (65, S)",
    "First look at the root node. The new key (65) is greater than the right value, so we follow the right child",
    "This is a leaf node and there is no more space to insert the new key.",
    "The leaf node has to be split",
    "The middle (65) and largest (71) key values go to the new node. The lowest (52) key value stays in the old node and the smalle key of the new node gets promoted.",
    "Link the leaf nodes together",
    "The lowest key (65) of the new node has to be promoted",
    "The parent node is full however.",
    "The parent node has to be split.",
    "The highest (65) key goes to the new node. The lowest key (46) stays in the old node and the middle key (52) gets promoted.",
    "Now update the pointers.",
    "The middle key (52) of the internal node now has to be promoted",
    "A new root has to be created.",
    "The new root is empty.",
    "The key can be inserted here.",
    "And the pointers are updated."
  ];

  function step(skip_message, init) {
    if (!skip_message) {
      av.umsg(msg.shift());
    }
    if (init) {
      av.displayInit();
    } else {
      av.step();
    }
  }

  // First Insert -------------------------------------------------------------

  // Slide 1
  // Create insert node
  var ins = global.newNode(av, ["52"], true, ["B"]); // Array for insert values
  ins.array.element.addClass('insert-node');
  var canvas = $(ins.array.element).parent();
  var w = $(canvas).innerWidth();
  var aw = $(ins.array.element).outerWidth();
  ins.move((w / 2) - aw, 0);
  var label = av.label("Insert:"); // Label for insert values
  label.addClass('helper-label insert-label');
  var lw = $(label.element).outerWidth();
  label.css({"left": (w - aw - lw - 25) + "px", "top": "25px"});
  step(false, true);

  // Slide 2
  var n1 = global.newNode(av, ["", ""], true, ["", ""]);
  var nw = $(n1.array.element).outerWidth(); // Node width
  var nhg = 30; // Node horizontal gap
  var nvg = 70; // Node vertical gap
  step();

  // Slide 3
  av.effects.moveValue(ins.array, 0, n1.array, 0);
  step();

  // Second Insert -------------------------------------------------------------

  // Slide 4
  ins.value(0, "46", "X");
  step();

  // Slide 5
  n1.array.swap(0, 1);
  step();

  // Slide 6
  av.effects.moveValue(ins.array, 0, n1.array, 0);
  step(true);

  // Third Insert -------------------------------------------------------------

  // Slide 7
  ins.value(0, "33", "D");
  step();

  // Slide 8
  var shift = ((nw) / 2) + (nhg / 2); // Horizontal shift for center nodes
  n1.move(-shift, 0);
  var n2 = global.newNode(av, ["", ""], true, ["", ""]);
  n2.move(shift, 0);
  var rect;
  rect = global.drawRectangle(av, rect, n1, n2);
  step();

  // Slide 9
  av.effects.moveValue(n1.array, 0, n2.array, 0);
  av.effects.moveValue(n1.array, 1, n2.array, 1);
  av.effects.moveValue(ins.array, 0, n1.array, 0);
  step();

  // Slide 10
  leafList.push(n1);
  leafList.push(n2);
  global.drawLeafArrows(av, leafList, arrowList);
  step();

  // Slide 11
  n1.move(0, nvg);
  n2.move(0, nvg);
  rect.translateY(nvg);
  global.drawLeafArrows(av, leafList, arrowList);
  var n3 = global.newNode(av, ["", ""], false);
  n3.addChild(n1);
  n3.addChild(n2);
  n3.hideEdges();
  step();

  // Slide 12
  rect.hide();
  n3.value(0, 46);
  n3.showEdges();
  step();

  // Fourth Insert -------------------------------------------------------------

  // Slide 13
  ins.value(0, "22", "J");
  step();

  // Slide 14
  n3.highlightToggle();
  n3.highlightToggleEdge(0);
  step();

  // Slide 15
  n3.highlightToggle();
  n3.highlightToggleEdge(0);
  n3.child(0).highlightToggle();
  step();

  // Slide 16
  n3.child(0).array.swap(0, 1);
  step();

  // Slide 17
  av.effects.moveValue(ins.array, 0, n3.child(0).array, 0);
  n3.child(0).highlightToggle();
  step(true);

  // Fifth Insert -------------------------------------------------------------

  // Slide 18
  ins.value(0, "71", "M");
  step();

  // Slide 19
  n3.highlightToggle();
  n3.highlightToggleEdge(1);
  step();

  // Slide 20
  n3.highlightToggle();
  n3.highlightToggleEdge(1);
  n3.child(1).highlightToggle();
  step();

  // Slide 21
  n3.child(1).highlightToggle();
  var n4 = global.newNode(av, ["", ""], true, ["", ""]);
  shift = nw + nhg;
  n4.move(shift, nvg);
  n3.addChild(n4);
  n3.hideEdges();
  shift = (nhg / 2) + (nw / 2);
  n3.child(0).move(-shift, 0);
  n3.child(1).move(-shift, 0);
  n3.updateEdges().showEdge(0).showEdge(1);
  global.drawLeafArrows(av, leafList, arrowList);
  rect = global.drawRectangle(av, rect, n3.child(1), n4);
  step();

  // Slide 22
  av.effects.moveValue(n3.child(1).array, 1, n3.child(2).array, 0);
  av.effects.moveValue(ins.array, 0, n4.array, 1);
  step();

  // Slide 23
  leafList.push(n4);
  global.drawLeafArrows(av, leafList, arrowList);
  step();

  // Slide 24
  n3.value(1, 52);
  n3.showEdges();
  rect.hide();
  step();

  // Sixth Insert -------------------------------------------------------------

  // Slide 25
  ins.value(0, "65", "S");
  step();

  // Slide 26
  n3.highlightToggle();
  n3.highlightToggleEdge(2);
  step();

  // Slide 27
  n3.highlightToggle();
  n3.highlightToggleEdge(2);
  n3.child(2).highlightToggle();
  step();

  // Slide 28
  n3.child(2).highlightToggle();
  var n5 = global.newNode(av, ["", ""], true, ["", ""]);
  shift = (nw * 1.5) + (nhg * 1.5);
  n5.move(shift, nvg);
  shift = (nw / 2) + (nhg / 2);
  n3.child(0).move(-shift);
  n3.child(1).move(-shift);
  n3.child(2).move(-shift);
  n3.updateEdges();
  global.drawLeafArrows(av, leafList, arrowList);
  rect = global.drawRectangle(av, rect, n3.child(2), n5);
  step();

  // Slide 29
  av.effects.moveValue(n3.child(2).array, 1, n5.array, 1);
  av.effects.moveValue(ins.array, 0, n5.array, 0);
  step();

  // Slide 30
  leafList.push(n5);
  global.drawLeafArrows(av, leafList, arrowList);
  step();

  // Slide 31
  step();

  // Slide 32
  n3.highlightToggle();
  step();

  // Slide 33
  n3.highlightToggle();
  var n6 = global.newNode(av, ["", ""], false, ["", ""]);
  shift = (nw / 2) + (nhg / 2) + ((nw + nhg) / 2);
  n3.move(-shift, 0);
  n6.move(shift, 0);
  n3.updateEdges();
  var rect2;
  rect2 = global.drawRectangle(av, rect2, n3, n6);
  step();

  // Slide 34
  n6.value(0, 65);
  n3.value(1, "");
  step();

  // Slide 35
  var child = n3.removeChild(2);
  n6.addChild(child);
  n6.addChild(n5);
  n6.updateEdges();
  rect.hide();
  step();

  // Slide 36
  step();

  // Slide 37
  var n7 = global.newNode(av, ["", ""], false, ["", ""]);
  n3.child(0).move(0, nvg);
  n3.child(1).move(0, nvg);
  n6.child(0).move(0, nvg);
  n6.child(1).move(0, nvg);
  rect2.translateY(nvg);
  n3.move(0, nvg);
  n6.move(0, nvg);
  n3.updateEdges();
  n6.updateEdges();
  global.drawLeafArrows(av, leafList, arrowList);
  step();

  // Slide 38
  n7.highlightToggle();
  step();

  // Slide 39
  n7.value(0, 52);
  n7.highlightToggle();
  step();

  // Slide 40
  n7.addChild(n3);
  n7.addChild(n6);
  n7.updateEdges();
  rect2.hide();
  step();

  av.recorded();
}());

(function () {
  var global = window.ttplustree;
  var av = new JSAV("find");
  var leafList, arrowList = [];

  var msg = [
    "Find <b>65</b>",
    "Find <b>15</b>",
    "Find <b>47</b>"
  ];

  function step(skip_message, init) {
    if (!skip_message) {
      av.umsg(msg.shift());
    }
    if (init) {
      av.displayInit();
    } else {
      av.step();
    }
  }

  // Setup initial tree state
  var root = global.newNode(av, ["52", ""], false);
  root.addChild(global.newNode(av, ["22", "46"], false));
  root.addChild(global.newNode(av, ["65", "71"], false));
  root.child(0).addChild(global.newNode(av, ["15", ""], true, ["J", ""]));
  root.child(0).addChild(global.newNode(av, ["22", "33"], true, ["X", "O"]));
  root.child(0).addChild(global.newNode(av, ["46", "47"], true, ["H", "L"]));
  root.child(1).addChild(global.newNode(av, ["52", ""], true, ["B", ""]));
  root.child(1).addChild(global.newNode(av, ["65", ""], true, ["S", ""]));
  root.child(1).addChild(global.newNode(av, ["71", "89"], true, ["W", "M"]));

  // Position tree nodes.
  var nw = $(root.array.element).outerWidth(); // Node width
  var nhg = 30; // Node horizontal gap
  var nvg = 70; // Node vertical gap

  var shift = (nw / 2) + (nhg / 2);
  root.child(0).child(0).move(-5 * shift, nvg * 2);
  root.child(0).child(1).move(-3 * shift, nvg * 2);
  root.child(0).child(2).move(-shift, nvg * 2);
  root.child(1).child(0).move(shift, nvg * 2);
  root.child(1).child(1).move(3 * shift, nvg * 2);
  root.child(1).child(2).move(5 * shift, nvg * 2);
  shift = shift * 3;
  root.child(0).move(-shift, nvg);
  root.child(1).move(shift, nvg);

  // Draw node edges
  root.updateEdges(true);
  leafList = root.getLeafs();
  global.drawLeafArrows(av, leafList, arrowList);

  // Create "find" node and label
  var find = global.newNode(av, [""], false); // Array for insert values
  find.array.element.addClass('find-node');
  var canvas = $(find.array.element).parent();
  var w = $(canvas).innerWidth();
  var aw = $(find.array.element).outerWidth();
  find.move((w / 2) - aw, 5);
  var label = av.label("Find:"); // Label for insert values
  label.addClass('helper-label find-label');
  var lw = $(label.element).outerWidth();
  label.css({"left": (w - aw - lw - 25) + "px", "top": "25px"});

  find.value(0, 65);
  step(false, true);

  // Find 65
  var result = global.findKey(av, 65, root, find);

  result.highlightToggle();
  find.highlightToggle();
  find.value(0, 15);
  step();

  // Find 15
  result = global.findKey(av, 15, root, find);

  result.highlightToggle();
  find.highlightToggle();
  find.value(0, 47);
  step();

  // Find 47
  global.findKey(av, 47, root, find);

  av.recorded();
}());

(function () {
  var global = window.ttplustree;
  var av = new JSAV("delete");
  var leafList, arrowList = [];

  var msg = [
    "Delete <b>51</b>. First we need to find the leaf node with matching key.",
    "This node has two key-value pairs. Therefore we can just delete the key-value pair.",
    "Next we update the parent keys",
    "Delete <b>70</b>. First we need to find the leaf node with matching key.",
    "This node has two key-value pairs. Therefore we can just delete the key-value pair.",
    "Delete <b>65</b>. First we need to find the leaf node with matching key.",
    "This node has only one key-value pair. Its right sibling however has two key-value pairs. " +
      "This means we can borrow a key-value pair from the right sibling. " +
      "(The left sibling only has one key-value pair, so we cannot borrow from it)",
    "First delete <b>65</b>",
    "Then move the smallest key from the sibling to the node.",
    "Now update the parent keys and shift the remaining key-value pair to the left.",
    "Delete <b>71</b>. First we need to find the leaf node with matching key.",
    "This node has only one key-value pair. " +
      "Its right and left siblings have only one key-value pair, however. " +
      "This means that we cannot borrow a key-value pair from either sibling.",
    "Therefore, this node has to be deleted.",
    "Now the parent node has to be updated.",
    "Delete <b>89</b>. First we need to find the leaf node with matching key.",
    "As with the previous deletion, this node only has one key-value pair and it is not possible to borrow from the right or left sibling.",
    "Therefore, this node has to be deleted",
    "The parent node now has an underflow, so it must borrow a leaf node from its sibling.",
    "Now the keys of the internal nodes are updated"
  ];

  function step(skip_message, init) {
    if (!skip_message) {
      av.umsg(msg.shift());
    }
    if (init) {
      av.displayInit();
    } else {
      av.step();
    }
  }

  // Setup initial tree state
  var root = global.newNode(av, ["51", ""], false);
  root.addChild(global.newNode(av, ["22", "46"], false));
  root.addChild(global.newNode(av, ["65", "71"], false));
  root.child(0).addChild(global.newNode(av, ["15", ""], true, ["J", ""]));
  root.child(0).addChild(global.newNode(av, ["22", "33"], true, ["X", "O"]));
  root.child(0).addChild(global.newNode(av, ["46", "47"], true, ["H", "L"]));
  root.child(1).addChild(global.newNode(av, ["51", "52"], true, ["B", "T"]));
  root.child(1).addChild(global.newNode(av, ["65", "70"], true, ["S", "F"]));
  root.child(1).addChild(global.newNode(av, ["71", "89"], true, ["W", "M"]));

  // Position tree nodes.
  var nw = $(root.array.element).outerWidth(); // Node width
  var nhg = 30; // Node horizontal gap
  var nvg = 70; // Node vertical gap

  var shift = (nw / 2) + (nhg / 2);
  root.child(0).child(0).move(-5 * shift, nvg * 2);
  root.child(0).child(1).move(-3 * shift, nvg * 2);
  root.child(0).child(2).move(-shift, nvg * 2);
  root.child(1).child(0).move(shift, nvg * 2);
  root.child(1).child(1).move(3 * shift, nvg * 2);
  root.child(1).child(2).move(5 * shift, nvg * 2);
  shift = shift * 3;
  root.child(0).move(-shift, nvg);
  root.child(1).move(shift, nvg);

  // Draw node edges
  root.updateEdges(true);
  leafList = root.getLeafs();
  global.drawLeafArrows(av, leafList, arrowList);

  // Create "del" node and label
  var del = global.newNode(av, [""], false); // Array for insert values
  del.array.element.addClass('delete-node');
  var canvas = $(del.array.element).parent();
  var w = $(canvas).innerWidth();
  var aw = $(del.array.element).outerWidth();
  del.move((w / 2) - aw, 5);
  var label = av.label("Delete:"); // Label for insert values
  label.addClass('helper-label delete-label');
  var lw = $(label.element).outerWidth();
  label.css({"left": (w - aw - lw - 25) + "px", "top": "25px"});

  del.value(0, 51);
  step(false, true);

  // Find 51
  var result = global.findKey(av, 51, root, del);

  // Delete 51
  del.highlightToggle();
  result.value(0, "");
  step();

  result.array.swap(1, 0);
  step(true);

  root.value(0, 52);
  result.highlightToggle();
  root.highlightToggle();
  root.child(1).highlightToggle();
  step();

  root.highlightToggle();
  root.child(1).highlightToggle();
  del.value(0, 70);
  step();

  // Find 70
  result = global.findKey(av, 70, root, del);

  // Delete 70
  del.highlightToggle();
  result.value(1, "");
  step();

  result.highlightToggle();
  del.value(0, 65);
  step();

  // Find 65
  result = global.findKey(av, 65, root, del);

  // Delete 65
  del.highlightToggle();
  step();

  result.value(0, "");
  step();

  var sibling = root.child(1).child(2);
  av.effects.moveValue(sibling.array, 0, result.array, 0);
  step();

  root.child(1).value(1, 89);
  root.child(1).value(0, 71);
  sibling.array.swap(0, 1);
  result.highlightToggle();
  step();

  del.value(0, 71);
  step();

  // Find 71
  result = global.findKey(av, 71, root, del);

  // Delete 71
  del.highlightToggle();
  step();

  result.array.hide(); // Hide node
  root.child(1).hideEdge(1);
  shift = nw + nhg;
  root.child(1).child(2).move(-shift, 0);
  root.child(1).drawEdge(2);
  leafList.splice(4, 1);
  arrowList.splice(3, 1)[0].hide();
  global.drawLeafArrows(av, leafList, arrowList);
  step();

  av.effects.moveValue(root.child(1).array, 1, root.child(1).array, 0);
  root.child(1).removeChild(1);
  root.child(1).updateEdges();
  step();

  del.value(0, 89);
  step();

  // Find 71
  global.findKey(av, 89, root, del);

  // Delete 89
  del.highlightToggle();
  step();

  root.child(1).removeChild(1).array.hide();
  root.child(1).updateEdges();
  root.child(1).value(0, "");
  leafList = root.getLeafs();
  arrowList.splice(3, 1)[0].hide();
  step();

  var node = root.child(0).removeChild(2);
  root.child(1).insertChild(0, node);
  shift = nw + nhg;
  global.moveNodes(leafList, shift, 0);
  shift = shift / 2;
  root.child(0).move(shift, 0);
  root.child(1).move(-shift, 0);
  root.updateEdges(true);
  global.drawLeafArrows(av, leafList, arrowList)
  step();

  av.effects.moveValue(root.array, 0, root.child(1).array, 0);
  av.effects.moveValue(root.child(0).array, 1, root.array, 0);
  step();

  av.recorded();
}());
