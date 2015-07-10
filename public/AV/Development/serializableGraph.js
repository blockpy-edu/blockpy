function Node (l, t) {
  this.left = l;
  this.top = t;
}
function Edge (s, e, w) {
  this.start = s;
  this.end = e;
  this.weight = w;
}
function Graph (ns, es) {
  this.nodes = ns;
  this.edges = es;
}
function serialize(g) {
  var nodes = [];
  var edges = [];
  for (var i = 0; i < g.nodes().length; i++) {
    var left = g.nodes()[i].options.left;
    var top = g.nodes()[i].options.top;
    var node = new Node(left, top);
    nodes[i] = node;
  }
  for (var i = 0; i < g.edges().length; i++) {
    var start = g.nodes().indexOf(g.edges()[i].start());
    var end = g.nodes().indexOf(g.edges()[i].end());
    var weight = g.edges()[i].weight();
    var edge = new Edge(start, end, weight);
    edges[i] = edge;
  }
  var gg = new Graph(nodes, edges);
  jsonGraph = JSON.stringify(gg);
  return jsonGraph
}