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
        i;
    var arrValues = ODSA.AV.processArrayValues(Math.pow(10, dSize));
    
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
        countArray[i] = 0;
      }

      arr = av.ds.array(arrValues, {indexed: true, layout: "array"});
      av.label("Input Array", {before: arr, left: 135, top: -10});
      arrC = av.ds.array(countArray, {indexed: true, layout: "array"});
      av.label("Count Array", {before: arrC, left: 135, top: 70});
      arrO = av.ds.array(outArray, {indexed: true, layout: "array"});
      av.label("Auxilliary Array", {before: arrO, left: 135, top: 145});
      av.umsg(interpret("av_c1"));
      av.displayInit();
      radsort();
      av.umsg(interpret("av_c2"));
      av.recorded(); // mark the end
    }
  }

  // Radixsort
  function radsort() {
    var i, d;
    var shift = 1;
    var answer;
    for (d = 0; d < $("#digitsize").val(); d++) {
      for (i = 0; i < ASize; i++) {
        answer = Math.floor((arr.value(i) / shift) % 10);
        av.umsg(arr.value(i) + interpret("av_c3") + answer +
                interpret("av_c4") + answer + interpret("av_c5"));
        arr.highlight([i]);
        arrC.highlight([answer]);
        av.step();
        arr.unhighlight([i]);
        arrC.unhighlight([answer]);
        if (arrC.value(answer) === 0) {
          arrC.value(answer, 1);
        } else {
          arrC.value(answer, arrC.value(answer) + 1);
        }
      }
      av.umsg(interpret("av_c6"));
      av.step();
      arrC.highlight(0);
      av.umsg(interpret("av_c7"));
      arrC.value(0, arrC.value(0) - 1);
      av.step();
      for (i = 1; i < 10; i++) {
        av.umsg(arrC.value(i - 1) + " + " + arrC.value(i) +
                interpret("av_c8") + (arrC.value(i - 1) + arrC.value(i)) +
                interpret("av_c9") + i);
        arrC.highlight(i);
        av.step();
        arrC.value(i, arrC.value(i) + arrC.value(i - 1));
        av.step();
        arrC.unhighlight(i - 1);
      }
      arrC.unhighlight(9);

      av.umsg(interpret("av_c10"));
      av.step();
      for (i = ASize - 1; i >= 0; i--) {
        answer = Math.floor((arr.value(i) / shift) % 10);
        av.umsg(arr.value(i) + interpret("av_c3") + answer +
                interpret("av_c11") + answer + interpret("av_c12") +
                arrC.value(answer) + interpret("av_c13"));
        arrO.highlight(arrC.value(answer));
        arrC.highlight(answer);
        arr.highlight(i);
        arrO.value(arrC.value(answer), arr.value(i));
        av.step();
        arrC.value(answer, arrC.value(answer) - 1);
        av.umsg(interpret("av_c14") + answer);
        av.step();
        arrO.unhighlight([arrC.value(answer) + 1]);
        arrC.unhighlight([answer]);
        arr.unhighlight([i]);
      }

      av.umsg(interpret("av_c15"));
      for (i = 0; i < 10; i++) {
        arrC.value(i, 0);
      }
      av.umsg(interpret("av_c16"));
      av.step();
      for (i = 0; i < ASize; i++) {
        av.effects.moveValue(arrO, i, arr, i);
      }
      av.umsg(interpret("av_c17"));
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

  var av,     // for JSAV library object
      arr,    // for the JSAV array
      arrC,
      arrO;

  // Number of values in the array
  var ASize = $("#arraysize").val();

  // The array of numbers
  var countArray = [];
  var outArray = [];

  // Placeholder text translation needs to be set explicitly
  $("#arrayValues").attr("placeholder", interpret("av_arrValsPlaceholder"));

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));

  // Initialize the arraysize dropdown list
  ODSA.AV.initArraySize(5, 16, 8);
});
