/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Summation Two Power I
$(document).ready(function () {
  var av_name = "SummationTwoPowerICON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av;
  var rectHeight = 30;
  var rectWidth = 50;
  var leftAlign = 1;
  var topAlign = 50;
  var labelShift = 5;
  var set2; //To hold rectangles of i = 2
  var set1; //To hold rectangles of i = 1
  
    av = new JSAV(av_name);
    set2 = av.g.set();
    set1 = av.g.set();

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
	var rect0 = av.g.rect(leftAlign, topAlign, rectWidth, rectHeight);
	var label0 = av.label("$i = 0$",  {"top": topAlign - 0.5*rectHeight, "left": leftAlign + rectWidth + labelShift});
	av.step();

	//Slide 4
	av.umsg(interpret("Slide 4.1"));
	av.umsg(interpret("Slide 4.2"), {"preserve": true});
	set1.push(av.g.rect(leftAlign, topAlign + rectHeight, rectWidth, rectHeight));
	set1.push(av.g.rect(leftAlign + rectWidth, topAlign + rectHeight, rectWidth, rectHeight));
	var label1 = av.label("$i = 1$",  {"top": topAlign -0.5*rectHeight + rectHeight, "left": leftAlign + 2 * rectWidth + labelShift});
	av.step();

	//Slide 5
	av.umsg(interpret("Slide 5.1"));
	av.umsg(interpret("Slide 5.2"), {"preserve": true});
	set2.push(av.g.rect(leftAlign, topAlign + 2 * rectHeight, rectWidth, rectHeight));
	set2.push(av.g.rect(leftAlign + rectWidth, topAlign + 2 * rectHeight, rectWidth, rectHeight));
	set2.push(av.g.rect(leftAlign + 2 * rectWidth, topAlign + 2 * rectHeight, rectWidth, rectHeight));
	set2.push(av.g.rect(leftAlign + 3 * rectWidth, topAlign + 2 * rectHeight, rectWidth, rectHeight));
	var label2 = av.label("$i = 2$",  {"top": topAlign -0.5*rectHeight + 2 * rectHeight, "left": leftAlign + 4 * rectWidth + labelShift});
	av.step();

	//Slide 6
	av.umsg(interpret("Slide 6.1"));
	av.umsg(interpret("Slide 6.2"), {"preserve": true});
	av.g.rect(leftAlign, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 2 * rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 3 * rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 4 * rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 5 * rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 6 * rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 7 * rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight);
	var label3 = av.label("$i = 3$",  {"top": topAlign -0.5*rectHeight + 3 * rectHeight, "left": leftAlign + 8 * rectWidth + labelShift});
	av.step();

	//Slide 7
	av.umsg(interpret("Slide 7.1"));
	av.umsg(interpret("Slide 7.2"), {"preserve": true});
	av.g.rect(leftAlign, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 2 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 3 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 4 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 5 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 6 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 7 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 8 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 9 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 10 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 11 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 12 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 13 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 14 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	av.g.rect(leftAlign + 15 * rectWidth, topAlign + 4 * rectHeight, rectWidth, rectHeight);
	var label4 = av.label("$i = 4$",  {"top": topAlign -0.5*rectHeight + 4 * rectHeight, "left": leftAlign + 16 * rectWidth + labelShift});
	av.step();

	//Slide 8
	av.umsg(interpret("Slide 8.1"));
	av.umsg(interpret("Slide 8.2"), {"preserve": true});
	label0.hide();
	label1.hide();
	label2.hide();
	label3.hide();
	label4.hide();
    av.step();

    //Slide 9
	set2.translate(8 * rectWidth, rectHeight);
    av.step();

    //Slide 10
	set1.translate(12 * rectWidth, 2 * rectHeight);
    av.step();

    //Slide 11
	rect0.translate(14 * rectWidth, 3 * rectHeight);
    av.step();
    
    //Slide 12
	av.umsg(interpret("Slide 12"));
	av.g.rect(leftAlign + 15 * rectWidth, topAlign + 3 * rectHeight, rectWidth, rectHeight).css({"fill":"black"});
	av.label("$-1$",  {"top": topAlign -0.5*rectHeight + 2 * rectHeight, "left": leftAlign + 15.2 * rectWidth});
	av.label("|-------------------------------------------------------------- $n$ --------------------------------------------------------------|",  
		{"top": topAlign + 4 *rectHeight + 25, "left": leftAlign + 0.5*rectWidth}).css
	({'font-size': '16px', "text-align": "center"});
	av.label("$|-2-|$",  {"top": topAlign + 3 * rectHeight + labelShift, "left": leftAlign + 15.5 * rectWidth + 2 * labelShift}).addClass("rotated");
    av.step();

    //Slide 13
    av.umsg(interpret("Slide 13"));
	av.recorded();
});
