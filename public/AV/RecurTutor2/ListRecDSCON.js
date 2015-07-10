/*global ODSA */
"use strict";
$(document).ready(function () {
  var av = new JSAV("ListRecDSCON", {"animationMode": "none"});
  
  var l = av.ds.list({nodegap: 30, center: false, left: 210, top: 45});
  l.addFirst(10).addFirst(35).addFirst(8).addFirst(23);
  l.layout();
  
  
  var AnotherList = av.label("A node followed by a list", {left: 550, top: 10});
  av.g.line(550 ,  40, 490,  70, {"stroke-width": "2", "arrow-end": "classic"});
  av.g.rect(280, 50, 200 , 50).css({fill: "brown", opacity: 0.2});
   
});
