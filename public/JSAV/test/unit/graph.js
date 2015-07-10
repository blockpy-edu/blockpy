/*global ok,test,module,deepEqual,equal,expect,equals,notEqual,arrayUtils */
(function() {
  "use strict";
  module("datastructures.graph", {  });
  test("Simple undirected graph test", function() {
    var av = new JSAV("emptycontainer");
    ok( av, "JSAV initialized" );
    ok( av.ds.graph, "Graph exists" );
    var graph = av.ds.graph();
    ok( graph, "Graph initialized" );
    var a = graph.addNode("A"),
        b = graph.addNode("B"),
        c = graph.addNode("C"),
        d = graph.addNode("D"),
        e = graph.addNode("E"),
        f = graph.addNode("F");
    equal(graph.nodeCount(), 6);
    var e1 = graph.addEdge(a, b);
    graph.addEdge(b, a);
    graph.addEdge(a, c);
    graph.addEdge(b, d);
    graph.addEdge(e, a);
    graph.addEdge(d, e);
    graph.addEdge(d, f);
    equal(graph.edgeCount(), 6);
    ok(graph.hasEdge(a, b));
    ok(graph.hasEdge(b, a));
    ok(graph.hasEdge(a, c));
    ok(graph.hasEdge(c, a));
    ok(graph.hasEdge(b, d));
    ok(graph.hasEdge(d, b));
    ok(graph.hasEdge(e, a));
    ok(graph.hasEdge(a, e));
    ok(graph.hasEdge(d, e));
    ok(graph.hasEdge(e, d));
    ok(graph.hasEdge(d, f));
    ok(graph.hasEdge(f, d));
    equal(a.neighbors().length, 3);
    equal(b.neighbors().length, 2);
    equal(c.neighbors().length, 1);
    equal(d.neighbors().length, 3);
    equal(e.neighbors().length, 2);
    equal(f.neighbors().length, 1);
    equal(graph.getEdge(a, b), e1);
    equal(graph.getEdge(b, a).id(), e1.id());
  });

  test("Graph edge removal", function() {
    var av = new JSAV("emptycontainer");
    var graph = av.ds.graph();
    var a = graph.addNode("A"),
        b = graph.addNode("B"),
        c = graph.addNode("C"),
        d = graph.addNode("D");
    var e1 = graph.addEdge(a, b),
        e2 = graph.addEdge(b, c),
        e3 = graph.addEdge(c, d),
        e4 = graph.addEdge(d, a);
    equal(graph.edges().length, 4);
    equal(graph.edgeCount(), 4);
    av.displayInit();
    graph.removeEdge(e1);
    graph.layout();
    equal(graph.edges().length, 3);
    equal(graph.edgeCount(), 3);
    ok(!e1.isVisible());
    av.step();
    graph.removeEdge(graph.getEdge(c, b));
    graph.layout();
    equal(graph.edges().length, 2);
    equal(graph.edgeCount(), 2);
    ok(!e2.isVisible());
    av.step();
    graph.removeEdge(e4);
    graph.layout();
    equal(graph.edges().length, 1);
    equal(graph.edgeCount(), 1);
    ok(!e4.isVisible());
    av.recorded();
    $.fx.off = true;

    equal(graph.edges().length, 4);
    equal(graph.edgeCount(), 4);
    ok(e1.isVisible() && e2.isVisible() && e4.isVisible());
    av.forward();
    equal(graph.edges().length, 3);
    equal(graph.edgeCount(), 3);
    ok(!e1.isVisible() && e2.isVisible() && e4.isVisible());
    av.forward();
    equal(graph.edges().length, 2);
    equal(graph.edgeCount(), 2);
    ok(!e1.isVisible() && !e2.isVisible() && e4.isVisible());
    av.forward();
    equal(graph.edges().length, 1);
    equal(graph.edgeCount(), 1);
    ok(!e1.isVisible() && !e2.isVisible() && !e4.isVisible());
  });

  test("Graph node removal", function() {
    var av = new JSAV("emptycontainer");
    var graph = av.ds.graph();
    var a = graph.addNode("A"),
        b = graph.addNode("B"),
        c = graph.addNode("C"),
        d = graph.addNode("D");
    var e1 = graph.addEdge(a, b),
        e2 = graph.addEdge(b, d),
        e3 = graph.addEdge(d, c),
        e4 = graph.addEdge(c, a),
        e5 = graph.addEdge(c, b),
        e6 = graph.addEdge(d, a);
    equal(graph.nodes().length, 4);
    equal(graph.nodeCount(), 4);
    equal(graph.edges().length, 6);
    equal(graph.edgeCount(), 6);

    av.displayInit();

    graph.removeNode(c);
    av.step();

    equal(graph.nodes().length, 3);
    equal(graph.nodeCount(), 3);
    equal(graph.edges().length, 3);
    equal(graph.edgeCount(), 3);

    graph.removeNode(d);
    av.step();

    equal(graph.nodes().length, 2);
    equal(graph.nodeCount(), 2);
    equal(graph.edges().length, 1);
    equal(graph.edgeCount(), 1);

    graph.removeNode(b);
    av.step();

    equal(graph.nodes().length, 1);
    equal(graph.nodeCount(), 1);
    equal(graph.edges().length, 0);
    equal(graph.edgeCount(), 0);

    av.recorded();

    $.fx.off = true;
    equal(graph.nodes().length, 4);
    equal(graph.nodeCount(), 4);
    equal(graph.edges().length, 6);
    equal(graph.edgeCount(), 6);

    av.forward();

    equal(graph.nodes().length, 3);
    equal(graph.nodeCount(), 3);
    equal(graph.edges().length, 3);
    equal(graph.edgeCount(), 3);

    av.forward();

    equal(graph.nodes().length, 2);
    equal(graph.nodeCount(), 2);
    equal(graph.edges().length, 1);
    equal(graph.edgeCount(), 1);

    av.forward();

    equal(graph.nodes().length, 1);
    equal(graph.nodeCount(), 1);
    equal(graph.edges().length, 0);
    equal(graph.edgeCount(), 0);

  });

  test("Graph equals() test", function() {
    var av = new JSAV("emptycontainer");
    var graph1 = av.ds.graph(),
        graph2 = av.ds.graph();
    var a = graph1.addNode("A"),
        b = graph1.addNode("B"),
        a2 = graph2.addNode("A"),
        b2 = graph2.addNode("B");
    ok(graph1.equals(graph2), "Equal graphs");
    var c = graph1.addNode("C");
    ok(!graph1.equals(graph2), "Graphs with different nodes");
    var c2 = graph2.addNode("C");

    c.highlight();
    ok(graph1.equals(graph2), "Different background colors, not compared");
    ok(!graph1.equals(graph2, {'css': 'background-color'}), "Different background colors");
    c.unhighlight();

    ok(graph1.equals(graph2), "Same background colors, not compared");
    ok(graph1.equals(graph2, {'css': 'background-color'}), "Same background colors");

    c.highlight();
    c2.highlight();
    ok(graph1.equals(graph2), "Same background colors, not compared");
    ok(graph1.equals(graph2, {'css': 'background-color'}), "Same background colors");

    var e = graph1.addEdge(a, b);
    ok(!graph1.equals(graph2), "Different set of edges");

    var e2 = graph2.addEdge(a2, b2);
    ok(graph1.equals(graph2), "Same set of edges");

    e.css({stroke: "red"});
    ok(graph1.equals(graph2), "Different edge colors, not compared");
    ok(!graph1.equals(graph2, {'css': 'stroke'}), "Different edge colors");

    e2.css({stroke: "red"});
    ok(graph1.equals(graph2), "Same edge colors, not compared");
    ok(graph1.equals(graph2, {'css': ['stroke', 'background-color']}), "Same edge colors");

    // class equals tests
    ok(graph1.equals(graph2, {'class': "unknownClass"}, "Unused class"));
    a.addClass("someClass");
    a.addClass("someClass2");
    a2.addClass("someClass");

    ok(graph1.equals(graph2, {'class': "someClass"}, "Class that exists in same nodes"));
    ok(!graph1.equals(graph2, {'class': "someClass2"}, "Class that is not in the other graph"));
    ok(graph1.equals(graph2, {'class': ["someClass", "unknownClass"]}, "Array of class names that match"));
    ok(!graph1.equals(graph2, {'class': ["someClass", "someClass2", "unknownClass"]}, "Array of class names that don't match"));

  });

  test("Graph clone() test", function() {
    var av = new JSAV("emptycontainer");
    var graph = av.ds.graph();
    var a = graph.addNode("A"),
        b = graph.addNode("B"),
        c = graph.addNode("C");

    ok(graph.clone(), "Check that a clone is created");
    ok(graph !== graph.clone(), "Check that a new object is created");

    ok(graph.equals(graph.clone()));

    var e = graph.addEdge(a, b);

    ok(graph.equals(graph.clone()));

    a.highlight();

    ok(graph.equals(graph.clone(), {'css': 'background-color'}), "Cloning a graph with node highlight");

    e.highlight();

    ok(graph.equals(graph.clone(), {'css': ['stroke', 'background-color']}), "Cloning a graph with edge highlight");

    var weightedGraph = av.ds.graph();
    var wa = weightedGraph.addNode("A"),
        wb = weightedGraph.addNode("B"),
        we = weightedGraph.addEdge(wa, wb, {weight: 4});

    ok(weightedGraph.equals(weightedGraph.clone()), "Cloning a graph with edge weights");
  });

  test("Graph state() test", function() {
    var av = new JSAV("emptycontainer");
    var graph1 = av.ds.graph(),
        graph2 = av.ds.graph(),
        graph3 = av.ds.graph();
    var a1 = graph1.addNode("A"),
        b1 = graph1.addNode("B"),
        c1 = graph1.addNode("C");
    var a2 = graph2.addNode("A"),
        b2 = graph2.addNode("B"),
        c2 = graph2.addNode("C"),
        d2 = graph2.addNode("D");
    var e1 = graph1.addEdge(a1, b1);
    var e2 = graph1.addEdge(b1, c1);
    a1.highlight();
    b1.addClass("testing");
    c1.css({"color": "red"});
    e1.css({stroke: "blue"});
    e2.highlight();
    graph1.layout();

    graph2.addEdge(a2, c2);
    graph2.addEdge(b2, c2);
    graph2.addEdge(a2, b2);
    a2.addClass("testing2");

    ok(!graph1.equals(graph2), "Different graphs should not be equal");
    ok(!graph1.equals(graph2, {css: ["color", "background-color"]}), "Different graphs should not be equal");
    ok(!graph1.equals(graph2, {"class": ["testing", "testing2", "jsavhighlight"],
                               css: ["color", "background-color"]}), "Different graphs should not be equal");
    // set state of graph which has fewer nodes and edges than source
    graph2.state(graph1.state());

    ok(graph1.equals(graph2), "After setting state, graphs should be equal");
    ok(graph1.equals(graph2, {css: ["color", "background-color"]}), "After setting state, graphs should be equal");
    ok(graph1.equals(graph2, {"class": ["testing", "testing2", "jsavhighlight"],
      css: ["color", "background-color"]}), "After setting state, graphs should be equal");


    ok(!graph1.equals(graph3), "Different graphs should not be equal");
    ok(!graph1.equals(graph3, {css: ["color", "background-color"]}), "Different graphs should not be equal");
    ok(!graph1.equals(graph3, {"class": ["testing", "testing2", "jsavhighlight"],
      css: ["color", "background-color"]}), "Different graphs should not be equal");
    // set state of an empty graph
    graph3.state(graph1.state());

    ok(graph1.equals(graph3), "After setting state, graphs should be equal");
    ok(graph1.equals(graph3, {css: ["color", "background-color"]}), "After setting state, graphs should be equal");
    ok(graph1.equals(graph3, {"class": ["testing", "testing2", "jsavhighlight"],
      css: ["color", "background-color"]}), "After setting state, graphs should be equal");

  });
})();