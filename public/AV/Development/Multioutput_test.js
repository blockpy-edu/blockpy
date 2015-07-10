"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  window.JSAV_OPTIONS = {output:'.jsavline'};
  av = new JSAV($(".avcontainer"));
  MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
  $(".avcontainer").on("jsav-message", function() {
    // invoke MathJax to do conversion again
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  });
  av.umsg('We will discuss the worst case running time analysis of Insertion Sort');
  av.displayInit();
  av.umsg('It is determined by this equation');
  console.log("Before changing:"+JSAV_OPTIONS.output);
  JSAV_OPTIONS = {output:'.jsavscroll'};
  console.log("After changing:"+JSAV_OPTIONS.output);
  av.umsg('$$\\displaystyle\\sum_{i=1}^{n-1}i $$');
  av.step();
  av.umsg('This summation evaluates to $\\frac{n(n-1)}{2}$');
  av.step();
  av.umsg('Accordingly the worst case running time of insertion sort is $\\theta(n^2)$');
  av.recorded();

  // Connect action callbacks to the HTML entities
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
