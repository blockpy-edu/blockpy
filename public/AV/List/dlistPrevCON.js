// Dlist prev method
(function ($) {
  var jsav = new JSAV('dlistPrevCON');
  var pseudo = jsav.code({
      url: '../../../SourceCode/Processing/Lists/Dlist.pde',
      lineNumbers: false,
      startAfter: '/* *** ODSATag: DListPrev *** */',
      endBefore: '/* *** ODSAendTag: DListPrev *** */'
    });
  // Relative offsets
  var leftMargin = 150;
  var topMargin = 10;

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
  var Vline = l.get(3).odsa_addVLine();
  var Vline1 = l.get(2).odsa_addVLine();
  Vline1.hide();
  setPointer('head', l.get(0));
  var curr = setPointer('curr', l.get(3));
  setPointer('tail', l.get(5));
  jsav.umsg('The prev method is easy.');
  pseudo.highlight(1);
  jsav.displayInit();

  // Step 2
  jsav.umsg('The node with value 35 is the current node');
  l.get(3).highlight();
  jsav.step();

  // Step 3
  jsav.umsg('Since the node <code>curr.prev()</code> is not <code>head</code> node, we can proceed.');
  l.get(3).unhighlight();
  l.get(2).highlight();
  pseudo.unhighlight(1);
  pseudo.highlight(2);
  jsav.step();

  // Step 4
  jsav.umsg('The variable <code>curr</code> is set to point to  <code>curr.prev()</code>.');
  curr.target(l.get(2));
  Vline.hide();
  Vline1.show();
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  jsav.step();

  // Step 5
  jsav.umsg('This takes &Theta;(1) time.');
  pseudo.unhighlight(3);
  jsav.step();
  jsav.recorded();
}(jQuery));
