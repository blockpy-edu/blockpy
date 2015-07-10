/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "GdirundirCON";
  var av = new JSAV(av_name, {"animationMode" : "none"});

  var gTop = -5;
  var gLeft = 70;
  var gWidth = 150;
  var gHeight = 140;
  var lHeight = 120; // For the graph labels

  // Lines for visual break up
  av.g.line(285, gTop, 285, gHeight).addClass("borderEdge");
  av.g.line(570, gTop, 570, gHeight).addClass("borderEdge");

  // Create graph (a)
  var graphA = av.ds.graph({top: gTop, left: gLeft,
                            width: gWidth, height: gHeight});

  var node0 = graphA.addNode("", {left:   0, top:   0});
  var node1 = graphA.addNode("", {left:   0, top: 100});
  var node2 = graphA.addNode("", {left: 100, top:   0});
  var node3 = graphA.addNode("", {left: 100, top: 100});
  var node4 = graphA.addNode("", {left:  50, top:  50});

  graphA.addEdge(node0, node1);
  graphA.addEdge(node0, node4);
  graphA.addEdge(node1, node3);
  graphA.addEdge(node2, node4);
  graphA.addEdge(node3, node2);
  graphA.addEdge(node4, node1);
  graphA.layout();

  av.label("(a)", {top: lHeight, left: 125}).show();
    
  // Create graph (b)
  var g2Left = 360;
  var graphB = av.ds.graph({left: g2Left, top: gTop, directed: true,
                              width: gWidth, height: gHeight});

  node0 = graphB.addNode("", {left:   0, top:   0});
  node1 = graphB.addNode("", {left:   0, top: 100});
  node2 = graphB.addNode("", {left: 100, top:   0});
  node3 = graphB.addNode("", {left: 100, top: 100});
  node4 = graphB.addNode("", {left:  50, top:  50});

  graphB.addEdge(node0, node1);
  graphB.addEdge(node0, node4);
  graphB.addEdge(node1, node3);
  graphB.addEdge(node2, node4);
  graphB.addEdge(node3, node2);
  graphB.addEdge(node4, node1);

  graphB.layout();
  av.label("(b)", {top: lHeight, left: 415}).show();

  // Create graph (c)
  gLeft = 650;
  var graphC = av.ds.graph({left: gLeft, top: gTop, directed: true,
                            width: gWidth, height: gHeight});

  node0 = graphC.addNode("0", {left:   0, top:   0});
  node1 = graphC.addNode("1", {left:   0, top: 100});
  node2 = graphC.addNode("2", {left: 100, top:   0});
  node3 = graphC.addNode("3", {left: 100, top: 100});
  node4 = graphC.addNode("4", {left:  50, top:  50});

  graphC.addEdge(node0, node1, {weight: 3});
  graphC.addEdge(node0, node4, {weight: 4});
  graphC.addEdge(node1, node3, {weight: 3});
  graphC.addEdge(node2, node4, {weight: 1});
  graphC.addEdge(node3, node2, {weight: 7});
  graphC.addEdge(node4, node1, {weight: 1});
  graphC.layout();
  av.label("(c)", {top: lHeight, left: 705}).show();
});
