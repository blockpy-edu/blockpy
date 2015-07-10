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
  var parents;
  var treeLabels;
  var arr;     //Used to initialize the distance and labels arrays.

  function runit() {
    var i;
    ODSA.AV.reset(true);
    jsav = new JSAV($('.avcontainer'));
    graph = jsav.ds.graph({width: 600, height: 400, layout: "manual", directed: false});
    mst = jsav.ds.graph({width: 600, height: 400, layout: "manual", directed: false});
	mst.hide();
    initGraph();
    initTree();
    graph.layout();
	tree.layout();
    arr = new Array(graph.edges().length);
    for (i = 0; i < arr.length; i++) {
      arr[i] = "("+graph.edges()[i].start().value()+","+graph.edges()[i].end().value()+")";
    }
    labels = jsav.ds.array(arr, {layout: "vertical", left: 673, top: -120});
    for (i = 0; i < arr.length; i++) {
      arr[i] = graph.edges()[i].weight();
    }
    weights = jsav.ds.array(arr, {layout: "vertical", left: 720, top: -120});
	
	arr = new Array(gnodes.length);
    //Initializing the labels
    for (i = 0; i < arr.length; i++) {
      arr[i] = String.fromCharCode(i + 65);
    }
	treeLabels = jsav.ds.array(arr, {left: 0, top: 40, indexed: true});
    //Initializing the parent pointer
    for (i = 0; i < arr.length; i++) {
      arr[i] = "/";
    }
    parents = jsav.ds.array(arr, {left: 0, top: -7});
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
	tree.hide();
	treeLabels.hide();
	parents.hide();
	mst.show();
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
	  jsav.umsg("<b><u>Processing Edge ("+startNode.value()+","+endNode.value()+"):</b></u>");
	  jsav.step();
      alreadyUnioned = union(startTreeNode, endTreeNode);
      if (alreadyUnioned === false) {
        //Add to MST
        jsav.umsg("<br>Add edge to the MST", {'preserve': true});
        minEdge.css({"stroke-width": "4", "stroke": "red"});
        weights.css(graph.edges().indexOf(minEdge), {'background-color':'red'});
        labels.css(graph.edges().indexOf(minEdge), {'background-color':'red'});
        markIt(startNode);
        markIt(endNode);
        mstedge = mst.addEdge(mstnodes[gnodes.indexOf(startNode)], mstnodes[gnodes.indexOf(endNode)], {"weight": minEdge.weight()});
        mstedge.css({"stroke-width": "2", "stroke": "red"});
      }
      else {
        jsav.umsg("<br>Dismiss edge", {'preserve': true});
        minEdge.css({"stroke-width": "4", "stroke": "orange"});
        weights.css(graph.edges().indexOf(minEdge), {'background-color':'orange'});
        labels.css(graph.edges().indexOf(minEdge), {'background-color':'orange'});
      }
      minEdge.addClass('visited');
      jsav.step();
      //End Algorithm when all Nodes are added to MST
      if (mst.edges().length === gnodes.length-1) {
        break;
      }
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
	var index1 = treeNodes.indexOf(parent1);
    var index2 = treeNodes.indexOf(parent2);
	jsav.umsg('<br>Parent Of Node ('+node1.value()+') is ('+parent1.value()+')', {'preserve': true});
	parent1.highlight();
	treeLabels.highlight(index1);
	jsav.step();
	jsav.umsg('<br>Parent Of Node ('+node2.value()+') is ('+parent2.value()+')', {'preserve': true});
	parent2.highlight();
	treeLabels.highlight(index2);
	jsav.step();
    if (parent1 === parent2) {
	  jsav.umsg('<br>Nodes are already Unioned', {'preserve': true});
      parent1.unhighlight();
      treeLabels.unhighlight(index1);
      parent2.unhighlight();
      treeLabels.unhighlight(index2);
	  jsav.step();
      return true;
    }
    else if (parent1.size === parent2.size) {
      if (parent1.value().charCodeAt(0) < parent2.value().charCodeAt(0)) {
        parent1.addChild(parent2);
        parent1.size++; 
		parents.value(index2, index1);
      }
      else {
        parent2.addChild(parent1);
        parent2.size++;
		parents.value(index1, index2);
      } 
    }
    else if (parent1.size > parent2.size) {
      parent1.addChild(parent2);
      parent1.size++;
	  parents.value(index2, index1);
    }
    else {
      parent2.addChild(parent1);
      parent2.size++;
	  parents.value(index1, index2);
    }
	jsav.umsg('<br>Union Nodes', {'preserve': true});
	parent1.unhighlight();
	treeLabels.unhighlight(index1);
	parent2.unhighlight();
	treeLabels.unhighlight(index2);
	tree.layout();
	jsav.step();
    return false;
  }
  function initTree() {
    var newNode;
    tree = jsav.ds.tree({left: 0, top: 90, nodegap: 20});
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
    var a = graph.addNode("A", {"left": 50, "top": -15});
    var b = graph.addNode("B", {"left": 350, "top": -15});
    var c = graph.addNode("C", {"left": 190, "top": 10});
    var d = graph.addNode("D", {"left": 190, "top": 125});
    var e = graph.addNode("E", {"left": 50, "top": 225});
    var f = graph.addNode("F", {"left": 350, "top": 175});
    //Nodes of the MST
    mst.addNode("A", {"left": 25, "top": -15});
    mst.addNode("B", {"left": 325, "top": -15});
    mst.addNode("C", {"left": 145, "top": 10});
    mst.addNode("D", {"left": 145, "top": 125});
    mst.addNode("E", {"left": 0, "top": 225});
    mst.addNode("F", {"left": 325, "top": 175});
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
