"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var tree;
  var parents;
  var labels;
  var arr;                   //Used to initialize the parents and labels arrays.
  var graph;                 //To hold the nodes and edges before running the union find
  var treeNodes;             //To hold references to each array index treeNode
  var gnodes = [];           //GraphNodes 

  function runit() {
    var i;
    ODSA.AV.reset(true);
    jsav = new JSAV($('.avcontainer'));

    arr = new Array(10);
    //Initializing the labels
    for (i = 0; i < arr.length; i++) {
      arr[i] = String.fromCharCode(i + 65);
    }
    labels = jsav.ds.array(arr, {left: 300, top: 17});
    //Rendering the tree on the container
    initTree();
    //Defining the graph
    initGraph();
    //Initializing the parent pointer
    for (i = 0; i < arr.length; i++) {
      arr[i] = "/";
    }
    parents = jsav.ds.array(arr, {left: 300, top: -30});

    treeNodes = new Array(arr.length);
    for (i = 0; i < treeNodes.length; i++) {
      treeNodes[i] = tree.root().child(i);    //At first
      treeNodes[i].indexFromRoot = i;
    }

    jsav.displayInit();
    processGraph();
    jsav.recorded();
  }
  function find(treeNode) {
    if (treeNode.parent() === tree.root()) {
      return treeNode;
    }
    else {
      var currentNode = treeNode;
      while (currentNode.parent() !== tree.root()) {
        currentNode = currentNode.parent();
      }
      return currentNode;
    }
  }
  function union(node1, node2) {
    //First we have to find which one has the least size
    var index1 = treeNodes.indexOf(node1);
    var index2 = treeNodes.indexOf(node2);
    if (node1.size >= node2.size) {
      node1.addChild(node2);
      node1.size++;
      parents.value(index2, node1.value());
    }
    else {
      node2.addChild(node1);
      node2.size++;
      parents.value(index1, node2.value());
    }
  }
  function initTree() {
    var newNode;
    tree = jsav.ds.tree({left: 20, top: 90, nodegap: 20});
    var root = tree.newNode("X");
    tree.root(root);
    root.id("root");
    for (var i = 0; i < arr.length; i++) {
      newNode = tree.newNode(labels.value(i));
      newNode.size = 1;   //To maintain the size of each connected component
      root.addChild(newNode);
    }
    tree.layout();
  }
  function initGraph() {
    graph = jsav.ds.graph();
    var a = graph.addNode("A");
    var b = graph.addNode("B");
    var c = graph.addNode("C");
    var d = graph.addNode("D");
    var e = graph.addNode("E");
    var f = graph.addNode("F");
    var g = graph.addNode("G");
    var h = graph.addNode("H");
    var i = graph.addNode("I");
    var j = graph.addNode("J");

    graph.addEdge(a, b);
    graph.addEdge(a, h);
    graph.addEdge(a, c);
    graph.addEdge(b, h);
    graph.addEdge(c, h);
    graph.addEdge(d, f);
    graph.addEdge(d, e);
    graph.addEdge(e, f);
    graph.addEdge(e, g);
    graph.addEdge(f, g);
    graph.addEdge(f, i);
    graph.addEdge(h, e);

    //Make the Graph invisible
    graph.hide();
    gnodes = graph.nodes();
  }
  function processGraph() {
    var currentEdge;
    var startGraphNode;
    var endGraphNode;
    var startTreeNode;
    var endTreeNode;
    var startNodeIndex;
    var endNodeIndex;
    var c1, c2;
    for (var i = 0; i < graph.edges().length; i++) {
      currentEdge = graph.edges()[i];
      startGraphNode = currentEdge.start();
      endGraphNode = currentEdge.end();
      startNodeIndex = gnodes.indexOf(startGraphNode);
      endNodeIndex = gnodes.indexOf(endGraphNode);
      startTreeNode = treeNodes[startNodeIndex];
      endTreeNode = treeNodes[endNodeIndex];

      jsav.umsg("<b><u>Processing Graph Edge (" + startGraphNode.value() + ", " + endGraphNode.value() + ")</b></u><br>");
      jsav.step();
      c1 = find(startTreeNode);
      c2 = find(endTreeNode);

      if (c1 !== c2) {
        jsav.umsg("Union Nodes (" + startGraphNode.value() + ", " + endGraphNode.value() + ")", {"preserve": true});
        union(c1, c2);
        tree.layout();
      }
      else {
        jsav.umsg("Nodes (" + startGraphNode.value() + ", " + endGraphNode.value() + ") are already unioned", {"preserve": true});
      }
      jsav.step();
    }
    jsav.umsg("Final UnionFind Data Structure");
  }

  function about() {
    var mystring = "Union Find Data Structure Visualization\nWritten by Mohammed Fawzi and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during Spring, 2013\nLast update: March, 2013\nJSAV library version " + JSAV.version();
    alert(mystring);
  }
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  //$('#help').click(help);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));