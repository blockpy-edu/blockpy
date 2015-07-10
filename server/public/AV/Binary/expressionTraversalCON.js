/*global ODSA */
"use strict";
// Traverse an expression tree
$(document).ready(function () {

  function preorder(node) {
    //check if null
    if (typeof node === "undefined") {
      rt1.arrow.hide();
      av.umsg(interpret("av_isnull"));
      pseudo.setCurrentLine("checknull");
      av.step();
      return;
    }

    //not null, check if leaf
    rt1.target(node, {anchor: "left top"});
    av.umsg(interpret("av_isnotnull"));
    pseudo.setCurrentLine("isleaf");
    av.step();

    //is leaf...
    if (!(node.value() === "*" || node.value() === "+" ||
          node.value() === "-")) {
      rt1.target(node, {anchor: "left top"});
      node.removeClass("processing");
      node.addClass("thicknode");
      av.umsg(interpret("av_visitleaf"));
      pseudo.setCurrentLine("visitleaf");
      btLeft += 25;
      av.label("" + node.value(), {left: btLeft, top: 250}).show();
      av.step();
    } else {
      //is internal...visit
      rt1.target(node, {anchor: "left top"});
      node.removeClass("processing");
      node.addClass("thicknode");
      av.umsg(interpret("av_visitinternal"));
      pseudo.setCurrentLine("visitinternal");
      btLeft += 25;
      av.label("" + node.value(), {left: btLeft, top: 250}).show();
      av.step();

      //left
      rt1.target(node.left(), {anchor: "left top"});
      av.umsg(interpret("av_traverseleft"));
      pseudo.setCurrentLine("traverseleft");
      node.addClass("processing");
      av.step();
      preorder(node.left());
    
      //right child
      rt1.target(node, {anchor: "left top"});
      av.umsg(interpret("av_traverseright"));
      pseudo.setCurrentLine("traverseright");
      node.addClass("thicknode");
      av.step();
      preorder(node.right());
    }

    //finish
    rt1.target(node, {anchor: "left top"});
    node.removeClass("processing");
    av.umsg(interpret("av_done") + node.value());
    pseudo.setCurrentLine("end");
    av.step();
  }

  var av_name = "expressionTraversalCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  var bt = av.ds.binarytree({visible: true, nodegap: 15});
  bt.root("-");
  bt.root().addClass("internalnode");
  var rt = bt.root();
  rt.left("*");
  rt.left().addClass("internalnode");
  rt.right("c");
  rt.left().left("*");
  rt.left().left().addClass("internalnode");
  rt.left().left().left("4");
  rt.left().left().right("x");
  rt.left().right("+");
  rt.left().right().addClass("internalnode");
  rt.left().right().right("a");
  rt.left().right().left("*");
  rt.left().right().left().addClass("internalnode");
  rt.left().right().left().left("2");
  rt.left().right().left().right("x");
  bt.layout();

  var rt1 = av.pointer("rt", bt.root(), {anchor: "left top", top: -10});
  var btLeft =  20;
  
  av.umsg(interpret("av_preorder"));
  pseudo.setCurrentLine("sig");
  av.displayInit();

  preorder(rt);

  av.recorded();
});
