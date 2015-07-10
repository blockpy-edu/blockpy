/*global ODSA, setPointerL */
//"use strict";
(function ($) {
//  var av = new JSAV(av_name);
  var av;

 function runit(){

  av = new JSAV($('.avcontainer'));
  
  var label1, label2 , label3, label4, label5, label6,label7,label8,label9;
  //slide2
  var y = 0;
  av.umsg("<br><b>Objective </b><br><br><br> This slideshow presents how to reduce"+
" a 3-SAT problem to a Clique problem in polynomial time");
  av.displayInit();
  av.step();
  av.umsg("<br><b>3-SAT and Clique problem");
  av.umsg("<br><br><br>Given a boolean formula in 3 CNF, <b>3-SAT</b> problem is to find whether the formula is satisfiable",{preserve:true});
  av.umsg("<br><br><br>For a given graph <b>G = ( V , E )</b> and integer <b>k</b>, the "
+"Clique problem is to find whether <b>G</b> contains a clique of size "
+">= <b>k</b>.<br><br>", {'preserve':true});
  av.step();
  av.umsg("<br><b>Reduction of 3-SAT to Clique</b>");

  av.umsg("<br><br><br>A formula &Phi; of <i>k</i> three-clause literals can be reduced to a k-Clique problem in the following way:",{preserve:true}); 
  av.step();
  av.umsg("<br><br><br>Construct a graph G of <i>k</i> clusters with a maximum of <i>3</i> nodes in each cluster.",{preserve:true}); 
  av.umsg("<br><br>Each cluster corresponds to a clause in &Phi;.",{preserve:true}); 
  av.step();
  av.umsg("<br><br>Each node in a cluster is labeled with a literal from the clause.",{preserve:true}); 

  av.step();
  av.umsg("<br><br><br>An edge is put between all pairs of nodes in different clusters except for pairs of the form <i>(x, ^x)</i>",{preserve:true}); 

  av.umsg("<br><br><br>No edge is put between any pair of nodes in the same cluster.",{preserve:true}); 

  av.step();

  av.umsg("<br><b>Example of 3-SAT to k-Clique Reduction</b>");
  av.umsg("<br><br>Construction of cluster of nodes corresponding to clauses in 3 CNF",{preserve:true});
  y=10;
  x=0;
  label1 = av.label("&Phi; = ",{top:y,left:x}); 
  label1.show();
  x = x+35;
  label2 = av.label("(x<sub>2</sub> + x<sub>1</sub> + ^x<sub>3</sub>)",{top:y,left:x}).css({"color":"IndianRed"}); 
  label2.show();
  x = x+100;
  label5 = av.label(".",{top:y,left:x-5}); 
  label5.show();
  label3 = av.label("(^x<sub>1</sub> + ^x<sub>2</sub> + x<sub>4</sub>)",{top:y,left:x}).css({"color":"SeaGreen"}); 
  label3.show();
  x = x+110;
  label6 = av.label(".",{top:y,left:x-5}); 
  label6.show();
  label4 = av.label("(x<sub>2</sub> + ^x<sub>4</sub> + x<sub>3</sub>)",{top:y,left:x}).css({"color":"SteelBlue"}); 
  label4.show();

  var  g1 = av.ds.graph({width: 450, height: 450,layout: "manual", directed: false});
  x=0;
  y=100;
  var x21 = g1.addNode("^x<sub>1</sub>", {"left": x+100, "top": y}).css({"background-color":"SeaGreen"});
  var x22 = g1.addNode("^x<sub>2</sub>", {"left": x+200,"top": y}).css({"background-color":"SeaGreen"});
  var x23 = g1.addNode("x<sub>4</sub>", {"left": x+300, "top": y}).css({"background-color":"SeaGreen"});
   
  var x11 = g1.addNode("x<sub>2</sub>", {"left": x+20, "top": y+90}).css({"background-color":"IndianRed"});
  var x12 = g1.addNode("x<sub>1</sub>", {"left": x+10,"top": y+180}).css({"background-color":"IndianRed"});
  var x13 = g1.addNode("^x<sub>3</sub>", {"left": x, "top": y+270}).css({"background-color":"IndianRed"});
   
  var x31 = g1.addNode("x<sub>2</sub>", {"left": x+400, "top": y+90}).css({"background-color":"SteelBlue"});
  var x32 = g1.addNode("^x<sub>4</sub>", {"left": x+410,"top": y+180}).css({"background-color":"SteelBlue"});
  var x33 = g1.addNode("x<sub>3</sub>", {"left": x+420, "top": y+270}).css({"background-color":"SteelBlue"});
   
  g1.layout();

//slide 15
  av.step();
  av.umsg("<br><b>Example of 3-SAT to k-Clique Reduction</b>");
  av.umsg("<br><br>Connecting the nodes in the graph",{preserve:true});
  e1=g1.addEdge(x11,x31);
  e1.css({"stroke":"orange"});
  e2=g1.addEdge(x11,x32);
  e2.css({"stroke":"orange"});
  var ec3=g1.addEdge(x11,x33);
  ec3.css({"stroke":"orange"});
  e4=g1.addEdge(x11,x21);
  e4.css({"stroke":"orange"});
  var ec1=g1.addEdge(x11,x23);
  ec1.css({"stroke":"orange"});
  g1.layout();


//slide 16
  av.step();

  e1.css({"stroke":"black"});
  e2.css({"stroke":"black"});
  ec3.css({"stroke":"black"});
  e4.css({"stroke":"black"});
  ec1.css({"stroke":"black"});

  e1=g1.addEdge(x12,x31);
  e1.css({"stroke":"orange"});
  e2=g1.addEdge(x12,x32);
  e2.css({"stroke":"orange"});
  e3=g1.addEdge(x12,x33);
  e3.css({"stroke":"orange"});
  e4=g1.addEdge(x12,x22);
  e4.css({"stroke":"orange"});
  e5=g1.addEdge(x12,x23);
  e5.css({"stroke":"orange"});
  g1.layout();

//slide 17
  av.step();

  e1.css({"stroke":"black"});
  e2.css({"stroke":"black"});
  e3.css({"stroke":"black"});
  e4.css({"stroke":"black"});
  e5.css({"stroke":"black"});

  e1=g1.addEdge(x13,x31);
  e1.css({"stroke":"orange"});
  e2=g1.addEdge(x13,x32);
  e2.css({"stroke":"orange"});
  e3=g1.addEdge(x13,x21);
  e3.css({"stroke":"orange"});
  e4=g1.addEdge(x13,x22);
  e4.css({"stroke":"orange"});
  e5=g1.addEdge(x13,x23);
  e5.css({"stroke":"orange"});
  g1.layout();


//slide 18
  av.step();

  e1.css({"stroke":"black"});
  e2.css({"stroke":"black"});
  e3.css({"stroke":"black"});
  e4.css({"stroke":"black"});
  e5.css({"stroke":"black"});

  e1=g1.addEdge(x21,x31);
  e1.css({"stroke":"orange"});
  e2=g1.addEdge(x21,x32);
  e2.css({"stroke":"orange"});
  e3=g1.addEdge(x21,x33);
  e3.css({"stroke":"orange"});
  g1.layout();

//slide 19
  av.step();

  e1.css({"stroke":"black"});
  e2.css({"stroke":"black"});
  e3.css({"stroke":"black"});

  e2=g1.addEdge(x22,x32);
  e2.css({"stroke":"orange"});
  e3=g1.addEdge(x22,x33);
  e3.css({"stroke":"orange"});
  g1.layout();

//slide 20
  av.step();

  e2.css({"stroke":"black"});
  e3.css({"stroke":"black"});

  e2=g1.addEdge(x23,x31);
  e2.css({"stroke":"orange"});
  var ec2=g1.addEdge(x23,x33);
  ec2.css({"stroke":"orange"});
  g1.layout();

//slide 21 
  av.step();

  e2.css({"stroke":"black"});
  ec2.css({"stroke":"black"});
  g1.layout();


//slide 22
  av.step();
  g1.hide();
  label1.hide();
  label2.hide();
  label3.hide();
  label4.hide();
  label5.hide();
  label6.hide();

  av.umsg("<br><b>Insights about the graph</b>");
  av.umsg("<br><br><br>1. If two nodes in the graph are connected, the corresponding literals "
+"can be simultaneously be assigned TRUE. <br>(This is true since there is no edge between nodes"
+" corresponding to literals of type x and ^x.).",{preserve:true});
  av.umsg("<br><br><br>2. If two literals, not from the same clause can be assigned TRUE "
+"simultaneously, the nodes corresponding to these literals in the graph are connected."
,{preserve:true});
  av.step();
  av.umsg("<br><br><br>3. Construction of the graph can be performed in polynomial time",{preserve:true});

  av.step();

  av.umsg("<br><b>3-SAT to k-Clique Reduction</b>");
   
  av.umsg("<br><br><br><b>G has a k-clique if and only if φ is satisfiable.</b>",{preserve:true}); 
  av.step();
  av.umsg("<br><br><br>1. <b>If the graph <i>G</i> has a <i>k</i>-clique,</b> the"
+" clique has exacty one node from each cluster. <br>(This is because no two nodes from"
+" the same cluster are connected to each other, hence they can never be a part of "
+"the same clique.)<br>All nodes in a clique are connected, hence all corresponding "
+"literals can be assigned TRUE simultaneously."
+"<br> Each literal belong to exactly one of the <i>k-clauses</i>. Hence <b> &Phi; is satisfiable</b>",
{preserve:true}); 
  av.step();   
  av.umsg("<br><br><br><b>2. If &Phi; is satisfiable,</b> let A be a satisfying assignment. "
+"Select from each clause a literal that is TRUE in A to construct a set S. <i>||S|| = k</i>."
+"Since no two literals in A are from the same clause and all of them are simulatneously TRUE, all"
+" the corresponding nodes in the graph are connected to each other, forming a k-clique."
+"Hence <b> the graph has a k-clique",{preserve:true}); 

  av.step();
  av.umsg("<br><b>Example of 3-SAT to k-Clique Reduction</b>");
  g1.show();
  av.umsg("<br><br>The following graph hase a 3-clique.",{preserve:true}); 
  ec1.css({"stroke":"#CC0099","stroke-width":"6"});
  ec2.css({"stroke":"#CC0099","stroke-width":"6"});
  ec3.css({"stroke":"#CC0099","stroke-width":"6"});

  av.step();
  av.umsg("<br><b>Example of 3-SAT to k-Clique Reduction</b>");
  av.umsg("<br><br>The corresponding assignment: x2 = TRUE , x3= TRUE , x4 = TRUE",{preserve:true}); 

  av.step();
  g1.hide();
  av.umsg("<br><b>Example of 3-SAT to k-Clique Reduction</b>");
  av.umsg("<br><br><br><br><br><br>&Phi; is TRUE for the corresponding assignment: x2 = TRUE , x3= TRUE , x4 = TRUE",{preserve:true}); 
  label1.show();
  label2.css({"color":"Black"}).show();
  label3.css({"color":"Black"}).show();
  label4.css({"color":"Black"}).show();
  label5.show();
  label6.show();
  av.recorded();
}
  function about() {
    var mystring = "Reduction of 3CNF Satisfiability Problem to Clique Problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }


$('#about').click(about);
$('#runit').click(runit);
$('#reset').click(ODSA.AV.reset);
}(jQuery));



