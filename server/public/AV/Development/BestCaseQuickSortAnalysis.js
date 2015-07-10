"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  var code;
  var arr;
  
  function runit() {
    av = new JSAV($(".avcontainer"));
    MathJax.Hub.Config({tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}});
	$(".avcontainer").on("jsav-message", function() {
      // invoke MathJax to do conversion again
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    });
	$(".avcontainer").on("jsav-updatecounter", function(){ 
      // invoke MathJax to do conversion again 
      MathJax.Hub.Queue(["Typeset",MathJax.Hub]); 
    });  
	av.umsg("Quicksort's best case occurs when the selected pivot always breaks the array into two equal halves");
	av.displayInit();
	av.umsg("Let's start with an array of size $n$");
	av.g.rect(100, 0, 400, 30);
	av.label("$n$",  {"top": "2px", "left": "300px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("The pivot partitions the array into two halves of size $\\frac{n}{2}$ each ... This requires $\\theta(n)$ amount of work");
	av.g.rect(100, 80, 400, 30);
	av.g.rect(290, 80, 10, 30);
	av.label("|--------  $< A[pivot]$  --------|",  {"top": "55px", "left": "105px"}).css({'font-size': '1em', "text-align": "center"});
    av.label("|---------  $> A[pivot]$  ---------|",  {"top": "55px", "left": "310px"}).css({'font-size': '1em', "text-align": "center"});
	av.label("pivot",  {"top": "85px", "left": "283px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("$\\frac{n}{2}$",  {"top": "82px", "left": "190px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{2}$",  {"top": "82px", "left": "390px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\theta(n)$",  {"top": "82px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("For each of the $\\frac{n}{2}$ partitions, the pivot breaks it into two halves of size $\\frac{n}{4}$ each ... This requires $\\theta(n)$ amount of work");
	av.g.rect(80, 160, 200, 30);
	av.g.rect(320, 160, 200, 30);
	av.g.rect(175, 160, 10, 30);
	av.g.rect(415, 160, 10, 30);
	av.label("pivot",  {"top": "165px", "left": "168px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("pivot",  {"top": "165px", "left": "408px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("$\\frac{n}{4}$",  {"top": "162px", "left": "120px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{4}$",  {"top": "162px", "left": "220px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{4}$",  {"top": "162px", "left": "360px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{4}$",  {"top": "162px", "left": "460px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\theta(n)$",  {"top": "162px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("For each of the $\\frac{n}{4}$ partitions, the pivot breaks it into two halves of size $\\frac{n}{8}$ each ... This requires $\\theta(n)$ amount of work");
	av.g.rect(60, 240, 100, 30);
	av.g.rect(180, 240, 100, 30);
	av.g.rect(320, 240, 100, 30);
	av.g.rect(440, 240, 100, 30);
	av.g.rect(105, 240, 10, 30);
	av.g.rect(225, 240, 10, 30);
	av.g.rect(365, 240, 10, 30);
	av.g.rect(485, 240, 10, 30);
	av.label("pivot",  {"top": "245px", "left": "98px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("pivot",  {"top": "245px", "left": "218px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("pivot",  {"top": "245px", "left": "358px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("pivot",  {"top": "245px", "left": "478px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "75px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "130px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "195px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "250px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "330px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "390px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "450px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\frac{n}{8}$",  {"top": "242px", "left": "510px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\theta(n)$",  {"top": "242px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("In the last level, we reach $n$ partitions each of size 1 ... This requires $\\theta(n)$ amount of work");
	av.label("...",  {"top": "275px", "left": "105px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
	av.label("...",  {"top": "275px", "left": "225px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
	av.label("...",  {"top": "275px", "left": "365px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
	av.label("...",  {"top": "275px", "left": "485px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
	av.label("...",  {"top": "275px", "left": "610px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
	av.g.rect(40, 320, 30, 30);
	av.g.rect(80, 320, 30, 30);
	av.label("........................................",  {"top": "310px", "left": "120px"}).css({'font-size': '32px', "text-align": "center"});
	av.g.rect(500, 320, 30, 30);
	av.g.rect(540, 320, 30, 30);
	av.label("$1$",  {"top": "322px", "left": "50px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$1$",  {"top": "322px", "left": "90px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$1$",  {"top": "322px", "left": "510px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$1$",  {"top": "322px", "left": "550px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$\\theta(n)$",  {"top": "322px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("Thus, at each level, all partition steps for that level do a total of $\\theta(n)$ work, for an overall cost of $\\theta(n\\log{n})$ work when Quicksort finds perfect pivots.");
	av.label("|--------------------- $\\log{n}$---------------------|", 
	{"top": "205px", "left": "550px"}).css({'font-size': '16px', "text-align": "center"})
	.addClass("rotated");
	av.recorded();
  }
  function about() {
    var mystring = "Quick Sort Analysis\nWritten by Mohammed Fawzy and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during February, 2014\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
