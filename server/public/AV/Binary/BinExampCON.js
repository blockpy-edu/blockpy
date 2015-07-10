/*global ODSA */
"use strict";
$(document).ready(function () {
  var av = new JSAV("BinExampCON", {"animationMode": "none"});
  // Setup the tree
  var btTop = 10;
  var btLeft = 305;
  var bt = av.ds.binarytree({nodegap: 15, top: btTop, left: btLeft});
  bt.root('A');
  var rt = bt.root();
  rt.left('B');
  rt.left().right('D');
  
  rt.right('C');
  rt.right().left('E');
  rt.right().left().left('G');
  rt.right().right('F');
  rt.right().right().left('H');
  rt.right().right().right('I');

  bt.layout();
});
