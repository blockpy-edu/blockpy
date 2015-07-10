"use strict";
  
//===============================================================================================================================
// Visualization of Domino Effect to Count the number of digits in an integer
(function ($) {

  var av = new JSAV("recursionTrcDmnCntCON");
  var rect = av.g.rect(150, 30, 50, 90).css({"fill": "grey"});

  var dot = av.g.circle(270, 75, 2);
  var dots0 = av.g.circle(320, 75, 2);
  var dots1 = av.g.circle(370, 75, 2);
  var dots2 = av.g.circle(420, 75, 2);
  
 
  var rect3 = av.g.rect(500, 30, 50, 90).css({"fill": "grey"});
  var rect4 = av.g.rect(600, 30, 50, 90).css({"fill": "grey"});
  var rect5 = av.g.rect(700, 30, 50, 90).css({"fill": "grey"});

  av.umsg("To apply Domino effect solving technique, it is assumed that the digits within the integer, from most significant to lest significant, are hidden behind the dominos. The dominos are tipped over from right to left, so that tipping over dominos can be imagined as counting digits from the least significant to the most significant.");
 
  var  pseudo = av.code("NumOfDig(n){\n If(0≤n≤9) \n  result = 1\n else{\n  result = NumOfDig( floor(n / 10) ) + 1  //where n≥10.  }\n}" , {lineNumbers:false , top:130 , left:150}); 
  av.displayInit();
  av.step();
  av.umsg("Since the first domino has to be tipped over manually, the solution for the base case, NumOfDig(0≤n≤9), is counted nonrecursively and the result is 1 ");

  rect5.hide();
  var rect10 = av.g.rect(675, 34, 50, 95).css({"fill": "lightgray"});
  rect10.rotate(-55);
  av.label("1's digit",  {"top": "6px", "left": "700px"}).css({'font-size': '15px', "text-align": "center"});
  pseudo.highlight(3);
  av.step();

  av.umsg("For any other domino, before a domino is tipped over all of its preceded dominos have to be tipped over and then the current domino will be tipped over. So a recursive case, NumOfDig(n), can be solved recursively by performing NumOfDig( floor(n / 10) ) first and then adding 1 to the result.");
  pseudo.highlight(5);
  pseudo.unhighlight(3);
  

  rect4.hide();
  var rect11 = av.g.rect(575, 34, 50, 95).css({"fill": "lightgray"});
  rect11.rotate(-55);
  av.label("10's digit",  {"top": "6px", "left": "600px"}).css({'font-size': '15px', "text-align": "center"});

  av.step();
  
  rect3.hide();
  var rect12 = av.g.rect(475, 34, 50, 95).css({"fill": "lightgray"});
  rect12.rotate(-55);
  av.label("100's digit",  {"top": "6px", "left": "500px"}).css({'font-size': '15px', "text-align": "center"});

  av.step();
  
  rect.hide();
  var rect13 = av.g.rect(125, 34, 50, 95).css({"fill": "lightgray"});
  rect13.rotate(-55);
  av.label("10^n's digit",  {"top": "6px", "left": "150px"}).css({'font-size': '15px', "text-align": "center"});
 
  av.recorded();
  
}(jQuery));



//==============================================================================================================================
