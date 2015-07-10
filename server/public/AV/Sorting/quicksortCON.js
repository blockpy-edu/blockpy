"use strict";
/*global ODSA */
$(document).ready(function () {
  var av_name = "quicksortCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var theArray = [76, 6, 57, 88, 85, 42, 83, 73, 48, 60];
  var av = new JSAV(av_name);
  // Create an array object under control of JSAV library
  var arr = av.ds.array(theArray, {indexed: true});

  // Slide 1
  av.umsg(interpret("av_c1"));
  arr.addClass(9, "processing");
  av.displayInit();

  // Slide 2
  arr.removeClass(9, "processing");
  arr.setLeftArrow(0);
  arr.setRightArrow(8);
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  arr.swap(0, 8);
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  av.umsg(interpret("av_c6"));
  av.step();

  // Slide 7
  av.umsg(interpret("av_c7"));
  arr.clearLeftArrow(0);
  arr.setLeftArrow(1);
  av.step();

  // Slide 8
  av.umsg(interpret("av_c7"));
  arr.clearLeftArrow(1);
  arr.setLeftArrow(2);
  av.step();

  // Slide 9
  arr.clearLeftArrow(2);
  arr.setLeftArrow(3);
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 10
  av.umsg(interpret("av_c9"));
  av.step();

  // Slide 11
  av.umsg(interpret("av_c7"));
  arr.clearRightArrow(8);
  arr.setRightArrow(7);
  av.step();

  // Slide 12
  av.umsg(interpret("av_c7"));
  arr.clearRightArrow(7);
  arr.setRightArrow(6);
  av.step();

  // Slide 13
  arr.clearRightArrow(6);
  arr.setRightArrow(5);
  av.umsg(interpret("av_c10"));
  av.step();

  // Slide 14
  av.umsg(interpret("av_c11"));
  arr.swap(3, 5);
  av.step();

  // Slide 15
  av.umsg(interpret("av_c12"));
  av.step();

  // Slide 16
  arr.clearLeftArrow(3);
  arr.setLeftArrow(4);
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 17
  av.umsg(interpret("av_c14"));
  av.step();

  // Slide 18
  av.umsg(interpret("av_c7"));
  arr.clearRightArrow(5);
  arr.setRightArrow(4);
  av.step();

  // Slide 19
  arr.clearRightArrow(4);
  arr.setRightArrow(3);
  av.umsg(interpret("av_c15"));
  av.step();

  // Slide 20
  av.umsg(interpret("av_c16"));
  av.recorded();
});
