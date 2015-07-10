"use strict";
//===============================================================================================================================
// Showing how sum returns to the base case and then unwind
(function ($) {

  var av = new JSAV("recursionTrcSum2CON");
  av.umsg("The tracing eventually gets down to the base case. All calls eventually reach the base case and if there is more than one base case, it reaches one of the base cases.");
 
  var pseudo = av.code({url: "../../../SourceCode/Java/RecurTutor/Recsum.java",
                       lineNumbers: false,});
  pseudo.highlight(3);
  av.displayInit();
  av.step();
  av.umsg("Thus, the value returned by the base case is important.");
  pseudo.unhighlight(3);
  pseudo.highlight(4);
  av.step();


  av.umsg("It’s helpful to label recursive calls. You do this to keep track of what’s going on. Recall that a recursive call, like any other function call, eventually returns back to the point of being called. However, since you’re calling the same function, it’s easy to make mistakes when tracing the code.");
  pseudo.unhighlight(4);
  pseudo.highlight(7);
  av.step();
  
  av.umsg("Recursion involves a 'winding' phase where the calls are progressively getting closer to the base case, and you are getting to smaller and smaller problems, and an 'unwinding' phase, when you begin to return back to the original call. It’s usually in the 'unwinding' phase where the solution is generated.");
  pseudo.unhighlight(7);
  pseudo.highlight(8);
  av.step();
  
  
  av.recorded();
  
}(jQuery));



//==============================================================================================================================
