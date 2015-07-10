/*global JSAV,ok,test,module,strictEqual,deepEqual,equal,notEqual */
(function() {
  "use strict";

  // The setup for an exercise which uses two arrays. The model answer
  // and the generated student answer differ in all but the first step.
  // In total there are four steps, and the differences are:
  //  step 2: different indices are highlighted
  //  step 3: different font-size is set for indices
  //  step 4: a value in the array is set in the model solution
  // This setup can be used to test the compare option.
  function setupExercise(jsav, options) {
    var arr1, arr2;
    var init = function() {
      arr1 = jsav.ds.array([0, 1, 2, 3]);
      arr2 = jsav.ds.array([0, 1, 3, 2]);
      jsav.displayInit();
      return [arr1, arr2];
    };
    var model = function(modeljsav) {
      var arr1 = modeljsav.ds.array([0, 1, 2, 3]),
          arr2 = modeljsav.ds.array([0, 1, 3, 2]);
      modeljsav.displayInit();
      arr1.swap(1, 3);
      modeljsav.gradeableStep();
      arr1.highlight(0);
      modeljsav.gradeableStep();
      arr2.css(2, {color: "blue", fontSize: "20px"});
      modeljsav.gradeableStep();
      arr2.value(3, 3);
      modeljsav.gradeableStep();
      return [arr1, arr2];
    };
    var exercise = jsav.exercise(model, init, options);
    exercise.reset();

    arr1.swap(1, 3);
    jsav.gradeableStep();
    arr1.highlight(1);
    jsav.gradeableStep();
    arr2.css(2, {color: "blue", fontSize: "21px"});
    jsav.gradeableStep();
    return exercise;
  }

  module("exercise.grading", {  });
  test("Exercise compare option (multiple structures)", function() {
    var jsav = new JSAV("emptycontainer");
    jsav.recorded();
    jsav.SPEED = 0;
    var exer = setupExercise(jsav, {feedback: "atend"});
    // test that the grading works properly and gives 3 correct when only values are compared
    strictEqual(exer.grade().correct, 3);
    strictEqual(exer.grade().total, 4); // just make sure the total step count matches

    // change the comparison to include fontSize
    exer.options.compare = [{}, {css: ["color", "fontSize"]}];
    strictEqual(exer.grade().correct, 2); // only two first steps are now correct

    // compare classes and the jsavhighlight class
    exer.options.compare = [{class: "jsavhighlight"}, {}];
    strictEqual(exer.grade().correct, 1); // only first step is now correct

    // incorrect compare option (should be an array), so expect only compare values
    exer.options.compare = {css: ["fontSize"]};
    strictEqual(exer.grade().correct, 3); // three steps correct based on values
  });
}());