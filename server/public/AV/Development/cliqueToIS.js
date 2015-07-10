/*global ODSA,  setPointerL */
//"use strict";
(function ($) {
 
  var av;
 
 function runit(){

   av = new JSAV($('.avcontainer'));

//slide 1

  var i, j;

  av.umsg("<b>Objective </b><br><br><br> This slideshow presents how to reduce"+
" a Clique problem to an Independent Set problem in polynomial time");
  av.displayInit();
  av.step();
  av.umsg("<b>Clique  and Independent Set problems</b><br><br><br>");


  av.umsg("For a given graph <b>G = ( V , E )</b> and integer <b>k</b>, the "
+"Clique problem is to find whether <b>G</b> contains a clique of size "
+">= <b>k</b>.<br><br>", {'preserve':true});
  av.umsg("For a given graph <b>G' = ( V' , E' )</b> and integer <b>k'</b>, the "
+"Independent Set problem is to find whether <b>G'</b> contains an Independent Set "
+"of size >= <b>k'</b>.<br><br>", {'preserve':true});

 av.step();

//slide 2


  av.umsg("<b>Reduction of Clique to Independent Set</b><br><br><br>");
  av.umsg("To reduce a Clique Problem to an Independet Set problem for a given "
+"graph <b>G = ( V , E )</b>, construct a complimentary graph <b>G' = ( V' , E' "
+")</b> such that <br><br>", {'preserve':true});
  av.umsg("1.  <b>V = V' </b> , i.e. the compliment graph will have the same "
+"vertices as the original graph<br><br>", {'preserve':true});
  av.umsg("2.  <b>E'</b> is the compliment of <b>E</b> i.e. <b>G'</b> has all the "
+"edges that is <b>not</b> present in <b>G</b><br><br>", {'preserve':true});
  av.step();
  av.umsg("Note:  Construction of the complimentary graph can be done in "
+"polynomial time", {'preserve':true});

  av.step();

//slide 3

  av.umsg("<b>Example graph</b>");
// We need a graph G and its complement G'.
// Construct the graph (G + G') which will be a clique.
// Hide the edges for now and show them later selectively.

  var  g = av.ds.graph({width: 600,  height: 400, layout: "automatic",  
directed: false});
  var nodes = new Array(10);;

  for(i=0;i<10;i++){
    nodes[i] = g.addNode(""+(i+1)).css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});
  }

  for(i=0;i<nodes.length;i++)
    for(j=i+1;j<nodes.length;j++)
      g.addEdge(nodes[i], nodes[j]).css({"stroke-width":"1.5px"}).hide();

  var cliqueEdges = [];
  var isEdges = [];
  var edges = g.edges();

//The array cliqueEdges stores the edges of the graph G.

  cliqueEdges.push(g.getEdge(nodes[2], nodes[6]));
  cliqueEdges.push(g.getEdge(nodes[3], nodes[2]));
  cliqueEdges.push(g.getEdge(nodes[6], nodes[3]));
  cliqueEdges.push(g.getEdge(nodes[8], nodes[3]));
  cliqueEdges.push(g.getEdge(nodes[8], nodes[6]));
  cliqueEdges.push(g.getEdge(nodes[9], nodes[6]));
  cliqueEdges.push(g.getEdge(nodes[8], nodes[9]));
  cliqueEdges.push(g.getEdge(nodes[0], nodes[4]));
  cliqueEdges.push(g.getEdge(nodes[0], nodes[1]));
  cliqueEdges.push(g.getEdge(nodes[1], nodes[4]));
  cliqueEdges.push(g.getEdge(nodes[2], nodes[5]));
  cliqueEdges.push(g.getEdge(nodes[2], nodes[7]));
  cliqueEdges.push(g.getEdge(nodes[5], nodes[7]));
  cliqueEdges.push(g.getEdge(nodes[4], nodes[0]));
  cliqueEdges.push(g.getEdge(nodes[2], nodes[9]));
  cliqueEdges.push(g.getEdge(nodes[2], nodes[5]));
  cliqueEdges.push(g.getEdge(nodes[4], nodes[6]));
  cliqueEdges.push(g.getEdge(nodes[3], nodes[7]));
  cliqueEdges.push(g.getEdge(nodes[3], nodes[8]));
  cliqueEdges.push(g.getEdge(nodes[3], nodes[5]));
  cliqueEdges.push(g.getEdge(nodes[6], nodes[5]));
  cliqueEdges.push(g.getEdge(nodes[6], nodes[7]));
  cliqueEdges.push(g.getEdge(nodes[0], nodes[7]));

//display the edges of graph G.  
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].show();
//The array isEdges stores the edges of the complementary graph G'.
  for(i=0;i<edges.length;i++)
    if(cliqueEdges.indexOf(edges[i])<0)
      isEdges.push(edges[i]);
  g.layout();
  g.show();


  av.step();

