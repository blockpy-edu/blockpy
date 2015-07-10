"use strict";

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("hashIntroCON1");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("We will demonstrate the simplest hash function, storing records in an array of size 10.");
  av.displayInit();

  av.umsg("We store the record with key value i at array position i. Of course, this only works for records with keys in the range 0 to 9.");
  av.step();

  av.umsg("Insert a record with key value 5.");
  av.step();

  av.umsg("Store it in array position 5.");
  arr.value(5, 5);
  arr.highlight(5);
  av.step();

  av.umsg("Insert a record with key value 7.");
  arr.unhighlight(5);
  av.step();

  av.umsg("Store it in array position 7.");
  arr.value(7, 7);
  arr.highlight(7);
  av.step();

  av.umsg("Insert a record with key value 2.");
  arr.unhighlight(7);
  av.step();

  av.umsg("Store it in array position 2.");
  arr.value(2, 2);
  arr.highlight(2);
  av.step();

  av.umsg("Of course, we cannot store multiple records with the same key value either.");
  arr.unhighlight();
  av.step();

  av.umsg("The good news is that we can immediately tell if there is a record with key value 5 in the array.");
  av.recorded();
}(jQuery));
