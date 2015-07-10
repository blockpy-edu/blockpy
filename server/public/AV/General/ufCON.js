/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Union/Find example
$(document).ready(function () {
  var av_name = "ufCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object
  var ind;
  var av = new JSAV(av_name);

  var arr = new Array(10);
  //Initializing the labels
  for (ind = 0; ind < arr.length; ind++) {
    arr[ind] = String.fromCharCode(ind + 65);
  }
  var labels = av.ds.array(arr, {left: 620, top: -50, indexed: true,
                                 layout: 'vertical'});

  //Initializing the parent pointer
  for (ind = 0; ind < arr.length; ind++) {
    arr[ind] = "/";
  }
  var parents = av.ds.array(arr, {left: 675, top: -50, layout: 'vertical'});
  var pseudo = av.code(code);

  //Displaying Tree Nodes
  var newNode;
  var tree = av.ds.tree({left: 50, top: 235, nodegap: 20});
  var root = tree.newNode("X");
  tree.root(root);
  for (ind = 0; ind < arr.length; ind++) {
    newNode = tree.newNode(labels.value(ind));
    newNode.size = 1;   //To maintain the size of each connected component
    root.addChild(newNode);
  }
  root.hide({recursive: false});

  var a = tree.root().child(0);
  var b = tree.root().child(1);
  var c = tree.root().child(2);
  var d = tree.root().child(3);
  var e = tree.root().child(4);
  var f = tree.root().child(5);
  var g = tree.root().child(6);
  var h = tree.root().child(7);
  var i = tree.root().child(8);
  var j = tree.root().child(9);
  tree.layout();

  // Slide 1
  av.umsg("We will now demonstrate a series UNION operations");
  av.displayInit();

  // Slide 2
  //Edge (A, B)
  av.umsg("<b><u>Processing Pair (A, B)</b></u><br>");
  av.step();

  // Slide 3
  av.umsg("The Root of (A) is (A), size(A) = 1<br>", {'preserve': true});
  a.addClass('highlight');
  labels.highlight(0);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 4
  av.umsg("The Root of (B) is (B), size(B) = 1<br>", {'preserve': true});
  b.addClass('highlight');
  labels.highlight(1);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 5
  av.umsg("Union Nodes (A) and (B) <br> Since weights are the same, make second root point to first");
  a.addChild(b);
  parents.value(1, 0);
  tree.layout();
  a.removeClass('highlight');
  b.removeClass('highlight');
  labels.unhighlight(0);
  labels.unhighlight(1);
  pseudo.setCurrentLine("setroot2");
  av.step();

  // Slide 6
  av.umsg("<br>Make size(A) = 2", {'preserve': true});
  pseudo.setCurrentLine("weight2");
  av.step();

  // Slide 7
  //Edge (C, H)
  av.umsg("<b><u>Processing Pair (C, H)</b></u><br>");
  av.step();

  // Slide 8
  av.umsg("The Root of (C) is (C), size(C) = 1<br>", {'preserve': true});
  c.addClass('highlight');
  labels.highlight(2);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 9
  av.umsg("The Root of (H) is (H), size(H) = 1", {'preserve': true});
  h.addClass('highlight');
  labels.highlight(7);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 10
  av.umsg("Union Nodes (C) and (H) <br> Make second root point to first");
  c.addChild(h);
  parents.value(7, 2);
  tree.layout();
  c.removeClass('highlight');
  h.removeClass('highlight');
  labels.unhighlight(2);
  labels.unhighlight(7);
  pseudo.setCurrentLine("setroot2");
  av.step();

  // Slide 11
  av.umsg("<br>Make size(C) = 2", {'preserve': true});
  pseudo.setCurrentLine("weight2");
  av.step();

  // Slide 12
  //Edge (G, F)
  av.umsg("<b><u>Processing Pair (F, G)</b></u><br>");
  av.step();

  // Slide 13
  av.umsg("The Root of (F) is (F), size(F) = 1<br>", {'preserve': true});
  f.addClass('highlight');
  labels.highlight(5);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 14
  av.umsg("The Root of (G) is (G), size(G) = 1", {'preserve': true});
  g.addClass('highlight');
  labels.highlight(6);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 15
  av.umsg("Union Nodes (F) and (G) <br> Make second root point to first");
  f.addChild(g);
  parents.value(6, 5);
  tree.layout();
  f.removeClass('highlight');
  g.removeClass('highlight');
  labels.unhighlight(6);
  labels.unhighlight(5);
  pseudo.setCurrentLine("setroot2");
  av.step();

  // Slide 16
  av.umsg("<br>Make size(F) = 2", {'preserve': true});
  pseudo.setCurrentLine("weight2");
  av.step();

  // Slide 17
  //Edge (F, I)
  av.umsg("<b><u>Processing Pair (F, I)</b></u><br>");
  av.step();

  // Slide 18
  av.umsg("The Root of (F) is (F), size(F) = 2<br>", {'preserve': true});
  f.addClass('highlight');
  labels.highlight(5);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 19
  av.umsg("The Root of (I) is (I), size(I) = 1", {'preserve': true});
  i.addClass('highlight');
  labels.highlight(8);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 20
  av.umsg("Union Nodes (F) and (I) <br> Make (F) the root, as size(F) > size(I)");
  f.addChild(i);
  parents.value(8, 5);
  tree.layout();
  f.removeClass('highlight');
  i.removeClass('highlight');
  labels.unhighlight(5);
  labels.unhighlight(8);
  pseudo.setCurrentLine("setroot2");
  av.step();

  // Slide 21
  av.umsg("<br>Make size(F) = 3", {'preserve': true});
  pseudo.setCurrentLine("weight2");
  av.step();

  // Slide 22
  //Edge (D, E)
  av.umsg("<b><u>Processing Pair (D, E)</b></u><br>");
  av.step();

  // Slide 23
  av.umsg("The Root of (D) is (D), size(D) = 1<br>", {'preserve': true});
  d.addClass('highlight');
  labels.highlight(3);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 24
  av.umsg("The Root of (E) is (E), size(E) = 1", {'preserve': true});
  e.addClass('highlight');
  labels.highlight(4);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 25
  av.umsg("Union Nodes (D) and (E) <br> Since weights are the same, make second root point to first");
  d.addChild(e);
  parents.value(4, 3);
  tree.layout();
  d.removeClass('highlight');
  e.removeClass('highlight');
  labels.unhighlight(3);
  labels.unhighlight(4);
  pseudo.setCurrentLine("setroot2");
  av.step();

  // Slide 26
  av.umsg("<br>Make size(D) = 2", {'preserve': true});
  pseudo.setCurrentLine("weight2");
  av.step();

  // Slide 27
  //Edge (H, A)
  av.umsg("<b><u>Processing Pair (A, H)<b><u><br>");
  av.step();

  // Slide 28
  av.umsg("The Root of (A) is (A), size(A) = 2<br>", {'preserve': true});
  a.addClass('highlight');
  labels.highlight(0);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 29
  av.umsg("The Root of (H) is (C), size(C) = 2<br>", {'preserve': true});
  c.addClass('highlight');
  labels.highlight(2);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 30
  av.umsg("Union Nodes (A) and (H) <br> Since weights are the same, make second root point to first");
  a.addChild(c);
  parents.value(2, 0);
  tree.layout();
  a.removeClass('highlight');
  c.removeClass('highlight');
  labels.unhighlight(0);
  labels.unhighlight(2);
  pseudo.setCurrentLine("setroot2");
  av.step();

  // Slide 31
  av.umsg("<br>Make size(A) = 4", {'preserve': true});
  pseudo.setCurrentLine("weight2");
  av.step();

  // Slide 32
  //Edge (E, G)
  av.umsg("<b><u>Processing Pair (E, G)</b></u><br>");
  av.step();

  // Slide 33
  av.umsg("The Root of (E) is (D), size(D) = 2<br>", {'preserve': true});
  d.addClass('highlight');
  labels.highlight(3);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 34
  av.umsg("The Root of (G) is (F), size(F) = 3<br>", {'preserve': true});
  f.addClass('highlight');
  labels.highlight(5);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 35
  av.umsg("Union Nodes (E) and (G) <br> Make (F) the root, as size(F) > size(D)");
  f.addChild(d);
  parents.value(3, 5);
  tree.layout();
  f.removeClass('highlight');
  d.removeClass('highlight');
  labels.unhighlight(3);
  labels.unhighlight(5);
  pseudo.setCurrentLine("setroot1");
  av.step();

  // Slide 36
  av.umsg("<br>Make size(F) = 5", {'preserve': true});
  pseudo.setCurrentLine("weight1");
  av.step();

  // Slide 37
  //Edge (H, E)
  av.umsg("<b><u>Processing Pair (H, E)<b><u><br>");
  av.step();

  // Slide 38
  av.umsg("The Root of (H) is (A), size(A) = 4<br>", {'preserve': true});
  a.addClass('highlight');
  labels.highlight(0);
  pseudo.setCurrentLine("finda");
  av.step();

  // Slide 39
  av.umsg("The Root of (E) is (F), size(F) = 5<br>", {'preserve': true});
  f.addClass('highlight');
  labels.highlight(5);
  pseudo.setCurrentLine("findb");
  av.step();

  // Slide 40
  av.umsg("Union Nodes (H) and (E) <br> Make (F) the root, as size(F) > size(A)");
  f.addChild(a);
  parents.value(0, 5);
  tree.layout();
  a.removeClass('highlight');
  f.removeClass('highlight');
  labels.unhighlight(0);
  labels.unhighlight(5);
  pseudo.setCurrentLine("setroot1");
  av.step();

  // Slide 41
  av.umsg("<br>Make size(F) = 9", {'preserve': true});
  pseudo.setCurrentLine("weight1");
  av.step();

  // Slide 42
  av.umsg("<br><b>Final UnionFind Data Structure</b>");
  av.recorded();
});
