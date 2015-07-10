"use strict";
// Helper function for creating a pointer
function setPointer(name, obj, index) {
  return obj.jsav.pointer(name, obj, {
    targetIndex : index,
    visible: true,
    anchor: "left top",
    myAnchor: "right bottom",
    left: 15,
    top: -20
  });
}

// JSAV extension for circular queue.
(function ($) {
  function sin(x) {
    return Math.sin(x * Math.PI / 180);
  }

  function cos(x) {
    return Math.cos(x * Math.PI / 180);
  }

  var Circular = function (jsav, cx, cy, r1, r2, options) {
    this.jsav = jsav;
    this.cx = cx;
    this.cy = cy;
    this.r1 = r1;
    this.r2 = r2;
    var defaultOptions = {};
    this.options = $.extend(defaultOptions, options);
    var x1, y1, x2, y2, x3, y3, x4, y4, label,
        i = 0, theta = 0, step = 30, pathString;
    this.path = [];
    this.labels = [];
    while (theta < 360) {
      x1 = cx + r1 * cos(theta);
      y1 = cy + r1 * sin(theta);
      x2 = cx + r2 * cos(theta);
      y2 = cy + r2 * sin(theta);
      theta += 30;
      x3 = cx + r2 * cos(theta);
      y3 = cy + r2 * sin(theta);
      x4 = cx + r1 * cos(theta);
      y4 = cy + r1 * sin(theta);
      theta -= 30;
      pathString = "M" + x2 + "," + y2;
      pathString += " A" + r2 + "," + r2 + " 1 0,1 " + x3 + "," + y3;
      pathString += " L" + x4 + "," + y4;
      pathString += " A" + r1 + "," + r1 + " 1 0,0 " + x1 + "," + y1;
      this.path[i] = this.jsav.g.path(pathString, this.options);
      label = this.jsav.label(" ");
      label.css({'position' : 'absolute',
                 left: cx + (r1 + r2) / 2 * cos(theta + 15) - 20 + 'px',
                 top: cy + (r1 + r2) / 2 * sin(theta + 15) - 25 + 'px',
                 width: '40px', height: '20px', 'text-align': 'center'});
      this.labels[i] = label;
      var test = this.jsav.label(i);
      test.css({'position' : 'absolute',
                 left: cx + (r1) / 100 * 78 * cos(theta + 15) - 20 + 'px',
                 top: cy + (r1) / 100 * 78 * sin(theta + 15) - 25 + 'px',
                 width: '40px', height: '20px', 'text-align': 'center'});
  
      i++;
      theta += 30;
    }
  };

  Circular.prototype.value = JSAV.anim(function (index, value) {
    var oldval = this.labels[index].element.html();
    this.labels[index].element.html(value);
    return [index, oldval];
  });
  Circular.prototype.highlight = function (index) {
    this.path[index]._setattrs({"fill": "yellow", "opacity": "0.5"});
  };
  Circular.prototype.unhighlight = function (index) {
    this.path[index]._setattrs({"fill": "none", "opacity": "1.0"});
  };
  Circular.prototype.pointer = function (name, index) {
    var degree = 15 + 30 * index;
    var left = cos(degree) * ((this.r2 - this.r1) / 2 * 1.8);
    var top = sin(degree) * ((this.r2 - this.r1) / 2 * 1.8);
    var fx, fy;
    var tx = this.r2 * cos(degree) + this.cx;
    var ty = this.r2 * sin(degree) + this.cy;
    left = tx + 32 * cos(degree + 15) - 20;
    if (degree + 15 < 180) {
      top = ty + 32 * sin(degree + 15);
    } else {
      top = ty + 32 * sin(degree + 15) - 22;
    }
    var pointer = {};
    pointer.label = this.jsav.label(name,
      {relativeTo: this.labels[index], anchor: "center",
       myAnchor: "center", left: 0, top: 0, width : 40});
    pointer.label.element.css({left : left, top : top});
    //this.value(index, tx.toFixed() + "," + ty.toFixed());
    fx = pointer.label.element.position().left +
         pointer.label.element.outerWidth() / 2;
    if (degree + 15 < 180) {
      fy = pointer.label.element.position().top;
    } else {
      fy = pointer.label.element.position().top + pointer.label.element.outerHeight();
    }
    pointer.arrow = this.jsav.g.line(fx, fy, tx, ty, {"stroke-width": 2, "arrow-end": "classic-wide-long"});
    // CAS: Stuck this in here to patch up positioning for now
    pointer.label.element.css({top: top - 15});
    return pointer;
  };

  JSAV.ext.circular = function (cx, cy, r1, r2, options) {
    return new Circular(this, cx, cy, r1, r2, $.extend({}, options));
  };
}(jQuery));
