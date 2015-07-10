/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Divide and Conquer Recurrences
$(document).ready(function () {
  var av_name = "DivideAndConquerRecurrencesCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av;
  var tree;
  var leftAlign = 10;
  var topAlign = 20;
  var nodeGap = 25;
  var nodeHeight = 33;
  var nodeWidth = 45;
  var labelShift = 50;
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
	var workLabel = av.label("<b><u>Amount of Work</u></b>", {"top": topAlign - 15 , "left": leftAlign + 250, "After": root});
	labelSet.push(workLabel);
	var dashLabel_n = av.label("----------------------------------", {"top": topAlign + 0.25 * nodeHeight, "left": leftAlign + nodeWidth + labelShift}); 
	labelSet.push(dashLabel_n);
	var valueLabel_1 = av.label("$5n^2$", {"top": topAlign + 0.25 * nodeHeight , "left": leftAlign + nodeWidth + labelShift * 5});
	labelSet.push(valueLabel_1);
	tree = av.ds.binarytree({left: leftAlign, top: topAlign, nodegap: nodeGap});
	var root = tree.newNode("$n$");
    tree.root(root);
	var nOverTwo1 = tree.newNode("$n/2$");
	var nOverTwo2 = tree.newNode("$n/2$");
	root.addChild(nOverTwo1);
	root.addChild(nOverTwo2);
	tree.layout();
	av.step();

	//Slide 3
	av.umsg(interpret("Slide 3.1"));
	av.umsg(interpret("Slide 3.2"), {"preserve": true});
	displaceLabels(2 * nodeWidth);
	var dashLabel_n2 = av.label("----------------------", {"top": topAlign + 1.25 * nodeHeight + nodeGap , "left": leftAlign + nodeWidth + labelShift * 4}); 
	labelSet.push(dashLabel_n2);
	var valueLabel_2 = av.label("$\\frac{5n^2}{2}$", {"top": topAlign + 1.25 * nodeHeight + nodeGap , "left": leftAlign + 3 * nodeWidth + labelShift * 5}); 
	labelSet.push(valueLabel_2);
	var nOverFour1 = tree.newNode("$n/4$");
	var nOverFour2 = tree.newNode("$n/4$");
	var nOverFour3 = tree.newNode("$n/4$");
	var nOverFour4 = tree.newNode("$n/4$");
	nOverTwo1.addChild(nOverFour1);
	nOverTwo1.addChild(nOverFour2);
	nOverTwo2.addChild(nOverFour3);
	nOverTwo2.addChild(nOverFour4);
	tree.layout();
	av.step();
	
	//Slide 4
	av.umsg(interpret("Slide 4.1"));
	av.umsg(interpret("Slide 4.2"), {"preserve": true});
	displaceLabels(5 * nodeWidth);
	labelSet.push(av.label("----------", {"top": topAlign + 2.25 * nodeHeight + 2 * nodeGap , "left": leftAlign + 7.5 * nodeWidth + labelShift * 4}));
	labelSet.push(av.label("$\\frac{5n^2}{4}$", {"top": topAlign + 2.25 * nodeHeight + 2 * nodeGap , "left": leftAlign + 8 * nodeWidth + labelShift * 5}));
	var nOverEight1 = tree.newNode("$n/8$");
	var nOverEight2 = tree.newNode("$n/8$");
	var nOverEight3 = tree.newNode("$n/8$");
	var nOverEight4 = tree.newNode("$n/8$");
	var nOverEight5 = tree.newNode("$n/8$");
	var nOverEight6 = tree.newNode("$n/8$");
	var nOverEight7 = tree.newNode("$n/8$");
	var nOverEight8 = tree.newNode("$n/8$");
	nOverFour1.addChild(nOverEight1);
	nOverFour1.addChild(nOverEight2);
	nOverFour2.addChild(nOverEight3);
	nOverFour2.addChild(nOverEight4);
	nOverFour3.addChild(nOverEight5);
	nOverFour3.addChild(nOverEight6);
	nOverFour4.addChild(nOverEight7);
	nOverFour4.addChild(nOverEight8);
	tree.layout();
	av.step();

	//Slide 5
	av.umsg(interpret("Slide 5.1"));
	av.umsg(interpret("Slide 5.2"), {"preserve": true});
	//displaceLabels(2 * nodeWidth);
	
	labelSet.push(av.label("------", {"top": topAlign + 4.25 * nodeHeight + 4 * nodeGap , "left": leftAlign + 8 * nodeWidth + labelShift * 4}));
	labelSet.push(av.label("$7n$", {"top": topAlign + 4.25 * nodeHeight + 4 * nodeGap , "left": leftAlign + 8 * nodeWidth + labelShift * 5}));
	labelSet.push(av.label("---------------------------------------------------------------------------", {"top": topAlign + 4.25 * nodeHeight + 4 * nodeGap , "left": leftAlign + nodeWidth}));
	var one1 = tree.newNode("$1$");
	var one2 = tree.newNode("$1$");
	nOverEight1.left(one1);
	nOverEight8.right(one2);
	var edge1 = one1.edgeToParent();
	var edge2 = one2.edgeToParent();
	edge1.addClass("dashed");
	edge2.addClass("dashed");
	tree.layout();
	av.step();	

	//Slide 6
	av.umsg(interpret("Slide 6"));
	labelSet.push(av.label("|------------ $\\log{n + 1}$ ------------|", {"top": topAlign + 3 *nodeHeight + nodeGap, "left": leftAlign + 8.5 * nodeWidth + labelShift * 4 - 20}).addClass("rotated"));
	av.step();

	//Slide 7
	av.umsg(interpret("Slide 7"));
	av.step();
	
	//Slide 8	
	av.umsg(interpret("Slide 8"));
	av.step();
	
	av.recorded();
  function hideLabels(){
    $.each(labelSet, function(index, value){
	  value.hide();
    });
  }
  function displaceLabels(offset){
    $.each(labelSet, function(index, value){
	  var current = value.css("left");
	  var currentPos = current.match(/\d+/);
	  value.css({"left": parseInt(currentPos) + offset});
	});
  }
});
