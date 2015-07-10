"use strict";
/*global alert: true, ODSA, console */
$(document).ready(function () {
  // Process About button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Connect action callbacks to the HTML entities
  $('#about').click(about);

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"json_path": "huffman.json"}),
      interpret = config.interpreter;       // get the interpreter

  // create a new settings panel and specify the link to show it
  var settings = new JSAV.utils.Settings($(".jsavsettings")),
      av = new JSAV($('.avcontainer'), {settings: settings});

  var freqs = [ 30,  42, 90,   7,  42,  24,  37,   2], // The frequency counts
      chars = ["X", "D", "E", "K", "L", "M", "U", "Z"],  // The characters
      trees = [];   // Pointers to all of the partial Huffman trees

  var codeArray = [];

  var value;
  // initialization for all the arrays
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
});
