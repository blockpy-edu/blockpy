/*global ODSA */
"use strict";
// Dlist Insertion
$(document).ready(function () {
  var av = new JSAV('dlistInsertCON');
  var pseudo = av.code({
      url: '../../../SourceCode/Processing/Lists/Dlist.pde',
      lineNumbers: false,
      startAfter: '/* *** ODSATag: DListInsert *** */',
      endBefore: '/* *** ODSAendTag: DListInsert *** */'
    });
  // Relative offsets
  var leftMargin = 150;
  var topMargin = 10;
  // Box "it"
  var itLabel = av.label('it', {
      left: 20,
      top: -15,
      'font-size': '20px'
    });
  var itBox = av.ds.array(['15'], {
      indexed: false,
      layout: 'array',
      top: -20,
      left: 40
    });
  itBox.highlight();
  // JSAV list
  var l = av.ds.dlist({
      'nodegap': 30,
      'center': false,
      'left': leftMargin,
      'top': topMargin
    });
  l.addFirst('null').addFirst(10).addFirst(35).addFirst(8).addFirst(23).addFirst('null');
  l.layout();
  l.get(0).odsa_addSlash('left');
  var tailSlash = l.get(5).odsa_addSlash();
  var Vline = l.get(2).odsa_addVLine();
  var Vline1 = l.get(2).odsa_addVLine({ left: l.get(2).element.outerWidth() });
  var Vline2 = l.get(2).odsa_addVLine({ top: 25 });
  Vline1.hide();
  Vline2.hide();
  setPointer('head', l.get(0));
  var curr = setPointer('curr', l.get(2));

  // Slide 1
  setPointer('tail', l.get(5));
  pseudo.highlight(1);
  av.umsg("The linked list before insertion. 15 is the value to be inserted.");
  av.displayInit();

  // Slide 2
  av.umsg("Create a new link node.");
  var node = l.newNode('');
  node.css({
    top: 50,
    left: 164
  });
  node.highlight();
  node.next(l.get(2));
  l.get(2).prev(node);
  l.get(1).next(node);
  node.prev(l.get(1));
  l.get(1).edgeToNext().hide();
  l.get(2).edgeToNext().hide();
  l.get(2).edgeToPrev().hide();
  l.get(3).edgeToPrev().hide();
  l.layout({ updateTop: false });
  var longEdge = addEdge(l.get(1), l.get(3));
  tailSlash.hide();
  Vline.hide();
  Vline1.show();
  var newTailSlash = l.get(6).odsa_addSlash();
  pseudo.unhighlight(1);
  pseudo.highlight(2);
  av.step();

  // Slide 3
  av.umsg("Copy the value of 'it', which is 15, to the new node.");
  av.effects.copyValue(itBox, 0, node);
  av.step();

  // Slide 4
  av.umsg("The new node's <code>next</code> field is assigned to point to what <code>curr</code> pointed to.");
  l.get(2).edgeToNext().show();
  av.step();

  // Slide 5
  av.umsg("The new node's <code>prev</code> field is assigned to point to what <code>curr.prev()</code> pointed to.");
  l.get(2).edgeToPrev().show();
  av.step();

  // Slide 6
  av.umsg("<code>curr</code> points to the new link node.");
  curr.target(l.get(2));
  Vline1.hide();
  Vline2.show();
  av.step();

  // Slide 7
  av.umsg("The <code>curr.prev()</code>'s <code>next</code> field is assigned to point to the new link node, which is now pointed by <code>curr</code>.");
  l.get(1).highlight();
  l.get(2).unhighlight();
  l.get(1).edgeToNext().show();
  longEdge.topEdge.hide();
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  av.step();

  // Slide 8
  av.umsg("<code>curr.next()</code>'s <code>prev</code> field is assigned to point to the new link node.");
  longEdge.bottomEdge.hide();
  l.get(3).edgeToPrev().show();
  l.get(1).unhighlight();
  l.get(3).highlight();
  pseudo.unhighlight(3);
  pseudo.highlight(4);
  av.step();

  // Slide 9
  av.umsg("The new link node is in its correct position in the list.");
  l.layout();
  l.get(3).unhighlight();
  l.get(2).highlight();
  Vline.show();
  Vline2.hide();
  av.step();

  // Slide 10
  av.umsg("Increase the list size by 1.");
  pseudo.unhighlight(4);
  pseudo.highlight(5);
  av.step();
  av.recorded();
});
