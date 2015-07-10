/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "insertionsortS1CON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var theArray1 = [20, 10, 15, 54, 55, 11, 78, 14];
  var av = new JSAV(av_name);
  var arr = av.ds.array(theArray1, {indexed: true});

  // Slide 1
  arr.highlight(1);
  arr.addClass([2, 3, 4, 5, 6, 7], "greytext");
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  arr.swap(0, 1);
  arr.unhighlight(1).highlight(0);
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  arr.unhighlight(0);
  av.recorded();
});
