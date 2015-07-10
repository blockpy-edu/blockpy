/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Union/Find with path compression
$(document).ready(function () {
  var av_name = "pathcompCON";
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
    interpret = config.interpreter;       // get the interpreter
  var ind;

  var av = new JSAV(av_name);

  var arr = new Array(10);
  //Initializing the parent pointer
  for (ind = 0; ind < arr.length; ind++) {
    arr[ind] = "/";
  }
  var parents = av.ds.array(arr, {left: 280, top: -40});

  //Initializing the labels
  for (ind = 0; ind < arr.length; ind++) {
    arr[ind] = String.fromCharCode(ind + 65);
  }
  var labels = av.ds.array(arr, {left: 280, top: 0, indexed: true});

  //Displaying Tree Nodes
  var newNode;
  var tree = av.ds.tree({left: 280, top: 60, nodegap: 20});
  var root = tree.newNode("X");
  tree.root(root);
  for (ind = 0; ind < arr.length; ind++) {
    newNode = tree.newNode(labels.value(ind));
    newNode.size = 1;
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

  // Initialize the example
  //Edge (A, B)
  a.addChild(b);
  parents.value(1, 0);
  //Edge (C, H)
  c.addChild(h);
  parents.value(7, 2);
  //Edge (G, F)
  f.addChild(g);
  parents.value(6, 5);
  //Edge (F, I)
  f.addChild(i);
  parents.value(8, 5);
  //Edge (D, E)
  d.addChild(e);
  parents.value(4, 3);
  //Edge (H, A)
  a.addChild(c);
  parents.value(2, 0);
  //Edge (E, G)
  f.addChild(d);
  parents.value(3, 5);
  tree.layout();

  // Slide 1
  av.umsg("We will show how to union nodes (H) and (E) with path compression");
  av.displayInit();

  // Slide 2
  //Edge (H, E) with path compression
  av.umsg("<b><u>Processing Edge (H, E)<b><u><br>");
  av.step();

  // Slide 3
  av.umsg("The Root of (H) is (A), size(A) = 4<br>", {'preserve': true});
  a.addClass('highlight');
  labels.highlight(0);
  av.step();

  // Slide 4
  av.umsg("The Root of (E) is (F), size(F) = 5<br>", {'preserve': true});
  f.addClass('highlight');
  labels.highlight(5);
  av.step();

  // Slide 5
  av.umsg("<b><u>Change the parent of all the nodes on the path from (H) to (A) to point to (A)</b></u><br>");
  av.step();

  // Slide 6
  av.umsg("Make (A) the parent of (H)<br>", {preserve: true});
  labels.unhighlight(0);
  labels.unhighlight(5);
  a.addChild(h);
  parents.value(7, 0);
  tree.layout();
  av.step();

  // Slide 7
  av.umsg("The parent of (C) is already (A) <br>", {preserve: true});
  av.step();

  // Slide 8
  av.umsg("<b><u>Change the parent of all the nodes on the path from (E) to (F) to point to (F)</b></u><br>");
  av.step();

  // Slide 9
  av.umsg("Make (F) the parent of (E)<br>", {preserve: true});
  f.addChild(e);
  parents.value(4, 5);
  tree.layout();
  av.step();

  // Slide 10
  av.umsg("The parent of (D) is already (F)<br>", {preserve: true});
  av.step();

  // Slide 11
  av.umsg("Union Nodes (H) and (E) <br> Make (F) the root, as size(F) > size(A)");
  f.addChild(a);
  a.removeClass('highlight');
  f.removeClass('highlight');
  tree.layout();
  av.step();

  // Slide 12
  av.umsg("<br><b>Final UnionFind Data Structure</b>");
  av.recorded();
});
