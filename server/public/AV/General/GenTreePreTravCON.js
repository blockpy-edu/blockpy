/*global ODSA */
"use strict";
// Pre-order traversal slideshow
$(document).ready(function () {
  var av_name = "GenTreePreTravCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);
  var temp1;

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

  var rt1 = av.pointer("rt", rt, {anchor: "left top", top: -10});

  // Slide 1
  pseudo.setCurrentLine("processNode");
  av.umsg("Preorder traversals start by processing the root node.");
  av.displayInit();

  // Slide 2
  rt.addClass("thicknode");
  pseudo.setCurrentLine("checkLeaf");
  av.step();

  // Slide 3
  pseudo.setCurrentLine("leftChild");
  av.step();

  // Slide 4
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 5
  av.umsg("Next we visit the left most child");
  pseudo.setCurrentLine("processChild");
  av.step();

  // Slide 6
  av.umsg("This node is processed next, and is treated as the root of a new subtree.");
  rt.addClass("processing");
  a.addClass("thicknode");
  pseudo.setCurrentLine("processNode");
  rt1.target(a);
  av.step();

  // Slide 7
  pseudo.setCurrentLine("checkLeaf");
  av.step();

  // Slide 8
  pseudo.setCurrentLine("leftChild");
  av.step();

  // Slide 9
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 10
  av.umsg("Next we visit the left most child");
  pseudo.setCurrentLine("processChild");
  av.step();

  // Slide 11
  av.umsg("This node is processed next, and is treated as the root of a new subtree.");
  pseudo.setCurrentLine("processNode");
  a.addClass("processing");
  c.addClass("thicknode");
  rt1.target(c);
  av.step();

  // Slide 12
  pseudo.setCurrentLine("checkLeaf");
  av.umsg("Since this is a leaf, we pop back to the parent");
  av.step();

  // Slide 13
  pseudo.setCurrentLine("checkLeaf");
  a.removeClass("processing");
  rt1.target(a);
  av.step();

  // Slide 14
  av.umsg("Continue Examining the left children.");
  pseudo.setCurrentLine("getNextSibling");
  av.step();

  // Slide 15
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 16
  pseudo.setCurrentLine("processChild");
  av.step();

  // Slide 17
  rt1.target(d);
  a.addClass("processing");
  d.addClass("thicknode");
  pseudo.setCurrentLine("processNode");
  av.step();

  // Slide 18
  pseudo.setCurrentLine("checkLeaf");
  av.step();

  // Slide 19
  av.umsg("Since this is a leaf, we pop back to the parent");
  a.removeClass("processing");
  rt1.target(a);
  pseudo.setCurrentLine("getNextSibling");
  av.step();

  // Slide 20
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 21
  pseudo.setCurrentLine("processChild");
  av.step();

  // Slide 22
  av.umsg("Visit the next child of node A.");
  a.addClass("processing");
  e.addClass("thicknode");
  rt1.target(e, {anchor: "right top"});
  pseudo.setCurrentLine("processNode");
  av.step();

  // Slide 23
  pseudo.setCurrentLine("checkLeaf");
  av.step();
  
  // Slide 24
  av.umsg("Since this is a leaf, pop rcursion back to the parent");
  a.removeClass("processing");
  rt1.target(a);
  pseudo.setCurrentLine("getNextSibling");
  av.step();

  // Slide 25
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 26
  av.umsg("There are no children left to be processed.");
  av.step();

  // Slide 27
  pseudo.setCurrentLine("getNextSibling");
  av.umsg("Pop recursionback to the parent node.");
  rt1.target(rt);
  rt.removeClass("processing");
  av.step();

  // Slide 28
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 29
  pseudo.setCurrentLine("processChild");
  av.step();

  // Slide 30
  rt1.target(b);
  rt.addClass("processing");
  b.addClass("thicknode");
  pseudo.setCurrentLine("processNode");
  av.step();

  // Slide 31
  pseudo.setCurrentLine("checkLeaf");
  av.step();

  // Slide 32
  av.umsg("Continue Examining the left children.");
  pseudo.setCurrentLine("leftChild");
  av.step();

  // Slide 33
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 34
  pseudo.setCurrentLine("processChild");
  av.step();

  // Slide 35
  rt1.target(f);
  b.addClass("processing");
  f.addClass("thicknode");
  pseudo.setCurrentLine("processNode");
  av.step();

  // Slide 36
  pseudo.setCurrentLine("checkLeaf");
  av.step();

  // Slide 37
  av.umsg("There are no children left to be processed.");
  av.step();

  // Slide 38
  pseudo.setCurrentLine("getNextSibling");
  b.removeClass("processing");
  av.umsg("Pop recursion to the parent node.");
  rt1.target(b);
  av.step();

  // Slide 39
  pseudo.setCurrentLine("checkNull");
  av.step();

  // Slide 40
  av.umsg("There are no children left to be processed.");
  av.step();

  // Slide 41
  rt1.target(rt);
  rt.removeClass("processing");
  pseudo.setCurrentLine("end");
  av.recorded();
});
