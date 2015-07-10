"use strict";
/*global ODSA */
$(document).ready(function () {
  // TODO: This block can be removed if / when a fixstate function is created
		    //  window.JSAV_EXERCISE_OPTIONS.fixmode = "undo";
		    //  ODSA.UTILS.parseURLParams();

  JSAV._types.ds.BinaryTree.prototype.insert = function (value) {
    // helper function to recursively insert
    var ins = function (node, insval) {
      var val = node.value();
      if (!val || val === "jsavnull") { // no value in node
        node.value(insval);
      } else if (val - insval >= 0) { // go left
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

  var oldfx;

  function turnAnimationOff() {
    //save the state of fx.off
    var oldfx = $.fx.off || false;
    //turn off the jQuery animations
    $.fx.off = true;
  }

  function restoreAnimationState() {
    $.fx.off = oldfx;
  }

  var bst = {};
  bst.turnAnimationOff = turnAnimationOff;
  bst.restoreAnimationState = restoreAnimationState;
  window.BST = bst;
});
