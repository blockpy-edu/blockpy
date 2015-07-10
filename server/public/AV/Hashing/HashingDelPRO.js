"use strict";
/*global alert: true, ODSA */
(function ($) {
  $(document).ready(function () {
    var arr_size = 10,
        initData,
        inputData,
        jsavArr,
        jsavInputPos,
        jsav = new JSAV($('.avcontainer')),
        exercise,
        task;

    jsav.recorded();

    // setup used for hashing. changing the probe and hashfunction functions, this
    // exercise should be easily modifiable to other collision resolution methods
    // and hashfunctions
    var Setup = {
      probe: function (i) {
        return i;
      },
      hashfunction: function (val) {
        return val % arr_size;
      }
    }; // end setup

    function randomizeData() {
      var initValues = JSAV.utils.rand.numKey(7, 8), // some randomization on size
          initArr = [],
          randMod, randVal, inspos, i, j, valVals,
          deletions = [],
          input = [];
      initArr.length = arr_size;

      // insert initial data to the hashtable
      while (initValues > 0) {
        randMod = JSAV.utils.rand.numKey(0, arr_size - 1); // the index we target
        valVals = JSAV.utils.rand.numKey(2, 4); // how many values with that modulo
        inspos = randMod;
        i = 0;
        for (j = 0; j < valVals; j++) {
          while (initArr[inspos]) { // find the right position to insert the value
            i++;
            inspos = Setup.hashfunction(randMod + Setup.probe(i));
          }
          // randomize the value for the given mod randMod
          randVal = JSAV.utils.rand.numKey(10, 99) * 10 + randMod;
          while (initArr.indexOf(randVal) !== -1) { // make sure not to have duplicates
            randVal = JSAV.utils.rand.numKey(10, 99) * 10 + randMod;
          }
          initArr[inspos] = randVal;
          initValues--;
        }
        deletions.push(initArr[inspos]); // add the last item with this module to the list of items to be deleted
      }
      for (i = 0; i < deletions.length; i++) { // add the deletions to the required operations
        input.push(["delete", deletions[i]]);
      }
      // add some insertions
      input.push(["insert", JSAV.utils.rand.numKey(10, 99) * 10 + Setup.hashfunction(deletions[0])]);
      input.push(["insert", JSAV.utils.rand.numKey(10, 99) * 10 + Setup.hashfunction(deletions[1])]);
      input.push(["insert", deletions[1] + JSAV.utils.rand.numKey(0, 29)]);

      // check which values have not been deleted from the hashtable already
      var values = $.map(initArr, function (item) {
        return (deletions.indexOf(item) !== -1) ? null : item;
      });
      // .. and delete all the initial values still in hashtable
      for (i = 0; i < values.length; i++) {
        input.push(["delete", values[i]]);
      }
      // .. and finish with a couple of random inserts
      input.push(["insert", JSAV.utils.rand.numKey(100, 999)]);
      input.push(["insert", JSAV.utils.rand.numKey(100, 999)]);

      // return the data
      return {array: initArr, input: input };
    }

    function init() {
      if (jsavArr) {
        // remove existing array and variables
        jsavArr.clear();
        task.element.remove();
        jsavInputPos.element.remove();
      }
      jsav.end();
      jsav.displayInit(); // remove old animation
      initData = randomizeData();

      // Log inital state of the exercise
      var exInitData = {};
      exInitData.gen_array = initData.array;
      exInitData.gen_input = initData.input;
      ODSA.AV.logExerciseInit(exInitData);

      inputData = initData.input;
      task = jsav.label((inputData[0][0] === "delete" ? "Delete key ":"Insert key ") + inputData[0][1]);
      jsavArr = jsav.ds.array(initData.array, {indexed: true});
      jsavInputPos = jsav.variable(0);
      jsavArr.click(clickHandler);
      return [jsavArr, jsavInputPos];
    }

    function fixState(modelStructures) {
      var inputPos = modelStructures[1],
          modelArr = modelStructures[0],
          size = modelArr.size();
      jsavInputPos.value(inputPos.value());
      for (var i = 0; i < size; i++) {
        var val = modelArr.value(i),
            bgColor = modelArr.css(i, "background-color");
        if (jsavArr.css(i, "background-color") !== bgColor) { // fix background color
          jsavArr.css(i, {"background-color": bgColor});
        }
        if (val !== jsavArr.value(i)) { // fix values
          jsavArr.value(i, val);
        }
      }
      updateStepTask();
    }

    function model(modeljsav) {
      var modelArr = modeljsav.ds.array(initData.array, {indexed: true}),
          inputPos = modeljsav.variable(0);
      modeljsav.displayInit();
      for (var i = 0, l = inputData.length; i < l; i++) {
        var inputElem = inputData[i],
            val = inputElem[1],
            probeIndex = 0,
            pos = Setup.hashfunction(val + Setup.probe(probeIndex));
        modelArr.highlight(pos);
        modeljsav.umsg((inputElem[0] === "delete" ? "Deleting key " : "Inserting key ") +
            val + ". We start by inspecting index " + pos + ".");
        if (inputElem[0] === "delete") {
          while (modelArr.value(pos) !== val && modelArr.value(pos) !== "") {
            modeljsav.stepOption("grade", true);
            modeljsav.step();
            probeIndex++;
            pos = Setup.hashfunction(val + Setup.probe(probeIndex));
            modeljsav.umsg("Since it is not " + inputElem[1] + ", continue to index " + pos + ".");
            modelArr.highlight(pos);
          }
          if (probeIndex > 0) {
            modeljsav.step();
          }
          modeljsav.umsg("Found the key we are looking for. Delete and mark it with a tombstone.");
          modelArr.value(pos, "[del]");
        } else { // insert
          while (modelArr.value(pos) !== "[del]" && modelArr.value(pos) !== "") {
            probeIndex++;
            pos = Setup.hashfunction(val + Setup.probe(probeIndex));
            modeljsav.umsg("Since it is taken, continue to " + pos);
            modelArr.highlight(pos);
            modeljsav.step();
          }
          if (modelArr.value(pos) === "") {
            modeljsav.umsg("The index is empty, so we insert the key.");
          } else { // has value [del]
            modeljsav.umsg("The index contains a tombstone, so we insert the key.");
          }
          modelArr.value(pos, val);
        }
        inputPos.value(i + 1);
        modelArr.unhighlight();
        modeljsav.stepOption("grade", true);
        modeljsav.step();
      }
      return [modelArr, inputPos];
    }
    exercise = jsav.exercise(model, init,
                     { compare:  [{css: "background-color"}, {}],
                       controls: $('.jsavexercisecontrols'), fix: fixState });
    exercise.reset();

    function updateStepTask() {
      var pos = jsavInputPos.value();
      if (pos < inputData.length) {
        task.text((inputData[pos][0] === "delete" ? "Delete key ":"Insert key ") + inputData[pos][1]);
      } else {
        task.text("No more input");
      }
    }

    function clickHandler(index) {
      var pos = jsavInputPos.value(),
          input = inputData[pos];
      if (input[0] === "delete") {
        if (jsavArr.value(index) !== input[1]) {
          jsavArr.highlight(index);
        } else {
          jsavArr.unhighlight(true);
          jsavArr.value(index, "[del]");
          jsavInputPos.value(pos + 1);
        }
      } else {
        jsavArr.value(index, input[1]);
        jsavInputPos.value(pos + 1);
      }
      updateStepTask();
      exercise.gradeableStep();
    }

    function about() {
      alert("Hashing Proficiency Exercise\nWritten by Ville Karavirta\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/cashaffer/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
    }

    $(function () {
      $("#about").click(about);
    });
  });
}(jQuery));