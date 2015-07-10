"use strict";
(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("hashFuncExCON1");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("We will demonstrate the mod hash function. To make the compuation easy (because you can probably do mod by 10 in your head easily) we will store records in an array of size 10.");
  av.displayInit();

  av.umsg("We store the record with key value i at array position i % 10. So we have no restriction on key range.");
  av.step();

  av.umsg("Insert a record with key value 5.");
  av.step();

  av.umsg("Store it in array position 5 % 10 = 5.");
  arr.value(5, 5);
  arr.highlight(5);
  av.step();

  av.umsg("Insert a record with key value 27.");
  arr.unhighlight(5);
  av.step();

  av.umsg("Store it in array position 27 % 10 = 7.");
  arr.value(7, 27);
  arr.highlight(7);
  av.step();

  av.umsg("Insert a record with key value 122.");
  arr.unhighlight(7);
  av.step();

  av.umsg("Store it in array position 122 % 10 = 2.");
  arr.value(2, 122);
  arr.highlight(2);
  av.step();

  av.umsg("Of course, we cannot store multiple records with the same key value using this hash function either.");
  arr.unhighlight(2);
  av.step();

  av.umsg("The good news is that we can immediately tell if there is a record with key value 392 in the array. We simply take 392 % 10 = 2, and check to see if the key for the record in position 2 matches 392 (which it does not in this example).");
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("hashFuncExCON2");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("We will demonstrate the Binning hash function. To make the compuation easy (because you can probably divide by 10 in your head easily) we will store records in an array of size 10.");
  av.displayInit();

  av.umsg("We will assume that the key values are in the range 0 to 999. We will compute our array position by dividing the key value by 100 (using integer division).");
  av.step();

  av.umsg("Insert a record with key value 5.");
  av.step();

  av.umsg("Store it in array position 5/100 = 0.");
  arr.value(0, 5);
  arr.highlight(0);
  av.step();

  av.umsg("Insert a record with key value 270.");
  arr.unhighlight(5);
  av.step();

  av.umsg("Store it in array position 270/100 = 2.");
  arr.value(2, 270);
  arr.highlight(0);
  av.step();

  av.umsg("Insert a record with key value 822.");
  arr.unhighlight(2);
  av.step();

  av.umsg("Store it in array position 822/100 = 8.");
  arr.value(8, 822);
  arr.highlight(8);
  av.recorded();
}(jQuery));
