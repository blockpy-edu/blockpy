// Garbage collection of lists
(function ($) {
  var jsav = new JSAV('listElementDeleteCON');
  // Relative offsets
  var leftMargin = 200;
  var topMargin = 25;
  // JSAV list
  var list1 = jsav.ds.list({
      'left': leftMargin,
      'top': topMargin
    });
  list1.addFirst('null').addFirst('').addFirst('').addFirst('').addFirst('').addFirst('null');
  list1.layout();
  list1.hide();

  var list2 = jsav.ds.list({
      'left': leftMargin,
      'top': topMargin + 100
    });
  list2.addFirst('null').addFirst('').addFirst('').addFirst('').addFirst('').addFirst('null');
  list2.layout();
  list2.hide();
  var curr = setPointer('curr', list1.get(0));
  var head = setPointer('head', list1.get(2));
  var tail = setPointer('tail', list1.get(5));


  jsav.umsg('The third issue that users of a list implementation must face is primarily of concern when programming in languages that do not support automatic garbage collection. ');
  jsav.displayInit();
  list1.show();
  var bigData = jsav.ds.array([
      'ID : 546457',
      'Name : Jake',
      'Phone : 5405642511',
      'Email : example@vt.edu',
      'Office : 212'
    ], {
      layout: 'vertical',
      top: 140,
      left: 40
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
      top: 140,
      left: 240
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
      top: 140,
      left: 440
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
      top: 140,
      left: 640
    });
  bigData3.addClass(true, "widerecord");

  var listP1 = jsav.g.line(320, 55, 120, 150,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP2 = jsav.g.line(410, 55, 320, 150,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP3 = jsav.g.line(500, 55, 520, 150,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  var listP4 = jsav.g.line(590, 55, 720, 150,
                 {'arrow-end': 'classic-wide', 'stroke-width': 2});
  jsav.umsg('That is how to deal with the memory of the objects stored on the list when the list is deleted or the clear method is called. In C++ for example, list destructor and the clear method are problematic in that there is a potential that they will be misused. ');
  jsav.step();

  listP1.hide();
  listP2.hide();
  listP3.hide();
  listP4.hide();
  list1.hide();
  bigData.highlight();
  bigData1.highlight();
  bigData2.highlight();
  bigData3.highlight();

  jsav.umsg('Deleting listArray in the array-based implementation, or deleting a link node in the linked list implementation, might remove the only reference to an object, leaving its memory space inaccessible. ');
  jsav.step();

  jsav.umsg('Unfortunately, there is no way for the list implementation to know whether a given object is pointed to in another part of the program or not. Thus, the user of the list must be responsible for deleting these objects when that is appropriate.');
  jsav.recorded();
}(jQuery));
