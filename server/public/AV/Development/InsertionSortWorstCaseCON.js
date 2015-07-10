/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Insertion Sort Worst Case
$(document).ready(function () {
  var av_name = "InsertionSortWorstCaseCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code).hide();
  var arr;

  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();

  // Slide 2
  pseudo.show();
  av.umsg(interpret("Slide 2"));
  //  pseudo.css("loops", {"background-color":"#99FF00"});
  pseudo.highlight("loops");
  av.step();

  // Slide 3
  av.umsg(interpret("Slide 3"));
  pseudo.unhighlight("loop2");
  av.step();

  // Slide 4
  av.umsg(interpret("Slide 4"));
  pseudo.unhighlight("loop1");
  pseudo.highlight("loop2");
  av.step();

  // Slide 5
  av.umsg(interpret("Slide 5"));
  pseudo.unhighlight("loop2");
  arr = av.ds.array([6, 5, 4, 3, 2, 1], {"left": 10, "top": 160, "indexed": true});
  av.step();

  // Slide 6
  av.umsg(interpret("Slide 6"));
  arr.swap(0, 1);
  av.g.rect(320, 320, 50, 20);
  av.label("i=1",  {"top": "330px", "left": "330px"});
  av.step();

  // Slide 7
  av.umsg(interpret("Slide 7"));
  arr.swap(1, 2);
  av.g.rect(370, 320, 50, 20);
  av.label("i=2",  {"top": "330px", "left": "380px"});
  av.step();

  // Slide 8
  arr.swap(0, 1);
  av.g.rect(370, 300, 50, 20);
  av.step();

  // Slide 9
  av.umsg(interpret("Slide 9"));
  arr.swap(2, 3);
  av.g.rect(420, 320, 50, 20);
  av.label("i=3",  {"top": "330px", "left": "430px"});
  av.step();

  // Slide 10
  arr.swap(1, 2);
  av.g.rect(420, 300, 50, 20);
  av.step();

  // Slide 11
  arr.swap(0, 1);
  av.g.rect(420, 280, 50, 20);
  av.step();

  // Slide 12
  av.umsg(interpret("Slide 12"));
  arr.swap(3, 4);
  av.g.rect(470, 320, 50, 20);
  av.label("i=4",  {"top": "330px", "left": "480px"});
  av.step();

  // Slide 13
  arr.swap(2, 3);
  av.g.rect(470, 300, 50, 20);
  av.step();

  // Slide 14
  arr.swap(1, 2);
  av.g.rect(470, 280, 50, 20);
  av.step();

  // Slide 15
  arr.swap(0, 1);
  av.g.rect(470, 260, 50, 20);
  av.step();

  // Slide 16
  av.umsg(interpret("Slide 16"));
  arr.swap(4, 5);
  av.g.rect(520, 320, 50, 20);
  av.label("i=5",  {"top": "330px", "left": "530px"});
  av.step();

  // Slide 17
  arr.swap(3, 4);
  av.g.rect(520, 300, 50, 20);
  av.step();

  // Slide 18
  arr.swap(2, 3);
  av.g.rect(520, 280, 50, 20);
  av.step();

  // Slide 19
  arr.swap(1, 2);
  av.g.rect(520, 260, 50, 20);
  av.step();

  // Slide 20
  arr.swap(0, 1);
  av.g.rect(520, 240, 50, 20);
  av.step();

  // Slide 21
  av.umsg(interpret("Slide 21"));
  av.step();

  // Slide 22
  av.umsg(interpret("Slide 22_1"));
  var rect5 = av.g.rect(310, 290, 268, 1);
  rect5.rotate(-22);
  av.label("}",  {"top": "147px", "left": "560px"}).css({'font-size': '80px', "text-align": "center"});
  av.label("$n-1$",  {"top": "270px", "left": "600px"}).css({'font-size': '20px', "text-align": "center"});
  av.umsg(interpret("Slide 22_2"));
  av.step();

  // Slide 23
  av.umsg(interpret("Slide 23"));
  av.recorded();
});
