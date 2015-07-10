/*global ODSA */
'use strict';
// Written by Jun Yang and Cliff Shaffer
//Array-Based list deletion
$(document).ready(function () {
  var arrValues = [13, 12, 20, 8, 3, "", "", ""];
  var itemsSize = 5;
  var av_name = "alistRemoveCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var leftMargin = 5,
      nodeWidth = 30,
      theTop = 35,
      arrow1_x = 22 + nodeWidth;

  var arr = av.ds.array(arrValues, {indexed: true, layout: "array",
                                    left: leftMargin, top: theTop});
  var pseudo = av.code(code);

  //vertical arrow pointing to current position
  var arrow1 = av.g.line(arrow1_x, theTop - 5, arrow1_x, theTop + 15,
                         {"arrow-end": "classic-wide-long",
                          "opacity": 0, "stroke-width": 2});

  //horizontal arrow in step 4
  var arrow2 = av.g.line(arrow1_x + 100, theTop, arrow1_x + 20, theTop,
                         {"arrow-end": "classic-wide-long",
                          "opacity": 0, "stroke-width": 2});

  //label for current position in step 1
  var label = av.label("curr", {before: arr, left: arrow1_x - 10, top: theTop-40});
  label.hide();

  //array "it" for holding the deleted record
  var arrItValues = [""];
  var arrIt = av.ds.array(arrItValues,
                          {indexed: false, layout: "array",
                           left: leftMargin + (nodeWidth + 2) * 3, top: theTop + 70});
  var labelIt = av.label("it", { before: arrIt, left: 85, top: theTop + 75 });
  arrIt.hide();
  labelIt.hide();

  // Slide 1
  arr.addClass([5, 6, 7], "unused");
  av.umsg(interpret("av_c1"));
  arr.highlight([1]);
  label.show();
  arrow1.show();
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  arrIt.show();
  labelIt.show();
  av.effects.copyValue(arr, 1, arrIt, 0);
  arr.value(1, "");
  arr.unhighlight([1]);
  pseudo.setCurrentLine("copy");
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  // shift elements after current position one position to the left
  var i;
  for (i = 2; i < itemsSize; i++) {
    av.effects.copyValue(arr, i, arr, i - 1);
  }
  arr.value(itemsSize - 1, "");
  arrow2.show();
  arr.unhighlight([1]);
  pseudo.setCurrentLine("for");
  pseudo.highlight("forbody");
  arr.highlight([1, 2, 3]);
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  pseudo.setCurrentLine(0);   // Hack until we get multiline set method
  pseudo.unhighlight("forbody");
  pseudo.setCurrentLine("dec");
  arr.unhighlight([1, 2, 3]);
  arr.removeClass([itemsSize - 1], "unused");
  av.umsg(interpret("av_c4"));
  arrow2.hide();
  av.step();

  // Slide 5
  arrIt.highlight([0]);
  arr.addClass([4], "unused");
  pseudo.setCurrentLine("return");
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  pseudo.setCurrentLine(0);
  av.umsg(interpret("av_c6"));
  av.recorded();  //
});
