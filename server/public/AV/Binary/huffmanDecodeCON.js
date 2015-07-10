/*global ODSA */
"use strict";
// Show how to decode the word "DEED"
$(document).ready(function () {
  // Constructs the standard tree used in the slideshow
  function construct_tree(av) {
    var t = av.ds.binarytree({nodegap: 25, top: -40});
    var r = t.root("");

    // constructs tree
    r.left("E<br>120");
    r.right("").right("").right("").right("").right("M<br>24");
    r.right().left("").left("U<br>37");
    r.right().left().right("D<br>42");
    r.right().right().left("L<br>42");
    r.right().right().right().left("C<br>32");
    r.right().right().right().right().left("");
    r.right().right().right().right().left().left("Z<br>2");
    r.right().right().right().right().left().right("K<br>7");

    // Add more classes for leaf nodes for css styling
    r.left().addClass("huffmanleaf");
    r.right().right().right().right().right().addClass("huffmanleaf");
    r.right().left().left().addClass("huffmanleaf");
    r.right().left().right().addClass("huffmanleaf");
    r.right().right().left().addClass("huffmanleaf");
    r.right().right().right().left().addClass("huffmanleaf");
    r.right().right().right().right().left().left().addClass("huffmanleaf");
    r.right().right().right().right().left().right().addClass("huffmanleaf");

    // Add edge labels
    r.edgeToLeft().label("0");
    r.edgeToRight().label("1");
    r.right().edgeToLeft().label("0");
    r.right().left().edgeToLeft().label("0");
    r.right().left().edgeToRight().label("1");
    r.right().edgeToRight().label("1");
    r.right().right().edgeToLeft().label("0");
    r.right().right().edgeToRight().label("1");
    r.right().right().right().edgeToLeft().label("0");
    r.right().right().right().edgeToRight().label("1");
    r.right().right().right().right().edgeToRight().label("1");
    r.right().right().right().right().edgeToLeft().label("0");
    r.right().right().right().right().left().edgeToLeft().label("0");
    r.right().right().right().right().left().edgeToRight().label("1");

    return t;
  }

  var av_name = "huffmanDecodeCON";
  var config = ODSA.UTILS.loadConfig(
                {"av_name": av_name, "json_path": "AV/Binary/huffman.json"}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);

  var t = construct_tree(av);
  var r = t.root();

  // Slide 1
  av.umsg(interpret("av_c8"));
  t.layout();
  av.displayInit();

  // Slide 2
  av.umsg(interpret("av_c9"));
  av.step();
  
  // Slide 3
  av.umsg(interpret("av_c10") + interpret("av_c11"));
  r.highlight();
  av.step();

  // Slide 4
  av.umsg(interpret("av_c10") + interpret("av_c12"));
  r.right().highlight();
  av.step();

  // Slide 5
  av.umsg(interpret("av_c10") + interpret("av_c13"));
  r.right().left().highlight();
  av.step();

  // Slide 6
  av.umsg(interpret("av_c10") + interpret("av_c14"));
  r.right().left().right().highlight();
  av.step();

  // Slide 7
  av.umsg(interpret("av_c10") + interpret("av_c15"));
  av.step();

  // Slide 8
  av.umsg(interpret("av_c10") + interpret("av_c16"));
  r.right().unhighlight();
  r.right().left().unhighlight();
  r.right().left().right().unhighlight();
  av.step();

  // Slide 9
  av.umsg(interpret("av_c10") + interpret("av_c17"));
  r.left().highlight();
  av.step();

  // Slide 10
  av.umsg(interpret("av_c10") + interpret("av_c18"));
  av.step();

  // Slide 11
  r.left().unhighlight();
  av.umsg(interpret("av_c10") + interpret("av_c19"));
  av.step();

  // Slide 12
  av.umsg(interpret("av_c10") + interpret("av_c20"));
  r.left().highlight();
  av.step();

  // Slide 13
  av.umsg(interpret("av_c10") + interpret("av_c21"));
  r.left().unhighlight();
  av.step();

  // Slide 14
  av.umsg(interpret("av_c10") + interpret("av_c22"));
  r.right().highlight();
  av.step();

  // Slide 15
  av.umsg(interpret("av_c10") + interpret("av_c23"));
  r.right().left().highlight();
  av.step();

  // Slide 16
  av.umsg(interpret("av_c10") + interpret("av_c22"));
  r.right().left().right().highlight();
  av.step();

  // Slide 17
  av.umsg(interpret("av_c24"));
  av.recorded();
}(jQuery));
