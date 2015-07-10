/*global ODSA, setPointerL, setPointerR */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// The reason why there is a problem with naive representation of linked list
$(document).ready(function () {
  var av_name = "llistBadDelCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name);

  // Linked list
  var l = av.ds.list({nodegap: 30, top: 40, left: 257});
  l.addFirst(15).addFirst(12).addFirst(10).addFirst(23).addFirst(20);
  l.get(1).highlight();
  l.layout();

  var head = setPointerL("head", l.get(0));
  var curr = setPointerL("curr", l.get(2));
  var tail = setPointerL("tail", l.get(4));
  var bar = l.get(2).addVLine();
  var bar2 = l.get(3).addVLine({visible: 0});
  var slash = l.get(4).addTail();
  var slash6 = l.get(3).addTail({visible: 0}); // Diagonal slash in step 6
  var dashlineLeftMargin = 452;    // Dash line in step 4
  var dashline = av.g.polyline([[dashlineLeftMargin, 66],
                                [dashlineLeftMargin + 13, 66],
                                [dashlineLeftMargin + 13, 30],
                                [dashlineLeftMargin + 83, 30],
                                [dashlineLeftMargin + 83, 66],
                                [dashlineLeftMargin + 101, 66]],
                               {"arrow-end": "classic-wide-long", "opacity": 0,
                                "stroke-width": 2, "stroke-dasharray": "-"});

  // Slide 1
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  l.get(1).unhighlight();
  l.get(3).highlight();
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  l.get(3).unhighlight();
  l.get(2).value("");
  l.get(2).highlight();
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  av.effects.moveValue(l.get(3), l.get(2));
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  dashline.show();
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  l.get(2).unhighlight();
  l.get(3).highlight();
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  dashline.hide();
  l.remove(3);
  l.get(2).edgeToNext().show();
  slash.hide();
  slash6.show();
  l.layout();
  av.umsg(interpret("av_c6"));
  av.step();

  // Slide 7
  curr.hide();
  tail.hide();
  var newcurr = setPointerL("curr", l.get(3));
  var newtail = setPointerR("tail", l.get(3));
  bar.hide();
  bar2.show();
  l.get(2).highlight();
  av.umsg(interpret("av_c7"));
  av.recorded();
});
