/*global ODSA, setPointerL */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// List diagram with header and tailer nodes added
$(document).ready(function () {
  var av = new JSAV("llistHeaderCON", {animationMode: 'none'});
  var l = av.ds.list({nodegap: 30, top: 50, left: 180});
  l.addFirst("null").addFirst(15).addFirst(12).addFirst(10).addFirst(23).addFirst(20).addFirst("null");
  l.layout();
  setPointerL("head", l.get(0));
  setPointerL("curr", l.get(3));
  setPointerL("tail", l.get(6));
  l.get(3).addVLine();
  l.get(6).addTail();
  av.recorded();
});
