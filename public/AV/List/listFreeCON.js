'use strict';
//Linked list insertion
(function ($) {
  var jsav = new JSAV('listFreeCON');

  // Offsets
  var leftMargin = 217;
  var topMargin = 25;

  // Create a list object under control of JSAV library
  var l = jsav.ds.list({
      'nodegap': 30,
      'top': topMargin,
      left: leftMargin
    });
  l.addFirst('null').addFirst('null');
  l.layout();

  // Create freelist
  var freelist = jsav.ds.list({
      'nodegap': 30,
      'top': topMargin + 100,
      left: leftMargin
    });

  // Create 'null' label
  var nullLabel = jsav.label('null', {
      top: topMargin + 100,
      left: leftMargin
    });
  nullLabel.css({ color: 'red' });
  // head
  var head = setPointerL('head', l.get(0));
  // curr
  var curr = setPointerL('curr', l.get(1));
  // Tail
  var tail = setPointerR('tail', l.get(1));
  // freelist poitner
  var pfreelist = setPointerL('freelist', nullLabel);
  jsav.umsg("We will  illustrate using a freelist by performing a series of list operations. Let's start from an empty singly linked list and a <code>freelist</code> variable pointing to <code>null</code>.");
  jsav.displayInit();

  // step 3
  jsav.umsg("Now insert a new node with value 8 to the current node.");
  jsav.step();

  l.add(1, '8');
  l.layout();
  curr.target(l.get(1));
  tail.target(l.get(2), {
    anchor: 'left top',
    myAnchor: 'right bottom',
    left: 15,
    top: -20
  });
  jsav.umsg("Since the freelist is empty, we must use the <code>new</code> operator to create a new node for insertion.");
  jsav.step();

  jsav.umsg("Here is the list after inserting 20, 6 and 12. So far, we have not been able to take advantage of the freelist.");
  l.add(1, '12');
  l.add(2, '6');
  l.add(3, '20');
  l.layout();
  curr.target(l.get(1));
  jsav.step();

  jsav.umsg("Now remove the current node from the list. Set its value to be <code>null</code>. The deleted node is moved to the head of freelist for later reuse.");
  l.remove(1);
  l.layout();
  nullLabel.hide();
  freelist.addFirst('null');
  freelist.layout();
  pfreelist.target(freelist.get(0));
  jsav.step();

  jsav.umsg("The list after another delete operation of the current node. Again put the deleted node at the head of the freelist.");
  l.remove(1);
  l.layout();
  freelist.addFirst('null');
  freelist.layout();
  pfreelist.target(freelist.get(0));
  jsav.step();

  jsav.umsg("Now let's insert a node with value 6 to the current position. This time the head node of the freelist is reused.");
  l.add(1, '6');
  l.layout();
  freelist.remove(0);
  freelist.layout();
  pfreelist.target(freelist.get(0));
  jsav.step();

  jsav.recorded();
}(jQuery));
