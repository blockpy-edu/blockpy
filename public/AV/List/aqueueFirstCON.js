// Elements of the queue are stored in the first n positions of the array..
(function ($) {
  var jsav = new JSAV("aqueueFirstCON");
  // Relative offsets
  var leftMargin = 300;
  var topMargin = 35;
  var minusOne = jsav.ds.array(["-1"], {top: topMargin + 70, left: leftMargin + 30});
  minusOne.hide();
  var arr = jsav.ds.array([12, 45, 5, 81, "", "", "", ""],
                          {indexed: true, top: topMargin, left: leftMargin});
  jsav.umsg("Assume that there are <i>n</i> elements in the queue. By analogy to the array-based list implementation, we could require that all elements of the queue be stored in the first <i>n</i> positions of the array.");
  jsav.displayInit();

  var rearPointer = setPointer("rear", arr, 0);
  var frontPointer = setPointer("front", arr, 3);
  arr.highlight(3);
  jsav.umsg(" If we choose the rear element of the queue to be in position 0, then dequeue operations require only &theta;(1) time because the front element of the queue (the one being removed) is the last element in the array.");
  jsav.step();
  arr.highlight(0);
  arr.highlight(1);
  arr.highlight(2);
  jsav.umsg("However, enqueue operations will require &theta;(<i>n</i>) time, because the n elements currently in the queue must each be shifted one position in the array.");
  jsav.step();
  arr.unhighlight();
  rearPointer.target(arr.index(3));
  frontPointer.target(arr.index(0));
  jsav.umsg("If instead we chose the rear element of the queue to be in position n-1, then an enqueue operation is equivalent to an append operation on a list. This requires only &theta;(1) time.");
  jsav.step();
  jsav.umsg("But now, a dequeue operation requires &theta;(<i>n</i>) time, because all of the elements must be shifted down by one position to retain the property that the remaining <i>n</i>-1 queue elements reside in the first <i>n</i>-1 positions of the array.");
  jsav.step();
  jsav.recorded();
}(jQuery));
