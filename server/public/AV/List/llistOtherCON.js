/*global ODSA, setPointerL */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Move curr around the Linked list
$(document).ready(function () {
  var av_name = "llistOtherCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var l = av.ds.list({nodegap: 30, center: false, left: 210, top: 45});
  l.addFirst("null").addFirst(10).addFirst(35).addFirst(8).addFirst(23).addFirst("null");
  l.layout();
  var head = setPointerL("head", l.get(0));
  var curr = setPointerL("curr", l.get(3));
  var tail = setPointerL("tail", l.get(5));
  var temp = setPointerL("temp", l.get(3));
  temp.hide();
  var nextCurr = setPointerL("curr", l.get(4));
  nextCurr.hide();
  var slash = l.get(5).addTail(); // Diagonal slash at end

  var pseudo_next = av.code($.extend({left: 80, top: 150,
                                      visible: false, lineNumbers: false}, code[0]));
  var pseudo_prev = av.code($.extend({left: 80, top: 100,
                                      visible: false, lineNumbers: false}, code[1]));
  var pseudo_pos = av.code($.extend({left: 80, top: 100,
                                     visible: false, lineNumbers: false}, code[2]));

  // Slide 1
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  pseudo_next.show();
  pseudo_next.highlight("sig");
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  l.get(4).highlight();
  curr.hide();
  nextCurr.show();
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  l.get(4).unhighlight();
  pseudo_next.hide();
  pseudo_prev.show();
  pseudo_prev.setCurrentLine("sig");
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  pseudo_next.hide();
  pseudo_prev.show();
  pseudo_prev.setCurrentLine("while");
  l.get(0).highlight();
  l.get(1).highlight();
  l.get(2).highlight();
  l.get(3).highlight();
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  l.get(0).unhighlight();
  l.get(1).unhighlight();
  l.get(2).unhighlight();
  temp.show();
  av.umsg(interpret("av_c6"));
  av.step();

  // Slide 7
  temp.hide();
  curr.show();
  nextCurr.hide();
  pseudo_prev.setCurrentLine("curr");
  av.umsg(interpret("av_c7"));
  av.step();

  // Slide 8
  l.get(3).unhighlight();
  pseudo_prev.hide();
  pseudo_pos.show();
  pseudo_pos.setCurrentLine("sig");
  av.umsg(interpret("av_c8"));
  av.step();

  // Slide 9
  l.get(1).highlight();
  l.get(2).highlight();
  l.get(3).highlight();
  l.get(4).highlight();
  curr.hide();
  nextCurr.show();
  pseudo_pos.setCurrentLine("for");
  av.umsg(interpret("av_c9"));
  av.step();

  // Slide 10
  l.get(1).unhighlight();
  l.get(2).unhighlight();
  l.get(3).unhighlight();
  l.get(4).unhighlight();
  pseudo_pos.setCurrentLine(0);
  av.umsg(interpret("av_c10"));
  av.recorded();
});
