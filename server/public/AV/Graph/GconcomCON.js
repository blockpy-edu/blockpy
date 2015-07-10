/*global ODSA */
"use strict";
$(document).ready(function () {
  var av = new JSAV("GconcomCON", {"animationMode" : "none"});

  var gTop = 0;
  var gLeft = 150;
  var gWidth = 450;
  var gHeight = 130;

  var graph = av.ds.graph({top: gTop, left: gLeft,
                           width: gWidth, height: gHeight});

  var node0 = graph.addNode("0", {left: gLeft, top: 0});
  var node1 = graph.addNode("1", {left: gLeft,  top: 100});
  var node2 = graph.addNode("2", {left: gLeft + 100, top: 0});
  var node3 = graph.addNode("3", {left: gLeft + 100, top: 100});
  var node4 = graph.addNode("4", {left: gLeft + 50, top: 50});
  var node5 = graph.addNode("5", {left: gLeft + 175, top: 100});
  var node6 = graph.addNode("6", {left: gLeft + 175, top: 0});
  var node7 = graph.addNode("7", {left: gLeft + 250, top: 0});

  //add edges to grapph
  graph.addEdge(node0, node1);
  graph.addEdge(node0, node4);
  graph.addEdge(node1, node3);
  graph.addEdge(node1, node4);
  graph.addEdge(node2, node3);
  graph.addEdge(node2, node4);
  graph.addEdge(node5, node6);
  graph.layout();
});
