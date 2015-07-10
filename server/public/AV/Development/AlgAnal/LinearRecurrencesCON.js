/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Linear Recurrences
$(document).ready(function () {
  var av_name = "LinearRecurrencesCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av;
  var tree;
  var leftAlign = 250;
  var topAlign = 0;
  var nodeGap = 25;
  var nodeHeight = 33;
  var nodeWidth = 45;
  var labelShift = 10;
  var labelSet;
  
    av = new JSAV(av_name);
	labelSet = new Array();
    MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
	$(".avcontainer").on("jsav-message", function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    });

	//Slide 1	
	av.umsg(interpret("Slide 1"));
	av.displayInit();

	//Slide 2
	av.umsg(interpret("Slide 2.1"));
	av.umsg(interpret("Slide 2.2"), {"preserve": true});
	labelSet.push(av.label("<b><u>Amount of Work<b><u>", {"top": topAlign - 10 , "left": leftAlign + 200}));
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 0.5 * nodeHeight, "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("1", {"top": topAlign + 0.5 * nodeHeight , "left": leftAlign + nodeWidth + labelShift * 20}));
	tree = av.ds.tree({left: leftAlign, top: topAlign, nodegap: nodeGap});
	var root = tree.newNode("$n$");
    tree.root(root);
	var nMinusOne = tree.newNode("$n-1$");
	root.addChild(nMinusOne);
	tree.layout();
	av.step();

	//Slide 3
	av.umsg(interpret("Slide 3.1"));
	av.umsg(interpret("Slide 3.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 2 * nodeHeight + nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("1", {"top": topAlign + 2 * nodeHeight + nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var nMinusTwo = tree.newNode("$n-2$");
	nMinusOne.addChild(nMinusTwo);
	tree.layout();
	av.step();

	//Slide 4
	av.umsg(interpret("Slide 4.1"));
	av.umsg(interpret("Slide 4.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 3.5 * nodeHeight + 2 * nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("1", {"top": topAlign + 3.5 * nodeHeight + 2 * nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var nMinusThree = tree.newNode("$n-3$");
	nMinusTwo.addChild(nMinusThree);
	tree.layout();
	av.step();

	//Slide 5
	av.umsg(interpret("Slide 5.1"));
	av.umsg(interpret("Slide 5.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 5 * nodeHeight + 3 * nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("1", {"top": topAlign + 5 * nodeHeight + 3 * nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var nMinusFour = tree.newNode("$n-4$");
	nMinusThree.addChild(nMinusFour);
	tree.layout();
	av.step();

	//Slide 6
	av.umsg(interpret("Slide 6.1"));
	av.umsg(interpret("Slide 6.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 8.5 * nodeHeight + 4 * nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("1", {"top": topAlign + 8.5 * nodeHeight + 4 * nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var one = tree.newNode("$1$");
	nMinusFour.addChild(one);
	var edge = one.edgeToParent();
	edge.addClass("dashed");
	tree.layout();
	av.step();	

	//Slide 7
	av.umsg(interpret("Slide 7"));
	av.step();

	//Slide 8
	av.umsg(interpret("Slide 8"));
	av.step();
	
	//Slide 9
	av.umsg(interpret("Slide 9"));
	$.each(labelSet, function(index, value){
	  value.hide();
	});
	tree.hide();
	av.step();
	
	//Slide 10
	labelSet = new Array();
	av.umsg(interpret("Slide 10.1"));
	av.umsg(interpret("Slide 10.2"), {"preserve": true});
	labelSet.push(av.label("<b><u>Amount of Work<b><u>", {"top": topAlign - 10 , "left": leftAlign + 200}));
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 0.5 * nodeHeight, "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("$n$", {"top": topAlign + 0.5 * nodeHeight , "left": leftAlign + nodeWidth + labelShift * 20}));
	tree = av.ds.tree({left: leftAlign, top: topAlign, nodegap: nodeGap});
	var root = tree.newNode("$n$");
    tree.root(root);
	var nMinusOne = tree.newNode("$n-1$");
	root.addChild(nMinusOne);
	tree.layout();
	av.step();

	//Slide 11
	av.umsg(interpret("Slide 11.1"));
	av.umsg(interpret("Slide 11.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 2 * nodeHeight + nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("$n-1$", {"top": topAlign + 2 * nodeHeight + nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var nMinusTwo = tree.newNode("$n-2$");
	nMinusOne.addChild(nMinusTwo);
	tree.layout();
	av.step();

	//Slide 12
	av.umsg(interpret("Slide 12.1"));
	av.umsg(interpret("Slide 12.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 3.5 * nodeHeight + 2 * nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("$n-2$", {"top": topAlign + 3.5 * nodeHeight + 2 * nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var nMinusThree = tree.newNode("$n-3$");
	nMinusTwo.addChild(nMinusThree);
	tree.layout();
	av.step();

	//Slide 13
	av.umsg(interpret("Slide 13.1"));
	av.umsg(interpret("Slide 13.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 5 * nodeHeight + 3 * nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("$n-3$", {"top": topAlign + 5 * nodeHeight + 3 * nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var nMinusFour = tree.newNode("$n-4$");
	nMinusThree.addChild(nMinusFour);
	tree.layout();
	av.step();

	//Slide 14
	av.umsg(interpret("Slide 14.1"));
	av.umsg(interpret("Slide 14.2"), {"preserve": true});
	labelSet.push(av.label("----------------------------------", {"top": topAlign + 8.5 * nodeHeight + 4 * nodeGap , "left": leftAlign + nodeWidth + labelShift}));
	labelSet.push(av.label("$1$", {"top": topAlign + 8.5 * nodeHeight + 4 * nodeGap , "left": leftAlign + nodeWidth + labelShift * 20}));
	var one = tree.newNode("$1$");
	nMinusFour.addChild(one);
	var edge = one.edgeToParent();
	edge.addClass("dashed");
	tree.layout();
	av.step();	

	//Slide 15
	av.umsg(interpret("Slide 15"));
	av.step();

	//Slide 16
	av.umsg(interpret("Slide 16"));
	av.step();
	
	av.recorded();

});
