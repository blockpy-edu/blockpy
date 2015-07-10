/*global alert: true, ODSA, graphUtils */
(function ($) {
  "use strict";
  var jsav = new JSAV($('.avcontainer'));
  var graph;
  
  function handler() {
    var nNodes = parseInt($('#nodeCount').find(":selected").text(), 10);
    var nEdges = parseInt($('#edgeCount').find(":selected").text(), 10);
    if (graph) {
      graph.clear();
    }
    graph = jsav.ds.graph({
      width: 600,
      height: 400,
      layout: "automatic",
      directed: false
    });
    graphUtils.generate(graph, {
      nodes: nNodes,
      edges: nEdges,
      weighted: true
    });
    graph.layout();
  }

  function about() {
    var mystring = "Graph Generator Tool\nWritten by Mohammed Fawzi and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during Spring, 2013\nLast update: March, 2013\nJSAV library version " + JSAV.version();
    alert(mystring);
  }
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#generate').click(handler);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
