/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Quick Sort Average Case
$(document).ready(function () {
  var av_name = "QuickSortAverageCaseCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);

  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  // Slide 2
  av.umsg(interpret("Slide 2"));
  av.g.rect(220, 50, 400, 30);
  av.label("|-------------------------------------  $n$  -----------------------------------|",  {"top": "80px", "left": "225px"}).css({'font-size': '14px', "text-align": "center"});
  var pivot = av.g.rect(330, 50, 30, 30);
  var piv = av.label("pivot", {"top": "45px", "left": "331px"}).css({'font-size': '11px', "text-align": "center"});
  var index = av.label("$k$", {"top": "15px", "left": "338px"}).css({'font-size': '14px', "text-align": "center"});
  av.step();
  
  // Slide 3
  av.umsg(interpret("Slide 3"));
  var right_side = av.label("|----------------  $n-1-k$  ---------------|",  {"top": "15px", "left": "370px"}).css({'font-size': '14px', "text-align": "center"});
  var left_side = av.label("|---------- $k$ ----------|", {"top": "15px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"});
  av.step();
  
  // Slide 4
  av.umsg(interpret("Slide 4_1"));
  av.umsg(interpret("Slide 4_2"));
  pivot.hide();
  pivot = av.g.rect(220, 50, 30, 30);
  index.hide();
  index = av.label("k = 0", {"top": "20px", "left": "220px"}).css({'font-size': '11px', "text-align": "center"});
  piv.hide();
  piv = av.label("pivot", {"top": "45px", "left": "221px"}).css({'font-size': '11px', "text-align": "center"});
  right_side.hide();
  left_side.hide();
  right_side = av.label("|-------------------------------  $n-1$  -----------------------------|",  {"top": "15px", "left": "255px"}).css({'font-size': '14px', "text-align": "center"});
  av.step();
  
  // Slide 5
  av.umsg(interpret("Slide 5"));
  pivot.translate(30, 0);
  piv.translate(30, 0);
  index.translate(30, 0);
  index.text("k = 1");
  right_side.hide();
  right_side = av.label("|----------------------------  $n-2$  --------------------------|",  {"top": "15px", "left": "285px"}).css({'font-size': '14px', "text-align": "center"});
  left_side = av.label("$1$", {"top": "15px", "left": "230px"}).css({'font-size': '12px', "text-align": "center"});
  av.step();
  
  // Slide 6
  av.umsg(interpret("Slide 6"));
  pivot.translate(30, 0);
  piv.translate(30, 0);
  index.translate(30, 0);
  index.text("k = 2");
  right_side.hide();
  right_side = av.label("|-------------------------  $n-3$  -----------------------|",  {"top": "15px", "left": "315px"}).css({'font-size': '14px', "text-align": "center"});
  left_side.hide();
  left_side = av.label("|---- $2$ ----|", {"top": "15px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"});
  av.step();
  
  // Slide 7
  av.umsg(interpret("Slide 7"));
  pivot.translate(30, 0);
  piv.translate(30, 0);
  index.translate(30, 0);
  index.text("k = 3");
  right_side.hide();
  right_side = av.label("|----------------------  $n-4$  ---------------------|",  {"top": "15px", "left": "345px"}).css({'font-size': '14px', "text-align": "center"});
  left_side.hide();
  left_side = av.label("|------- $3$ -------|", {"top": "15px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"});
  av.step();
  
  // Slide 8
  av.umsg(interpret("Slide 8"));
  pivot.hide();
  pivot = av.g.rect(330, 50, 30, 30);
  piv.hide();
  piv = av.label("pivot", {"top": "45px", "left": "331px"}).css({'font-size': '11px', "text-align": "center"});
  index.hide();
  index = av.label("$k$", {"top": "15px", "left": "335px"}).css({'font-size': '14px', "text-align": "center"});
  right_side.hide();
  left_side.hide();
  right_side = av.label("|----------------  $n-1-k$  ---------------|",  {"top": "15px", "left": "370px"}).css({'font-size': '14px', "text-align": "center"});
  left_side = av.label("|---------- $k$ ----------|", {"top": "15px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"});
  av.step();
  
  // Slide 9
  av.umsg(interpret("Slide 9"));
  var eqn = av.label("$$\\frac{1}{n}\\displaystyle\\sum_{k=0}^{n-1}[T(k)+T(n-1-k)]$$",  {"top": "-50px", "left": "0px"}).css({'font-size': '16px', "text-align": "center"});
  av.step();
  
  // Slide 10
  av.umsg(interpret("Slide 10"));
  av.step();
  
  // Slide 11
  av.umsg(interpret("Slide 11"));
  eqn.hide();
  eqn = av.label("$$T(n) = cn + \\frac{1}{n}\\displaystyle\\sum_{k=0}^{n-1}[T(k)+T(n-1-k)]$$",  {"top": "-50px", "left": "0px"}).css({'font-size': '16px', "text-align": "center"});
  av.step();
  
  // Slide 12
  av.umsg(interpret("Slide 12"));
  av.recorded();
});
