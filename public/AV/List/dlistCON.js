'use strict';
// Helper function for creating a pointer
function setPointer(name, obj) {
  return obj.jsav.pointer(name, obj, {
    visible: true,
    anchor: 'left top',
    myAnchor: 'right bottom',
    left: 20,
    top: -15
  });
}

// Helper function for drawing arrow around the node
function arrowAround(node, type, options) {
  var jsav = node.jsav;
  var arrow;
  var nodeWidth = node.element.outerWidth();
  var nodeHeight = node.element.outerHeight();
  var nodegap = 40;
  var nextnode = node.next();
  if (nextnode) {
    nodegap = nextnode.element.offset().left - node.element.offset().left - nodeWidth;
  }
  var left = node.element.offset().left - jsav.container.find('.jsavcanvas:first').offset().left;
  var top = node.element.offset().top - jsav.container.find('.jsavcanvas:first').offset().top;
  var opts = $.extend({
      leftOffset: nodegap / 2,
      rightOffset: nodegap / 2,
      topOffset: 15,
      nodeGap: nodegap,
      nodeWidth: nodeWidth,
      nodeHeight: nodeHeight
    }, options);
  if (type === 'top') {
    arrow = jsav.g.polyline([
      [
        left - opts.nodeGap - 6,
        top + opts.nodeHeight / 3
      ],
      [
        left - opts.leftOffset,
        top + opts.nodeHeight / 3
      ],
      [
        left - opts.leftOffset,
        top - opts.topOffset
      ],
      [
        left + opts.nodeWidth + opts.rightOffset,
        top - opts.topOffset
      ],
      [
        left + opts.nodeWidth + opts.rightOffset,
        top + opts.nodeHeight / 3
      ],
      [
        left + opts.nodeWidth + opts.nodeGap + 1,
        top + opts.nodeHeight / 3
      ]
    ], {
      'arrow-end': 'classic-wide-long',
      'stroke-width': 2
    });
  } else if (type === 'down') {
    arrow = jsav.g.polyline([
      [
        left + opts.nodeWidth + opts.nodeGap + 6,
        top + opts.nodeHeight / 3 * 2
      ],
      [
        left + opts.nodeWidth + opts.rightOffset,
        top + opts.nodeHeight / 3 * 2
      ],
      [
        left + opts.nodeWidth + opts.rightOffset,
        top + nodeHeight + opts.topOffset
      ],
      [
        left - opts.leftOffset,
        top + nodeHeight + opts.topOffset
      ],
      [
        left - opts.leftOffset,
        top + opts.nodeHeight / 3 * 2
      ],
      [
        left - opts.nodeGap - 1,
        top + opts.nodeHeight / 3 * 2
      ]
    ], {
      'arrow-end': 'classic-wide-long',
      'stroke-width': 2
    });
  }
  return arrow;
}

// Add two edges between two nodes
function addEdge(node1, node2) {
  var edges = {};
  var jsav = node1.jsav;
  var nodeWidth = node1.element.outerWidth();
  var nodeHeight = node1.element.outerHeight();
  var edge1_fx = node1.element.position().left + node1.container.position().left + nodeWidth - 6;
  var edge1_fy = node1.element.position().top + node1.container.position().top + nodeHeight / 3;
  var edge1_tx = node2.element.position().left + node2.container.position().left;
  var edge1_ty = node2.element.position().top + node2.container.position().top + nodeHeight / 3;

  var edge2_fx = node2.element.position().left + node2.container.position().left + 6;
  var edge2_fy = node2.element.position().top + node2.container.position().top + nodeHeight / 3 * 2;
  var edge2_tx = node1.element.position().left + node1.container.position().left + nodeWidth;
  var edge2_ty = node1.element.position().top + node1.container.position().top + nodeHeight / 3 * 2;


  edges.topEdge = jsav.g.line(edge1_fx, edge1_fy + 15, edge1_tx, edge1_ty + 15, {
    'arrow-end': 'classic-wide-long',
    'stroke-width': 2,
    'stroke-dasharray': '-'
  });
  edges.bottomEdge = jsav.g.line(edge2_fx, edge2_fy + 15, edge2_tx, edge2_ty + 15, {
    'arrow-end': 'classic-wide-long',
    'stroke-width': 2,
    'stroke-dasharray': '-'
  });
  edges.hide = function () {
    edges.topEdge.hide();
    edges.bottomEdge.hide();
  };
  edges.show = function () {
    edges.topEdge.hide();
    edges.bottomEdge.hide();
  };
  return edges;
}
// JSAV extension
(function ($) {
  JSAV._types.ds.DListNode.prototype.odsa_addSlash = function (type, opts) {
    var fx = this.element.position().left + this.container.position().left + 42;
    var fy = this.element.position().top + this.container.position().top + 47;
    if (type === 'left') {
      fx = this.element.position().left + this.container.position().left + 2;
    }

    var options = opts || {};
    if (options.left) {
      fx += options.left;
    }
    if (options.top) {
      fy += options.top;
    }
    if (options.visible === 'undefined') {
      options.visible = 100;
    }
    return this.jsav.g.line(fx, fy, fx + 10, fy - 31, {
      'opacity': options.visible,
      'stroke-width': 1
    });
  };

  JSAV._types.ds.DListNode.prototype.odsa_addVLine = function (opts) {
    var fx = this.element.position().left + this.container.position().left;
    var fy = this.element.position().top + this.container.position().top + 15;
    var nodeWidth = this.element.outerWidth();
    var nodeHeight = this.element.outerHeight();
    var nodegap = this.element.offset().left - this.prev().element.offset().left - nodeWidth;
    var options = opts || {};
    if (options.left) {
      fx += options.left;
    }
    if (options.top) {
      fy += options.top;
    }
    if (options.visible === 'undefined') {
      options.visible = 100;
    }
    return this.jsav.g.line(fx - nodegap / 2, fy - 5, fx - nodegap / 2, fy + 35, {
      'opacity': options.visible,
      'stroke-width': 1
    });
  };
}(jQuery));
