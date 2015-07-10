(function () {
  "use strict";

  /**
   * Generate a colorized binary search tree.
   * @param root The root of the tree.
   * @param max_level The level depth to stop at.
   * @param level The current level of depth.
   * @param colors Array of colors from which to select the background.
   */
  function generateBSTNodes(root, max_level, level, colors) {
    if (level <= max_level) {
      var color_index;
      // Determine if left node will be created.
      if (Math.random() > window.ODSA.probability_threshold) {
        // Create new node.
        var new_left = root.left("");
        // Determine node background color.
        color_index = Math.floor((Math.random() * 100) % colors.length);
        new_left.css({"background-color": colors[color_index]});
        // Give node chosen property
        new_left.is_chosen = false;
        // Add node to bottom layer if level is last.
        if (level === max_level) {
          window.ODSA.bottom_layer.push(new_left);
        }
        generateBSTNodes(new_left, max_level, level + 1, colors);
      }

      // Determine if right node will be created.
      if (Math.random() > window.ODSA.probability_threshold) {
        // Determine if left node will be created.
        var new_right = root.right("");
        // Determine node background color.
        color_index = Math.floor((Math.random() * 100) % colors.length);
        new_right.css({"background-color": colors[color_index]});
        // Give node chosen property
        new_right.is_chosen = false;
        // Add node to bottom layer if level is last.
        if (level === max_level) {
          window.ODSA.bottom_layer.push(new_right);
        }
        generateBSTNodes(new_right, max_level, level + 1, colors);
      }
    }
  }

  /**
   * Examines a colorized binary search tree and determines the number of disk
   * accesses necessary to reach the selected node.
   * @param root The root of the tree.
   * @param disk_accesses The current number of disk access to get to the given
   *        tree node 'root'.
   */
  function getAnswer(root, disk_accesses) {
    if (root.is_chosen === true) {
      window.ODSA.disk_accesses = disk_accesses;
    } else {
      // Explore left child.
      if (typeof(root.left()) !== "undefined" && root.left() !== null) {
        if (root.css("background-color") !==
          root.left().css("background-color")) {
          getAnswer(root.left(), disk_accesses + 1);
        } else {
          getAnswer(root.left(), disk_accesses);
        }
      }

      // Explore right child.
      if (typeof(root.right()) !== "undefined" && root.right() !== null) {
        if (root.css("background-color") !==
          root.right().css("background-color")) {
          getAnswer(root.right(), disk_accesses + 1);
        } else {
          getAnswer(root.right(), disk_accesses);
        }
      }
    }
  }

  function initJSAV() {
    "use strict";

    reset();

    var jsav = new JSAV("colorizedBST");

    var bst = jsav.ds.binarytree({nodegap: 10});

    // Create color array
    var colors = ["#7BFF95", "#77CCFF", "#FF6F52", "#FFDE70", "#E39BCF"];

    // Get color for right and level 1 nodes.
    var color_root = Math.floor((Math.random() * 100) % colors.length);
    var color_right = Math.floor((Math.random() * 100) % colors.length);
    var color_left = Math.floor((Math.random() * 100) % colors.length);

    // Create tree.
    bst.root("").css({"background-color": colors[color_root]});
    bst.root().right("").css({"background-color": colors[color_right]});
    bst.root().left("").css({"background-color": colors[color_left]});

    // Randomly generate three more levels of nodes.
    while (window.ODSA.bottom_layer.length === 0) {
      window.ODSA.generateBSTNodes(bst.root().left(), 2, 0, colors);
      window.ODSA.generateBSTNodes(bst.root().right(), 2, 0, colors);
    }
    bst.layout();

    // Pick bottom layer node to be the chosen one at random.
    var chosen_index = Math.floor((Math.random() * 100) %
      window.ODSA.bottom_layer.length);
    var chosen_node = window.ODSA.bottom_layer[chosen_index];

    // Give the chosen node a grey glow to indicate that is has being selected.
    chosen_node.css({"box-shadow": "0 0 8px 6px rgba(0, 0, 0, 0.8)"});
    chosen_node.is_chosen = true;

    // Find the number of accesses to get to the chosen one.
    window.ODSA.getAnswer(bst.root(), 1);

    return bst.root();
  }

  function reset() {
    // Remove old colorized tree if any.
    if ($("#colorizedBST .jsavcanvas")) {
      $("#colorizedBST .jsavcanvas").remove();
    }

    ODSA.bottom_layer = [];
    ODSA.disk_accesses = 0;
  }

  var ODSA = {};
  ODSA.generateBSTNodes = generateBSTNodes;
  ODSA.getAnswer = getAnswer;
  ODSA.bottom_layer = [];
  ODSA.disk_accesses = 0;
  ODSA.probability_threshold = 0.3;
  ODSA.initJSAV = initJSAV;
  window.ODSA = ODSA;
}());
