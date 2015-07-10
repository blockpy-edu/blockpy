// Dlist Remove method
(function ($) {
  var jsav = new JSAV('dlistRemoveCON');
  var pseudo = jsav.code({
      url: '../../../SourceCode/Processing/Lists/Dlist.pde',
      lineNumbers: false,
      startAfter: '/* *** ODSATag: DListRemove *** */',
      endBefore: '/* *** ODSAendTag: DListRemove *** */'
    });
  // Relative offsets
  var leftMargin = 200;
  var topMargin = 15;
  // Create a the hidden array
  var itBox = jsav.ds.array([''], {
      indexed: false,
      layout: 'array',
      left: leftMargin + 70,
      top: topMargin + 50
    }).hide();
  itBox.highlight();

  // "It"
  var itLabel = jsav.label('it', {
      left: leftMargin + 3,
      top: topMargin + 53,
      'font-size': '20px'
    }).hide();
  var arrowIt = jsav.g.line(leftMargin + 19, topMargin + 80, leftMargin + 59, topMargin + 80, {
      'arrow-end': 'classic-wide-long',
      'opacity': 0,
      'stroke-width': 2
    });
  //itLabel.hide();

  // JSAV list
  var l = jsav.ds.dlist({
      'nodegap': 30,
      'center': false,
      'left': leftMargin,
      'top': topMargin
    });
  l.addFirst('null').addFirst(35).addFirst(8).addFirst(23).addFirst('null');
  l.layout();
  l.get(0).odsa_addSlash('left');
  var tailSlash = l.get(4).odsa_addSlash();
  var Vline = l.get(2).odsa_addVLine();
  var Vline1 = l.get(2).odsa_addVLine({
      left: l.get(2).element.outerWidth() / 2 + 15,
      top: -35
    });
  var Vline2 = l.get(2).odsa_addVLine({ top: 25 });
  Vline1.hide();
  Vline2.hide();
  setPointer('head', l.get(0));
  var curr = setPointer('curr', l.get(2));
  setPointer('tail', l.get(4));
  jsav.umsg('Now we will look at the remove method. Here is the linked list before we remove the node with value 8.');
  pseudo.highlight(1);
  jsav.displayInit();

  // Step 2
  jsav.umsg('Since curr is not at the tail position, we can proceed');
  l.get(2).highlight();
  pseudo.unhighlight(1);
  pseudo.highlight(2);
  l.get(3).edgeToPrev().addClass("dashline");
  l.get(2).edgeToPrev().addClass("dashline");
  l.get(2).edgeToNext().addClass("dashline");
  l.get(1).edgeToNext().addClass("dashline");
  jsav.step();

  // Step 3
  jsav.umsg('Remember the value of the current node.');
  itBox.show();
  arrowIt.show();
  itLabel.show();
  jsav.effects.copyValue(l.get(2), itBox, 0);
  l.get(2).unhighlight();
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  jsav.step();

  // Step 4
  jsav.umsg('<code>curr.prev()</code>\'s next field is set to point to <code>curr.next()</code>.');
  var dashLineTop = arrowAround(l.get(2), 'top');
  l.get(1).edgeToNext().hide();
  Vline.hide();
  itBox.unhighlight(0);
  pseudo.unhighlight(3);
  pseudo.highlight(4);
  jsav.step();

  // Step 5
  jsav.umsg('<code>curr.next()</code>\'s prev field is set to point to <code>curr.prev()</code>.');
  var dashLineDown = arrowAround(l.get(2), 'down');
  l.get(3).edgeToPrev().hide();
  pseudo.unhighlight(4);
  pseudo.highlight(5);
  jsav.step();

  // Step 6
  jsav.umsg('Change <code>curr</code> to point to the next node.');
  curr.target(l.get(3));
  pseudo.unhighlight(5);
  pseudo.highlight(6);
  jsav.step();

  // Step 7
  jsav.umsg('The node with value 8 is not pointed by any node from the list, so it is safe to remove the node from the list.');
  jsav.step();

  // Step 8
  jsav.umsg('The node with value 8 is removed from the list. Decrement node count by 1.');
  l.get(2).edgeToPrev().removeClass("dashline");
  l.get(1).edgeToNext().removeClass("dashline");
  l.remove(2);
  l.get(1).edgeToNext().show();
  l.layout();
  dashLineTop.hide();
  dashLineDown.hide();
  tailSlash.hide();
  var newTailSlash = l.get(3).odsa_addSlash();
  Vline.show();
  pseudo.unhighlight(6);
  pseudo.highlight(7);
  jsav.step();

  // Step 9
  jsav.umsg(' Return value removed.');
  itBox.highlight(0);
  pseudo.unhighlight(7);
  pseudo.highlight(8);
  jsav.step();
  jsav.recorded();
}(jQuery));
