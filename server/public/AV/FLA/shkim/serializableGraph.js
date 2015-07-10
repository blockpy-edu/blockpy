function Node (l, t, i, f) {
  this.left = l;
  this.top = t;
  this.i = i;
  this.f = f;
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
  var gNodes = g.nodes();
  var ind = 0;
  for (var next = gNodes.next(); next; next = gNodes.next()) {
    var left = next.position().left;
    var top = next.position().top;
    var i = next.hasClass("start");
    var f = next.hasClass("final");
    var node = new Node(left, top, i, f);
    nodes[ind] = node;
    ind++;
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