// List Queue dequeue method.
(function ($) {
  var jsav = new JSAV("lqueueDequeueCON");
  var pseudo = jsav.code({url: "../../../SourceCode/Processing/Lists/LQueue.pde",
                       lineNumbers: false,
                       startAfter: "/* *** ODSATag: LQueueDequeue *** */",
                       endBefore: "/* *** ODSAendTag: LQueueDequeue *** */"});
  var leftMargin = 10;
  var topMargin = 50;
  var labelIt = jsav.label("it", {left: leftMargin - 5, top: topMargin + 55}).hide();
  var arrIt = jsav.ds.array([" "], {left: leftMargin + 30, top: topMargin + 50}).hide();
  var list = jsav.ds.list({nodegap: 30, left: leftMargin, top: topMargin});
  list.addFirst(30)
      .addFirst(21)
      .addFirst(3)
      .addFirst("null");
  list.layout();

  var frontP = jsav.pointer("front", list.get(0));
  var rearP = jsav.pointer("rear", list.get(3));
  pseudo.highlight(3);
  jsav.umsg("First check that the Queue is not empty.");
  jsav.displayInit();

  jsav.umsg("Store dequeued value.");
  labelIt.show();
  arrIt.show();
  jsav.effects.copyValue(list.get(1), arrIt, 0);
  arrIt.highlight();
  pseudo.unhighlight(3);
  pseudo.highlight(4);
  jsav.step();

  jsav.umsg("Advance front to point to the new link node.");
  arrIt.unhighlight();
  var dashLine = arrowAround(list.get(1));
  pseudo.unhighlight(4);
  pseudo.highlight(5);
  list.get(0).edgeToNext().hide();
  jsav.step();

  list.remove(1);
  list.get(0).edgeToNext().show();
  dashLine.hide();
  list.layout();
  jsav.step();

  jsav.umsg("Check that the next node of <code>front</code> is not empty.");
  list.get(1).highlight();
  pseudo.unhighlight(5);
  pseudo.highlight(6);
  jsav.step();

  jsav.umsg("Decrease the size by 1.");
  list.get(1).unhighlight();
  pseudo.unhighlight(6);
  pseudo.highlight(7);
  jsav.step();

  jsav.umsg("Return the dequeued value.");
  arrIt.highlight();
  pseudo.unhighlight(7);
  pseudo.highlight(8);
  jsav.step();
  jsav.recorded();
}(jQuery));
