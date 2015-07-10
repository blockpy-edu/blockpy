(function ($) {
  "use strict";
  /*global alert: true, ODSA */
  $(document).ready(function () {
    var settings = new JSAV.utils.Settings($(".jsavsettings")),
    jsav = new JSAV($('.avcontainer'), {settings: settings}),
    exercise, graph, tree, modelGraph, randomWeights = [], arr = [], labels, weights, treeNodes = [], 
    modelWeights, modelLabels, modelMst, edgeCount = 8, graphNodes = [], gnodes = [], mstnodes = [];
    var exerciseStep, modelStep;
    jsav.recorded();
	
    function init() {
	  var i;
	  modelStep = 0;
	  exerciseStep = 0;
      if (graph) {
        graph.clear();
      }
      var count = 0;
      var weight;
      randomWeights = new Array(edgeCount);
      while (true){
        weight = Math.floor((Math.random() * 10));
        if (weight === 0){
          continue;
        }
        else{
          randomWeights[count] = weight;
          count++;
        }
        if (count === edgeCount){
          break;
        }
      }
	  if (tree) {
	    tree.clear();
	  }
	  graph = jsav.ds.graph({width: 720, height: 600, layout: "manual", directed: false});
      initGraph("orig");
      graph.layout();
	  initTree();
      arr = new Array(edgeCount);
      for (i = 0; i < arr.length; i++) {
        arr[i] = "("+graph.edges()[i].start().value()+","+graph.edges()[i].end().value()+")";
      }
      labels = jsav.ds.array(arr, {layout: "vertical", left: 563, top: 120});
      for (i = 0; i < arr.length; i++) {
        arr[i] = graph.edges()[i].weight();
      }
      weights = jsav.ds.array(arr, {layout: "vertical", left: 610, top: 120});
      jsav.displayInit();
      return graph;
    }
    function fixState(mGraph) {
	  var edge;
	  var startNode;
	  var endNode;
	  var index;
	  console.log(exerciseStep);
	  for (var i = 0; i < edgeCount; i++) {
	    if (mGraph.edges()[i].addedStep === exerciseStep) {
		  edge = graph.edges()[i];
		  console.log(mGraph.edges()[i].start().value()+"  "+mGraph.edges()[i].end().value()+"  "+mGraph.edges()[i].addedStep);
		  index = i;
		  break;
		}
	  }
	  startNode = edge.start();
	  endNode = edge.end();
	  edge.css({"stroke-width": "4", "stroke": "red"});
	  edge.addClass('visited');
	  startNode.addClass('visited');
	  startNode.highlight();
	  endNode.addClass('visited');
	  endNode.highlight();
      weights.css(index, {'background-color':'red'});
      labels.css(index, {'background-color':'red'});
    }
    function model(modeljsav) {
      var i;
	  if (tree) {
	    tree.clear();
	  }
      modelGraph = modeljsav.ds.graph({width: 600, height: 600, layout: "manual", directed: false});
      modelMst = modeljsav.ds.graph({width: 600, height: 400, layout: "manual", directed: false});
      modelMst.hide();
      initGraph("model");
      modelGraph.layout();
	  initTree();
      arr = new Array(edgeCount);
      for (i = 0; i < arr.length; i++) {
        arr[i] = "("+modelGraph.edges()[i].start().value()+","+modelGraph.edges()[i].end().value()+")";
      }
      modelLabels = modeljsav.ds.array(arr, {layout: "vertical", left: 653, top: -5});
      for (i = 0; i < arr.length; i++) {
        arr[i] = modelGraph.edges()[i].weight();
      }
      modelWeights = modeljsav.ds.array(arr, {layout: "vertical", left: 700, top: -5});
      modeljsav.displayInit();
	  kruskal(modeljsav);
	  displayMST(modeljsav);
      return modelGraph;
    }
    function findMinimumEdge() {
      var minEdge;
      var i;
      for (i = 0; i < modelGraph.edges().length; i++) {
        if (!modelGraph.edges()[i].hasClass('visited')) {
          minEdge = modelGraph.edges()[i]; 
          break;
        }
      }
      for (i = 0; i < modelGraph.edges().length; i++) {
        if ((modelGraph.edges()[i].weight() < minEdge.weight()) && !modelGraph.edges()[i].hasClass('visited')) {
          minEdge = modelGraph.edges()[i];		  
        }
      }
      return minEdge;
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
	  tree.hide();
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
    function kruskal(modeljsav) {
      var i;
      var minEdge;
      var startNode;
      var endNode;
      var startTreeNode;
      var endTreeNode;
      var alreadyUnioned;
      var msg;
      var mstedge;
      for (i = 0; i < modelGraph.edges().length; i++) {
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
		  modelStep++;
		  minEdge.addedStep = modelStep;
          markIt(startNode, modeljsav);
          markIt(endNode, modeljsav);
		  modelWeights.css(modelGraph.edges().indexOf(minEdge), {'background-color':'red'});
          modelLabels.css(modelGraph.edges().indexOf(minEdge), {'background-color':'red'});
		  modeljsav.stepOption('grade', true);
          mstedge = modelMst.addEdge(mstnodes[gnodes.indexOf(startNode)], mstnodes[gnodes.indexOf(endNode)], {"weight": minEdge.weight()});
          mstedge.css({"stroke-width": "2", "stroke": "red"});
        }
        else {
          msg += " Dismiss edge";
          minEdge.css({"stroke-width": "4", "stroke": "orange"});
		  minEdge.addedStep = -1;
          modelWeights.css(modelGraph.edges().indexOf(minEdge), {'background-color':'orange'});
          modelLabels.css(modelGraph.edges().indexOf(minEdge), {'background-color':'orange'});
        }
        modeljsav.umsg(msg); 
        minEdge.addClass('visited');
        modeljsav.step();
      }
    }
    function initGraph(type) {
      var a, b, c, d, e, f;
      //Nodes of the original graph
      if (type === "orig") {
        a = graph.addNode("A", {"left": 25, "top": 50});
        b = graph.addNode("B", {"left": 325, "top": 50});
        c = graph.addNode("C", {"left": 145, "top": 75});
        d = graph.addNode("D", {"left": 145, "top": 200});
        e = graph.addNode("E", {"left": 0, "top": 300});
        f = graph.addNode("F", {"left": 325, "top": 250});
        //Original graph edges
        graph.addEdge(a, c, {"weight": randomWeights[0]});
        graph.addEdge(a, e, {"weight": randomWeights[1]});
        graph.addEdge(c, b, {"weight": randomWeights[2]});
        graph.addEdge(c, d, {"weight": randomWeights[3]});
        graph.addEdge(c, f, {"weight": randomWeights[4]});
        graph.addEdge(d, f, {"weight": randomWeights[5]});
        graph.addEdge(e, f, {"weight": randomWeights[6]});
		graph.addEdge(f, b, {"weight": randomWeights[7]});
		graphNodes = graph.nodes();
		for (var i = 0; i < graphNodes.length; i++) {
          graphNodes[i].index = i;
        }
      }
      else {
        //Nodes of the model Graph
        a = modelGraph.addNode("A", {"left": 25, "top": 50});
        b = modelGraph.addNode("B", {"left": 325, "top": 50});
        c = modelGraph.addNode("C", {"left": 145, "top": 75});
        d = modelGraph.addNode("D", {"left": 145, "top": 200});
        e = modelGraph.addNode("E", {"left": 0, "top": 300});
        f = modelGraph.addNode("F", {"left": 325, "top": 250});
        //Nodes of the Model MST
        modelMst.addNode("A", {"left": 25, "top": 50});
        modelMst.addNode("B", {"left": 325, "top": 50});
        modelMst.addNode("C", {"left": 145, "top": 75});
        modelMst.addNode("D", {"left": 145, "top": 200});
        modelMst.addNode("E", {"left": 0, "top": 300});
        modelMst.addNode("F", {"left": 325, "top": 250});
        //Model graph edges
        modelGraph.addEdge(a, c, {"weight": randomWeights[0]});
        modelGraph.addEdge(a, e, {"weight": randomWeights[1]});
        modelGraph.addEdge(c, b, {"weight": randomWeights[2]});
        modelGraph.addEdge(c, d, {"weight": randomWeights[3]});
        modelGraph.addEdge(c, f, {"weight": randomWeights[4]});
        modelGraph.addEdge(d, f, {"weight": randomWeights[5]});
        modelGraph.addEdge(e, f, {"weight": randomWeights[6]});
		modelGraph.addEdge(f, b, {"weight": randomWeights[7]});
        gnodes = modelGraph.nodes();
        mstnodes = modelMst.nodes();
        for (var i = 0; i < mstnodes.length; i++) {
          gnodes[i].index = i;
        }
      }
    }
    function displayMST(modeljsav) {
      modelGraph.hide();
      modelMst.show();
      modelMst.layout();
      modeljsav.umsg("Complete minimum spanning tree");
    }
    // Mark a node in the graph.
    function markIt(node, modeljsav) {
      node.addClass("visited");
      modeljsav.umsg("Add node " + node.value() + " to the MST");
      node.highlight();
    }
    // Process About button: Pop up a message with an Alert
    function about() {
      alert("Heapsort Proficiency Exercise\nWritten by Ville Karavirta\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/cashaffer/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }
    exercise = jsav.exercise(model, init,
                             { compare:  { css: "background-color" },
                               controls: $('.jsavexercisecontrols'),
                               fix: fixState });
    exercise.reset();
	$(".jsavcontainer").on("click", ".jsavarray .jsavindex", function () {
	  var edge;
	  var startNode;
	  var endNode;
      var index = $(this).parent(".jsavarray").find(".jsavindex").index(this);
	  if (!graph.edges()[index].hasClass('visited')) {
	    exerciseStep++;
	    edge = graph.edges()[index];
	    startNode = edge.start();
	    endNode = edge.end();
	    edge.css({"stroke-width": "4", "stroke": "red"});
	    edge.addClass('visited');
	    startNode.addClass('visited');
	    startNode.highlight();
	    endNode.addClass('visited');
	    endNode.highlight();
	    weights.css(index, {'background-color':'red'});
        labels.css(index, {'background-color':'red'});
	    exercise.gradeableStep();
	  }
	});
    $(".jsavcontainer").on("click", ".jsavgraphnode", function () {
      alert("Please click on graph edges from the array to the left NOT graph nodes");
    });
    $("#about").click(about);
  });
}(jQuery));
