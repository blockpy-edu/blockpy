"use strict";

(function ($) {
  var input1 = [5, 10, 15];
  var input2 = [6, 7, 23];
  var input3 = [12, 18, 20];
  var invoutput = ["", "", "", "", "", "", "", "", "", "", "", ""];
  var output = ["", "", ""];

  var av = new JSAV("MultiMerge");
  // Create an array object under control of JSAV library
  var arr1 = av.ds.array(input1, {indexed: false, left: 85, top: 30});
  var arr2 = av.ds.array(input2, {indexed: false, left: 85, top: 80});
  var arr3 = av.ds.array(input3, {indexed: false, left: 85, top: 130});
  var arr4 = av.ds.array(output, {indexed: false, left: 400, top: 80});
  var invoutputarr = av.ds.array(invoutput, {indexed: false, left: 400, top: 0, visible: false});

  var setWhite = function (index, arr) {
    arr.css(index, {"background-color": "#FFFFFF", "color": "black" });
  };

  var setYellow = function (index, arr) {
    arr.css(index, {"background-color": "#FFFF00", "color": "black" });
  };

  var highlight_background_color = "#2B44CF";
  var highlight = function (index, arr) {
    arr.css(index, {"background-color": highlight_background_color, "color": "white"});
  };


  av.umsg("Here are our starting input runs for the multiway merge.");
  var inputlabel1 = av.label("Input Runs", {left: 90, top: 0});
  var outputlabel1 = av.label("Output Buffer", {left: 400, top: 50});

  av.displayInit();
  // step 2
  av.umsg("First we must look at the first value of each input run.");
  setYellow(0, arr1);
  setYellow(0, arr2);
  setYellow(0, arr3);

  av.step();

  // step 3
  av.umsg("The value 5 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr1, 0, arr4, 0);
  setYellow(0, arr4);
  setWhite(0, arr1);
  setWhite(0, arr2);
  setWhite(0, arr3);
  
  av.step();

  // step 4
  av.umsg("Next we look at the first values in the input runs again.");
  setWhite(0, arr4);
  setYellow(1, arr1);
  setYellow(0, arr2);
  setYellow(0, arr3);

  av.step();

  // step 5
  av.umsg("The value 6 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr2, 0, arr4, 1);
  setYellow(1, arr4);
  setWhite(1, arr1);
  setWhite(0, arr2);
  setWhite(0, arr3);
  
  av.step();

  // step 6
  av.umsg("Compare the first values again.");
  setWhite(1, arr4);
  setYellow(1, arr1);
  setYellow(1, arr2);
  setYellow(0, arr3);

  av.step();

  // step 7
  av.umsg("The value 7 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr2, 1, arr4, 2);
  setYellow(2, arr4);
  setWhite(1, arr1);
  setWhite(1, arr2);
  setWhite(0, arr3);
  
  av.step();

  // step 8
  av.umsg("We must write the output buffer to the disk.");   
  av.effects.moveValue(arr4, 0, invoutputarr, 0);
  av.effects.moveValue(arr4, 1, invoutputarr, 1);
  av.effects.moveValue(arr4, 2, invoutputarr, 2);
  setYellow(0, arr4);
  setYellow(1, arr4);

  av.step();

  // step 9
  av.umsg("Compare the first values again.");
  setWhite(0, arr4);
  setWhite(1, arr4);
  setWhite(2, arr4);
  setYellow(1, arr1);
  setYellow(2, arr2);
  setYellow(0, arr3);

  av.step();

  // step 10
  av.umsg("The value 10 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr1, 1, arr4, 0);
  setYellow(0, arr4);
  setWhite(1, arr1);
  setWhite(2, arr2);
  setWhite(0, arr3);
  
  av.step();

  // step 11
  av.umsg("Compare the first values again.");
  setWhite(3, arr4);
  setYellow(2, arr1);
  setYellow(2, arr2);
  setYellow(0, arr3);

  av.step();

  // step 12
  av.umsg("The value 12 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr3, 0, arr4, 1);
  setYellow(1, arr4);
  setWhite(2, arr1);
  setWhite(2, arr2);
  setWhite(0, arr3);
  
  av.step();

  // step 13
  av.umsg("Compare the first values again.");
  setWhite(4, arr4);
  setYellow(2, arr1);
  setYellow(2, arr2);
  setYellow(1, arr3);

  av.step();

  // step 14
  av.umsg("The value 15 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr1, 2, arr4, 2);
  setYellow(2, arr4);
  setWhite(2, arr1);
  setWhite(2, arr2);
  setWhite(1, arr3);
  
  av.step();

  // step 15
  av.umsg("We must write the output buffer to the disk again.");   
  av.effects.moveValue(arr4, 0, invoutputarr, 3);
  av.effects.moveValue(arr4, 1, invoutputarr, 4);
  av.effects.moveValue(arr4, 2, invoutputarr, 5);
  setYellow(0, arr4);
  setYellow(1, arr4);

  av.step();

  // step 16
  av.umsg("The first run is exhausted. Now we must read in the next block from disk.");
  var nextarr = [17, 25, 27];
  var invarr = av.ds.array(nextarr, {indexed: false, left: 0, top: 0, visible: false});
  av.effects.moveValue(invarr, 0, arr1, 0);
  av.effects.moveValue(invarr, 1, arr1, 1);
  av.effects.moveValue(invarr, 2, arr1, 2);
  highlight(0, arr1);
  highlight(1, arr1);
  highlight(2, arr1);
  setWhite(0, arr4)
  setWhite(1, arr4)
  setWhite(2, arr4);

  av.step();

  // step 17
  av.umsg("Compare the first values again.");
  setWhite(1, arr1);
  setWhite(2, arr1);
  setYellow(0, arr1);
  setYellow(2, arr2);
  setYellow(1, arr3);

  av.step();

  // step 18
  av.umsg("The value 17 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr1, 0, arr4, 0);
  setYellow(0, arr4);
  setWhite(0, arr1);
  setWhite(2, arr2);
  setWhite(1, arr3);
  
  av.step();

  // step 19
  av.umsg("Compare the first values again.");
  setWhite(0, arr4);
  setYellow(1, arr1);
  setYellow(2, arr2);
  setYellow(1, arr3);

  av.step();

  // step 20
  av.umsg("The value 18 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr3, 1, arr4, 1);
  setYellow(1, arr4);
  setWhite(1, arr1);
  setWhite(2, arr2);
  setWhite(1, arr3);
  
  av.step();

  // step 21
  av.umsg("Compare the first values again.");
  setWhite(1, arr4);
  setYellow(1, arr1);
  setYellow(2, arr2);
  setYellow(2, arr3);

  av.step();

  // step 22
  av.umsg("The value 20 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr3, 2, arr4, 2);
  setYellow(2, arr4);
  setWhite(1, arr1);
  setWhite(2, arr2);
  setWhite(2, arr3);
  
  av.step();

  // step 23
  av.umsg("We must write the output buffer to the disk again.");   
  av.effects.moveValue(arr4, 0, invoutputarr, 6);
  av.effects.moveValue(arr4, 1, invoutputarr, 7);
  av.effects.moveValue(arr4, 2, invoutputarr, 8);
  setYellow(0, arr4);
  setYellow(1, arr4);

  av.step();

  // step 24
  av.umsg("The third run is exhausted but there aren't any more blocks on disk so we compare first values again.");   
  setWhite(0, arr4);
  setWhite(1, arr4);
  setWhite(2, arr4);
  setYellow(1, arr1);
  setYellow(2, arr2);
  
  av.step();

  // step 25
  av.umsg("The value 23 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr2, 2, arr4, 0);
  setYellow(0, arr4);
  setWhite(1, arr1);
  setWhite(2, arr2);
  
  av.step();

  // step 26
  av.umsg("The second run is exhausted but there aren't any more blocks on disk so we compare first values again.");   
  setWhite(0, arr4);
  setYellow(1, arr1);
  
  av.step();

  // step 27
  av.umsg("The value 25 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr1, 1, arr4, 1);
  setYellow(1, arr4);
  setWhite(1, arr1);
  
  av.step();

  // step 28
  av.umsg("Compare first values again.");   
  setWhite(0, arr4);
  setWhite(1, arr4);
  setWhite(2, arr4);
  setYellow(2, arr1);
  
  av.step();

  // step 29
  av.umsg("The value 27 is removed first and sent to the output because it is the smallest value.");   
  av.effects.moveValue(arr1, 2, arr4, 2);
  setYellow(2, arr4);
  setWhite(2, arr1);
  
  av.step();

  // step 30
  av.umsg("We must write the output buffer to the disk again.");   
  av.effects.moveValue(arr4, 0, invoutputarr, 9);
  av.effects.moveValue(arr4, 1, invoutputarr, 10);
  av.effects.moveValue(arr4, 2, invoutputarr, 11);
  setYellow(0, arr4);
  setYellow(1, arr4);

  av.step();

  // step 31
  av.umsg("The first run is exhausted but there aren't any more blocks on disk so we are done.");
  setWhite(0, arr4);
  setWhite(1, arr4);
  setWhite(2, arr4);

  av.step();

  av.recorded();
}(jQuery));
