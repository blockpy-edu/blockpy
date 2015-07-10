/*global ODSA */
"use strict";
// Heapbuild slideshow
$(document).ready(function () {
  var unsortArray = [1, 2, 3, 4, 5, 6, 7];
  var av_name = "heapbuildCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);
  var bh = av.ds.binheap(unsortArray,
                         {compare: function (a, b) { return b - a; },
                          steps: false, heapify: false});

  // Slide 1
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  bh.addClass(2, "processing");
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  bh.swap(6, 2);
  bh.removeClass(2, "processing");
  bh.addClass(6, "processing");
  av.step();

  // Slide 5
  bh.removeClass(6, "processing");
  bh.addClass(1, "processing");
  av.umsg("3 is done. Now let's do the node with value 2.");
  av.step();

  // Slide 6
  av.umsg(interpret("av_c4"));
  bh.swap(4, 1);
  bh.removeClass(1, "processing");
  bh.addClass(4, "processing");
  av.step();

  // Slide 7
  av.umsg(interpret("av_c7"));
  bh.removeClass(4, "processing");
  bh.addClass(0, "processing");
  av.step();

  // Slide 8
  av.umsg(interpret("av_c4"));
  bh.swap(2, 0);
  bh.removeClass(0, "processing");
  bh.addClass(2, "processing");
  av.step();

  // Slide 9
  av.umsg(interpret("av_c4"));
  bh.swap(5, 2);
  bh.removeClass(2, "processing");
  bh.addClass(5, "processing");
  av.step();

  // Slide 10
  av.umsg(interpret("av_c10"));
  bh.removeClass(5, "processing");
  av.recorded();
});
