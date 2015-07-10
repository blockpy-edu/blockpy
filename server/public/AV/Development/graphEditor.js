(function ($) { 
// Global variable
	var click = true;
	var cll = isChecked();
	var cll = true;	
	var message = new JSAV($('.avcontainer'));
	var jsav = new JSAV($('.jsavcanvas')); 
	var g = jsav.ds.graph({layout: "manual", directed: cll, height:"450px", width:"776px"});
	var g2 = jsav.ds.graph(); 
	var size; 
	var i = g.nodeCount(); 
	var graphNodes = new Array();
	var preClick = new Array();
	var nodeOne = null;
	var nodeTwo = null;
	var insideBox = true;
	var addNodes = false;
	var addEdges = false;
	var addWeights = false;
	var move = false;
	var removeNode = false;
	var nodeOneHigh = null;
	var nodeTwoHigh = null;
	var nextClick = true;
	var edges;
	var nodeNumber;
	var moveNode = null;
	var switchState = true;
	var stateCount = 0;
	var stateCountTwo = 0;
	var insideCanvas = false;
	var canvasOffset = $("div.jsavcanvas").offset();
	
// Struct type container to hold id and x,y position of nodes   
function node(id, x, y) {   
	this.id = id;
	this.x = x;
	this.y = y;
}

//Struct type container to hold the x,y positions of a previous click
function storeClick(x,y) {
	this.x = x;
	this.y = y;
}
function showControls() {
	$('#graphControls').show();
}





/////////////////////////////////////////////////////////////////////////

function done() {
	console.log("DONE");
	$('#graphControls').toggle();
	g.hide();
	console.log("done " + g.nodes()[0].value());
	message.clearumsg();
	
	//Code for passing the created graph object to an AV
	jsonGraph = serialize(g);
	localStorage['graph'] = jsonGraph;
	window.close();
}


function reshow() {    
	// g2.show();
	jsav2.displayInit();     
}

//Get a node in the graph based on the x and y coordinates(where the user clicks)
//Returns the node or null
function getGraphNode(x, y) {
	var realX;
	var realY;
	var node;
	for (var i = 0; i < g.nodes().length; i++) {
		node = g.nodes()[i];
		realX = node.options.left;
		realY = node.options.top;

		if(realX + 25 >= x && realX - 25 <= x && realY + 25 >= y && realY - 25 <= y) {		
			node.highlight(); 
			return node;
		}
	}	
	return null;		
}

//Checks if the user is attempting to add node on top of another node
//
function isOverlapping(x, y) {
	var realX;
	var realY;
	var node;
	for (var i = 0; i < g.nodes().length; i++) {
		node = g.nodes()[i];
		realX = node.options.left;
		realY = node.options.top;

		if(((realX + 50) >= x) && ((realX - 50) <= x) && ((realY + 50) >= y) && ((realY - 50) <= y)) {		
			return node;
		}
	}	
	return null;		
}




function isChecked(){
	// if($('#chkbox').prop('checked'))  {
	// 	console.log("checked");
	// }
	// return $('#chkbox').prop('checked');
	if($('#chkbox').checked){
	console.warn("The graph is directed");
	}
	return $('#chkbox').checked;
}


//Sets variables to enable adding nodes
function addNodeMode() {
	addNodes = true;
	removeNode = false;
	addEdges = false;
	addWeights = false;
	move = false;    
	message.umsg("You are currently in add node mode");
}

//Sets variables to enable removing nodes
function removeNodeMode() {
	removeNode = true;
	addEdges = false;
	addWeights = false;
	move = false;    
	message.umsg("You are currently in remove node mode");
}

//Sets variables to enable adding edges and alerts if user attempts to change from
//adding edges to adding weighted edges
function addEdgeMode() {

	if(stateCount <= 0) {
		addEdges = true;
		removeNode = false;
		addNodes = false;
		addWeights = false;
		move = false;
		stateCountTwo++;
		stateCount--;
		message.umsg("You are currently in add edge mode");
	} else {
		alert("Can not change from add edges to add weighted edges");
	}
}

//Sets variables to enable adding weighted edges and alerts if user attempts to change from
//adding weighted edges to adding non weighted edges
function addWeightedEdgeMode() {

	if(stateCountTwo<=0) {    
		addWeights = true;
		removeNode = false;
		addEdges = false;
		addNodes = false;
		move = false;
		stateCount++;
		stateCountTwo--;
		message.umsg("You are currently in add weighted edge mode.  Click on two nodes to add the weighted edge.");
	}else {
		alert("Can not change from add weight edges to add edges");
	}
}


//Sets variables enable moving nodes
function moveNodeMode() {
	move = true;
	addEdges = false;
	removeNode = false;
	addNodes = false;
	addWeights = false;  
	if(g.nodeCount() > 0) {  
		message.umsg("You are currently in move node mode.  Click on a node and then click on new position.");
	} else {
		message.umsg("You must add a node to the screen before attempting to move it");
	}
}



//Check if click is inside the canvas
function inside(x, y){
	if(x > 0 && x < 730 && y > 0 && y < 400 ){
		insideCanvas = true;	
	} else {
		insideCanvas = false;
	}
}


// START MAKING CHANGES HERE... ATTEMPT TO CAPTURE CLICK AND DRAW A NODE.  

jQuery(document).ready(function(){$('.jsavgraph').click(function(e)
{

var x = e.pageX - canvasOffset.left - 22;       //x click coordinate 150
var y = e.pageY - canvasOffset.top - 22; 		// y click coordinate   190
inside(x, y);
console.log('x ' + x);
 console.log('y ' + y);


if(removeNode) {	
	moveNode = getGraphNode(x, y);
	g.removeNode(moveNode);
	g.layout();
	jsav.step();
	click = !click;
	return;
} else {
		message.umsg("You must select a node before attempting to remove it");
}


/* Add the node to the canvas and store the id (i) and coordinates (x and y) in an array. */
if(addNodes && insideCanvas) {
	var overlapNode = isOverlapping(x, y);
	if(overlapNode === null){
		message.umsg("Adding node " + i + " to graph");
		g.addNode(i, {"left": x, "top": y}); 
		i++;
		click = !click;
	} else {
		message.umsg("You can not add a node on top of another node");
		click = !click;
	}
}
/*Move does not work correctly now -- disconnected handler */
if(move) { 
 	if(click) {
 		moveNode = getGraphNode(x, y);
 		if(moveNode === null) {
 			message.umsg("You must select a node before attempting to move it");
 			return;
 		} else {
 			click = !click;
 			return;
 		}

 	} else {
 			moveNode.css({left: x, top: y});
 			moveNode.options.left = x;
 			moveNode.options.top = y;
 		//	jsav.displayInit();
 		//	jsav.container.trigger("jsav-updaterelative");
 		//Removed this step 1st
 		//	jsav.step();
 	  	g.layout();
  		click = !click;
  		jsav.step();
  		return;   	
 	}
 }

/* Add Edges */
if(addEdges && g.nodeCount() > 1) {
	if(click){        
		nodeOne = getGraphNode(x,y);
		click = !click;
	}
// First node has been selected, now retrieve second selected node.
	else if(!click) {
		nodeTwo = getGraphNode(x, y);
			if(nodeOne === null || nodeTwo === null) {
				alert("Must click on a node -- Try again");
				click = !click;
				return;
			}
//Also need to check if there is already an edge connecting two nodes

		if (nodeOne.value() === nodeTwo.value()) {
			jsav.umsg("Can not connect a node to itself");
			click = !click;
			return;
		} else if (g.hasEdge(nodeOne,nodeTwo)) {
			alert("Graph already has a edge between " + nodeOne.value() +
				" and " + nodeTwo.value());
			click = !click;
			return;
		} else {
			g.addEdge(nodeOne,nodeTwo);
			message.umsg("Connected node " + nodeOne.value() + " to node " + nodeTwo.value());	
	//		jsav.displayInit();	
			g.layout();
			click = !click;		
			return;			
		}
	}				
}		

if(addWeights && g.nodeCount() > 1) {
	if(click){
		nodeOne = getGraphNode(x, y);
		click = !click;
	} else if(!click) {		
		nodeTwo = getGraphNode(x, y);
		if(nodeOne === null || nodeTwo === null) {
			alert("Must click on a node -- Try again");
			click = !click;						
		}
//Also need to check if there is already an edge connecting two nodes					
		if (nodeOne === nodeTwo) {
			message.umsg("Can not connect a node to itself");
			click = !click;
		} else if (g.hasEdge(nodeOne,nodeTwo)) {
			alert("Graph already has a edge between " + nodeOne.value() +
				" and " + nodeTwo.value());
			click = !click;
		} else {
			var weight = window.prompt("Input weight of edge","");
			console.log("weight " + weight);
			g.addEdge(nodeOne,nodeTwo,{"weight": weight});							
			message.umsg("Connected node " + nodeOne.value() + " to node " + nodeTwo.value() + " with an edge weight of "  + weight);
			g.layout();

		//	jsav.container.trigger("jsav-updaterelative");
		//	jsav.displayInit();
			click = !click;	
			jsav.step();				
		}
	}

}

})}); 

// Connect action callbacks to the HTML entities

$('#addNodeMode').click(addNodeMode);
$('#removeNodeMode').click(removeNodeMode);
$('#addEdgeMode').click(addEdgeMode);
$('#addWeightedEdgeMode').click(addWeightedEdgeMode);
$('#moveNodeMode').click(moveNodeMode);
$('#createGraph').click(showControls);
$('#reshowGraph').click(reshow);
$('#done').click(done);
$('#reset').click(ODSA.AV.reset);
}(jQuery));
