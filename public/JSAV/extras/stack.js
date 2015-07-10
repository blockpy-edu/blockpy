(function ($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  var Stack = function (jsav, values, options) {
    this.jsav = jsav;
    if (!$.isArray(values)) {
      options = values;
      values = [];
    }
    this.options = $.extend({visible: true, xtransition: 10, ytransition: -5, autoresize: true}, options);
    var el = this.options.element || $("<div/>");
    el.addClass("jsavstack");
    for (var key in this.options) {
      var val = this.options[key];
      if (this.options.hasOwnProperty(key) && typeof(val) === "string" || typeof(val) === "number" || typeof(val) === "boolean") {
        el.attr("data-" + key, val);
      }
    }
    if (!this.options.element) {
      $(jsav.canvas).append(el);
    }
    this.element = el;
    this.element.attr({"id": this.id()});
    if (this.options.autoresize) {
      el.addClass("jsavautoresize");
    }
    for (var i = values.length; i--; ) {
      this.addFirst(values[i]);
    }
    if (values.length > 0) {
      this.layout();
    }
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(Stack, JSAV._types.ds.List);
  var stackproto = Stack.prototype;

  stackproto.newNode = function (value, options) {
    return new StackNode(this, value, $.extend({first: false}, this.options, options));
  };

  stackproto.layout = function (options) {
    var layoutAlg = $.extend({}, this.options, options).layout || "_default";
    return this.jsav.ds.layout.stack[layoutAlg](this, options);
  };

  var StackNode = function (container, value, options) {
    this.jsav = container.jsav;
    this.container = container;
    this._next = options.next;
    this._value = value;
    this.options = $.extend(true, {visible: true}, options);
    var el = $("<div><span class='jsavvalue'>" + this._valstring(value) + "</span></div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavstacknode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if ("first" in options && options.first) {
      this.container.element.prepend(el);
    } else {
      this.container.element.append(el);
    }
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(StackNode, JSAV._types.ds.ListNode);
  var stacknodeproto = StackNode.prototype;


  stacknodeproto._setnext = JSAV.anim(function (newNext, options) {
    var oldNext = this._next;
    this._next = newNext;
    return [oldNext];
  });

  stacknodeproto.zIndex = JSAV.anim(function (index) {
    var oldVal = ~~this.element.css("z-index"),
        node = this;
    if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
      $({ z: oldVal }).animate({ z: index }, {
          step: function() {
              node.element.css('zIndex', ~~this.z);
          },
          duration: this.jsav.SPEED
      });
    } else {
      this.element.css("z-index", index);
    }
    return [oldVal];
  });

  var stackLayout = function (stack, options) {
    var curNode = stack.first(),
        prevNode,
        pos = {},
        xTrans = stack.options.xtransition,
        yTrans = stack.options.ytransition,
        opts = $.extend({}, stack.options, options),
        width = 0,
        height = 0,
        left = 0,
        posData = [],
        zPos;

    while (curNode) {
      if (prevNode) {
        pos = {
          left: pos.left + xTrans,
          top: pos.top + yTrans
        };
        zPos -= 1;
        width += Math.abs(xTrans);
        if ((yTrans < 0 && pos.top < posData[0].nodePos.top) || (yTrans > 0 && pos.top > posData[0].nodePos.top)) {
          height += Math.abs(yTrans);
        }
        if (stack.options.ytransition < 0) {
          yTrans += 1;
        }
      } else {
        pos = {
          left: (xTrans < 0? stack.size(): 0) * -xTrans,
          top: (yTrans < 0? Math.min(stack.size(), -yTrans): 0) * -(yTrans - 1)/2
        };
        zPos = stack.size();
        width = curNode.element.outerWidth();
        height = curNode.element.outerHeight();
      }
      posData.push({node: curNode, nodePos: pos, zPos: zPos});

      prevNode = curNode;
      curNode = curNode.next();
    }
    if (stack.size() === 0) {
      var tmpNode = stack.newNode("");
      width = tmpNode.element.outerWidth();
      height = tmpNode.element.outerHeight();
      tmpNode.clear();
    }

    if (stack.options.center) {
      left = ($(stack.jsav.canvas).width() - width) / 2;
    } else {
      left = stack.element.position().left;
    }

    if (!opts.boundsOnly) {
      // ..update stack size and position..
      stack.css({width: width, height: height, left: left});
      // .. and finally update the node positions
      // doing the size first makes the animation look smoother by reducing some flicker
      for (var i = 0; i < posData.length; i++) {
        var posItem = posData[i];
        posItem.node.zIndex(posItem.zPos);
        posItem.node.css(posItem.nodePos);
      }
    }
    return { width: width, height: height, left: left, top: stack.element.position().top };
  };

  JSAV.ext.ds.layout.stack = {
    "_default": stackLayout
  };

  JSAV.ext.ds.stack = function(values, options) {
    return new Stack(this, values, options);
  };

}(jQuery));