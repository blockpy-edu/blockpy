/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "GsparseDefCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name,
                         "json_path": "AV/Graph/GraphDefCON.json"}).interpreter;
  var av = new JSAV(av_name, {"animationMode" : "none"});

  var gTop = -5;
  var gToffset = 200;
  var gLeft = 90;
  var gLoffset = 430;
  var gWidth = 250;
  var gHeight = 140;
  var lTop = 145; // For the graph labels
  var lToffset = 195; // For the graph labels

  // Lines for visual break up
  av.g.line(0, 190, 850, 190).addClass("borderEdge");
  av.g.line(425, 0, 425, 400).addClass("borderEdge");

  // Graph one
  var graphA = av.ds.graph({top: gTop, left: gLeft,
                            width: gWidth, height: gHeight});

  var node0 = graphA.addNode("0", {left:   0, top:  10});
  var node1 = graphA.addNode("1", {left: 150, top:   0});
  var node2 = graphA.addNode("2", {left:  75, top:  60});
  var node3 = graphA.addNode("3", {left:   0, top:  80});
  var node4 = graphA.addNode("4", {left: 175, top:  65});
  var node5 = graphA.addNode("5", {left: 200, top: 110});

  graphA.addEdge(node0, node2);
  graphA.addEdge(node0, node3);
  graphA.addEdge(node1, node2);
  graphA.addEdge(node1, node4);
  graphA.layout();

  av.label(interpret("av_l6"), {top: lTop, left: 10, width: 5}).show();


  //second graph
  var graphB = av.ds.graph({top: gTop, left: gLeft + gLoffset,
                              width: gWidth, height: gHeight});

  node0 = graphB.addNode("0", {left:   0, top:  10});
  node1 = graphB.addNode("1", {left: 150, top:   0});
  node2 = graphB.addNode("2", {left:  80, top:  70});
  node3 = graphB.addNode("3", {left:   0, top:  80});
  node4 = graphB.addNode("4", {left: 175, top:  50});
  node5 = graphB.addNode("5", {left: 200, top: 100});

  graphB.addEdge(node0, node1);
  graphB.addEdge(node0, node2);
  graphB.addEdge(node0, node3);
  graphB.addEdge(node0, node4);
  graphB.addEdge(node0, node5);
  graphB.addEdge(node1, node2);
  graphB.addEdge(node1, node3);
  graphB.addEdge(node1, node3);
  graphB.addEdge(node1, node4);
  graphB.addEdge(node2, node3);
  graphB.addEdge(node2, node5);
  graphB.addEdge(node3, node5);
  graphB.addEdge(node4, node5);
  graphB.layout();

  av.label(interpret("av_l7"), {top: lTop, left: 450, width: 5}).show();

  //third graph
  // Create a complete graph
  var graphC = av.ds.graph({top: gTop + gToffset, left: gLeft,
                              width: gWidth, height: gHeight});

  node0 = graphC.addNode("0", {left:  75, top:   0});
  node1 = graphC.addNode("1", {left: 150, top:  50});
  node2 = graphC.addNode("2", {left: 125, top: 110});
  node3 = graphC.addNode("3", {left:  25, top: 110});
  node4 = graphC.addNode("4", {left:   0, top:  50});

  graphC.addEdge(node0, node1);
  graphC.addEdge(node0, node2);
  graphC.addEdge(node0, node3);
  graphC.addEdge(node0, node4);
  graphC.addEdge(node1, node2);
  graphC.addEdge(node1, node3);
  graphC.addEdge(node1, node4);
  graphC.addEdge(node2, node3);
  graphC.addEdge(node2, node4);
  graphC.addEdge(node3, node4);
  graphC.layout();

  av.label(interpret("av_l8"), {top: lTop + lToffset, left: 0}).show();

  //last graph
  var graphD = av.ds.graph({top: gTop + gToffset, left: gLeft + gLoffset,
                               width: gWidth, height: gHeight});

  node0 = graphD.addNode("0", {left:   0, top:  10});
  node1 = graphD.addNode("1", {left: 150, top:   0});
  node2 = graphD.addNode("2", {left:  80, top:  70});
  node3 = graphD.addNode("3", {left:   0, top:  80});
  node4 = graphD.addNode("4", {left: 175, top:  50});
  node5 = graphD.addNode("5", {left: 200, top: 100});

  graphD.addEdge(node0, node1);
  graphD.addEdge(node0, node2).addClass("redEdge");
  graphD.addEdge(node0, node3).addClass("redEdge");
  graphD.addEdge(node0, node4);
  graphD.addEdge(node0, node5).addClass("redEdge");
  graphD.addEdge(node1, node2);
  graphD.addEdge(node1, node3);
  graphD.addEdge(node1, node3);
  graphD.addEdge(node1, node4);
  graphD.addEdge(node2, node3).addClass("redEdge");
  graphD.addEdge(node2, node5).addClass("redEdge");
  graphD.addEdge(node3, node5).addClass("redEdge");
  graphD.addEdge(node4, node5);
  graphD.layout();

  av.label(interpret("av_l9"), {top: lTop + lToffset, left: 445}).show();
});
