"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav1;
  var jsav2;
  var graph1;
  var graph2;
  jsav1 = new JSAV($('.avcontainer1'));
  jsav2 = new JSAV($('.avcontainer2'));
  graph1 = jsav1.ds.graph({width: 400, height: 200, layout: "manual", directed: false});
  initGraph1();
  graph1.layout();
  function runit() {
    
	
  }
  function initGraph1() {
    //Nodes of the original graph1
    var a = graph1.addNode("A", {"left": 25, "top": 50});
    var b = graph1.addNode("B", {"left": 325, "top": 50});
    var c = graph1.addNode("C", {"left": 145, "top": 75});
    //Original graph1 edges
    graph1.addEdge(a, c);
    graph1.addEdge(c, b);
  }
  function handler() {
	graph2 = clone(graph1);
	graph2.layout();
  }
  function clone(g1) {
    var g2 = jsav2.ds.graph({width: 400, height: 200, layout: "manual", directed: false});
	for (var i = 0; i < g1.nodeCount(); i++) {
	  g2.addNode(g1.nodes()[i].value(), {"left": g1.nodes()[i].options.left
	  , "top": g1.nodes()[i].options.top});
	}
	for (var i = 0; i < graph1.edges().length; i++) {
	  g2.addEdge(g2.nodes()[g1.nodes().indexOf(g1.edges()[i].start())],
	  g2.nodes()[g1.nodes().indexOf(g1.edges()[i].end())]);
	}
	return g2;
  }
  $('#clone').click(handler);
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  //$('#help').click(help);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
