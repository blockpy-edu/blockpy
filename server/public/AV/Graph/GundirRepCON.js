"use strict";
$(document).ready(function () {
  var av_name = "GundirRepCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name,
                         "json_path": "AV/Graph/GraphDefCON.json"}).interpreter;
  var av = new JSAV(av_name, {"animationMode" : "none"});

  //set up graph 
  var gTop = 0; 
  var gLeft = 80;
  var lTop = 180;

  var graph = av.ds.graph({top: gTop + 30, left: gLeft, height: 150, directed: false});

  var node0 = graph.addNode("0", {left:   0, top:   0});
  var node1 = graph.addNode("1", {left:   0, top: 100});
  var node2 = graph.addNode("2", {left: 100, top:   0});
  var node3 = graph.addNode("3", {left: 100, top: 100});
  var node4 = graph.addNode("4", {left:  50, top:  50});

  graph.addEdge(node0, node1);
  graph.addEdge(node0, node4);
  graph.addEdge(node1, node3);
  graph.addEdge(node2, node4);
  graph.addEdge(node3, node2);
  graph.addEdge(node4, node1);
  graph.layout();

  //set up adjancey matrix 
  var a = av.label("Adajceny Matrix", {top: lTop, left: 355}).show();

    var mat = av.ds.matrix([[ , 1, , ,1], [1 , , , 1 , 1], [ , , , 1 , 1],
                            [ , 1,1 , , ,], [1, 1, 1, , ,]], 
                         {style: "table", top: gTop + 20, left: gLeft + 250});

  var row = av.label(" 0 1 2 3 4", {top: gTop, left: gLeft + 265}).addClass("addSpace");
  var col = av.label(" 0  1  2  3  4", {top: gTop + 90, left: gLeft + 170}).addClass("vertical-text").addClass("addSpace");
  mat.layout();

  //set up list representation 
  var aTop = 0; 
  var aLeft = gLeft + 500;

  var aList = av.ds.array([, , , , ,],
                    {indexed: true, left: aLeft, top: aTop, layout: "vertical"});
  aList.layout();

  // Adjacency lists layout constants
  var listTop =  7;
  var listLeft = gLeft + 570;
  var listGap = 34;
  var arrowTop = 32;
  var arrowLeft = listLeft - 45;

  // set up Vertex 0 linked list
  var list0 = av.ds.list({top: listTop, left: listLeft});
  list0.addFirst("1");
  list0.add(1, "4");
  list0.layout();

  // set up Vertex 1 linked list
  var list1 = av.ds.list({top: listTop + listGap * 1, left: listLeft});
  list1.addFirst("0");
  list1.add(1, "3");
  list1.add(2, "4");
  list1.layout();
    
  // set up Vertex 2 linked list
  var list2 = av.ds.list({top: listTop + listGap * 2, left: listLeft});
  list2.addFirst("3");
  list2.addFirst("4");
  list2.layout();

  // set up Vertex 3 linked list
  var list3 = av.ds.list({top: listTop + listGap * 3, left: listLeft});
  list3.addFirst("1");
  list3.addFirst("2");
  list3.layout();

  // set up Vertex 4 linked list
  var list4 = av.ds.list({top: listTop + listGap * 4, left: listLeft});
  list4.addFirst("0");
  list4.add(1, "1");
  list4.add(2, "2");
  list4.layout();

  //add lines connect array to list 
  av.g.line(arrowLeft, arrowTop, arrowLeft + 45, arrowTop,
            {'arrow-end': 'classic-wide-long', 'stroke-width': 2}); 
  av.g.line(arrowLeft, arrowTop + listGap * 1, arrowLeft + 45, arrowTop + listGap * 1,
            {'arrow-end': 'classic-wide-long', 'stroke-width': 2});
  av.g.line(arrowLeft, arrowTop + listGap * 2, arrowLeft + 45, arrowTop + listGap * 2,
            {'arrow-end': 'classic-wide-long', 'stroke-width': 2});
  av.g.line(arrowLeft, arrowTop + listGap * 3, arrowLeft + 45, arrowTop + listGap * 3,
            {'arrow-end': 'classic-wide-long', 'stroke-width': 2});
  av.g.line(arrowLeft, arrowTop + listGap * 4, arrowLeft + 45, arrowTop + listGap * 4,
            {'arrow-end': 'classic-wide-long', 'stroke-width': 2});

  av.label("Adajceny List", {top: lTop, left: 600}).show();
});
