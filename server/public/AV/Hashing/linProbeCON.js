"use strict";

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("linProbeCON1");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("The simplest collsion resolution method is called linear probing. We simply move to the right in the table from the home slot, wrapping around to the beginning if necessary.");
  av.displayInit();

  av.umsg("Starting with an empty table of size 10, we will insert the values 9877, 9050, 2037, 1059, and 7200 in that order using the simple mod hash function.");
  av.step();

  av.umsg("Insert a record with key value 9877 into position 7.");
  arr.value(7, 9877);
  arr.highlight(7);
  av.step();

  av.umsg("Insert a record with key value 9050 into position 0.");
  arr.unhighlight(7);
  arr.value(0, 9050);
  arr.highlight(0);
  av.step();

  av.umsg("Insert a record with key value 2037. The hash function takes this to slot 7.");
  arr.unhighlight(0);
  arr.highlight(7);
  av.step();

  av.umsg("Since slot 7 is already full, we probe to slot 8.");
  arr.unhighlight(7);
  arr.highlight(8);
  av.step();

  av.umsg("Slot 8 is free, so insert the record there.");
  arr.value(8, 2037);
  av.step();

  av.umsg("Insert a record with key value 1059 into position 9.");
  arr.unhighlight(8);
  arr.value(9, 1059);
  arr.highlight(9);
  av.step();

  av.umsg("Insert a record with key value 7200. The hash function takes this to slot 0.");
  arr.unhighlight(9);
  arr.highlight(0);
  av.step();

  av.umsg("Since slot 0 is already full, we probe to slot 1.");
  arr.unhighlight(0);
  arr.highlight(1);
  av.step();

  av.umsg("Slot 1 is free, so insert the record there.");
  arr.value(1, 7200);
  av.recorded();
}(jQuery));


(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("linProbeCON2");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("Consider the situation where we left off in the last slide show. If at this point we wanted to insert the value 3348, we would have to probe all the way to slot 2.");
  arr.value(0, 9050);
  arr.value(1, 7200);
  arr.value(7, 9877);
  arr.value(8, 2037);
  arr.value(9, 1059);
  arr.highlight(2);
  av.displayInit();

  av.umsg("This might seem like an extreme case, but in fact this illustrates a persistent problem, in that linear probing violates a basic goal of a collision resolution method.");
  arr.unhighlight(2);
  av.step();

  av.umsg("Collision resolution methods should have the goal of making every free slot in the table be equally likely to get the next record. But consider where keys inserted into the table will hash to.");
  av.step();

  av.umsg("A key hashed to slot 0 will probe to slot 2. A key hashed to slot 1 will probe to slot 2. A key hashed to slot 2 will stay in slot 2. In fact, a key hashed to any of the highlighted positions will end up in slot 2.");
  arr.highlight([0, 1, 7, 8, 9]);
  av.step();

  av.umsg("In contrast, only keys hashed directly to slot 3 will end up in slot 3.");
  arr.highlight(3);
  arr.unhighlight([0, 1, 7, 8, 9]);
  av.step();

  av.umsg("Here are the probabilities for each empty slot of getting the next record. Obviously, they are not balanced.");
  arr.unhighlight(3);
  av.label("60%", {left: 294, top: -20});
  av.label("10%", {left: 341, top: -20});
  av.label("10%", {left: 386, top: -20});
  av.label("10%", {left: 432, top: -20});
  av.label("10%", {left: 478, top: -20});
  av.step();

  av.umsg("In other words, clustering tends to lead to more clustering, because we tend to put new records next to old ones.");
  av.recorded();
}(jQuery));
