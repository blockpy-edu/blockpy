/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "AlphaConversionCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name);

  var x = 0; var y = 0;
  var stepOne = ["(", "&#955;x.", "&#955;y.", "(", "x", "y", ")", "y", ")"];
  var stepTwo = ["&#955;y.", "(", "y", "y", ")"];
  var stepThree = ["(", "&#955;x.", "&#955;z.", "(", "x", "z", ")", "y", ")"];
  var stepFour = ["&#955;z.", "(", "y", "z", ")"];
  //  av.label("&#945;-Conversion Matrix");
  av.label("$\\alpha$-Conversion");
  var m1 = av.ds.matrix([stepOne, stepTwo, stepThree, stepFour], {style: "plain"});
  for(y = 0; y < 9; y++)
  {
	m1.css(x, y, {"background-color": "#eed"});
  }
  x = 1;
  for(y = 0; y < 5; y++) {
    m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
  }
  x = 2;
  for(y = 0; y < 9; y++) {
    m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
  }
  x = 3;
  for(y = 0; y < 5; y++) {
    m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
  }

  // Slide 1
  av.umsg("This slideshow will illustrate the importance of $\\alpha$-conversion.");
  av.displayInit();
  x = 1;


  // Slide 2
  for(y = 0; y < 5; y++) {
    m1.css(x, y, {"color": "rgb(0,0,0)"});
  }
  av.umsg("If we try to $\\beta$-reduce this equation...");
  av.step();

  // Slide 3
  m1.css(0, 4, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
  m1.css(1, 2, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
  av.umsg("...we capture a free-variable which causes problems.");
  av.step();

  // Slide 4
  m1.css(0, 4, {"background-color": "#eed", "color": "rgb(0,0,0)"});
  x = 1;
  for(y = 0; y < 5; y++) {
    m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
  }
  av.umsg("So, how do we fix this?");
  av.step();

  // Slide 5
  m1.css(0, 2, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
  m1.css(0, 5, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
  x = 2;
  for(y = 0; y < 9; y++) {
    m1.css(x, y, {"background-color": "#eed", "color": "rgb(0,0,0)"});
  }
  m1.css(2, 2, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
  m1.css(2, 5, {"background-color": "lightgreen", "color": "rgb(0, 0, 0)"});
  av.umsg("We need to $\\alpha$-convert the expression!");
  av.step();

  // Slide 6
  m1.css(0, 2, {"background-color": "#eed", "color": "rgb(0,0,0)"});
  m1.css(0, 5, {"background-color": "#eed", "color": "rgb(0,0,0)"});
  m1.css(2, 2, {"background-color": "#eed", "color": "rgb(0,0,0)"});
  m1.css(2, 5, {"background-color": "#eed", "color": "rgb(0,0,0)"});
  x = 3;
  for(y = 0; y < 5; y++) {
    m1.css(x, y, {"background-color": "#eed", "color": "rgb(0,0,0)"});
  }
  av.umsg("This allows us to reduce without capturing free-variables.");
  av.step();

  // Slide 7
  x = 2;
  for(y = 0; y < 9; y++) {	
    m1.css(x, y, {"background-color": "#eed", "color": "#eed"});
  }
  av.umsg("This gives us an answer we can use!");
  av.recorded();
});
