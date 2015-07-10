/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Quick Sort Best Case
$(document).ready(function () {
  var av_name = "QuickSortBestCaseCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;      // get the interpreter
  var av = new JSAV(av_name);
  
  // Slide 1
  av.umsg(interpret("Slide 1"));
  av.displayInit();
  
  // Slide 2
  av.umsg(interpret("Slide 2"));
  av.g.rect(100, 0, 400, 30);
  av.label("$n$",  {"top": "-18px", "left": "300px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 3
  av.umsg(interpret("Slide 3"));
  av.g.rect(100, 80, 400, 30);
  av.g.rect(290, 80, 10, 30);
  av.label("|--------  $< A[pivot]$  --------|",  {"top": "35px", "left": "105px"}).css({'font-size': '1em', "text-align": "center"});
  av.label("|---------  $> A[pivot]$  ---------|",  {"top": "35px", "left": "310px"}).css({'font-size': '1em', "text-align": "center"});
  av.label("pivot",  {"top": "75px", "left": "281px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("$\\frac{n}{2}$",  {"top": "62px", "left": "190px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{2}$",  {"top": "62px", "left": "390px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\theta(n)$",  {"top": "62px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 4
  av.umsg(interpret("Slide 4"));
  av.g.rect(80, 160, 200, 30);
  av.g.rect(320, 160, 200, 30);
  av.g.rect(175, 160, 10, 30);
  av.g.rect(415, 160, 10, 30);
  av.label("pivot",  {"top": "155px", "left": "166px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("pivot",  {"top": "155px", "left": "406px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("$\\frac{n}{4}$",  {"top": "142px", "left": "120px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{4}$",  {"top": "142px", "left": "220px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{4}$",  {"top": "142px", "left": "360px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{4}$",  {"top": "142px", "left": "460px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\theta(n)$",  {"top": "142px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 5
  av.umsg(interpret("Slide 5"));
  av.g.rect(60, 240, 100, 30);
  av.g.rect(180, 240, 100, 30);
  av.g.rect(320, 240, 100, 30);
  av.g.rect(440, 240, 100, 30);
  av.g.rect(105, 240, 10, 30);
  av.g.rect(225, 240, 10, 30);
  av.g.rect(365, 240, 10, 30);
  av.g.rect(485, 240, 10, 30);
  av.label("pivot",  {"top": "235px", "left": "96px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("pivot",  {"top": "235px", "left": "216px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("pivot",  {"top": "235px", "left": "356px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("pivot",  {"top": "235px", "left": "476px"}).css({'font-size': '11px', "text-align": "center"}).addClass("rotated");
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "75px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "130px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "195px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "250px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "330px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "390px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "450px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\frac{n}{8}$",  {"top": "222px", "left": "510px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\theta(n)$",  {"top": "222px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 6
  av.umsg(interpret("Slide 6"));
  av.label("...",  {"top": "235px", "left": "105px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
  av.label("...",  {"top": "235px", "left": "225px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
  av.label("...",  {"top": "235px", "left": "365px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
  av.label("...",  {"top": "235px", "left": "485px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
  av.label("...",  {"top": "235px", "left": "610px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
  av.g.rect(40, 320, 30, 30);
  av.g.rect(80, 320, 30, 30);
  av.label(".....................................",  {"top": "270px", "left": "120px"}).css({'font-size': '32px', "text-align": "center"});
  av.g.rect(500, 320, 30, 30);
  av.g.rect(540, 320, 30, 30);
  av.label("$1$",  {"top": "302px", "left": "50px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$1$",  {"top": "302px", "left": "90px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$1$",  {"top": "302px", "left": "510px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$1$",  {"top": "302px", "left": "550px"}).css({'font-size': '18px', "text-align": "center"});
  av.label("$\\theta(n)$",  {"top": "302px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
  av.step();
  
  // Slide 7
  av.umsg(interpret("Slide 7"));
  av.label("|------------------ $\\log{n}$------------------|",
  {"top": "195px", "left": "550px"}).css({'font-size': '16px', "text-align": "center"}).addClass("rotated");
  av.recorded();
});
