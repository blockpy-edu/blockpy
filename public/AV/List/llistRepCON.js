"use strict";
// Written by Jun Yang and Cliff Shaffer
// Diagram showing the linked list concept
$(document).ready(function () {
  var av = new JSAV("llistRepCON", {animationMode: "none"});
  var l = av.ds.list({nodegap: 30});
  l.addFirst("").addFirst("").addFirst("");
  l.get(2).addTail({ left: 477 });
  l.layout();
  av.recorded();
});
