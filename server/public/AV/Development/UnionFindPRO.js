"use strict";
/*global alert: true, ODSA */
(function ($) {
  $(document).ready(function () {
    var initData,
      settings = new JSAV.utils.Settings($(".jsavsettings")),
      jsav = new JSAV($('.avcontainer'), {settings: settings}),
      exercise, tree, modelTree, 
      arr, labels, parents;
    var i, treeNodes = [], modelTreeNodes = [], parentIndex;
    var nodes1 = [], nodes2 = [];
    var pairCount;  //Number of pairs
    var step;      //The current instruction step

    jsav.recorded();
	
    function init() {
      parentIndex = -1;
      pairCount = 6;
      step = 0;
      if (tree) {
	tree.clear();
      }
      if (labels){
	labels.clear();
      }
      if (parents){
	parents.clear();
      }

      arr = new Array(10);
      //Initializing the labels
      for (i = 0; i < arr.length; i++) {
        arr[i] = String.fromCharCode(i + 65);
      }
      labels = jsav.ds.array(arr, {left: 250, top: 200, indexed: true});
      //Initializing the parent pointer
      for (i = 0; i < arr.length; i++) {
        arr[i] = "/";
      }
      parents = jsav.ds.array(arr, {left: 250, top: 153});
      initTree();
      generateRandomPairs();
      jsav.displayInit();
      //Print instructions
      jsav.umsg("Instructions<br>");
      // jsav.umsg("-----------------<br>", {'preserve': true});
      // for (var j = 0; j <pairCount; j++){
      // jsav.umsg((j+1)+"- Union Nodes ("+treeNodes[nodes1[j]].value()+") and ("+treeNodes[nodes2[j]].value()+")<br>", {'preserve': true});
	  // }	  
      jsav.umsg((step + 1)+"- Union Nodes ("+treeNodes[nodes1[step]].value()+") and ("+treeNodes[nodes2[step]].value()+")<br>");
      return tree;        
    }

    function generateRandomPairs(){
      var count = 0;
      nodes1 = new Array(pairCount);
      nodes2 = new Array(pairCount);
      var index1;
      var index2;
      while(true){
	index1 = Math.floor((Math.random() * 10));
	index2 = Math.floor((Math.random() * 10));
	//Cannot pair a node to itself
	if((index1 === index2)){
	  continue;
	}
	else{
	  nodes1[count] = index1;
	  nodes2[count] = index2;
	  count++;
	  if(count === pairCount){
	    break;
	  }
	}
      }
    }

    function find(treeNode, treeType) {
      if (treeType === 'model'){
        if (treeNode.parent() === modelTree.root()) {
          return treeNode;
        } else {
          var currentNode = treeNode;
          while (currentNode.parent() !== modelTree.root()) {
            currentNode = currentNode.parent();
          }
          return currentNode;
        }
      } else{
	if (treeNode.parent() === tree.root()) {
          return treeNode;
        } else {
          var currentNode = treeNode;
          while (currentNode.parent() !== tree.root()) {
            currentNode = currentNode.parent();
          }
          return currentNode;
        }
      }
    }

    function union(node1, node2, treeType) {
      if (treeType === 'model'){
	var parent1 = find(node1, 'model');
	var parent2 = find(node2, 'model');
      } else{
	var parent1 = find(node1, 'exercise');
	var parent2 = find(node2, 'exercise');
      }
	  
      if (parent1 === parent2){
	//Already unioned
	return true;
      } else if (parent1.size === parent2.size){
	  console.log(parent1.value() +' is Equal to '+ parent2.value());
	//Alphabetical order
	if (parent1.value().charCodeAt(0) <= parent2.value().charCodeAt(0)){
	  parent1.addChild(parent2);
          parent1.size++;
	  if (treeType === 'exercise'){
	    parents.value(treeNodes.indexOf(parent2), treeNodes.indexOf(parent1));
	  }
	} else {
	  parent2.addChild(parent1);
          parent2.size++;
	  if (treeType === 'exercise'){
	    parents.value(treeNodes.indexOf(parent1), treeNodes.indexOf(parent2));
	  }
	}
      } else if (parent1.size >= parent2.size) {
	    console.log(parent1.value()+" is greater than "+parent2.value());
        parent1.addChild(parent2);
        parent1.size++;
        if (treeType === 'exercise'){
	  parents.value(treeNodes.indexOf(parent2), treeNodes.indexOf(parent1));
	}
      }
      else {
	    console.log(parent2.value()+" is greater than "+parent1.value());
        parent2.addChild(parent1);
        parent2.size++;
        if (treeType === 'exercise'){
	  parents.value(treeNodes.indexOf(parent1), treeNodes.indexOf(parent2));
	}
      }
      return false;
    }
	
    function fixState(mTree) {
      var alreadyUnioned;
      alreadyUnioned = union(treeNodes[nodes1[step-1]], treeNodes[nodes2[step-1]], 'exercise');
      tree.noAction = false;
      if (alreadyUnioned){
	tree.noAction = true;
      }
      if (step < pairCount){
	jsav.umsg((step + 1)+"- Union Nodes ("+treeNodes[nodes1[step]].value()+") and ("+treeNodes[nodes2[step]].value()+")<br>");
      }
      else {
	jsav.umsg("Finished...");
      }
      tree.layout();
    }

    function model(modeljsav) {
      var alreadyUnioned;
      modelTree = modeljsav.ds.tree({nodegap: 20});
      var newNode;
      var root = modelTree.newNode("X");
      modelTree.root(root);
      root.id("root");
      for (var j = 0; j < arr.length; j++) {
        newNode = modelTree.newNode(labels.value(j));
        newNode.size = 1;   //To maintain the size of each connected component
        root.addChild(newNode);
      }
      modelTreeNodes = new Array(arr.length);
      for (i = 0; i < modelTreeNodes.length; i++) {
        modelTreeNodes[i] = modelTree.root().child(i);    //At first
      }
      modeljsav.displayInit();
      modelTree.layout();
	  
      for(var k = 0; k < pairCount; k++){
	modeljsav.umsg("Union Nodes ("+modelTreeNodes[nodes1[k]].value()+") And ("+modelTreeNodes[nodes2[k]].value()+")");	  
	alreadyUnioned = union(modelTreeNodes[nodes1[k]], modelTreeNodes[nodes2[k]], 'model');
	modelTree.noAction = false;
	if (alreadyUnioned){
	  modeljsav.umsg(":No action Nodes already unioned", {'preserve': true}); 
	  modelTree.noAction = true;
	}
	modeljsav.stepOption("grade",true);
	modelTree.layout();
	modeljsav.step();  
      }	       
      return modelTree;   
    }
	  
    function initTree() {
      var newNode;
      tree = jsav.ds.tree({left: 90, top: 300, nodegap: 20});
      var root = tree.newNode("X");
      tree.root(root);
      root.id("root");
      for (i = 0; i < arr.length; i++) {
        newNode = tree.newNode(labels.value(i));
        newNode.size = 1;  //To maintain the size of each connected component
        root.addChild(newNode);
      }
      treeNodes = new Array(arr.length);
      for (i = 0; i < treeNodes.length; i++) {
        treeNodes[i] = tree.root().child(i);    //At first
      }
      tree.layout();	  
    }

    // Process About button: Pop up a message with an Alert
    function about() {
      alert("Heapsort Proficiency Exercise\nWritten by Ville Karavirta\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/cashaffer/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }

    exercise = jsav.exercise(model, init,
			     { compare:  {css: "background-color"},
                               controls: $('.jsavexercisecontrols'),
                               fix: fixState });
    exercise.reset();
	
    function getNodeByValue(value){
      for (var j = 0; j <treeNodes.length; j++){
	if (treeNodes[j].value() === value)
	  return treeNodes[j];
      }
    }

    function clickHandler(index) {
      var node = treeNodes[index];
      if (parentIndex === -1) {
	node.addClass('selected');
	labels.addClass(index, 'selected');
	parentIndex = index;
      } else {
	treeNodes[parentIndex].addChild(node);
	treeNodes[parentIndex].size++;
	treeNodes[parentIndex].removeClass('selected');
	parents.value(index, parentIndex);
	labels.removeClass(parentIndex, 'selected');
	parentIndex=-1;
	tree.noAction = false;
	tree.layout();
	step++;
	if (step < pairCount) {
	  jsav.umsg((step + 1)+  "- Union Nodes (" + treeNodes[nodes1[step]].value() +
		    ") and (" + treeNodes[nodes2[step]].value() + ")<br>");
	} else {
	  jsav.umsg("Finished...");
	}
	exercise.gradeableStep();
	console.log(step);
      }
    }
    $(".jsavcontainer").on("click", ".jsavtreenode", function () {
      var value = $(this).data('value');
      var node = getNodeByValue(value);
      var index = treeNodes.indexOf(node);
      if (index === parentIndex){
	treeNodes[parentIndex].removeClass('selected');
	labels.removeClass(parentIndex, 'selected');
	parentIndex=-1;
      } else {
	clickHandler(index);
      }
    });  
	 
    $(".jsavcontainer").on("click", ".jsavarray .jsavindex", function () {
      var index = $(this).parent(".jsavarray").find(".jsavindex").index(this);
      if (index === parentIndex){
	treeNodes[parentIndex].removeClass('selected');
	labels.removeClass(parentIndex, 'selected');
	parentIndex=-1;
      } else {
	clickHandler(index);
      }
    });

    $('#noaction').click(function(){
      tree.noAction = true;
      step++;
      if (step < pairCount){
	jsav.umsg((step + 1)+"- Union Nodes ("+treeNodes[nodes1[step]].value()+") and ("+treeNodes[nodes2[step]].value()+")<br>");
      } else {
	jsav.umsg("Finished...");
      }
      exercise.gradeableStep();
      console.log(step);
    });

    $("#about").click(about);
  });
}(jQuery));
