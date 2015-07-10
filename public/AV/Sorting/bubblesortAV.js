"use strict";
/*global alert: true, ODSA */
(function ($) {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Bubble Sort
  function bubblesort() {
    var i, j;
    av.umsg(interpret("av_c1"));
    pseudo.setCurrentLine("sig");
    av.step();
    for (i = 0; i < arr.size() - 1; i++) {
      av.umsg(interpret("av_c2") + i);
      pseudo.setCurrentLine("outloop");
      av.step();
      av.umsg(interpret("av_c3"));
      pseudo.setCurrentLine("inloop");
      av.step();
      arr.addClass(0, "processing");
      for (j = 1; j < arr.size() - i; j++) {
        arr.addClass(j, "processing");
        av.umsg(interpret("av_c4"));
        pseudo.setCurrentLine("compare");
        av.step();
        if (arr.value(j - 1) > arr.value(j)) {
          av.umsg(interpret("av_c5"));
          pseudo.setCurrentLine("swap");
          arr.swap(j - 1, j);
          av.step();
        }
        arr.removeClass(j - 1, "processing");
      }
      arr.removeClass(j - 1, "processing");
      arr.highlight(j - 1);
      av.umsg(interpret("av_c6"));
      av.step();
    }
    av.umsg(interpret("av_c7"));
    arr.unhighlight(true);
    pseudo.setCurrentLine("end");
    av.step();
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
      pseudo = av.code(code);
      av.umsg("Starting Bubble Sort");
      av.displayInit();
      bubblesort();
      av.recorded(); // mark the end
    }
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#run').click(runIt);
  $('#reset').click(ODSA.AV.reset);

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  var av,     // for JSAV library object
      arr,    // for the JSAV array
      pseudo; // for the pseudocode display

  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter,       // get the interpreter
      code = config.code;                   // get the code object

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
}(jQuery));
