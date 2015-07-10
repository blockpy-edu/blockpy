"use strict";

(function ($) {
  var av = new JSAV("freelistCON", {"animationMode": "none"});
  var l = av.g.line(0, 30, 470, 30);
  var l2 = av.g.line(0, 80, 470, 80);
  
  var rect1 = av.g.rect(20, 30, 60, 50).css({"fill": "lightgray"});
  var rect2 = av.g.rect(80, 30, 70, 50).css({"fill": "white"});
  var rect3 = av.g.rect(150, 30, 100, 50).css({"fill": "lightgray"});
  var rect4 = av.g.rect(250, 30, 50, 50).css({"fill": "white"});
  var rect5 = av.g.rect(300, 30, 80, 50).css({"fill": "lightgray"});
  var rect6 = av.g.rect(380, 30, 40, 50).css({"fill": "white"});
  var rect7 = av.g.rect(420, 30, 30, 50).css({"fill": "lightgray"});
  
}(jQuery));
  
(function ($) {
  var av2 = new JSAV("fragCON", {"animationMode": "none"});
  var l = av2.g.line(0, 30, 470, 30);
  var l2 = av2.g.line(0, 80, 470, 80);
  
  var rect1 = av2.g.rect(20, 30, 60, 50).css({"fill": "lightgray"});
  var rect2 = av2.g.rect(80, 30, 20, 50).css({"fill": "white"});
  var rect3 = av2.g.rect(100, 30, 90, 50).css({"fill": "lightgray"});
  var rect4 = av2.g.rect(190, 30, 60, 50).css({"fill": "white"});
  var rect5 = av2.g.rect(250, 30, 70, 50).css({"fill": "lightgray"});
  var rect6 = av2.g.rect(320, 30, 20, 50).css({"fill": "lightgray"});
  var rect7 = av2.g.rect(340, 30, 60, 50).css({"fill": "white"});
  var rect8 = av2.g.rect(400, 30, 30, 50).css({"fill": "lightgray"});
  
  //var point = av2.pointer(xFrag, rect2);
  var xFragLabel = av2.label("Small block: External Fragmentation", {left :  110, top:  0});
  var xFragArrow = av2.g.line(105,  10,  90, 28, {'arrow-end': 'classic-wide-long', 'stroke-width' : 2});
  var inFragLabel = av2.label("Unused space in allocated block: Internal fragmentation", {left :  20, top:  100});
  var inFragArrow = av2.g.line(315, 100,  330, 82, {'arrow-end': 'classic-wide-long', 'stroke-width' : 2});
  
}(jQuery));
  