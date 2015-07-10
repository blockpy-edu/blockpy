
(function ($) {
  "use strict";
  $(document).ready(init);

  // Tree array testing function
  function init($) {
    // Toggle between these two for common tree and array tree.
    // createArrayTree();
    // createCommonTree();
    createCommonTree2();
  }

  function createArrayTree() {
    var jsav = new JSAV("arrayTree");
    var tree = new jsav.ds.arraytree();

    // Add all nodes
    var r = tree.root([1,1]);
    r.addChild([2,2]);
    r.addChild([3,3]);
    r.addChild([4,4]);

    r.child(0).addChild([5,5]);
    r.child(0).addChild([6,6]);

    r.child(1).addChild([7,7]);
    r.child(1).addChild([8,8]);

    r.child(2).addChild([9,9]);
    r.child(2).addChild([10,10]);

    // Remove node at index 2 from root
    r.child(2, null);

    // Add nodes back plus an extra blank node
    r.addChild(["", ""]);
    r.addChild([4,4]);
    r.child(3).addChild([11, 11]);
    r.child(3).addChild([12, 12]);

    tree.layout();
  }

  function createCommonTree() {
    var jsav = new JSAV("other");
    var tree = new jsav.ds.tree();

    var r = tree.root(1);
    r.addChild(2);
    r.addChild(3);
    r.addChild(4);

    r.child(0).addChild(5);
    r.child(0).addChild(6);

    r.child(1).addChild(7);
    r.child(1).addChild(8);

    r.child(2).addChild(9);
    r.child(2).addChild(10);

    // Remove node at index 2 from root
    r.child(2, null);

    // Add nodes back plus an extra blank node
    r.addChild("");
    r.addChild(4);
    r.child(3).addChild(11);
    r.child(3).addChild(12);

    tree.layout();
  }

  function createCommonTree2() {
    var jsav = new JSAV("other");
    var tree = new jsav.ds.tree();

    var r = tree.root(1);
    r.addChild(2);
    r.addChild(3);
    r.addChild("");
    r.addChild(4);

    r.child(0).addChild(5);
    r.child(0).addChild(6);

    r.child(1).addChild(7);
    r.child(1).addChild(8);

    r.child(3).addChild(9);
    r.child(3).addChild(10);

    tree.layout();
  }
}(jQuery));
