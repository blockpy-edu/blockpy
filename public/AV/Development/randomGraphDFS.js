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
  g = jsav.ds.graph({width: 500, height: 300, top: 50, directed: true});
  arr = jsav.ds.array([" "],{layout: "vertical", left: 700, top: 0, width: 35});  
  
  var graph = ODSA.AV.randomGraphGen(g, 8, 8);
  var numberOfNodes = graph.nodes().length;
  size = numberOfNodes - 1;
  arr.value(size," ");
  graph.layout();
  jsav.umsg("Let's see what a very long line will look like so that we can tell if this looks good. I guess that was not really good enough, this is a very big AV.");
  jsav.displayInit();
  markIt(graph.nodes()[0]);
  dfs(graph.nodes()[0]);
  jsav.step();
  //finalGraph();
  jsav.recorded();
}


function preVisit(node, prev) {
  jsav.umsg("Add " + node.value() + " to the stack ");
  arr.value(size, node.value());
  size--;
  if (prev) {
    node.edgeFrom(prev).css({"stroke-width":"4", "stroke":"red"}); // highlight
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
