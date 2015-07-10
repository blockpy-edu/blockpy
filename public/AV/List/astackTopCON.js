/*global ODSA */
"use strict";
// Explain why sets top at position n-1.
$(document).ready(function () {
  var av_name = "astackTopCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);

  // Relative offsets
  var leftMargin = 300;
  var topMargin = 35;

  var arr = av.ds.array([12, 45, 5, 81, "", "", "", ""],
                        {indexed: true, top: topMargin, left: leftMargin});
  var topPointer = av.pointer("top", arr, {targetIndex : 0});

  // Interface for the alternative "top" representation
  var minusOne = av.ds.array(["-1"], {top: topMargin, left: leftMargin - 100});
  minusOne.hide();
  var topLabel = av.label("top", {left: leftMargin - 130, top: topMargin + 5});
  topLabel.hide();

  // Slide 1
  arr.highlight(0);
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  arr.highlight([1, 2, 3]);
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  arr.unhighlight([0, 1, 2]);
  topPointer.target(arr, {targetIndex : 3});
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  arr.value(3, "");
  arr.unhighlight(3);
  topPointer.target(arr, {targetIndex : 2});
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  arr.value(0, "");
  arr.value(1, "");
  arr.value(2, "");
  arr.highlight(0);
  topPointer.target(arr, {targetIndex : 0});
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  arr.unhighlight(0);
  minusOne.show();
  minusOne.highlight();
  topPointer.hide();
  topLabel.show();
  av.umsg(interpret("av_c6"));
  av.recorded();
});
