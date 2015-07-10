"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
$(document).ready(function () {
  var av = new JSAV("UFfigCON", {"animationMode": "none"});
  var ind;

  var arr1 = [5, 0, 0, 5, 3, "/", 5, 2, 5, "/"];
  var parents = av.ds.array(arr1, {top: -10});

  var arr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  var labels = av.ds.array(arr, {top: 25, indexed: true, center: true});

  //Displaying Tree Nodes
  var newNode;
  var tree = av.ds.tree({top: 100, center: true, nodegap: 20});
  var root = tree.newNode("X");
  tree.root(root); // This "root" node will be hidden

  for (ind = 0; ind < arr.length; ind++) {
    newNode = tree.newNode(labels.value(ind));
    root.addChild(newNode);
  }

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

  f.addChild(g);
  f.addChild(i);
  f.addChild(d);
  d.addChild(e);
  f.addChild(a);
  a.addChild(b);
  a.addChild(c);
  c.addChild(h);
  root.hide({recursive: false});
  tree.layout();
});
