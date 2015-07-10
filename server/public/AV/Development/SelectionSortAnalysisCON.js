/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Selection Sort Analysis
$(document).ready(function () {
  var av_name = "SelectionSortAnalysisCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code).hide();
  var arr;
  var arr_values = [];
  
  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  // Slide 2
  av.umsg(interpret("Slide 2"));
  av.step();
  
  // Slide 3
  av.umsg(interpret("Slide 3"));
  for (var i = 0; i < 6; i++) {
    arr_values[i] = parseInt(Math.random() * 20, 10);
  }
  arr = av.ds.array(arr_values, {"left": 250, "top": 20, "indexed": true});
  av.label("<b><u>Number of Comparisons</u></b>",  {"top": "172px", "left": "50px"}).css({'font-size': '16px', "text-align": "center"});
  av.label("<b><u>Number of Swaps</u></b>",  {"top": "172px", "left": "500px"}).css({'font-size': '16px', "text-align": "center"});
  av.step();
  
  // Slide 4  
  av.umsg(interpret("Slide 4"));
  var bigIndex = 0;
  var pointer = av.pointer("Big-index", arr.index(bigIndex));
  arr.css(bigIndex, {"background-color": "green"});
  av.step();
  
  // Slide 5
  arr.css(1, {"background-color": "yellow"});
  av.label("$i=0$",  {"top": "345px", "left": "30px"});
  av.g.rect(25, 325, 50, 20);
  av.step();
  
  // Slide 6
  av.clearumsg();
  if (arr.value(1) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(1));
    bigIndex = 1;
    arr.css(1, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(1, {"background-color": "white"});
  }
  arr.css(2, {"background-color": "yellow"});
  av.g.rect(25, 305, 50, 20);
  av.step();
  
  // Slide 7
  if (arr.value(2) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(2));
    bigIndex = 2;
    arr.css(2, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(2, {"background-color": "white"});
  }
  arr.css(3, {"background-color": "yellow"});
  av.g.rect(25, 285, 50, 20);
  av.step();
  
  // Slide 8
  if (arr.value(3) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(3));
    bigIndex = 3;
    arr.css(3, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(3, {"background-color": "white"});
  }
  arr.css(4, {"background-color": "yellow"});
  av.g.rect(25, 265, 50, 20);
  av.step();
  
  // Slide 9
  if (arr.value(4) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(4));
    bigIndex = 4;
    arr.css(4, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(4, {"background-color": "white"});
  }
  arr.css(5, {"background-color": "yellow"});
  av.g.rect(25, 245, 50, 20);
  av.step();

  // Slide 10  
  if (arr.value(5) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(5));
    bigIndex = 5;
    arr.css(5, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(5, {"background-color": "white"});
  }
  arr.swap(bigIndex, 5);
  arr.css(bigIndex, {"background-color": "white"});
  arr.css(5, {"background-color": "grey"});
  av.g.rect(450, 325, 50, 20);
  av.label("$i=0$",  {"top": "345px", "left": "455px"});
  bigIndex = 0;
  pointer.target(arr.index(bigIndex));
  arr.css(bigIndex, {"background-color": "green"});
  av.step();

  // Slide 11  
  av.umsg(interpret("Slide 11"));
  arr.css(1, {"background-color": "yellow"});
  av.label("$i=1$",  {"top": "345px", "left": "80px"});
  av.g.rect(75, 325, 50, 20);
  av.step();
  
  // Slide 12
  av.clearumsg();
  if (arr.value(1) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(1));
    bigIndex = 1;
    arr.css(1, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(1, {"background-color": "white"});
  }
  arr.css(2, {"background-color": "yellow"});
  av.g.rect(75, 305, 50, 20);
  av.step();
  
  // Slide 13
  if (arr.value(2) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(2));
    bigIndex = 2;
    arr.css(2, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(2, {"background-color": "white"});
  }
  arr.css(3, {"background-color": "yellow"});
  av.g.rect(75, 285, 50, 20);
  av.step();
  
  // Slide 14
  if (arr.value(3) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(3));
    bigIndex = 3;
    arr.css(3, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(3, {"background-color": "white"});
  }
  arr.css(4, {"background-color": "yellow"});
  av.g.rect(75, 265, 50, 20);
  av.step();
  
  // Slide 15
  if (arr.value(4) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(4));
    bigIndex = 4;
    arr.css(4, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(4, {"background-color": "white"});
  }
  arr.swap(bigIndex, 4);
  arr.css(bigIndex, {"background-color": "white"});
  arr.css(4, {"background-color": "grey"});
  av.g.rect(500, 325, 50, 20);
  av.label("$i=1$",  {"top": "345px", "left": "505px"});
  bigIndex = 0;
  pointer.target(arr.index(bigIndex));
  arr.css(bigIndex, {"background-color": "green"});
  av.step();
  
  // Slide 16  
  av.umsg(interpret("Slide 16"));
  arr.css(1, {"background-color": "yellow"});
  av.label("$i=2$",  {"top": "345px", "left": "130px"});
  av.g.rect(125, 325, 50, 20);
  av.step();
  
  // Slide 17
  av.clearumsg();
  if (arr.value(1) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(1));
    bigIndex = 1;
    arr.css(1, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(1, {"background-color": "white"});
  }
  arr.css(2, {"background-color": "yellow"});
  av.g.rect(125, 305, 50, 20);
  av.step();
  
  // Slide 18
  if (arr.value(2) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(2));
    bigIndex = 2;
    arr.css(2, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(2, {"background-color": "white"});
  }
  arr.css(3, {"background-color": "yellow"});
  av.g.rect(125, 285, 50, 20);
  av.step();
  
  // Slide 19
  if (arr.value(3) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(3));
    bigIndex = 3;
    arr.css(3, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(3, {"background-color": "white"});
  }
  arr.swap(bigIndex, 3);
  arr.css(bigIndex, {"background-color": "white"});
  arr.css(3, {"background-color": "grey"});
  av.g.rect(550, 325, 50, 20);
  av.label("$i=2$", {"top": "345px", "left": "555px"});
  bigIndex = 0;
  pointer.target(arr.index(bigIndex));
  arr.css(bigIndex, {"background-color": "green"});
  av.step();

  // Slide 20
  av.umsg(interpret("Slide 20"));
  arr.css(1, {"background-color": "yellow"});
  av.label("$i=3$",  {"top": "345px", "left": "180px"});
  av.g.rect(175, 325, 50, 20);
  av.step();
  
  // Slide 21
  av.clearumsg();
  if (arr.value(1) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(1));
    bigIndex = 1;
    arr.css(1, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(1, {"background-color": "white"});
  }
  arr.css(2, {"background-color": "yellow"});
  av.g.rect(175, 305, 50, 20);
  av.step();
  
  // Slide 22
  if (arr.value(2) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(2));
    bigIndex = 2;
    arr.css(2, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(2, {"background-color": "white"});
  }
  arr.swap(bigIndex, 2);
  arr.css(bigIndex, {"background-color": "white"});
  arr.css(2, {"background-color": "grey"});
  av.g.rect(600, 325, 50, 20);
  av.label("$i=3$",  {"top": "345px", "left": "605px"});
  bigIndex = 0;
  pointer.target(arr.index(bigIndex));
  arr.css(bigIndex, {"background-color": "green"});
  av.step();
  
  // Slide 23
  av.umsg(interpret("Slide 23"));
  arr.css(1, {"background-color": "yellow"});
  av.label("$i=4$",  {"top": "345px", "left": "230px"});
  av.g.rect(225, 325, 50, 20);
  av.step();
  av.clearumsg();
  if (arr.value(1) > arr.value(bigIndex)) {
    arr.css(bigIndex, {"background-color": "white"});
    pointer.target(arr.index(1));
    bigIndex = 1;
    arr.css(1, {"background-color": "green"});
    av.step();
  }
  else {
    arr.css(1, {"background-color": "white"});
  }
  arr.swap(bigIndex, 1);
  arr.css(bigIndex, {"background-color": "white"});
  arr.css(1, {"background-color": "grey"});
  av.g.rect(650, 325, 50, 20);
  av.label("$i=4$",  {"top": "345px", "left": "655px"});
  pointer.hide();
  arr.css(0, {"background-color": "grey"});
  av.step();
  
  // Slide 24
  av.umsg(interpret("Slide 24"));
  av.label("|--- $n-1$---|",  {"top": "270px", "left": "-30px"}).addClass("rotated");
  av.label("|--------------- $n-1$ ---------------|",  {"top": "365px", "left": "45px"});
  av.label("|--------------- $n-1$ ---------------|",  {"top": "365px", "left": "470px"});
  av.step();
  av.recorded();
});
