/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "mergesortCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var blockWidth = 32;  // Width of an array element
  var leftArray = [4, 8, 11, 25, 30];
  var rightArray = [2, 3, 17, 20];
  var empty = [];
  empty.length = 9;
  var av = new JSAV(av_name);

  // Calculate leftoffset: use width of the container to find center,
  // then subtract half of the 9-element-long array width
  var left_offset = ($("#mergesortCON").width() - blockWidth * 9) / 2;

  var move = function (a, o, i) {
    av.step();
    av.umsg(interpret("av_c1"));
    av.effects.moveValue(a, i, answerarr, o);
    a.unhighlight(i);
    av.step();
    av.umsg(interpret("av_c2"));
    a.highlight(i + 1);
  };

  var answerarr = av.ds.array(empty,   // let this auto-center
                             {indexed: true, center: true, layout: "array"});
  // position the left array relative to the answer array
  var leftarr = av.ds.array(leftArray,
                            {indexed: true, center: false, layout: "array",
                             left: left_offset - (blockWidth / 2), top: 75,
				myAnchor: "left top", anchor: "left bottom"});
  var rightarr = av.ds.array(rightArray,
                             {indexed: true, center: false, layout: "array",
                              left: left_offset + blockWidth * 5.5, top: 75,
                              myAnchor: "left top", anchor: "left bottom"});
  // Slide 1
  av.umsg(interpret("av_c3"));
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c4"));
  leftarr.highlight(0);
  rightarr.highlight(0);
  av.step();

  // Slide 3
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 4
  av.umsg(interpret("av_c6"));
  av.effects.moveValue(rightarr, 0, answerarr, 0);
  rightarr.unhighlight(0);
  av.step();

  // Slide 5
  av.umsg(interpret("av_c7"));
  rightarr.highlight(1);
  move(rightarr, 1, 1);
  move(leftarr, 2, 0);
  move(leftarr, 3, 1);
  move(leftarr, 4, 2);
  move(rightarr, 5, 2);
  move(rightarr, 6, 3);
  move(leftarr, 7, 3);
  move(leftarr, 8, 4);
  av.recorded();
});
