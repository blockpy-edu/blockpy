/*global ODSA */
"use strict";
// Heap remove any slideshow
$(document).ready(function () {
  var sortArray2 = [88, 85, 83, 72, 73, 42, 57, 6, 48, 60];
  var av_name = "heapremoveCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);
  var bh = av.ds.binheap(sortArray2,
                         {compare: function (a, b) { return b - a; },
                          steps: false, heapify: false});

  // Slide 1
  av.umsg(interpret("av_c1"));
  bh.addClass(1, "processing");
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  bh.swap(1, 9);
  bh.removeClass(1, "processing");
  bh.addClass(9, "processing");
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  bh.removeClass(9, "processing");
  bh.addClass(9, "unused");
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  bh.addClass(1, "processing");
  av.step();

  // Slide 5
  av.umsg(interpret("av_c5"));
  bh.swap(1, 4);
  bh.removeClass(1, "processing");
  bh.addClass(4, "processing");
  av.step();

  // Slide 6
  av.umsg(interpret("av_c6"));
  bh.removeClass(4, "processing");
  av.recorded();
});
