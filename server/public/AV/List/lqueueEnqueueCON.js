// List Queue enqueue method.
(function ($) {
  var jsav = new JSAV("lqueueEnqueueCON");
  var pseudo = jsav.code({url: "../../../SourceCode/Processing/Lists/LQueue.pde",
                       lineNumbers: false,
                       startAfter: "/* *** ODSATag: LQueueEnqueue *** */",
                       endBefore: "/* *** ODSAendTag: LQueueEnqueue *** */"});
  var leftMargin = 10;
  var topMargin = 40;
  var list = jsav.ds.list({nodegap: 30, left: leftMargin, top: topMargin});
  list.addFirst(30)
      .addFirst(21)
      .addFirst(3)
      .addFirst("null");
  list.layout();
  var frontP = jsav.pointer("front", list.get(0));
  var rearP = jsav.pointer("rear", list.get(3));
  pseudo.highlight(2);
  jsav.displayInit();

  jsav.umsg("Create a new node with value \"it\", which is 10 here.");
  var newNode = list.newNode("10");
  newNode.css({left: leftMargin + 73 * 4, top: topMargin + 30});
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  jsav.step();

  jsav.umsg("The next field of the <code>rear</code> node is assigned to point to the new node.");
  list.get(3).next(newNode);
  list.layout({updateTop: false});
  jsav.step();

  jsav.umsg("Advances <code>rear</code> to point to the new link node.");
  newNode.highlight();
  list.layout();
  rearP.target(list.get(4));
  pseudo.unhighlight(3);
  pseudo.highlight(4);
  jsav.step();

  jsav.umsg("Increase <code>size</code> by 1.");
  pseudo.unhighlight(4);
  pseudo.highlight(5);
  jsav.step();
  jsav.recorded();
}(jQuery));
