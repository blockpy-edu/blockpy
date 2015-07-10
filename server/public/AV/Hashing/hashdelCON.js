"use strict";

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("hashdelCON1");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("Let's see an example of the deletion process in action. As usual, our example will use a hash table of size 10, the simple mod hash function, and collision resolution using simple linear probing.");
  av.displayInit();

  av.umsg("First a few insertions to get us started. Insert 5.");
  arr.highlight(5);
  arr.value(5, 5);
  av.step();

  av.umsg("Insert 26.");
  arr.unhighlight(5);
  arr.highlight(6);
  arr.value(6, 26);
  av.step();

  av.umsg("Insert 75. This causes a collision at slot 5.");
  arr.unhighlight(6);
  arr.highlight(5);
  av.step();

  av.umsg("Collision resolution takes us to slot 6, which is also full.");
  arr.unhighlight(5);
  arr.highlight(6);
  av.step();

  av.umsg("Next we try slot 7, where we can insert.");
  arr.unhighlight(6);
  arr.highlight(7);
  arr.value(7, 75);
  av.step();

  av.umsg("Now let's delete 26. First we search for it in the table by taking the hash value of 26 to get slot 6, which does contain the record.");
  arr.unhighlight(7);
  arr.highlight(6);
  av.step();

  av.umsg("Since we have found what we are looking for, we remove it from the table and replace it with a tombstone.");
  arr.value(6, "[del]");
  av.step();

  av.umsg("Now let's delete 75. First we search for it in the table by taking the hash value of 75 to get slot 5. But this does not contain 75, so we have to search down the probe sequence.");
  arr.unhighlight(6);
  arr.highlight(5);
  av.step();

  av.umsg("Check slot 6, which is first on the probe sequence. This does not contain the record we are looking for. But it is not empty, so we know not to stop searching.");
  arr.unhighlight(5);
  arr.highlight(6);
  av.step();

  av.umsg("Check slot 7, which is next on the probe sequence. This does contain our record.");
  arr.unhighlight(6);
  arr.highlight(7);
  av.step();

  av.umsg("Now remove 75.");
  arr.value(7, "[Del]");
  av.step();

  av.umsg("Now insert 97. We hash to slot 7, and find it contains a tombstone. So we can insert there.");
  arr.value(7, 97);
  av.step();

  av.umsg("Finally, what happens in an unsuccessful search? Let's search for 96. We begin by hashing to slot 6, which does not contain our record.");
  arr.unhighlight(7);
  arr.highlight(6);
  av.step();

  av.umsg("But, since slot 6 has a tombstone, it is still possible that our record is in the table. So let's probe to slot 7. No luck there.");
  arr.unhighlight(6);
  arr.highlight(7);
  av.step();

  av.umsg("Since slot 7 had a record, we have to keep going. Now probe to slot 8, which is empty. Therefore, we now know that 96 is not in the table.");
  arr.unhighlight(7);
  arr.highlight(8);
  av.recorded();
}(jQuery));
