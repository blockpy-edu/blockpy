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
	code = av.code({url: "../../../SourceCode/Processing/Sorting/Insertionsort.pde",
                    lineNumbers: true,
                    startAfter: "/* *** ODSATag: Insertionsort *** */",
                    endBefore: "/* *** ODSAendTag: Insertionsort *** */", top: 20, left: 200});	
	av.displayInit();
	
	av.umsg("The best case of insertion sort occurs when the array values are in sorted order from lowest to highest as shown");
	arr = av.ds.array([1, 2, 3, 4, 5, 6], {"left":-5, "top":150,"indexed":true});
	av.step();

	av.umsg("Every test in the inner for loop will fail immediately and no values will be moved");
	var rect = av.g.rect(500, 52, 243, 15).css({"fill": "green","opacity":0.3});
	av.step();
	
	av.umsg("The total number of comparisons will be $n-1$ which is the number of times the outer for loop executes");
	rect.hide();
	rect = av.g.rect(308, 30, 230, 15).css({"fill": "green","opacity":0.3});
	
	av.g.rect(320, 250, 50, 20);
	av.label("i=1",  {"top": "280px", "left": 330});
	
	
	av.g.rect(370, 250, 50, 20);
	av.label("i=2",  {"top": "280px", "left": "380px"});
		
	av.g.rect(420, 250, 50, 20);
	av.label("i=3",  {"top": "280px", "left": "430px"});
	
	av.g.rect(470, 250, 50, 20);
	av.label("i=4",  {"top": "280px", "left": "480px"});
	setTimeout(1000);
	
	av.g.rect(520, 250, 50, 20);
	av.label("i=5",  {"top": "280px", "left": "530px"});
	av.label("<--------- n-1 --------->",  {"top": "300px", "left": "350px"}).css({'font-size': '20px', "text-align": "center"});
	av.step();
	av.umsg('And therefore, the best case running time of insertion sort is $\\theta(n)$');
	av.recorded();
  }
  function about() {
    var mystring = "Insertion Sort Analysis\nWritten by Mohammed Fawzy and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project.\nFor more information, see http://algoviz.org/OpenDSA\nWritten during February, 2014\nJSAV library version " + JSAV.version();
    alert(mystring);
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
