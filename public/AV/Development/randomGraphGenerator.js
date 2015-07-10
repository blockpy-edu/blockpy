  var nodes = [];
  var edgeStarts = [];
  var edgeEnds = [];
  var nNodes = 6;
  var nEdges = 10;
  var adjacencyMatrix = [,];
  var randomWeights = [];
  
  function generateNodeEdgeCounts() {
    //generate the number of nodes and edges
    var n;
    var e;
    while (true) {
      n = Math.floor((Math.random() * 10));
      if (n >= 5) {    //Number Of nodes should be at least 5
	nNodes = n;
	break;
      }
    }
    while (true) {
      e = Math.floor((Math.random() * 50));
      // Number of Edges should at least two more than the number of nodes and at most
      // the number of nodes pair combination
      if (e > nNodes + 2 && e < (nNodes * (nNodes - 1)) / 2) {
	nEdges = e;
	break;
      }
    }
  }  

  function generateRandomWeights() {
    var count = 0;
    var weight;
    randomWeights = new Array(nEdges);
    while (true) {
      weight = Math.floor((Math.random() * 10));
      if (weight === 0) {
        continue;
      }
      else {
        randomWeights[count] = weight;
        count++;
      }
      if (count === nEdges){
        break;
      }
    }
  }

  function isEligibleEdge (startIndex, endIndex) {
    if ((startIndex === endIndex) || (startIndex >= nNodes) || (endIndex >= nNodes)) {
      return false;
    }
    if ((adjacencyMatrix[startIndex][endIndex] === 1)
	|| (adjacencyMatrix[endIndex][startIndex] === 1)) {
      return false;
    }
    else {
      return true;
    }
  }

  function generateRandomPairs() {
    var count = 0;
    var index1;
    var index2;
    //Initialize the adjacency matrix
    for (var i = 0; i < nNodes; i++) {
      for (var j = 0; j < nNodes; j++) {
        adjacencyMatrix[i][j] = 0;
      }
    }
    while(true) {
      index1 = Math.floor((Math.random() * 10));
      index2 = Math.floor((Math.random() * 10));
      if(!isEligibleEdge(index1, index2)) {
        continue;
      }
      else {
	edgeStarts[count] = index1;
        edgeEnds[count] = index2;
        count++;
        if(count === nEdges){
          break; 
        }
      }
      adjacencyMatrix[index1][index2] = 1;
      adjacencyMatrix[index2][index1] = 1;
    }
  }

  function generate (g, weighted) {
    //generateNodeEdgeCounts();
    nodes = new Array(nNodes);
    edgeStarts = new Array(nEdges);
    edgeEnds = new Array(nEdges);
    //Generate the nodes
    for (var i = 0; i < nNodes; i++) {
      nodes[i] = String.fromCharCode(i + 65);
    }
    //Create the adjacencyMatrix
    adjacencyMatrix = new Array(nNodes);
    for (var i = 0; i < nNodes; i++) {
      adjacencyMatrix[i] = new Array(nNodes);
    }
    generateRandomPairs();
    if (weighted) {
      generateRandomWeights();
    }
    for (var i = 0; i < nNodes; i++) {
      g.addNode(nodes[i]);
    }
    for (var i = 0; i < nEdges; i++) {
      console.log(edgeStarts[i] + "  " + edgeEnds[i]);
      if (weighted) {
	g.addEdge(g.nodes()[edgeStarts[i]], g.nodes()[edgeEnds[i]],
		  {"weight": parseInt(randomWeights[i])});
      }
      else {
	g.addEdge(g.nodes()[edgeStarts[i]], g.nodes()[edgeEnds[i]]);
      }
    }
  }
