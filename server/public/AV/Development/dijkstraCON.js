"use strict";

(function ($) {
  var jsav = new JSAV("dijkstraCON1", {"animationMode": "none"});
  var g = jsav.ds.graph({width: 300, height: 200,
                         layout: "manual", directed: true});
  var a = g.addNode("a", {"left": 0, "top":  75});
  var b = g.addNode("b", {"left": 100, "top":  0});
  var c = g.addNode("c", {"left": 100, "top": 150});
  var d = g.addNode("d", {"left": 250, "top":  25});
  var e = g.addNode("e", {"left": 250, "top": 150});

  g.addEdge(a, b, {"weight": 10});
  g.addEdge(a, c, {"weight":  3});
  g.addEdge(a, d, {"weight": 20});
  g.addEdge(b, d, {"weight":  5});
  g.addEdge(c, b, {"weight":  2});
  g.addEdge(c, e, {"weight": 15});
  g.addEdge(d, e, {"weight": 11});
  g.layout();
  jsav.displayInit();
}(jQuery));
