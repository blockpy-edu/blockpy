// Array-based circular queue
(function ($) {
  var jsav = new JSAV("aqueueCircularCON");

  // center coordinate
  var cx = 400, cy = 130;
  // radius
  var r1 = 50, r2 = 100;
  var fx = cx, fy = cy - r2 - 15;
  var tx = cx + r2 + 15, ty = cy;
  var fx1 = fx + 70, ty2 = ty - 70;
  var path = "M" + fx + "," + fy;
  path += " C" + fx1 + "," + fy;
  path += " " + tx + "," + ty2;
  path += " " + tx + "," + ty;
  var curve = jsav.g.path(path, {"stroke-width" : 2, "arrow-end" : "classic-wide-long"});
  var cir = jsav.circular(cx, cy, r1, r2, {"stroke-width" : 2});
  curve.hide();
  jsav.umsg("The \"drifting queue\" problem can be solved by pretending that the array is circular and so allow the queue to continue directly from the highest-numbered position in the array to the lowest-numbered position.");
  jsav.displayInit();
  jsav.umsg(" This is easily implemented through use of the modulus operator (denoted by % in many programming languages). In this way, positions in the array are numbered from 0 through size-1, and position size-1 is defined to immediately precede position 0.");
  jsav.step();
  jsav.umsg("The circular queue with array positions increasing in the clockwise direction.");
  curve.show();
  jsav.step();
  curve.hide();
  cir.value(8, "20");
  cir.value(9, "5");
  cir.value(10, "12");
  cir.value(11, "17");
  var frontP = cir.pointer("front", 8);
  var rearP = cir.pointer("rear", 11);
  jsav.umsg("A queue with the four numbers 20, 5, 12, and 17 enqueued.");
  jsav.step();
  cir.value(8, " ");
  cir.value(9, " ");
  cir.value(0, "3");
  cir.value(1, "30");
  cir.value(2, "4");
  cir.value(10, "12");
  cir.value(11, "17");
  frontP.arrow.hide();
  frontP.label.hide();
  rearP.arrow.hide();
  rearP.label.hide();
  cir.pointer("front", 10);
  cir.pointer("rear", 2);
  jsav.umsg("The queue after elements 20 and 5 are dequeued, following which 3, 30, and 4 are enqueued.");
  jsav.step();
  jsav.recorded();
}(jQuery));
