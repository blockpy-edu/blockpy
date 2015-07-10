// Dlist Append method
(function ($) {
  var jsav = new JSAV('dlistAppendCON');
  var pseudo = jsav.code({
      url: '../../../SourceCode/Processing/Lists/Dlist.pde',
      lineNumbers: false,
      startAfter: '/* *** ODSATag: DListAppend *** */',
      endBefore: '/* *** ODSAendTag: DListAppend *** */'
    });
  // Relative offsets
  var leftMargin = 150;
  var topMargin = 10;
  // Box "it"
  var itLabel = jsav.label('it', {
      left: 20,
      top: -15,
      'font-size': '20px'
    });
  var itBox = jsav.ds.array(['15'], {
      indexed: false,
      layout: 'array',
      top: -20,
      left: 40
    });
  itBox.highlight();
  // JSAV list
  var l = jsav.ds.dlist({
      'nodegap': 30,
      'center': false,
      'left': leftMargin,
      'top': topMargin
    });
  l.addFirst('null').addFirst(10).addFirst(35).addFirst(8).addFirst(23).addFirst('null');
  l.layout();
  l.get(0).odsa_addSlash('left');
  var tailSlash = l.get(5).odsa_addSlash();
  var Vline = l.get(5).odsa_addVLine();
  var Vline1 = l.get(5).odsa_addVLine({ left: l.get(2).element.outerWidth() / 2 + 15 });
  var Vline2 = l.get(5).odsa_addVLine({ top: 25 });
  Vline1.hide();
  Vline2.hide();
  setPointer('head', l.get(0));
  var curr = setPointer('curr', l.get(2));
  setPointer('tail', l.get(5));
  jsav.umsg('The append method works almost the same as insertion. We will insert the value 15.');
  pseudo.highlight(1);
  jsav.displayInit();

  // Step 2
  jsav.umsg('Create a new link node.');
  var node = l.newNode('');
  node.css({
    top: 50,
    left: 410
  });
  node.highlight();
  node.next(l.get(5));
  l.get(5).prev(node);
  l.get(4).next(node);
  node.prev(l.get(1));
  l.get(4).edgeToNext().hide();
  l.get(5).edgeToNext().hide();
  l.get(5).edgeToPrev().hide();
  l.get(6).edgeToPrev().hide();
  l.layout({ updateTop: false });
  var longEdge = addEdge(l.get(4), l.get(6));
  tailSlash.hide();
  Vline.hide();
  Vline1.show();
  var newTailSlash = l.get(6).odsa_addSlash();
  pseudo.unhighlight(1);
  pseudo.highlight(2);
  jsav.step();

  // Step 3
  jsav.umsg('Copy 15 to the new node.');
  jsav.effects.copyValue(itBox, 0, node);
  jsav.step();

  // Step 4
  jsav.umsg('The new node\'s <code>next</code> field is assigned to point to what <code>tail</code> points to. The new node\'s <code>prev</code> field is assigned to point to what <code>tail.prev()</code> points to. ');
  l.get(5).edgeToNext().show();
  l.get(5).edgeToPrev().show();
  curr.target(l.get(2));
  jsav.step();

  // Step 5
  jsav.umsg('<code>tail</code> node\'s <code>prev</code> field is assigned to point to the new link node.');
  longEdge.bottomEdge.hide();
  l.get(6).edgeToPrev().show();
  l.get(5).unhighlight();
  l.get(6).highlight();
  jsav.step();

  // Step 6
  jsav.umsg('The <code>tail.prev().prev()</code>\'s <code>next</code> field is assigned to point to the new link node.');
  Vline1.hide();
  Vline2.show();
  l.get(4).highlight();
  l.get(6).unhighlight();
  l.get(4).edgeToNext().show();
  longEdge.topEdge.hide();
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  jsav.step();

  // Step 7
  jsav.umsg('The new link node is in its correct position in the list.');
  l.layout();
  l.get(4).unhighlight();
  l.get(5).highlight();
  Vline.show();
  Vline2.hide();
  jsav.step();

  // Step 8
  jsav.umsg('Increase the list size by 1.');
  l.get(5).unhighlight();
  pseudo.unhighlight(3);
  pseudo.highlight(5);
  jsav.step();
  jsav.recorded();
}(jQuery));
