"use strict";
/*global alert: true, ODSA, console */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Selection sort
  function selsort() {
    var i, j, bigindex;
    av.umsg(interpret("av_c3"));
    pseudo.setCurrentLine("sig");
    av.step();
    for (i = 0; i < arr.size() - 1; i++) {
      av.umsg(interpret("av_c4") + i);
      pseudo.setCurrentLine("outloop");
      av.step();
      av.umsg(interpret("av_c5"));
      pseudo.setCurrentLine("initbig");
      bigindex = 0;
      arr.addClass(0, "special");
      av.step();
      av.umsg(interpret("av_c6"));
      pseudo.setCurrentLine("inloop");
      av.step();
      for (j = 1; j < arr.size() - i; j++) {
        arr.addClass(j, "processing");
        av.umsg(interpret("av_c7"));
        pseudo.setCurrentLine("compare");
        av.step();
        if (arr.value(j) > arr.value(bigindex)) {
          av.umsg(interpret("av_c8"));
          arr.removeClass(bigindex, "special");
          pseudo.setCurrentLine("setbig");
          bigindex = j;
          arr.addClass(bigindex, "special");
          av.step();
        }
        arr.removeClass(j, "processing");
      }
      av.umsg(interpret("av_c9"));
      pseudo.setCurrentLine("swap");
      av.step();
      if (bigindex !== (arr.size() - i - 1)) {
        arr.swap(bigindex, arr.size() - i - 1); // swap the two indices
        arr.removeClass(bigindex, "special");
        arr.addClass(arr.size() - i - 1, "special");
      }
      av.step();
      av.umsg(interpret("av_c10"));
      arr.removeClass(arr.size() - i - 1, "special");
      arr.addClass(arr.size() - i - 1, "deemph");
      av.step();
    }
    av.umsg(interpret("av_c2"));
    arr.addClass(0, "deemph");
    pseudo.setCurrentLine("end");
  }

  // Execute the "Run" button function
  function runIt() {
    var arrValues = ODSA.AV.processArrayValues();

    // If arrValues is null, the user gave us junk which they need to fix
    if (arrValues) {
      ODSA.AV.reset(true);
      av = new JSAV($('.avcontainer'));

      // Create a new array using the layout the user has selected
      arr = av.ds.array(arrValues, {indexed: true, layout: arrayLayout.val()});

      // Create the pseudocode display object
      pseudo = av.code(code);
      av.umsg(interpret("av_c1"));
      av.displayInit();
      selsort();
      av.recorded(); // mark the end
      ODSA.AV.sendResizeMsg();
    }
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#run').click(runIt);
  $('#ssperform').submit(function (evt) {
    // pressing return in 'Your values:' box -> runIt
    evt.stopPropagation();
    evt.preventDefault();
    runIt();
  });
  $('#reset').click(ODSA.AV.reset);

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  var av,     // for JSAV av
      arr,    // for the JSAV array
      pseudo; // for the pseudocode display

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object

  // Placeholder text translation needs to be set explicitly
  $("#arrayValues").attr("placeholder", interpret("av_arrValsPlaceholder"));

  // Placeholder text translation needs to be set explicitly
  $("#arrayValues").attr("placeholder", interpret("av_arrValsPlaceholder"));

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings"));

  // add the layout setting preference
  var arrayLayout = settings.add("layout",
          {"type": "select", "options": {"bar": "Bar", "array": "Array"},
           "label": "Array layout: ", "value": "bar"});

  // Initialize the arraysize dropdown list
  ODSA.AV.initArraySize(5, 16, 8);
});
