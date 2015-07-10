// How to recognize when the queue is empty or full.
(function ($) {
  var jsav = new JSAV("aqueueEmptyCON");

  // center coordinate
  var cx = 400, cy = 120;
  // radius
  var r1 = 50, r2 = 100;
  var cir = jsav.circular(cx, cy, r1, r2, {"stroke-width" : 2});
  jsav.umsg("There remains one more serious, though subtle, problem to the array-based queue implementation. How can we recognize when the queue is empty or full?");
  jsav.displayInit();
  cir.value(10, "12");
  cir.highlight(10);
  var frontP = cir.pointer("front,rear", 10);
  jsav.umsg("Assume that front stores the array index for the front element in the queue, and rear stores the array index for the rear element. If both front and rear have the same position, then with this scheme there must be one element in the queue.");
  jsav.step();
  cir.highlight(11);
  cir.value(10, " ");
  frontP.arrow.hide();
  frontP.label.hide();
  var frontP1 = cir.pointer("front", 11);
  var rearP1 = cir.pointer("rear", 10);
  jsav.umsg("Thus, an empty queue would be recognized by having rear be <i>one less</i> than front (taking into account the fact that the queue is circular, so position size-1 is actually considered to be one less than position 0).");
  jsav.step();
  jsav.umsg("But what if the queue is completely full? In other words, what is the situation when a queue with $n$ array positions available contains n elements? In this case, if the front element is in position 0, then the rear element is in position size-1.");
  frontP1.arrow.hide();
  frontP1.label.hide();
  rearP1.arrow.hide();
  rearP1.label.hide();
  cir.unhighlight(10);
  var frontP2 = cir.pointer("front", 0);
  var rearP2 = cir.pointer("rear", 11);
  cir.highlight(11);
  cir.highlight(0);
  jsav.step();
  jsav.umsg("But this means that the value for rear is one less than the value for front when the circular nature of the queue is taken into account. In other words, the full queue is indistinguishable from the empty queue!");
  jsav.step();
  jsav.umsg("You might think that the problem is in the assumption about front and rear being defined to store the array indices of the front and rear elements, respectively, and that some modification in this definition will allow a solution. ");
  jsav.step();
  jsav.umsg(" Unfortunately, the problem cannot be remedied by a simple change to the definition for front and rear, because of the number of conditions or states that the queue can be in. Ignoring the actual position of the first element, and ignoring the actual values of the elements stored in the queue, how many different states are there? ");
  jsav.step();
  jsav.umsg(" There can be no elements in the queue, one element, two, and so on. At most there can be $n$ elements in the queue if there are n array positions. This means that there are $n+1$ different states for the queue (0 through $n$ elements are possible).");
  jsav.step();
  jsav.recorded();
}(jQuery));
