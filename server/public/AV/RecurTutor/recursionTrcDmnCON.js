"use strict";

//===============================================================================================================================
// Visualization of the basic principle of Domino Effect 
(function ($) {

  var av = new JSAV("recursionTrcDmnCON");
  // Show the Domino Effect recursively  on a figure too
  var rect = av.g.rect(100, 30, 50, 90).css({"fill": "grey"});
  var rect1 = av.g.rect(200, 30, 50, 90).css({"fill": "grey"});
  var rect2 = av.g.rect(300, 30, 50, 90).css({"fill": "grey"});
   
  var dots1 = av.g.circle(400, 75, 2);
  var dots2 = av.g.circle(450, 75, 2);
  var dots3 = av.g.circle(500, 75, 2);
  var dots4 = av.g.circle(550, 75, 2);

  var rect4 = av.g.rect(600, 30, 50, 90).css({"fill": "grey"});
  var rect5 = av.g.rect(700, 30, 50, 90).css({"fill": "grey"});

  
  av.umsg("To model the domino effect recursively, think of it as to tip n dominos over. For symbolization, let's use the functional notation Domino(n) to represent the correspondent solution. Thus, Domino(1) is the solution to tip a single domino over, Domino(2) is the solution to tip two, Domino(3) is the solution to tip three.");
 
  var  pseudo = av.code("Domino(n){\n If(n == 1) \n  manually tip the domino over.\n else{\n  Domino(n-1) //to tip the first (n-1) dominos over\n  the nth domino will be tipped over subsequently //where 1 < n <= N\n  }\n}" , {lineNumbers:false , top:130 , left:100}); 
  av.displayInit();
  av.step();
  
  av.umsg("If there is only one domino, it is easy enough to tip it over manually. Let’s think of that Domino(1) is solved nonrecursively.");
  rect.hide();
  var rect6 = av.g.rect(120, 30, 50, 90).css({"fill": "lightgray"});
  rect6.rotate(45);
  pseudo.highlight(2);
   pseudo.highlight(3);
  av.step();
  
  av.umsg("If there are two dominos, after the first domino is tipped over the second domino will be tipped over subsequently. So, Domino(2) is solved by executing Domino(1) first followed by tipping the second domino over");
  pseudo.unhighlight(2);
  pseudo.unhighlight(3);
  rect1.hide();
  var rect7 = av.g.rect(220, 30, 50, 90).css({"fill": "lightgray"});
  rect7.rotate(45);
  av.step();  
  av.umsg("Similarly, if there are three dominos, after the first and second dominos are tipped over, the third domino will be tipped over subsequently. So, Domino(3) is solved by executing Domino(2) first followed by tipping the third domino over.");
  rect2.hide();
  var rect8 = av.g.rect(320, 30, 50, 90).css({"fill": "lightgray"});
  rect8.rotate(45);
  av.step();

  av.umsg("More generally, Domino(n) is solved by executing Domino(n-1) first followed by tipping the nth domino over, where 1 < n ≤ N."); 
  
  
  
  av.step();
  pseudo.unhighlight(2);
  pseudo.highlight(5);
  pseudo.highlight(6);
  rect4.hide();
  rect5.hide();
  var rect9 = av.g.rect(620, 30, 50, 90).css({"fill": "lightgray"});
  rect9.rotate(45);
  var rect10 = av.g.rect(720, 30, 50, 90).css({"fill": "lightgray"});
  rect10.rotate(45);

  av.step();

  av.recorded();
  
}(jQuery));



//==============================================================================================================================
