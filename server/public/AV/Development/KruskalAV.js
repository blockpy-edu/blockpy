"use strict";
/*global alert: true, ODSA */
(function ($) {
  var jsav; 
  var graph;
  var mst;   //A graph representing the resulted MST
  var tree;  //Union/Find Tree
  var gnodes = [];
  var mstnodes = [];
  var treeNodes = [];
  var labels;
  var weights;
  var arr;     //Used to initialize the distance and labels arrays.

  function runit() {
    var i;
    ODSA.AV.reset(true);
    jsav = new JSAV($('.avcontainer'));
    graph = jsav.ds.graph({width: 776, height: 450, layout: "manual", directed: false});
    mst = jsav.ds.graph({width: 776, height: 450, layout: "manual", directed: false});
    initGraph();
    initTree();
    graph.layout();
    arr = new Array(graph.edges().length);
    for (i = 0; i < arr.length; i++) {
      arr[i] = "("+graph.edges()[i].start().value()+","+graph.edges()[i].end().value()+")";
    }
    labels = jsav.ds.array(arr, {layout: "vertical", left: 573, top: -40});
    for (i = 0; i < arr.length; i++) {
      arr[i] = graph.edges()[i].weight();
    }
    weights = jsav.ds.array(arr, {layout: "vertical", left: 620, top: -40});
    jsav.displayInit();
    kruskal();
    displayMST();
    jsav.recorded();
  }
  function findMinimumEdge() {
    var minEdge;
    var i;
    for (i = 0; i < graph.edges().length; i++) {
      if (!graph.edges()[i].hasClass('visited')) {
        minEdge = graph.edges()[i]; 
        break;
      }
    }
    for (i = 0; i < graph.edges().length; i++) {
      if ((graph.edges()[i].weight() <= minEdge.weight()) && !graph.edges()[i].hasClass('visited')) {
        minEdge = graph.edges()[i]; 
      }
    }
    return minEdge;
  }
  function displayMST() {
    graph.hide();
    mst.layout();
    jsav.umsg("Complete minimum spanning tree");
  }

  // Mark a node in the graph.
  function markIt(node) {
    node.addClass("visited");
    //jsav.umsg("Add node " + node.value() + " to the MST");
    node.highlight();
    //jsav.step();
  }

  function kruskal() {
    var i;
    var minEdge;
    var startNode;
    var endNode;
    var startTreeNode;
    var endTreeNode;
    var alreadyUnioned;
    var msg;
    var mstedge;
    for (i = 0; i < graph.edges().length; i++) {
      msg = "";
      minEdge = findMinimumEdge();
      startNode = minEdge.start();
      endNode = minEdge.end();
      startTreeNode = treeNodes[gnodes.indexOf(startNode)];
      endTreeNode = treeNodes[gnodes.indexOf(endNode)];
      alreadyUnioned = union(startTreeNode, endTreeNode);
      msg = "<b><u>Processing Edge ("+startNode.value()+","+endNode.value()+"):</b></u>";
      if (alreadyUnioned === false) {
        //Add to MST
        msg += " Adding edge to the MST";
        minEdge.css({"stroke-width": "4", "stroke": "red"});
        weights.css(graph.edges().indexOf(minEdge), {'background-color':'red'});
        labels.css(graph.edges().indexOf(minEdge), {'background-color':'red'});
        markIt(startNode);
        markIt(endNode);
        mstedge = mst.addEdge(mstnodes[gnodes.indexOf(startNode)], mstnodes[gnodes.indexOf(endNode)], {"weight": minEdge.weight()});
        mstedge.css({"stroke-width": "2", "stroke": "red"});
      }
      else {
        msg += " Dismiss edge";
        minEdge.css({"stroke-width": "4", "stroke": "orange"});
        weights.css(graph.edges().indexOf(minEdge), {'background-color':'orange'});
        labels.css(graph.edges().indexOf(minEdge), {'background-color':'orange'});
      }
      jsav.umsg(msg);
      minEdge.addClass('visited');
      jsav.step();
      //End Algorithm when all Nodes are added to MST
      //if (mst.edges().length === gnodes.length-1) {
        //break;
      //}
    }
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
    var parent1 = find(node1);
    var parent2 = find(node2);
    if (parent1 === parent2) {
      return true;
    }
    else if (parent1.size === parent2.size) {
      if (parent1.value().charCodeAt(0) < parent2.value().charCodeAt(0)) {
        parent1.addChild(parent2);
        parent1.size++; 
      }
      else {
        parent2.addChild(parent1);
        parent2.size++;
      } 
    }
    else if (parent1.size > parent2.size) {
      parent1.addChild(parent2);
      parent1.size++;
    }
    else {
      parent2.addChild(parent1);
      parent2.size++;
    }
    return false;
  }
  function initTree() {
    var newNode;
    tree = jsav.ds.tree();
    var root = tree.newNode("X");
    tree.root(root);
    root.id("root");
    for (var i = 0; i < gnodes.length; i++) {
      newNode = tree.newNode(gnodes[i].value());
      newNode.size = 1;   //To maintain the size of each connected component
      root.addChild(newNode);
    }
    treeNodes = new Array(gnodes.length);
    for (i = 0; i < treeNodes.length; i++) {
      treeNodes[i] = tree.root().child(i);
    }
  }
  function about() {
    var mystring = "Kruskal's Algorithm Visualization\nWritten by Mohammed Fawzi and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during Spring, 2013\nLast update: March, 2013\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Initialize the graph.
  function initGraph() {
    //Nodes of the original graph
    var a = graph.addNode("A", {"left": 25, "top": 50});
    var b = graph.addNode("B", {"left": 325, "top": 50});
    var c = graph.addNode("C", {"left": 145, "top": 75});
    var d = graph.addNode("D", {"left": 145, "top": 200});
    var e = graph.addNode("E", {"left": 0, "top": 300});
    var f = graph.addNode("F", {"left": 325, "top": 250});
    //Nodes of the MST
    mst.addNode("A", {"left": 25, "top": 50});
    mst.addNode("B", {"left": 325, "top": 50});
    mst.addNode("C", {"left": 145, "top": 75});
    mst.addNode("D", {"left": 145, "top": 200});
    mst.addNode("E", {"left": 0, "top": 300});
    mst.addNode("F", {"left": 325, "top": 250});
    //Original graph edges
    graph.addEdge(a, c, {"weight": 7});
    graph.addEdge(a, e, {"weight": 9});
    graph.addEdge(c, b, {"weight": 5});
    graph.addEdge(c, d, {"weight": 1});
    graph.addEdge(c, f, {"weight": 2});
    graph.addEdge(f, b, {"weight": 6});
    graph.addEdge(d, f, {"weight": 2});
    graph.addEdge(e, f, {"weight": 1});
    gnodes = graph.nodes();
    mstnodes = mst.nodes();
    for (var i = 0; i < mstnodes.length; i++) {
      gnodes[i].index = i;
    }
  }
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  //$('#help').click(help);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