//slide 4

//fade away G and display G'
  av.umsg("<b>The Complement graph</b>");
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].css({"opacity":0.1});
  for(i=0;i<isEdges.length;i++)
    isEdges[i].show();

  av.step();

//display G'
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].hide();

  av.step();

//slide 6 

  av.umsg("<b>Clique problem reduced to Independent Set</b><br><br><br>");
  g.hide();
  av.umsg("1. <b>If there is an independent set of size k in the complement "
+"graph G'</b>, it implies no two vertices share an edge in G' which further "
+"implies all of those vertices share an edge with all others in G forming a "
+"clique. i.e. <b>there exists a clique of size k in G</b><br><br>", 
{'preserve':true});  

  av.step();

//slide 7

  av.umsg("2. <b>If there is a clique of size k in the graph G</b>, it implies "
+"all vertices share an edge with all others in G which further implies no two of "
+"these vertices share an edge in G' forming an Independent Set. i.e. <b>there "
+"exists an independent set of size k in G'</b>", {'preserve':true});  

  av.step();

//slide 8

  av.umsg("<b>Does G' below have an independent set of size 8? "
+"</b><br><br><br>");

  g.show();

  av.step();

//slide 9

  av.umsg("<b>NO</b><br.<br>", {'preserve':true});
  av.step();

//slide 10

//fade away G' and display G.

  av.umsg("<b>Does G below have a clique of size 8? </b><br><br><br>");
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].css({"opacity":1}).show();
  for(i=0;i<isEdges.length;i++)
    isEdges[i].css({"opacity":0.1}).show();

  av.step();

//slide 11

//display G

  for(i=0;i<isEdges.length;i++)
      isEdges[i].hide();
  av.umsg("<b>NO</b><br.<br>", {'preserve':true});


  av.step();

//slide 12

//display G'
  av.umsg("<b>Does G' below have an independent set of size 5? "
+"</b><br><br><br>");
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].hide();
  for(i=0;i<isEdges.length;i++)
    isEdges[i].css({"opacity":1}).show();

  av.step();

//slide 13

  av.umsg("<b>YES</b><br.<br>", {'preserve':true});

//highlight the nodes of the Independent set in G'

  var sol = new Array(2, 3, 5, 6, 7);
  for(i=0;i<5;i++)
    nodes[sol[i]].css({"background-color":"Teal"});
  av.step();

//slide 14

// superimpose the nodes of Independent Set on G.
  av.umsg("<b>The independent set of G' on G </b>");
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].css({"opacity":0.1}).show();
  av.step();

//slide 15

// superimpose the nodes of Independent Set on G.
  for(i=0;i<isEdges.length;i++)
    isEdges[i].css({"opacity":0.1});
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].css({"opacity":1});

  av.step();

//slide 16 

//highlight the edges of the clique to show its pesence in G.

  for(i=0;i<edges.length;i++)
    edges[i].css({"opacity":0.5});
  for(i=0;i<isEdges.length;i++)
    isEdges[i].hide();
  for(i=0;i<5;i++)
    for(j=i+1;j<5;j++)
      g.getEdge(nodes[(sol[i])], nodes[(sol[j])]).css({"stroke":"SlateBlue", 
"stroke-width":"3.5px", "opacity":1});
  av.umsg("<b>It forms a clique of size 5 in G</b>");



  av.recorded();
}
  function about() {
    var mystring = "Reduction of Clique problem to Independent Set problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }


$('#about').click(about);
$('#runit').click(runit);
$('#reset').click(ODSA.AV.reset);
}(jQuery));

