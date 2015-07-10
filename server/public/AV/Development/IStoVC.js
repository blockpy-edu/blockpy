/*global ODSA,  setPointerL */
//"use strict";
(function ($) {

var av;

function runit(){
    $(".avcontainer").on("jsav-message" ,  function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });
    $(".avcontainer").on("jsav-updatecounter" ,  function(){
      // invoke MathJax to do conversion again 
     MathJax.Hub.Queue(["Typeset" , MathJax.Hub]); });
 
 av = new JSAV($('.avcontainer'));

//slide 1

  var i, j;

av.umsg("<br><b>Objective </b> <br><br><br><br>This slideshow explains"+
" and the reduction of  \"Independent Set\" to \"Vertex Cover\" Problem. <br><br><br>");
  av.displayInit();
  av.step();

  av.umsg("<br><b>Independent Set and Vertex Cover problems</b><br><br><br>");

  av.umsg("For a given graph <b>G = ( V , E )</b> and integer <b>k</b>, the "
+"Independent Set problem is to find whether <b>G</b> contains an Independent Set "
+"of size >= <b>k</b>.<br><br>", {'preserve':true});
  av.umsg("For a given graph <b>G = ( V , E )</b> and integer <b>k</b>, the "
+"Vertex Cover problem is to find whether <b>G</b> contains a vertex cover of "
+"size <= <b>k</b>.<br><br>", {'preserve':true});

 av.step();

//slide 2


  av.umsg("<br><b>Reduction of Independent Set to Vertex Cover</b><br><br><br>");
  label1 = av.label("In a graph $G = \\{ V , E \\}$, <br><br> $S$ is an "+
  "<b>Independent Set $\\Leftrightarrow (V - S)$ is a Vertex Cover.</b><br><br>"
   , {left:0,top:10});
  
  av.step();

  label2 = av.label("1. <b>If $S$ is an Independent Set ,</b>there is no "+
  "edge $e = (u,v)$ in $G$, such that both $u,v \\in S$.<br><br>"+
  "Hence for any edge $e = (u,v)$, atleast one of $u, v$ must lie in $(V-S)$."+
  "<br><br><b>$\\Rightarrow (V-S)$ is a vertex cover in G</b>."
   , {left:0,top:100});
 
  av.step();

  label3 = av.label("<br>2. <b>If $(V-S)$ is a Vertex Cover,</b> between any "+
  "pair of vertices $(u,v) \\in S$ if there exist an edge $e$,<br>"+
  "none of the endpoints of $e$ would exist in $(V - S)$ violating the "+
  "definition of vertex cover. <br><br>Hence no pair of vertices in $S$ can be connected"+
  "by an edge. <br><br><b>$\\Rightarrow S$ is an Independent Set in G</b>."
   , {left:0,top:200});
 
  av.step(); 
  label4 = av.label("<b><br><br><br>Hence G contains an Independent Set of size $k$"+
  "&nbsp;&nbsp;&nbsp;$\\Leftrightarrow $ &nbsp;&nbsp;&nbsp;G contains a "+
  "Vertex Cover of size $\\left\\vert{V}\\right\\vert - k$.</b><br><br>"
   , {left:0,top:320});
  
  av.step();

  label1.hide();
  label2.hide();
  label3.hide();
  label4.hide();

  
//slide 3

  av.umsg("<b>Example graph</b>");

  var  g = av.ds.graph({width: 600,  height: 400, layout: "manual",  
directed: false});
  var nodes = new Array(12);;
  var colors = ["SeaGreen","IndianRed","SlateBlue","Orchid","GoldenRod"];
  x=500;
  y=350;
  nodes[2]=g.addNode("3",{left:x,top:y/2});
  nodes[0]=g.addNode("1",{left:x-50,top:y-70});
  nodes[5]=g.addNode("6",{left:x-40,top:80});
  nodes[1]=g.addNode("2",{left:x-140,top:20});
  nodes[7]=g.addNode("8",{left:x-160,top:y});
  nodes[3]=g.addNode("4",{left:x-200,top:y-80});
  nodes[8]=g.addNode("9",{left:x-230,top:80});
  nodes[4]=g.addNode("5",{left:x-340,top:20});
  nodes[11]=g.addNode("12",{left:x-370,top:y});
  nodes[10]=g.addNode("11",{left:x-440,top:80});
  nodes[6]=g.addNode("7",{left:x-480,top:y-80});
  nodes[9]=g.addNode("10",{left:x-500,top:y/2-10});
  for(i=0;i<12;i++){
    nodes[i].css({"width":"35px", "height":"35px", 
"min-width":"35px", "min-height":"35px", "background-color":"AntiqueWhite"});
  }
  var ISnodes = [];
  var VCnodes = [];
  ISnodes.push(nodes[7]);
  ISnodes.push(nodes[2]);
  ISnodes.push(nodes[4]);
  ISnodes.push(nodes[9]);
  ISnodes.push(nodes[10]);
  ISnodes.push(nodes[3]);
  ISnodes.push(nodes[5]);
  VCnodes.push(nodes[0]);
  VCnodes.push(nodes[1]);
  VCnodes.push(nodes[6]);
  VCnodes.push(nodes[8]);
  VCnodes.push(nodes[11]);
  for(var i=0;i<nodes.length;i++)
     for(var j=i+1;j<nodes.length;j++)
         g.addEdge(nodes[i],nodes[j]).css({"stroke-width":"1.5px"}).hide();

  g.layout();
  g.getEdge(nodes[7],nodes[1]).show();
  g.getEdge(nodes[5],nodes[1]).show();
  g.getEdge(nodes[7],nodes[6]).show();
  g.getEdge(nodes[7],nodes[0]).show();
  g.getEdge(nodes[9],nodes[6]).show();
  g.getEdge(nodes[9],nodes[8]).show();
  g.getEdge(nodes[9],nodes[11]).show();
  g.getEdge(nodes[8],nodes[4]).show();
  g.getEdge(nodes[8],nodes[2]).show();
  g.getEdge(nodes[8],nodes[3]).show();
  g.getEdge(nodes[6],nodes[2]).show();
  g.getEdge(nodes[0],nodes[2]).show();
  g.getEdge(nodes[1],nodes[3]).show();
  g.getEdge(nodes[0],nodes[3]).show();
  g.getEdge(nodes[0],nodes[4]).show();
  g.getEdge(nodes[0],nodes[5]).show();
  g.getEdge(nodes[6],nodes[5]).show();
  g.getEdge(nodes[6],nodes[4]).show();
  g.getEdge(nodes[11],nodes[4]).show();
  g.getEdge(nodes[10],nodes[0]).show();
  g.getEdge(nodes[10],nodes[6]).show();
  g.getEdge(nodes[10],nodes[11]).show();
  g.getEdge(nodes[5],nodes[11]).show();
  g.getEdge(nodes[1],nodes[11]).show();

   av.step();

   av.umsg("<br><b>Does this graph have an Independent Set of size >= 9 ?");
   av.step();
   av.umsg("<br><br><br>No",{preserve:true});
   av.step();
   av.umsg("<br><b>Does this graph have an Vertex Cover of size <= 3 ?");
   av.step();
   av.umsg("<br><br><br>No",{preserve:true});
   av.step();
   av.umsg("<br><b>Does this graph have an Independent Set of size >= 7 ?");
   av.step();
   av.umsg("<br><br><br>Yes",{preserve:true});
   for (var i in ISnodes){
	ISnodes[i].css({"background-color":"Silver"});
   }
   av.step();
   av.umsg("<br><b>Does this graph have an Vertex Cover of size <= 5 ?");
   av.step();
   av.umsg("<br><br><br>Yes",{preserve:true});
   for (var i in VCnodes){
       VCnodes[i].css({"background-color":colors[i]});
       for(var j=0;j<VCnodes[i].neighbors().length;j++)
           g.getEdge(VCnodes[i],VCnodes[i].neighbors()[j]).css({"stroke":colors[i]});
   }
 
   av.recorded();
 }
  function about() {
    var mystring = "Reduction of Independent Set Problem to Vertex Cover problem\nWritten by Nabanita Maji and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during March, 2015\nJSAV library version " + JSAV.version();
    alert(mystring);
  }


$('#about').click(about);
$('#runit').click(runit);
$('#help').click(help);
$('#reset').click(ODSA.AV.reset);
}(jQuery));

