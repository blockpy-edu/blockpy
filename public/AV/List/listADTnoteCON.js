/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
//listADT insertion
$(document).ready(function () {
  var av_name = "listADTnoteCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var jsav = new JSAV(av_name);
  var arrPositions = ["<", 20, ",", 23, "|", 12, ",", 15, ">", "", "", "", ""];
  var length = arrPositions.length;
  var curr = 4;

  //Hidden jsav array for copyValue animation
  var temp = [ "10", "|", "17" ];
  var arr1 = jsav.ds.array(temp, {indexed: false, layout: "array"}).hide();

  //jsav array object of the sildeshow
  var arr = jsav.ds.array(arrPositions, {indexed: false, layout: 'array'});
  arr.css({ top: 10 });

  // Slide 1
  jsav.umsg(interpret("av_c1"));
  jsav.displayInit();

  // Slide 2
  jsav.umsg(interpret("av_c2"));
  jsav.step();

  // Slide 3
  var i;
  for (i = length - 3; i > curr; i--) {
    jsav.effects.copyValue(arr, i, arr, i + 2);
  }
  jsav.effects.copyValue(arr1, 0, arr, curr + 1);
  arr.value(curr + 2, ",");
  jsav.umsg(interpret("av_c3"));
  arr.css([5], {color: "red"});
  jsav.step();

  // Slide 4
  //  jsav.effects.copyValue(arr1, 1, arr, 10);
  arr.value(4, ",");
  arr.value(10, "|");
  arr.value(11, ">");
  arr.css([5], {color: "black"});
  jsav.umsg(interpret("av_c4"));
  jsav.step();

  // Slide 5
  jsav.effects.copyValue(arr, 11, arr, 12);
  jsav.effects.copyValue(arr1, 2, arr, 11);
  jsav.umsg(interpret("av_c5"));
  arr.css([11], {color: "red"});
  jsav.step();

  // Slide 6
  jsav.umsg(interpret("av_c6"));
  jsav.step();
  jsav.recorded();
});
