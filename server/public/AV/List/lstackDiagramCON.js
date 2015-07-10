"use strict";
// Written by Jun Yang and Cliff Shaffer
// LStack Diagram
$(document).ready(function () {
  var av = new JSAV("lstackDiagramCON", {animationMode: 'none'});
  var l = av.ds.list({nodegap: 30, top: 40, left: 250});
  l.addFirst(15).addFirst(12).addFirst(8).addFirst(23).addFirst(20);
  l.layout();
  var topPointer = setPointer("top", l.get(0));
  av.recorded();
});
