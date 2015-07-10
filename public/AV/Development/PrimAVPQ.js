"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;
  var graph;
  var mst;   //A graph representing the resulted MST
  var bh;    //Binary heap
  var gnodes = [];
  var mstnodes = [];
  var size;    //Actual size of the displayed heap nodes
 
  function runit() {
    ODSA.AV.reset(true);
    jsav = new JSAV($('.avcontainer'));
    graph = jsav.ds.graph({width: 600, height: 300, layout: "manual", directed: false});
    mst = jsav.ds.graph({width: 600, height: 300, layout: "manual", directed: true});
    initGraph();
    graph.layout();
    size=graph.nodeCount();
    var startArray=[];
	for(var i=0;i<graph.nodeCount();i++)
	{
		 startArray.push(Infinity);		 
	}
    bh = jsav.ds.binheap(startArray,{left: 400, height: 500, stats: false, tree: true, heapify: true});
	
	//Assigning a graphNode for each heapNode
	for(var i=0;i<graph.nodeCount();i++)
	{
		bh._treenodes[i].graphNode = gnodes[i];
		gnodes[i].heapNode = bh._treenodes[i];
		bh._treenodes[i].value(gnodes[i].value()+":"+Infinity);
	}
	jsav.displayInit();	
    prim(gnodes[0]);            // Run Prim's algorithm from start node.
    displayMST();
    jsav.recorded();
  } 
  function heapifyUp(index)
  {
	//Pushing up a value up through the heap
    if(index > 0)
	{
		var j = Math.floor((index-1)/2);
		if(bh.value(index) < bh.value(j))
		{
			swap(index,j);
			heapifyUp(j);
		}
	}  	
  }
  function heapifyDown(index)
  {
	//Pushing a value down through the heap
	var j;
	if(2*index+1 > size-1)
	{
		return;
	}
	else if (2*index+1 < size-1)
	{
		var left=2*index+1;
		var right=2*index+2;
		if(bh.value(left)>=bh.value(right))
		{
			j=right;
		}
		else
		{
			j=left;
		}
	}
	else if(2*index+1==size-1)
	{
		j=2*index+1;
	}
	if(bh.value(index)>bh.value(j))
	{
		swap(index,j);
		heapifyDown(j);
	}
  }
  function swap(index1,index2)
  {
	//This swap function swaps the values (keys) stored inside the heap as well as any references between heapNodes and graphNodes
	
	jsav.umsg("Swap the distance values of GraphNodes ("+bh._treenodes[index1].graphNode.value()
	              +") and ("+bh._treenodes[index2].graphNode.value()+")");
	var treeswap = function(index1, index2) {
        bh.jsav.effects.swap(bh._treenodes[index1].element, bh._treenodes[index2].element, true);
      };
      JSAV.anim(treeswap, treeswap).call(bh, index1, index2);
	
	var temp = bh.value(index1);
	bh.value(index1,bh.value(index2));
	bh.value(index2,temp);	
	
	var graphNode1=bh._treenodes[index1].graphNode;
	var graphNode2=bh._treenodes[index2].graphNode;
	
	temp=bh._treenodes[index1].graphNode;
	bh._treenodes[index1].graphNode=bh._treenodes[index2].graphNode;
	bh._treenodes[index2].graphNode=temp;
	
	graphNode1.heapNode=bh._treenodes[index2];
	graphNode2.heapNode=bh._treenodes[index1];
	
	////To display graphNodes along with their distance values on heapNodes
	for(var i=0;i<gnodes.length;i++)
	{
		bh._treenodes[bh._treenodes.indexOf(gnodes[i].heapNode)].value(gnodes[i].value()+":"+bh.value(bh._treenodes.indexOf(gnodes[i].heapNode)));
	}
	
	jsav.step();
  }
  function displayMST() {
    mst.show();
    graph.hide();
    mst.layout();
    jsav.umsg("Complete minimum spanning tree");
  }

  // Mark a node in the graph.
  function markIt(node) {
    node.addClass("visited");
    jsav.umsg("Add node " + node.value() + " to the MST");
    node.highlight();
    jsav.step();
  }
  
  function deleteMin()
  {
    var minHeapGraphNode = bh._treenodes[0].graphNode;
	if(size > 1)
	{
		swap(0,size-1);
	}
	bh.css(size-1, {"opacity": "0"});
	if(size > 1)
	{
		bh._treenodes[size-1].edgeToParent().css("stroke", "white");
	}
	size--;
	bh.heapsize(bh.heapsize()-1);
	return minHeapGraphNode;    //Return the graph Node with minimum distance
  }

  //Compute Prim's algorithm and return edges
  function prim(s)
  {
	var neighbors = [];
	var weight;
	var next;
	var v;
	var heapNode;
	
	// Initialize the MST "parents" to dummy values
    for (next = gnodes.next(); next; next = gnodes.next()) {
      next.parent = next;
    }
	jsav.umsg("Adding the distance value of node ("+s.value()+") to the heap");
	bh.value(bh._treenodes.indexOf(s.heapNode),0);
	
	//To display graphNodes along with their distance values on heapNodes
	for(var i=0;i<gnodes.length;i++)
	{
		bh._treenodes[bh._treenodes.indexOf(gnodes[i].heapNode)].value(gnodes[i].value()+":"+bh.value(bh._treenodes.indexOf(gnodes[i].heapNode)));
	}
	jsav.step();
	
	for (var i = 0; i < graph.nodeCount(); i++) {
	    jsav.umsg("Extracting the minimum distance Node from the heap");
		jsav.step();
		v = deleteMin();
		if(size > 1)
		{
			heapifyDown(0);
		}
		jsav.umsg("The distance value of Node ("+v.value()+") extracted");
		jsav.step();
		markIt(v);

		if (v !== s) {
			//Add an edge to the MST
			var edge = graph.getEdge(v.parent, v);
			edge.css({"stroke-width": "4", "stroke": "red"});
			var mstedge = mst.addEdge(mstnodes[v.parent.index], mstnodes[v.index], {"weight": edge.weight()});
			mstedge.css({"stroke-width": "2", "stroke": "red"});
			jsav.umsg("Adding edge (" + v.parent.value() + "," + v.value() + ") to the MST");
			jsav.step();
        }
		neighbors = v.neighbors();
		for (var j = 0; j < neighbors.length; j++) {
			if (!neighbors[j].hasClass("visited")) {
				var w = neighbors[j];
				weight = v.edgeTo(w).weight();
				//Add Distances Of neighbours not in the minimum spanning tree to the heap In Case It is minimum than existing
				var msg = "<u>Processing edge (" + v.value() + "," + w.value() + "): </u>";
				if(weight < bh.value(bh._treenodes.indexOf(w.heapNode)))
				{
					msg += " Update the distance value of node (" + w.value() + ")";
					jsav.umsg(msg);
					bh.value(bh._treenodes.indexOf(w.heapNode),weight);
					bh._treenodes[bh._treenodes.indexOf(w.heapNode)].value(w.value()+":"+weight);
					
					//To display graphNodes along with their distance values on heapNodes
					for(var k=0;k<gnodes.length;k++)
					{
						bh._treenodes[bh._treenodes.indexOf(gnodes[k].heapNode)].value(gnodes[k].value()+":"+bh.value(bh._treenodes.indexOf(gnodes[k].heapNode)));
					}
					w.parent = v;
					jsav.step();
					heapifyUp(bh._treenodes.indexOf(w.heapNode));
					
				}
				else
				{
					msg += " Leave the distance value of node (" + w.value() + ") unchanged";
					jsav.umsg(msg);
					jsav.step();
				}
				
			}
	}
   }
  }
  
  
  function about() {
    var mystring = "Prim's Algorithm (The Priority Queue Version) Visualization\nWritten by Mohammed Fawzi and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during Fall, 2013\nLast update: March, 2013\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Initialize the graph.
  function initGraph() {

    //Nodes of the original graph
    var a = graph.addNode("A", {"left": 0, "top": 50});
    var b = graph.addNode("B", {"left": 250, "top": 50});
    var c = graph.addNode("C", {"left": 120, "top": 75});
    var d = graph.addNode("D", {"left": 120, "top": 200});
    var e = graph.addNode("E", {"left": 0, "top": 250});
    var f = graph.addNode("F", {"left": 250, "top": 250});
    //Nodes of the MST
    mst.addNode("A", {"left": 0, "top": 50});
    mst.addNode("B", {"left": 250, "top": 50});
    mst.addNode("C", {"left": 120, "top": 75});
    mst.addNode("D", {"left": 120, "top": 200});
    mst.addNode("E", {"left": 0, "top": 250});
    mst.addNode("F", {"left": 250, "top": 250});
    //Original graph edges
    graph.addEdge(a, c, {"weight": 7});
    graph.addEdge(a, e, {"weight": 9});
    graph.addEdge(c, b, {"weight": 5});
    graph.addEdge(c, d, {"weight": 1});
    graph.addEdge(c, f, {"weight": 2});
    graph.addEdge(f, b, {"weight": 6});
    graph.addEdge(d, f, {"weight": 2});
    graph.addEdge(e, f, {"weight": 1});

    gnodes = graph.nodes();
    mstnodes = mst.nodes();
    
	for (var i = 0; i < mstnodes.length; i++) {
      gnodes[i].index = i;
    }
	mst.hide();
	
  }
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  //$('#help').click(help);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
