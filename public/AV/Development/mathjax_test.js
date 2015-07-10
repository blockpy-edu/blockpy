"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  av = new JSAV($(".avcontainer"));
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
  $(".avcontainer").on("jsav-message", function() {
    // invoke MathJax to do conversion again
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  });
  av.umsg('Test with JSAV: The running time is $n \\log n$');
  av.displayInit();
  av.umsg('Again Test with JSAV: The running time is $n \\log n$');
  av.step();
  av.umsg('Test with JSAV: The running time is $\\theta(n^2)$');
  av.recorded();

  // Connect action callbacks to the HTML entities
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
