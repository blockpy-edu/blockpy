/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "huffmanCodesCON";
  var config = ODSA.UTILS.loadConfig(
                {"av_name": av_name, "json_path": "AV/Binary/huffman.json"}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);

  var freqs = [ 32,  42, 120,   7,  42,  24,  37,   2], // The frequency counts
      chars = ["C", "D", "E", "K", "L", "M", "U", "Z"],  // The characters
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

  // Setup: Construct the huffman coding tree WITHOUT animation.
  HUFF.huffBuild(av, freqs, trees);

  // Now assign the edge labels WITHOUT animation
  HUFF.setLabels(trees[0], trees[0].root());

  trees[0].show();
  HUFF.layAll(trees);

  av.umsg(interpret("av_c6"));
  av.displayInit();

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
