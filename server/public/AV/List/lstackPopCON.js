// LStack method pop
(function ($) {
  var jsav = new JSAV("lstackPopCON");
  var pseudo = jsav.code({url: "../../../SourceCode/Processing/Lists/LStack.pde",
                       lineNumbers: false,
                       startAfter: "/* *** ODSATag: LStackPop *** */",
                       endBefore: "/* *** ODSAendTag: LStackPop *** */"});
  // Relative offsets
  var leftMargin = 10;
  var topMargin = 35;
  var list = jsav.ds.list({"nodegap": 30, left : leftMargin, top : topMargin});
  list.addFirst(15)
      .addFirst(12)
      .addFirst(8)
      .addFirst(23)
      .addFirst(20);
  list.layout();
  var arr = jsav.ds.array([10]);
  arr.hide();
  var arrIt = jsav.ds.array([""], {left : leftMargin + 110, top: topMargin + 50});
  var labelIt = jsav.label("it", {left : leftMargin + 90, top: topMargin + 55});

  // Slide 1
  list.get(0).edgeToNext().hide();
  list.get(0).hide();
  jsav.umsg("Method <code>pop</code> is also quite simple.");
  pseudo.highlight(1);
  jsav.displayInit();

  // Slide 2
  list.get(1).highlight();
  jsav.umsg("<code>top</code> points to the first node. Since <code>top</code> is not equal to <code>null</code>, we proceed.");
  var topPointer = setPointer("top", list.get(1));
  list.layout();
  pseudo.unhighlight(1);
  pseudo.highlight(2);
  jsav.step();

  // Slide 3
  jsav.effects.copyValue(list.get(1), arrIt, 0);
  list.get(1).unhighlight();
  arrIt.highlight(0);
  jsav.umsg(" Variable <code>it</code> stores the top node's value as it is removed from the stack.");
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  jsav.step();

  // Slide 4
  arrIt.unhighlight();
  list.get(2).highlight();
  jsav.umsg("The stack is updated by setting <code>top</code> to point to the next link in the stack.");
  list.remove(1);
  topPointer.target(list.get(1));
  list.layout();
  pseudo.unhighlight(3);
  pseudo.highlight(4);
  list.get(0).edgeToNext().hide();
  jsav.step();

  // Slide 5
  jsav.umsg("Decrease the stack size by 1");
  pseudo.unhighlight(4);
  pseudo.highlight(5);
  jsav.step();

  // Slide 6
  list.get(2).unhighlight();
  arrIt.highlight();
  jsav.umsg("The element value is returned.");
  pseudo.unhighlight(5);
  pseudo.highlight(6);
  jsav.step();
  jsav.recorded();
}(jQuery));
