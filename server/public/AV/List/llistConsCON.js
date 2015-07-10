/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Work through the constructors
$(document).ready(function () {
  var av_name = "llistConsCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  // Slide 1
  av.umsg(interpret("av_c1"));
  pseudo.setCurrentLine("comment");
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  pseudo.setCurrentLine("optsize");
  av.step();

  // Slide 3
  av.umsg(interpret("av_c3"));
  pseudo.highlight("default");
  av.step();

  // Slide 4
  pseudo.setCurrentLine(0);   // Hack due to no multi-line set
  pseudo.unhighlight("default");
  pseudo.highlight("clear");
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  pseudo.unhighlight("clear");
  av.umsg(interpret("av_c5"));
  av.recorded();
});
