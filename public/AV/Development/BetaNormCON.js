// OLD -- (function() {
/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "BetaNormCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name);
	var x = 0; var y = 0;
//	var av = new JSAV("av");
	var stepOne = ["(", "&#955;x.", "(", "x", "x", ")", "(", "&#955;y.", "y", "z", ")", ")"];
	var stepTwo = ["(", "(", "&#955;y.", "y", "z", ")", "x", ")"];
	var stepThree = ["(", "(", "&#955;y.", "y", "z", ")", "(", "&#955;y.", "y", "z", ")", ")"];
	var stepFour = ["(", "z", "(", "&#955;y.", "y", "z", ")", ")"];
	var stepFive = ["(", "z", "z", ")"];
//	av.label("&#946;-Reduction Matrix");
	av.label("$\\beta$-Reduction");
	var m1 = av.ds.matrix([stepOne, stepTwo, stepThree, stepFour, stepFive], {style: "plain"});
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
	for(y = 0; y < 12; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	x = 3;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	x = 4;
	for(y = 0; y < 4; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	m1.css(0, 8, {"text-align": "left"});
	m1.css(1, 3, {"text-align": "left"});
	m1.css(2, 3, {"text-align": "left"});
	m1.css(2, 8, {"text-align": "left"});
	m1.css(3, 4, {"text-align": "left"});
	m1.layout();
	av.umsg("This slideshow will go through the process of reducing a lambda calculus expression using normal-order &#946;-reduction.");
	av.displayInit();
	m1.css(0, 1, {"background-color": "aqua", "color": "rgb(0,0,0)"});
	av.umsg("First, we need to identify the first lambda variable. Since we are doing normal-order reduction, this is the outermost variable.");
	av.step();
	m1.css(0, 6, {"background-color": "pink", "color": "rgb(0,0,0)"});
	m1.css(0, 7, {"background-color": "pink", "color": "rgb(0,0,0)"});
	m1.css(0, 8, {"background-color": "pink", "color": "rgb(0,0,0)"});
	m1.css(0, 9, {"background-color": "pink", "color": "rgb(0,0,0)"});
	m1.css(0, 10, {"background-color": "pink", "color": "rgb(0,0,0)"});
	av.umsg("Next, we need to identify the argument being passed into the variable.");
	av.step();
	m1.css(0, 2, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(0, 3, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(0, 4, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(0, 5, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("And then we look at the body of the function that we are passing the argument to.");
	av.step();
	m1.css(0, 2, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(0, 4, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(0, 5, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	av.umsg("Then we go through the body and make note of each instance of the variable inside the body...");
	av.step();
	x = 1;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	}
	m1.css(1, 1, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(1, 2, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(1, 3, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(1, 4, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(1, 5, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	av.umsg("...and we replace it with the argument.");
	av.step();
	m1.css(0, 3, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(0, 4, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	m1.css(1, 1, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(1, 2, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(1, 3, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(1, 4, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(1, 5, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(1, 6, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("Then we continue to look through the body, making note of the next instance of the variable...");
	av.step();
	x = 2;
	for(y = 0; y < 12; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	}
	m1.css(2, 6, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(2, 7, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(2, 8, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(2, 9, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	m1.css(2, 10, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	av.umsg("...and we replace that with the argument as well.");
	av.step();
	x = 0;
	for(y = 0; y < 12; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});	
	}
	x = 1;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	x = 2;
	for(y = 0; y < 12; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	}
	av.umsg("Since there are no more instances of the variable, we have completed one full reduction.");
	av.step();
	av.umsg("There are still more reductions to be done on this expression, however.");
	av.step();
	m1.css(2, 2, {"background-color": "aqua", "color": "rgb(0,0,0)"});
	av.umsg("Next we need to identify the next lambda variable...");
	av.step();
	m1.css(2, 4, {"background-color": "pink", "color": "rgb(0,0,0)"});
	av.umsg("...and the parameter being passed into it.");
	av.step();
	m1.css(2, 3, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("Then we take a look at the body of the expression...");
	av.step();
	x = 3;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	}
	m1.css(3, 1, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	av.umsg("...and replace all instances of the variable with the parameter.");
	av.step();
	x = 2;
	for(y = 0; y < 12; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	m1.css(3, 1, {"background-color": "#eed", "color": "rgb(0,0,0)"});
	m1.css(3, 3, {"background-color": "aqua", "color": "rgb(0,0,0)"});
	av.umsg("There is still one more reduction to be done so we need to identify the final lambda variable...");
	av.step();
	m1.css(3, 5, {"background-color": "pink", "color": "rgb(0,0,0)"});
	av.umsg("...and the argument being passed into it.");
	av.step();
	m1.css(3, 4, {"background-color": "lightgreen", "color": "rgb(0,0,0)"});
	av.umsg("Then we note all instances of the variable within the body...");
	av.step();
	x = 4;
	for(y = 0; y < 4; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	}
	m1.css(4, 2, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
	av.umsg("...and replace them with the argument.");
	av.step();
	x = 3;
	for(y = 0; y < 8; y++)
	{
		m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
	}
	m1.css(4, 2, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	av.umsg("And with that we have completed a full &#946;-reduction and we have a simplified expression!");
	av.recorded();
});
// }());