"use strict";
/*global alert: true, ODSA, console */

(function ($) {
  var av;
  var code;
  var arr;
  var arr_values = [];
  var pointer1, pointer2, pointer3;
  var left_moves = 0, right_moves = 0;
  var lmoves, rmoves;
  
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
	av.umsg("To analyze Quicksort, we first analyze the findpivot and partition functions when operating on a subarray of length $k$");
	av.displayInit();
	av.umsg("Clearly, findpivot takes constant time for any $k$. Here we have $k = 9$");
	code = av.code({url: "../../SourceCode/Processing/Sorting/Quicksort.pde",
                    lineNumbers: true,
                    startAfter: "/* *** ODSATag: findpivot *** */",
                    endBefore: "/* *** ODSAendTag: findpivot *** */", top: 200, left: 200});
	for (var i = 0;i < 9;i++){
	  arr_values[i] = " ";
	}
	arr = av.ds.array(arr_values, {"left":150, "top":30,"indexed":true});
	code.css(1,{"background-color":"#00CCFF"});
	pointer1 = av.pointer("i", arr.index(0));
	pointer2 = av.pointer("j", arr.index(8));	
	pointer3 = av.pointer("pivot", arr.index(4));
	av.step();		
    code.hide();
    pointer1.hide();
    pointer2.hide();
    pointer3.hide();
    av.umsg("Function partition contains an outer while loop with two nested while loops");
	code = av.code({url: "../../SourceCode/Processing/Sorting/Quicksort.pde",
                    lineNumbers: true,
                    startAfter: "/* *** ODSATag: partition *** */",
                    endBefore: "/* *** ODSAendTag: partition *** */", top: 200, left: 80});
    code.css(1,{"background-color":"#99FF66"});
	code.css(2,{"background-color":"#00CCFF"});
	code.css(3,{"background-color":"#00CCFF"});
    av.step();
	av.umsg("The total cost of the partition operation is constrained by how far left and right can move inwards");
	pointer1 = av.pointer("left", arr.index(0));
	pointer2 = av.pointer("right", arr.index(7),
                             { anchor: "center bottom",
                               myAnchor: "right top",
                               top: 80,
                               left: -50,
                               arrowAnchor: "center bottom"
                             });
	
	pointer3 = av.pointer("pivot", arr.index(8),
                             { anchor: "center bottom",
                               myAnchor: "right top",
                               top: 80,
                               left: -50,
                               arrowAnchor: "center bottom"
                             });
	av.step();
	av.umsg("The swap operation in the body of the outer while loop guarantees the movement of left and right at least one step each");
	code.css(2,{"background-color":"white"});
	code.css(3,{"background-color":"white"});
	code.css(4,{"background-color":"#00CCFF"});
	av.step();
	av.umsg("Thus, the maximum number of times swap can be executed is $\\frac{s-1}{2}$. In this case, left and right will move at most $\\frac{s-1}{2}$ steps each for a total of $s-1$ steps");
	av.step();
	av.umsg("The first inner while loop can be executed at most $s-1$ times in which case left will end up at the pivot and the outer while loop will end");
	pointer1.target(arr.index(8));
	code.css(4,{"background-color":"white"});
	code.css(2,{"background-color":"#00CCFF"});
	av.step();
	av.umsg("The second inner while loop can be executed at most $s-1$ times in which case right will end up at array position $-1$ and the outer while loop will end");
	pointer1.target(arr.index(0));
	var a = av.ds.array(["-1"], {"left":103, "top":30,"indexed":false});
	pointer2.target(a.index(0));
	code.css(2,{"background-color":"white"});
	code.css(3,{"background-color":"#00CCFF"});
	av.step();
	av.umsg("Accordingly, the outer while loop along with its two inner loops will move left and right a total of $s-1$ steps");
	code.css(2,{"background-color":"#00CCFF"});
	a.hide();
	pointer2.target(arr.index(7));
	av.step();
	av.umsg("Thus, the running time of the partition function is $\\theta(s)$, where $s$ is the size of the subarray");
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
