/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "insertionsortS3CON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var theArray3 =  [10, 15, 20, 54, 55, 11, 78, 14];
  var av = new JSAV(av_name);
  var arr = av.ds.array(theArray3, {indexed: true});

  // Slide 1
  arr.highlight(3);
  arr.addClass([4, 5, 6, 7], "greytext");
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  arr.highlightBlue(2);
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  arr.unhighlightBlue(2);
  arr.unhighlight(3);
  av.recorded();
});
