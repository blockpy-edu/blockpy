/*global ok,test,module,deepEqual,equal,expect,notEqual,strictEqual */
(function() {
  "use strict";
  module("datastructures.tree", {  });
  test("Tree Root", function() {
    var av = new JSAV("emptycontainer");
    ok( av, "JSAV initialized" );
    ok( JSAV._types.ds.Tree, "Tree exists" );
    ok( JSAV._types.ds.TreeNode, "TreeNode exists" );
    var tree = av.ds.tree();
    ok(!tree.root().value());
    ok(!tree.root().parent());
    tree.root("R"); // set the value of root
    equal(tree.root().value(), "R");
    ok(av.backward()); // test undo
    ok(!tree.root().value());
    ok(av.forward());
    
    var newRoot = tree.newNode("NR"); // create a new nodee
    equal(tree.root().value(), "R");
    equal(newRoot.value(), "NR");
    av.step();
    tree.root(newRoot); // set the new node as root

    equal(tree.root().id(), newRoot.id());
    equal(tree.root().value(), newRoot.value());
    
    ok(av.backward()); // test undo of change of root
    equal(tree.root().value(), "R");
    
    ok(av.forward());
    av.step();
    tree.root("R3"); // set new root value
    equal(tree.root().id(), newRoot.id());
    equal(tree.root().value(), "R3");
    equal(newRoot.value(), "R3");

    ok(av.backward()); // test undo of change of root value
    equal(tree.root().id(), newRoot.id());
    equal(tree.root().value(), "NR");
    equal(newRoot.value(), "NR");
    
  });
  
  test("Tree Children", function() {
    var av = new JSAV("emptycontainer");
    ok( JSAV._types.ds.Tree, "Tree exists" );
    ok( JSAV._types.ds.TreeNode, "TreeNode exists" );
    var tree = av.ds.tree(),
        root = tree.root();
    tree.root("R"); // set the value of root
    
    equal(tree.root().children().length, 0);
    equal(tree.height(), 1);
    var n1 = tree.newNode("1");
    av.step();
    root.addChild(n1); // add child
    equal(root.children().length, 1);
    equal(root.child(0).id(), n1.id());
    equal(tree.height(), 2);
    
    ok(av.backward()); // test undo of add child
    equal(root.children().length, 0, "Number of children after undo adding of a child");
    ok(!root.child(0));
    equal(tree.height(), 1, "Tree height");
    
    ok(av.forward()); // test that redo works
    equal(root.children().length, 1);
    equal(root.child(0).id(), n1.id());
    equal(tree.height(), 2);
    
    var n2 = tree.newNode("2"),
        n3 = tree.newNode("3");
    av.step();
    root.addChild(n2).addChild(n3); // add children, test chaining as well
    equal(root.children().length, 3);
    equal(root.child(0).id(), n1.id());
    equal(root.child(1).id(), n2.id());
    equal(root.child(2).id(), n3.id());
    equal(tree.height(), 2);
    
    var n4 = tree.newNode("4");
    av.step();
    root.child(1, n4); // test replacing a child
    equal(root.children().length, 3);
    ok(!n2.parent());
    equal(root.child(0).id(), n1.id());
    equal(root.child(1).id(), n4.id());
    equal(root.child(2).id(), n3.id());
    equal(tree.height(), 2);
    ok(!n2.child(4));
    
    ok(av.backward(), "backward"); // test undo of replacing a child
    equal(root.children().length, 3);
    equal(root.child(0).id(), n1.id());
    equal(root.child(1).id(), n2.id());
    equal(root.child(2).id(), n3.id());
    equal(tree.height(), 2);
    
    ok(av.forward()); // redo last step
    var n21 = tree.newNode("n21"),
        n22 = tree.newNode("n22");
    av.step();
    n1.addChild(n21).addChild(n22); // add children to n2
    equal(n1.children().length, 2);
    equal(n21.parent().id(), n1.id());
    equal(n22.parent().id(), n1.id());
    equal(n1.child(0).id(), n21.id());
    equal(n1.child(1).id(), n22.id());
    equal(tree.height(), 3);
    
    ok(av.backward()); // test undo of adding children
    equal(n2.children().length, 0);
    ok(av.forward());
    
    av.step();
    n1.child(0, null);
    equal(n1.children().length, 1);
    equal(n1.child(0).id(), n22.id());
    equal(n21.parent(), undefined);
    equal(n22.parent().id(), n1.id());

    ok(av.backward());
    equal(n1.children().length, 2);
    equal(n21.parent().id(), n1.id());
    equal(n22.parent().id(), n1.id());
    equal(n1.child(0).id(), n21.id());
    equal(n1.child(1).id(), n22.id());
    ok(av.forward());

    equal(n1.children().length, 1);
    equal(n1.child(0).id(), n22.id());
    equal(n21.parent(), undefined);
    equal(n22.parent().id(), n1.id());
  });
  

  test("Tree Move Child", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.tree();
    tree.root("R");
    var r = tree.root();
    // add two children to root
    r.addChild("A");
    r.addChild("B");
    var a = r.child(0),
        b = r.child(1);

    // make sure child counts are correct
    equal(r.children().length, 2);
    equal(a.children().length, 0);
    equal(b.children().length, 0);
    av.step();
    // move one child to the child of the other
    a.addChild(b);

    equal(r.children().length, 1);
    equal(a.children().length, 1);
    equal(b.children().length, 0);
    equal(a.child(0).id(), b.id());

    av.backward(); // undo move
    equal(r.children().length, 2);
    equal(a.children().length, 0);
    equal(b.children().length, 0);
    equal(r.child(1).id(), b.id());

    av.forward(); // redo move
    equal(r.children().length, 1);
    equal(a.children().length, 1);
    equal(b.children().length, 0);
    equal(a.child(0).id(), b.id());

  });
  
  test("Tree Node Value", function() {
    var av = new JSAV("emptycontainer");
    ok( JSAV._types.ds.Tree, "Tree exists" );
    ok( JSAV._types.ds.TreeNode, "TreeNode exists" );
    var tree = av.ds.tree(),
        root = tree.root();
    tree.root("R"); // set the value of root
    deepEqual(root.value(), "R");

    av.step();
    root.value(4);
    deepEqual(root.value(), 4);

    ok(av.backward());
    deepEqual(root.value(), "R");

    ok(av.forward());
    deepEqual(root.value(), 4);
  });
  
  test("Tree Node Highlight", function() {
    var av = new JSAV("emptycontainer");
    var tree = av.ds.binarytree(),
        root = tree.root();
    tree.root("Ro").left("L").parent().right("R");
    var left = root.left(),
        right = root.right();
    av.step();
    ok(!left.isHighlight());
    ok(!right.isHighlight());
    ok(!root.isHighlight());
    
    left.highlight();
    av.step();
    right.highlight();
    av.step();
    root.highlight();

    ok(left.isHighlight());
    ok(right.isHighlight());
    ok(root.isHighlight());
    
    $.fx.off = true;
    av.recorded();
    ok(!left.isHighlight());
    ok(!right.isHighlight());
    ok(!root.isHighlight());

    av.end();
    $.fx.off = true;
    ok(left.isHighlight());
    ok(right.isHighlight());
    ok(root.isHighlight());

    ok(av.backward());
    ok(left.isHighlight());
    ok(right.isHighlight());
    ok(!root.isHighlight());

    ok(av.backward());
    ok(left.isHighlight());
    ok(!right.isHighlight());
    ok(!root.isHighlight());

    ok(av.backward());
    ok(!left.isHighlight());
    ok(!right.isHighlight());
    ok(!root.isHighlight());

    ok(av.backward());
    ok(!av.backward());
  });

  test("Tree Compare", function() {
    var av = new JSAV("emptycontainer"),
      t1 = av.ds.binarytree(),
      t2 = av.ds.binarytree();
    t1.root("Ro").left("L").left("LL").parent().parent().right("R");
    t2.root("Ro").left("L").left("LL").parent().parent().right("R");
    ok(t1.equals(t2));

    t1.root().value("Ri");
    ok(!t1.equals(t2), "Different values in root");

    t2.root().value("Ri");
    ok(t1.equals(t2), "Same values in root again");

    t1.root().left().left().right("LLR");
    ok(!t1.equals(t2), "Different nodes in the trees");
    t2.root().left().left().right("LLR");
    ok(t1.equals(t2), "Same nodes in the trees again");
    t2.root().left().left().right().remove();
    ok(!t1.equals(t2), "Different nodes in the trees");
    t1.root().left().left().right().remove();
    ok(t1.equals(t2), "Same nodes in the trees again");


    ok(t1.equals(t2, {"css": "background-color"}));
    t1.root().highlight();
    ok(t1.equals(t2));
    ok(!t1.equals(t2, {"css": "background-color"}));
    
    t2.root().highlight();
    ok(t1.equals(t2));
    ok(t1.equals(t2, {"css": "background-color"}));
    
    t1.root().left().highlight();
    ok(t1.equals(t2));
    ok(!t1.equals(t2, {"css": "background-color"}));
    
    t2.root().right().highlight();
    ok(t1.equals(t2));
    ok(!t1.equals(t2, {"css": "background-color"}));

    t2.root().left().highlight();
    ok(t1.equals(t2));
    ok(!t1.equals(t2, {"css": "background-color"}));

    t1.root().right().highlight();
    ok(t1.equals(t2));
    ok(t1.equals(t2, {"css": "background-color"}));

    t1.root().edgeToLeft().css({"stroke": "red"});
    ok(t1.equals(t2));
    ok(!t1.equals(t2, {"css": "stroke"}));

    // classes
    ok(t1.equals(t2, {"class": "jsavhighlight"}));
    ok(t1.equals(t2, {"class": ["jsavhighlight", "unknownClass"]}));
    t1.root().addClass("someClass");
    t1.root().addClass("someClass2");
    t2.root().addClass("someClass");
    ok(t1.equals(t2, {"class": "someClass"}));
    ok(!t1.equals(t2, {"class": "someClass2"}));
    ok(!t1.equals(t2, {"class": ["someClass", "someClass2", "unknownClass"]}));
  });

  test("Test tree state setting", function() {
    var av = new JSAV("emptycontainer"),
      tree1 = av.ds.tree(),
      tree2 = av.ds.tree(),
      tree3 = av.ds.tree();

    tree1.root("3").addChild("5").child(0).addChild("7").child(0).highlight();
    tree1.root().addChild(2).addChild("9").addClass("testing");
    tree1.root().css("background-color", "red");

    ok(!tree1.equals(tree2), "Different trees shouldn't be equal");
    ok(!tree1.equals(tree2, {css: "background-color", "class": ["testing", "jsavhighlight"]}), "Different trees shouldn't be equal");

    tree2.state(tree1.state());

    ok(tree1.equals(tree2), "After setting state, trees should be equal");
    ok(tree1.equals(tree2, {css: "background-color", "class": ["testing", "jsavhighlight"]}), "After setting state, trees should be equal");

    tree3.root("tree three");
    ok(!tree3.equals(tree1, {css: "background-color", "class": ["testing", "jsavhighlight"]}));
    tree1.state(tree3.state());
    ok(tree3.equals(tree1, {css: "background-color", "class": ["testing", "jsavhighlight"]}));
  });

  module("datastructures.binarytree", {  });
  test("Binary Tree Children", function() {
    var av = new JSAV("emptycontainer");
    ok (JSAV._types.ds.BinaryTree, "BinaryTree exists" );
    ok( JSAV._types.ds.BinaryTreeNode, "BinaryTreeNode exists" );
    var tree = av.ds.binarytree(),
        root = tree.root();
    equal(tree.root().children().length, 0);
    equal(tree.height(), 1);
    ok(!root.value());

    tree.root("R"); // set the value of root
    
    equal(tree.root().children().length, 0);
    equal(tree.height(), 1);
    var n1 = tree.newNode("1");
    av.step();
    root.left(n1); // add child
    equal(root.children().length, 2);
    equal(root.left().id(), n1.id());
    equal(tree.height(), 2);
    
    ok(av.backward()); // test undo of add child
    equal(root.children().length, 0, "Number of children after undo adding of a child");
    ok(!root.left());
    equal(tree.height(), 1, "Tree height");
    
    ok(av.forward()); // test that redo works
    equal(root.children().length, 2);
    equal(root.left().id(), n1.id());
    equal(tree.height(), 2);

    ok(!root.right());
    av.step();
    root.right("Right");
    equal(root.children().length, 2);
    equal(root.left().id(), n1.id());
    equal(root.right().value(), "Right");
    equal(tree.height(), 2);
    
    ok(av.backward());
    equal(root.children().length, 2);
    equal(root.left().id(), n1.id());
    equal(tree.height(), 2);

    ok(av.forward()); // test that redo works
    equal(root.children().length, 2);
    equal(root.left().id(), n1.id());
    equal(root.right().value(), "Right");
    equal(tree.height(), 2);
    

  });

  test("Binary Tree Move Child", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.binarytree();
    tree.root("R");
    var root = tree.root();
    // add two children to root
    root.left("A");
    root.right("B");
    var left = root.left(),
        right = root.right();

    // make sure child counts are correct
    equal(root.children().length, 2);
    equal(left.children().length, 0);
    equal(right.children().length, 0);
    av.step();
    // move one child to the child of the other
    left.right(right);

    // in order to do the layout, JSAV adds a null node as the other child
    equal(root.children().length, 2);
    ok(!root.right()); // .. but that child is empty
    equal(left.children().length, 2); // same for this...
    ok(!left.left());
    equal(right.children().length, 0);
    equal(left.right().id(), right.id());

    av.backward(); // undo move
    equal(root.children().length, 2);
    equal(left.children().length, 0);
    equal(right.children().length, 0);
    equal(root.right().id(), right.id());

    av.forward(); // redo move
    equal(root.children().length, 2);
    ok(!root.right());
    equal(left.children().length, 2);
    ok(!left.left());
    equal(right.children().length, 0);
    equal(left.right().id(), right.id());

  });
  
  test("Binary Tree Remove Child", function() {
    var av = new JSAV("emptycontainer");
    var tree = av.ds.binarytree(),
        root = tree.root();
    tree.root("Ro");
    var left = root.left("L");
    var right = root.right("R");

    av.step();
    root.left(null); // test removing left
    equal(root.children().length, 2);
    ok(!root.left());
    ok(!left.parent());
    equal(root.right().value(), "R");
    equal(tree.height(), 2);

    ok(av.backward()); //
    equal(root.children().length, 2);
    equal(left.parent().id(), root.id());
    equal(root.left().id(), left.id());
    equal(root.right().value(), "R");
    equal(tree.height(), 2);
    ok(av.forward());
    
    av.step();
    root.right(null); // test removing right
    equal(root.children().length, 0);
    ok(!root.left());
    ok(!left.parent());
    ok(!root.right());
    ok(!right.parent());
    equal(tree.height(), 1);

    ok(av.backward()); //
    equal(root.children().length, 2);
    ok(!root.left());
    ok(!left.parent());
    equal(root.right().value(), "R");
    equal(tree.height(), 2);
  });
  
  test("Binary Tree Edges", function() {
    var av = new JSAV("emptycontainer");
    ok (JSAV._types.ds.Edge, "Edge exists" );
    var tree = av.ds.binarytree(),
        root = tree.root();
    tree.root("Ro");
    var left = root.left("L");
    var right = root.right("R");
    equal(root.value(), "Ro");
    equal(root.left().value(), "L");
    equal(root.right().value(), "R");
    equal(left.value(), "L");
    equal(right.value(), "R");
    equal(left.parent().id(), root.id());
    equal(right.parent().id(), root.id());
    equal(left.edgeToParent().start().id(), left.id());
    equal(right.edgeToParent().start().id(), right.id());
    equal(left.edgeToParent().end().id(), root.id());
    equal(right.edgeToParent().end().id(), root.id());
    av.backward();
    av.forward();
    equal(left.edgeToParent().start().id(), left.id());
    equal(right.edgeToParent().start().id(), right.id());
    equal(left.edgeToParent().end().id(), root.id());
    equal(right.edgeToParent().end().id(), root.id());
    
    av.step();
    left.right("LR");
    left.right().left("LRL");
    var lr = left.right(),
        lrl = lr.left();
    equal(lr.value(), "LR");
    equal(lrl.value(), "LRL");
    equal(lrl.edgeToParent().end().id(), lr.id());
    equal(lr.edgeToParent().end().id(), left.id());
  });

  test("Test edge labels", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.binarytree(),
        root = tree.root();
    root.value("R");
    av.step();
    root.left("L", {edgeLabel: "R-L"});
    av.step();
    root.right("R");
    av.step();
    root.edgeToRight().label("R-R");
    av.recorded();

    av.forward();
    av.forward();
    equal(root.edgeToLeft().label(), "R-L");
    av.forward();
    strictEqual(root.edgeToRight().label(), undefined);
    av.forward();
    equal(root.edgeToRight().label(), "R-R");
    
  });


  test("Test show/hide", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.binarytree();

    equal(tree.element.filter(":visible").size(), 1, "Tree initially visible");
    tree.hide();
    av.step();
    equal(tree.element.filter(":visible").size(), 0, "Tree not visible after hide");
    tree.show();
    av.step();
    equal(tree.element.filter(":visible").size(), 1, "Tree again visible after show");
    tree.show();
    av.step();
    equal(tree.element.filter(":visible").size(), 1, "Tree visible after another show");
    tree.hide();
    av.step();
    equal(tree.element.filter(":visible").size(), 0, "Tree not visible after hide");
    tree.hide();
    av.step(); // need to add another step, since the empty last step is pruned
    equal(tree.element.filter(":visible").size(), 0, "Tree not visible after another hide");
    av.recorded();
    jQuery.fx.off = true;
    av.end();
    equal(tree.element.filter(":visible").size(), 0);
    av.backward();
    equal(tree.element.filter(":visible").size(), 0, "Undoing hiding hidden should keep it hidden");
    av.begin();
    av.forward(); // redo hide
    av.forward(); // redo show
    av.forward(); // redo another show
    equal(tree.element.filter(":visible").size(), 1, "Tree visible after another show");
    av.backward(); // undo showing a visible Tree
    equal(tree.element.filter(":visible").size(), 1, "Undoing show of a visible should keep it visible");
  });

  test("Tree show/hide recursive", function() {
    var av = new JSAV("emptycontainer"),
        tree = av.ds.binarytree({visible: false});

    var checkVisibility = function(values) {
      equal(tree.element.filter(":visible").size(), values[0], "check tree visibility");
      equal(tree.root().element.filter(":visible").size(), values[1], "check root visibility");
      equal(tree.root().left().element.filter(":visible").size(), values[2], "check left child visibility");
      equal(tree.root().right().element.filter(":visible").size(), values[3], "check right child visibility");
      equal(tree.root().left().left().element.filter(":visible").size(), values[4]);
    };
    tree.root("Ro");
    tree.root().left("L");
    tree.root().right("R");
    tree.root().left().left("LL");
    checkVisibility([0, 0, 0, 0, 0]);

    av.displayInit();
    tree.show();
    checkVisibility([1, 1, 1, 1, 1]);

    av.step();
    tree.root().hide(); // should recursively hide all nodes; not tree
    checkVisibility([1, 0, 0, 0, 0]);

    av.step();
    tree.hide(); // hide everything

    av.step();
    tree.show({recursive: false}); // show tree, not recursive
    tree.root().show({recursive: false}); // show root
    tree.root().left().show(); // show left child of root
    checkVisibility([1, 1, 1, 0, 1]);

    av.step();
    tree.show(); // show everything

    av.step();
    tree.root().hide({recursive: false}); // hide root
    // edges from root to children should still be hidden
    ok(!tree.root().left().edgeToParent().isVisible());
    ok(!tree.root().right().edgeToParent().isVisible());
    tree.root().left().hide(); // hide left child of root
    checkVisibility([1, 0, 0, 1, 0]);
    av.recorded();
    $.fx.off = true;

    av.begin();
    av.end();
    av.begin();

    checkVisibility([0, 0, 0, 0, 0]);
    av.forward(); // redo show tree
    checkVisibility([1, 1, 1, 1, 1]);
    av.forward(); // redo hide root recursively
    checkVisibility([1, 0, 0, 0, 0]);
    av.forward(); // redo hide tree
    av.forward(); // redo show tree and root not recursively, show left child of root
    checkVisibility([1, 1, 1, 0, 1]);
    av.forward(); // show tree
    av.forward(); // hide tree and root (non-recursive), hide left child of root
    checkVisibility([1, 0, 0, 1, 0]);

  });


  test("Test click event", function() {
    expect(6);
    var handler1 = function(event) {
      ok(event);
    };
    var handler2 = function(myval, event) {
      equal(myval, "kissa");
      ok(event);
    };
    var handler3 = function(myval, myval2, event) {
      equal(myval, "kissa");
      equal(myval2, "koira");
      ok(event);
    };
    var av = new JSAV("arraycontainer"),
        tree1 = av.ds.tree(),
        tree2 = av.ds.binarytree(),
        tree3 = av.ds.binarytree();
    var setup = function(tree) {
      tree.root("r");
      var r = tree.root();
      r.addChild(0);
      r.addChild(2);
    };
    setup(tree1);
    setup(tree2);
    setup(tree3);
    tree1.click(handler1);
    tree2.click(["kissa"], handler2);
    tree3.click(["kissa", "koira"], handler3);
    tree1.element.find(".jsavnode:eq(2)").click();
    tree2.element.find(".jsavnode:eq(0)").click();
    tree3.element.find(".jsavnode:eq(1)").click();
  });

  test("Test on event binding and custom events", function() {
    expect(6);
    var handler1 = function(event) {
      ok(event);
    };
    var handler2 = function(myval, event) {
      equal(myval, "kissa");
      ok(event);
    };
    var handler3 = function(myval, myval2, event) {
      equal(myval, "kissa");
      equal(myval2, "koira");
      ok(event);
    };
    var av = new JSAV("arraycontainer"),
        tree1 = av.ds.tree(),
        tree2 = av.ds.binarytree(),
        tree3 = av.ds.binarytree();
    var setup = function(tree) {
      tree.root("r");
      var r = tree.root();
      r.addChild(0);
      r.addChild(2);
    };
    setup(tree1);
    setup(tree2);
    setup(tree3);
    tree1.on("jsavclick", handler1);
    tree2.on("jsavclick", "kissa", handler2);
    tree3.on("jsavclick", ["kissa", "koira"], handler3);
    tree1.element.find(".jsavnode:eq(2)").trigger("jsavclick");
    tree2.element.find(".jsavnode:eq(0)").trigger("jsavclick");
    tree3.element.find(".jsavnode:eq(1)").trigger("jsavclick");
  });

  test("Test binary tree state setting", function() {
    var av = new JSAV("emptycontainer"),
        bt1 = av.ds.binarytree(),
        bt2 = av.ds.binarytree(),
        bt3 = av.ds.binarytree();

    bt1.root("3").left("5").right("7").highlight();
    bt1.root().right(2).right("9").addClass("testing").left(3);
    bt1.root().css("background-color", "red");

    ok(!bt1.equals(bt2), "Different trees shouldn't be equal");
    ok(!bt1.equals(bt2, {css: "background-color", "class": ["testing", "jsavhighlight"]}), "Different trees shouldn't be equal");

    bt2.state(bt1.state());

    ok(bt1.equals(bt2), "After setting state, trees should be equal");
    ok(bt1.equals(bt2, {css: "background-color", "class": ["testing", "jsavhighlight"]}), "After setting state, trees should be equal");

    bt3.root("tree three");
    ok(!bt3.equals(bt1, {css: "background-color", "class": ["testing", "jsavhighlight"]}));
    bt1.state(bt3.state());
    ok(bt3.equals(bt1, {css: "background-color", "class": ["testing", "jsavhighlight"]}));
  });
}());
