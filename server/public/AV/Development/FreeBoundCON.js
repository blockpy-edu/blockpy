/* global ODSA */
"use strict";
$(document).ready(function () {
	var av_name = "FreeBoundCON";
	var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
	var av = new JSAV(av_name);
	var y = 0;
    var expression = ["(", "&#955;x.", "(", "x", "y", ")", "z", ")"];
    av.label("Free and Bound Variables");
	var screen = av.ds.matrix([expression], {style: "plain"});
	for(y = 0; y < 8; y++)
	{
		screen.css(0, y, {"background-color": "#eed"});
	}
	screen.layout();
	av.umsg("This slideshow will go through the difference between free and bound variables in a lambda calculus expression.");
	av.displayInit();
	av.umsg("Free variables are those that are not captured by a lambda variable.");
	av.step();
	screen.css(0, 4, {"background-color": "aqua", "color": "rgb(255, 255, 255)"});
	screen.css(0, 6, {"background-color": "aqua", "color": "rgb(255, 255, 255)"});
	av.umsg("The following variables are the free variables in this expression:");
	av.step();
	screen.css(0, 4, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	screen.css(0, 6, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	av.umsg("Bound variables are those that are captured by a lambda variable.");
	av.step();
	screen.css(0, 3, {"background-color": "lightgreen", "color": "rgb(255, 255, 255)"});
	av.umsg("The following variable is the bound variable in this expression:");
	av.step();
	screen.css(0, 3, {"background-color": "#eed", "color": "rgb(0, 0, 0)"});
	av.umsg("Remember! Knowing the difference between free and bound variables is important when &#946;-reducing expressions!");
	av.recorded();
});