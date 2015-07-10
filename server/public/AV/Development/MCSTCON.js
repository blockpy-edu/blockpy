"use strict";

(function ($) {
  var jsav = new JSAV("MCSTCON1", {"animationMode": "none"});
  var g = jsav.ds.graph({width: 500, height: 250,
                         layout: "manual", directed: false});
  var j1 = g.addNode("A", {"left":  20, "top":   0});
  var j2 = g.addNode("B", {"left": 250, "top":   0});
  var j3 = g.addNode("C", {"left": 100, "top":  50});
  var j4 = g.addNode("D", {"left": 100, "top": 150});
  var j5 = g.addNode("E", {"left":   0, "top": 200});
  var j6 = g.addNode("F", {"left": 250, "top": 175});
  g.addEdge(j1, j3, {"weight": 7});
  g.addEdge(j1, j5, {"weight": 9});
  g.addEdge(j2, j3, {"weight": 5});
  g.addEdge(j2, j6, {"weight": 6});
  g.addEdge(j3, j4, {"weight": 1});
  g.addEdge(j3, j6, {"weight": 2});
  g.addEdge(j4, j6, {"weight": 2});
  g.addEdge(j5, j6, {"weight": 1});
  g.layout();
  jsav.displayInit();
}(jQuery));
