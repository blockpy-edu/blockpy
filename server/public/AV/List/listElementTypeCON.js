// Homogeneous vs. non-homgeneous lists.
(function ($) {
  var jsav = new JSAV('listElementTypeCON');
  // Relative offsets
  var leftMargin = 200;
  var topMargin = 25;
  // JSAV list
  var list1 = jsav.ds.list({'left': leftMargin, 'top': topMargin});
  list1.addFirst('null').addFirst('').addFirst('').addFirst('').addFirst('').addFirst('null');
  list1.layout();
  list1.hide();

  var list2 = jsav.ds.list({'left': leftMargin, 'top': topMargin + 100});
  list2.addFirst('null').addFirst('').addFirst('').addFirst('').addFirst('').addFirst('null');
  list2.layout();
  list2.hide();
  var curr = setPointer('curr', list1.get(0));
  var head = setPointer('head', list1.get(2));
  var tail = setPointer('tail', list1.get(5));

  // Slide 1
  jsav.umsg('A second issue faced by implementors of a list class (or any other data structure that stores a collection of user-defined data elements) is whether the elements stored are all required to be of the same type. This is known as homogeneity in a data structure.');
  jsav.displayInit();

  // Slide 2
  var bigData = jsav.ds.array([
      'ID : 546457',
      'Name : Jake',
      'Phone : 5405642511',
      'Email : example@vt.edu',
      'Office : 212'
    ], {
      layout: 'vertical',
      top: 125,
      left: 50
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
      top: 125,
      left: 250
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
      top: 125,
      left: 450
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
      top: 125,
      left: 650
    });
  bigData3.addClass(true, "widerecord");

  list1.show();
  list1.layout();
  var listP1 = jsav.g.line(320, 60, 130, 140,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP2 = jsav.g.line(410, 60, 330, 140,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP3 = jsav.g.line(500, 60, 530, 140,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP4 = jsav.g.line(590, 60, 730, 140,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  jsav.umsg('In some applications, the user would like to define the class of the data element that is stored on a given list, and then never permit objects of a different class to be stored on that same list.');
  jsav.step();

  // Slide 3
  listP1.hide();
  listP2.hide();
  listP3.hide();
  listP4.hide();
  list1.get(2).value(5);
  list1.get(4).value('true');
  bigData.css({ left: 170 });
  bigData1.css({ left: 400 });
  bigData2.hide();
  bigData3.hide();
  var listX1 = jsav.g.line(320, 60, 240, 140,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listX2 = jsav.g.line(500, 60, 480, 140,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});

  jsav.umsg('In other applications, the user would like to permit the objects stored on a single list to be of differing types.');
  jsav.recorded();
}(jQuery));
