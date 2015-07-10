'use strict';
// Helper function for creating a pointer
function setPointer(name, obj) {
  return obj.jsav.pointer(name, obj, {
    visible: true,
    anchor: 'left top',
    myAnchor: 'right bottom',
    left: 20,
    top: -20
  });
}

function connect(objFrom, objTo, options) {
  var opts = $.extend({}, options);
  var left, top, nodeWidth, nodeHeight, fx, fy, tx, ty;

  if (typeof opts.index !== 'undefined') {
    left = objFrom.element.position().left;
    top = objFrom.element.position().top;
    fx = left + opts.index * 30 + 16;
    fy = top + 30;
    tx = objTo.element.position().left + objTo.element.outerWidth() / 2 - (opts.index + 1) % 2 * 20;
    ty = objTo.element.position().top + 10;
  } else {
    left = objFrom.element.position().left + objFrom.container.position().left;
    top = objFrom.element.position().top + objFrom.container.position().top;
    nodeWidth = objFrom.element.outerWidth();
    nodeHeight = objFrom.element.outerHeight();
    fx = left + (nodeWidth - 10) / 2;
    fy = top + nodeHeight / 2;
    tx = objTo.element.position().left + 100 * fx / 360;
    ty = objTo.element.position().top + 10;
  }
  return objFrom.jsav.g.line(fx, fy, tx, ty, {
    'arrow-end': 'classic-wide',
    'stroke-width': 2
  });
}
