"use strict";

(function ($) {
  var av = new JSAV("externalSortSnow", {"animationMode": "none"});

  // Draw the objects
  var height = 75;
  var widthoffset = 100;

  av.g.rect(55 + widthoffset, height - 25, 200, 75);
  av.g.line(55 + widthoffset, height - 25, 100 + 255, height + 50);


  // Draw arrows
  av.g.line(55 + widthoffset, height + 108, 55 + widthoffset, height + 55, 
	{"stroke-width": "3", "arrow-end": "classic"});
  av.g.line(125 + widthoffset, height + 75, 200 + widthoffset, height + 75, 
	{"stroke-width": "3", "arrow-end": "classic"});
  av.g.line(65 + widthoffset, height - 50, 65 + widthoffset, height - 25, 
	{"stroke-width": "3", "arrow-end": "classic"});
  av.g.line(110 + widthoffset, height - 50, 110 + widthoffset, height - 25,
	{"stroke-width": "3", "arrow-end": "classic"});
  av.g.line(155 + widthoffset, height - 50, 155 + widthoffset, height - 25, 
	{"stroke-width": "3", "arrow-end": "classic"});
  av.g.line(200 + widthoffset, height - 50, 200 + widthoffset, height - 25, 
	{"stroke-width": "3", "arrow-end": "classic"});
  av.g.line(245 + widthoffset, height - 50, 245 + widthoffset, height - 25, 
	{"stroke-width": "3", "arrow-end": "classic"});

  // Draw the labels
  av.label("Falling Snow", {left: 100 + widthoffset, top: height - 90, visible: true}).show; 
  av.label("Existing snow", {left: 65 + widthoffset, top: height + 10, visible: true}).show; 
  av.label("Future snow", {left: 250, top: height - 30, visible: true}).show;
  av.label("Start time T", {left: 50 + widthoffset, top: height + 110, visible: true}).show;
  av.label("Snowplow Movement", {left: 100 + widthoffset, top: height + 80, visible: true}).show;

}(jQuery));
