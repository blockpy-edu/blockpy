(function ($) {

var nodes = new Array();



var Parser = function() {
xmlhttp=new XMLHttpRequest();
if (xmlhttp) {
  xmlhttp.open("GET","animals.xml",false);
  xmlhttp.setRequestHeader('Content-Type', 'text/xml');
  xmlhttp.send();
}
console.log("ready state " + xmlhttp.readyState);
 if (xmlhttp.readyState == 4) {
xmlDoc=xmlhttp.responseXML;
 //xmlDoc=loadXMLDoc("animals.xml");
//parser = new DOMParser(); // new Parser
//xmlDoc = parser.parseFromString(xmlDoc,"text/xml"); // Parse string
console.log(xmlDoc);
x=xmlDoc.getElementsByTagName('concept');
console.log("x " + x.length);
}

var id = 0;
var label = null;
for (i=0;i<x.length;i++)
{
  id = x[i].getAttribute('id');
  label = x[i].getAttribute('label');
  console.log(x[i].getAttribute('id'));
  console.log(x[i].getAttribute('label'));
  //list.add(id, label);
  nodes.push(new Node(id, label));
} 
};


var Graph = function() {
      this.numOfEdges = 0;
      this._adjacencyLists = {};
      this._nodeList={};
};

var AdjacencyList = function() {
      this.head = null;
      this.tail = null;
    };

AdjacencyList.prototype.add = function(id, label) {
      var node = new Node(id, label);
      if (!this.head && !this.tail) {
        this.head = node;
      } else {
        this.tail.next = node;
      }
      this.tail = node;
    };

AdjacencyList.prototype.print = function() {
  var graph = new Graph();
  node = graph.getNodes();
  currentNode =
        this._adjacencyLists[nodes[i]].head;
    while(currentNode!=this.tail) {
      console.log(currentNode.label);
      currentNode = currentNode.next;
    }

};

AdjacencyList.prototype.remove = function() {
      var detached = null;
      if (this.head === this.tail) {
        return null;
      } else {
        detached = this.head;
        this.head = this.head.next;
        detached.next = null;
        return detached;
      }
    };


var Node = function(id, label) {
      this.id = id;
      this.label = label;
      this.next = null;
    };

var addNode = function(node) {


}

Graph.prototype.addEdge = function(v, w) {
      this._adjacencyLists[v] = this._adjacencyLists[v] ||
        new AdjacencyList();
      this._adjacencyLists[w] = this._adjacencyLists[w] ||
        new AdjacencyList();
      this._adjacencyLists[v].add(w);
      this._adjacencyLists[w].add(v);
      this.numOfEdges++;
    };

Graph.prototype.getNodes = function() {
      return Object.keys(this._adjacencyLists);
    };

Graph.prototype.toString = function() {
      var adjString = '';
      var currentNode = null;
      var nodes = this.getNodes();
      console.log(nodes.length + " nodes, " + 
        this.numOfEdges + " edges");
      for (var i = 0; i < nodes.length; i++) {
        adjString  = nodes[i] + ":";
        currentNode =
        this._adjacencyLists[nodes[i]].head;
          while (currentNode) {
            console.log(currentNode)
            adjString += " " + currentNode.label;
            currentNode = currentNode.next;
          }
          console.log(adjString);
          adjString = '';
        }
    };



//Given the following test code calling on our graph`toString` will produce the following
function runit() {
  //  var graph = new Graph();
 // var list = new AdjacencyList();
   // graph.addEdge(1, 2);
   // graph.addEdge(1, 3);
   // graph.addEdge(1, 4);
   // graph.addEdge(3, 4);
   // graph.toString();

   // console.log(graph.getNodes());
  jsav = new JSAV($('.avcontainer'));
  g = jsav.ds.graph({width: 500, height: 500, layout: "manual", directed: true});

  Parser();
  for (var i = 0; i < nodes.length; i++) {
   var pos = i * 100;
    console.log("id " + nodes[i].id + "  labels" +  nodes[i].label)
    g.addNode(nodes[i].label, {"left": pos});
     g.layout();
   //  jsav.displayInit();
  }
 
  

  //  graph.toString();
};



//{"left": pos}




$('#runit').click(runit);
}(jQuery));
