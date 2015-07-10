"use strict";
/*global ODSA sweep */
// Various functions and variables that will be used by all of the
// following sections of the tutorial.

// The various arrays to start sweeps with or display
var theArray = [20, 30, 44, 54, 55, 11, 78, 14, 13, 79, 12, 98];
var theArray2 = [13, 30, 12, 54, 55, 11, 78, 14, 20, 79, 44, 98];
var theArray3 = [13, 11, 12, 14, 20, 30, 44, 54, 55, 79, 78, 98];
var theArray4 = [12, 11, 13, 14, 20, 30, 44, 54, 55, 79, 78, 98];

// Display a slideshow for a sweep of "increment" steps on array "inArr"
function doSweep(av_name, inArr, increment) {
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(
                 {"av_name": av_name, "json_path": "AV/Sorting/shellsortAV.json"});
  var interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);
  // Create an array object under control of JSAV library
  var arr = av.ds.array(inArr, {indexed: true});
  av.displayInit();
  sweep(av, arr, increment, interpret); // first sweep with increment 8
  av.recorded();
}

// Show the differences between the original array and given array "a"
function showDifference(av_name, a) {
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(
                 {"av_name": av_name, "json_path": "AV/Sorting/shellsortAV.json"});
  var interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name, {"animationMode": "none"});
  var origarr = av.ds.array(theArray, {indexed: true});
  var origlabel = av.label(interpret("av_diff1"), {before: origarr});
  var arr = av.ds.array(a, {indexed: true});
  var arrlabel = av.label(interpret("av_diff2"), {before: arr});
  arr.addClass(function (index)
                 { return arr.value(index) !== origarr.value(index); },
               "greentext");
}

$(document).ready(function () {
  var av = new JSAV("shellsortCON1");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(theArray, {indexed: true});

  arr.addClass(true, "deemph");
  arr.highlight([0, 8]).removeClass([0, 8], "deemph");
  av.displayInit();
  arr.unhighlight([0, 8]).addClass([0, 8], "deemph");
  arr.highlight([1, 9]).removeClass([1, 9], "deemph");
  for (var i = 2; i < 4; i++) { // loop through the rest of the array sublists
    av.step();
    arr.unhighlight([i - 1, i + 7]).addClass([i - 1, i + 7], "deemph");
    arr.highlight([i, i + 8]).removeClass([i, i + 8], "deemph");
  }
  av.recorded();
});

$(document).ready(function () {
  var arr = theArray;
  doSweep("shellsortCON2", arr, 8);
});

$(document).ready(function () {
  var arr = theArray2;
  showDifference("shellsortCON3", arr);
});

$(document).ready(function () {
  var av = new JSAV("shellsortCON4");
  var arr = av.ds.array(theArray2, {indexed: true});
  arr.addClass(true, "deemph");
  arr.highlight([0, 4, 8]).removeClass([0, 4, 8], "deemph");
  //  arr.css(function (index)
  //          { return index % 4 !== 0; }, {"color": LIGHT}).highlight([0, 4, 8]);
  av.displayInit();
  arr.unhighlight([0, 4, 8]).addClass([0, 4, 8], "deemph");
  arr.highlight([1, 5, 9]).removeClass([1, 5, 9], "deemph");
  av.step();
  arr.unhighlight([1, 5, 9]).addClass([1, 5, 9], "deemph");
  arr.highlight([2, 6, 10]).removeClass([2, 6, 10], "deemph");
  av.step();
  arr.unhighlight([2, 6, 10]).addClass([2, 6, 10], "deemph");
  arr.highlight([3, 7, 11]).removeClass([3, 7, 11], "deemph");
  av.recorded();
});

$(document).ready(function () {
  var arr = theArray2;
  doSweep("shellsortCON5", arr, 4);
});

$(document).ready(function () {
  var arr = theArray3;
  showDifference("shellsortCON6", arr);
});

$(document).ready(function () {
  var arr = theArray3;
  doSweep("shellsortCON7", arr, 2);
});

$(document).ready(function () {
  var arr = theArray4;
  showDifference("shellsortCON8", arr);
});

$(document).ready(function () {
  var arr = theArray4;
  doSweep("shellsortCON9", arr, 1);
});
