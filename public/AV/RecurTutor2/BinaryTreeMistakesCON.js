/*global ODSA */
"use strict";
$(document).ready(function () {
  var av = new JSAV("BinaryTreeMistakesCON");
  
  var pseudo = av.code({url: "../../../SourceCode/Java/RecurTutor2/RecBTMistakes.java",
                       lineNumbers: false, top: 0, left: 100});

  // Slide 1
  av.umsg("When you write a recursive method that traverses a binary tree, you should avoid the following common mistakes");
  av.displayInit();   
    
  // Slide 2
  av.umsg("Do not forget to check if the root is null");
  pseudo.highlight(2);
  av.step();
  
  // Slide 3
  av.umsg("Do not check if the children are null when your solution doesn't require that you explicitly do that");
  pseudo.unhighlight(2);
  pseudo.highlight([5, 10]);
  av.step();
  
  // Slide 4
  av.umsg("Do not access the children's values when your solution doesn't require that you explicitly do that");
  pseudo.unhighlight([5, 10]);
  pseudo.highlight([6, 11]);
  av.recorded();
});
