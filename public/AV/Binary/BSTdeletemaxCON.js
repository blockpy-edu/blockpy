/*global ODSA */
"use strict";
// deletemax slideshow
$(document).ready(function () {
  var av_name = "BSTdeletemaxCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  var bt = av.ds.binarytree({top: 10, left: 40, visible: true, nodegap: 15});

  bt.root(10);
  var rt = bt.root();
  rt.left(5);
  rt.right(20);
  rt.right().left(12);
  rt.right().left().right(15);
  bt.layout();

  var rt1 = av.pointer("rt", bt.root(), {anchor: "left top", top: -10});

  // Slide 1
  av.umsg(interpret("av_c1"));
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  pseudo.setCurrentLine("checknull");
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  bt.root().addClass("processing");
  rt1.target(rt.right(), {anchor: "right top"});
  pseudo.setCurrentLine("sig");
  av.step();

  // Slide 4
  av.umsg(interpret("av_c4"));
  pseudo.setCurrentLine("checknull");
  av.step();

  // Slide 5
  av.umsg(interpret("av_c5"));
  pseudo.setCurrentLine("setright");
  bt.root().removeClass("processing");
  rt1.target(rt, {anchor: "left top"});
  rt.right(rt.right().left());
  var newedge = rt.edgeToRight();
  newedge.addClass("rededge");
  bt.layout();
  av.step();

  // Slide 6
  av.umsg(interpret("av_c6"));
  rt1.arrow.addClass("thinredline");
  // This line should not be needed, but it is here to fix Raphael bug with arrows
  rt1.arrow.css({"stroke": "red"});
  av.recorded();
});
