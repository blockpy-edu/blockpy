/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Two Coloring Proof
$(document).ready(function () {
  var av_name = "TwoColoringProofCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av;
  var leftAlign = 150;
  var topAlign = 100;
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
  var baseCaseLine = av.g.line(leftAlign, topAlign, leftAlign + 350, topAlign,{"stroke-width": 3});  
  var baseCaseLabel1 = av.label("Region 1",  {"top": topAlign - 75, "left": leftAlign + 400}).css
  ({'font-size': '16px', "text-align": "center"});
  var baseCaseLabel2 =  av.label("Region 2",  {"top": topAlign + 25 , "left": leftAlign + 400}).css
  ({'font-size': '16px', "text-align": "center"});
  av.step();

  //Slide 3
  av.umsg(interpret("Slide 3"), {"preserve": true});
  var baseCaseRect = av.g.rect(leftAlign, topAlign, 350, 50).css({"fill": "gray"});
  av.step();

  //Slide 4
  topAlign = 50;
  baseCaseRect.hide();
  baseCaseLine.hide();
  baseCaseLabel1.hide();
  baseCaseLabel2.hide();
  av.umsg(interpret("Slide 4"));
  av.step();

  //Slide 5
  av.umsg(interpret("Slide 5"), {"preserve": true});
  av.g.line(leftAlign + 50, topAlign + 20, leftAlign + 250, topAlign + 220, {"stroke-width": 3});
  av.g.line(leftAlign + 0, topAlign + 80, leftAlign + 350, topAlign + 80, {"stroke-width": 3});
  av.g.line(leftAlign + 300, topAlign + 20, leftAlign + 100, topAlign + 220, {"stroke-width": 3});
  av.step();

  //Slide 6
  av.umsg(interpret("Slide 6"));
  var p1 = av.g.polyline([[leftAlign + 60, topAlign + 30], [leftAlign + 110, topAlign + 80], [leftAlign + 30, topAlign + 80]]).css({"fill": "gray"});
  var p2 = av.g.polyline([[leftAlign + 110, topAlign + 80], [leftAlign + 240, topAlign + 80], [leftAlign + 175, topAlign + 145]]).css({"fill": "gray"});
  var p3 = av.g.polyline([[leftAlign + 240, topAlign + 80], [leftAlign + 330, topAlign + 80], [leftAlign + 290, topAlign + 30]]).css({"fill": "gray"});
  var p4 = av.g.polyline([[leftAlign + 175, topAlign + 145], [leftAlign + 230, topAlign + 200], [leftAlign + 120, topAlign + 200]]).css({"fill": "gray"});
  av.step();

  //Slide 7
  av.umsg(interpret("Slide 7"));
  var nLine = av.label("$n^{th}$ line",  {"top": topAlign + 135, "left": leftAlign + 400}).css
  ({'font-size': '16px', "text-align": "center"});
  av.g.line(leftAlign + 0, topAlign + 165, leftAlign + 350, topAlign + 165, {"stroke-width": 3});
  av.step();

  //Slide 8
  av.umsg(interpret("Slide 8"), {"preserve": true});
  var plane1 = av.label("Half Plane 1",  {"top": topAlign + 75, "left": leftAlign + 400}).css
  ({'font-size': '16px', "text-align": "center"});
  var plane2 = av.label("Half Plane 2",  {"top": topAlign + 175, "left": leftAlign + 400}).css
  ({'font-size': '16px', "text-align": "center"});
  var planeRect1 = av.g.rect(leftAlign + 0, topAlign + 165, 350, 55).css({"fill": "green", "opacity": 0.1});
  var planeRect2 = av.g.rect(leftAlign + 0, topAlign + 20, 350, 145).css({"fill": "blue", "opacity": 0.1});
  av.step();

  //Slide 9
  av.umsg(interpret("Slide 9"));
  planeRect1.hide();
  planeRect2.hide();
  plane1.hide();
  plane2.hide();
  av.step();

  //Slide 10
  av.umsg(interpret("Slide 10"));
  plane1.show();
  plane2.show();
  planeRect1.show();
  planeRect1.css({"fill": "green", "opacity": 0.1});
  av.step();
  
  //Slide 11
  av.umsg(interpret("Slide 11"), {"preserve": true});
  p4.hide();
  var p5 = av.g.polyline([[leftAlign + 175, topAlign + 145], [leftAlign + 195, topAlign + 165], [leftAlign + 155, topAlign + 165]]).css({"fill": "gray"});
  var p6 = av.g.polyline([[leftAlign + 155, topAlign + 165], [leftAlign + 85, topAlign + 165], [leftAlign + 105, topAlign + 212.5]]).css({"fill": "gray"});
  var p7 = av.g.polyline([[leftAlign + 195, topAlign + 165], [leftAlign + 275, topAlign + 165], [leftAlign + 240, topAlign + 210]]).css({"fill": "gray"});
  av.step();

  //Slide 12
  av.umsg(interpret("Slide 12"), {"preserve": true});
  plane1.hide();
  plane2.hide();
  nLine.hide();
  planeRect1.hide();
  av.recorded();
});
