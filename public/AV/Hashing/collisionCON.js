"use strict";

// Convenience function for setting another type of highlight
// (will be used for showing which elements will be compared during sort)
var setBlue = function (arr, index) {
  arr.css(index, {"background-color": "#ddf" });
};

// Convenience function for setting another type of highlight
// (will be used for showing which elements will be compared during sort)
var setRed = function (arr, index) {
  arr.css(index, {"background-color": "#fdd" });
};

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("collisionCON1");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("When doing collision resolution with linear probing by steps of size 2 on a hash table of size 10, a record that hashes to slot 4...");
  setBlue(arr, 4);
  av.displayInit();

  av.umsg("... will first probe to slot 6...");
  arr.highlight(6);
  av.step();

  av.umsg("... then slot 8...");
  arr.highlight(8);
  av.step();

  av.umsg("... then slot 0...");
  arr.highlight(0);
  av.step();

  av.umsg("... and finally slot 2.");
  arr.highlight(2);
  av.step();

  av.umsg("A record that hashes to slot 3...");
  arr.unhighlight([0, 2, 4, 6, 8]);
  arr.css(4, {"background-color": "#fff" }); // Why doesn't this unhighlight?
  setBlue(arr, 3);
  av.step();

  av.umsg("... will first probe to slot 5...");
  arr.highlight(5);
  av.step();

  av.umsg("... then slot 7...");
  arr.highlight(7);
  av.step();

  av.umsg("... then slot 9...");
  arr.highlight(9);
  av.step();

  av.umsg("... and finally slot 1.");
  arr.highlight(1);
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("collisionCON2");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("When doing collision resolution with linear probing by steps of size 3 on a hash table of size 10, a record that hashes to slot 4...");
  setBlue(arr, 4);
  av.displayInit();

  av.umsg("... will first probe to slot 7...");
  arr.highlight(7);
  av.step();

  av.umsg("... then slot 0...");
  arr.highlight(0);
  av.step();

  av.umsg("... then slot 3...");
  arr.highlight(3);
  av.step();

  av.umsg("... then slot 6...");
  arr.highlight(6);
  av.step();

  av.umsg("... then slot 9...");
  arr.highlight(9);
  av.step();

  av.umsg("... then slot 2...");
  arr.highlight(2);
  av.step();

  av.umsg("... then slot 5...");
  arr.highlight(5);
  av.step();

  av.umsg("... then slot 8...");
  arr.highlight(8);
  av.step();

  av.umsg(" and finally to slot 1.");
  arr.highlight(1);
  av.step();

  av.umsg("Since stepsize 3 is relatively prime to table size 10, all slots are eventually visited by the probe sequence.");
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  var permarray = [0, 3, 7, 6, 1, 4, 9, 2, 5, 8];
  var countup = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  empty.length = 10;
  var av = new JSAV("collisionCON3");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});
  var perm = av.ds.array(permarray, {indexed: true, visible: false});

  av.umsg("Let's see an example of collision resolution using pseudorandom probing on a hash table of size 10 using the simple mod hash function.");
  av.displayInit();

  av.umsg("We need to first define a random permutation of the values 1 to M-1 that all inserts and searches will use. This is shown in the <code>permuation</code> array, so that you can see it during the whole slideshow.");
  perm.show();
  av.label("Permutation:", {before: perm, top: 70});
  av.step();

  av.umsg("Insert a record with key value 157.");
  arr.highlight(7);
  arr.value(7, 157);
  av.step();

  av.umsg("Insert a record with key value 273.");
  arr.unhighlight(7);
  arr.highlight(3);
  arr.value(3, 273);
  av.step();

  av.umsg("Insert a record with key value 17. Unfortunately there is already a value in slot 7.");
  arr.unhighlight(3);
  arr.highlight(7);
  av.step();

  av.umsg("So now we look in the permuation array for the value at position perm[1], and add that value to the home slot index (which is 7), to get a value of 10 % 10, which is slot 0.");
  arr.unhighlight(7);
  arr.highlight(0);
  arr.value(0, 17);
  av.step();

  av.umsg("Insert a record with key value 913. Unfortunately there is already a value in slot 3.");
  arr.unhighlight(0);
  arr.highlight(3);
  av.step();

  av.umsg("So now we look in the permuation array for the value at position perm[1], and add that value to the home slot index (which is 3), to get a value of 6.");
  arr.unhighlight(3);
  arr.highlight(6);
  arr.value(6, 913);
  av.step();

  av.umsg("Insert a record with key value 110. Unfortunately there is already a value in slot 0.");
  arr.unhighlight(6);
  arr.highlight(0);
  av.step();

  av.umsg("So now we look in the permuation array for the value at position perm[1], and add that value to the home slot index (which is 0), to get a value of 3. Unfortunately, slot 3 is full as well!");
  arr.unhighlight(0);
  arr.highlight(3);
  av.step();

  av.umsg("So now we look in the permuation array for the value at position perm[2], and add that value to the home slot index (which is 0), to get a value of 7. Unfortunately, slot 7 is full as well!");
  arr.unhighlight(3);
  arr.highlight(7);
  av.step();

  av.umsg("So now we look in the permuation array for the value at position perm[3], and add that value to the home slot index (which is 0), to get a value of 6. Unfortunately, slot 6 is full as well!");
  arr.unhighlight(7);
  arr.highlight(6);
  av.step();

  av.umsg("So now we look in the permuation array for the value at position perm[4], and add that value to the home slot index (which is 0), to get a value of 1. Finally!");
  arr.unhighlight(6);
  arr.highlight(1);
  arr.value(1, 110);
  av.step();

  av.umsg("Of course, any permutation is possible. Even one that gives us a bad probe sequence, such as the same as we would get from linear probing. But this will almost never happen in practice, since any given permutation is expected to appear once in n! tries.");
  var i;
  arr.unhighlight(1);
  for (i = 0; i < 10; i++) { arr.value(i, ""); }
  for (i = 0; i < 10; i++) { perm.value(i, i); }
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  var permarray = [0, 3, 1, 4, 9, 7, 6, 2, 5, 8];
  empty.length = 10;
  var av = new JSAV("collisionCON4");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});
  var perm = av.ds.array(permarray, {indexed: true, visible: false});

  av.umsg("First recall what happens with linear probing by steps of 2. Say that one record hashes to slot 4, and another hashes to slot 6.");
  arr.value(4, 104);
  arr.value(6, 936);
  av.displayInit();

  av.umsg("Consider the probe sequence extending out slot 4: It would visit 6, then 8, then 0, then 2.");
  arr.highlight([6, 8, 0, 2]);
  av.step();

  av.umsg("The probe sequence extending out of slot 6 visits 8, then 0, then 2, then 4.");
  arr.highlight(4);
  av.step();

  av.umsg("In other words, once the two probe sequences join, they move together, leading to a form of clustering.");
  av.step();

  av.umsg("In contrast, consider what happens with pseudo-random probing. Consider a record that hashes to slot 3, and another that hashes to slot 6.");
  arr.unhighlight([0, 2, 4, 6, 8]);
  arr.value(4, "");
  arr.value(6, "");
  perm.show();
  setBlue(arr, 3);
  setBlue(arr, 6);
  av.step();

  av.umsg("The probe sequence extending out of slot 3 first goes to slot 3 + 3 = 6...");
  arr.highlight(6);
  av.step();

  av.umsg("... and then to slot 3 + 1 = 4...");
  arr.highlight(4);
  av.step();

  av.umsg("... and next to slot 3 + 4 = 7.");
  arr.highlight(7);
  av.step();

  av.umsg("However, the probe sequence extending out of slot 6 first goes to slot 6 + 1 = 7...");
  arr.unhighlight(7);
  setRed(arr, 7);
  av.step();

  av.umsg("... and then to slot (6 + 4) % 10 = 0...");
  setRed(arr, 0);
  av.step();

  av.umsg("... and next to slot (6 + 9) % 10 = 5. So you can see that the two trails, while they might meet occasionally, do not follow along together.");
  setRed(arr, 5);
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("collisionCON5");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("Under quadratic probing, two keys with different home positions will have diverging probe sequences. Consider a value that hashes to slot 5. Its probe sequence is 5, then 5 + 1 = 6, then 5 + 4 = 9, then (5 + 9) % 10 = 4, and so on.");
  setBlue(arr, 5);
  arr.highlight([6, 9, 4]);
  av.displayInit();

  av.umsg("A key that hashes to slot 6 will instead follow a probe sequence that goes first to slot 6 + 1 = 7, then slot (6 + 4) % 10 = 0, and then (6 + 9) % 10 = 5.");
  setBlue(arr, 6);
  setRed(arr, 7);
  setRed(arr, 0);
  setRed(arr, 5);
  av.step();

  av.umsg("Thus, even though the key hashing to slot 5 will next hit the home slot of the key that hashes to slot 6, their probe sequences diverge after that.");
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  empty.length = 10;
  var av = new JSAV("collisionCON6");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("Unfortunately, quadratic probing has the disadvantage that typically not all hash table slots will be on the probe sequence.");
  av.displayInit();

  av.umsg("Using p(K, i) = i<sup>2</sup> gives particularly inconsistent results.");
  av.step();

  av.umsg("Think of any number, and square it. The result will end in 0, 1, 4, 5, 6, or 9. Thus these are the only slots that can be reached by the probe sequence for a key value that hashes to slot 0.");
  arr.highlight([0, 1, 4, 5, 6, 9]);
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  empty.length = 11;
  var av = new JSAV("collisionCON7");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("Let's see what happens when we use a hash table of size M = 11 (a prime number), our primary hash function is a simple mod on the table size (as usual), and our secondary hash function is h<sub>2</sub>(k) = 1 + (k % (M-1)).");
  av.label("h<sub>2</sub>(k) = 1 + (k % (M-1))", {top: 85, left: 250});
  av.displayInit();

  av.umsg("Insert 55.");
  arr.highlight(0);
  arr.value(0, 55);
  av.step();

  av.umsg("Insert 66. This causes a collision at slot 0.");
  av.step();

  av.umsg("Compute h<sub>2</sub>(66) = 1 + (66 % 10) = 7. So we will now do linear probing by steps of 7. Slot 0 + 7 = 7 is checked first, and it is empty.");
  arr.unhighlight(0);
  arr.highlight(7);
  arr.value(7, 66);
  av.step();

  av.umsg("Insert 11. This causes a collision at slot 0.");
  arr.unhighlight(7);
  arr.highlight(0);
  av.step();

  av.umsg("Compute h<sub>2</sub>(11) = 1 + (11 % 10) = 2. So we will now do linear probing by steps of 2. Slot 0 + 2 = 2 is checked first, and it is empty.");
  arr.unhighlight(0);
  arr.highlight(2);
  arr.value(2, 11);
  av.step();

  av.umsg("Insert 24. This causes a collision at slot 2.");
  av.step();

  av.umsg("Compute h<sub>2</sub>(24) = 1 + (24 % 10) = 5. So we will now do linear probing by steps of 5. Slot 2 + 5 = 7 is checked first, and we get another collision.");
  arr.unhighlight(2);
  arr.highlight(7);
  av.step();
  
  av.umsg("Step again by 5 to slot 7 + 5 = 12 % 11 = 1. Slot 1 is free.");
  arr.unhighlight(7);
  arr.highlight(1);
  arr.value(1, 24);
  av.recorded();
}(jQuery));

