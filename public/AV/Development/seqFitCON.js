"use strict";

(function ($) {
  var av = new JSAV("seqFitCON", {"animationMode": "none"});
  var l = av.g.line(10, 30, 490, 30);
  var l2 = av.g.line(10, 80, 490, 80);
  
  var rect1 = av.g.rect(35, 30, 60, 50).css({"fill": "lightgray"});
  var rect2 = av.g.rect(95, 30, 70, 50).css({"fill": "white"});
  var rect3 = av.g.rect(165, 30, 100, 50).css({"fill": "lightgray"});
  var rect4 = av.g.rect(265, 30, 50, 50).css({"fill": "white"});
  var rect5 = av.g.rect(315, 30, 80, 50).css({"fill": "lightgray"});
  var rect6 = av.g.rect(395, 30, 40, 50).css({"fill": "white"});
  var rect7 = av.g.rect(435, 30, 30, 50).css({"fill": "lightgray"});

  var polyline1 = av.g.polyline([[20, 40], [20, 20], [5, 20]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline2 = av.g.polyline([[5, 90], [20, 90], [20, 65]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline3 = av.g.polyline([[105, 40], [105, 20], [27, 20], [27, 40]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline4 = av.g.polyline([[27, 65], [27, 90], [105, 90], [105, 65]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline5 = av.g.polyline([[275, 40], [275, 20], [155, 20], [155, 40]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline6 = av.g.polyline([[155, 65], [155, 90], [275, 90], [275, 65]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline7 = av.g.polyline([[405, 40], [405, 20], [305, 20], [305, 40]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline8 = av.g.polyline([[305, 65], [305, 90], [405, 90], [405, 65]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline9 = av.g.polyline([[475, 40], [475, 20], [425, 20], [425, 40]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline10 = av.g.polyline([[425, 65], [425, 90], [475, 90], [475, 65]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline11 = av.g.polyline([[497, 20], [482, 20], [482, 40]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  var polyline12 = av.g.polyline([[482, 65], [482, 90], [497, 90]], {'arrow-end': 'classic-wide-long', 'stroke-width': 1.5});
  
}(jQuery));