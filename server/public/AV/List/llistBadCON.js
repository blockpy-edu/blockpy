/*global ODSA, setPointerL */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Bad representation version for linked list
$(document).ready(function () {
  var av_name = "llistBadCON";
  var interpret = ODSA.UTILS.loadConfig({"av_name": av_name}).interpreter;
  var av = new JSAV(av_name);

  // Set up the list
  var l = av.ds.list({nodegap: 30, top: 40, left: 257});
  l.addFirst(15).addFirst(12).addFirst(10).addFirst(23).addFirst(20);
  l.layout();
  var bar = l.get(2).addVLine();
  var slash = l.get(4).addTail();
  var slash3 = l.get(3).addTail({visible: 0}); //Diagonal slash in step 3, hide for now

  // Set up the various pointers
  var head = setPointerL("head", l.get(0));
  head.hide();
  var curr = setPointerL("curr", l.get(2));
  curr.hide();
  var tail = setPointerL("tail", l.get(4));
  tail.hide();

  // Slide 1
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  head.show();
  curr.show();
  tail.show();
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  slash.hide();
  slash3.show();
  l.remove(2);
  l.layout();
  av.umsg(interpret("av_c3"));
  av.recorded();
});
