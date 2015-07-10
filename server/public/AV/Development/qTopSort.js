"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var g;
  var queue;
  var Courses;
  var Ecount;
  var oparr;
  
  var oparrcnt ;
  var output = new Array();
  var c1, c2, c3, c4, c5, c6, c7, c8;
  var Count=new Array();

function runit() {
  ODSA.AV.reset(true);
  jsav = new JSAV($('.avcontainer'));
  g = jsav.ds.graph({width: 500, height: 500, left: 0, top: 50, layout: "manual", directed: true});
  queue = jsav.ds.array(["<b>Queue</b>","","","","","","","",""],  {left: 350, top: 200});
  var data = ["<b>&nbsp;Nodes&nbsp;</b>", "&nbsp;2505&nbsp;","&nbsp;2114&nbsp;","&nbsp;3604&nbsp;","&nbsp;3304&nbsp;","&nbsp;1114&nbsp;","&nbsp;2506&nbsp;","&nbsp;3114&nbsp;","&nbsp;3214&nbsp;"];
  Courses = new jsav.ds.array(data,{left:350,top:50});
  Ecount = new jsav.ds.array(["<b>&nbsp;Count&nbsp</b>","","","","","","","",""],{left:350,top:98});
  Ecount.css(0,{width:52,"background-color":"#CC6633"});
  Courses.css(0,{width:52,"background-color":"#CC6633"});
  queue.css(0,{width:52,"background-color":"#CC6633"});
  oparr = jsav.ds.array(["<b>Output</b>","","","","","","","",""],  {left: 350, top: 310});
  oparr.css(0,{width:52,"background-color":"#CC6633"});
  oparrcnt=1;
  initGraph();
  var v;
  var node;
  var adjNode = new Array();
  for (v=0;v<g.nodeCount();v++)
        Count[v]=0;
  for (v=0;v<g.nodeCount();v++){
        node=g.nodes()[v];
        adjNode=node.neighbors();
        for(var i=0;i<adjNode.length;i++){
		var j=(g.nodes()).indexOf(adjNode[i]);
		if(j>=0)
                	(Count[j])++;
	}
  }
  for(var i=0;i<g.nodeCount();i++){
           Ecount.value(i+1,Count[i]);
  }
  g.layout();
  jsav.umsg("A queue based topological sort is performed on a directed acyclic graph."); 
  jsav.step();
  jsav.displayInit();  
  topSortBFS(g.nodes()[0]);
  jsav.umsg("Possible ordering of CS coures:  " + displaySort());
  jsav.step();
  jsav.recorded();
}

function displaySort() {
  var str = "";
  var opnode;
  while(output.length > 0) {
    opnode=output.shift();
    str += "CS-" + opnode+ "   ";
  }
  return str;
}

function markIt(node,q) {
  node.addClass("marked");
  jsav.umsg("Enqueue "+ node.value() +" since it has no incoming edges.");
  for(var i=0;i<q.length;i++)
  	queue.value(i+1,q[i].value());
  node.highlight();
  jsav.step();
}

function dequeueIt(node,q) {
  node.addClass("dequeued");
  jsav.umsg("Dequeue " + node.value()+", put it into the Output array and discard its outgoing edges.");
  for(var i=0;i<q.length;i++)
  	queue.value(i+1,q[i].value());
  queue.value(i+1,"");
  var i=g.nodes().indexOf(node);
  oparr.value(oparrcnt,node.value());
  oparr.css(oparrcnt,{"background-color":"#66CC99"});
  oparrcnt++;
  Ecount.addClass(i+1,"marked");
  Courses.unhighlight(i+1);
  Ecount.unhighlight(i+1);
  jsav.step();
}

function updateCount(adjnodes){
        var str="";
	var node;
	while(adjnodes.length > 0){
		node=adjnodes.shift();
		str+=" "+node.value()+" ";
	}
	jsav.umsg("Mark "+str+" and update the number of it's incoming edges.");	
	for(var i=0;i<g.nodeCount();i++){
		var temp=Ecount[i+1];
		Ecount.value(i+1,Count[i]);
		if(Count[i]==0 && temp!=0)
		    if(!Ecount.hasClass(i+1,"marked")){
			Courses.highlight(i+1);
			Ecount.highlight(i+1);
		    }	
	}
	jsav.step();
}

function topSortBFS(start) {
  console.log("start : " + start.value());
  var node;
  var adjNode = new Array();
  var q = new Array();
  var v=0;
  var ctr=0;
  var cntZero = new Array();
  jsav.umsg("The \"Nodes\" array lists the courses and the \"Count\" array shows the number of unresolved dependencies of the node directly above it. Dependencies are denoted by incoming edges.");
  jsav.step();
  for(v=0;v<g.nodeCount();v++)
	if(Count[v]==0){
		node=g.nodes()[v];
		if(!node.hasClass("marked")){
			q.push(node);
			Courses.highlight(v+1);
			Ecount.highlight(v+1);
			markIt(node,q);
		}	
	}	
  while(q.length > 0) {
    node = q.shift();
    dequeueIt(node,q);
    console.log("node " + node.value());
    output.push(node.value());
    adjNode = node.neighbors();
    console.log("adjNode " + adjNode.length);
    ctr=0;
    for(var i=0;i<adjNode.length;i++) {
	var j=(g.nodes()).indexOf(adjNode[i]);
        if(j>=0){
	        (Count[j])--;
		ctr++;
        	if(Count[j]==0) {
                	node=g.nodes()[j];
			cntZero.push(node);
		}
        }
    }
    if(ctr>0)
    	updateCount(adjNode);
    while(cntZero.length > 0){
	node=cntZero.shift();
	q.push(node);
	markIt(node,q);
    }
 }

}
function about() {
  alert("Queue based topological sort visualization");
}
  

// Graph prepartion for initial stage of visualization

function initGraph() {

  c1 = g.addNode("2505", {"left": 60, "top": 150});
  c2 = g.addNode("2114", {"left": 100, "top": 75});
  c3 = g.addNode("3604", {"left": 160, "top": 220});
  c4 = g.addNode("3304", {"left": 225, "top": 220});
  c5 = g.addNode("1114", {"left": 230});
  c6 = g.addNode("2506", {"left": 100, "top": 270});
  c7 = g.addNode("3114", {"left": 200, "top": 150});
  c8 = g.addNode("3214", {"left": 30, "top": 300});

  g.addEdge(c5, c2);
  g.addEdge(c2, c1);
  g.addEdge(c2, c7);
  g.addEdge(c1, c7);
  g.addEdge(c1, c3);
  g.addEdge(c1, c6);
  g.addEdge(c7, c3);
  g.addEdge(c7, c4);
  g.addEdge(c6, c8);

}


// Connect action callbacks to the HTML entities
$('#about').click(about);
$('#runit').click(runit);
$('#help').click(help);
$('#reset').click(ODSA.AV.reset);
}(jQuery));
