/*global ODSA */
"use strict";
$(document).ready(function () {
  var av_name = "huffmanBuildCON";
  var config = ODSA.UTILS.loadConfig(
                {"av_name": av_name, "json_path": "AV/Binary/huffman.json"}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);

  var freqs = [ 32,  42, 120,   7,  42,  24,  37,   2], // The frequency counts
      chars = ["C", "D", "E", "K", "L", "M", "U", "Z"],  // The characters
      trees = [];   // Pointers to all of the partial Huffman trees

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
  av.recorded(); // done recording changes, will rewind
});
