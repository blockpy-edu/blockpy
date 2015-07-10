/*global ODSA, setPointerL */
"use strict";
// Written by Jun Yang and Cliff Shaffer
//Linked list insertion
$(document).ready(function () {
  var av_name = "llistInsertCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  // Offsets
  var leftMargin = 217;
  var topMargin = 40;

  // Make the main list
  var l = av.ds.list({nodegap: 30, top: topMargin, left: leftMargin});
  l.addFirst("null").addFirst(12).addFirst(23).addFirst(35).addFirst("null");
  l.layout();
  var head = setPointerL("head", l.get(0));
  var curr = setPointerL("curr", l.get(2));
  var tail = setPointerL("tail", l.get(4));
  var slash = l.get(4).addTail();
  var bar = l.get(2).addVLine();

  // Box "it"
  var itLabel = av.label("it", {before: l, left: 20, top: -10});
  var itBox = av.ds.array(["15"], {indexed: false, layout: "array",
                                   top: -15, left: 40});

  // Create pieces for later steps
  var arr = av.ds.array([""], {indexed: true, layout: "array"});
  arr.hide();
  var newSlash = l.get(4).addTail({left: 74, top: 0, visible: 0});
  //Horizontal arrow in step 4 pointing to item 12
  var longArrow = av.g.line(leftMargin + 190, topMargin + 31,
                            leftMargin + 298, topMargin + 31,
                            {"arrow-end": "classic-wide-long",
                             "opacity": 0, "stroke-width": 2});

  // Slide 1
  av.umsg(interpret("av_c1"));
  itBox.highlight(0);
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  var newNode = l.newNode("");
  // Set the position for the new node
  newNode.css({top: 50, left: 222});
  var node = l.get(2).next();
  l.get(2).next(newNode);
  newNode.next(node);
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  longArrow.show();
  slash.hide();
  newSlash.show();
  l.layout({ updateTop: false });
  av.umsg(interpret("av_c2"));
  //Copy 23 to the new link node
  av.effects.copyValue(arr, 0, newNode);
  newNode.highlight();
  pseudo.setCurrentLine("setnext");
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  //Copy 10 to the new link node
  av.effects.copyValue(l.get(2), newNode);
  av.step();

  // Slide 4
  l.get(3).edgeToNext().show();
  newNode.unhighlight();
  l.layout({ updateTop: false }); // Do not recalculate top coordinate
  l.get(3).highlight();
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  l.get(2).highlight();
  l.get(3).unhighlight();
  l.get(2).edgeToNext().show();
  longArrow.hide();
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  l.get(2).unhighlight();
  l.get(3).highlight();
  av.umsg(interpret("av_c6"));
  l.layout();
  av.step();

  // Slide 7
  av.effects.copyValue(itBox, 0, l.get(2));
  itBox.unhighlight(0);
  l.get(3).unhighlight();
  l.get(2).highlight();
  av.umsg(interpret("av_c7"));
  pseudo.setCurrentLine("setelem");
  av.step();

  // Slide 8
  av.umsg(interpret("av_c8"));
  l.get(2).unhighlight();
  pseudo.setCurrentLine("listSize");
  av.step();

  // Slide 9
  av.umsg(interpret("av_c9"));
  pseudo.setCurrentLine("return");
  av.recorded();
});
