// List data storage
(function ($) {
  var jsav = new JSAV('listElementDataCON');
  // Relative offsets
  var leftMargin = 200;
  var topMargin = 130;
  // JSAV list
  var l = jsav.ds.list({'left': leftMargin, 'top': topMargin});
  l.addFirst('null').addFirst('9').addFirst('12').addFirst('35').addFirst('21').addFirst('null');
  l.layout();
  var arr = jsav.ds.array([21, 35, 12, 9], {top: 10, left: 360});

  // JSAV dlist
  var dl = jsav.ds.dlist({'left': leftMargin, 'top': topMargin + 100});
  dl.addFirst('null').addFirst('9').addFirst('12').addFirst('35').addFirst('21').addFirst('null');
  dl.layout();

  var bigData = jsav.ds.array([
      'ID : 546457',
      'Name : Jake',
      'Phone : 5405642511',
      'Email : example@vt.edu',
      'Office : 212'
    ], {
      layout: 'vertical',
      top: 150,
      left: 170
    });
  bigData.addClass(true, "widerecord");

  var bigData1 = jsav.ds.array([
      'ID : 546213',
      'Name : Mike',
      'Phone : 5405642513',
      'Email : example@vt.edu',
      'Office : 212'
    ], {
      layout: 'vertical',
      top: 150,
      left: 470
    });
  bigData1.addClass(true, "widerecord");

  var bigData2 = jsav.ds.array([
      'ID : 546805',
      'Name : John',
      'Phone : 5405642552',
      'Email : example@vt.edu',
      'Office : 212'
    ], {
      layout: 'vertical',
      top: 150,
      left: 470
    });
  bigData2.addClass(true, "widerecord");

  var bigData3 = jsav.ds.array([
      'ID : 546991',
      'Name : Lucy',
      'Phone : 5405642568',
      'Email : example@vt.edu',
      'Office : 212'
    ], {
      layout: 'vertical',
      top: 150,
      left: 470
    });
  bigData3.addClass(true, "widerecord");

  bigData.hide();
  bigData1.hide();
  bigData2.hide();
  bigData3.hide();
  var head = setPointer('head', l.get(0));
  var curr = setPointer('curr', l.get(2));
  var tail = setPointer('tail', l.get(5));

  var dhead = setPointer('head', dl.get(0));
  var dcurr = setPointer('curr', dl.get(2));
  var dtail = setPointer('tail', dl.get(5));

  // Slide 1
  jsav.umsg('List users must decide whether they wish to store a copy of any given element on each list that contains it. For small elements such as an integer, this makes sense.');
  jsav.displayInit();

  // Slide 2
  arr.hide();
  dl.hide();
  dhead.hide();
  dcurr.hide();
  dtail.hide();
  l.show();
  l.get(1).value('');
  l.get(2).value('');
  l.get(3).value('');
  l.get(4).value('');
  l.translateY(-80);
  bigData.show();
  bigData1.show();
  var listP1 = jsav.g.line(320, 80, 250, 165,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP2 = jsav.g.line(410, 80, 260, 165,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP3 = jsav.g.line(500, 80, 560, 165,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP4 = jsav.g.line(590, 80, 570, 165,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  jsav.umsg('If the elements are payroll records, it might be desirable for the list node to store a pointer to the record rather than store a copy of the record itself. This change would allow multiple list nodes (or other data structures) to point to the same record, rather than make repeated copies of the record. Not only might this save space, but it also means that a modification to an element\'s value is automatically reflected at all locations where it is referenced.');
  jsav.step();

  // Slide 3
  l.hide();
  head.hide();
  curr.hide();
  tail.hide();
  listP1.hide();
  listP2.hide();
  listP3.hide();
  listP4.hide();

  arr.show();
  arr.css({ top: 20 });
  arr.value(0, ' ');
  arr.value(1, ' ');
  arr.value(2, ' ');
  arr.value(3, ' ');

  bigData2.show();
  bigData3.show();
  bigData.css({ left: 10 });
  bigData1.css({ left: 210 });
  bigData2.css({ left: 410 });
  bigData3.css({ left: 610 });
  var arrP5 = connect(arr, bigData, { index: 0 });
  var arrP6 = connect(arr, bigData1, { index: 1 });
  var arrP7 = connect(arr, bigData2, { index: 2 });
  var arrP8 = connect(arr, bigData3, { index: 3 });
  jsav.umsg('The disadvantage of storing a pointer to each element is that the pointer requires space of its own. If elements are never duplicated, then this additional space adds unnecessary overhead. Java most naturally stores references to objects, meaning that only a single copy of an object such as a payroll record will be maintained, even if it is on multiple lists.');
  jsav.step();
  jsav.recorded();
}(jQuery));
