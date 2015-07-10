"use strict";
/*global alert: true, ODSA, PARAMS */
$(document).ready(function () {
  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Set click handlers
  $("#about").click(about);

  function init() {
    var nodeNum = 10;
    if (bh) {
      bh.clear();
    }
    $.fx.off = true;
    var test = function (data) {
      bh = av.ds.binheap(data, {size: nodeNum, stats: true, tree: false});
      var stats = bh.stats;
      bh.clear();
      return (stats.swaps > 3 && stats.recursiveswaps > 0 && stats.leftswaps > 0 &&
              stats.rightswaps > 0 && stats.partlyrecursiveswaps > 0);
    };
    initData = JSAV.utils.rand.numKeys(10, 100, nodeNum, {test: test, tries: 50});

    // Log the initial state of the exercise
    var exInitData = {};
    exInitData.gen_array = initData;
    ODSA.AV.logExerciseInit(exInitData);

    bh = av.ds.binheap(initData, {heapify: false});
    swapIndex = av.variable(-1);
    av._undo = [];
    $.fx.off = false;
    return bh;
  }
    
  function model(modeljsav) {
    var modelbh = modeljsav.ds.binheap(initData, {heapify: false, nodegap: 20});
    modelbh.origswap = modelbh.swap; // store original heap grade function
    // set all steps gradeable that include a swap
    modelbh.swap = function (ind1, ind2, opts) {
      this.origswap(ind1, ind2, opts);
      this.jsav.stepOption("grade", true);
    };
    modeljsav._undo = [];
    for (var i = Math.floor(modelbh.size() / 2); i > 0; i--) {
      modeljsav.umsg(interpret("av_c1") + i + ")");
      modeljsav.step();
      modeljsav.umsg("");
      modelbh.heapify(i);
    }
    return modelbh;
  }

  function fixState(modelHeap) {
    var size = modelHeap.size();
    swapIndex.value(-1); // only swaps are graded so swapIndex cannot be anything else after correct step                                                    
    for (var i = 0; i < size; i++) {
      if (bh.value(i) !== modelHeap.value(i)) {
        bh.value(i, modelHeap.value(i));
      }
    }
    bh.unhighlight(true); // unhighlight all
    bh.heapsize(modelHeap.heapsize());
  }

  function clickHandler(index) {
    av._redo = []; // clear the forward stack, should add a method for this in lib
    var sIndex = swapIndex.value();
    if (sIndex === -1) { // if first click
      bh.highlight(index);
      swapIndex.value(index);
      av.step();
    } else if (sIndex === index) { // 2nd click on same index -> unselect
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

  $(".jsavcontainer").on("click", ".jsavindex", function () {
    var index = $(this).parent(".jsavarray").find(".jsavindex").index(this);
    clickHandler(index);
  }).on("click", ".jsavbinarynode", function () {
    var index = $(this).data("jsav-heap-index") - 1;
    clickHandler(index);
  });
    
  var exercise = av.exercise(model, init,
                     {controls: $('.jsavexercisecontrols'), fix: fixState});
  exercise.reset();
    
});
