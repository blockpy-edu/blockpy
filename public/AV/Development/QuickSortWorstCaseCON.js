/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Quick Sort Worst Case
$(document).ready(function () {
  var av_name = "QuickSortWorstCaseCON";
  // Load the config object with interpreter
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);
  var arr;
  
  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  // Slide 2
  av.umsg(interpret("Slide 2"));
  av.g.rect(100, 0, 400, 30);
  av.label("$n$",  {"top": "-17px", "left": "300px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 3
  av.umsg(interpret("Slide 3"));
  av.g.rect(100, 80, 400, 30);
  av.g.rect(100, 80, 20, 30);
  av.label("|-----------------------------  $> A[pivot]$  ---------------------------|",  {"top": "40px", "left": "120px"}).css({'font-size': '14px', "text-align": "center"});
  av.label("pivot",  {"top": "74px", "left": "98px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("$n-1$",  {"top": "67px", "left": "270px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$n-1$",  {"top": "67px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("<b><u>Amount Of Work</b></u>",  {"top": "-17px", "left": "580px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 4
  av.umsg(interpret("Slide 4"));
  av.g.rect(120, 160, 380, 30);
  av.g.rect(120, 160, 20, 30);
  av.label("|---------------------------  $> A[pivot]$  -------------------------|",  {"top": "120px", "left": "140px"}).css({'font-size': '14px', "text-align": "center"});
  av.label("pivot",  {"top": "154px", "left": "118px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("$n-2$",  {"top": "147px", "left": "290px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$n-2$",  {"top": "147px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 5
  av.umsg(interpret("Slide 5"));
  av.g.rect(140, 240, 360, 30);
  av.g.rect(140, 240, 20, 30);
  av.label("|-------------------------  $> A[pivot]$  -----------------------|",  {"top": "200px", "left": "160px"}).css({'font-size': '14px', "text-align": "center"});
  av.label("pivot",  {"top": "234px", "left": "138px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("$n-3$",  {"top": "227px", "left": "300px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$n-3$",  {"top": "227px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 6
  av.umsg(interpret("Slide 6"));
  av.label("...",  {"top": "240px", "left": "470px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
  av.label("...",  {"top": "240px", "left": "620px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
  av.g.rect(460, 315, 40, 30);
  av.g.rect(460, 315, 20, 30);
  av.label("pivot",  {"top": "309px", "left": "458px"}).css({'font-size': '11px', "text-align": "center"}).addClass('rotated');
  av.label("$1$",  {"top": "302px", "left": "485px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$1$",  {"top": "302px", "left": "620px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 7
  av.umsg(interpret("Slide 7"));
  av.label("|------------------- $n-1$ -------------------|",
  {"top": "180px", "left": "550px"}).css({'font-size': '16px', "text-align": "center"}).addClass("rotated");
  av.step();
  
  // Slide 8
  av.umsg(interpret("Slide 8"));
  av.recorded();
});
