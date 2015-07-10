/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "bubblesortS2CON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var theArray2 =  [10, 15, 20, 54, 11, 55, 14, 78];
  var av = new JSAV(av_name);
  var arr = av.ds.array(theArray2, {indexed: true});
  var j;

  av.umsg(interpret("av_c1"));
  arr.addClass(arr.size() - 1, "greytext");
  av.displayInit();
  arr.addClass(0, "processing");
  for (j = 1; j < arr.size() - 1; j++) {
    arr.addClass(j, "processing");
    av.umsg(interpret("av_c2"));
    av.step();
    if (arr.value(j - 1) > arr.value(j)) {
      av.umsg(interpret("av_c3"));
      arr.swap(j - 1, j);
      av.step();
    }
    arr.removeClass(j - 1, "processing");
  }
  arr.removeClass(j - 1, "processing");
  arr.addClass(j - 1, "greytext");
  av.umsg(interpret("av_c4"));
  av.recorded();
});
