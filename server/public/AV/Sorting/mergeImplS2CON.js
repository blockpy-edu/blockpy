"use strict";
/*global ODSA */
(function ($) {
  var move = function (o, i, h) {
    av.step();
    av.umsg(interpret("av_c1"));
    av.effects.moveValue(arrtemp, i, arr, o);
    arrtemp.unhighlight(i);
    av.step();
    if (o !== 8) {
      av.umsg(interpret("av_c2"));
      arrtemp.highlight(h);
    }
  };

  var av_name = "mergeImplS2CON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;

  var startArray = [4, 8, 11, 25, 30, 2, 3, 17, 20];
  var tempArray = [4, 8, 11, 25, 30, 20, 17, 3, 2];
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
  for (var i = 0; i <= 4; i++) {
    av.effects.moveValue(arr, i, arrtemp, i);
  }
  av.step();
  av.umsg(interpret("av_c4a"));
  av.effects.moveValue(arr, 8, arrtemp, 5);
  av.effects.moveValue(arr, 7, arrtemp, 6);
  av.effects.moveValue(arr, 6, arrtemp, 7);
  av.effects.moveValue(arr, 5, arrtemp, 8);
  av.step();
  av.umsg(interpret("av_c5"));
  arrtemp.highlight(0);
  arrtemp.highlight(8);
  av.step();
  av.umsg(interpret("av_c6"));
  av.step();
  av.umsg(interpret("av_c7"));
  av.effects.moveValue(arrtemp, 8, arr, 0);
  arrtemp.unhighlight(8);
  av.step();
  av.umsg(interpret("av_c8"));
  arrtemp.highlight(7);
  move(1, 7, 6);
  move(2, 0, 1);
  move(3, 1, 2);
  move(4, 2, 3);
  move(5, 6, 5);
  move(6, 5, 4);
  move(7, 3, 9);
  move(8, 4, 4);
  av.recorded();
}(jQuery));
