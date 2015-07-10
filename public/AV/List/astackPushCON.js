/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Astack push method
$(document).ready(function () {
  var av_name = "astackPushCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);
  var arr = av.ds.array([12, 45, 5, 81, "", "", "", ""],
                        {indexed: true, top: 35, left: 20});
  var topPointer = av.pointer("top", arr, {targetIndex : 4});
  topPointer.hide();

  // The purpose of this "array" is only to hold a value,
  // it will always remain hidden.
  // In slide 3, we will get the effect of moving a value into the array,
  // which comes out of this dummy array.
  var arrCopy = av.ds.array([10]);
  arrCopy.hide();

  // Slide 1
  av.umsg(interpret("av_c1"));
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  topPointer.show();
  arr.highlight(4);
  pseudo.setCurrentLine("full");
  av.step();

  // Slide 3
  pseudo.setCurrentLine("copy");
  av.umsg(interpret("av_c3"));
  av.effects.copyValue(arrCopy, 0, arr, 4);
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  topPointer.target(arr, {targetIndex : 5});
  arr.unhighlight(4);
  arr.highlight(5);
  av.recorded();
});
