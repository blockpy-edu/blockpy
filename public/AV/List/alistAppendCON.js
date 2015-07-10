/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Array-based list append
$(document).ready(function () {
  var arrValues = [13, 12, 20, 8, 3, "", "", ""];
  var av_name = "alistAppendCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);
  var arr = av.ds.array(arrValues, { indexed: true, layout: "array",
                                     top: 12, left: 10 });

  var arrow1 = av.g.line(180, 3, 180, 28,
                         {"arrow-end": "classic-wide-long",
                          "opacity": 100, "stroke-width": 2});
  arrow1.hide();
  var label = av.label("Append 23", {before: arr,
                                     left: 140, top: -35}).hide();

  var arrMS = av.ds.array([8], {indexed: false, layout: "array",
                                left: 100, top: 70});
  var labelMaxSize = av.label("maxSize", {before: arrMS,
                                          left: 33, top: 74});

  var arrLS = av.ds.array([5], {indexed: false, layout: "array",
                                left: 100, top: 105});
  var labelListSize = av.label("listSize", {before: arrLS,
                                            left: 42, top: 109});

  // Slide 1
  arr.addClass([5, 6, 7], "unused");
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  arrow1.show();
  label.show();
  pseudo.setCurrentLine("sig");
  av.umsg(interpret("av_c2"));
  arr.highlight(5);
  arrMS.show();
  labelMaxSize.show();
  arrLS.show();
  labelListSize.show();
  av.step();

  // Slide 3
  pseudo.setCurrentLine("check");
  av.umsg(interpret("av_c3"));
  arrMS.highlight(0);
  arrLS.highlight(0);
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  pseudo.setCurrentLine("assign");
  arrLS.value(0, 6);
  arrMS.unhighlight(0);
  arr.value(5, "23");
  av.step();

  // Slide 5
  av.umsg(interpret("av_c5"));
  arr.unhighlight(5);
  arr.removeClass([5], "unused");
  arrLS.unhighlight(0);
  pseudo.setCurrentLine(0);
  av.recorded();
});
