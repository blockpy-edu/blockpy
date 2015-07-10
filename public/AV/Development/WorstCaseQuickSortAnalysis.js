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
	av.umsg("Quicksort's worst case will occur when the pivot does a poor job of breaking the array, that is, when there are no records in one partition, and $n-1$ records in the other");
	av.displayInit();
	av.umsg("Let's start with an array of size $n$");
	av.g.rect(100, 0, 400, 30);
	av.label("$n$",  {"top": "2px", "left": "300px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("The pivot partitions the array into two parts one of size $0$ and the other of size $n-1$ ... This requires $n-1$ units of work");
	av.g.rect(100, 80, 400, 30);
	av.g.rect(100, 80, 20, 30);
    av.label("|-----------------------------  $> A[pivot]$  ---------------------------|",  {"top": "55px", "left": "120px"}).css({'font-size': '14px', "text-align": "center"});
	av.label("pivot",  {"top": "85px", "left": "100px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("$n-1$",  {"top": "82px", "left": "270px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$n-1$",  {"top": "82px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("Amount Of Work",  {"top": "2px", "left": "580px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("For the $n-1$ partition, the pivot breaks it into two parts one of size $0$ and the other of size $n-2$ ... This requires $n-2$ units of work");
	av.g.rect(120, 160, 380, 30);
	av.g.rect(120, 160, 20, 30);
	av.label("|---------------------------  $> A[pivot]$  -------------------------|",  {"top": "135px", "left": "140px"}).css({'font-size': '14px', "text-align": "center"});
	av.label("pivot",  {"top": "165px", "left": "120px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("$n-2$",  {"top": "162px", "left": "290px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$n-2$",  {"top": "162px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("For the $n-2$ partition, the pivot breaks it into two parts one of size $0$ and the other of size $n-3$ ... This requires $n-3$ amount of work");
	av.g.rect(140, 240, 360, 30);
	av.g.rect(140, 240, 20, 30);
	av.label("|-------------------------  $> A[pivot]$  -----------------------|",  {"top": "215px", "left": "160px"}).css({'font-size': '14px', "text-align": "center"});
	av.label("pivot",  {"top": "245px", "left": "140px"}).css({'font-size': '12px', "text-align": "center"}).addClass("rotated");
	av.label("$n-3$",  {"top": "242px", "left": "300px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$n-3$",  {"top": "242px", "left": "600px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("In the last level, the pivot breaks a partition of size $2$ into two parts one of size $0$ and the other of size $1$ ... This requires a single unit of work");
	av.label("...",  {"top": "275px", "left": "470px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
	av.label("...",  {"top": "275px", "left": "620px"}).css({'font-size': '32px', "text-align": "center"}).addClass("rotated");
	av.g.rect(460, 315, 40, 30);
	av.g.rect(460, 315, 20, 30);
	av.label("pivot",  {"top": "320px", "left": "460px"}).css({'font-size': '12px', "text-align": "center"}).addClass('rotated');
	av.label("$1$",  {"top": "317px", "left": "485px"}).css({'font-size': '18px', "text-align": "center"});
	av.label("$1$",  {"top": "317px", "left": "620px"}).css({'font-size': '18px', "text-align": "center"});
	av.step();
	av.umsg("Thus, the total amount of work is determined by the summation $\\displaystyle\\sum_{i=1}^{n-1}i$");
	av.label("|--------------------- $n-1$---------------------|", 
	{"top": "205px", "left": "550px"}).css({'font-size': '16px', "text-align": "center"})
	.addClass("rotated");
	av.step();
	av.umsg("Therefore, the worst case running time of Quicksort is $\\theta(n^2)$");
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
