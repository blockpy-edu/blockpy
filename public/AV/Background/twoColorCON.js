"use strict";
// Written by Cliff Shaffer
$(document).ready(function () {
  var av = new JSAV("twoColorCON", {animationMode: "none"});

  av.g.polyline([[60, 30], [110, 80], [30, 80]], {fill: "gray"});
  av.g.polyline([[110, 80], [240, 80], [175, 145]], {fill: "gray"});
  av.g.polyline([[240, 80], [330, 80], [290, 30]], {fill: "gray"});
  av.g.polyline([[175, 145], [230, 200], [120, 200]], {fill: "gray"});

  av.g.line(50, 20, 250, 220, {"stroke-width": 2});
  av.g.line(0, 80, 350, 80, {"stroke-width": 2});
  av.g.line(300, 20, 100, 220, {"stroke-width": 2});
});
