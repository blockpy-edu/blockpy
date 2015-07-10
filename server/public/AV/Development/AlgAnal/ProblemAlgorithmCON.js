/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Problem, Algorithm, and program definitions
$(document).ready(function () {
  var av_name = "ProblemAlgorithmCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code).hide();
  var arr;
  var arr_values = [];
  var topAlign = 120;
  var leftAlign = 10;
  var rectWidth = 150;
  var rectHeight = 225;
  
  // Slide 1
  av.umsg("Let's see how we can differentiate between a problem, problem instance, algorithm, and a program.");
  av.displayInit();
  
  //Slide 2
  av.umsg("A problem is a task that matches input to output.");
  av.step();

  //Slide 3
  av.umsg("<br><br> Consider the problem of searching for an element in an array.", {preserve:true});
  var rect = av.g.rect(leftAlign + 380, topAlign - 25, rectWidth, rectHeight);
  var labelProblem = av.label("Searching Problem",  {"top": topAlign + 25, "left": leftAlign + 385});
  av.step();

  //Slide 4
  av.umsg
  ("Here, we have: <br><b><u> Input: </u></b> An array, and the target key.");
  for(var i = 0; i < 6; i++){
  	arr_values.push("Key " + (i+1));
  }
  arr = av.ds.array(arr_values, {"left": leftAlign, "top": topAlign, "indexed": true});  
  var labelInput = 
  av.label("Target key",  {"top": topAlign + 85, "left": leftAlign + 215}).css({'font-size': '18px', "text-align": "center", 'font-style':"bold"});
  var line1 = av.g.line(leftAlign + 320, topAlign + 30, leftAlign + 380, topAlign + 30);
  var line2 = av.g.line(leftAlign + 320, topAlign + 125, leftAlign + 380, topAlign + 125);
  av.step();

  //Slide 5
  av.umsg("<br><b><u> Output: </u></b> The index of the target element if it is found or -1 if not found.", {preserve:true});
  var lineOutput1 = av.g.line(leftAlign + 380 + rectWidth, topAlign + 50, leftAlign + 475 + rectWidth, topAlign + 50);
  var lineOutput2 = av.g.line(leftAlign + 380 + rectWidth, topAlign + 115, leftAlign + 475 + rectWidth, topAlign + 115);
  var labelOutput1 = 
  av.label("found",  {"top": topAlign + 15, "left": leftAlign + 385 + rectWidth});
  var labelOutput2 = 
  av.label("Not found",  {"top": topAlign + 105, "left": leftAlign + 385 + rectWidth});
  var labelOutput3 = 
  av.label("Index of the target key",  {"top": topAlign + 15, "left": leftAlign + 490 + rectWidth});
  var labelOutput4 = 
  av.label("-1",  {"top": topAlign + 105, "left": leftAlign + 490 + rectWidth});
  av.step();

  //Slide 6
  av.umsg("<br><br>Note here that we have the searching problem as a black box. We don't know how the searching is performed.", {"preserve":true});
  rect.css({"opacity":0.2, "fill":"blue"});
  av.step();

  //Slide 7
  av.umsg("A problem instance is a specific selection of values for the problem input");
  rect.hide();
  rect = av.g.rect(leftAlign + 380, topAlign - 25, rectWidth, rectHeight);
  av.step();

  //Slide 8
  av.umsg("<br><br> Here we see an example of a searching problem instance in which we have initialized the array and we have a value for the target key", {preserve:true});
  var count = 0;
  while(count < 6){
    var value = Math.round(Math.random() * 10);
    if(arr_values.indexOf(value) == -1){
      arr_values[count] = value;  
      count++;
    }
  }
  arr.hide();
  var arr = av.ds.array(arr_values, {"left": leftAlign, "top": topAlign, "indexed": true});  
  labelInput.text("");
  labelInput = 
  av.label("Target key =" + arr_values[3],  {"top": topAlign + 85, "left": leftAlign + 180}).css({'font-size': '18px', "text-align": "center", 'font-style':"bold"});
  labelOutput2.hide();
  labelOutput4.hide();
  lineOutput2.hide();
  labelOutput3.text("Index = 3");
  av.step();

  //Slide 9
  av.umsg("An algorithm is a receipe or a specific way of mapping problem input to output");
  labelProblem.text("Algorithm");
  labelProblem.css({"top":"-=50", "left":"+=20"});
  labelOutput1.hide();
  labelOutput3.hide();
  lineOutput1.hide();
  arr.hide();
  line1.hide();
  line2.hide();
  labelInput.hide();
  av.step();

  //Slide 10
  av.umsg("<br><br> An algorithm takes a problem instance as its input", {preserve: true});
  arr.show();
  line1.show();
  line2.show();
  labelInput.show();
  av.step();

  //Slide 11
  av.umsg("<br><br>Then a series of steps is performed to generate the output.", {preserve:true});  
  av.step();

  //Slide 12
  av.umsg("There are several different algorithms that can solve a particular problem. For the searching problem, here we present the sequencial search algorithm.");
  av.step();

  //Slide 13
  av.umsg("<br><br> The sequencial search algorithm simply loops through all the keys in the array until the target key is found in which the index is returned. Otherwise -1 is returned.", {preserve:true});
  var algLabel = av.label("foreach key in array<br>&nbsp;&nbsp;if key == target<br>&nbsp;&nbsp;&nbsp;&nbsp;return keyIndex<br> return -1",  {"top": topAlign + 25, "left": leftAlign + 395}).css({"font-size":12});
  labelOutput1.show();
  labelOutput3.show();
  lineOutput1.show();
  av.step();

  //Slide 14
  av.umsg("A program is an instance of a particular algorithm that solves a particular problem implemented in some programming language");
  labelProblem.text("Program");
  labelOutput1.hide();
  labelOutput3.hide();
  lineOutput1.hide();
  arr.hide();
  line1.hide();
  line2.hide();
  labelInput.hide();
  algLabel.hide();
  av.step();

  //Slide 15
  av.umsg("<br><br>A program accepts a problem instance as an input", {preserve:true});
  labelInput.show();
  line1.show();
  line2.show();
  arr.show();
  av.step();

  //Slide 16
  av.umsg("<br><br>Then the program is executed to generate the output", {preserve:true});
  av.step(); 

  //Slide 17
  av.umsg("Here we present the sequencial search algorithm. implemented as a Java function.");
  rect.css({width: rectWidth + 70});
  labelProblem.css({left:"+=50"});
  var ProgLabel = av.label("int seqSearch(int [] A, int target){<br>&nbsp;&nbsp;for(int i = 0;i < A.length;i++){<br>&nbsp;&nbsp;&nbsp;&nbsp;if(A[i] == target){<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return i;<br>&nbsp;&nbsp;&nbsp;&nbsp;}<br>&nbsp;&nbsp;return -1;<br>}",  {"top": topAlign + 25, "left": leftAlign + 385}).css({"font-size":12});
  lineOutput1.hide();
  lineOutput1 = av.g.line(leftAlign + 450 + rectWidth, topAlign + 50, leftAlign + 545 + rectWidth, topAlign + 50);
  labelOutput1.css({left:"+=70"});
  labelOutput3.css({left:"+=70"});
  lineOutput1.show();
  labelOutput1.show();
  labelOutput3.show();
  av.step();


  av.recorded();
});
