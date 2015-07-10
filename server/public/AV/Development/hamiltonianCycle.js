/*global ODSA,  setPointerL */
//"use strict";
(function ($) {
//  var av = new JSAV(av_name);

  var av;

 function runit(){

  av = new JSAV($('.avcontainer'));
  
  var y = 0;
    av.umsg("<br><b>Objective </b> <br><br><br><br>This slideshow introduces"+
" and explains the \"Hamiltonian Cycle\" Problem."
+"</b> <br><br><br> We start with some definitions  and background.");

    av.displayInit();

    av.step();
  
    av.umsg("<br><b>Hamiltonian Cycle</b>"); 

    av.umsg("<br><br><br>Hamiltonian Cycle is a graph cycle in an undirected or a"
+"directed graph that passes through each vertex exactly once.", {'preserve':true});

    av.step();

    av.umsg("<br><br><br>For example - The edges marked in red in the graph below forms"
+" a Hamiltonian Cycle",{preserve:true});

  var  g = av.ds.graph({width: 400,  height: 450, layout: "manual",  directed: 
false});
  x=50;
  y=100;
  var c1 = g.addNode("1",  {"left": x,  "top": y+80});
  var c2 = g.addNode("2",  {"left": x+75, "top": y});
  var c3 = g.addNode("3",  {"left": x+95,  "top": y+170});
  var c4 = g.addNode("4",  {"left": x+145,  "top": y+70});
  var c5 = g.addNode("5",  {"left": x+300,  "top": y-10});
  var c6 = g.addNode("6",  {"left": x+240,  "top": y+120});
   
  var e14 = g.addEdge(c1,  c4);
  var e23 = g.addEdge(c2,  c3);
  var e21 = g.addEdge(c2,  c1);
  var e24 = g.addEdge(c2,  c4);
  var e13 = g.addEdge(c1,  c3);
  var e34 = g.addEdge(c4,  c3);
  var e46 = g.addEdge(c4,  c6);
  var e45 = g.addEdge(c4,  c5);
  var e25 = g.addEdge(c2,  c5);
  var e36 = g.addEdge(c3,  c6);
  var e56 = g.addEdge(c5,  c6);


  e25.css({"stroke":"Brown", "stroke-width":"3"});
  e21.css({"stroke":"Brown", "stroke-width":"3"});
  e13.css({"stroke":"Brown", "stroke-width":"3"});
  e36.css({"stroke":"Brown", "stroke-width":"3"});
  e46.css({"stroke":"Brown", "stroke-width":"3"});
  e45.css({"stroke":"Brown", "stroke-width":"3"});


  g.layout();
  g.show();
  
  av.step();

//silde 2 

  g.hide();
  av.umsg("<br><b>Hamiltonian Cycle Problem </b>");
  av.umsg("<br><br><br><b>Given a graph <i>G = (V,E)</i>, does the graph "
+"contain a Hamiltonian Cycle? </b><br><br>", 
{'preserve':true});

//silde 3 
  av.step();
  y=0;

  av.umsg("<br><b>Example of Hamiltonian Cycle Problem </b>");  

  av.umsg("<br><br><br>Does the graph below contain a Hamiltonian Cycle ?"+
"<br><br>", {'preserve':true}); 

  var  g1 = av.ds.graph({width: 500,  height: 400, layout: "manual",  directed: 
true,  left: 50, top:50});

  g1.addNode("1", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":300, "top":100});
  g1.addNode("2", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":280, "top":300});
  g1.addNode("3", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":450, "top":100});
  g1.addNode("4", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":200, "top":230});
  g1.addNode("5", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":0, "top":50});
  g1.addNode("6", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":70, "top":250});
  g1.addNode("7", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":100, "top":70});
  g1.addNode("8", {"width":"40px", "height":"40px", "min-widh":"40px", 
"min-height":"40px", "background-color":"LightSyBlue", "left":250, "top":0});

 
  var nodes=g1.nodes();

  var cycleEdges = new Array(8);
  for(i=0;i<8;i++)
      cycleEdges[i]=g1.addEdge(nodes[i], nodes[(i+1)%8]).css({"stroke-width":"1.5px"});

  g1.addEdge(nodes[3], nodes[6]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[5], nodes[1]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[0], nodes[6]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[3], nodes[0]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[7], nodes[4]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[0], nodes[2]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[3], nodes[5]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[2], nodes[7]).css({"stroke-width":"1.5px"});;
  g1.addEdge(nodes[1], nodes[3]).css({"stroke-width":"1.5px"});;
  g1.layout();
  g1.show();
//slide 4 
  av.step();

  label1=av.label("<b>Yes</b>",{left:10,top:50});
  for(i=0;i<8;i++)
      cycleEdges[i].css({"stroke":"SteelBlue", 
"stroke-width":"2.5px"});;
  g1.layout();
  g1.show();
  av.step();
  y=0;
  label1.hide();
  g1.removeEdge(g1.getEdge(nodes[1], nodes[3]));
  g1.removeEdge(g1.getEdge(nodes[2], nodes[3]));
  g1.removeEdge(g1.getEdge(nodes[6], nodes[7]));
  nodes[6].css({"left":180, "top":150});
  nodes[4].css({"left":100, "top":100});
  nodes[0].css({"left":250});
  nodes[2].css({"left":470, "top":280});
 
  g1.addEdge(nodes[3], nodes[1]);
  g1.addEdge(nodes[0], nodes[4]);

  var edges = g1.edges();

  for(i=0;i<edges.length;i++)
  edges[i].css({"stroke":"Black", "stroke-width":"1.5px"});

  g1.layout();
  av.umsg("<b><br>Example of Hamiltonian Cycle Problem</b>");  
  av.umsg("<br><br><br>Does the graph below contain a Hamiltonian Cycle ?"+
"<br><br>", {'preserve':true}); 

  av.step();
  label1=av.label("<b>No</b>",{left:10,top:50});
  av.recorded();
}
  function about() {
    var mystring = "Introduction of Hamiltonian Cycle Problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));


