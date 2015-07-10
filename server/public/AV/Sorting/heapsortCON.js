/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "heapsortCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var startArray = [73, 6, 57, 88, 60, 42, 83, 72, 48, 85];
  var av = new JSAV(av_name);
  var bh = av.ds.binheap(startArray,
                 {compare: function (a, b) { return b - a; }, // maxheap
                  steps: false, heapify: false});

  // Slide 1
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  for (var i = Math.floor(bh.size() / 2); i > 0; i--) {
    // make it a max heap
    bh.heapify(i, {noAnimation: true, steps: false});
  }
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  av.umsg(interpret("av_c5"));
  bh.swap(0, 9);
  av.step();

  // Slide 6
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 7
  av.umsg(interpret("av_c7"));
  av.step();

  // Slide 8
  bh.swap(0, 1);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 9
  bh.swap(1, 4);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 10
  av.umsg(interpret("av_c10"));
  av.step();

  // Slide 11
  av.umsg(interpret("av_c11"));
  bh.swap(0, 8);
  av.step();

  // Slide 12
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 13
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 14
  bh.swap(0, 2);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 15
  bh.swap(2, 6);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 16
  av.umsg(interpret("av_c16"));
  av.step();

  // Slide 17
  av.umsg(interpret("av_c11"));
  bh.swap(0, 7);
  av.step();

  // Slide 18
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 19
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 20
  bh.swap(0, 1);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 21
  bh.swap(1, 3);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 22
  av.umsg(interpret("av_c16"));
  av.step();

  // Slide 23
  av.umsg(interpret("av_c11"));
  bh.swap(0, 6);
  av.step();

  // Slide 24
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 25
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 26
  bh.swap(0, 1);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 27
  bh.swap(1, 4);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 28
  av.umsg(interpret("av_c16"));
  av.step();

  // Slide 29
  av.umsg(interpret("av_c11"));
  bh.swap(0, 5);
  av.step();

  // Slide 30
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 31
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 32
  bh.swap(0, 1);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 33
  bh.swap(1, 4);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 34
  av.umsg(interpret("av_c16"));
  av.step();

  // Slide 35
  av.umsg(interpret("av_c11"));
  bh.swap(0, 4);
  av.step();

  // Slide 36
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 37
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 38
  bh.swap(0, 2);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 39
  av.umsg(interpret("av_c16"));
  av.step();

  // Slide 40
  av.umsg(interpret("av_c11"));
  bh.swap(0, 3);
  av.step();

  // Slide 41
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 42
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 43
  bh.swap(0, 1);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 44
  av.umsg(interpret("av_c16"));
  av.step();

  // Slide 45
  av.umsg(interpret("av_c11"));
  bh.swap(0, 2);
  av.step();

  // Slide 46
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 47
  av.umsg(interpret("av_c47"));
  av.step();

  // Slide 48
  av.umsg(interpret("av_c16"));
  av.step();

  // Slide 49
  av.umsg(interpret("av_c11"));
  bh.swap(0, 1);
  av.step();

  // Slide 50
  bh.heapsize(bh.heapsize() - 1);
  av.umsg(interpret("av_c6"));
  bh.addClass(bh.heapsize(), "unused");
  av.step();

  // Slide 51
  av.umsg(interpret("av_c51"));
  bh.heapsize(bh.heapsize() - 1);
  bh.addClass(bh.heapsize(), "unused");
  av.recorded();
});
