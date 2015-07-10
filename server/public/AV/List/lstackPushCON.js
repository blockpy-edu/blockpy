// LStack method push
(function ($) {
  var jsav = new JSAV("lstackPushCON");
  var pseudo = jsav.code({url: "../../../SourceCode/Processing/Lists/LStack.pde",
                       lineNumbers: false,
                       startAfter: "/* *** ODSATag: LStackPush *** */",
                       endBefore: "/* *** ODSAendTag: LStackPush *** */"});
  // Relative offsets
  var leftMargin = 20;
  var topMargin = 25;
  var list = jsav.ds.list({"nodegap": 30, left: leftMargin, top: topMargin});
  list.addFirst(15)
      .addFirst(12)
      .addFirst(8)
      .addFirst(20);
  list.layout();
  list.get(0).edgeToNext().hide();
  list.get(0).hide();
  var arr = jsav.ds.array([10]);
  arr.hide();
  var topPointer = jsav.pointer("top", list.get(1));

  // Slide 1
  jsav.umsg("Here is the <code>push</code> operation. First we see the linked stack before <code>push</code>");
  pseudo.highlight(1);
  jsav.displayInit();

  // Slide 2
  jsav.umsg("Create a new node.");
  var newNode = list.newNode("");
  newNode.css({top : topMargin + 20});
  newNode.highlight();
  pseudo.unhighlight(1);
  pseudo.highlight(2);
  jsav.step();

  // Slide 3
  jsav.umsg("Set the value of the new node.");
  jsav.effects.copyValue(arr, 0, newNode);
  jsav.step();

  // Slide 4
  jsav.umsg("Modify the <code>next</code> field of the newly created link node to point to the top of the stack");
  newNode.next(list.get(1));
  list.get(0).next(newNode);
  list.get(0).edgeToNext().hide();
  list.layout({updateTop : false});
  jsav.step();

  // Slide 5
  jsav.umsg("Then set top to point to the new link node.");
  topPointer.target(list.get(1));
  list.layout();
  jsav.step();

  // Slide 6
  list.get(1).unhighlight();
  jsav.umsg("Increase stack size by 1.");
  pseudo.unhighlight(2);
  pseudo.highlight(3);
  jsav.step();
  jsav.recorded();
}(jQuery));
