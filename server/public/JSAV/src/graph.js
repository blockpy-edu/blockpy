/**
* Module that contains the graph data structure implementations.
* Depends on core.js, datastructures.js, anim.js, utils.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }
  var Edge = JSAV._types.ds.Edge; // shortcut to JSAV Edge

  var Graph = function(jsav, options) {
    this._nodes = [];
    this._edges = [];
    this._alledges = null;
    this.jsav = jsav;
    this.options = $.extend({visible: true, nodegap: 40, autoresize: true, width: 400, height: 200,
                              directed: false, center: true}, options);
    var el = this.options.element || $("<div/>");
    el.addClass("jsavgraph");
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
    el.attr({"id": this.id()}).width(this.options.width).height(this.options.height);
    if (this.options.autoresize) {
      el.addClass("jsavautoresize");
    }
    if (this.options.center) {
      el.addClass("jsavcenter");
    }
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  // a helper function to sort an array of nodes based on the node value
  Graph._nodeSortFunction = function(a, b) {
    return a.value() < b.value();
  };

  JSAV.utils.extend(Graph, JSAV._types.ds.JSAVDataStructure);
  var graphproto = Graph.prototype;
  graphproto.css = JSAV.utils._helpers.css;
  graphproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  graphproto._setnodes = JSAV.anim(function(newnodes, options) {
    var oldnodes = this._nodes;
    this._nodes = newnodes;
    return [oldnodes, options];
  });
  graphproto._setadjs = JSAV.anim(function(newadjs, options) {
    var oldadjs = this._edges;
    this._edges = newadjs;
    this._alledges = null;
    return [oldadjs, options];
  });
  graphproto._setadjlist = JSAV.anim(function(newadj, index, options) {
    var oldadj = this._edges[index];
    this._edges[index] = newadj;
    this._alledges = null;
    return [oldadj, index, options];
  });

  // returns a new graph node
  graphproto.newNode = function(value, options) {
    var newNode = new GraphNode(this, value, options), // create new node
        newNodes = this._nodes.slice(0);
    newNodes.push(newNode); // add new node to clone of node array
    // set the nodes (makes the operation animatable
    this._setnodes(newNodes, options);

    var newAdjs = this._edges.slice(0);
    newAdjs.push([]);
    this._setadjs(newAdjs, options);

    return newNode;
  };
  graphproto.addNode = function(value, options) {
    return this.newNode(value, options);
  };
   // removes the given node
  graphproto.removeNode = function(node, options) {
    var nodeIndex = this._nodes.indexOf(node);
    if (nodeIndex === -1) { return; } // no such node

    // remove all edges connected to this node
    var allEdges = this.edges();
    for (var i = allEdges.length; i--; ) {
      var edge = allEdges[i];
      if (edge.start().id() === node.id() || edge.end().id() === node.id()) {
        this.removeEdge(edge, options);
      }
    }

    // update the adjacency lists
    var firstAdjs = this._edges.slice(0, nodeIndex),
        newAdjs = firstAdjs.concat(this._edges.slice(nodeIndex + 1));
    this._setadjs(newAdjs, options);

    // create a new array of nodes without the removed node
    var firstNodes = this._nodes.slice(0, nodeIndex),
        newNodes = firstNodes.concat(this._nodes.slice(nodeIndex + 1));
    // set the nodes (makes the operation animated)
    this._setnodes(newNodes, options);

    // finally hide the node
    node.hide(options);

    // return this for chaining
    return this;
  };

  // adds an edge from fromNode to toNode
  graphproto.addEdge = function(fromNode, toNode, options) {
    // only allow one edge between two nodes
    if (this.hasEdge(fromNode, toNode)) { return; }

    var opts = $.extend({}, this.options, options);
    if (opts.directed && !opts["arrow-end"]) {
      opts["arrow-end"] = "classic-wide-long";
    }

    // get indices of the nodes
    var fromIndex = this._nodes.indexOf(fromNode),
        toIndex = this._nodes.indexOf(toNode);
    if (fromIndex === -1 || toIndex === -1) { return; } // no such nodes

    // create new edge
    var edge = new Edge(this.jsav, fromNode, toNode, opts),
        adjlist = this._edges[fromIndex].slice(0);
    // add new edge to adjlist
    adjlist.push(edge);
    // set the adjlist (makes the operation animated)
    this._setadjlist(adjlist, fromIndex, opts);

    return edge;
  };

  // removes an edge from fromNode to toNode
  graphproto.removeEdge = function(fNode, tNode, options) {
    var edge,
        fromNode,
        toNode,
        opts;
    // first argument is an edge object
    if (fNode.constructor === JSAV._types.ds.Edge) {
      edge = fNode;
      fromNode = edge.start();
      toNode = edge.end();
      opts = tNode;
    } else { // if not edge, assume two nodes
      fromNode = fNode;
      toNode = tNode;
      edge = this.getEdge(fromNode, toNode);
      opts = options;
    }
    if (!edge) { return; } // no such edge

    var fromIndex = this._nodes.indexOf(fromNode),
        toIndex = this._nodes.indexOf(toNode),
        adjlist = this._edges[fromIndex],
        edgeIndex = adjlist.indexOf(edge),
        newAdjlist = adjlist.slice(0, edgeIndex).concat(adjlist.slice(edgeIndex + 1));
    this._setadjlist(newAdjlist, fromIndex, options);
    // we "remove" the edge by hiding it
    edge.hide();
  };

  // returns true/false whether an edge from fromNode to toNode exists
  graphproto.hasEdge = function(fromNode, toNode) {
    return this.getEdge(fromNode, toNode);
  };

  graphproto.getEdge = function(fromNode, toNode) {
    var edges = this.edges();
    for (var i = 0, l = edges.length; i < l; i++) {
      var edge = edges[i];
      if (edge.start() === fromNode && edge.end() === toNode) {
        return edge;
      } else if (!this.options.directed && edge.end() === fromNode && edge.start() === toNode) {
        return edge;
      }
    }
    return undefined;
  };

  // returns an iterable array of nodes in the graph
  graphproto.nodes = function() {
    return JSAV.utils.iterable(this._nodes);
  };
  // returns the number of nodes in the graph
  graphproto.nodeCount = function() {
    return this._nodes.length;
  };
  var collectAllEdges = function(graph) {
    var alledges = [];
    for (var i = 0, l = graph._edges.length; i < l; i++) {
      for (var j = 0, ll = graph._edges[i].length; j < ll; j++) {
        var edge = graph._edges[i][j];
        if (alledges.indexOf(edge) === -1) {
          alledges.push(edge);
        }
      }
    }
    return alledges;
  };
  // returns an array of edges in the graph
  graphproto.edges = function() {
    if (!this._alledges) {
      this._alledges = collectAllEdges(this);
    }
    return JSAV.utils.iterable(this._alledges);
  };
  // returns the number of edges in the graph
  graphproto.edgeCount = function() {
    if (!this._alledges) {
      this._alledges = collectAllEdges(this);
    }
    return this._alledges.length;
  };
  // compares this graph to other graph and return true if they are equal
  graphproto.equals = function(other, options) {
    if (!other instanceof Graph) { return false; }
    if (this.nodeCount() !== other.nodeCount() ||
        this.edgeCount() !== other.edgeCount()) { return false; }

    var myNodes = this.nodes().sort(Graph._nodeSortFunction),
        otherNodes = other.nodes().sort(Graph._nodeSortFunction);
    for (var i = myNodes.length; i--; ) {
      // if a pair of nodes isn't equal, graphs are not equal
      if (!myNodes[i].equals(otherNodes[i], options)) {
        return false;
      }
    }
    return true;
  };
  // creates a clone of the graph
  graphproto.clone = function(opts) {
    var cloneOpts = $.extend(this.options, {visible: false}, opts);
    if ('element' in cloneOpts) { delete cloneOpts.element; }
    var cloneGraph = this.jsav.ds.graph(cloneOpts),
        nodes = this.nodes(Graph._nodeSortFunction),
        cloneNode, cloneNodes,
        edges = this.edges(),
        n, e, i, fromInd, toInd, edgeOpts;

    // clone all the nodes
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      cloneNode = cloneGraph.addNode(n.value(), cloneOpts);
      cloneNode.element.attr("style", n.element.attr("style"));
      cloneNode.element.attr("class", n.element.attr("class"));
    }
    cloneNodes = cloneGraph.nodes(Graph._nodeSortFunction);

    // clone all the edges
    for (i = 0; i < edges.length; i++) {
      e = edges[i];
      fromInd = nodes.indexOf(e.start());
      toInd = nodes.indexOf(e.end());
      // add edge weight
      if (typeof e.weight() !== "undefined") {
        edgeOpts = { weight: e.weight() };
      } else {
        edgeOpts = { };
      }
      cloneGraph.addEdge(cloneNodes[fromInd], cloneNodes[toInd], $.extend({}, cloneOpts, edgeOpts));
    }
    return cloneGraph;
  };
  graphproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      // remove all edges
      var edges = this.edges(),
          nodes = this.nodes(Graph._nodeSortFunction),
          newNodes = newState.n,
          newEdges = newState.e,
          i, l, e, newE;
      for (i = 0, l = edges.length; i < l; i++) {
        e = edges[i];
        this.removeEdge(e.start(), e.end(), {record: false});
      }
      // go through existing nodes and set the state
      for (i = 0; i < nodes.length && i < newNodes.length; i++) {
        nodes[i].state(newNodes[i]);
      }
      // remove extra nodes
      while (i < nodes.length) {
        this.removeNode(nodes[nodes.length - 1]);
        i++;
      }
      //   or add needed nodes
      while(i < newNodes.length) {
        var newNode = this.newNode("", {record: false});
        newNode.state(newNodes[nodes.length]);
        nodes.push(newNode);
        i++;
      }
      // create edges between the nodes
      for (i = 0, l = newEdges.length; i < l; i++) {
        e = newEdges[i]; // includes array like [startNodeIndex, endNodeIndex]
        newE = this.addEdge(nodes[e[0]], nodes[e[1]], {record: false});
        newE.state(e[2]);
      }
    } else {
      var state = {},
          nodes = [],
          edges = [],
          nodelist = this.nodes(Graph._nodeSortFunction),
          edgelist = this.edges(),
        i, e;
      for (i = 0; i < nodelist.length; i++) {
        nodes.push(nodelist[i].state());
      }
      for (i = 0; i < edgelist.length; i++) {
        e = edgelist[i];
        edges.push([nodelist.indexOf(e.start()), nodelist.indexOf(e.end()), e.state()]);
      }
      state.n = nodes;
      state.e = edges;
      return state;
    }
  };


  // add the event handler registering functions
  JSAV.utils._events._addEventSupport(graphproto);

  // do the graph layout
  graphproto.layout = function(options) {
    var layoutAlg = this.options.layout || "_default";
    return this.jsav.ds.layout.graph[layoutAlg](this, options);
  };

  var SpringLayout = function(graph, options) {
    this.graph = graph;
    this.iterations = 2000;
    this.maxRepulsiveForceDistance = 6;
    this.k = 2;
    this.c = 0.01;
    this.maxVertexMovement = 0.5;
    this.results = {};
    this.nodes = graph.nodes();
    this.edges = graph.edges();
    this.layout();
    var factorX = (graph.element.width() - this.maxNodeWidth) / (this.layoutMaxX - this.layoutMinX),
        factorY = (graph.element.height() - this.maxNodeHeight) / (this.layoutMaxY - this.layoutMinY),
        node, edge, res;
    for (var i = 0, l = this.nodes.length; i < l; i++) {
      node = this.nodes[i];
      res = this.results[node.id()];
      node.moveTo((res.layoutPosX - this.layoutMinX) * factorX,
                  Math.max(0, (res.layoutPosY - this.layoutMinY) * factorY -
                    node.element.outerHeight()));
    }
    for (i = 0, l = this.edges.length; i < l; i++) {
      edge = this.edges[i];
      edge.layout(options);
    }
  };

  /*!
   * Graph layout algorithm based on Graph Dracula
   * https://github.com/strathausen/dracula
   * Graph Dracula is "released under the MIT license"
   */
  SpringLayout.prototype = {
    layout: function() {
      this.layoutPrepare();
      for (var i = 0; i < this.iterations; i++) {
        this.layoutIteration();
      }
      this.layoutCalcBounds();
    },

    layoutPrepare: function() {
      for (var i = 0, l = this.nodes.length; i < l; i++) {
        var node = {};
        node.layoutPosX = 0;
        node.layoutPosY = 0;
        node.layoutForceX = 0;
        node.layoutForceY = 0;
        this.results[this.nodes[i].id()] = node;
      }
    },

    layoutCalcBounds: function() {
      var minx = Infinity,
          maxx = -Infinity,
          miny = Infinity,
          maxy = -Infinity,
          nodes = this.nodes,
          maxNodeWidth = -Infinity,
          maxNodeHeight = -Infinity,
          i, x, y, l, n;

      for (i = 0, l = nodes.length; i < l; i++) {
        n = nodes[i];
        x = this.results[n.id()].layoutPosX;
        y = this.results[n.id()].layoutPosY;
        if (x > maxx) { maxx = x; }
        if (x < minx) { minx = x; }
        if (y > maxy) { maxy = y; }
        if (y < miny) { miny = y; }
        maxNodeWidth = Math.max(maxNodeWidth, n.element.outerWidth());
        maxNodeHeight = Math.max(maxNodeHeight, n.element.outerHeight());
      }

      this.layoutMinX = minx;
      this.layoutMaxX = maxx;
      this.layoutMinY = miny;
      this.layoutMaxY = maxy;
      this.maxNodeWidth = maxNodeWidth;
      this.maxNodeHeight = maxNodeHeight;
    },

    layoutIteration: function() {
      // Forces on nodes due to node-node repulsions
      var prev = [],
          nodes, edges,
          i, l, j, k;
      nodes = this.nodes;
      for (i = 0, l = nodes.length; i < l; i++) {
        var node1 = nodes[i];
        for (j = 0, k = prev.length; j < k; j++) {
          var node2 = nodes[prev[j]];
          this.layoutRepulsive(node1, node2);
        }
        prev.push(i);
      }

      // Forces on nodes due to edge attractions
      edges = this.edges;
      for (i = 0, l = edges.length; i < l; i++) {
        var edge = edges[i];
        this.layoutAttractive(edge);
      }

      // Move by the given force
      nodes = this.nodes;
      for (i = 0, l = nodes.length; i < l; i++) {
        var node = this.results[nodes[i].id()];
        var xmove = this.c * node.layoutForceX;
        var ymove = this.c * node.layoutForceY;

        var max = this.maxVertexMovement;
        if (xmove > max) { xmove = max; }
        if (xmove < -max) { xmove = -max; }
        if (ymove > max) { ymove = max; }
        if (ymove < -max) { ymove = -max; }

        node.layoutPosX += xmove;
        node.layoutPosY += ymove;
        node.layoutForceX = 0;
        node.layoutForceY = 0;
      }
    },

    layoutRepulsive: function(node1, node2) {
      if (typeof node1 === 'undefined' || typeof node2 === 'undefined') {
        return;
      }
      var lay1 = this.results[node1.id()],
          lay2 = this.results[node2.id()];
      var dx = lay2.layoutPosX - lay1.layoutPosX;
      var dy = lay2.layoutPosY - lay1.layoutPosY;
      var d2 = dx * dx + dy * dy;
      if (d2 < 0.01) {
        dx = 0.1 * Math.random() + 0.1;
        dy = 0.1 * Math.random() + 0.1;
        d2 = dx * dx + dy * dy;
      }
      var d = Math.sqrt(d2);
      if (d < this.maxRepulsiveForceDistance) {
        var repulsiveForce = this.k * this.k / d;
        lay2.layoutForceX += repulsiveForce * dx / d;
        lay2.layoutForceY += repulsiveForce * dy / d;
        lay1.layoutForceX -= repulsiveForce * dx / d;
        lay1.layoutForceY -= repulsiveForce * dy / d;
      }
    },

    layoutAttractive: function(edge) {
      var node1 = edge.start();
      var node2 = edge.end();


      var lay1 = this.results[node1.id()],
          lay2 = this.results[node2.id()];
      var dx = lay2.layoutPosX - lay1.layoutPosX;
      var dy = lay2.layoutPosY - lay1.layoutPosY;
      var d2 = dx * dx + dy * dy;
      if (d2 < 0.01) {
        dx = 0.1 * Math.random() + 0.1;
        dy = 0.1 * Math.random() + 0.1;
        d2 = dx * dx + dy * dy;
      }
      var d = Math.sqrt(d2);
      if (d > this.maxRepulsiveForceDistance) {
        d = this.maxRepulsiveForceDistance;
        d2 = d * d;
      }
      var attractiveForce = (d2 - this.k * this.k) / this.k;
      if (edge.attraction === undefined) {
        edge.attraction = 1;
      }
      attractiveForce *= Math.log(edge.attraction) * 0.5 + 1;

      lay2.layoutForceX -= attractiveForce * dx / d;
      lay2.layoutForceY -= attractiveForce * dy / d;
      lay1.layoutForceX += attractiveForce * dx / d;
      lay1.layoutForceY += attractiveForce * dy / d;
    }
  };
  /*! End Graph Dracula -based code
  */

  var springLayout = function springLayout(graph, options) {
    var layout = new SpringLayout(graph);
  };
  var manualLayout = function manualLayout(graph, options) {
    var i, l, edge,
        edges = graph.edges();
    for (i = 0, l = edges.length; i < l; i++) {
      edge = edges[i];
      edge.layout();
    }
  };
  JSAV.ext.ds.layout.graph = {
    "_default": manualLayout,
    "automatic": springLayout,
    "manual": manualLayout
  };


  // a layout function using a layered graph layout algorithm
  // expects the Dagre library (https://github.com/cpettitt/dagre) to be loaded
  var dagreLayout = function(graph, options) {
    // if dagre is not loaded, show error and return
    if (!('dagre' in window)) {
      console.error("You are trying to use the layered layout, please load dagre.js " +
        "(https://github.com/cpettitt/dagre)!");
      return;
    }
    var opts = $.extend({}, graph.options, options);
    // create a dagre graph (directed always, even though the graph can be undirected)
    var g = new dagre.Digraph();
    // go through and add the nodes to the dagre graph
    var nodes = graph.nodes();
    var nmap = {};
    while (nodes.hasNext()) {
      var node = nodes.next();
      nmap[node.id()] = node;
      g.addNode(node.id(), {width: node.bounds().width, height: node.bounds().height})
    }
    // add the edges
    var edges = graph.edges();
    while (edges.hasNext()) {
      var edge = edges.next();
      g.addEdge(null, edge.start().id(), edge.end().id());
    }
    // run the dagre layout
    var layout = dagre.layout().run(g);
    // move the JSAV nodes to the layout positions
    // and get max x and y of bottom-right corner
    var maxX = -1,
      maxY = -1;
    layout.eachNode(function(u, value) {
      if (!opts.boundsOnly) {
        nmap[u].moveTo(value.x - value.width/2.0, value.y - value.height/2.0);
      }
      maxX = Math.max(value.x + value.width, maxX);
      maxY = Math.max(value.y + value.height, maxY);
    });
    // new size of the graph should be:
    var graphDims = { width: maxX + 5, height: maxY + 5}; // +5 for the box shadow :)
    if (!opts.boundsOnly) { // if we should update..
      // set the size of the graph
      graph.css(graphDims);
      // call the JSAV edge layout function for all the edges
      edges = graph.edges();
      while (edges.hasNext()) {
        edge = edges.next();
        edge.layout();
      }
    }
    // return the new bounds of the graph
    return $.extend({ top: graph.position().top }, graphDims);
  };
  // expose the dagre layout function as layered layout
  JSAV.ext.ds.layout.graph.layered = dagreLayout;
  // end the layered graph layout stuff..


  // The GraphNode type definition
  var GraphNode = function(container, value, options) {
    this.jsav = container.jsav;
    this.container = container;
    this.options = $.extend(true, {visible: true, left: 0, top: 0}, options);
    var el = this.options.nodeelement || $("<div><span class='jsavvalue'>" + this._valstring(value) + "</span></div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavgraphnode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if (this.options.autoResize) {
      el.addClass("jsavautoresize");
    }
    this.container.element.append(el);

    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(GraphNode, JSAV._types.ds.Node);
  var nodeproto = GraphNode.prototype;
  nodeproto.css = JSAV.utils._helpers.css;
  nodeproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  nodeproto.neighbors = function() {
    var edges,
        neighbors = [],
        edge, i, l;
    if (this.container.options.directed) { // directed graph
      edges = this.container._edges[this.container._nodes.indexOf(this)];
      for (i = 0, l = edges.length; i < l; i++) {
        neighbors.push(edges[i].end());
      }
    } else { // undirected graph
      // inefficient way to go through all edges, but educational graphs should be small :)
      edges = this.container.edges();
      for (i = 0, l = edges.length; i < l; i++) {
        edge = edges[i];
        if (edge.start() === this) {
          neighbors.push(edge.end());
        } else if (edge.end() === this) {
          neighbors.push(edge.start());
        }
      }
    }
    return JSAV.utils.iterable(neighbors);
  };
  nodeproto.edgeTo = function(node) {
    return this.container.getEdge(this, node);
  };
  nodeproto.edgeFrom = function(node) {
    return node.edgeTo(this);
  };

  nodeproto.equals = function(otherNode, options) {
    if (!otherNode || this.value() !== otherNode.value()) {
      return false;
    }

    // compare css properties of the node
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherNode, options.css);
      if (!cssEquals) { return false; }
    }
    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherNode, options["class"]);
      if (!classEquals) { return false; }
    }

    var myNeighbors = this.neighbors().sort(Graph._nodeSortFunction),
        otherNeighbors = otherNode.neighbors().sort(Graph._nodeSortFunction),
        myNeighbor, otherNeighbor;
    // different number of neighbors -> cannot be equal nodes
    if (myNeighbors.length !== otherNeighbors.length) { return false; }

    var i;
    for (i = myNeighbors.length; i--; ) {
      myNeighbor = myNeighbors[i];
      otherNeighbor = otherNeighbors[i];
      // if value of neighbor differs, this node is different than otherNode
      if (myNeighbor.value() !== otherNeighbor.value()) { return false; }
      // if edges differ -> not the same nodes
      if (!this.container.getEdge(this, myNeighbor)
                .equals(otherNode.container.getEdge(otherNode, otherNeighbor),
                        $.extend({}, options, {dontCheckNodes: true})
                        //options
                        )) {
        return false;
      }
    }

    return true; // values equal, neighbors equal, edges equal, nothing else to compare
  };

  // expose the types
  var dstypes = JSAV._types.ds;
  dstypes.Graph = Graph;
  dstypes.GraphNode = GraphNode;

  // add functions to jsav.ds to create graphs
  JSAV.ext.ds.graph = function(options) {
    return new Graph(this, $.extend(true, {visible: true, autoresize: true}, options));
  };

})(jQuery);
