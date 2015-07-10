"use strict";
/*global alert: true, ODSA */

(function ($) {

  function randomGraphGen(graph, numberOfNodes, numberOfEdges) {
  var one, two;
  var nodes =[];
  
  //var g = jsav.ds.graph({width: 600, height: 400, directed: true});
  for(var i = 0; i < numberOfNodes; i++) {
    graph.addNode(i);
    console.log("node " + i);
  }
  nodes = graph.nodes();
  console.log("size " + nodes.length);
  console.log("array nodes " + nodes[3].value());
   for(var i = 0; i < numberOfEdges;) {
     one = JSAV.utils.rand.numKey(0, numberOfNodes);
     two = JSAV.utils.rand.numKey(0, numberOfNodes);
     //one = randomNumber(0, numberOfNodes);
     //two = randomNumber(0, numberOfNodes);
    if(one !== two) {
      if(!(graph.hasEdge(nodes[one], nodes[two]))) {
        graph.addEdge(nodes[one], nodes[two]);
        i++;
        console.log("Edge " + one + " to " + two);
      }
    }
  }
  return graph;
   //graph.layout();
   //graph.recorded();
 }
 ODSA.AV.randomGraphGen = randomGraphGen;

}(jQuery));
