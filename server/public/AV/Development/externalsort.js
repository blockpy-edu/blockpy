"use strict";

(function ($) {
  var av = new JSAV("externalSortOver", {"animationMode": "none"});

  // Draw the objects
  var height = 100;
  var widthoffset = 100;
  var lineheight = height - 25;

  av.g.circle(55, height - 25, 30, 30);
  av.g.line(55 + 30, lineheight, 50 + 85, lineheight, {"stroke-width": "3", "arrow-end": "classic"});
  av.g.rect(55 + 80, height - 40, 100, 30);
  av.g.line(55 + 180, lineheight, 50 + 235, lineheight, {"stroke-width": "3", "arrow-end": "classic"});
  av.g.rect(55 + 230, height - 50, 50, 50);
  av.g.line(55 + 280, lineheight, 50 + 335, lineheight, {"stroke-width": "3", "arrow-end": "classic"});
  av.g.rect(55 + 330, height - 40, 100, 30);
  av.g.line(55 + 430, lineheight, 50 + 485, lineheight, {"stroke-width": "3", "arrow-end": "classic"});
  av.g.circle(55 + 510, height - 25, 30, 30);

  // Draw the labels
  av.label("Input File", {left: 15, top: height - 100, visible: true}).show; 
  av.label("Input Buffer", {left: 140, top: height - 100, visible: true}).show;
  av.label("RAM", {left: 293, top: height - 100, visible: true}).show;
  av.label("Output Buffer", {left: 386, top: height - 100, visible: true}).show;
  av.label("Output Run File", {left: 530, top: height - 100, visible: true}).show;

}(jQuery));
