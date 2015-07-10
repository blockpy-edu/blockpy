"use strict";

(function ($) {
  var av = new JSAV("ExternalMergeSortExample");



  av.umsg("Assume that each record has four bytes of data and a 4-byte key, for a total of eight bytes per record:");

  var label1 = av.label("8-byte record", {left: 115, top: 0});
  var rect1 = av.g.rect(50, 37, 250, 40);
  var line1 = av.g.line(160, 37, 160, 77, {"stroke-width": "2"});
  var rectlabel1 = av.label("4-byte key", {left: 60, top: 30});
  var rectlabel2 = av.label("4-bytes of data", {left: 170, top: 30});

  av.displayInit();


  av.umsg("We store the records in a file, where each block in the file is of size 4KB:");
  // hide previous unneeded variables
  rect1.hide();
  label1.hide();
  line1.hide();
  rectlabel1.hide();
  rectlabel2.hide();
  var rect2 = av.g.rect(50, 37, 300, 100);
  var rectlabel3 = av.label("A 4KB block", {left: 145, top: 50});
  var rectlabel4 = av.label("contains 512 8-byte records", {left: 90, top: 70});
  av.step();


  av.umsg("Our basic Mergesort would start by merging runs of length 1 into runs of length 2, and thos would be merged into runs of length 4, then 8, and so on. It would take 9 merge passes to create runs with 512 records.");
  // hide previous unneeded variables
  rectlabel3.hide();
  rectlabel4.hide();
  rect2.hide();
  av.step();


  av.umsg("We can do something different. We can take one block (of 4KB, or 512 records), read it into memory, run our favorite in-memory sort on it, and write it to the output file.");
  var rect3 = av.g.rect(50, 37, 220, 100);
  var rect4 = av.g.rect(350, 37, 220, 100);
  var rectlabel5 = av.label("One block from input file:", {left: 60, top: 50});
  var rectlabel6 = av.label("512 records in 4KB.", {left: 60, top: 70});
  var rectlabel7 = av.label("One block from output file", {left: 360, top: 40});
  var rectlabel8 = av.label("after sorting: 512 sorted", {left: 360, top: 60});
  var rectlabel9 = av.label("records in 4KB.", {left: 360, top: 80});
  var line2 = av.g.line(270, 80, 350, 80, {"stroke-width": "10", "arrow-end": "classic"});
  av.step();

  av.umsg("In one pass, we have created a file with runs of 512 records.");
  // hide previous unneeded variables
  rect3.hide();
  rect4.hide();
  rectlabel5.hide();
  rectlabel6.hide();
  rectlabel7.hide();
  rectlabel8.hide();
  rectlabel9.hide();
  line2.hide();
  av.step();

  av.umsg("Now assume we have 256k records. Standard Mergesort would require eighteen passes to process 256k records.");
  av.step();

  av.umsg("However, processing each block as a unit can do 512 records in one pass with an internal sort instead of 9 passes with the simple Mergesort.");
  var rect5 = av.g.rect(50, 37, 190, 100);
  var rect6 = av.g.rect(380, 37, 190, 100);
  var rectlabel10 = av.label("Unsorted block of 512", {left: 60, top: 50});
  var rectlabel11 = av.label("records.", {left: 60, top: 70});
  var rectlabel12 = av.label("Sorted block of 512", {left: 390, top: 50});
  var rectlabel13 = av.label("records", {left: 390, top: 70});
  var rectlabel14 = av.label("Apply one pass of an internal sort", {left: 200, top: -10});
  var line3 = av.g.line(240, 80, 380, 80, {"stroke-width": "10", "arrow-end": "classic"});
  av.step();


  av.umsg("This means that we only need 9 more passes to finish sorting the 256k records. That is a total of 10 passes.");
  // hide previous unneeded variables
  rect5.hide();
  rect6.hide();
  rectlabel10.hide();
  rectlabel11.hide();
  rectlabel12.hide();
  rectlabel13.hide();
  rectlabel14.hide();
  line3.hide();
  av.step();


  av.umsg("Now the runs of 512 records can be merged by Mergesort. By using an internal sort it takes one initial pass to create the runs of 512 records and nine merge passes to put them all together, approximately half as many passes.");
  var rect7 = av.g.rect(50, 37, 190, 100);
  var rect8 = av.g.rect(380, 37, 190, 100);
  var rectlabel15 = av.label("500 blocks each with", {left: 60, top: 50});
  var rectlabel16 = av.label("512 sorted records", {left: 60, top: 70});
  var rectlabel17 = av.label("One run of 256k", {left: 390, top: 50});
  var rectlabel18 = av.label("sorted records", {left: 390, top: 70});
  var rectlabel19 = av.label("Apply nine merge passes", {left: 210, top: -10});
  var line4 = av.g.line(240, 80, 380, 80, {"stroke-width": "10", "arrow-end": "classic"});
  av.step();




  av.recorded();
}(jQuery));
