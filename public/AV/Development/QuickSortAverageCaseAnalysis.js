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
	av.umsg("QuickSort is a recursive function, accordingly we should end up with a recursive relation to describe its average case running time");
	av.displayInit();
	av.umsg("For an array of size $n$, the partition function can cause the pivot to be at any position $k$ from $0$ to $n-1$");
	av.g.rect(220, 50, 400, 30);
	av.label("|-------------------------------------  $n$  -----------------------------------|",  {"top": "80px", "left": "225px"}).css({'font-size': '14px', "text-align": "center"});
	var pivot = av.g.rect(330, 50, 30, 30);
	var piv = av.label("pivot", {"top": "55px", "left": "331px"}).css({'font-size': '12px', "text-align": "center"});
	var index = av.label("$k$", {"top": "30px", "left": "335px"}).css({'font-size': '14px', "text-align": "center"});
	av.step();
	av.umsg("Accordingly, there will be two recursive calls for the quicksort function, one for the left $k$ elements that will take $T(k)$ time and the other for the right $n-1-k$ elements that will take $T(n-1-k)$ time");
	var right_side = av.label("|----------------  $n-1-k$  ---------------|",  {"top": "30px", "left": "370px"}).css({'font-size': '14px', "text-align": "center"});
	var left_side = av.label("|---------- $k$ ----------|", {"top": "30px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"});
	av.step();
	av.umsg("Consider the following cases for $k$:");
	av.umsg("If the pivot ends in position $0$, the total running time will be $cn+T(0)+T(n-1)$, where $cn$ here stands for the cost of the partition step");
	pivot.hide();
	pivot = av.g.rect(220, 50, 30, 30);
	index.hide();
	index = av.label("k = 0", {"top": "30px", "left": "220px"}).css({'font-size': '14px', "text-align": "center"});
	piv.hide();
	piv = av.label("pivot", {"top": "55px", "left": "221px"}).css({'font-size': '12px', "text-align": "center"});
	right_side.hide();
	left_side.hide();
	right_side = av.label("|-------------------------------  $n-1$  -----------------------------|",  {"top": "30px", "left": "255px"}).css({'font-size': '14px', "text-align": "center"});
	av.step();
	av.umsg("If the pivot ends in position $1$, the total running time will be $cn+T(1)+T(n-2)$");
	pivot.translate(30,0);
	piv.translate(30,0);
	index.translate(30,0);
	index.text("k = 1");
	right_side.hide();
	right_side = av.label("|----------------------------  $n-2$  --------------------------|",  {"top": "30px", "left": "285px"}).css({'font-size': '14px', "text-align": "center"});
	var left_side = av.label("$1$", {"top": "30px", "left": "230px"}).css({'font-size': '12px', "text-align": "center"});
	av.step();
	av.umsg("If the pivot ends in position $2$, the total running time will be $cn+T(2)+T(n-3)$");
	pivot.translate(30,0);
	piv.translate(30,0);
	index.translate(30,0);
	index.text("k = 2");
	right_side.hide();
	right_side = av.label("|-------------------------  $n-3$  -----------------------|",  {"top": "30px", "left": "315px"}).css({'font-size': '14px', "text-align": "center"});
	left_side.hide();
	left_side = av.label("|---- $2$ ----|", {"top": "30px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"})
	av.step();
	av.umsg("If the pivot ends in position $3$, the total running time will be $cn+T(3)+T(n-4)$");
	pivot.translate(30,0);
	piv.translate(30,0);
	index.translate(30,0);
	index.text("k = 3");
	right_side.hide();
	right_side = av.label("|----------------------  $n-4$  ---------------------|",  {"top": "30px", "left": "345px"}).css({'font-size': '14px', "text-align": "center"});
	left_side.hide();
	left_side = av.label("|------- $3$ -------|", {"top": "30px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"})
	av.step();
	av.umsg("We make one reasonable simplifying assumption: At each partition step, the pivot is equally likely to end in any position in the array");
	pivot.hide();
	pivot = av.g.rect(330, 50, 30, 30);
	piv.hide();
	piv = av.label("pivot", {"top": "55px", "left": "331px"}).css({'font-size': '12px', "text-align": "center"});
	index.hide();
	index = av.label("$k$", {"top": "30px", "left": "335px"}).css({'font-size': '14px', "text-align": "center"});
	right_side.hide();
	left_side.hide();
	right_side = av.label("|----------------  $n-1-k$  ---------------|",  {"top": "30px", "left": "370px"}).css({'font-size': '14px', "text-align": "center"});
	left_side = av.label("|---------- $k$ ----------|", {"top": "30px", "left": "225px"}).css({'font-size': '12px', "text-align": "center"});
	av.step();
	av.umsg("And since we have $n$ positions, therefore the average cost of the recursive calls can be modeled as:");
	var eqn = av.label("$$\\frac{1}{n}\\displaystyle\\sum_{k=0}^{n-1}[T(k)+T(n-1-k)]$$",  {"top": "-50px", "left": "0px"}).css({'font-size': '16px', "text-align": "center"});
	av.step();
	av.umsg("But also we need to add the cost for the partition and findpivot functions which is $cn$ for some constant $c$");
	av.step();
	av.umsg("Accordingly, quicksort's average running time can be modeled by the following recurrence:");
	eqn.text("$$T(n) = cn + \\frac{1}{n}\\displaystyle\\sum_{k=0}^{n-1}[T(k)+T(n-1-k)]$$");
	av.step();
	av.umsg("By solving this recurrence, we will have that quicksort's average running time is $\\theta(n\\log{n})$");
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
