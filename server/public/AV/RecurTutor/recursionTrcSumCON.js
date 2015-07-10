"use strict";
var theArray = [2, 4, 6];
var setGreen = function (arr, index) {
  arr.css(index, {"background-color": "#00FF00" });
};
var setWhite = function (arr, index) {
  arr.css(index, {"background-color": "#fff" });
};
//===============================================================================================================================
// Tracing sum on an array
(function ($) {

  var av = new JSAV("recursionTrcSumCON");
  
  av.umsg("Let's consider an easy recursive call. We want to sum the elements of an array.");
  var pseudo = av.code({url: "../../../SourceCode/Java/RecurTutor/Recsum.java",
                       lineNumbers: false,});
  av.displayInit();
  av.step();
  av.umsg("Assume the array contains: { 2, 4, 6 }, and that the call to the sum is: sum( arr, 3 ) which will sum the first three elements of the array");
  var arr = av.ds.array(theArray, {indexed: true});
  av.step();
  
  av.umsg("As the initial call to sum is made, the base case is not true (i.e., n is not 0)");
  pseudo.highlight(3);
  av.step();
  
  av.umsg("So it goes into the 'else' and make a recursive call to sum, this time passing a value of 2 (which is n - 1, where n is 3 at the time of the call. It will also pass a copy of the array arr.");
  pseudo.unhighlight(3);
  pseudo.highlight(5);
  av.step();
  
  av.umsg("The original sum makes a call to sum, passing in a copy of arr. Notice that n has a value of 2.");
  pseudo.unhighlight(5);
  pseudo.highlight(7);
  av.step();
  
  av.umsg("Here's the important question, to see if you're keeping up. How many n's are there? One or two? Recall that n is a value parameter. Because it is a value parameter, that means it's a copy. Thus, it occupies a different memory location."); 
  av.step();

  av.umsg("In the second call, n is 2, which means we aren't at the base case yet. So, it again goes into the else case, and makes a recursive call.");
 
  pseudo.highlight(5);
  pseudo.unhighlight(7);
  av.step();
  av.umsg("Again, we're not yet to the base case, so we must make one more recursive call.");
  pseudo.unhighlight(5);
  pseudo.highlight(7);
  av.step();
  
  av.umsg("At this point, we're at the base case. This makes no recursive call. The value of 0 is returned by the base case.");
  pseudo.unhighlight(7);
  pseudo.highlight(4);
  av.step();
  
  av.umsg("The result returned added to arr[ n - 1 ]. The value of n is 1 , so arr[ n - 1 ] = arr[ 1-1 ] = arr[ 0 ] = 2. So, add 0 + 2.");
  pseudo.unhighlight(4);
  pseudo.highlight(8);
  setGreen(arr, 0);
  av.step();
  av.umsg("This is why it's important to have 0 be the base case value. We add 0 to the value at array element 0. Any other value produces an incorrect answer. So, 2 is returned back to the previous call.");
  av.step();
 
  av.umsg("Then 2 is added to arr[ n - 1 ] = arr[ 2 - 1 ] = arr[ 1 ] = 4. So, 2 + 4 is 6, and that's returned back."); 
  pseudo.unhighlight(8);
  pseudo.highlight(8);
  setWhite(arr,0);
  setGreen(arr, 1);
  av.step();
  
  av.umsg("Finally, 6  will be added to arr[ n - 1 ] = arr[ 3 - 1 ] = arr[ 2 ] = 6, which is 12, and 12 is the final result of the call. That is the answer expected."); 
  pseudo.unhighlight(8);
  pseudo.highlight(8);
  setWhite(arr,1);
  setGreen(arr, 2);
  av.step();

  av.recorded();
  
}(jQuery));



//==============================================================================================================================
