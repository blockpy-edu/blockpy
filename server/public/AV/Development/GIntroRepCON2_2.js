"use strict";
$(document).ready(function () {
	var av = new JSAV("GIntroRepCON2_2", {"animationMode" : "none"});

	//av.label("The following are the two respresentations for the directed graph below.").show();

	//i think this should be left in the content and then show the different just the imagees in the av 

	//set up graph 
	var gTop = 120; 
	var gLeft = 0;
	var graph = av.ds.graph({top: gTop, left: gLeft, directed: true});

	var nodeOne = graph.addNode("0", {left: 0, top: 0});
    var nodeTwo = graph.addNode("2", {left: 100, top: 0});
    var nodeThree = graph.addNode("4", {left:  50, top:  50});
    var nodeFour = graph.addNode("1", {left: 0,  top: 100});
    var nodeFive =graph.addNode("3", {left: 100, top: 100});

    graph.addEdge(nodeOne, nodeFour);
    graph.addEdge(nodeOne, nodeThree);
    graph.addEdge(nodeTwo, nodeThree);
    graph.addEdge(nodeFive, nodeTwo);
    graph.addEdge(nodeFour, nodeFive);
    graph.addEdge(nodeThree, nodeFour);   
    
    graph.layout();


    //set up adjancey matrix 
    var a = av.label("(a) \n Adajceny Matrix Representation ", {top: 300, left: 195, width: 50}).show();
    var mTop = 115; 
    var mLeft = 250;
    var mat = av.ds.matrix([[, 1, , ,1], [ , , , 1, ,], [ , , , , 1], [ , , , 1, ,], [, , 1, , ,]], 
    	{style: "table", top: mTop, left: mLeft});

    var row = av.label(" 0 1 2 3 4", {top: 90, left: 257}).addClass("addSpace");
    var col = av.label(" 0  1  2  3  4", {top: 130, left: 240}).addClass("vertical-text").addClass("addSpace");
   
    mat.layout();

    //set up list reprseentation 

    var aTop = 100; 
    var aLeft = 500;

    var aList = av.ds.array([, , , , ,], {indexed: true, left: aLeft, top: aTop, layout: "vertical"});
    aList.layout();


    //top 10  left 365 
    //set up linked list 
    var lTop =  100; 
    var lLeft = 575; 
    var list1 = av.ds.list({top: lTop, left: lLeft});

    list1.addFirst("1");
    list1.layout();
    list1.add(1, "4");
    list1.layout();

    //second linked list 
    lTop = 150; 
    var list2 = av.ds.list({top: lTop, left: lLeft});
    list2.addFirst("3");
    list2.layout();
    
    //third linked list
    lTop = 195;
    var list3 = av.ds.list({top: lTop, left: lLeft});
    list3.addFirst("4");
    list3.layout();

    //fourth linked list 
    lTop = 240; 
    var list4 = av.ds.list({top: lTop, left: lLeft});
    list4.addFirst("2");
    list4.layout();

    //fifth linked list 
    lTop = 285; 
    var list5 = av.ds.list({top: lTop, left: lLeft});
    list5.addFirst("1");
  
    list5.layout();

    //add lines connect array to list 

    var line = av.g.line( 530, 135, 575, 135, {'arrow-end': 'classic-wide-long', 'stroke-width': 2}); 
    var line2 = av.g.line( 530, 175, 575, 175, {'arrow-end': 'classic-wide-long', 'stroke-width': 2});
    var line3 = av.g.line( 530, 220, 575, 220, {'arrow-end': 'classic-wide-long', 'stroke-width': 2});
    var line4 = av.g.line( 530, 265, 575, 265, {'arrow-end': 'classic-wide-long', 'stroke-width': 2});
    var line5 = av.g.line( 530, 310, 575, 310, {'arrow-end': 'classic-wide-long', 'stroke-width': 2});

   av.label("(b) \n Adajceny List Representation ", {top: 350, left: 515}).show();
    

	});