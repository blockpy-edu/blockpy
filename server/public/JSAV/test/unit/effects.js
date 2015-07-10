/*global ok,test,module,strictEqual,deepEqual,equal,expect,equals,notEqual,arrayUtils */
(function() {
  "use strict";
  module("effects.moveValue", {  });

  var checkArrayValues = function(arr, values) {
    for (var i = 0, l = values.length; i < l; i++) {
      strictEqual(arr.value(i), values[i]);
    }
  };
  var checkTreeValues = function(tree, values) {
    // Assumes tree has tree nodes and values three items!
    strictEqual(tree.root().value(), values[0]);
    strictEqual(tree.root().child(0).value(), values[1]);
    strictEqual(tree.root().child(1).value(), values[2]);
  };
  var checkListValues = function(list, values) {
    for (var i=0, l = values.length; i < l; i++) {
      strictEqual(list.get(i).value(), values[i]);
    }
  };

  test("Moving between arrays", function() {
    var values1 = [15, 26, 13, 19, 10],
        values2 = [152, 262, 132, 192, 102],
        emptyStrings = ["", "", "", "", ""],
        av = new JSAV("emptycontainer"),
        arr1 = av.ds.array(values1),
        arr2 = av.ds.array(values2);
    for (var i = 0; i < values1.length; i++) {
      av.effects.moveValue(arr1, i, arr2, i);
    }
    av.step();
    checkArrayValues(arr2, values1);
    checkArrayValues(arr1, emptyStrings);
    for (i = 0; i < values1.length; i++) {
      av.effects.moveValue(arr2, i, arr1, i);
    }
    checkArrayValues(arr1, values1);
    checkArrayValues(arr2, emptyStrings);
    av.recorded();

    $.fx.off = true;

    checkArrayValues(arr1, values1);
    checkArrayValues(arr2, values2);

    ok(av.forward());
    checkArrayValues(arr2, values1);
    checkArrayValues(arr1, emptyStrings);
    
    ok(av.forward());
    checkArrayValues(arr1, values1);
    checkArrayValues(arr2, emptyStrings);

    ok(!av.forward());
  });

  test("Moving between nodes", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.tree(),
        list = av.ds.list();
    tree.root().value("TR");
    tree.root().addChild("C0");
    tree.root().addChild("C1");

    list.addFirst("L2");
    list.addFirst("L1");
    list.addFirst("L0");

    av.displayInit();
    // move L0 to tree root
    av.effects.moveValue(list.first(), tree.root());
    av.step();

    checkTreeValues(tree, ["L0", "C0", "C1"]);
    checkListValues(list, ["", "L1", "L2"]);

    // move C1 to 2nd item in list (replace L1)
    av.effects.moveValue(tree.root().child(1), list.get(1));
    av.step();

    checkListValues(list, ["", "C1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", ""]);

    // move 2nd item in list to 3rd item (C1 to replace L2)
    av.effects.moveValue(list.get(1), list.get(2));
    av.step();

    checkListValues(list, ["", "", "C1"]);

    // move root's 1st child to root (C0 to replace L0)
    av.effects.moveValue(tree.root().child(0), tree.root());
    checkTreeValues(tree, ["C0", "", ""]);

    av.recorded(); // rewind

    $.fx.off = true; // disable smooth animation

    checkTreeValues(tree, ["TR", "C0", "C1"]);
    checkListValues(list, ["L0", "L1", "L2"]);

    ok(av.forward()); // redo L0 -> TR
    checkTreeValues(tree, ["L0", "C0", "C1"]);
    checkListValues(list, ["", "L1", "L2"]);
    ok(av.forward()); // redo C1 -> L1
    checkListValues(list, ["", "C1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", ""]);
    ok(av.forward()); // redo C1 -> L2
    checkListValues(list, ["", "", "C1"]);
    ok(av.forward()); // redo C0 -> L0
    checkTreeValues(tree, ["C0", "", ""]);

    ok(!av.forward()); // no more steps in animation
  });

  test("Moving between nodes and array", function() {
    var av = new JSAV("emptycontainer"),
        values = [152, 262, 132, 192, 102],
        arr = av.ds.array(values),
        tree = av.ds.tree(),
        list = av.ds.list();
  
    tree.root().value("TR");
    tree.root().addChild("C0");
    tree.root().addChild("C1");

    list.addFirst("L2");
    list.addFirst("L1");
    list.addFirst("L0");

    av.displayInit();
    // move from array index 2 to tree root (132 -> TR)
    av.effects.moveValue(arr, 2, tree.root());
    av.step();
    checkArrayValues(arr, [152, 262, "", 192, 102]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    // move from aray index 3 to list 2nd node (192 -> L1)
    av.effects.moveValue(arr, 3, list.get(1));
    av.step();
    checkArrayValues(arr, [152, 262, "", "", 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // move from list last to array index 0 (L2 -> 152)
    av.effects.moveValue(list.last(), arr, 0);
    av.step();
    checkArrayValues(arr, ["L2", 262, "", "", 102]);
    checkListValues(list, ["L0", 192, ""]);

    // move from tree root's 1st child to array index 4 (C0 -> 102)
    av.effects.moveValue(tree.root().child(0), arr, 4);
    checkArrayValues(arr, ["L2", 262, "", "", "C0"]);
    checkTreeValues(tree, [132, "", "C1"]);

    av.recorded(); // will rewind the animation

    $.fx.off = true; // disable smooth animation

    checkArrayValues(arr, values);
    checkTreeValues(tree, ["TR", "C0", "C1"]);
    checkListValues(list, ["L0", "L1", "L2"]);

    // (132 -> TR)
    ok(av.forward());
    checkArrayValues(arr, [152, 262, "", 192, 102]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    // (192 -> L1)
    ok(av.forward());
    checkArrayValues(arr, [152, 262, "", "", 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // (L2 -> 152)
    ok(av.forward());
    checkArrayValues(arr, ["L2", 262, "", "", 102]);
    checkListValues(list, ["L0", 192, ""]);

    // (C0 -> 102)
    ok(av.forward());
    checkArrayValues(arr, ["L2", 262, "", "", "C0"]);
    checkTreeValues(tree, [132, "", "C1"]);

    ok(!av.forward());
  });


  module("effects.copyValue", {  });

  test("Copying between arrays", function() {
    var values1 = [15, 26, 13, 19, 10],
        values2 = [152, 262, 132, 192, 102],
        emptyStrings = ["", "", "", "", ""],
        av = new JSAV("emptycontainer"),
        arr1 = av.ds.array(values1),
        arr2 = av.ds.array(values2);
    av.displayInit();
    for (var i = 0; i < values1.length; i++) {
      av.effects.copyValue(arr1, i, arr2, i);
    }
    checkArrayValues(arr2, values1);
    checkArrayValues(arr1, values1);

    av.step();
    av.effects.copyValue(arr1, 0, arr1, 2);
    checkArrayValues(arr2, values1);
    checkArrayValues(arr1, [15, 26, 15, 19, 10]);
    av.recorded();

    $.fx.off = true;

    checkArrayValues(arr1, values1);
    checkArrayValues(arr2, values2);

    ok(av.forward());
    checkArrayValues(arr1, values1);
    checkArrayValues(arr2, values1);
    
    ok(av.forward());
    checkArrayValues(arr1, [15, 26, 15, 19, 10]);
    checkArrayValues(arr2, values1);

    ok(!av.forward());
  });

  test("Copying between nodes", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.tree(),
        list = av.ds.list();
    tree.root().value("TR");
    tree.root().addChild("C0");
    tree.root().addChild("C1");

    list.addFirst("L2");
    list.addFirst("L1");
    list.addFirst("L0");

    av.displayInit();
    // copy L0 to tree root
    av.effects.copyValue(list.first(), tree.root());
    av.step();

    checkTreeValues(tree, ["L0", "C0", "C1"]);
    checkListValues(list, ["L0", "L1", "L2"]);

    // copy C1 to 2nd item in list (replace L1)
    av.effects.copyValue(tree.root().child(1), list.get(1));
    av.step();

    checkListValues(list, ["L0", "C1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", "C1"]);

    // copy 2nd item in list to 3rd item (C1 to replace L2)
    av.effects.copyValue(list.get(1), list.get(2));
    av.step();

    checkListValues(list, ["L0", "C1", "C1"]);

    // copy root's 1st child to root (C0 to replace L0)
    av.effects.copyValue(tree.root().child(0), tree.root());
    checkTreeValues(tree, ["C0", "C0", "C1"]);

    av.recorded(); // rewind

    $.fx.off = true; // disable smooth animation

    checkTreeValues(tree, ["TR", "C0", "C1"]);
    checkListValues(list, ["L0", "L1", "L2"]);

    ok(av.forward()); // redo L0 -> TR
    checkTreeValues(tree, ["L0", "C0", "C1"]);
    checkListValues(list, ["L0", "L1", "L2"]);
    ok(av.forward()); // redo C1 -> L1
    checkListValues(list, ["L0", "C1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", "C1"]);
    ok(av.forward()); // redo C1 -> L2
    checkListValues(list, ["L0", "C1", "C1"]);
    ok(av.forward()); // redo C0 -> L0
    checkTreeValues(tree, ["C0", "C0", "C1"]);

    ok(!av.forward()); // no more steps in animation
  });

  test("Copying between nodes and array", function() {
    var av = new JSAV("emptycontainer"),
        values = [152, 262, 132, 192, 102],
        arr = av.ds.array(values),
        tree = av.ds.tree(),
        list = av.ds.list();
  
    tree.root().value("TR");
    tree.root().addChild("C0");
    tree.root().addChild("C1");

    list.addFirst("L2");
    list.addFirst("L1");
    list.addFirst("L0");

    av.displayInit();
    // copy from array index 2 to tree root (132 -> TR)
    av.effects.copyValue(arr, 2, tree.root());
    av.step();
    checkArrayValues(arr, [152, 262, 132, 192, 102]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    // copy from aray index 3 to list 2nd node (192 -> L1)
    av.effects.copyValue(arr, 3, list.get(1));
    av.step();
    checkArrayValues(arr, [152, 262, 132, 192, 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // copy from list last to array index 0 (L2 -> 152)
    av.effects.copyValue(list.last(), arr, 0);
    av.step();
    checkArrayValues(arr, ["L2", 262, 132, 192, 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // copy from tree root's 1st child to array index 4 (C0 -> 102)
    av.effects.copyValue(tree.root().child(0), arr, 4);
    checkArrayValues(arr, ["L2", 262, 132, 192, "C0"]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    av.recorded(); // will rewind the animation

    $.fx.off = true; // disable smooth animation

    checkArrayValues(arr, values);
    checkTreeValues(tree, ["TR", "C0", "C1"]);
    checkListValues(list, ["L0", "L1", "L2"]);

    // (132 -> TR)
    ok(av.forward());
    checkArrayValues(arr, [152, 262, 132, 192, 102]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    // (192 -> L1)
    ok(av.forward());
    checkArrayValues(arr, [152, 262, 132, 192, 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // (L2 -> 152)
    ok(av.forward());
    checkArrayValues(arr, ["L2", 262, 132, 192, 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // (C0 -> 102)
    ok(av.forward());
    checkArrayValues(arr, ["L2", 262, 132, 192, "C0"]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    ok(!av.forward());
  });

  module("effects.swapValues", {  });
  test("Swapping between arrays", function() {
    var values1 = [15, 26, 13, 19, 10],
        values2 = [152, 262, 12, 192, 102],
        emptyStrings = ["", "", "", "", ""],
        av = new JSAV("emptycontainer"),
        arr1 = av.ds.array(values1),
        arr2 = av.ds.array(values2);
    av.displayInit();
    for (var i = 0; i < values1.length; i++) {
      av.effects.swapValues(arr1, i, arr2, i);
    }
    checkArrayValues(arr2, values1);
    checkArrayValues(arr1, values2);

    av.step();
    av.effects.swapValues(arr1, 0, arr1, 2);
    checkArrayValues(arr2, values1);
    checkArrayValues(arr1, [12, 262, 152, 192, 102]);
    av.recorded();
    $.fx.off = true;

    checkArrayValues(arr1, values1);
    checkArrayValues(arr2, values2);

    ok(av.forward());
    checkArrayValues(arr1, values2);
    checkArrayValues(arr2, values1);

    ok(av.forward());
    checkArrayValues(arr1, [12, 262, 152, 192, 102]);
    checkArrayValues(arr2, values1);

    ok(!av.forward());
  });

  test("Swap between nodes", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.tree(),
        list = av.ds.list();
    tree.root().value("TR");
    tree.root().addChild("C0");
    tree.root().addChild("C1");

    list.addFirst("L2");
    list.addFirst("L1");
    list.addFirst("L0");

    av.displayInit();
    // swap L0 with tree root
    av.effects.swapValues(list.first(), tree.root());
    av.step();

    checkListValues(list, ["TR", "L1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", "C1"]);

    // swap C1 with 2nd item in list L1
    av.effects.swapValues(tree.root().child(1), list.get(1));
    av.step();

    checkListValues(list, ["TR", "C1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", "L1"]);

    // swap 2nd item in list with 3rd item (C1 <-> L2)
    av.effects.swapValues(list.get(1), list.get(2));
    av.step();

    checkListValues(list, ["TR", "L2", "C1"]);

    // swap root's 1st child with root (C0 <-> L0)
    av.effects.swapValues(tree.root().child(0), tree.root());
    checkTreeValues(tree, ["C0", "L0", "L1"]);

    av.recorded(); // rewind

    $.fx.off = true; // disable smooth animation
    checkListValues(list, ["L0", "L1", "L2"]);
    checkTreeValues(tree, ["TR", "C0", "C1"]);

    ok(av.forward()); // redo L0 <-> TR
    checkListValues(list, ["TR", "L1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", "C1"]);
    ok(av.forward()); // redo C1 <-> L1
    checkListValues(list, ["TR", "C1", "L2"]);
    checkTreeValues(tree, ["L0", "C0", "L1"]);
    ok(av.forward()); // redo C1 -> L2
    checkListValues(list, ["TR", "L2", "C1"]);
    ok(av.forward()); // redo C0 -> L0
    checkTreeValues(tree, ["C0", "L0", "L1"]);

    ok(!av.forward()); // no more steps in animation
  });

  test("Swapping between nodes and array", function() {
    var av = new JSAV("emptycontainer"),
        values = [152, 262, 132, 192, 102],
        arr = av.ds.array(values),
        tree = av.ds.tree(),
        list = av.ds.list();
  
    tree.root().value("TR");
    tree.root().addChild("C0");
    tree.root().addChild("C1");

    list.addFirst("L2");
    list.addFirst("L1");
    list.addFirst("L0");

    av.displayInit();
    // swap array index 2 with tree root (132 <-> TR)
    av.effects.swapValues(arr, 2, tree.root());
    av.step();
    checkArrayValues(arr, [152, 262, "TR", 192, 102]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    // swap aray index 3 with list 2nd node (192 <-> L1)
    av.effects.swapValues(arr, 3, list.get(1));
    av.step();
    checkArrayValues(arr, [152, 262, "TR", "L1", 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // swap list last with array index 0 (L2 <-> 152)
    av.effects.swapValues(list.last(), arr, 0);
    av.step();
    checkArrayValues(arr, ["L2", 262, "TR", "L1", 102]);
    checkListValues(list, ["L0", 192, 152]);

    // swap tree root's 1st child with array index 4 (C0 <-> 102)
    av.effects.swapValues(tree.root().child(0), arr, 4);
    checkArrayValues(arr, ["L2", 262, "TR", "L1", "C0"]);
    checkTreeValues(tree, [132, 102, "C1"]);

    av.recorded(); // will rewind the animation

    $.fx.off = true; // disable smooth animation

    checkArrayValues(arr, values);
    checkTreeValues(tree, ["TR", "C0", "C1"]);
    checkListValues(list, ["L0", "L1", "L2"]);

    // (132 <-> TR)
    ok(av.forward());
    checkArrayValues(arr, [152, 262, "TR", 192, 102]);
    checkTreeValues(tree, [132, "C0", "C1"]);

    // (192 <-> L1)
    ok(av.forward());
    checkArrayValues(arr, [152, 262, "TR", "L1", 102]);
    checkListValues(list, ["L0", 192, "L2"]);

    // (L2 <-> 152)
    ok(av.forward());
    checkArrayValues(arr, ["L2", 262, "TR", "L1", 102]);
    checkListValues(list, ["L0", 192, 152]);

    // (C0 <-> 102)
    ok(av.forward());
    checkArrayValues(arr, ["L2", 262, "TR", "L1", "C0"]);
    checkTreeValues(tree, [132, 102, "C1"]);

    ok(!av.forward());
  });

})();