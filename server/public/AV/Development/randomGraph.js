"use strict";
/*global alert: true, ODSA */
//Added comment
(function ($) {
  var jsav;
  var g;
  var numberofnodes;
  var numberOfEdges;
function runit() {
  ODSA.AV.reset(true);
  jsav = new JSAV($('.avcontainer'));
  g = jsav.ds.graph({width: 600, height: 400, directed: true});
  randomGraph(8, 6);
}


function randomGraph(numberOfNodes, numberOfEdges) {
  var one, two;
  var nodes =[];
  
  for(var i = 0; i < numberOfNodes; i++) {
    g.addNode(i);
  }
  nodes = g.nodes();
   for(var i = 0; i < numberOfEdges;) {
     one = randomNumber(0, numberOfNodes);
     two = randomNumber(0, numberOfNodes);
    if(one !== two) {
      if(!(g.hasEdge(nodes[one], nodes[two]))) {
        g.addEdge(nodes[one], nodes[two]);
        i++;
        console.log("Edge " + one + " to " + two);
      }
    }
  }
  g.layout();
  jsav.recorded();
}


function randomNumber(lowerBound, upperBound) {
  return JSAV.utils.rand.numKey(lowerBound, upperBound);
}



// Connect action callbacks to the HTML entities
$('#about').click(about);
$('#runit').click(runit);
$('#help').click(help);
$('#reset').click(ODSA.AV.reset);
}(jQuery));
