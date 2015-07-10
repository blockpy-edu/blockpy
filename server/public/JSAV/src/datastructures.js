/**
* Module that contains the data structure implementations.
* Depends on core.js, anim.js, utils.js, effects.js
*/
/*global JSAV, jQuery, Raphael */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  // create a utility function as a jQuery "plugin"
  $.fn.getstyles = function() {
    // Returns the values of CSS properties that are given as
    // arguments. For example, $elem.getstyles("background-color", "color")
    // could return an object {"background-color" : "rgb(255, 120, 120)",
    //                         "color" : "rgb(0, 0, 0)"}
    var res = {},
      arg;
    for (var i = 0; i < arguments.length; i++) {
      arg = arguments[i];
      if ($.isArray(arg)) {
        for (var j = 0; j < arg.length; j++) {
          res[arg[j]] = this.css(arg[j]);
        }
      } else {
        res[arg] = this.css(arg);
      }
    }
    return res;
  };

  // common properties/functions for all data structures, these can be copied
  // to the prototype of a new DS using the addCommonProperties(prototype) function
  var JSAVDataStructure = function() {};
  JSAV.utils.extend(JSAVDataStructure, JSAV._types.JSAVObject);
  var dsproto = JSAVDataStructure.prototype;
  dsproto.getSvg = function() {
      if (!this.svg) { // lazily create the SVG overlay only when needed
        this.svg = new Raphael(this.element[0]);
        this.svg.renderfix();
        var style = this.svg.canvas.style;
        style.position = "absolute";
      }
      return this.svg;
    };
  dsproto._toggleVisible = JSAV.anim(JSAV.ext.effects._toggleVisible);
  dsproto.show = JSAV.ext.effects.show;
  dsproto.hide = JSAV.ext.effects.hide;
  dsproto.addClass = JSAV.utils._helpers.addClass;
  dsproto.removeClass = JSAV.utils._helpers.removeClass;
  dsproto.hasClass = JSAV.utils._helpers.hasClass;
  dsproto.toggleClass = JSAV.anim(JSAV.utils._helpers._toggleClass);
  // dummy methods for initializing a DS, the DS should override these
  dsproto.initialize = function() { };
  dsproto.initializeFromElement = function() { };
  dsproto.clone = function() {};



  // implementation for a tree edge
  var Edge = function(jsav, start, end, options) {
    this.jsav = jsav;
    this.startnode = start;
    this.endnode = end;
    this.options = $.extend(true, {"display": true}, options);
    this.container = start.container;
    var startPos = start?start.element.position():{left:0, top:0},
        endPos = end?end.element.position():{left:0, top:0};
    if (startPos.left === endPos.left && startPos.top === endPos.top) {
      // layout not done yet
      this.g = this.jsav.g.line(-1, -1, -1, -1, $.extend({container: this.container}, this.options));
    } else {
      if (end) {
        endPos.left += end.element.outerWidth() / 2;
        endPos.top += end.element.outerHeight();
      }
      if (!startPos.left && !startPos.top) {
        startPos = endPos;
      }
      this.g = this.jsav.g.line(startPos.left,
                              startPos.top,
                              endPos.left,
                              endPos.top, $.extend({container: this.container}, this.options));
    }

    this.element = $(this.g.rObj.node);

    var visible = (typeof this.options.display === "boolean" && this.options.display === true);
    this.g.rObj.attr({"opacity": 0});
    this.element.addClass("jsavedge");
    if (start) {
      this.element[0].setAttribute("data-startnode", this.startnode.id());
    }
    if (end) {
      this.element[0].setAttribute("data-endnode", this.endnode.id());
    }
    this.element[0].setAttribute("data-container", this.container.id());
    this.element.data("edge", this);

    if (typeof this.options.weight !== "undefined") {
      this._weight = this.options.weight;
      this.label(this._weight);
    }
    if (visible) {
      this.g.show();
    }
  };
  JSAV.utils.extend(Edge, JSAVDataStructure);
  var edgeproto = Edge.prototype;
  edgeproto.start = function(node, options) {
    if (typeof node === "undefined") {
      return this.startnode;
    } else {
      this.startnode = node;
      this.g.rObj.node.setAttribute("data-startnode", this.startnode?this.startnode.id():"");
      return this;
    }
  };
  edgeproto.end = function(node, options) {
    if (typeof node === "undefined") {
      return this.endnode;
    } else {
      this.endnode = node;
      this.g.rObj.node.setAttribute("data-endnode", this.endnode?this.endnode.id():"");
      return this;
    }
  };
  edgeproto._setweight = JSAV.anim(function(newWeight) {
    var oldWeight = this._weight;
    this._weight = newWeight;
    return [oldWeight];
  });
  edgeproto.weight = function(newWeight) {
    if (typeof newWeight === "undefined") {
      return this._weight;
    } else {
      this._setweight(newWeight);
      this.label(newWeight);
    }
  };
  edgeproto.clear = function() {
    this.g.rObj.remove();
  };
  edgeproto.hide = function(options) {
    if (this.g.isVisible()) {
      this.g.hide(options);
      if (this._label) { this._label.hide(options); }
    }
  };
  edgeproto.show = function(options) {
    if (!this.g.isVisible()) {
      this.g.show(options);
      if (this._label) { this._label.show(options); }
    }
  };
  edgeproto.isVisible = function() {
    return this.g.isVisible();
  };
  edgeproto.label = function(newLabel, options) {
    if (typeof newLabel === "undefined") {
      if (this._label && this._label.element.filter(":visible").size() > 0) {
        return this._label.text();
      } else {
        return undefined;
      }
    } else {
      if (!this._label) {
        var self = this;
        var _labelPositionUpdate = function(options) {
          if (!self._label) { return; } // no label, nothing to do
          var bbox = (options && options.bbox) ? options.bbox: self.g.bounds(),
              lbbox = self._label.bounds(),
              newTop = bbox.top + (bbox.height - lbbox.height)/2,
              newLeft = bbox.left + (bbox.width - lbbox.width)/2;
          if (newTop !== lbbox.top || newLeft || lbbox.left) {
            self._label.css({top: newTop, left: newLeft}, options);
          }
        };
        this._labelPositionUpdate = _labelPositionUpdate;
        this._label = this.jsav.label(newLabel, {container: this.container.element});
        this._label.element.addClass("jsavedgelabel");
      } else {
        this._label.text(newLabel, options);
      }
    }
  };

  edgeproto.equals = function(otherEdge, options) {
    if (!otherEdge || !otherEdge instanceof Edge) {
      return false;
    }
    //if (!options || !(typeof options.checkNodes === "boolean" && !options.checkNodes)) {
    if (options && !options.dontCheckNodes) {
      if (!this.startnode.equals(otherEdge.startnode) ||
                !this.endnode.equals(otherEdge.endnode)) {
        return false;
      }
    }
    // if edge weights are different, the edges are different
    if (this._weight !== otherEdge._weight) { return false; }

    // compare styling of the edges
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherEdge, options.css);
      if (!cssEquals) { return false; }
    }

    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherEdge, options["class"]);
      if (!classEquals) { return false; }
    }

    return true;
  };

  edgeproto._setcss = JSAV.anim(function(cssprop, value) {
    var oldProps = $.extend(true, {}, cssprop),
        el = this.g.rObj,
        newprops;
    if (typeof cssprop === "string" && typeof value !== "undefined") {
      oldProps[cssprop] = el.attr(cssprop);
      newprops = {};
      newprops[cssprop] = value;
    } else {
      for (var i in cssprop) {
        if (cssprop.hasOwnProperty(i)) {
          oldProps[i] = el.attr(i);
        }
      }
      newprops = cssprop;
    }
    if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
      el.animate(newprops, this.jsav.SPEED);
    } else {
      el.attr(newprops);
    }
    return [oldProps];
  });
  edgeproto.css = function(cssprop, value, options) {
    if (typeof cssprop === "string" && typeof value === "undefined") {
      return this.g.rObj.attr(cssprop);
    } else {
      return this._setcss(cssprop, value, options);
    }
  };
  edgeproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      this.g.css(newState.a); // set the css of the element
      JSAV.utils._helpers.setElementClasses(this.element, newState.cls || []); // set classes
      if (newState.l) { // set label
        this.label(newState.l, {record: false});
      } else if (this.label()) {
        this.label("");
      }
      if (newState.w) { // set weight
        this.weight(newState.w);
      } else if (this.weight()) {
        this.weight("");
      }
    } else {
      var state = {a: this.g.rObj.attrs}, // get all attrs set for the element
          cls = JSAV.utils._helpers.elementClasses(this.element); // get classes
      if (cls.length > 0) { state.cls = cls; }
      if (this.label()) { state.l = this.label(); } // label
      if (this._weight) { state.w = this.weight(); } // weight

      return state;
    }
  };
  edgeproto.position = function() {
    var bbox = this.g.bounds();
    return {left: bbox.left, top: bbox.top};
  };
  // add class handling functions
  edgeproto.addClass = function(className, options) {
    if (!this.element.hasClass(className)) {
      return this.toggleClass(className, options);
    } else {
      return this;
    }
  };
  edgeproto.removeClass = function(className, options) {
    if (this.element.hasClass(className)) {
      return this.toggleClass(className, options);
    } else {
      return this;
    }
  };
  edgeproto.hasClass = function(className) {
    return this.element.hasClass(className);
  };
  edgeproto.toggleClass = JSAV.anim(function(className, options) {
    this.element.toggleClass(className);
    return [className, options];
  });
  // add highlight/unhighlight functions, essentially only toggle jsavhighlight class
  edgeproto.highlight = function(options) {
    this.addClass("jsavhighlight", options);
  };
  edgeproto.unhighlight = function(options) {
    this.removeClass("jsavhighlight", options);
  };

  edgeproto.layout = function(options) {
    var sElem = this.start().element,
        eElem = this.end().element,
        start = (options && options.start)?options.start:this.start().position(),
        end = (options && options.end)?options.end:this.end().position(),
        sWidth = sElem.outerWidth()/2.0,
        sHeight = sElem.outerHeight()/2.0,
        eWidth = eElem.outerWidth()/2.0,
        eHeight = eElem.outerHeight()/2.0,
        fromX = (options && options.fromPoint)?options.fromPoint[0]:Math.round(start.left + sWidth),
        fromY = (options && options.fromPoint)?options.fromPoint[1]:Math.round(start.top + sHeight),
        toX = Math.round(end.left + eWidth),
        toY = Math.round(end.top + eHeight),
        fromAngle = normalizeAngle(2*Math.PI - Math.atan2(toY - fromY, toX - fromX)),
        toAngle = normalizeAngle(2*Math.PI - Math.atan2(fromY - toY, fromX - toX)),
        startRadius = parseInt(sElem.css("borderBottomRightRadius"), 10) || 0,
        ADJUSTMENT_MAGIC = 2.2, // magic number to work with "all" stroke widths
        strokeWidth = parseInt(this.g.element.css("stroke-width"), 10),
        // adjustment for the arrow drawn before the end of the edge line
        startStrokeAdjust = this.options["arrow-begin"]? strokeWidth * ADJUSTMENT_MAGIC:0,
        fromPoint = (options && options.fromPoint)?options.fromPoint:
                                    getNodeBorderAtAngle({width: sWidth + startStrokeAdjust,
                                                          height: sHeight + startStrokeAdjust,
                                                          x: fromX, y: fromY}, {x: toX, y: toY}, fromAngle, startRadius),
        // arbitrarily choose to use bottom-right border radius
        endRadius = parseInt(eElem.css("borderBottomRightRadius"), 10) || 0,
        // adjustment for the arrow drawn after the end of the edge line
        endStrokeAdjust = this.options["arrow-end"]?strokeWidth * ADJUSTMENT_MAGIC:0,
        toPoint = getNodeBorderAtAngle({width: eWidth + endStrokeAdjust, height: eHeight + endStrokeAdjust, x: toX, y: toY},
                                        {x: fromX, y: fromY}, toAngle, endRadius);
    // getNodeBorderAtAngle returns an array [x, y], and movePoints wants the point position
    // in the (poly)line as first item in the array, so we'll create arrays like [0, x, y] and
    // [1, x, y]
    this.g.movePoints([[0].concat(fromPoint), [1].concat(toPoint)], options);

    if ($.isFunction(this._labelPositionUpdate)) {
      var bbtop = Math.min(fromPoint[1], toPoint[1]),
          bbleft = Math.min(fromPoint[0], toPoint[0]),
          bbwidth = Math.abs(fromPoint[0] - toPoint[0]),
          bbheight = Math.abs(fromPoint[1] - toPoint[1]),
          bbox = {top: bbtop, left: bbleft, width: bbwidth, height: bbheight};
      this._labelPositionUpdate($.extend({bbox: bbox}, options));
    }

    if (this.start().value() === "jsavnull" || this.end().value() === "jsavnull") {
      this.addClass("jsavedge", options).addClass("jsavnulledge", options);
    } else {
      this.addClass("jsavedge", options).removeClass("jsavnulledge");
    }
  };

  // helper functions for edge position calculation
  function normalizeAngle(angle) {
    var pi = Math.PI;
    while (angle < 0) {
      angle += 2 * pi;
    }
    while (angle >= 2 * pi) {
      angle -= 2 * pi;
    }
    return angle;
  }

  // calculate the intersection of line from pointa to pointb and circle with the given center and radius
  function lineIntersectCircle(pointa, pointb, center, radius) {
    var result = {};
    var a = (pointb.x - pointa.x) * (pointb.x - pointa.x) + (pointb.y - pointa.y) * (pointb.y - pointa.y);
    var b = 2 * ((pointb.x - pointa.x) * (pointa.x - center.x) +(pointb.y - pointa.y) * (pointa.y - center.y));
    var cc = center.x * center.x + center.y * center.y + pointa.x * pointa.x + pointa.y * pointa.y -
                2 * (center.x * pointa.x + center.y * pointa.y) - radius * radius;
    var deter = b * b - 4 * a * cc;
    function interpolate(p1, p2, d) {
      return {x: p1.x+(p2.x-p1.x)*d, y:p1.y+(p2.y-p1.y)*d};
    }
    if (deter <= 0 ) {
      result.inside = false;
    } else {
      var e = Math.sqrt (deter);
      var u1 = ( - b + e ) / (2 * a );
      var u2 = ( - b - e ) / (2 * a );
      if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
        if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
          result.inside = false;
        } else {
          result.inside = true;
        }
      } else {
        if (0 <= u2 && u2 <= 1) {
          result.enter=interpolate (pointa, pointb, u2);
        }
        if (0 <= u1 && u1 <= 1) {
          result.exit=interpolate (pointa, pointb, u1);
        }
        result.intersects = true;
      }
    }
    return result;
  }

  function getNodeBorderAtAngle(dim, targetNodeCenter, angle, radius) {
    // dim: x, y coords of center and *half* of width and height
    // make sure they have non-zero values
    dim.width = Math.max(dim.width, 1);
    dim.height = Math.max(dim.height, 1);
    var x, y, pi = Math.PI,
        urCornerA = Math.atan2(dim.height*2.0, dim.width*2.0),
        ulCornerA = pi - urCornerA,
        lrCornerA = 2*pi - urCornerA,
        llCornerA = urCornerA + pi,
        intersect, topAngle, bottomAngle, leftAngle, rightAngle;
    // set the radius to be at most half the width or height of the element
    radius = Math.min(radius, dim.width, dim.height);
    // on the higher level, divide area (2pi) to four seqments based on which way the edge will be drawn:
    //  - right side (angle < 45deg or angle > 315deg)
    //  - top (45deg < angle < 135deg) or (pi/4 < angle < (3/4)*pi)
    //  - left side (135deg < angle < 225deg)
    //  - bottom (225deg < angle < 315deg)
    // Each of these areas will then be divided to three sections:
    //  - middle section, where the node border is a line
    //  - two sections where the node border is part of the rounded corner circle
    if (angle < urCornerA || angle > lrCornerA) { // on right side
      topAngle = Math.atan2(dim.height - radius, dim.width);
      bottomAngle = 2*pi - topAngle;
      // default to the right border line
      x = dim.x + dim.width;
      y = dim.y - dim.width * Math.tan(angle);

      // handle the rounded corners if necessary
      if (radius > 0 && angle > topAngle && angle < bottomAngle) { // the rounded corners
        // calculate intersection of the line between node centers and the rounded corner circle
        if (angle < bottomAngle && angle > pi) { // bottom right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter,
                                      {x: dim.x + dim.width - radius, y: dim.y + dim.height - radius}, radius);
        } else { // top right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter,
                                      {x: dim.x + dim.width - radius, y: dim.y - dim.height + radius}, radius);
        }
      }
    } else if (angle > ulCornerA && angle < llCornerA) { // left
      topAngle = pi - Math.atan2(dim.height - radius, dim.width);
      bottomAngle = 2*pi - topAngle;

      // default to the left border line
      x = dim.x - dim.width;
      y = dim.y + dim.width*Math.tan(angle);

      // handle the rounded corners
      if (radius > 0 && (angle < topAngle || angle > bottomAngle)) {
        if (topAngle > angle) { // top left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y - dim.height + radius}, radius); // circle
        } else { // bottom left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y + dim.height - radius}, radius); // circle
        }
      }
    } else if (angle <= ulCornerA) { // top
      rightAngle = Math.atan2(dim.height, dim.width - radius);
      leftAngle = pi - rightAngle;

      // default to the top border line
      y = dim.y - dim.height;
      x = dim.x + (dim.height)/Math.tan(angle);

      // handle the rounded corners
      if (radius > 0 && (angle > leftAngle || angle < rightAngle)) {
        if (angle > leftAngle) { // top left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y - dim.height + radius}, radius); // circle
        } else { // top right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x + dim.width - radius, y: dim.y - dim.height + radius}, radius); // circle
        }
      }
    } else { // on bottom side
      leftAngle = pi + Math.atan2(dim.height, dim.width-radius);
      rightAngle = 2*pi - Math.atan2(dim.height, dim.width-radius);

      // default to the bottom border line
      y = dim.y + dim.height;
      x = dim.x - (dim.height)/Math.tan(angle);
      if (radius > 0 && (angle < leftAngle || angle > rightAngle)) {
        if (angle > rightAngle) { // bottom right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x + dim.width - radius, y: dim.y + dim.height - radius}, radius); // circle
        } else { // bottom left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y + dim.height - radius}, radius); // circle
        }
      }
    }
    // if on a corner and we found an intersection, set that as the edge coordinates
    if (intersect && intersect.exit) {
      x = intersect.exit.x;
      y = intersect.exit.y;
    }
    return [Math.round(x), Math.round(y)];
  }


  var Node = function() {};
  JSAV.utils.extend(Node, JSAVDataStructure);
  var nodeproto = Node.prototype;

  nodeproto.value = function(newVal, options) {
    if (typeof newVal === "undefined") {
      return JSAV.utils.value2type(this.element.attr("data-value"), this.element.attr("data-value-type"));
    } else {
      this._setvalue(newVal, options);
    }
    return this;
  };
  nodeproto._setvalue = JSAV.anim(function(newValue) {
    var oldVal = this.value(),
      valtype = typeof(newValue);
    if (typeof oldVal === "undefined") {oldVal = ""};
    if (valtype === "object") { valtype = "string"; }
    this.element
      .find(".jsavvalue") // find the .jsavvalue element
      .html(this._valstring(newValue)) // set the HTML to new value
      .end() // go back to this.element
      .attr({"data-value": newValue, "data-value-type": valtype}); // set attributes
    return [oldVal];
  });
  nodeproto._valstring = function(value) {
    return "<span class='jsavvaluelabel'>" + value + "</span>";
  };
  nodeproto.highlight = function(options) {
    return this.addClass("jsavhighlight");
  };
  nodeproto.unhighlight = function(options) {
    return this.removeClass("jsavhighlight");
  };
  nodeproto.isHighlight = function() {
    return this.hasClass("jsavhighlight");
  };
  // NOTE: the state function only sets state of the node, not
  // things like edges out of the node
  nodeproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      this.value(newState.v, {record: false});
      JSAV.utils._helpers.setElementClasses(this.element, newState.cls || []);
      this.element.attr("style", newState.css || "");
    } else {
      var state = { v: this.value() },
        style = this.element.attr("style");
      var cls = JSAV.utils._helpers.elementClasses(this.element);
      if (cls.length > 0) {
        state.cls = cls;
      }
      if (style) {
        state.css = style;
      }
      return state;
    }
  };

  nodeproto.css = JSAV.utils._helpers.css;
  nodeproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  JSAV._types.ds = { "JSAVDataStructure": JSAVDataStructure, "Edge": Edge, "Node": Node };
  // expose the extend for the JSAV
  JSAV.ext.ds = {
    layout: { }
  };
}(jQuery));
