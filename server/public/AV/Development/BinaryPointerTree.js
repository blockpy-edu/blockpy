(function ($) {
  "use strict";

  // shortcut to JSAV Edge
  var Edge = JSAV._types.ds.Edge;

  // The edges are dummy edges that are NOT visible.
  // Used as edgeToParent edge for nodes in the binary pointer tree.
  // The primary function of the edges is to call the layout function for the
  // pointers of the binary tree node during  JSAV's tree layout function.
  var FakeEdge = function (jsav, start, end, options) {
    this.jsav = jsav;
    this.startnode = start;
    this.endnode = end;
    this.options = options;
    this.container = start.container;
    // fake g object
    this.g = {rObj: {node: {setAttribute: function () {}}, remove: function () {}}};
  };
  JSAV.utils.extend(FakeEdge, Edge);

  var fakeproto = FakeEdge.prototype;
  fakeproto.show = function () {};
  fakeproto.hide = function () {};
  fakeproto.layout = function (options) {
    var pos = this.end().left() === this.start() ? 0 : 1;
    if (this.end().pointers[pos]) {
      if (options) {
        var s = options.start;
        var e = options.end;
        options.start = e;
        options.end = s;
      }
      this.end().pointers[pos].layout(options);
    }
  };

  /**
   *
   *  BINARY POINTER TREE
   *
   */
  var BinaryPointerTree = function (jsav, options) {
    this.init(jsav, options);
    this.element.addClass("jsavbinarypointertree");
  };
  JSAV.utils.extend(BinaryPointerTree, JSAV._types.ds.BinaryTree);

  // shortcut for prototype of BinaryPointerTree
  var bptproto = BinaryPointerTree.prototype;

  bptproto.newNode = function (value, parent, options) {
    return new BinaryPointerTreeNode(this, value, parent, options);
  };


  /**
   *
   *  BINARY POINTER TREE NODE
   *
   */
  var BinaryPointerTreeNode = function (container, value, parent, options) {
    this.init(container, value, parent, options);
  };
  JSAV.utils.extend(BinaryPointerTreeNode, JSAV._types.ds.BinaryTreeNode);

  // shortcut for prototype of BinaryPointerTreeNode
  var bptnodeproto = BinaryPointerTreeNode.prototype;

  bptnodeproto.init = function (container, value, parent, options) {
    this.jsav = container.jsav;
    this.container = container;
    this.parentnode = parent;
    // Because several nodes can point to one node at the same time, we need to
    // keep track of all the parent nodes to be able to hide/show/animate the
    // pointers correctly
    this.parentnodes = [parent];
    this.childnodes = [];
    this.pointers = [];
    this.options = $.extend(true, {visible: true}, parent ? parent.options : {}, options);
    // The nodes have two gray pointer areas. One on the left and one on the
    // right. The classes "left" and "right" are used to distinguish them from
    // each other. See BinaryPointerTreeTest.html to see how these classes are
    // used in the click handler.
    var el = this.options.nodeelement ||
              $("<div><span class='jsavpointerarea left'></span><span class='jsavvalue'>" +
                this._valstring(value) +
                "</span><span class='jsavpointerarea right'></span></div>");
    var valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavtreenode jsavbinarypointertreenode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if (parent) {
      el.attr("data-parent", parent.id());
    }
    if (this.options.autoResize) {
      el.addClass("jsavautoresize");
    }
    this.container.element.append(el);


    JSAV.utils._helpers.handleVisibility(this, this.options);
    if (parent) {
      this._edgetoparent = new FakeEdge(this.jsav, this, parent);
      if (typeof options.pos !== "undefined") {
        var pos = options.pos;
        if (!parent.pointers[pos]) {
          parent.pointers[pos] = getNewPointerEdge(this.jsav, parent, this, {"arrow-end": "classic-wide-long"});
        } else {
          parent.pointers[pos].end(this);
        }
      }
    }
  };

  // Utility function for creating pointer edges
  function getNewPointerEdge(jsav, start, end, options) {
    var edge = new Edge(jsav, start, end, options);
    // override the layout function
    edge.layout = function (options) {
      if (!this.end()) {
        return;
      }
      var sElem = this.start().element,
          eElem = this.end().element,
          start = (options && options.start) ? options.start : this.start().position(),
          end = (options && options.end) ? options.end : this.end().position(),
          sWidth = sElem.outerWidth(),
          sHeight = sElem.outerHeight() / 2.0,
          eWidth = eElem.outerWidth() / 2.0,
          pointerWidth = sElem.find(".jsavpointerarea:eq(0)").width(),
          pos = this.start().pointers[0] === this ? 0 : 1,
          fromX = start.left + pointerWidth / 2 + pos * (sWidth - pointerWidth),
          fromY = start.top + sHeight,
          toX = end.left + eWidth,
          toY = end.top;
      this.g.movePoints([[0, fromX, fromY], [1, toX, toY]], options);
    };
    return edge;
  }

  // Utility function for setting and removing child nodes
  function setchild(self, pos, node, options) {
    var oPos = pos ? 0 : 1,
        other,
        newchildnodes,
        child = self.childnodes[pos],
        oChild = self.childnodes[oPos],
        opts = $.extend({hide: true}, options);
    if (typeof node === "undefined") {
      if (child && child.value() !== "jsavnull") {
        return child;
      } else {
        return undefined;
      }
    } else {
      var nullopts = $.extend({}, opts);
      nullopts.edgeLabel = undefined;
      if (node === null) { // node is null, remove parent from child
        if (child && child.value() !== "jsavnull") {
          child.removeParent(self, {pos: pos});
          if (opts.hide) { child.hide(); }
          if (self.pointers[pos]) { self.pointers[pos].end(null).hide(); }
          // child exists
          if (!oChild || oChild.value() === "jsavnull") { // ..but no other child
            if (oChild) { oChild.hide(); }
            self._setchildnodes([]);
          } else { // other child exists
            // create a null node and set it as other child
            other = self.container.newNode("jsavnull", self, nullopts);
            other.element.addClass("jsavnullnode").attr("data-binchildrole", pos ? "right" : "left");
            newchildnodes = [];
            newchildnodes[pos] = other;
            newchildnodes[oPos] = oChild;
            self._setchildnodes(newchildnodes, opts);
          }
        }
      } else { // create a new node and set the child
        if (!(node instanceof BinaryPointerTreeNode)) {
          // if there is a child node and value is number or string, just change the value of the node
          if (child && (typeof node === "number" || typeof node === "string")) {
            child.value(node, opts);
            if (!self.pointers[pos]) {
              self.pointers[pos] = getNewPointerEdge(self.jsav, self, child, {"arrow-end": "classic-wide-long"});
            }
            return child;
          } else {
            node = self.container.newNode(node, self, $.extend(opts, {pos: pos}));
          }
        } else {
          if (node === child) { return; } // don't do anything if the node is already a child in the same position
          node.addParent(self, {pos: pos});
        }
        node.element.attr("data-binchildrole", pos ? "right" : "left");
        newchildnodes = [];
        newchildnodes[pos] = node;
        if (child) {
          if (opts.hide || child.value() === "jsavnull") {
            child.hide();
          } else {
            child.removeParent(self, {pos: pos});
          }
        }
        if (!oChild) {
          other = self.container.newNode("jsavnull", self, nullopts);
          other.element.addClass("jsavnullnode").attr("data-binchildrole", oPos ? "right" : "left");
          newchildnodes[oPos] = other;
        } else {
          newchildnodes[oPos] = oChild;
        }
        self._setchildnodes(newchildnodes, opts);
        return node;
      }
    }
    return child;
  }


  bptnodeproto.addChild = function (node, options) {
    var pos = -1;
    if (!this.left()) { // try left child
      pos = 0;
    } else if (!this.right()) { // try right child
      pos = 1;
    } else {
      console.error("tree node already has two children, cannot add more");
      return;
    }
    return this.child(pos, node, options);
  };
  bptnodeproto.left = function (node, options) {
    return setchild(this, 0, node, options);
  };
  bptnodeproto.right = function (node, options) {
    return setchild(this, 1, node, options);
  };
  bptnodeproto.child = function (pos, node, options) {
    return setchild(this, pos, node, options);
  };
  bptnodeproto.remove = function (options) {
    if (this === this.container.rootnode) {
      this.container.root(this.container.newNode("", null), options);
      return this;
    }
    var parent = this.parent();
    if (parent.left() === this) {
      parent.pointers[0].hide();
      return setchild(parent, 0, null, options);
    } else if (parent.right() === this) {
      parent.pointers[1].hide();
      return setchild(parent, 1, null, options);
    }
  };
  bptnodeproto.edgeToLeft = function () {
    return this.edgeToChild(0);
  };
  bptnodeproto.edgeToRight = function () {
    return this.edgeToChild(1);
  };
  bptnodeproto._setvalue = JSAV.anim(function (newValue) {
    var oldVal = this.value(),
        valtype = typeof(newValue);
    if (typeof oldVal === "undefined") { oldVal = ""; }
    if (valtype === "object") { valtype = "string"; }
    this.element
        .removeClass("jsavnullnode")
        .find(".jsavvalue")
        .html(this._valstring(newValue))
        .end()
        .attr({"data-value": newValue, "data-value-type": valtype});
    if (newValue === "jsavnull") {
      this.element.addClass("jsavnullnode");
    }
    return [oldVal];
  });

  // ._setparent and .parent are obsolete
  // use .addParent and .removeParent instead
  bptnodeproto._setparent = JSAV.anim(function (newParent, options) {
    var oldParent = this.parentnode,
        pos = options.pos,
        oldPos = options.oldPos;
    // console.log("this: " + this.value() + "\nnew parent: " + (newParent ? newParent.value() : "") + "\nold parent: " + (oldParent ? oldParent.value() : "") + "\npos: " + pos + ", oldPos: " + oldPos);
    this._edgetoparent.end(newParent, options);
    if (newParent) {
      newParent.pointers[pos].end(this, options);
    }
    // if (options && options.edgeLabel) {
    //   this._edgetoparent.label(options.edgeLabel, options);
    // }
    this.element.attr("data-parent", newParent ? newParent.id() : "");
    this.parentnode = newParent;
    options = {pos: oldPos, oldPos: pos};
    return [oldParent, options];
  });
  bptnodeproto.parent = function (newParent, options) {
    if (typeof newParent === "undefined") {
      return this.parentnode;
    }
    if (newParent) {
      if (!this._edgetoparent) {
        this._setEdgeToParent(new FakeEdge(this.jsav, this, newParent, options));
      }
      var pos;
      if (options && typeof options.pos !== "undefined") {
        pos = options.pos;
      } else {
        pos = (newParent.left() === this ? 0 : 1);
        options = $.extend(true, {pos: pos}, options ? options : {});
      }
      if (!newParent.pointers[pos]) {
        newParent.pointers[pos] = getNewPointerEdge(this.jsav, newParent, this, {"arrow-end": "classic-wide-long"});
      } else {
        newParent.pointers[pos].show();
      }
    }
    if (this.parentnode && this.parentnode !== newParent) {
      if (this.parentnode.pointers[0] && this.parentnode.pointers[0].end() === this) {
        // this.parentnode.pointers[0].hide();
        options = $.extend(true, {oldPos: 0}, options ? options : {});
      }
      if (this.parentnode.pointers[1] && this.parentnode.pointers[1].end() === this) {
        // this.parentnode.pointers[1].hide();
        options = $.extend(true, {oldPos: 1}, options ? options : {});
      }
    }
    return this._setparent(newParent, options);
  };


  // addParent and removeParent are used by bptnodeproto._addParent and ._removeParent
  var addParent = function (newParent, options) {
    // console.log("Added " + newParent.value() + " as " + this.value() + "'s parent.");
    var newParents = this.parentnodes.slice(),
        pos = options.pos;
    newParents.push(newParent);
    this.parentnodes = newParents;

    // If there is only one parent after adding the parent, we this parent the
    // "real" parent
    if (newParents.length === 1) {
      this._edgetoparent.end(newParent, options);
      this.element.attr("data-parent", newParent.id());
      this.parentnode = newParent;
    }
    newParent.pointers[pos].end(this, options);
  };

  var removeParent = function (parent, options) {
    // console.log("Removed " + parent.value() + " from " + this.value() + "'s parents.");
    var index = this.parentnodes.indexOf(parent);
    this.parentnodes.splice(index, 1);

    // if there are no parents after removing the parent, we make this node an orphan
    if (this.parentnodes.length === 0) {
      this._edgetoparent.end(null, options);
      this.element.attr("data-parent", "");
      this.parentnode = null;
    } else if (this.parentnodes.length === 1) {
      // if there is one parent after removing the parent, we make the remaining
      // parent the "real" parent
      if (this.parentnodes[0]) {
        this._edgetoparent.end(this.parentnodes[0], options);
        this.element.attr("data-parent", this.parentnodes[0].id());
      } else {
        this._edgetoparent = undefined;
      }
      this.parentnode = this.parentnodes[0];
    }
  };

  // the second argument function is used to undo the action
  bptnodeproto._addParent = JSAV.anim(addParent, removeParent);
  bptnodeproto._removeParent = JSAV.anim(removeParent, addParent);

  // add a node to parentnodes
  bptnodeproto.addParent = function (newParent, options) {
    if (!this._edgetoparent) {
      this._setEdgeToParent(new FakeEdge(this.jsav, this, newParent, options));
    }

    // pos tells which of the parent pointers should point to this node
    var pos;
    if (options && typeof options.pos !== "undefined") {
      pos = options.pos;
    } else {
      pos = (newParent.left() === this ? 0 : 1);
      options = $.extend(true, {pos: pos}, options ? options : {});
    }

    // add a pointer if necessary, otherwise make sure it's visible
    if (!newParent.pointers[pos]) {
      newParent.pointers[pos] = getNewPointerEdge(this.jsav, newParent, this, {"arrow-end": "classic-wide-long"});
    } else {
      newParent.pointers[pos].show();
    }

    return this._addParent(newParent, options);
  };

  // remove a node from parentnodes
  bptnodeproto.removeParent = function (parent, options) {
    if (this.parentnodes.indexOf(parent) === -1) { return; }

    // pos tells which of the parent pointers was pointing to this node
    var pos;
    if (options && typeof options.pos !== "undefined") {
      pos = options.pos;
    } else {
      pos = (parent.left() === this ? 0 : 1);
      options = $.extend(true, {pos: pos}, options ? options : {});
    }

    // hide the pointer if it is pointing at this node
    if (parent.pointers[pos].end() === this) {
      parent.pointers[pos].hide();
    }

    return this._removeParent(parent, options);
  };

  // returns true if the parent argument is a parent of this node
  bptnodeproto.hasParent = function (parent) {
    return this.parentnodes.indexOf(parent) !== -1;
  };

  JSAV._types.ds.BinaryPointerTree = BinaryPointerTree;
  JSAV._types.ds.BinaryPointerTreeNode = BinaryPointerTreeNode;

  JSAV.ext.ds.binarypointertree = function (options) {
    return new BinaryPointerTree(this, $.extend(true, {visible: true, autoresize: true}, options));
  };

})(jQuery);
