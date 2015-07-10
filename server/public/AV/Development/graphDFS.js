"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var g;
  var arr;
  var a, b, c, d, e, f;
  var size;
 

function runit() {
  ODSA.AV.reset(true);
  jsav = new JSAV($('.avcontainer'));
  g = jsav.ds.graph({width: 500, height: 500, layout: "manual", directed: true});
  arr = jsav.ds.array([" "," "," ", " ", " "],{layout: "vertical"});
  arr.css({"left": "300px", "bottom": "500px", "width": "30px"}); 
  size = 4;
  initGraph();
  g.layout();
  jsav.umsg("Let's look at the details of how a depth-first seach works.");
  jsav.displayInit();
  markIt(g.nodes()[0]);
  dfs(g.nodes()[0]);
  jsav.step();
  finalGraph();
  jsav.recorded();
}


function preVisit(node, prev) {
  jsav.umsg("Add " + node.value() + " to the stack ");
  arr.value(size, node.value());
  size--;
  if (prev) {
    node.edgeFrom(prev).css({"stroke-width":"4", "stroke":"red"}); // highlight
    //prev.edgeFrom(node).css("stroke-width", "4" );
  }
  jsav.step();
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
  jsav.umsg("Pop " + node.value() + " off of stack");
  size++;
  arr.value(size, " ");
}

// Recursive depth first search algorithmn for searching
// the graph
function dfs(start, prev) {
  var adjacent;
  var next;
  preVisit(start, prev);
  adjacent = start.neighbors();


  for (next = adjacent.next(); next; next = adjacent.next()) {
    jsav.umsg("Process (" + start.value() + "," + next.value() + ")");
      if(next.hasClass("marked")) {
        jsav.umsg("Node " + next.value() + " already marked");
      }
  
    jsav.step();
    if (!next.hasClass("marked")) {
      jsav.umsg("Print (" + start.value() + "," + next.value() + ") and call depth first search on " + next.value());
      jsav.step();
      markIt(next);
      dfs(next, start);
      jsav.step();
    }
  }
  postVisit(start);
}


 

function about() {
   alert("Depth first search visualization");
}
  

// Graph prepartion for initial stage of visualization

function initGraph() {
  a = g.addNode("A", {"left": 25});
  b = g.addNode("B", {"left": 325});
  c = g.addNode("C", {"left": 145, "top": 75});
  d = g.addNode("D", {"left":145, "top": 200});
  e = g.addNode("E", {"top": 300});
  f = g.addNode("F", {"left":325, "top":250});
  g.addEdge(a, c);
  g.addEdge(c, a);
  g.addEdge(a, e);
  g.addEdge(c, b);
  g.addEdge(b, c);
  g.addEdge(c, e);
  g.addEdge(c, f);
  g.addEdge(b, f);
  g.addEdge(f, b);
  g.addEdge(f, c);
  g.addEdge(f, d);
  g.addEdge(d, c);
  g.addEdge(d, f);
  g.addEdge(f, e);
  g.addEdge(e, a);
  g.addEdge(e, f);
  jsav.umsg("Call depth first search on A");

}

// Resulting graph of completed depth first search
function finalGraph() {
  jsav.umsg("Completed depth first search graph");
  g.removeEdge(a, e);
  g.removeEdge(e, a);
  g.removeEdge(c, d);
  g.removeEdge(d, c);
  g.removeEdge(c, f);
  g.removeEdge(f, c);
  g.removeEdge(c, e);
  g.removeEdge(e, c);
}

// Connect action callbacks to the HTML entities
$('#about').click(about);
$('#runit').click(runit);
$('#help').click(help);
$('#reset').click(ODSA.AV.reset);
}(jQuery));
