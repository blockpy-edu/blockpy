/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Astack pop method
$(document).ready(function () {
  var av_name = "astackPopCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  // Relative offsets
  var leftMargin = 20;
  var topMargin = 35;
  var arr = av.ds.array([12, 45, 5, 81, "", "", "", ""],
                        {indexed: true, top: topMargin, left: leftMargin});
  var topPointer = av.pointer("top", arr, {targetIndex : 4});
  var arrReturn = av.ds.array([""], {top : topMargin + 60,
                                     left: leftMargin + 100});
  arrReturn.hide();
  var labelReturn = av.label("return", {top : topMargin + 65,
                                        left: leftMargin + 50});
  labelReturn.hide();

  // Slide 1
  av.umsg(interpret("av_c1"));
  arr.highlight(4);
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  pseudo.setCurrentLine("empty");
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  arr.unhighlight(4);
  arr.highlight(3);
  topPointer.target(arr, {targetIndex : 3});
  pseudo.setCurrentLine("return");
  av.step();

  // Slide 4
  arrReturn.show();
  labelReturn.show();
  av.effects.copyValue(arr, 3, arrReturn, 0);
  arrReturn.highlight();
  av.umsg(interpret("av_c4"));
  arr.value(3, "");
  av.recorded();
});
