"use strict";
  
//===============================================================================================================================
// Visualization of Domino Effect to Print a sequence of integers
(function ($) {

  var av = new JSAV("recursionTrcDmnPrntCON");
  var rect = av.g.rect(100, 30, 50, 90).css({"fill": "grey"});
  var rect1 = av.g.rect(200, 30, 50, 90).css({"fill": "grey"});
  var rect2 = av.g.rect(300, 30, 50, 90).css({"fill": "grey"});
   
  var dots1 = av.g.circle(400, 75, 2);
  var dots2 = av.g.circle(450, 75, 2);
  var dots3 = av.g.circle(500, 75, 2);
  var dots4 = av.g.circle(550, 75, 2);

  var rect4 = av.g.rect(600, 30, 50, 90).css({"fill": "grey"});
  var rect5 = av.g.rect(700, 30, 50, 90).css({"fill": "grey"});

  av.umsg("To apply Domino effect solving technique, it is assumed that there is a sequence of integers, from 1 to N, hidden behind the dominos, and the only way to see the integer behind a domino is tipping its front domino over");
 
  var  pseudo = av.code("PrintOneToN(n){\n If(n==1)\n  print 1\n else{\n  PrintOneToN(n-1) //to print integers from 1 to n-1\n  print n //where 1<n≤N\n  }\n}" , {lineNumbers:false , top:130 , left:150}); 
  av.displayInit();
  av.step();
  av.umsg("Since the first domino has to be tipped over manually, the solution for the base case, PrintOneToN(1), is solved nonrecursively by printing 1.");

  //var rect = av.g.rect(100, 30, 50, 90).css({"fill": "white", "opacity":"0.03"});
  rect.hide();
  var rect6 = av.g.rect(125, 30, 50, 90).css({"fill": "lightgray"});
  rect6.rotate(55);
  av.label("1",  {"top": "20px", "left": "120px"}).css({'font-size': '15px', "text-align": "center"});
  pseudo.highlight(3);
  
  av.step();

  av.umsg("For any other domino, before a domino is tipped over all of its preceded dominos have to be tipped over and then the current domino will be tipped over subsequently.")
  pseudo.highlight(5);
  pseudo.highlight(6);
  pseudo.unhighlight(3);
  
  rect1.hide();
  var rect7 = av.g.rect(225, 30, 50, 90).css({"fill": "lightgray"});
  rect7.rotate(55);
  av.label("2",  {"top": "20px", "left": "220px"}).css({'font-size': '15px', "text-align": "center"});

  rect2.hide();
  var rect8 = av.g.rect(325, 30, 50, 90).css({"fill": "lightgray"});
  rect8.rotate(55);
  av.label("3",  {"top": "20px", "left": "320px"}).css({'font-size': '15px', "text-align": "center"});
  

  rect4.hide();
  var rect9 = av.g.rect(625, 30, 50, 90).css({"fill": "lightgray"});
  rect9.rotate(55);
  av.label("N-1",  {"top": "20px", "left": "620px"}).css({'font-size': '15px', "text-align": "center"});

  rect5.hide();
  var rect10 = av.g.rect(725, 30, 50, 90).css({"fill": "lightgray"});
  rect10.rotate(55);
  av.label("N",  {"top": "20px", "left": "720px"}).css({'font-size': '15px', "text-align": "center"});

  av.recorded();
  
}(jQuery));



//==============================================================================================================================
