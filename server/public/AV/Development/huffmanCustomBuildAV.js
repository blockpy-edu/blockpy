"use strict";
/*global alert: true, ODSA, console */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#run').click(runIt);
  $('#reset').click(ODSA.AV.reset);

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"json_path": "huffmanCustomBuildAV.json"}),
      interpret = config.interpreter;       // get the interpreter

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings")),
      av = new JSAV($('.avcontainer'), {settings: settings});

  var arr;

  $("#arrayValues").attr("placeholder", "Type in pairs of chars and frequencies (e.g. \"A, 77, B, 23, C, 32\")");
    var arrayLayout = settings.add("layout",
          {"type": "select", "options": {"bar": "Bar", "array": "Array"},
           "label": "Array layout: ", "value": "bar"});

  ODSA.AV.initArraySize(5, 16, 8);

  //var arrValues = ODSA.AV.processArrayValues();
  //TODO make sure to check that these values are valid

  var freqs = [],   // The frequency counts
      chars = [],   // The characters
      trees = [];   // Pointers to all of the partial Huffman trees

  var codeArray = [];

  var value;
  // initialization for all the arrays
  
  function runIt() {
    var arrValues = processArrayValues();

    if(arrValues) {
    var counter = 0;
    for(var i = 0; i < arrValues.length; i++) {
      if(i%2 == 0 || i==0) {
        chars[counter] = arrValues[i];
        console.log("chars: " + chars[counter]);
      } else {
        freqs[counter] = arrValues[i];
        console.log("freqs: " + freqs[counter]);
        counter++;
     }
    }

    var root;
    for (var i = 0; i < freqs.length; i++) {
      value = freqs[i] + "<br>" + chars[i];
      trees[i] = av.ds.binarytree({center: false});
      root = trees[i].root();
      root.value(value);
      root.freq = freqs[i];
    }

    // Initialize the display
    av.umsg(interpret("av_c1"));
    HUFF.layAll(trees);
    av.displayInit();

    // Construct the huffman coding tree with animation.
    HUFF.huffBuild_animated(av, interpret, freqs, trees);

    av.umsg(interpret("av_c2"));
    HUFF.layAll(trees);
    av.step();

    av.umsg(interpret("av_c3"));
    av.step();

    // Animation for assigning the codes
    HUFF.setLabels_animated(av, interpret, trees[0], trees[0].root());

    av.umsg(interpret("av_c4"));
    av.step();

    HUFF.showCodes_animated(av, interpret, freqs, chars, codeArray, trees[0]);

    trees[0].hide();
    av.umsg(interpret("av_c5"));
    var matrixData = [ ["<b>Char</b>", "<b>Freq</b>", "<b>Code</b>", "<b>Bits</b>"] ];
    for (var i = 1; i < freqs.length; i++) {
      matrixData.push([chars[i], freqs[i], codeArray[i], codeArray[i].length]);
    }
    var theMatrix = new av.ds.matrix(matrixData, {style: "plain"});
    av.recorded(); // done recording changes, will rewind
  }
  }

// Validate the array values a user enters or generate an array of random numbers if none are provided
  function processArrayValues(upperLimit) {
    upperLimit = (upperLimit) ? upperLimit : 999;

    var i,
        initData = {},
        minSize = 4,//$('#arraysize').data('min'),
        maxSize = 16,//$('#arraysize').data('max'),
        msg = "Please enter " + minSize + " to " + maxSize + " positive integers between 0 and " + upperLimit,
        msg2 = "Please enter letters A-Z to match each frequency value (e.g. \"A, 77, B, 23, C, 32\")",
        msg3 = "Please enter in at least two pairs of single alphabetical characters followed by numerical frequencies (e.g. \"A, 92, B, 28\", or \"A, 92, B, 28, C, 98, etc...\")";

    if (!minSize || !maxSize) {
      console.warn('processArrayValues() called without calling initArraySize()');
    }

    // Convert user's values to an array,
    // assuming values are space separated
    var arrValues = $('#arrayValues').val().match(/[0-9a-zA-Z]+/g) || [];

    if(arrValues.length%2 > 0 || arrValues.length < 4) {
      alert(msg3);
      return null;
    }

    if (arrValues.length === 0) { // Empty field
      // Generate (appropriate length) array of random numbers between 0 and the given upper limit
      for (i = 0; i < $('#arraysize').val(); i++) {
        arrValues[i] = Math.floor(Math.random() * (upperLimit + 1));
      }
      initData.gen_array = arrValues;
    } else {
      // Ensure user provided array is in correct range
      if (arrValues.length < minSize || arrValues.length > maxSize) {
        alert(msg);
        return null;
      }

      // Ensure every other user entered value is a positive integer
      for (i = 1; i < arrValues.length; i+=2) {
        arrValues[i] = Number(arrValues[i]);
        if (isNaN(arrValues[i]) || arrValues[i] < 0 || arrValues[i] > upperLimit) {
          alert(msg);
          return null;
        }
      }

      // Ensure the rest of user entered values are letters
      for(i = 0; i < arrValues.length; i+=2) {
        if (!(isNaN(arrValues[i]) || arrValues[i] < 0 || arrValues[i] > upperLimit)) {
          alert(msg2);
          return null;
        }
      }

      initData.user_array = arrValues;

      // Update the arraysize dropdown to match the length of the user entered array
      $('#arraysize').val(arrValues.length);
    }

    // Dynamically log initial state of text boxes
    $('input[type=text]').each(function (index, item) {
      var id = $(item).attr('id');

      if (id !== 'arrayValues') {
        initData['user_' + id] = $(item).val();
      }
    });

    // Dynamically log initial state of dropdown lists
    $('select').each(function (index, item) {
      var id = $(item).attr('id');
      initData['user_' + id] = $(item).val();
    });

    // Log initial state of exercise
    ODSA.AV.logExerciseInit(initData);

    return arrValues;
  }

});
