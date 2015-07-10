"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  var code;
  var arr;
  var arr_values = [];
  
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
	// code = av.code({url: "../../../SourceCode/Processing/Sorting/Selectionsort.pde",
                    // lineNumbers: true,
                    // startAfter: "/* *** ODSATag: Selectionsort *** */",
                    // endBefore: "/* *** ODSAendTag: Selectionsort *** */", top: 200, left: 150});	
	av.displayInit();
	
	av.umsg("Selection Sort is essentially a bubble sort except that the next largest value is remembered and the swap is done at the end of each pass");
	av.step();
    av.umsg("Consider the following example of an array with 6 elements");
	for (var i = 0;i < 6;i++){
	  arr_values[i] = parseInt(Math.random()*20);
	}
	arr = av.ds.array(arr_values, {"left":250, "top":20,"indexed":true});
	
	av.label("<b><u>Number of Comparisons</u></b>",  {"top": "172px", "left": "50px"}).css({'font-size': '16px', "text-align": "center"});
	av.label("<b><u>Number of Swaps</u></b>",  {"top": "172px", "left": "500px"}).css({'font-size': '16px', "text-align": "center"});
	av.step();
	
	av.umsg("At $i=0$");
	var bigIndex = 0;
	var pointer = av.pointer("Big-index", arr.index(bigIndex));
	arr.css(bigIndex, {"background-color":"green"});
	av.step();
	arr.css(1,{"background-color":"yellow"});
	av.label("$i=0$",  {"top": "345px", "left": "30px"});
	av.g.rect(25, 325, 50, 20);
	av.step();
	av.clearumsg();
	if(arr.value(1) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(1));
	  bigIndex = 1;
	  arr.css(1, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(1,{"background-color":"white"});
	}
	
	arr.css(2,{"background-color":"yellow"});
	av.g.rect(25, 305, 50, 20);
	av.step();
	if(arr.value(2) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(2));
	  bigIndex = 2;
	  arr.css(2, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(2,{"background-color":"white"});
	}
	
	
	arr.css(3,{"background-color":"yellow"});
	av.g.rect(25, 285, 50, 20);
	av.step();
	if(arr.value(3) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(3));
	  bigIndex = 3;
	  arr.css(3, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(3,{"background-color":"white"});
	}
	
	arr.css(4,{"background-color":"yellow"});
	av.g.rect(25, 265, 50, 20);
	av.step();
	if(arr.value(4) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(4));
	  bigIndex = 4;
	  arr.css(4, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(4,{"background-color":"white"});
	}
	
	arr.css(5,{"background-color":"yellow"});
	av.g.rect(25, 245, 50, 20);
	av.step();
	if(arr.value(5) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(5));
	  bigIndex = 5;
	  arr.css(5, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(5,{"background-color":"white"});
	}
	
	arr.swap(bigIndex,5);
	arr.css(bigIndex,{"background-color":"white"});
	arr.css(5,{"background-color":"grey"})
	av.g.rect(450, 325, 50, 20);
	av.label("$i=0$",  {"top": "345px", "left": "455px"});
	bigIndex = 0;
	pointer.target(arr.index(bigIndex));
	arr.css(bigIndex, {"background-color":"green"});
	av.step();
	
	av.umsg("At $i=1$");
	arr.css(1,{"background-color":"yellow"});
	av.label("$i=1$",  {"top": "345px", "left": "80px"});
	av.g.rect(75, 325, 50, 20);
	av.step();
	av.clearumsg();
	if(arr.value(1) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(1));
	  bigIndex = 1;
	  arr.css(1, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(1,{"background-color":"white"});
	}
	
	arr.css(2,{"background-color":"yellow"});
	av.g.rect(75, 305, 50, 20);
	av.step();
	if(arr.value(2) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(2));
	  bigIndex = 2;
	  arr.css(2, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(2,{"background-color":"white"});
	}
	
	
	arr.css(3,{"background-color":"yellow"});
	av.g.rect(75, 285, 50, 20);
	av.step();
	if(arr.value(3) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(3));
	  bigIndex = 3;
	  arr.css(3, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(3,{"background-color":"white"});
	}
	
	arr.css(4,{"background-color":"yellow"});
	av.g.rect(75, 265, 50, 20);
	av.step();
	if(arr.value(4) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(4));
	  bigIndex = 4;
	  arr.css(4, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(4,{"background-color":"white"});
	}
	
	arr.swap(bigIndex,4);
	arr.css(bigIndex,{"background-color":"white"});
	arr.css(4,{"background-color":"grey"})
	av.g.rect(500, 325, 50, 20);
	av.label("$i=1$",  {"top": "345px", "left": "505px"});
	bigIndex = 0;
	pointer.target(arr.index(bigIndex));
	arr.css(bigIndex, {"background-color":"green"});
	av.step();
	
	av.umsg("At $i=2$");
	arr.css(1,{"background-color":"yellow"});
	av.label("$i=2$",  {"top": "345px", "left": "130px"});
	av.g.rect(125, 325, 50, 20);
	av.step();
	av.clearumsg();
	if(arr.value(1) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(1));
	  bigIndex = 1;
	  arr.css(1, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(1,{"background-color":"white"});
	}
	
	arr.css(2,{"background-color":"yellow"});
	av.g.rect(125, 305, 50, 20);
	av.step();
	if(arr.value(2) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(2));
	  bigIndex = 2;
	  arr.css(2, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(2,{"background-color":"white"});
	}
	
	arr.css(3,{"background-color":"yellow"});
	av.g.rect(125, 285, 50, 20);
	av.step();
	if(arr.value(3) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(3));
	  bigIndex = 3;
	  arr.css(3, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(3,{"background-color":"white"});
	}
	
	arr.swap(bigIndex,3);
	arr.css(bigIndex,{"background-color":"white"});
	arr.css(3,{"background-color":"grey"})
	av.g.rect(550, 325, 50, 20);
	av.label("$i=2$",  {"top": "345px", "left": "555px"});
	bigIndex = 0;
	pointer.target(arr.index(bigIndex));
	arr.css(bigIndex, {"background-color":"green"});
	av.step();
	
	av.umsg("At $i=3$");
	arr.css(1,{"background-color":"yellow"});
	av.label("$i=3$",  {"top": "345px", "left": "180px"});
	av.g.rect(175, 325, 50, 20);
	av.step();
	av.clearumsg();
	if(arr.value(1) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(1));
	  bigIndex = 1;
	  arr.css(1, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(1,{"background-color":"white"});
	}
	
	arr.css(2,{"background-color":"yellow"});
	av.g.rect(175, 305, 50, 20);
	av.step();
	if(arr.value(2) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(2));
	  bigIndex = 2;
	  arr.css(2, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(2,{"background-color":"white"});
	}
	
	arr.swap(bigIndex,2);
	arr.css(bigIndex,{"background-color":"white"});
	arr.css(2,{"background-color":"grey"})
	av.g.rect(600, 325, 50, 20);
	av.label("$i=3$",  {"top": "345px", "left": "605px"});
	bigIndex = 0;
	pointer.target(arr.index(bigIndex));
	arr.css(bigIndex, {"background-color":"green"});
	av.step();
	
	av.umsg("At $i=4$");
	arr.css(1,{"background-color":"yellow"});
	av.label("$i=4$",  {"top": "345px", "left": "230px"});
	av.g.rect(225, 325, 50, 20);
	av.step();
	av.clearumsg();
	if(arr.value(1) > arr.value(bigIndex)){
	  arr.css(bigIndex,{"background-color":"white"});
	  pointer.target(arr.index(1));
	  bigIndex = 1;
	  arr.css(1, {"background-color":"green"});
	  av.step();
	}
	else{
	  arr.css(1,{"background-color":"white"});
	}
	
	arr.swap(bigIndex,1);
	arr.css(bigIndex,{"background-color":"white"});
	arr.css(1,{"background-color":"grey"})
	av.g.rect(650, 325, 50, 20);
	av.label("$i=4$",  {"top": "345px", "left": "655px"});
	pointer.hide();
	arr.css(0, {"background-color":"grey"});
	av.step();
	
	av.umsg("Thus, the number of comparisons is determined by the equation $\\displaystyle\\sum_{i=0}^{n-1}i = \\frac{n(n-1)}{2}$  and hence, the number of comparisons is $\\theta(n^2)$, while the number of swaps is $\\theta(n)$");
	av.label("|--- $n-1$---|",  {"top": "285px", "left": "-30px"}).addClass("rotated");
	av.label("|--------------- $n-1$ ---------------|",  {"top": "365px", "left": "45px"});
	av.label("|--------------- $n-1$ ---------------|",  {"top": "365px", "left": "470px"});
	av.step();
	
	av.recorded();
}
  function about() {
    var mystring = "Bubble Sort Analysis\nWritten by Mohammed Fawzy and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during February, 2014\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
