/* global ODSA, JSAV, PARAMS  */
(function ($) {
  "use strict";

  // override the grade function, so that the score will be given according to how many 
  var exerproto = JSAV._types.Exercise.prototype;
  exerproto.grade = function () {
    if (!this.modelav) {
      this.modelanswer();
    }
    var studentArray = this.initialStructures,
        modelArray = this.modelStructures;
    this.score.correct = 0;
    this.score.student = 0;
    this.score.total = modelArray.size();
    for (var i = 0; i < modelArray.size(); i++) {
      if (studentArray.value(i) === modelArray.value(i)) {
        this.score.correct++;
        this.score.student++;
        studentArray.addClass(i, "correct");
      }
    }
    return this.score;
  };

  // AV variable
  var sortedItems = [],
      sortableArray,
      numberOfItems = (PARAMS.show ? parseInt(PARAMS.show, 10) : 0),

      // get the configurations from the configuration file
      config = ODSA.UTILS.loadConfig({
        'av_container': 'jsavcontainer',
        'json_path': "sortingExercises/" + (PARAMS.ex || "allSortingExercises") + ".json"
      }),
      interpret = config.interpreter,
      code = config.code,

      // Create a JSAV instance
      av = new JSAV("jsavcontainer");

  av.recorded(); // we are not recording an AV with an algorithm

  function initialize() {
    var i, index;

    if (sortableArray) {
      sortableArray.clear();
    }

    // make a copy of code into sortedItems
    sortedItems = code.slice(0);

    // if the number of items has been limited, remove items randomly from sortedItems
    if (numberOfItems) {
      while (sortedItems.length > numberOfItems) {
        index = Math.floor(Math.random() * sortedItems.length);
        sortedItems.splice(index, 1);
      }
    }

    // if there are several options for one item, pick one randomly
    for (i = 0; i < sortedItems.length; i++) {
      if ($.isArray(sortedItems[i])) {
        index = Math.floor(Math.random() * sortedItems[i].length);
        sortedItems[i] = sortedItems[i][index];
      }
    }

    // shuffle the items
    var items = sortedItems.slice(0),
        shuffledItems = [];
    while (items.length) {
      index = Math.floor(Math.random() * items.length);
      shuffledItems.push(items.splice(index, 1)[0]);
    }

    // create the sortable array for the student
    sortableArray = av.ds.sortable(shuffledItems, {dropCallback: function () {
      exercise.gradeableStep();
    }});

    return sortableArray;
  }
  
  function modelSolution(modeljsav) {
    var modelArray = modeljsav.ds.sortable(sortedItems, {draggingOff: true});
    modeljsav.displayInit();
    return modelArray;
  }
    
  var exercise = av.exercise(modelSolution, initialize, {
    feedback: "atend"
  });
  exercise.reset();

}(jQuery));