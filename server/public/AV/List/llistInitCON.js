/*global setPointerL, setPointerR */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Initial state of a linked list when using a header node
$(document).ready(function () {
  var av = new JSAV("llistInitCON", {animationMode: 'none'});
  var l = av.ds.list({nodegap: 30, top: 50, left: 367});
  l.addFirst("null").addFirst("null");
  l.layout();
  setPointerL("head", l.get(0));
  setPointerL("curr", l.get(1));
  setPointerR("tail", l.get(1));
  l.get(1).addTail();
  l.get(1).addVLine();
  av.recorded();
});
