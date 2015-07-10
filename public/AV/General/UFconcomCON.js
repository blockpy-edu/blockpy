"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
$(document).ready(function () {
  var av = new JSAV("UFconcomCON", {"animationMode": "none"});

  var gr = av.ds.graph({width: 500, height: 300,
                        layout: "manual", directed: false});
  var a = gr.addNode("A", {"left":   0, "top": 100});
  var b = gr.addNode("B", {"left": 100, "top": 100});
  var c = gr.addNode("C", {"left":   0, "top": 200});
  var d = gr.addNode("D", {"left": 200, "top": 100});
  var e = gr.addNode("E", {"left": 200, "top": 200});
  var f = gr.addNode("F", {"left": 300, "top": 100});
  var g = gr.addNode("G", {"left": 300, "top": 200});
  var h = gr.addNode("H", {"left": 100, "top": 200});
  var i = gr.addNode("I", {"left": 300, "top":   0});
  var j = gr.addNode("J", {"left": 400, "top": 100});
  gr.addEdge(a, c);
  gr.addEdge(a, b);
  gr.addEdge(a, h);
  gr.addEdge(c, h);
  gr.addEdge(b, h);
  gr.addEdge(h, e);
  gr.addEdge(d, e);
  gr.addEdge(d, f);
  gr.addEdge(e, g);
  gr.addEdge(e, f);
  gr.addEdge(f, g);
  gr.addEdge(f, i);
  gr.layout();
});
