/*global ODSA */
"use strict";
$(document).ready(function () {
  var av = new JSAV("bintreeCONBTEX", {"animationMode": "none"});

  // Draw the rectangles
  var rleft = 300;
  var rtop = 15;
  var radius = 4;
  var mainrect = av.g.rect(rleft, rtop, 200, 200);
  av.g.rect(    rleft,       rtop, 100, 100);
  av.g.rect(rleft + 100, rtop + 100, 100, 100);
  av.g.rect(rleft + 100,       rtop,  50, 200);
  av.g.rect(rleft + 100,       rtop,  50,  50);
  av.g.rect(rleft + 125, rtop + 100,  25,  50);
  av.g.rect(rleft + 100, rtop + 100,  25,  50);
  // Extra rectangles to make all the lines equally thick
  av.g.rect(    rleft, rtop + 100, 100, 100);
  av.g.rect(rleft + 100,       rtop, 100, 100);
  av.g.rect(rleft + 100, rtop + 100, 100, 100);
  av.g.rect(rleft + 100,  rtop + 50,  50,  50);
  av.g.rect(rleft + 100,  rtop + 150,  50,  50);


  // Add points
  av.g.circle(rleft+60, rtop + 65, radius, {fill: 'black'});
  av.label("A", {left: rleft + 54, top: rtop + 53, visible: true}).show;
  av.g.circle(rleft + 20, rtop + 110, radius, {fill: 'black'});
  av.label("B", {left: rleft + 15, top: rtop + 98, visible: true}).show;
  av.g.circle(rleft + 110, rtop + 17, 5, {fill: 'black'});
  av.label("C", {left: rleft + 104, top: rtop + 6, visible: true}).show;
  av.g.circle(rleft + 107, rtop + 77, radius, {fill: 'black'});
  av.label("D", {left: rleft + 102, top: rtop + 65, visible: true}).show;
  av.g.circle(rleft + 106, rtop + 120, radius, {fill: 'black'});
  av.label("E", {left: rleft + 100, top: rtop + 107, visible: true}).show;
  av.g.circle(rleft + 137, rtop + 130, radius , {fill: 'black'});
  av.label("F", {left: rleft + 131, top: rtop + 117, visible: true}).show;

  // Setup the tree
  var btTop = 250;
  var btLeft = 305;
  var bt = av.ds.binarytree({nodegap: 10, top: btTop, left: btLeft});
  bt.root('');
  var rt = bt.root();
  rt.left('');
  rt.left().left('A');
  rt.left().right('B');
  
  rt.right('');
  rt.right().left('');
  rt.right().left().right('').addClass("emptyLeaf");
  rt.right().left().left('');
  rt.right().left().left().left('C');
  rt.right().left().left().right('D');
  rt.right().right('');
  rt.right().right().left('');
  rt.right().right().right('').addClass("emptyLeaf");
  rt.right().right().left().left('');
  rt.right().right().left().right('').addClass("emptyLeaf");
  rt.right().right().left().left().left('E');
  rt.right().right().left().left().right('F');

  bt.layout();
  var alabel = av.label("(a)", {left: rleft + 93, top: btTop - 45}).show;
  var blabel = av.label("(b)", {left: btLeft + 100, top: btTop + 370}).show;

  // Mark tree levels
  var lLeft = btLeft - 150;
  av.label("x", {left: lLeft, top: btTop + 4}).show;
  av.g.line(lLeft + 20, btTop + 30, lLeft + 210, btTop + 30);
  av.label("y", {left: lLeft, top: btTop + 46}).show;
  av.g.line(lLeft + 20, btTop + 72, lLeft + 155, btTop + 72);
  av.label("x", {left: lLeft, top: btTop + 88}).show;
  av.g.line(lLeft + 20, btTop + 114, lLeft + 130, btTop + 114);
  av.label("y", {left: lLeft, top: btTop + 130}).show;
  av.g.line(lLeft + 20, btTop + 156, lLeft + 200, btTop + 156);
  av.label("x", {left: lLeft, top: btTop + 172}).show;
  av.g.line(lLeft + 20, btTop + 198, lLeft + 180, btTop + 198);
  av.label("y", {left: lLeft, top: btTop + 214}).show;
  av.g.line(lLeft + 20, btTop + 240, lLeft + 275, btTop + 240);
});
