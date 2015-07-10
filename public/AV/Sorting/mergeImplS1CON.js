/*global ODSA */
"use strict";
$(document).ready(function () {
  var move = function (o, i) {
    av.step();
    av.umsg(interpret("av_c1"));
    av.effects.moveValue(arrtemp, i, arr, o);
    arrtemp.unhighlight(i);
    av.step();
    if (o !== 8) {
      av.umsg(interpret("av_c2"));
      arrtemp.highlight(i + 1);
    }
  };

  var av_name = "mergeImplS1CON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var startArray = [4, 8, 11, 25, 30, 2, 3, 17, 20];
  var empty = [];
  empty.length = 9;
  var av = new JSAV(av_name);

  var arr = av.ds.array(startArray,
                        {indexed: true, center: true, layout: "array"});
  var arrtemp = av.ds.array(empty,
                            {indexed: true, center: true, layout: "array"});
  av.umsg(interpret("av_c3"));
  av.displayInit();
  av.umsg(interpret("av_c4"));
  for (var i = 0; i < empty.length; i++) {
    av.effects.moveValue(arr, i, arrtemp, i);
  }
  av.step();
  av.umsg(interpret("av_c5"));
  arrtemp.highlight(0);
  arrtemp.highlight(5);
  av.step();
  av.umsg(interpret("av_c6"));
  av.step();
  av.umsg(interpret("av_c7"));
  av.effects.moveValue(arrtemp, 5, arr, 0);
  arrtemp.unhighlight(5);
  av.step();
  av.umsg(interpret("av_c8"));
  arrtemp.highlight(6);
  move(1, 6);
  move(2, 0);
  move(3, 1);
  move(4, 2);
  move(5, 7);
  move(6, 8);
  move(7, 3);
  move(8, 4);
  av.recorded();
});
