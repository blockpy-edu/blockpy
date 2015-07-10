//Written by Nabanita Maji and Cliff Shaffer
/*global ODSA,  setPointerL */
"use strict";
$(document).ready(function () {
  var av_name = "HCtoTSPCON";

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

  var i, j,label1,label2;

  av.umsg("<br><b>Reduction of Hamiltonian Cycle to TSP. </b>");
  var nl1=av.label(" This slideshow presents how to reduce"+
" a Hamiltonian Cycle problem to an instance of Traveling Salesman problem in polynomial time",{top:0});
  av.displayInit();
  av.step();
  av.umsg("<br><b>Hamiltonian Cycle  and Traveling Salesman problems</b>");
  nl1.hide();

  nl1=av.label("For a given graph $G = ( V , E )$ , the "
+"Hamiltonian Cycle problem is to find whether $G$ contains a Hamiltonian Cycle "
+"that is, a cycle that passes through all the vertices of the graph exactly once.<br><br>"
+"For a given weighted graph $G' = ( V' , E' )$, with non-negative weights, and integer $k'$, the "
+"Traveling Salesman problem is to find whether $G'$ contains a simple cycle "
+"of length $<= k$ that passes through all the vertices. [ Length of a cycle is "
+"the sum of weights of all the edges in the cycle].", {top:-10});

 av.step();

//slide 2

  nl1.hide();
  av.umsg("<br><b>Reduction of Hamiltonian Cycle Problem  to Traveling Salesman Problem</b><br><br><br>");
  label1=av.label("To reduce the Hamiltonian Cycle Problem to the Traveling Salesman problem for a given "
+"graph $G = ( V , E )$, <br>complete the graph G, by adding edges between all pairs of vertices that were not connected in $G$"
+"<br><br>Let the new graph be $G'=(V',E')$ where $V'=V$ and E'={(u,v)} for any $u,v \\in V'$."
+"<br><br>For edges in $G'$ that were also present in $G$ , we assign a weight $0$.<br>For other edges we assign weight $1$"
+"<br><br>that is , $\\forall e=(u,v) \\in E'$, <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$ W(e) = 0$, if $(u,v) "
+"\\in E$ <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$W(e) = 1$, if $(u,v) \\not\\in E$" 
,{left:0,top:0});
  av.step();
 label2=av.label(".<br><br>Note:  Construction of the complimentary graph can be done in "
+"polynomial time",{left:0,top:240});

  av.step();

//slide 3

  av.umsg("<br><b>Example graph</b>");
// We need a graph G and its complement G'.

  label1.hide(); label2.hide();
  var  g = av.ds.graph({width: 500,  height: 400, layout: "manual",  
directed: false});
  var nodes = new Array(6);;
  
  nodes[0] = g.addNode("A",{left:100,top:50}).css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});
  nodes[1] = g.addNode("B",{left:320,top:20}).css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});
  nodes[2] = g.addNode("C",{left:20,top:170}).css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});
  nodes[3] = g.addNode("D",{left:420,top:230}).css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});
  nodes[4] = g.addNode("E",{left:80,top:350}).css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});
  nodes[5] = g.addNode("F",{left:290,top:370}).css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});


  var HCedges=[];
  var TSPedges=[];
  HCedges.push(g.addEdge(nodes[0],nodes[4]).css({"stroke-width":"1.5px"}));
  HCedges.push(g.addEdge(nodes[1],nodes[4]).css({"stroke-width":"1.5px"}));
  HCedges.push(g.addEdge(nodes[1],nodes[2]).css({"stroke-width":"1.5px"}));
  HCedges.push(g.addEdge(nodes[2],nodes[5]).css({"stroke-width":"1.5px"}));
  HCedges.push(g.addEdge(nodes[3],nodes[5]).css({"stroke-width":"1.5px"}));
  HCedges.push(g.addEdge(nodes[3],nodes[0]).css({"stroke-width":"1.5px"}));

  HCedges.push(g.addEdge(nodes[1],nodes[3]).css({"stroke-width":"1.5px"}));
  HCedges.push(g.addEdge(nodes[4],nodes[5]).css({"stroke-width":"1.5px"}));
  HCedges.push(g.addEdge(nodes[4],nodes[3]).css({"stroke-width":"1.5px"}));

  for(i=0;i<nodes.length;i++)
    for(j=i+1;j<nodes.length;j++)
      if(!g.hasEdge(nodes[i],nodes[j])){
        var e= g.addEdge(nodes[i], nodes[j],{weight:1}).css({"stroke-width":"1.5px","stroke":"Teal"});
        TSPedges.push(e);
	e.hide();
      }
        

  g.layout();
  nl1=av.label("Let this graph $G$ be an input to the Hamiltonian Cycle problem",
{top:-20});

  av.step();
  nl1.hide();
  av.umsg("<br><b>Example graph</b>");
  var nl2=av.label("The constructed graph $G'$ is as below."+
"<br> The blue edges were not present in G and have weight 1."
,{top:-20});


  for(var i in TSPedges){
        TSPedges[i].show();
  }
  for(var i in HCedges){
        HCedges[i].weight(0);
  }
  g.layout();
  
  av.step();
  nl1.hide();
  nl2.hide();
  av.umsg("<br><b>Hamiltonian Cycle problem reduced to an instance of Traveling Salesman Problem</b>");
  g.hide();
  nl1=av.label(" The graph $G$ has a Hamiltonian Cycle if and only if there exists a cycle in $G'$ passing through "+
"all vertices exactly once, and that has a length $<= 0$ (i.e. has a solution for the instance of Traveling Salesman"
+" Problem where $k=0$",{top:-10});
  av.step();
  nl2=av.label("1. <b>If there is a cycle that passes through all vertice exactly once, and has length $<=0$ in"
+" graph $G'$</b>, the cycle contains only edges that were originally present in graph $G$. (The new edges "
+"in $G'$ have weight $1$ and hence can not be part of a cycle of length $<= 0$."
+"<br>Hence <b>there exist a Hamiltonian cycle in G</b><br><br>", 
{top:80});  

  av.step();

//slide 7

  var nl3=av.label("2. <b>If there exists a Hamiltonian Cycle in the graph $G$</b>, it forms a cycle "
+"in $G'$ with length $= 0$, since a weights of all the edges is $0$. <br>Hence <b>"
+"there exists a solution for Traveling Salesman Problem in $G'$ with length $<= 0$</b>"
, {top:200});  

  av.step();

  av.umsg("<br><b>Example:</b>");
  nl1.hide();
  nl2.hide();
  nl3.hide();
  nl1=av.label("$G'$ has a cycle passing through all vertices exactly once with length $<= 0$ "
,{top:-20});


  for(i=0;i<6;i++)
	HCedges[i].css({"stroke":"IndianRed","stroke-width":"8px",opacity:0.75});
  g.show();

  av.step();
  av.umsg("<br><b>Example:</b>");
  nl2=av.label("This cycle is a <b>Hamiltonian cycle</b> in G. ",{top:0});
  
  for(var i in TSPedges){
      TSPedges[i].hide();
  }
  for(var i in HCedges){
      HCedges[i].label("");
  }
  g.layout();


  av.recorded();
});
