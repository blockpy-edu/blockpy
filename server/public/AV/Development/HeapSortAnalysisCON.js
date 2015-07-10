/*global ODSA */
"use strict";
// Written by Mohammed Farghally and Cliff Shaffer
// Heap Sort Analysis
$(document).ready(function () {
  var av_name = "HeapSortAnalysisCON";
  // Load the config object with interpreter and code created by odsaUtils.js
  var config = ODSA.UTILS.loadConfig({"av_name": av_name}),
      interpret = config.interpreter;       // get the interpreter
  var av = new JSAV(av_name);
  var arr = [];
  var numNodes = 31;
  var bh;
  
  var swap = function (index1, index2) {
    var treeswap = function (index1, index2) {
      bh.jsav.effects.swap(bh._treenodes[index1].element, bh._treenodes[index2].element, true);
    };
    JSAV.anim(treeswap).call(bh, index1, index2);
  };
  
  // Slide 1
  av.umsg(interpret("Slide 1"));
  for (var i = 0; i < numNodes; i++) {
    arr.push(" ");
  }
  bh = av.ds.binheap(arr, {left: 100, top: 50, nodegap: 15});
  bh.element.hide();
  bh.layout();
  av.displayInit();
  
  // Slide 2
  av.umsg(interpret("Slide 2"));
  bh.css([0, 30], {"background-color": "yellow"});
  av.step();
  
  // Slide 3
  av.umsg(interpret("Slide 3"));
  swap(0, 30);
  bh.css(30, {"background-color": "grey"});
  bh.css(0, {"background-color": "red"});
  av.step();
  
  // Slide 4
  av.umsg(interpret("Slide 4"));
  swap(0, 2);
  bh.css(0, {"background-color": "white"});
  bh.css(2, {"background-color": "red"});
  av.step();
  
  // Slide 5
  swap(2, 6);
  bh.css(2, {"background-color": "white"});
  bh.css(6, {"background-color": "red"});
  av.step();
  
  // Slide 6
  swap(6, 14);
  bh.css(6, {"background-color": "white"});
  bh.css(14, {"background-color": "red"});
  av.step();
  
  // Slide 7
  swap(14, 29);
  bh.css(14, {"background-color": "white"});
  bh.css(29, {"background-color": "green"});
  av.step();
  
  // Slide 8
  av.umsg(interpret("Slide 8"));
  av.step();
  
  // Slide 9
  av.umsg(interpret("Slide 9"));
  var label = av.label("$\\displaystyle\\sum_{i=1}^{n}\\lfloor\\log{i}\\rfloor$",  {"top": "-20px", "left": "10px"}).css({'font-size': '16px', "text-align": "center"});
  bh.css([29, 30], {"background-color": "white"});
  av.step();
  
  // Slide 10
  label.hide();
  av.umsg(interpret("Slide 10"));
  av.step();
  
  // Slide 11
  av.umsg(interpret("Slide 11"));
  av.step();
  
  // Slide 12
  av.umsg(interpret("Slide 12"));
  av.recorded();
});
