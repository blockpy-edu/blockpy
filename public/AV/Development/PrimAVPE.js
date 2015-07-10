/* global ODSA, graphUtils */
(function ($) {
  "use strict";
  var exercise,
      graph,
      config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter,
      settings = config.getSettings(),
      jsav = new JSAV($('.avcontainer'), {settings: settings});

  jsav.recorded();

  function init() {
    // create the graph
    if (graph) {
      graph.clear();
    }
    graph = jsav.ds.graph({
      width: 400,
      height: 400,
      layout: "automatic",
      directed: false
    });
    graphUtils.generate(graph, {weighted: true}); // Randomly generate the graph with weights
    graph.layout();
    // mark the 'A' node
    graph.nodes()[0].addClass("marked");

    jsav.displayInit();
    return graph;
  }

  function fixState(modelGraph) {
    var graphEdges = graph.edges(),
        modelEdges = modelGraph.edges();

    // compare the edges between exercise and model
    for (var i = 0; i < graphEdges.length; i++) {
      var edge = graphEdges[i],
          modelEdge = modelEdges[i];
      if (modelEdge.hasClass("marked") && !edge.hasClass("marked")) {
        // mark the edge that is marked in the model, but not in the exercise
        markEdge(edge);
        break;
      }
    }
  }

  function model(modeljsav) {
    var i,
        graphNodes = graph.nodes(),
        graphEdges = graph.edges();
    // create the model
    var modelGraph = modeljsav.ds.graph({
      width: 400,
      height: 400,
      layout: "automatic",
      directed: false
    });

    // copy nodes from graph
    for (i = 0; i < graphNodes.length; i++) {
      modelGraph.addNode(graphNodes[i].value());
    }

    // copy edges from graph
    var modelNodes = modelGraph.nodes();
    for (i = 0; i < graphEdges.length; i++) {
      var startIndex = graphNodes.indexOf(graphEdges[i].start()),
          endIndex   = graphNodes.indexOf(graphEdges[i].end()),
          startNode  = modelNodes[startIndex],
          endNode    = modelNodes[endIndex],
          weight     = graphEdges[i].weight();
      modelGraph.addEdge(startNode, endNode, {weight: weight});
    }

    var distanceMatrixValues = [];
    for (i = 0; i < graphNodes.length; i++) {
      distanceMatrixValues.push([graphNodes[i].value(), "∞", "-"]);
    }
    distanceMatrixValues[0][1] = 0;

    var distances = modeljsav.ds.matrix(distanceMatrixValues, {
      style: "table",
      center: false
    });
    distances.element.css({
      position: "absolute",
      top: 0,
      left: 10
    });

    // Mark the 'A' node
    modelNodes[0].addClass("marked");
    modelGraph.layout();

    modeljsav.displayInit();

    // start the algorithm
    prim(modelNodes, distances, modeljsav);

    modeljsav.umsg(interpret("av_ms_mst"));
    // hide all edges that are not part of the spanning tree
    var modelEdges = modelGraph.edges();
    for (i = 0; i < modelGraph.edges().length; i++) {
      if (!modelEdges[i].hasClass("marked")) {
        modelEdges[i].hide();
      }
    }
    // call the layout function for the new graph
    modelGraph.layout();
    modeljsav.step();

    return modelGraph;
  }

  function markEdge(edge, av) {
    edge.addClass("marked");
    edge.start().addClass("marked");
    edge.end().addClass("marked");
    if (av) {
      av.gradeableStep();
    } else {
      exercise.gradeableStep();
    }
  }

  function prim(nodes, distances, av) {
    // returns the distance given a node index
    function getDistance(index) {
      var dist = parseInt(distances.value(index, 1), 10);
      if (isNaN(dist)) {
        dist = 99999;
      }
      return dist;
    }
    // returns the node index given the node's value
    function getIndex(value) {
      return value.charCodeAt(0) - "A".charCodeAt(0);
    }

    while (true) {
      var min = 100000,
          node,
          prev,
          neighbors,
          nodeIndex = -1;
      // find node closest to the minimum spanning tree
      for (var i = 0; i < nodes.length; i++) {
        if (!distances.hasClass(i, true, "unused")) {
          var dist = getDistance(i);
          if (dist < min) {
            min = dist;
            nodeIndex = i;
          }
        }
      }
      node = nodes[nodeIndex];
      if (!node) { break; }
      distances.addClass(nodeIndex, true, "unused");
      if (nodeIndex === 0) {
        av.umsg(interpret("av_ms_select_a"));
      } else {
        av.umsg(interpret("av_ms_select_node"), {fill: {node: node.value()}});
      }
      av.step();

      // get previous node if any
      prev = nodes[getIndex(distances.value(nodeIndex, 2))];
      if (prev) {
        av.umsg(interpret("av_ms_add_edge"), {fill: {from: prev.value(), to: node.value()}});
        markEdge(prev.edgeTo(node), av);
      }

      // update distances for neighbors
      neighbors = node.neighbors();
      while (neighbors.hasNext()) {
        var neighbor = neighbors.next(),
            neighborIndex = getIndex(neighbor.value()),
            d = getDistance(neighborIndex),
            weight = node.edgeTo(neighbor).weight();
        if (!distances.hasClass(neighborIndex, true, "unused") && d > weight) {
          distances.value(neighborIndex, 1, weight);
          distances.value(neighborIndex, 2, node.value());
        }
      }
      av.umsg(interpret("av_ms_update_distances"), {fill: {node: node.value()}});
      av.step();

    }
  }


  // Process About button: Pop up a message with an Alert
  function about() {
    window.alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  exercise = jsav.exercise(model, init, {
    compare: { class: "marked" },
    controls: $('.jsavexercisecontrols'),
    fix: fixState
  });
  exercise.reset();

  $(".jsavcontainer").on("click", ".jsavedge", function () {
    var edge = $(this).data("edge");
    if (!edge.hasClass("marked")) {
      markEdge(edge);
    }
  });

  $(".jsavcontainer").on("click", ".jsavnode", function () {
    window.alert("Please, click on the edges, not the nodes.");
  });

  $("#about").click(about);

}(jQuery));
