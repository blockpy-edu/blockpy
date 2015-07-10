/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Array-Based list insertion
$(document).ready(function () {
  var av_name = "alistInsertCON";
  var arrValues = [13, 12, 20, 8, 3, "", "", ""];
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({'av_name': av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var leftMargin = 10;
  var arr = av.ds.array(arrValues, {indexed: true, layout: "array",
                                    left: leftMargin}).hide();
  var pseudo = av.code(code);

  // Vertical arrow in step 1
  var arrow1_x = leftMargin + 15;
  var arrow1 = av.g.line(arrow1_x, -15, arrow1_x, 15,
                         {"arrow-end": "classic-wide-long",
                          "opacity": 100, "stroke-width": 2 });
  arrow1.hide();

  // Label in step 1
  var label = av.label("Insert 23", {before: arr, left: arrow1_x - 16,
                                     top: -40 }).hide();

  //horizontal arrow in step 2
  var arrow2 = av.g.line(leftMargin + 50, 5, leftMargin + 150, 5,
                         {"arrow-end": "classic-wide-long", "opacity": 0,
                          "stroke-width": 2});
  arrow2.hide();

  // Create the graphics for maxSize and listSize variables
  var arrMS = av.ds.array([8], {indexed: false, layout: "array",
                                left: 100, top: 70});
  arrMS.hide();
  var labelMaxSize = av.label("maxSize", {before: arrMS, left: 33, top: 74});
  labelMaxSize.hide();
  var arrLS = av.ds.array([5], {indexed: false, layout: "array",
                                left: 100, top: 105});
  arrLS.hide();
  var labelListSize = av.label("listSize",
                               {before: arrLS, left: 42, top: 109 });
  labelListSize.hide();

  // Slide 1: set the background of empty elements to gray
  arr.addClass([5, 6, 7], "unused");
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  arr.show();
  arrow1.show();
  label.show();
  av.umsg(interpret("av_c2"));
  pseudo.setCurrentLine("sig");
  arrMS.show();
  labelMaxSize.show();
  arrLS.show();
  labelListSize.show();
  av.step();

  // Slide 3
  // shift all existing elements one position to the right
  var temp, i;
  for (i = arr.size(); i >= 0; i--) {
    if (i < arr.size() - 1) {
      av.effects.copyValue(arr, i, arr, i + 1);
    }
  }
  arr.removeClass([5], "unused");
  arr.value(0, "");
  arrow1.hide();
  arrow2.show();
  label.hide();
  pseudo.setCurrentLine("for");
  pseudo.highlight("forbody");
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  arr.value(0, 23);
  arr.highlight([0]);
  arrow2.hide();
  pseudo.setCurrentLine(0);      // Hack until we get multi-line method
  pseudo.unhighlight("forbody");
  pseudo.setCurrentLine("insert");
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  pseudo.setCurrentLine("incr");
  arr.unhighlight([0]);
  arrLS.highlight(0);
  arrLS.value(0, 6);
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  pseudo.setCurrentLine(0);
  av.umsg(interpret("av_c6"));
  av.recorded();
});
