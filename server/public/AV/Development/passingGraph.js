"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav1;
  var graph;
  var mst;   //A graph representing the resulted MST
  var gnodes = [];
  var mstnodes = [];
  var distances;
  var labels;
  var arr;     //Used to initialize the distance and labels arrays.

  $('#create').click(function () {
    window.open('graphEditor.html', '', 'width=800, height=600');
  });
  jsav1 = new JSAV($('.avcontainer'));
  $('#show').click(function () {
    var g = localStorage['graph'];
	var gg = jQuery.parseJSON(g);
	if (graph) {
	  graph.clear();
	}
    graph = jsav1.ds.graph({width: 776, height: 450, layout: "manual", directed: false});
	for (var i = 0; i < gg.nodes.length; i++) {
	  graph.addNode(String.fromCharCode(i + 65), {"left": gg.nodes[i].left, "top": gg.nodes[i].top});
	}
	for (var i = 0; i < gg.edges.length; i++) {
	  if (gg.edges[i].weight) {
	    graph.addEdge(graph.nodes()[gg.edges[i].start], graph.nodes()[gg.edges[i].end], {"weight": parseInt(gg.edges[i].weight)});
      }
	  else {
	    graph.addEdge(graph.nodes()[gg.edges[i].start], graph.nodes()[gg.edges[i].end]); 
	  }
	}
	graph.layout();
  });
  
  function about() {
    var mystring = "Prim's Algorithm Visualization\nWritten by Mohammed Fawzy and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during Spring, 2013\nLast update: March, 2013\nJSAV library version " + JSAV.version();
    alert(mystring);
  }
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  //$('#help').click(help);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
