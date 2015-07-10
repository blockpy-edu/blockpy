"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var g;
  var arr;
  var a, b, c, d, e, f;
  var size;
 

function runit() {
  jsav = new JSAV($('.avcontainer'));
  g = jsav.ds.graph({width: 500, height: 500, layout: "manual", directed: true});
  a = g.addNode("Traversals", {"left": 125, "top": 150});
  b = g.addNode("Graph", {"left": 125});
  c = g.addNode("Depth First Search", { "top": 300});
  d = g.addNode("Breadth First Search", {"left":225, "top": 300});

 // a = g.addNode("A", {"left": 25, "top": 150});
 // b = g.addNode("B", {"left": 25});
 // c = g.addNode("C", {"left": 25, "top": 300});
 // d = g.addNode("D", {"left":225, "top": 300});
  

  g.addEdge(b, a,{"weight": "Problems"});
  g.addEdge(a, c, {"weight": "Algorithms"});
  g.addEdge(a, d, {"weight": "Algorithms"});
  g.layout();
 
}


  

// Graph prepartion for initial stage of visualization

function initGraph() {
  
 



}


// Connect action callbacks to the HTML entities
$('#runit').click(runit);

}(jQuery));
