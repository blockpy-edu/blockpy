"use strict";
/*global alert: true, ODSA */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Process help button: Give a full help page for this activity
  // We might give them another HTML page to look at.
  function help() {
    window.open("radixHelpAV.html", "helpwindow");
  }

  // Execute the "Run" button function
  function runIt() {
    var dSize = $("#digitsize").val(),
        i,
        arrValues = ODSA.AV.processArrayValues(Math.pow(10, dSize));
    
    // If arrValues is null, the user gave us junk which they need to fix
    if (arrValues) {
      ODSA.AV.reset(true);
      av = new JSAV($(".avcontainer"));

      // Set the digit size to the length of the largest number in the array
      var max = Math.max.apply(Math, arrValues);
      dSize = String(max).length;
      $("#digitsize").val(dSize);

      ASize = $("#arraysize").val();

      // Reset outArray and digitArray
      outArray.length = 0;
      for (i = 0; i < ASize; i++) {
        outArray[i] = "";
      }
      for (i = 0; i < 10; i++) {
        digitArray[i] = "";
      }

      // Create a new array using the layout the user has selected
      arr = av.ds.array(arrValues, {indexed: true, layout: "vertical",
                                    center: false, top: 35, left: 30});
      av.label("Input", {before: arr, left: 45, top: 12});
      arrDigit = av.ds.array(digitArray, {indexed: true, layout: "vertical",
                                          center: false, top: 35, left: 200});
      av.label("Digit", {before: arrDigit, left: 215, top: 12});
      arrOut = av.ds.array(outArray, {indexed: true, layout: "vertical",
                                      center: false, top: 35, left: 720});
      av.label("Output", {before: arrOut, left: 728, top: 12});
      av.umsg("Starting Radix Sort. We will process digits from right to left.");
      av.displayInit();
      radsort();
      av.umsg(interpret("av_c8"));
      av.recorded(); // mark the end
    }
  }

  //Radix linked list sort
  function radsort() {
    var i, j, d, curr;
    var shift = 1;
    var answer;
    var lists = [];
    var arrows = [];
    var oldanswer;

    for (d = 0; d < $("#digitsize").val(); d++) {
      av.umsg("Starting a new pass.");
      av.step();
      // Initialize the lists
      for (i = 0; i < 10; i++) {
        lists[i] = av.ds.list({top: (47 + i * 46), left: 270, nodegap: 30});
        lists[i].layout({center: false});
        // create initially hidden arrows from array indices to lists
        arrows[i] = av.g.line(230, 77 + i * 46, 270, 77 + i * 46,
                       {"arrow-end": "classic-wide-long", "opacity": 0,
                        "stroke-width": 2});
      }
      av.umsg(interpret("av_c1"));
      av.step();
      oldanswer = -1;
      for (i = 0; i < ASize; i++) {
        answer = Math.floor((arr.value(i) / shift) % 10);
        av.umsg(arr.value(i) + interpret("av_c2") + answer +
                interpret("av_c3") + answer + interpret("av_c4"));
        arr.highlight(i);
        arr.unhighlight(i - 1);
        lists[answer].addLast(arr.value(i));
        if (lists[answer].size() === 1) {
          // show arrow when adding first item to list
          arrows[answer].show();
        }
        lists[answer].layout({center: false});
        if (answer !== oldanswer) { arrDigit.highlight(answer); }
        arrDigit.unhighlight(oldanswer);
        oldanswer = answer;
        av.step();
      }
      arrDigit.unhighlight(oldanswer);
      arr.unhighlight(ASize - 1);
      av.umsg(interpret("av_c5"));
      av.step();
      curr = 0;
      for (i = 0; i < 10; i++) {
        arrDigit.highlight(i);
        arrDigit.unhighlight(i - 1);
        while (lists[i].size() !== 0) {
          arrOut.value(curr++, lists[i].get(0).value());
          lists[i].remove(0);
          lists[i].layout({center: false});
          if (lists[i].size() === 0) {
            // hide arrow when removing last item from list
            arrows[i].hide();
          }
          av.step();
        }
        arrDigit.unhighlight(9);
      }
      av.umsg(interpret("av_c6"));
      av.step();
      for (i = 0; i < ASize; i++) {
        av.effects.moveValue(arrOut, i, arr, i);
      }
      av.umsg(interpret("av_c7"));
      av.step();
      shift = shift * 10;
    }
  }

  // Connect action callbacks to the HTML entities
  $("#help").click(help);
  $("#about").click(about);
  $("#run").click(runIt);
  $("#reset").click(ODSA.AV.reset);


  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load the config object with interpreter
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter;       // get the interpreter

  var av,   // for JSAV library object
      arr,    // for the JSAV array
      arrDigit,
      arrOut;

  // Number of values in the array
  var ASize = $("#arraysize").val();

  // The array of numbers
  var digitArray = [];
  var outArray = [];

  // Placeholder text translation needs to be set explicitly
  $("#arrayValues").attr("placeholder", interpret("av_arrValsPlaceholder"));

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));

  // Initialize the arraysize dropdown list
  ODSA.AV.initArraySize(5, 10, 8);
});
