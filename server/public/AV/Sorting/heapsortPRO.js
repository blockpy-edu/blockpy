"use strict";
/*global alert: true, ODSA, PARAMS */
$(document).ready(function () {
  // Process help button: Give a full help page for this activity
  function help() {
    window.open("heapsortHelpPRO.html", "helpwindow");
  }

  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  function initialize() {
    var nodeNum = 10;
    if (bh) {
      bh.clear();
    }
    initData = JSAV.utils.rand.numKeys(10, 100, nodeNum);

    // Log the initial state of the exercise
    var exInitData = {};
    exInitData.gen_array = initData;
    ODSA.AV.logExerciseInit(exInitData);

    bh = av.ds.binheap(initData, {nodegap: 25,
                                  compare: function (a, b) { return b - a; }});
    swapIndex = av.variable(-1);
    av.displayInit();

    return bh;
  }

  function fixState(modelHeap) {
    var size = modelHeap.size();
    swapIndex.value(-1); // only swaps are graded so swapIndex cannot be anything else after correct step
    for (var i = 0; i < size; i++) {
      if (modelHeap.hasClass(i, "unused")) {
        bh.addClass(i, "unused");
      } else {
        bh.removeClass(i, "unused");
      }
      bh.value(i, modelHeap.value(i));
    }
    bh.heapsize(modelHeap.heapsize());
  }

  function model(modelav) {
    var modelbh = modelav.ds.binheap(initData,
                          {nodegap: 20, compare: function (a, b) { return b - a; }});
    modelbh.origswap = modelbh.swap; // store original heap grade function
    // set all steps gradeable that include a swap
    modelbh.swap = function (ind1, ind2, opts) {
      this.origswap(ind1, ind2, opts);
      this.jsav.stepOption("grade", true);
    };
    modelav._undo = [];
    while (modelbh.heapsize() > 1) {
      if (modelbh.heapsize() === initData.length) {
        modelav.umsg(interpret("av_c1"));
        modelav.step();
      } else if (modelbh.heapsize() > initData.length - 3) {
        modelav.umsg(interpret("av_c2"));
      } else {
        modelav.umsg(interpret("av_c3"));
      }
      modelbh.swap(0, modelbh.heapsize() - 1);
      modelav.step();
      modelbh.heapsize(modelbh.heapsize() - 1);
      modelav.umsg(interpret("av_c4"), {preserve: true});
      modelbh.addClass(modelbh.heapsize(), "unused");
      modelav.stepOption("grade", true);
      modelav.step();
      modelav.umsg(interpret("av_c5"), {preserve: true});
      modelbh.heapify(1);
      modelav.umsg(interpret("av_c6"));
      modelav.step();
    }
    modelbh.addClass(0, "unused");
    modelav.stepOption("grade", true);
    modelav.step();
    return modelbh;
  }

  function clickHandler(index) {
    if (bh.heapsize() === 0 || index >= bh.heapsize()) {
      return;
    }
    av._redo = []; // clear the forward stack, should add a method for this in lib
    var sIndex = swapIndex.value();
    if (sIndex === -1) { // if first click
      bh.addClass(index, "enlarge");
      swapIndex.value(index);
      av.step();
    } else if (sIndex === index) {
      bh.removeClass(index, "enlarge");
      swapIndex.value(-1);
      av.step();
    } else { // second click will swap
      bh.removeClass([sIndex, index], "enlarge");
      bh.swap(sIndex, index, {});
      swapIndex.value(-1);
      exercise.gradeableStep();
    }
  }

  $("#help").click(help);
  $("#about").click(about);
  $("#decrement").click(function () {
    if (bh.heapsize() !== 0) {
      bh.heapsize(bh.heapsize() - 1);
      bh.addClass(bh.heapsize(), "unused");
    }
    exercise.gradeableStep();
  });

  //////////////////////////////////////////////////////////////////
  // Start processing here
  //////////////////////////////////////////////////////////////////

  // AV variables
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

  // Set click handlers
  $(".jsavcontainer").on("click", ".jsavarray .jsavindex", function () {
    var index = $(this).parent(".jsavarray").find(".jsavindex").index(this);
    clickHandler(index);
  });
  $(".jsavcontainer").on("click", ".jsavbinarytree .jsavbinarynode", function () {
    var index = $(this).data("jsav-heap-index") - 1;
    clickHandler(index);
  });

  var exercise = av.exercise(model, initialize, {
    compare: [{"class": "unused"}, {}],
    controls: $(".jsavexercisecontrols"),
    fix: fixState
  });
  exercise.reset();
});
