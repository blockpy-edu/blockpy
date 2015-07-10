// Helper function for drawing arrow around the node
function arrowAround(node, options) {
  var jsav = node.jsav;
  var arrow;
  var nodeWidth = node.element.outerWidth();
  var nodeHeight = node.element.outerHeight();
  var nodegap = 40;
  var nextnode = node.next();
  if (nextnode) {
    nodegap = nextnode.element.offset().left - node.element.offset().left - nodeWidth;
  }
  var left = node.element.offset().left - jsav.container.find(".jsavcanvas:first").offset().left;
  var top = node.element.offset().top - jsav.container.find(".jsavcanvas:first").offset().top;
  var opts = $.extend({leftOffset: nodegap / 2,
                       rightOffset: nodegap / 2, topOffset: 15,
                       nodeGap: nodegap, nodeWidth: nodeWidth,
                       nodeHeight: nodeHeight}, options);

  arrow = jsav.g.polyline([[left - opts.nodeGap - 6, top + opts.nodeHeight / 2],
                           [left - opts.leftOffset, top + opts.nodeHeight / 2],
                           [left - opts.leftOffset, top - opts.topOffset],
                           [left + opts.nodeWidth + opts.rightOffset, top - opts.topOffset],
                           [left + opts.nodeWidth + opts.rightOffset, top + opts.nodeHeight / 2],
                           [left + opts.nodeWidth + opts.nodeGap + 1, top + opts.nodeHeight / 2]],
                           {"arrow-end": "classic-wide-long", "stroke-width": 2, "stroke-dasharray": "-"});
  return arrow;
}
