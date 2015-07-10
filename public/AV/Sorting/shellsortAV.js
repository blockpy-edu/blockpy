"use strict";
/*global alert: true, ODSA, sweep */

$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Process help button: Give a full help page for this activity
  function help() {
    window.open("shellsortAVHelp.html", "helpwindow");
  }

  // Validate the increment series
  function checkIncrements() {
    var i,
        prev = Number.MAX_VALUE,
        msg = interpret("av_incrmsg");
    // Convert user's increments to an array,
    // assuming values are space separated
    var incrs = $("#increments").val().match(/[0-9]+/g) || [];
    for (i = 0; i < incrs.length; i++) {
      incrs[i] = Number(incrs[i]);
      if (isNaN(incrs[i]) || incrs[i] < 0 || incrs[i] > prev) {
        alert(msg);
        return null;
      }
      prev = incrs[i];
    }
    if (incrs[incrs.length - 1] !== 1) {
      alert(msg);
      return null;
    }
    return incrs;
  }

  // Execute the "Run" button function
  function runIt() {
    // Validate the user's increments
    var incrs = checkIncrements();

    var arrValues = ODSA.AV.processArrayValues();
    
    // If arrValues is null, the user gave us junk which they need to fix
    if (incrs && arrValues) {
      ODSA.AV.reset(true);
      av = new JSAV($(".avcontainer"));

      // Create a new array using the layout the user has selected
      arr = av.ds.array(arrValues, {indexed: true, layout: arrayLayout.val()});
      av.displayInit();

      for (var i = 0; i < incrs.length; i += 1) {
        if (incrs[i] < arrValues.length) {
          sweep(av, arr, incrs[i], interpret); // run the sweep to create the AV
        } else {
          av.umsg(interpret("av_c1") + incrs[i]);
          av.step();
          av.umsg(interpret("av_c2") + incrs[i] + interpret("av_c3"));
          av.step();
        }
      }
      av.umsg(interpret("av_c4"));
      av.recorded(); // mark the end
    }
  }

  // Connect action callbacks to the HTML entities
  $("#help").click(help);
  $("#about").click(about);
  $("#run").click(runIt);
  $("#reset").click(ODSA.AV.reset);
  $("#increments").focusout(checkIncrements);

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  var av, // for JSAV library object av
      arr;  // for the JSAV array

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter;       // get the interpreter

  // Placeholder text translation needs to be set explicitly
  $("#arrayValues").attr("placeholder", interpret("av_arrValsPlaceholder"));
  // NOTE: The placeholder for increments should be set the same way, but this
  // didn't work for some reason using the .json file, so left the value hardcoded
  // in the HTML

  // check query parameters from URL
  var params = JSAV.utils.getQueryParameter();
  if ("increments" in params) { // set value of increments if it is a param
    $("#increments").val(params.increments).prop("disabled", true);
  }

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));

  // add the layout setting preference
  var arrayLayout = settings.add("layout",
    {"type": "select", "options": {"bar": "Bar", "array": "Array"},
     "label": "Array layout: ", "value": "bar"});

  // Initialize the arraysize dropdown list
  ODSA.AV.initArraySize(5, 16, 8);
});
