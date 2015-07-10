//Written by Nabanita Maji and Cliff Shaffer
/*global ODSA,  setPointerL */
"use strict";
$(document).ready(function () {
  var av_name = "cliqueToISCON";

    $(".avcontainer").on("jsav-message" ,  function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset" , MathJax.Hub]);
    });
    $(".avcontainer").on("jsav-updatecounter" ,  function(){
      // invoke MathJax to do conversion again 
     MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);

//slide 1

  var i, j;

  av.umsg("<br><b>Reduction of Clique Problem to Independent Set Problem </b>");
  var nl1=av.label("This slideshow presents how to reduce"+
" a Clique problem to an Independent Set problem in polynomial time",{top:0});
  av.displayInit();
  av.step();
  av.umsg("<br><b>Clique  and Independent Set problems</b>");
  nl1.hide();
  var nl1=av.label("For a given graph $G = ( V , E )$ and integer $k$, the "
+"Clique problem is to find whether $G$ contains a clique of size "
+"$>= k$.<br><br>For a given graph $G' = ( V' , E' )$ and integer $k'$, the "
+"Independent Set problem is to find whether $G'$ contains an Independent Set "
+"of size $>= k'$.", {top:-10});

 av.step();

//slide 2

  nl1.hide();
  av.umsg("<br><b>Reduction of Clique to Independent Set</b>");
  nl1=av.label("To reduce a Clique Problem to an Independent Set problem for a given "
+"graph $G = ( V , E )$, construct a complimentary graph $G' = ( V' , E' "
+")$ such that <br><br>1. $V = V'$ , that is the compliment graph will have the same "
+"vertices as the original graph<br><br>2.  $E'$ is the compliment of $E$ that is"+
" $G'$ has all the edges that is <b>not</b> present in $G$<br><br>"
+"Note:  Construction of the complimentary graph can be done in "
+"polynomial time", {top:-10});

  av.step();

//slide 3
  nl1.hide();
  av.umsg("<br><b>Example graph</b>");
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
  av.umsg("<br><b>The Complement graph</b>");
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

  av.umsg("<br><b>Clique problem reduced to Independent Set</b><br><br><br>");
  g.hide();
  nl1=av.label("1. <b>If there is an independent set of size k in the complement "
+"graph $G'$</b>, it implies no two vertices<br> share an edge in $G'$ which further "
+"implies all of those vertices share an edge with all others in $G$ forming <br>a "
+"clique. that is <b>there exists a clique of size k in $G$</b><br><br>", 
{top:0});  

  av.step();

//slide 7

  var nl2=av.label("2. <b>If there is a clique of size $k$ in the graph $G$</b>, it implies "
+"all vertices share an edge with all others in <br>$G$ which further implies no two of "
+"these vertices share an edge in $G'$ forming an Independent Set. that is <br><b>there "
+"exists an independent set of size k in $G'$</b>", {top:120});  

  av.step();

//slide 8

  av.umsg("<br><b>Does G' below have an independent set of size 8? "
+"</b><br><br><br>");
  nl1.hide();
  nl2.hide();
  g.show();

  av.step();

//slide 9

  nl1=av.label("<b>NO</b>", {top:-10});
  av.step();

//slide 10

//fade away G' and display G.
  nl1.hide();
  av.umsg("<br><b>Does G below have a clique of size 8? </b><br><br><br>");
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].css({"opacity":1}).show();
  for(i=0;i<isEdges.length;i++)
    isEdges[i].css({"opacity":0.1}).show();

  av.step();

//slide 11

//display G

  for(i=0;i<isEdges.length;i++)
      isEdges[i].hide();
  nl1=av.label("<b>NO</b>", {top:-10});

  av.step();

//slide 12
  nl1.hide();
//display G'
  av.umsg("<br><b>Does G' below have an independent set of size 5? "
+"</b><br><br><br>");
  for(j=0;j<cliqueEdges.length;j++)
    cliqueEdges[j].hide();
  for(i=0;i<isEdges.length;i++)
    isEdges[i].css({"opacity":1}).show();

  av.step();

//slide 13

  nl1=av.label("<b>YES</b>", {top:-10});

//highlight the nodes of the Independent set in G'

  var sol = new Array(2, 3, 5, 6, 7);
  for(i=0;i<5;i++)
    nodes[sol[i]].css({"background-color":"Teal"});
  av.step();
  nl1.hide();
//slide 14

// superimpose the nodes of Independent Set on G.
  av.umsg("<br><b>The independent set of G' on G </b>");
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
  av.umsg("<br><b>It forms a clique of size 5 in G</b>");



  av.recorded();
});

