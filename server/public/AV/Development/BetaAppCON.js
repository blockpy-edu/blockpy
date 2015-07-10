// OLD -- (function() {
/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "BetaAppCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name);

	var x = 0; var y = 0;
//	var av = new JSAV("av");
	var stepOne = ["(", "&#955;x.", "(", "x", "x", ")", "(", "&#955;y.", "y",  "z", ")", ")"];
	var stepTwo = ["(", "&#955;x.", "(", "x", "x", ")", "z", ")"];
	var stepThree = ["(", "z", "z", ")"];
// 	av.label("&#946;-Reduction Matrix");
        av.label("$\\beta$-Reduction");
	var m1 = av.ds.matrix([stepOne, stepTwo, stepThree], {style: "plain"});
	for(y = 0; y < 12; y++)
	{
		m1.css(x, y, {"background-color": "#eed"});
	}
	x = 1;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	x = 2;
	for(y = 0; y < 4; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	m1.css(0, 8, {"text-align": "left"});
	m1.layout();
	av.umsg("This slideshow will go through the process of reducing a lambda calculus expression using applicative-order &#946;-reduction.");
	av.displayInit();
	m1.css(0, 7, {"background-color": "aqua", "color": "rgb(0,0,0)"});
	av.umsg("First, we need to identify the first lambda variable. Since we are doing applicative-order reduction, this is the innermost variable.");
	av.step();
	m1.css(0, 9, {"background-color": "pink", "color": "rgb(0,0,0)"});
	av.umsg("Next, we need to identify the argument being passed into the variable.");
	av.step();
	m1.css(0, 8, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("Then we look at the body of the function that we are passing the argument to...");
	av.step();
	av.umsg("...and we go through the body and make note of each instance of the variable inside the body (which is easy in this case because the body is only one variable)...");
	av.step();
	x = 1;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	}
	m1.css(1, 6, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("...which we replace with the argument.");
	av.step();
	m1.css(1, 6, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	av.umsg("Since there are no more instances of the lambda variable within the body, we have completed one &#946;-reduction!");
	av.step();
	m1.css(0, 7, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(0, 8, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(0, 9, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	av.umsg("However, there are still more reductions to be done...");
	av.step();
	m1.css(1, 1, {"background-color": "aqua", "color": "rgb(0,0,0)"});
	av.umsg("So we must identify the next lambda variable...");
	av.step();
	m1.css(1, 6, {"background-color": "pink", "color": "rgb(0,0,0)"});
	av.umsg("...and the argument that will be passed into it.");
	av.step();
	m1.css(1, 2, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(1, 3, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(1, 4, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(1, 5, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("Then we look at the body of the function...");
	av.step();
	m1.css(1, 2, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(1, 5, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	av.umsg("...and we make note of each instance of the variable inside of the body of the function...");
	av.step();
	x = 2;
	for(y = 0; y < 4; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	}
	m1.css(2, 1, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(2, 2, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("...and we replace them with the argument!");
	av.step();
	x = 1;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	m1.css(2, 1, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(2, 2, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	av.umsg("And with that we have completed a full &#946;-reduction and we have a simplified expression!");
	av.recorded();
});
// OLD -- }());