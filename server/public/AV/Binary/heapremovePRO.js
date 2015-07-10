"use strict";
/*global alert: true, BST, ODSA, PARAMS */
$(document).ready(function () {
  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Set click handlers
  $("#about").click(about);

  $("#decrement").click(function () {
    var heapsize = bh.heapsize() - 1; // decrement by one
    bh.heapsize(heapsize); // set heapsize
    // hide last item and the edge in the tree
    bh.css(heapsize, {"opacity": "0"});
    var edgeToParent = bh._treenodes[heapsize].edgeToParent();
    if (edgeToParent) {
      edgeToParent.css({"opacity": "0"});
    }
    if (swapIndex.value() !== -1) {
      swapIndex.value(-1);
    }
    exercise.gradeableStep();
  });

  function init() {
    var nodeNum = 10;
    if (bh) {
      bh.clear();
      swapIndex.element.remove();
    }
    $.fx.off = true;
    var test = function (data) {
      var min = 1000,
          mmax = Math.max;
      // make sure we get a collision
      data[1] = data[2];
      bh = av.ds.binheap(data, {size: nodeNum, stats: true, tree: false});
      bh.stats.swaps = 0;
      var swapsBefore = 0,
          maxRecursion = 0;
      for (var i = 0; i < 3; i++) {
        bh.swap(0, bh.heapsize() - 1);
        bh.element.attr("data-jsav-heap-size", bh.heapsize() - 1);
        bh.heapify(1);
        maxRecursion = mmax(maxRecursion, bh.stats.swaps - swapsBefore);
        swapsBefore = bh.stats.swaps;
      }
      var swaps = bh.stats.swaps;
      bh.clear();
      return !(swaps < 7 || swaps > 10 || !bh.stats.interrupted || maxRecursion < 3);
    };
    initData = JSAV.utils.rand.numKeys(10, 100, nodeNum, {test: test, tries: 50});

    // Log the initial state of the exercise                                  
    var exInitData = {};
    exInitData.gen_array = initData;
    ODSA.AV.logExerciseInit(exInitData);

    bh = av.ds.binheap(initData);
    swapIndex = av.variable(-1);
    $.fx.off = false;
    return bh;
  }
    
  function model(modeljsav) {
    var modelbh = modeljsav.ds.binheap(initData, {nodegap: 20});
    modelbh.origswap = modelbh.swap; // store original heap grade function
    // set all steps gradeable that include a swap
    modelbh.swap = function (ind1, ind2, opts) {
      this.origswap(ind1, ind2, opts);
      // function is executed as function of the heap instance, which
      // has jsav variable (pointing to modeljsav var of this closure)
      this.jsav.stepOption("grade", true);
    };
    modeljsav._undo = [];
    var count = 3;
    while (count > 0) {
      modelbh.swap(0, modelbh.heapsize() - 1);
      modelbh.heapsize(modelbh.heapsize() - 1);
      modeljsav.step();

      modelbh.css(modelbh.heapsize(), {"opacity": "0"});
      modelbh._treenodes[modelbh.heapsize()].edgeToParent().css({"opacity": "0"});
      modeljsav.stepOption("grade", true);
      modeljsav.step();
      modelbh.heapify(1);
      count--;
    }
    return modelbh;
  }

  function clickHandler(index) {
    av._redo = []; // clear the forward stack, should add a method for this in lib
    var sIndex = swapIndex.value();
    if (sIndex === -1) { // if first click
      bh.highlight(index);
      swapIndex.value(index);
      av.step();
    } else if (index === sIndex) { // second click on same
      bh.unhighlight(index);
      swapIndex.value(-1);
      av.step();
    } else { // second click will swap
      bh.swap(sIndex, index, {});
      bh.unhighlight([sIndex, index]);
      swapIndex.value(-1);
      exercise.gradeableStep();
    }
  }

  function fixState(modelHeap) {
    var size = modelHeap.size();
    swapIndex.value(-1); // only swaps are graded so swapIndex cannot be anything else after correct step                                                    
    for (var i = 0; i < size; i++) {
      bh.css(i, {"opacity": modelHeap.css(i, "opacity")});
      bh.value(i, modelHeap.value(i));
    }
    bh.heapsize(modelHeap.heapsize());
  }

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////

  var initData,
      bh,
      swapIndex,
      pseudo,

      // Load the configurations created by odsaAV.js
      config = ODSA.UTILS.loadConfig(),
      interpret = config.interpreter,
      code = config.code,
      codeOptions = {after: {element: $(".instructions")}, visible: true},

      // Settings for the AV
      settings = new JSAV.utils.Settings($(".jsavsettings")),

      // Create a JSAV instance
      av = new JSAV($('.avcontainer'), {settings: settings});

  av.recorded();

  // show a JSAV code instance only if the code is defined in the parameter
  // and the parameter value is not "none"
  if (PARAMS["JXOP-code"] && code) {
    pseudo = av.code($.extend(codeOptions, code));
  }

  $(".jsavcontainer").on("click", ".jsavarray .jsavindex", function () {
    var index = $(this).parent(".jsavarray").find(".jsavindex").index(this);
    clickHandler(index);
  });
    
  $(".jsavcontainer").on("click", ".jsavbinarytree .jsavbinarynode", function () {
    var index = $(this).data("jsav-heap-index") - 1;
    clickHandler(index);
  });
    
  var exercise = av.exercise(model, init,
              {compare: { css: "opacity" },
               controls: $('.jsavexercisecontrols'), fix: fixState});
  exercise.reset();
});
