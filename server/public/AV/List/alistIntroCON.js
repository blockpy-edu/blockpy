/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
//Array-Based list introduction
$(document).ready(function () {
  var arrValues = [13, 12, 20, 8, 3, "", "", ""];
  var av_name = "alistIntroCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name);
  var arr = av.ds.array(arrValues, {indexed: true, layout: "array"});

  // Slide 1
  arr.addClass([5, 6, 7], "unused");
  av.umsg(interpret("av_c1"));
  arr.highlight([0, 1, 2, 3, 4]);
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  arr.unhighlight([0, 1, 2, 4]);
  arr.highlight(3);
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  arr.unhighlight(3);
  arr.highlight(0);
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  arr.unhighlight(0);
  av.step();

  // Slide 5
  av.umsg(interpret("av_c5"));
  av.recorded();
});
