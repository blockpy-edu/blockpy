/*global ODSA */
"use strict";
$(document).ready(function () {
// Show the AQueue code.
  var av_name = "aqueueVarCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  // Slide 1
  av.umsg(interpret("av_c1"));
  pseudo.setCurrentLine("array");
  av.displayInit();

  // Slide 2
  pseudo.setCurrentLine("constructor");
  av.umsg(interpret("av_c2"));
  av.step();

  // Slide 3
  pseudo.setCurrentLine("setmaxsize");
  av.umsg(interpret("av_c3"));
  av.step();

  // Slide 4
  pseudo.setCurrentLine("varmaxsize");
  av.umsg(interpret("av_c4"));
  av.step();

  // Slide 5
  pseudo.setCurrentLine("varrear");
  av.umsg(interpret("av_c5"));
  av.recorded();
});
