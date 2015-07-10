/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "insertionsortS2CON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var theArray2 =  [10, 20, 15, 54, 55, 11, 78, 14];
  var av = new JSAV(av_name);
  var arr = av.ds.array(theArray2, {indexed: true});

  // Slide 1
  arr.highlight(2);
  arr.addClass([3, 4, 5, 6, 7], "greytext");
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  arr.highlightBlue(1);
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  arr.swap(1, 2);
  arr.highlight(1).unhighlight(2);
  av.umsg(interpret("av_c3"));
  arr.unhighlightBlue(2);
  av.step();

  // Slide 4
  arr.highlightBlue(0);
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  av.umsg(interpret("av_c4"));
  arr.unhighlight(1);
  arr.unhighlightBlue([0, 1]);
  av.recorded();
});
