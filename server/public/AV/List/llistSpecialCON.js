/*global ODSA, setPointerL, setPointerR */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Special cases for Linked list insertion
// This visualization basically needs to build a list, then rebuild it again.
// Because of this, some of the code in the second half is a bit ugly,
// things did not seem to work as smoothly as expected. This shows itself
// especially in weird offsets.
$(document).ready(function () {
  var av_name = "llistSpecialCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  // Relative offsets
  var leftMargin = 27;
  var topMargin = 80;

  // Box "it"
  var itLabel = av.label("it", {left: 20, top: -10});
  var itBox = av.ds.array(["15"], {indexed: false, layout: "array",
                                   top: -15, left: 40});
  var l = av.ds.list({nodegap: 30, top: topMargin, left: leftMargin});
  l.addFirst("null").addFirst(20).addFirst("null");
  l.layout();

  var head = setPointerL("head", l.get(0));
  var curr = setPointerL("curr", l.get(2));
  var tail = setPointerR("tail", l.get(2));
  var bar1 = l.get(2).addVLine();
  var slash = l.get(2).addTail();

  //Diagonal slash for new node
  var newNodeSlash = av.g.line(leftMargin + 256, topMargin + 105,
                               leftMargin + 266, topMargin + 76,
                               {"opacity": 0, "stroke-width": 1});

  //Diagonal slash for new tail
  var newTailSlash = l.get(2).addTail({left: 74, visible: 0});

  //Diagonal slash for second new node
  var newNodeSlash2 = av.g.line(leftMargin + 182, topMargin + 107,
                                leftMargin + 192, topMargin + 76,
                                {"opacity": 0, "stroke-width": 1});

  var slash2 = l.get(0).addTail({left: 74});
  slash2.hide();

  // Slide 1
  av.umsg(interpret("av_c1"));
  itBox.highlight(0);
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  var newNode = l.newNode("");
  // Set the position for the new node
  newNode.css({top: 60, left: 222});
  newNode.highlight();
  av.umsg(interpret("av_c2"));
  pseudo.setCurrentLine("setnext");
  av.step();

  // Slide 3
  av.effects.copyValue(l.get(2), newNode);
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  newNodeSlash.show();
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  var node = l.get(2).next();
  l.get(2).edgeToNext();
  l.get(2).next(newNode);
  newNode.next(node);
  newNode.unhighlight();
  l.get(2).highlight();
  l.layout({ updateTop: false }); // Do not recalculate top coordinate
  slash.hide();
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  av.effects.copyValue(itBox, 0, l.get(2));
  itBox.unhighlight(0);
  av.umsg(interpret("av_c6"));
  pseudo.setCurrentLine("setelem");
  av.step();

  // Slide 7
  l.layout();
  newNodeSlash.hide();
  newTailSlash.show();
  tail.target(l.get(3), {anchor: 'left top', myAnchor: 'right bottom',
                         left: 15, top: -20});
  l.get(2).unhighlight();
  l.get(3).highlight();
  av.umsg(interpret("av_c7"));
  pseudo.setCurrentLine("tail");
  av.step();

  // Slide 8
  l.get(3).unhighlight();
  av.umsg(interpret("av_c8"));
  pseudo.setCurrentLine("listSize");
  av.step();

  // Slide 9
  // Reset the list for the next example
  pseudo.setCurrentLine(0);
  pseudo.setCurrentLine("sig");
  av.umsg(interpret("av_c9"));
  l.removeFirst();
  l.removeFirst();
  l.removeFirst();
  l.removeFirst();
  l.addFirst("null");
  l.addFirst("null");
  bar1.hide();
  itBox.highlight(0);
  slash2.show();
  var bar2 = l.get(0).addVLine({left: 74});
  newTailSlash.hide();
  head.target(l.get(0));
  curr.target(l.get(1));
  tail.target(l.get(1));
  l.layout();
  av.step();

  // Slide 10
  var newNode2 = l.newNode("");
  // Set the position for the new node
  newNode2.css({top: 60, left: 148});
  newNode2.highlight();
  av.umsg(interpret("av_c10"));
  pseudo.setCurrentLine("setnext");
  av.step();

  // Slide 11
  av.effects.copyValue(l.get(1), newNode2);
  av.umsg(interpret("av_c11"));
  av.step();

  // Slide 12
  newNodeSlash2.show();
  av.umsg(interpret("av_c12"));
  av.step();

  // Slide 13
  var node2 = l.get(1).next();
  l.get(1).edgeToNext();
  l.get(1).next(newNode2);
  newNode2.next(node2);
  newNode2.unhighlight();
  l.get(1).highlight();
  l.layout({updateTop: false}); // Do not recalculate top coordinate
  slash2.hide();
  av.umsg(interpret("av_c13"));
  av.step();

  // Slide 14
  av.effects.copyValue(itBox, 0, l.get(1));
  itBox.unhighlight(0);
  av.umsg(interpret("av_c14"));
  pseudo.setCurrentLine("setelem");
  av.step();

  // Slide 15
  //Diagonal slash for new tail
  var newTailSlash2 = av.g.line(leftMargin + 181, topMargin + 46,
                                leftMargin + 191, topMargin + 15,
                                {"opacity": 0, "stroke-width": 1});
  l.layout();
  newNodeSlash2.hide();
  newTailSlash2.show();
  tail.target(l.get(2), {anchor: "left top", myAnchor: "right bottom",
                         left: 15, top: -20});
  l.get(1).unhighlight();
  l.get(2).highlight();
  av.umsg(interpret("av_c15"));
  pseudo.setCurrentLine("tail");
  av.step();

  //step 16
  l.get(2).unhighlight();
  av.umsg(interpret("av_c16"));
  pseudo.setCurrentLine("listSize");
  av.recorded();
});
