/*global ODSA */
"use strict";
$(document).ready(function () {
  var av = new JSAV("SumBinaryTreeCON");
  // Setup the tree
  var btTop = 100;
  var btLeft = 305;
  var bt = av.ds.binarytree({nodegap: 15, top: btTop, left: btLeft});
  bt.root('20');
  var rt = bt.root();
  rt.left('5');
  rt.left().right('30');
  rt.left().left('15');
  
  rt.right('10');
  rt.right().left('40');
  rt.right().right('25');

  bt.layout();
  
  av.umsg("Suppose that you want to compute the sum of the values stored in a binary tree.");
  var label1 = av.label("You", {left: 345, top: 0}); // create a label for the icon
  av.displayInit();
  
  av.umsg("You will ask two friends to help you.");
  av.step();
  
  av.umsg("The first friend will take the left sub-tree to sum it."); 
  var label2 = av.label("1st friend", {left: 145, top: 150}); // create a label for the icon
  var line1= av.g.line(230 ,  180, 290,  200, {"stroke-width": "2", "arrow-end": "classic"});
  av.g.ellipse(339, 208, 50 , 50).css({fill: "green", opacity: 0.2});
  av.step();
  
  av.umsg("The second friend will take the right sub-tree to sum it");
  var label3 = av.label("2nd friend", {left: 550, top: 150}); // create a label for the icon 
  var line2= av.g.line(550 ,  170, 490,  200, {"stroke-width": "2", "arrow-end": "classic"});
  av.g.ellipse(442, 208, 50 , 50).css({fill: "purple", opacity: 0.2});
  av.step();
  
  label2.hide();
  label3.hide();
  line1.hide();
  line2.hide();
  var label2 = av.label("Sum = 50", {left: 145, top: 150}); // create a label for the icon
  var line1= av.g.line(230,180, 370, 100, {"stroke-width": "2", "arrow-end": "classic"});
  av.umsg("The first friend will return the sum of  the left sub-tree");
  av.step();
  
  var label3 = av.label("Sum = 75", {left: 550, top: 150}); // create a label for the icon 
  var line2= av.g.line(550 ,  170, 410,  100, {"stroke-width": "2", "arrow-end": "classic"});
  av.umsg("The second friend will return the sum of  the left sub-tree");
  
  av.step();
  label1.hide();
  av.umsg("You will simply sum the root value to the sums received from your friends.");
  
  var label1 = av.label("Sum= 20 + 50 + 75", {left: 345, top: 0}); // create a label for the icon
  
  av.recorded();
});
