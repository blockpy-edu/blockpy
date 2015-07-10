/*global ODSA, setPointerL */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Linked list deletion
$(document).ready(function () {
  var av_name = "llistRemoveCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  // Relative offsets
  var leftMargin = 250;
  var topMargin = 25;

  var l = av.ds.list({nodegap: 30, center: false,
                      left: leftMargin, top: topMargin});
  l.addFirst("null").addFirst(10).addFirst(35).addFirst(8).addFirst(23).addFirst('null');
  l.layout();
  var head = setPointerL('head', l.get(0));
  var curr = setPointerL('curr', l.get(2));
  var tail = setPointerL('tail', l.get(5));
  var verticalBar = l.get(2).addVLine();
  var slash = l.get(5).addTail();
  // New slash after deletion
  var newSlash = l.get(4).addTail({ visible: 0 });

  // Dashline
  var dashline = av.g.polyline([[leftMargin + 186, topMargin + 32],
                                [leftMargin + 125 + 74, topMargin + 32],
                                [leftMargin + 199, topMargin + 3],
                                [leftMargin + 276, topMargin + 3],
                                [leftMargin + 276, topMargin + 32],
                                [leftMargin + 297, topMargin + 32]],
                               {"arrow-end": "classic-wide-long",
                                "opacity": 0, "stroke-width": 2,
                                "stroke-dasharray": "-"});

  // Create hidden array for holding the removed value
  var arr = av.ds.array(["10"], {indexed: false, layout: "array",
                                 left: leftMargin + 140,
                                 top: topMargin + 50}).hide();

  var labelIt = av.label("it", {before: arr, left: leftMargin + 73,
                                top: topMargin + 58});
  var arrowIt = av.g.line(leftMargin + 89, topMargin + 85,
                          leftMargin + 129, topMargin + 85,
                          {"arrow-end": "classic-wide-long",
                           "opacity": 0, "stroke-width": 2});
  labelIt.hide();

  // Slide 1
  av.umsg(interpret("av_c1"));
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  l.get(2).highlight();
  l.layout({ updateLeft: false }); // Do not change left position on update
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  arr.show();
  av.effects.copyValue(l.get(2), arr, 0);
  labelIt.show();
  arrowIt.show();
  l.get(2).unhighlight();
  arr.highlight(0);
  av.umsg(interpret("av_c3"));
  pseudo.setCurrentLine("remember");
  av.step();

  // Slide 4
  av.effects.copyValue(l.get(3), l.get(2));
  l.get(2).highlight();
  arr.unhighlight(0);
  av.umsg(interpret("av_c4"));
  pseudo.setCurrentLine("setelem");
  av.step();

  // Slide 5
  l.get(2).edgeToNext().hide();
  l.get(3).edgeToNext().hide();
  dashline.show();
  l.get(4).highlight();
  av.umsg(interpret("av_c5"));
  pseudo.setCurrentLine("setnext");
  av.step();

  // Slide 6
  l.remove(3);
  dashline.hide();
  l.layout();
  l.get(2).edgeToNext().show();
  slash.hide();
  newSlash.show();
  l.get(2).unhighlight();
  l.get(3).unhighlight();
  av.umsg(interpret("av_c6"));
  pseudo.setCurrentLine("listSize");
  av.step();

  // Slide 7
  arr.highlight();
  av.umsg(interpret("av_c7"));
  pseudo.setCurrentLine("return");
  av.recorded();
});
