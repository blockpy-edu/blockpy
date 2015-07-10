/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Best, Worst, Average Cases definitions
$(document).ready(function () {
  var av_name = "BestWorstAverageCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code).hide();
  var arr;
  var arr_values = [];
  var topAlign = 80;
  var leftAlign = 10;
  var rectWidth = 175;
  var rectHeight = 200;
  var arraySize = 7;
  
  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  //Slide 2
  av.umsg(interpret("Slide 2"));
  var rect = av.g.rect(leftAlign + 380, topAlign - 25, rectWidth, rectHeight);
  var label = av.label("<b>Sequencial Search</b>",  {"top": topAlign - 25, "left": leftAlign + 385});
  av.step();
  
  //Slide 3
  av.umsg(interpret("Slide 3"), {preserve:true});
  av.label("|-------------------------- $n$ --------------------------|", {left : leftAlign + 25, top : topAlign + 60});
  var count = 0;
  while(count < arraySize){
    var value = Math.round(Math.random() * 10) + 1;
    if(arr_values.indexOf(value) == -1){
      arr_values[count] = value;  
      count++;
    }
  }
  arr = av.ds.array(arr_values, {"left": leftAlign, "top": topAlign, "indexed": true});
  av.step();
  
  //Slide 4
  av.umsg(interpret("Slide 4"));
  var algLabel = av.label("foreach key in array<br>&nbsp;&nbsp;if key == target<br>&nbsp;&nbsp;&nbsp;&nbsp;return keyIndex<br> return -1",  {"top": topAlign + 25, "left": leftAlign + 395}).css({"font-size":12});
  av.step();
  
  //Slide 5
  av.umsg(interpret("Slide 5"));
  var pointer = av.pointer("$k$", arr.index(0));
  av.step();
  
  //Slide 6
  av.umsg(interpret("Slide 6"), {preserve:true});
  var rect1 = av.g.rect(leftAlign + 380, topAlign + 55, 175, 15).css({fill : "green", opacity : 0.3});
  av.step();
  
  //Slide 7
  av.umsg(interpret("Slide 7"), {preserve: true});
  rect1.translate(0, 20);
  var labelOutput = 
  av.label("index  = $0$",  {"top": topAlign + 15, "left": leftAlign + 395 + rectWidth});
  av.step();
  
  //Slide 8
  av.umsg(interpret("Slide 8"));
  arr.highlight(0);
  av.step();
  
  //Slide 9
  av.umsg(interpret("Slide 9"));
  pointer.target(arr.index(arraySize - 1));
  arr.unhighlight(0);
  rect1.hide();
  labelOutput.hide();
  av.step();
  
  //Slide 10
  av.umsg(interpret("Slide 10"), {preserve:true});
  var rect1 = av.g.rect(leftAlign + 380, topAlign + 55, 175, 15).css({fill : "green", opacity : 0.3});
  av.step();
  
  //Slide 11
  av.umsg("<br><br>After that the algorithm will terminate returning " + (arraySize -1) + " as the target's index.", {preserve: true});
  rect1.translate(0, 20);
  var labelOutput = 
  av.label("index  = " + (arraySize - 1),  {"top": topAlign + 15, "left": leftAlign + 395 + rectWidth});
  av.step();
  
  //Slide 12
  av.umsg(interpret("Slide 12"));
  arr.highlight();
  av.step();
  
  //Slide 13
  av.umsg(interpret("Slide 13"));
  pointer.target(arr.index(parseInt(arraySize/2)));
  arr.unhighlight();
  rect1.hide();
  labelOutput.hide();
  av.step();
  
  //Slide 14
  av.umsg(interpret("Slide 14"), {preserve:true});
  var rect1 = av.g.rect(leftAlign + 380, topAlign + 55, 175, 15).css({fill : "green", opacity : 0.3});
  av.step();
  
  //Slide 15
  av.umsg("<br><br>After that the algorithm will terminate returning" + parseInt(arraySize/2) + "as the target's index.", {preserve: true});
  rect1.translate(0, 20);
  var labelOutput = 
  av.label("index  = " + parseInt(arraySize/2),  {"top": topAlign + 15, "left": leftAlign + 395 + rectWidth});
  av.step();
  
  //Slide 16
  av.umsg(interpret("Slide 16"));
  for(var i = 0; i <= parseInt(arraySize/2); i++){
    arr.highlight(i);
  }
  av.step();
  
  av.recorded();
});
