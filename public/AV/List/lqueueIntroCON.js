// List Queue Introduction.
(function ($) {
  var jsav = new JSAV("lqueueIntroCON");
  var pseudo = jsav.code({url: "../../../SourceCode/Processing/Lists/LQueue.pde",
                       lineNumbers: false,
                       startAfter: "/* *** ODSATag: LQueue1 *** */",
                       endBefore: "/* *** ODSAendTag: LQueue1 *** */"});
  var leftMargin = 10;
  var topMargin = 50;
  var list = jsav.ds.list({nodegap: 30, left: leftMargin, top: topMargin});
  list.addFirst(25)
      .addFirst(10)
      .addFirst(5)
      .addFirst("null");
  list.layout();
  var frontP = jsav.pointer("front", list.get(0));
  var rearP = jsav.pointer("rear", list.get(3));
  jsav.umsg("Members <code>front</code> and <code>rear</code> are pointers to the front and rear queue elements, respectively.");
  pseudo.highlight(3);
  pseudo.highlight(4);
  jsav.displayInit();

  jsav.umsg("We will use a header link node, which allows for a simpler implementation of the enqueue operation by avoiding any special cases when the queue is empty.");
  list.get(0).highlight();
  pseudo.unhighlight(3);
  pseudo.unhighlight(4);

  jsav.umsg("On initialization, the front and rear pointers will point to the header node.");
  frontP.target(list.get(0), {left : -10});
  rearP.target(list.get(0), {left: 30});
  list.get(0).edgeToNext().hide();
  list.get(1).edgeToNext().hide();
  list.get(2).edgeToNext().hide();
  list.get(1).hide();
  list.get(2).hide();
  list.get(3).hide();
  pseudo.highlight(13);
  jsav.step();

  jsav.umsg("<code>front</code> will always point to the header node while rear points to the true last link node in the queue.");
  list.get(0).edgeToNext().show();
  list.get(1).edgeToNext().show();
  list.get(2).edgeToNext().show();
  list.get(1).show();
  list.get(2).show();
  list.get(3).show();
  list.get(3).highlight();
  rearP.target(list.get(3), {left: -10});
  pseudo.unhighlight(13);
  pseudo.highlight(3);
  pseudo.highlight(4);
  jsav.step();
  jsav.recorded();
}(jQuery));
