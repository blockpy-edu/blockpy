/*
 *
*/

var startarray = [12, 19, 31, 25, 21, 56, 40];

(function ($) {
  var input = [16, 29, 14, 35, 23];
  var output = ["", "", "", "", ""];
  var t;
  var av = new JSAV("ExternalReplacementSelection");
  if (t) {
        t.clear();
  }
  t = av.ds.binheap(startarray, {compare: function (a, b) { return b - a; },
                                       steps: false, heapify: false});

  var inputlabel = av.label("Input:", {left: 600, top: 80});
  var outputlabel = av.label("Output:", {left: 10, top: 80});
  var inputarray = av.ds.array(input, {indexed: false, left: 600, top: 120});
  var outputarray = av.ds.array(output, {indexed: false, left: 10, top: 120}); 

  // colors for animation
  var highlight_background_color = "#2B44CF";
  var highlight_text_color = "white";
  var unhighlight_background_color = "white";
  var unhighlight_background_split_color = "black";

  var highlight = function (index, arr) {
    arr.css(index, {"background-color": highlight_background_color, "color": "white"});
  };

  var unhighlight = function (index, arr) {
    arr.css(index, {"background-color": unhighlight_background_color, "color": "black"});
  };

  av.umsg("This is our starting heap:");
  av.displayInit();

  // step 3
  av.umsg("The root value 12 is output. The heap now waits for an input.");
  highlight(0, outputarray);
  t.value(0, "");
  outputarray.value(0, 12);
  // didn't use moveValue here because of some weird # of slides glitch
  //av.effects.moveValue(t, 0, outputarray, 0);
  av.step();

  // step 2
  av.umsg("We have an incoming value of 16.");
  unhighlight(0, outputarray);
  highlight(0, inputarray);
  av.step();


  // step 4
  av.umsg("16 is moved to the root.");
  av.effects.moveValue(inputarray, 0, t._treenodes[0]);
  t.value(0, "16");
  unhighlight(0, inputarray);
  highlight(0, t);
  av.step();

  // step 5
  av.umsg("Since both 19 and 31 are less than 16 we are done.");
  unhighlight(0, t);
  av.step();

  // step 7
  av.umsg("The root value 16 is output.");
  av.effects.moveValue(t, 0, outputarray, 1);
  highlight(1, outputarray);
  av.step();

  // step 6
  av.umsg("Now we have an input value of 29.");
  highlight(1, inputarray);
  unhighlight(1, outputarray);
  av.step();

  // step 8
  av.umsg("29 is moved to the root. The value 29 is greater than 19 so we must sift down.");
  highlight(0, t);
  av.effects.moveValue(inputarray, 1, t._treenodes[0]);
  t.value(0, "29");
  unhighlight(1, inputarray);
  av.step();

  // step 9
  av.umsg("The value 19 is less than 29 and 31 so its placement is correct. However 29 is greater than 25 and 21 so it must be moved again.");
  t.swap(0, 1);
  highlight(0, t);
  highlight(1, t);
  av.step();

  // step 10
  av.umsg("We choose 21 because it is less than 25 and we are done.");
  unhighlight(0, t)
  t.swap(1, 4);
  highlight(4, t);
  av.step();
 
  // step 12
  av.umsg("The root value 19 is output.");
  av.effects.moveValue(t, 0, outputarray, 2);
  unhighlight(1, t);
  unhighlight(4, t);
  highlight(2, outputarray);
  av.step();

  // step 11
  av.umsg("Now we have an input value of 14.");
  highlight(2, inputarray);
  unhighlight(2, outputarray);
  av.step();

  // step 13
  av.umsg("14 is too small for this run and is placed at the end of the array, moving 40 to the root.");
  inputarray.value(2, "");
  unhighlight(2, inputarray);
  t.swap(0, 6);
  highlight(0, t);
  t.value(6, "14");
  t._treenodes[6].edgeToParent().hide();
  highlight(6, t);
  av.step();

  
  // step 14
  av.umsg("40 is greater than 21 and 31 so we must sift down.");
  unhighlight(6, t);
  av.step();

  // step 15
  av.umsg("21 is less than 40 and 31 so it finished moving. 40 is greater than 25 and 29 so we must sift down.");
  highlight(1, t);
  t.swap(0, 1);
  av.step();

  
  // step 16
  av.umsg("We choose 25 because it is less than 29 and we are done.");
  unhighlight(0, t);
  highlight(3, t);
  t.swap(1, 3);
  av.step();

  // step 18
  av.umsg("The root value 21 is output.");
  av.effects.moveValue(t, 0, outputarray, 3);
  highlight(3, outputarray);
  unhighlight(3, t);
  unhighlight(1, t);
  av.step();  

  // step 17
  av.umsg("Now we have an input value of 35.");
  highlight(3, inputarray);
  unhighlight(3, outputarray);
  av.step();  
  
  // step 19
  av.umsg("35 is moved to the root. 35 is greater than 25 and 31 so we must sift down.");
  highlight(0, t);
  av.effects.moveValue(inputarray, 3, t._treenodes[0]);
  t.value(0, "35");
  unhighlight(3, inputarray);
  av.step();

  // step 20
  av.umsg("25 is now correctly placed. 35 is greater than 29 so we must sift down.");
  t.swap(0, 1);
  highlight(1, t);
  av.step();


  // step 21
  av.umsg("29 and 35 are now correctly placed and we are done.");
  unhighlight(0, t);
  t.swap(1, 4);
  highlight(4, t);
  av.step();

  // step 23
  av.umsg("The root value 25 is output.");
  av.effects.moveValue(t, 0, outputarray, 4);
  unhighlight(4, t);
  unhighlight(1, t);
  highlight(4, outputarray);
  av.step();

  // step 22
  av.umsg("Now we have an input value of 23.");
  highlight(4, inputarray);
  unhighlight(4, outputarray);
  av.step();

  // step 24
  av.umsg("23 is too small for this run and is placed at the end of the array, moving 56 to the root.");
  inputarray.value(4, "");
  unhighlight(4, inputarray);
  t.swap(0, 5);
  highlight(0, t);
  t.value(5, "23");
  t._treenodes[5].edgeToParent().hide();
  highlight(5, t);
  av.step();

  // step 25
  av.umsg("56 is greater than 29 and 31 so we must sift down.");
  unhighlight(5, t);
  av.step();

  // step 26
  av.umsg("29 is less than 56 and 31 so it finished moving. 56 is greater than 40 and 35 so we must sift down.");
  highlight(1, t);
  t.swap(0, 1);
  av.step();

  // step 27
  av.umsg("We choose 35 because it is less than 40 and we are done.");
  unhighlight(0, t);
  highlight(4, t);
  t.swap(1, 4);
  av.step();

  // cleanup
  av.recorded();

}(jQuery));
