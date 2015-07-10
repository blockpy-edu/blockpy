"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var g;
  var arr;
  var c0, c1, c2, c3, c4, c5, c6, c7, c8;
  var size;
  var numberofnodes;
  
function runit() {
  ODSA.AV.reset(true);
  jsav = new JSAV($('.avcontainer'));
  numberofnodes = 0;
  g = jsav.ds.graph({width: 500, height: 500, layout: "manual", directed: true});
  arr = jsav.ds.array(["","","","","","","",""],{left: 600, bottom: 100, layout: "vertical"});
  size = 7;
  initGraph();
  g.layout();
  jsav.umsg("A topological sort is performed by doing a depth first search on a " +
    "directed acyclic graph. The nodes are are then popped off the stack resulting in a topological sort ");
  jsav.displayInit();
  markIt(g.nodes()[0]);
  dfs(g.nodes()[0]);
  jsav.step();
  jsav.umsg("Possible ordering of CS coures:  " + displaySort(numberofnodes));
  jsav.step();
  jsav.recorded();
}

// Mark the nodes when visited and highlight it to 
// show it has been marked
function markIt(node) {
  node.addClass("marked");
  jsav.umsg("Mark node " + node.value());
  node.highlight();
  jsav.step();
}




function postVisit(node) {
  jsav.umsg("Add " + node.value() + " to the stack ");
  arr.value(size, node.value());
  numberofnodes++;
  size--;
}

// Recursive depth first search algorithmn for searching
// the graph
function dfs(start, prev) {
  var adjacent;
  var next;
  adjacent = start.neighbors();
  
  for (next = adjacent.next(); next; next = adjacent.next()) {
    jsav.umsg("Process edge between (" + start.value() + " and " + next.value() + ")");
      if(next.hasClass("marked")) {
        jsav.umsg("Node " + next.value() + " already marked");
      }
  
    jsav.step();
    if (!next.hasClass("marked")) {
      jsav.umsg("Call depth first search on " + next.value());
      jsav.step();
      markIt(next);
      dfs(next, start);
      jsav.step();
    }
  }
  postVisit(start);
}


 

function about() {
   alert("Top Sort Visualization");
}
  

// Graph prepartion for initial stage of visualization

function initGraph() {
  c1 = g.addNode("1114", {"left": 230});
  c2 = g.addNode("2114", {"left": 100, "top": 75});
  c5 = g.addNode("2505", {"left": 0, "top": 150});
  c7 = g.addNode("3114", {"left": 200, "top": 150});
  c3 = g.addNode("3604", {"left": 160, "top": 220});
  c6 = g.addNode("2506", {"left": 100, "top": 270});
  c4 = g.addNode("3304", {"left": 225, "top": 220});
  c8 = g.addNode("3214", {"left": -30, "top": 350});
  
  g.addEdge(c1, c2);
  g.addEdge(c2, c5);
  g.addEdge(c5, c7);
  g.addEdge(c5, c6);
  g.addEdge(c7, c3);
  g.addEdge(c7, c4);
  g.addEdge(c6, c8);
}

function displaySort(numberofnodes) {
  
  var str = "";
  
  for (var i = 0; i < numberofnodes - 1; i++) {
    str += "CS " + arr.value(i) + " , ";
  }
  str += "CS" + arr.value(numberofnodes - 1);
    
  return str;
}


// Connect action callbacks to the HTML entities
$('#about').click(about);
$('#runit').click(runit);
$('#help').click(help);
$('#reset').click(ODSA.AV.reset);
}(jQuery));
