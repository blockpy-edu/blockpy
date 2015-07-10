/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "binsortS2CON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var maxKeyLength = 15;
  var theArray = [12, 14, 2, 7, 0];
  var emptyLong = [];
  var i, j;
  emptyLong.length = maxKeyLength;
  var emptyShort = [];
  emptyShort.length = theArray.length;
  ODSA.UTILS.permute(theArray);
  var av = new JSAV(av_name);

  // Create an array object under control of JSAV library
  var arrA = av.ds.array(theArray, {indexed: true});
  var labelA = av.label("A", {before: arrA, left: 325, top: -7});
  var arrB = av.ds.array(emptyLong, {indexed: true});
  var labelB = av.label("B", {before: arrB, left: 170, top: 69});
  var arrOut = av.ds.array(emptyShort, {indexed: true});
  var labelOut = av.label("Output", {before: arrOut, left: 280, top: 145});
  av.umsg(interpret("av_c1"));
  av.displayInit();
  for (i = 0; i < theArray.length; i++) {
    if (i !== 0) { arrA.unhighlight(i - 1); }
    av.umsg(interpret("av_c2") + arrA.value(i) + interpret("av_c3") + i +
            interpret("av_c4")  + arrA.value(i) + interpret("av_c5"));
    av.effects.moveValue(arrA, i, arrB, arrA.value(i));
    av.step();
  }
  av.umsg("Now that they are in order, we move the values to the output array.");
  for (i = 0, j = 0; i < maxKeyLength; i++) {
    av.step();
    arrB.highlight(i);
    if (i !== 0) { arrB.unhighlight(i - 1); }
    if (arrB.value(i) !== "") {
      av.effects.moveValue(arrB, i, arrOut, j);
      j++;
      av.umsg(interpret("av_c2") + arrB.value(i) + interpret("av_c3") + i +
              interpret("av_c6")  + arrA.value(i) + interpret("av_c7"));
    } else {
      av.umsg(interpret("av_c8") + i);
    }
  }
  av.step();

  av.umsg(interpret("av_c9"));
  av.recorded();
});
