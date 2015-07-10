/*global ODSA */
"use strict";
// Post-order traversal slideshow
$(document).ready(function () {
  var av_name = "GenTreePostTravCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);

  var gt = av.ds.tree({visible: true, nodegap: 35});
  gt.root('R');
  var rt = gt.root();
  var a = gt.newNode('A');
  var b = gt.newNode('B');
  var c = gt.newNode('C');
  var d = gt.newNode('D');
  var e = gt.newNode('E');
  var f = gt.newNode('F');

  rt.addChild(a);
  rt.addChild(b);
  b.addChild(f);
  a.addChild(c);
  a.addChild(d);
  a.addChild(e);

  gt.layout();

  // Slide 1
  var rt1 = av.pointer("rt", rt, {anchor: "left top", top: -10});
  av.umsg("Postorder traversals start by going as far to the left as possible.");
  av.displayInit();

  // Slide 2
  av.umsg("Continue going to the left-most child until reaching a leaf node.");
  rt.addClass("processing");
  rt1.target(a);
  av.step();

  // Slide 3
  av.umsg("We have reached a leaf node, so we process this node.");
  rt1.target(c);
  a.addClass("processing");
  c.addClass("thicknode");
  av.step();

  // Slide 4
  av.umsg("We do NOT process the parent until all children have been processed.");
  a.removeClass("processing");
  rt1.target(a);
  av.step();

  // Slide 5
  av.umsg("Continue processing children from left to right.");
  rt1.target(d, {anchor: "left top"});
  a.addClass("processing");
  d.addClass("thicknode");
  av.step();

  // Slide 6
  av.umsg("pop back to the parent");
  a.removeClass("processing");
  rt1.target(a);
  av.step();
  
  // Slide 7
  av.umsg("visit the next child");
  rt1.target(e, {anchor: "right top"});
  a.addClass("processing");
  e.addClass("thicknode");
  av.step();

  // Slide 8
  av.umsg("pop back to the parent");
  a.removeClass("processing");
  rt1.target(a, {anchor: "left top"});
  av.step();

  // Slide 9
  av.umsg("Since there are no more unvisited children, we process node A");
  a.addClass("thicknode");
  av.step();

  // Slide 10
  av.umsg("pop back to the root");
  rt.removeClass("processing");
  rt1.target(rt);
  av.step();

  // Slide 11
  av.umsg("Now we go down the right subtree of the root until we hit a leaf.");
  rt.addClass("processing");
  rt1.target(b, {anchor: "right top"});
  av.step();

  // Slide 12
  av.umsg("Process F.");
  rt1.target(f, {anchor: "right bottom"});
  b.addClass("processing");
  f.addClass("thicknode");
  av.step();

  // Slide 13
  av.umsg("Process B.");
  rt1.target(b);
  b.removeClass("processing");
  b.addClass("thicknode");
  av.step();

  // Slide 14
  av.umsg("Finally, process the root node.");
  rt1.target(rt);
  rt.removeClass("processing");
  rt.addClass("thicknode");
  av.recorded();
});
