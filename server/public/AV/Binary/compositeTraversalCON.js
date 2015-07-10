/*global ODSA */
"use strict";
// Remove slideshow
$(document).ready(function () {

  function preorder(node) {
    //check if null
    if (typeof node === 'undefined') {
      rt1.arrow.hide();
      av.umsg(interpret("av_isnull"));
      pseudo.setCurrentLine("checknull");
      av.step();
      return;
    }

    //not null, begin traversal
    rt1.target(node, {anchor: "left top"});
    av.umsg(interpret("av_isnotnull"));
    pseudo.setCurrentLine("checknull");
    av.step();

    // figure out which isLeaf to use
    av.umsg(interpret("av_checkleaf"));
    pseudo.setCurrentLine("checknull");
    av.step();

    //check if leaf
    if (!(node.value() === "*" || node.value() === "+" ||
          node.value() === "-")) {
      // is leaf, so we use traverse inside leaf
      rt1.target(node, {anchor: "left top"});
      node.removeClass("processing");
      node.addClass("thicknode");
      av.umsg(interpret("av_isleaf"));
      pseudo.setCurrentLine("leafnodetraverse");
      btLeft += 25;
      av.label("" + node.value(), {left: btLeft, top: 380}).show();
      av.step();
    } else {
      //is internal...visit
      rt1.target(node, {anchor: "left top"});
      av.umsg(interpret("av_isnotleaf"));
      pseudo.setCurrentLine("internalnodetraverse");
      av.step();

      av.umsg(interpret("av_visitinternal"));
      pseudo.setCurrentLine("internalnodevisit");
      node.removeClass("processing");
      node.addClass("thicknode");
      btLeft += 25;
      av.label("" + node.value(), {left: btLeft, top: 380}).show();
      av.step();

      //left
      rt1.target(node.left(), {anchor: "left top"});
      av.umsg(interpret("av_traverseleft"));
      pseudo.setCurrentLine("internalnodelefttraverse");
      node.addClass("processing");
      av.step();
      preorder(node.left());
    
      //right child
      rt1.target(node, {anchor: "left top"});
      av.umsg(interpret("av_traverseright"));
      pseudo.setCurrentLine("internalnoderighttraverse");
      node.addClass("thicknode");
      av.step();
      preorder(node.right());
    }

    //finish
    rt1.target(node, {anchor: "left top"});
    node.removeClass("processing");
    av.umsg(interpret("av_done") + node.value() + ".");
    pseudo.setCurrentLine("endtraverse");
    av.step();
  }

  var av_name = "compositeTraversalCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var av = new JSAV(av_name);
  var pseudo = av.code(code);

  var bt = av.ds.binarytree({visible: true, nodegap: 15});
  bt.root("-");
  var rt = bt.root();
  rt.addClass("internalnode");
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
  var btLeft = 20;
  
  av.umsg(interpret("av_preorder"));
  pseudo.setCurrentLine("traverse");
  av.displayInit();

  preorder(rt);

  av.recorded();

});
