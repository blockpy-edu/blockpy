/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Lower Bounds definition
$(document).ready(function () {
  var av_name = "LowerBoundCON";
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
  var rectWidth = 155;
  var rectHeight = 200;
  var arraySize = 7;
  var slideNumber = 1;
  
  // Slide 1
  av.umsg(interpret("Slide "+slideNumber++));
  av.displayInit();

  //Slide 2
  av.umsg(interpret("Slide "+slideNumber++));
  av.step();

  //Slide 3
  av.umsg(interpret("Slide "+slideNumber++));
  av.label("|---------------------------- $n$ ----------------------------|", {left : leftAlign + 25, top : topAlign + 60});
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

  // //Slide 4
  // av.umsg("Remember that there are three input cases that affect the running time of sequencial search.");
  // av.step();

  // //Slide 5
  // av.umsg("<br><br>1- When the target ket $k$ is located at the first position in the input array.", {preserve: true});
  // var pointer = av.pointer("$k$", arr.index(0));
  // av.step();

  // //Slide 6
  // av.umsg("<br><br>2- When the target ket $k$ is located at the last position in the input array.", {preserve: true});
  // pointer.target(arr.index(arraySize -1));
  // av.step();

  // //Slide 7
  // av.umsg("<br><br>3- When the target key $k$ is located at the middle position in the input array.", {preserve: true});
  // pointer.target(arr.index(parseInt(arraySize/2)));
  // av.step(); 

  //Slide 4
  av.umsg(interpret("Slide "+slideNumber++));
  var pointer = av.pointer("$k$", arr.index(0));
  arr.highlight(0);
  av.step();

  //Slide 5
  av.umsg(interpret("Slide "+slideNumber++), {preserve: true});
  av.step();

  //Slide 6
  av.umsg(interpret("Slide "+slideNumber++));
  pointer.target(arr.index(parseInt(arraySize - 1)));
  for(var i = 0; i < parseInt(arraySize); i++){
    arr.highlight(i);
  }
  av.step();

  //Slide 7
  av.umsg(interpret("Slide "+slideNumber++), {preserve: true});
  av.step();

  //Slide 8
  av.umsg(interpret("Slide "+slideNumber++));
  pointer.target(arr.index(parseInt(arraySize/2)));
  arr.unhighlight();
  for(var i = 0; i <= parseInt(arraySize/2); i++){
    arr.highlight(i);
  }
  av.step();

  //Slide 9
  av.umsg(interpret("Slide "+slideNumber++), {preserve: true});
  av.step();

  av.recorded();
});
