"use strict";

(function ($) {
  var jsav = new JSAV("topsortCON1", {"animationMode": "none"});
  var g = jsav.ds.graph({width: 500, height: 200,
                         layout: "manual", directed: true});
  var j1 = g.addNode("J1", {"left":   0, "top":  75});
  var j2 = g.addNode("J2", {"left": 100, "top":  75});
  var j3 = g.addNode("J3", {"left": 100, "top": 150});
  var j4 = g.addNode("J4", {"left": 200, "top": 150});
  var j5 = g.addNode("J5", {"left": 300, "top":  75});
  var j6 = g.addNode("J6", {"left": 200, "top":   0});
  var j7 = g.addNode("J7", {"left": 400, "top":  75});
  g.addEdge(j1, j2);
  g.addEdge(j1, j3);
  g.addEdge(j2, j4);
  g.addEdge(j2, j5);
  g.addEdge(j2, j6);
  g.addEdge(j3, j4);
  g.addEdge(j4, j5);
  g.addEdge(j5, j7);
  g.layout();
}(jQuery));
