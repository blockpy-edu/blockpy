/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "openhashCON1";
  var temp;
  var empty = [];
  var arrows = [];
  var i;
  var skipheight = 31;
  var offset = 32;
  var loffset = 4;
  for (i = 0; i < 10; i++) { empty[i] = ""; }
  var av = new JSAV(av_name, {"animationMode": "none"});
  var arr = av.ds.array(empty, {indexed: true, center: false,
                            layout: "vertical", left: 20});
  var lists = []; // The actual set of lists
  for (i = 0; i < 10; i++) {
    lists[i] = av.ds.list({top: (loffset + i * skipheight), left: 95, nodegap: 25});
    lists[i].layout({center: false});
  }
  lists[0].addFirst(100);
  lists[0].addLast(930);
  lists[0].layout({center: false});
  var x = av.g.line(52, offset + 0 * skipheight, 96, offset + 0 * skipheight,
    {"arrow-end": "classic-wide-long", "opacity": 1, "stroke-width": 2});
  lists[3].addLast(313);
  lists[3].layout({center: false});
  av.g.line(52, offset + 3 * skipheight, 96, offset + 3 * skipheight,
    {"arrow-end": "classic-wide-long", "stroke-width": 2});
  lists[7].addFirst(977);
  lists[7].addLast(207);
  lists[7].addLast(157);
  lists[7].layout({center: false});
  av.g.line(52, offset + 7 * skipheight, 96, offset + 7 * skipheight,
    {"arrow-end": "classic-wide-long", "stroke-width": 2});
  lists[9].addFirst(979);
  lists[9].layout({center: false});
  av.g.line(52, offset + 9 * skipheight, 96, offset + 9 * skipheight,
    {"arrow-end": "classic-wide-long", "stroke-width": 2});
});
