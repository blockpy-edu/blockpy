/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Summation One To N
$(document).ready(function () {
  var av_name = "SummationOneToNCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av;
  var rectHeight = 25;
  var rectWidth = 50;
  var leftAlign = 250;
  var topAlign = 175;
  var set;
  
    av = new JSAV(av_name);
    set = av.g.set();

    MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
	$(".avcontainer").on("jsav-message", function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    });
	
	//Slide 1
	av.umsg(interpret("Slide 1"));
	av.displayInit();
	
    //Slide 2
	av.umsg(interpret("Slide 2"));
	av.step();
	
	//Slide 3
	av.umsg(interpret("Slide 3.1"));
	av.umsg(interpret("Slide 3.2"), {"preserve": true});
	set.push(av.g.rect(leftAlign, topAlign, rectWidth, rectHeight));
	av.label("$i = 1$",  {"top": topAlign + 12, "left": leftAlign + 10});
	av.step();
	
	//Slide 4
	av.umsg(interpret("Slide 4.1"));
	av.umsg(interpret("Slide 4.2"), {"preserve": true});
	set.push(av.g.rect(leftAlign + rectWidth, topAlign, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + rectWidth, topAlign - rectHeight, rectWidth, rectHeight));
	av.label("$i = 2$",  {"top": topAlign + 12, "left": leftAlign + rectWidth + 10});
	av.step();
	
	//Slide 5
	av.umsg(interpret("Slide 5.1"));
	av.umsg(interpret("Slide 5.2"), {"preserve": true});
	set.push(av.g.rect(leftAlign + 2 * rectWidth, topAlign, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 2 * rectWidth, topAlign - rectHeight, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 2 * rectWidth, topAlign - 2 * rectHeight, rectWidth, rectHeight));
    av.label("$i = 3$",  {"top": topAlign + 12, "left": leftAlign + 2 * rectWidth + 10});
	av.step();


	//Slide 6
	av.umsg(interpret("Slide 6.1"));
	av.umsg(interpret("Slide 6.2"), {"preserve": true});
	set.push(av.g.rect(leftAlign + 3 * rectWidth, topAlign, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 3 * rectWidth, topAlign - rectHeight, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 3 * rectWidth, topAlign - 2 * rectHeight, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 3 * rectWidth, topAlign - 3 * rectHeight, rectWidth, rectHeight));
    av.label("$i = 4$",  {"top": topAlign + 12, "left": leftAlign + 3 * rectWidth + 10});
	av.step();

	//Slide 7
	av.umsg(interpret("Slide 7.1"));
	av.umsg(interpret("Slide 7.2"), {"preserve": true});
	set.push(av.g.rect(leftAlign + 4 * rectWidth, topAlign, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 4 * rectWidth, topAlign - rectHeight, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 4 * rectWidth, topAlign - 2 * rectHeight, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 4 * rectWidth, topAlign - 3 * rectHeight, rectWidth, rectHeight));
	set.push(av.g.rect(leftAlign + 4 * rectWidth, topAlign - 4 * rectHeight, rectWidth, rectHeight));
    av.label("$i = 5$",  {"top": topAlign + 12, "left": leftAlign + 4 * rectWidth + 10});
	av.step();

	//Slide 8
	av.umsg(interpret("Slide 8"));
    av.label("|---------------- $n$ ------------------|",  {"top": topAlign + 25, "left": leftAlign + 20}).css
	({'font-size': '16px', "text-align": "center"});
	av.label("|------- $n$ -------|",  {"top": topAlign - 60, "left": leftAlign + 5 * rectWidth - 35}).css
	({'font-size': '16px', "text-align": "center"}).addClass("rotated");
	av.g.line(leftAlign, topAlign + rectHeight, leftAlign + 5 * rectWidth, topAlign - 4 * rectHeight);
    av.step();

	//Slide 9
	av.umsg(interpret("Slide 9"));
	var bigTriangle = av.g.polyline([[leftAlign, topAlign + rectHeight], [leftAlign + 5 * rectWidth, topAlign - 4 * rectHeight], [leftAlign + 5 * rectWidth, topAlign + rectHeight]]).css({"fill": "blue", "opacity": 0.2});
	av.step();

	//Slide 10
	av.umsg(interpret("Slide 10"), {"preserve": true});
	var smallTriangle1 = av.g.polyline([[leftAlign, topAlign + rectHeight], [leftAlign, topAlign], [leftAlign + rectWidth, topAlign]]).css({"fill": "green", "opacity": 0.2});
	var smallTriangle2 = av.g.polyline([[leftAlign + rectWidth, topAlign], [leftAlign + rectWidth, topAlign - rectHeight], [leftAlign + 2 * rectWidth, topAlign - rectHeight]]).css({"fill": "green", "opacity": 0.2});
	var smallTriangle3 = av.g.polyline([[leftAlign + 2 * rectWidth, topAlign - rectHeight], [leftAlign + 2 * rectWidth, topAlign - 2 * rectHeight], [leftAlign + 3 * rectWidth, topAlign - 2 * rectHeight]]).css({"fill": "green", "opacity": 0.2});
	var smallTriangle4 = av.g.polyline([[leftAlign + 3 * rectWidth, topAlign - 2 * rectHeight], [leftAlign + 3 * rectWidth, topAlign - 3 * rectHeight], [leftAlign + 4 * rectWidth, topAlign - 3 * rectHeight]]).css({"fill": "green", "opacity": 0.2});
	var smallTriangle5 = av.g.polyline([[leftAlign + 4 * rectWidth, topAlign - 3 * rectHeight], [leftAlign + 4 * rectWidth, topAlign - 4 * rectHeight], [leftAlign + 5 * rectWidth, topAlign - 4 * rectHeight]]).css({"fill": "green", "opacity": 0.2});
	av.step();

	//Slide 11
	av.umsg(interpret("Slide 11"));
	av.step();

	//Slide 12
	av.umsg(interpret("Slide 12"));
	av.recorded();
});
