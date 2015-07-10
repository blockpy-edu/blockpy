/*global ODSA */
"use strict";
// Written by Jun Yang and Cliff Shaffer
// Show off the private data members
$(document).ready(function () {
  var av_name = "alistVarsCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  // Slide 1
  av.umsg(interpret("av_c1"));
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c2"));
  pseudo.setCurrentLine("sig");
  av.step();

  // Slide 3
  pseudo.setCurrentLine("listArray");
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  pseudo.setCurrentLine("default");
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  pseudo.setCurrentLine("maxSize");
  av.umsg(interpret("av_c5"));
  av.step();

  // Slide 6
  pseudo.setCurrentLine("listSize");
  av.umsg(interpret("av_c6"));
  av.step();

  // Slide 7
  pseudo.setCurrentLine("curr");
  av.umsg(interpret("av_c7"));
  av.step();

  // Slide 8
  pseudo.setCurrentLine(0);    // Clear highlighting
  pseudo.unhighlight("curr");
  av.umsg(interpret("av_c8"));
  av.recorded();
});