(function ($) {
  var empty = [];
  empty.length = 16;
  var av = new JSAV("collisionCON8");
  // Create an array object under control of JSAV library
  var arr = av.ds.array(empty, {indexed: true});

  av.umsg("Now we try the alternate second hash function. Use a hash table of size M = 16 (a power of 2), our primary hash function is a simple mod on the table size (as usual), and our secondary hash function is h<sub>2</sub>(k) = (((k/M) % (M/2)) * 2) + 1.");
  av.label("h<sub>2</sub>(k) = (((k/M) % (M/2)) * 2) + 1", {top: 85, left: 315});
  av.displayInit();

  av.umsg("Insert 55. 55 % 16 = 7.");
  arr.highlight(7);
  arr.value(7, 55);
  av.step();

  av.umsg("Insert 39. 39 % 16 = 7. This causes a collision at slot 7.");
  av.step();

  av.umsg("Compute h<sub>2</sub>(39) = ((39/16) % 8) * 2 + 1 = 5. So we will now do linear probing by steps of 5. Slot 7 + 5 = 12 is checked first, and it is empty.");
  arr.unhighlight(7);
  arr.highlight(12);
  arr.value(12, 39);
  av.step();

  av.umsg("Insert 92. 92 % 16 = 12. This causes a collision at slot 12.");
  av.step();

  av.umsg("Compute h<sub>2</sub>(92) = ((92/16) % 8) * 2 + 1 = 11. So we will now do linear probing by steps of 11. Slot (12 + 11) % 16 = 7 is checked first. Since this contains a value, we get another collision.");
  arr.unhighlight(12);
  arr.highlight(7);
  av.step();

  av.umsg("Step forward by 11 again. (7 + 11) % 16 = 2, so check slot 2. This is empty.");
  arr.unhighlight(7);
  arr.highlight(2);
  arr.value(2, 46);
  av.recorded();
}(jQuery));
