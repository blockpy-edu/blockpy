"use strict";
/*global alert: true, BST, ODSA, PARAMS */
$(document).ready(function () {
  // Process about button: Pop up a message with an Alert
  function about() {
    alert(ODSA.AV.aboutstring(interpret(".avTitle"), interpret("av_Authors")));
  }

  // Set click handlers
  $("#about").click(about);

  function init() {
    if (bh) {
      bh.clear();
      stack.element.remove();
      swapIndex.element.remove();
      insertLabel.element.remove();
    }
    var step = 0;
    $.fx.off = true;
    var test = function (data) {
      var i;
      var min = 1000,
          mmin = Math.min;
      for (i = 0; i < nodeNum; i++) {
        min = mmin(data[i], min);
      }
      // make sure we get a collision
      if (data[nodeNum - 1] !== min) {
        data[nodeNum - 1] = min;
      } else {
        data[nodeNum / 2] = min;
      }
      bh = av.ds.binheap(data.slice(0, initNum),
                         {size: nodeNum, stats: true, tree: false});
      for (i = 0; i < nodeNum; i++) {
        bh.insert(data[i]);
      }
      var swaps = bh.stats.swaps;
      bh.clear();
      return !(swaps < nodeNum + 1 || swaps > nodeNum + 3);
    };
    initData = JSAV.utils.rand.numKeys(10, 100, nodeNum,
                                       {test: test, tries: 50});

    // Log the initial state of the exercise
    var exInitData = {};
    exInitData.gen_array = initData;
    ODSA.AV.logExerciseInit(exInitData);

    bh = av.ds.binheap(initData.slice(0, initNum), {size: nodeNum});
    var insertData = initData.slice(initNum, nodeNum);
    swapIndex = av.variable(-1);

    stack = av.ds.stack(insertData, {relativeTo: bh, left: -30, anchor: "left top", myAnchor: "right top", top: 0, xtransition: 5, ytransition: -3});
    stack.first().highlight();
    stack.layout();
    insertLabel = av.label(interpret("av_insert_values"),
                    {relativeTo: stack, top: 15, anchor: "center bottom"});
    av.displayInit();
    $.fx.off = false;
    return bh;
  }
    
  function model(modeljsav) {
    var modelbh = modeljsav.ds.binheap(initData.slice(0, initNum),
                                       {size: initData.length, nodegap: 20});
    modelbh.origswap = modelbh.swap; // store original heap grade function
    // set all steps gradeable that include a swap
    modelbh.swap = function (ind1, ind2, opts) {
      this.origswap(ind1, ind2, opts);
      this.jsav.stepOption("grade", true);
    };
    modeljsav._undo = [];
    for (var i = initNum; i < initData.length; i++) {
      modeljsav.umsg(interpret("av_c1") + initData[i]);
      modeljsav.step();
      modelbh.insert(initData[i]);
    }
    return modelbh;
  }

  function fixState(modelHeap) {
    swapIndex.value(-1); // only swaps are graded so swapIndex cannot be anything else after correct step
    var items = 0;
    for (var i = 0, size = modelHeap.size(); i < size; i++) {
      //bh.css(i, {"background-color": modelHeap.css(i, "background-color")});
      if (bh.value(i) !== modelHeap.value(i)) {
        bh.value(i, modelHeap.value(i));
      }
      if (bh.value(i)) { // count the items inserted
        items++;
      }
    }
    // remove first item from stack if there are more items in stack then should be left
    if (nodeNum - items !== stack.size()) {
      stack.removeFirst();
      stack.first().highlight();
      stack.layout();
    }
    bh.heapsize(modelHeap.heapsize());
  }


  function clickHandler(index) {
    av._redo = []; // clear the forward stack, should add a method for this in lib
    if (bh.value(index) === "") {
      if (stack.size() > 0) {
        bh.value(index, stack.first().value());
        stack.removeFirst();
        if (stack.size()) {
          stack.first().highlight();
          stack.layout();
        }
        exercise.gradeableStep();
      }
      return;
    }
    var sIndex = swapIndex.value();
    if (sIndex === -1) { // if first click
      bh.highlight(index);
      swapIndex.value(index);
      av.step();
    } else if (sIndex === index) {
      bh.unhighlight(index);
      swapIndex.value(-1);
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

  var initData,
      bh,
      swapIndex,
      nodeNum = 10,
      initNum = 0,
      stack,
      insertLabel,
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
                       {controls: $('.jsavexercisecontrols'), fix: fixState});
  exercise.reset();
});
