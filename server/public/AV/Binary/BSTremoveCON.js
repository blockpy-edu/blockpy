/*global ODSA */
"use strict";
// Remove slideshow
$(document).ready(function () {
  var av_name = "BSTremoveCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);
  var temp1;

  var bt = av.ds.binarytree({visible: true, nodegap: 15});
  bt.root(37);
  var rt = bt.root();
  rt.left(24);
  rt.left().left(7);
  rt.left().left().left(2);
  rt.left().right(32);
  rt.left().right().left(30);
  rt.right(42);
  rt.right().left(42);
  rt.right().left().left(40);
  rt.right().right(120);

  bt.layout();

  var rt1 = av.pointer("rt", bt.root(), {anchor: "left top", top: -10});

  // Slide 1
  av.umsg("Let's look a few examples for removehelp. We will start with an easy case. Let's see what happens when we delete 30 from this tree.");
  pseudo.setCurrentLine("sig");
  av.displayInit();

  // Slide 2
  av.umsg("As always, the first thing that we do is check if the root is null. Since it is not, we are going to be recursively descending the tree until we find the value that we are looking for (if it exists).");
  pseudo.setCurrentLine("checknull");
  av.step();

  // Slide 3
  av.umsg("Compare the root value of 37 to the value that we want to delete (30). Since 37 is greater, we will left.");
  pseudo.setCurrentLine("visitleft");
  av.step();

  // Slide 4
  rt.addClass("processing");
  rt1.target(rt.left());
  av.umsg("Now we start the recursive call on removehelp with 24 as the root.");
  pseudo.setCurrentLine("sig");
  av.step();

  // Slide 5
  av.umsg("The subtree is not null");
  pseudo.setCurrentLine("checknull");
  av.step();

  // Slide 6
  av.umsg("Compare rt's value of 24 against the search key value of 32. 24 is not greater than 32.");
  pseudo.setCurrentLine("checkless");
  av.step();

  // Slide 7
  av.umsg("So check whether 24 is less than the search key of 32.");
  pseudo.setCurrentLine("checkgreater");
  av.step();

  // Slide 8
  av.umsg("Since 24 is less than the value we want to delete (30), we wil make a recursive call on the right subtree.");
  pseudo.setCurrentLine("visitright");
  av.step();

  // Slide 9
  rt.left().addClass("processing");
  rt1.target(rt.left().right(), {anchor: "right top"});
  av.umsg("Now we start the recursive call on removehelp with 32 as the root.");
  pseudo.setCurrentLine("sig");
  av.step();

  // Slide 10
  av.umsg("The subtree is not null");
  pseudo.setCurrentLine("checknull");
  av.step();

  // Slide 11
  av.umsg("Since 32 is greater than the value we want to delete (30), we will go left.");
  pseudo.setCurrentLine("visitleft");
  av.step();

  // Slide 12
  rt.left().right().addClass("processing");
  rt1.target(rt.left().right().left(), {anchor: "left top"});
  pseudo.setCurrentLine("sig");
  av.umsg("Start the recursive call again. As usual, we are going to check if the root is null, then if its value is greater or less than what we want to delete");
  av.step();

  // Slide 13
  av.umsg("This time, we have found the value that we want to delete.");
  pseudo.setCurrentLine("found");
  av.step();

  // Slide 14
  av.umsg("Since the value of the left child of 30 is null, we can just return that node's right pointer back to the parent. Since the node with value 30 is a leaf node, that right pointer also happens to be null.");
  pseudo.setCurrentLine("checkleft");
  av.step();
  
  // Slide 15
  av.umsg("Unwind the recursion, and set the left pointer of the node with value of 32");
  rt.left().right().removeClass("processing");
  rt1.target(rt.left().right(), {anchor: "right top"});
  rt.left().right().left(null);
  pseudo.setCurrentLine("visitleft");
  av.step();

  // Slide 16
  av.umsg("Unwind the recursion, and set the right pointer of the node with value of 24");
  var temp = rt.left().edgeToRight();
  temp.addClass("rededge");
  rt.left().removeClass("processing");
  rt1.target(rt.left(), {anchor: "left top"});
  pseudo.setCurrentLine("visitright");
  av.step();

  // Slide 17
  av.umsg("Unwind the recursion, and set the left pointer of the node with value of 37");
  temp1 = rt.edgeToLeft();
  temp1.addClass("rededge");
  rt.removeClass("processing");
  rt1.target(rt);
  pseudo.setCurrentLine("visitleft");
  av.step();

  // Slide 18
  av.umsg("Now we return from the initial call to removehelp, setting the root of the tree to the result");
  rt1.arrow.addClass("thinredline");
  // This line should not be needed, but it is here to fix Raphael bug with arrows
  rt1.arrow.css({"stroke": "red"});
  pseudo.setCurrentLine("end");
  av.step();

  // Slide 19
  av.umsg("Now let's try something a little bit harder. We will see what happens when we remove 32. We won't show all of the details of direction tests and the multiple recursive calls this time.");
  pseudo.setCurrentLine("sig");
  pseudo.unhighlight("end");
  rt1.arrow.removeClass("thinredline");
  // This line should not be needed, but it is here to fix Raphael bug with arrows
  rt1.arrow.css({"stroke": "black"});
  temp.removeClass("rededge");
  temp1.removeClass("rededge");
  rt.left().right().left(30);
  bt.layout();
  av.step();

  // Slide 20
  av.umsg("As always, the first thing that we do is check if the root is null. Since it is not, we are going to be recursively descending the tree until we find the value that we are looking for (if it exists).");
  pseudo.setCurrentLine("checknull");
  av.step();

  // Slide 21
  av.umsg("Since 37 is greater than the value we want to delete (32), we go left.");
  pseudo.setCurrentLine("visitleft");
  rt.addClass("processing");
  rt1.target(rt.left());
  av.step();

  // Slide 22
  av.umsg("Since 24 is less than the value we want to delete (32), we go right.");
  pseudo.setCurrentLine("visitright");
  rt.left().addClass("processing");
  rt1.target(rt.left().right(), {anchor: "right top"});
  av.step();

  // Slide 23
  av.umsg("Now we have found the value that we want to delete.");
  pseudo.setCurrentLine("found");
  av.step();

  // Slide 17
  av.umsg("We check, and the left child is not null.");
  pseudo.setCurrentLine("checkleft");
  av.step();

  // Slide 18
  av.umsg("We check and find that the right child is null. So we can just return a pointer to the left child.");
  pseudo.setCurrentLine("checkright");
  av.step();

  // Slide 19
  av.umsg("Unwind the recursion, and set the right pointer of the node with value of 24");
  rt.left().removeClass("processing");
  rt1.target(rt.left(), {anchor: "left top"});
  rt.left().right(rt.left().right().left());
  temp = rt.left().edgeToRight();
  pseudo.setCurrentLine("visitright");
  temp.addClass("rededge");
  bt.layout();
  av.step();

  // Slide 18
  av.umsg("Unwind the recursion, and set the left pointer of the node with value of 37");
  temp1 = rt.edgeToLeft();
  temp1.addClass("rededge");
  rt.removeClass("processing");
  rt1.target(rt);
  pseudo.setCurrentLine("visitleft");
  av.step();

  // Slide 19
  av.umsg("Now we return from the initial call to removehelp, setting the root of the tree to the result");
  rt1.arrow.addClass("thinredline");
  // This line should not be needed, but it is here to fix Raphael bug with arrows
  rt1.arrow.css({"stroke": "red"});
  pseudo.setCurrentLine("end");
  av.step();

  // Slide 20
  av.umsg("Finally, let's see what happens when we delete the root node.");
  pseudo.unhighlight("end");
  pseudo.setCurrentLine("sig");
  rt1.arrow.removeClass("thinredline");
  // This line should not be needed, but it is here to fix Raphael bug with arrows
  rt1.arrow.css({"stroke": "black"});
  temp.removeClass("rededge");
  temp1.removeClass("rededge");
  rt.left().right().left(30);
  rt.left().right().value(32);
  bt.layout();
  av.step();

  // Slide 21
  av.umsg("First we find that the root pointer is not null.");
  pseudo.setCurrentLine("checknull");
  av.step();

  // Slide 22
  av.umsg("Then we find that the root value is not less than what we want to delete.");
  pseudo.setCurrentLine("checkless");
  av.step();

  // Slide 23
  av.umsg("Then we find that the root value is not greater than what we want to delete.");
  pseudo.setCurrentLine("checkgreater");
  av.step();

  // Slide 24
  av.umsg("So the root node contains the value that we want to delete.");
  pseudo.setCurrentLine("found");
  av.step();

  // Slide 25
  av.umsg("The left child is not null.");
  pseudo.setCurrentLine("checkleft");
  av.step();

  // Slide 26
  av.umsg("The right child is not null.");
  pseudo.setCurrentLine("checkright");
  av.step();

  // Slide 27
  av.umsg("So now we know that we have the hard case to deal with.");
  pseudo.setCurrentLine("twochildren");
  av.step();

  // Slide 28
  av.umsg("Call getmax to set a temporary variable to point to the node with the greatest value in the left subtree.");
  pseudo.setCurrentLine("getmax");
  var tnode = rt.left().right();
  tnode.addClass("processing");
  var rt2 = av.pointer("temp", tnode, {anchor: "right top", top: -10});
  av.step();

  // Slide 29
  av.umsg("Now set the root value to what was returned by getmax.");
  pseudo.setCurrentLine("setelement");
  av.effects.moveValue(tnode, rt);
  rt.addClass("rednode");
  av.step();

  // Slide 30
  av.umsg("Now call deletemax to remove the node with the maximum value in the left subtree. Set the root node's left pointer to point to the resulting subtree.");
  pseudo.setCurrentLine("setleft");
  rt.left().right(rt.left().right().left());
  temp = rt.left().edgeToRight();
  temp.addClass("rededge");
  temp1 = rt.edgeToLeft();
  temp1.addClass("rededge");
  rt2.hide();
  bt.layout();
  av.step();

  // Slide 31
  av.umsg("We are now done deleting the old root node. Removehelp will return a pointer to this tree. The calling function will then set the BST root to point to this new tree.");
  pseudo.setCurrentLine("return");
  rt1.arrow.addClass("thinredline");
  // This line should not be needed, but it is here to fix Raphael bug with arrows
  rt1.arrow.css({"stroke": "red"});
  av.recorded();
});
