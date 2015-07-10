"use strict";
// Written by Jun Yang
// Various linked list helper functions

// Helper function for setting pointer to the left
function setPointerL(name, node) {
  return node.jsav.pointer(name, node, {anchor: "left top",
                                        myAnchor: "right bottom", left: 15});
}

// Helper function for setting pointer to the right
function setPointerR(name, node) {
  return node.jsav.pointer(name, node, {anchor: "right top",
                                        myAnchor: "left bottom", left: -10});
}

// JSAV node extensions
$(document).ready(function () {
  JSAV._types.ds.ListNode.prototype.addTail = function (opts) {
    var fx = $("#" + this.id()).position().left +
                     this.container.position().left + 34;
    var fy = $("#" + this.id()).position().top +
                     this.container.position().top + 47;
    var options = opts || {};

    if (options.left) {
      fx += options.left;
    }
    if (options.top) {
      fy += options.top;
    }
    if (options.visible === undefined) {
      options.visible = 100;
    }
    return this.jsav.g.line(fx, fy, fx + 10, fy - 31, {
      "opacity": options.visible,
      "stroke-width": 1
    });
  };

  JSAV._types.ds.ListNode.prototype.addVLine = function (opts) {
    var fx = $("#" + this.id()).position().left + this.container.position().left;
    var fy = $("#" + this.id()).position().top + this.container.position().top;
    var options = opts || {};
    if (options.left) {
      fx += options.left;
    }
    if (options.top) {
      fy += options.top;
    }
    if (options.visible === "undefined") {
      options.visible = 100;
    }
    return this.jsav.g.line(fx - 15, fy + 10, fx - 15, fy + 50,
                            {"opacity": options.visible, "stroke-width": 1});
  };
});
