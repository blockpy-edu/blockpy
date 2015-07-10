/**
* Module that contains the linked list data structure implementations.
* Depends on core.js, datastructures.js, anim.js, utils.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  var Edge = JSAV._types.ds.Edge;

  var List = function(jsav, options) {
    this.jsav = jsav;
    this.options = $.extend({visible: true, nodegap: 40, autoresize: true}, options);
    var el = this.options.element || $("<div/>");
    el.addClass("jsavlist");
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
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(List, JSAV._types.ds.JSAVDataStructure);
  var listproto = List.prototype;
  listproto.first = function(newFirst, options) {
    if (typeof newFirst === "undefined") {
      return this._first;
    } else {
      return this.addFirst(newFirst, options);
    }
  };
  listproto._setfirst = JSAV.anim(function(newFirst) {
    var oldFirst = this._first;
    this._first = newFirst;
    return [oldFirst];
  });
  listproto.add = function(index, newValue, options) {
    if (index < 0 || index > this.size()) { return this; }
    if (index === 0) {
      return this.addFirst(newValue, options);
    }
    var node = this.get(index - 1),
      newNode;
    if (newValue instanceof ListNode) {
      newNode = newValue;
    } else {
      newNode = this.newNode(newValue);
    }
    if (node) { // there is node for the index
      newNode.next(node.next(), options);
      node.next(newNode, options);
    }
    return this;
  };
  listproto.addFirst = function(newValue, options) {
    if (newValue instanceof ListNode) {
      newValue.next(this._first, options);
      this._setfirst(newValue, options);
    } else {
      this._setfirst(this.newNode(newValue, $.extend({}, options, {first: true, next: this._first})), options);
    }
    return this;
  };
  /** returns the last item in the list or if newLast is given, adds it to the end */
  listproto.last = function(newLast, options) {
    if (typeof newLast === "undefined") {
      var curNode = this.first();
      while (curNode && curNode.next()) {
        curNode = curNode.next();
      }
      return curNode;
    } else {
      this.addLast(newLast, options);
    }
  };
  /** adds the given value/node as the last item in the list */
  listproto.addLast = function(newValue, options) {
    var last = this.last(),
        newNode;
    if (typeof last === "undefined") { // if no last, add to first
      this.first(newValue);
      return this;
    }
    if (newValue instanceof ListNode) {
      newNode = newValue;
    } else {
      newNode = this.newNode(newValue);
    }
    last.next(newNode, options);
    return this;
  };
  /** Returns the item at index, first node is at index 0 */
  listproto.get = function(index) {
    if (typeof(index) !== "number" || index < 0) { return; }
    var curNode = this.first(),
        pos = 0;
    while (curNode.next() && pos < index) {
      curNode = curNode.next();
      pos++;
    }
    if (pos === index) {
      return curNode;
    } else {
      return undefined;
    }
  };
  listproto.newNode = function(value, options) {
    return new ListNode(this, value, $.extend({first: false}, this.options, options));
  };
  listproto.remove = function(index, options) {
    var opts = $.extend({hide: true}, options);
    if (index === 0) {
      return this.removeFirst(options);
    } else if (index === this.size() - 1) {
      return this.removeLast(options);
    }
    var prev = this.get(index - 1),
        next = this.get(index + 1),
        oldNode = prev.next();
    prev.next(next, options);
    if (opts.hide) {
      oldNode.hide();
      oldNode.edgeToNext().hide();
    }
    return oldNode;
  };
  listproto.removeFirst = function(options) {
    if (this.size() <= 0) { return; }
    var opts = $.extend({hide: true}, options),
        oldFirst = this.first();
    this._setfirst(oldFirst.next(), options);
    if (opts.hide) {
      oldFirst.hide();
      if (oldFirst.edgeToNext()) {
        oldFirst.edgeToNext().hide();
      }
    }
    return oldFirst;
  };
  listproto.removeLast = function(options) {
    if (this.size() <= 1) { return this.removeFirst(); }
    var opts = $.extend({hide: true}, options),
        newLast = this.get(this.size() - 2),
        oldLast = this.last();
    newLast.next(null, options);
    if (opts.hide) {
      oldLast.hide();
      newLast.edgeToNext().hide();
    }
    return oldLast;
  };
  listproto.layout = function(options) {
    var layoutAlg = $.extend({}, this.options, options).layout || "_default";
    return this.jsav.ds.layout.list[layoutAlg](this, options);
  };
  listproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      // first handle the special case of newState being an empty list
      if (newState.n.length === 0) {
        while (this.first()) { // just remove everything
          this.removeFirst({record: false});
        }
        return; // remember to return
      }

      var currNode = this.first(),
          i = 0,
          newCurrState = newState.n[i];
      while (newCurrState && currNode) {
        currNode.state(newCurrState);
        currNode = currNode.next();
        newCurrState = ++i < newState.n.length?newState.n[i]:null;
      }
      if (!currNode) {
        // list is shorter than the new state
        currNode = this.last();
        for (; i < newState.n.length; i++) {
          var newNode = this.newNode("", {record: false});
          if (!currNode) { // if this list was initially empty
            this.first(newNode);
            currNode = this.first();
          }
          newNode.state(newState.n[i]);
          currNode.next(newNode, {record: false});
          currNode = newNode;
        }
      } else {
        // newCurrState is null, so list is longer than new state
        while (currNode !== this.last()) { // remove until proper length
          this.removeLast({record: false});
        }
      }
      currNode = this.first();
      var edge = currNode.edgeToNext(),
          edges = newState.e;
      for (i = 0; i < edges.length; i++) {
        this.get(i).edgeToNext().state(edges[i]);
      }
    } else {
      var state = {},
          node = this.first(),
          edge,
          nodes = [], edges = [];
      while (node) {
        nodes.push(node.state());
        edge = node.edgeToNext();
        if (edge) {
          edges.push(edge.state());
        }
        node = node.next();
      }
      state.n = nodes;
      state.e = edges;
      return state;
    }
  };
  listproto.clear = function() {
    this.element.remove();
  };
  listproto.size = function() {
    var curNode = this.first(),
      size = 0;
    while (curNode) {
      size++;
      curNode = curNode.next();
    }
    return size;
  };
  listproto.equals = function(otherList, options) {
    if (!this.first() && !otherList.first()) { // empty lists
      return true;
    } else if (!this.first()) { // other list not empty, this list is
      return false;
    } else {
      return this.first().equals(otherList.first(), options);
    }
  };
  listproto.css = JSAV.utils._helpers.css;
  listproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  // add the event handler registration functions to the list prototype
  JSAV.utils._events._addEventSupport(listproto);
  
  var ListNode = function(container, value, options) {
    this.jsav = container.jsav;
    this.container = container;
    this._next = options.next;
    this._value = value;
    this.options = $.extend(true, {visible: true}, options);
    var el = $("<div><span class='jsavvalue'>" + this._valstring(value) + "</span><span class='jsavpointerarea'></span></div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavlistnode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if ("first" in options && options.first) {
      this.container.element.prepend(el);
    } else {
      this.container.element.append(el);
    }
    if (this._next) {
      this._edgetonext = new Edge(this.jsav, this, this._next, {"arrow-end": "classic-wide-long"});
      if (this.options.edgeLabel) {
        this._edgetonext.label(this.options.edgeLabel);
      }
    }
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  
  JSAV.utils.extend(ListNode, JSAV._types.ds.Node);
  var listnodeproto = ListNode.prototype;
  
  listnodeproto.next = function(newNext, options) {
    if (typeof newNext === "undefined") {
      return this._next;
    } else {
      if (this._edgetonext) { this._edgetonext.show(); }
      return this._setnext(newNext, options);
    }
  };
  listnodeproto._setnext = JSAV.anim(function(newNext, options) {
    var oldNext = this._next;
    this._next = newNext;
    if (newNext && this._edgetonext) {
      this._edgetonext.end(newNext);
    } else if (newNext){
      this._edgetonext = new Edge(this.jsav, this, this._next, {"arrow-end": "classic-wide-long"});
    }
    if (options && options.edgeLabel) {
      this._edgetonext.label(options.edgeLabel);
    }
    return [oldNext];
  });
  listnodeproto.edgeToNext = function() {
    return this._edgetonext;
  };
  listnodeproto.equals = function(otherNode, options) {
    if (!otherNode || this.value() !== otherNode.value()) {
      return false;
    }
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherNode, options.css);
      if (!cssEquals) { return false; }
    }
    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherNode, options["class"]);
      if (!classEquals) { return false; }
    }
    // compare edge style
    if (this.next() && this.edgeToNext()) {
      var edgeEquals = this.edgeToNext().equals(otherNode.edgeToNext(),
          $.extend({}, options, {dontCheckNodes: true}));
      if (!edgeEquals) { return false; }
    }
    // compare next nodes
    if (this.next()) { // both have next, return whether they match
      return this.next().equals(otherNode.next(), options);
    } else if (otherNode.next()) { // this node has no next, the other has
      return false; // nodes are not equal
    } else {
      return true;
    }
  };

  // expose the list types
  var dstypes = JSAV._types.ds;
  dstypes.List = List;
  dstypes.ListNode = ListNode;

  function centerList(list, width, options) {
    // center the list inside its parent container
    if (list.options.hasOwnProperty("center") && !list.options.center) {
      // if options center is set to falsy value, return
      return 0;
    }
    // width of list expected to be last items position + its width
    var containerWidth = $(list.jsav.canvas).width();
    return (containerWidth - width)/2 - list.position().left;
  }

  var horizontalNodePosUpdate = function(node, prevNode, prevPos, opts) {
    // function for calculating node positions in horizontal list
    var nodePos = node.element.position(),
        newPos = { left: nodePos.left, top: nodePos.top }, // by default, don't move it
        result = { node: node, nodePos: newPos };
    if (opts.updateLeft) {
      newPos.left = prevNode?(prevPos.left + prevNode.element.outerWidth() + opts.nodegap):0;
    }
    if (opts.updateTop) { newPos.top = 0; }
    var edge = prevNode?prevNode._edgetonext:undefined;
    if (edge && opts.updateEdges) {
      result.edge = edge;
      result.edgeFromPoint = [
        prevPos.left + prevNode.element.outerWidth() - 5,
        prevPos.top + Math.round(prevNode.element.outerHeight()/2)
      ];
    }
    return result;
  };
  var verticalNodePosUpdate = function(node, prevNode, prevPos, opts) {
    // function for calculating node positions in vertical list
    var nodePos = node.element.position(),
        newPos = { left: nodePos.left, top: nodePos.top },
        result = { node: node, nodePos: newPos };
    if (opts.updateLeft) { newPos.left = 0; }
    if (opts.updateTop) {
      newPos.top = prevNode?(prevPos.top + prevNode.element.outerHeight() + opts.nodegap):0;
    }
    var edge = prevNode?prevNode._edgetonext:undefined;
    if (edge && opts.updateEdges) {
      result.edge = edge;
      result.edgeFromPoint = [
        prevPos.left + Math.round(prevNode.element.outerWidth()/2),
        prevPos.top + prevNode.element.outerHeight() - 5
      ];
    }
    return result;
  };
  var listLayout = function(list, options, updateFunc) {
    // a general list layout that goes through the nodes and calls given updateFunc
    // to calculate the new node positions
    var curNode = list.first(),
        prevNode,
        opts = $.extend({updateLeft: true, updateTop: true, updateEdges: true}, list.options, options),
        curPos,
        prevPos = {},
        minLeft = Number.MAX_VALUE,
        minTop = Number.MAX_VALUE,
        maxLeft = Number.MIN_VALUE,
        maxTop = Number.MIN_VALUE,
        width,
        height,
        left,
        posData = [],
        curPosData;
    // two phase layout: first go through all the nodes calculate positions
    while (curNode) {
      curPosData = updateFunc(curNode, prevNode, prevPos, opts);
      curPos = curPosData.nodePos;
      // keep track of max and min coordinates to calculate the size of the container
      minLeft = (typeof curPos.left !== "undefined")?Math.min(curPos.left, minLeft):minLeft;
      minTop  = (typeof curPos.top  !== "undefined")?Math.min(curPos.top, minTop):minTop;
      maxLeft = (typeof curPos.left !== "undefined")?Math.max(curPos.left + curNode.element.outerWidth(), maxLeft):maxLeft;
      maxTop  = (typeof curPos.top  !== "undefined")?Math.max(curPos.top + curNode.element.outerHeight(), maxTop):maxTop;
      posData.unshift(curPosData);
      // go to next node and continue with that
      prevNode = curNode;
      prevPos = curPos;
      curNode = curNode.next();
    }
    if (list.size()) {
      width = maxLeft - minLeft;
      height = maxTop - minTop;
    } else {
      var tmpNode = list.newNode("");
      width = tmpNode.element.outerWidth();
      height = tmpNode.element.outerHeight();
      tmpNode.clear();
    }
    left = centerList(list, width, opts);
    if (!opts.boundsOnly) {
      // ..update list size and position..
      list.css({width: width, height: height});
      if (left) {
        list.translateX(left);
      }
      // .. and finally update the node and edge positions
      // doing the size first makes the animation look smoother by reducing some flicker
      for (var i = posData.length - 1; i >= 0; i--) {
        var posItem = posData[i];
        posItem.node.moveTo(posItem.nodePos.left, posItem.nodePos.top);
        if (posItem.edge) {
          posItem.edge.layout({fromPoint: posItem.edgeFromPoint, end: posItem.nodePos});
        }
      }
    }
    return { width: width, height: height, left: left, top: list.element.position().top };
  };
  var verticalList = function(list, options) {
    list.element.addClass("jsavverticallist");
    // use the general list layout with verticalNodePosUpdate as the calculator
    return listLayout(list, options, verticalNodePosUpdate);
  };
  var horizontalList = function(list, options) {
    list.element.addClass("jsavhorizontallist");
    // use the general list layout with horizontalNodePosUpdate as the calculator
    return listLayout(list, options, horizontalNodePosUpdate);
  };

  JSAV.ext.ds.layout.list = {
    "_default": horizontalList,
    "horizontal": horizontalList,
    "vertical": verticalList
  };

  JSAV.ext.ds.list = function(options) {
    return new List(this, options);
  };
}(jQuery));