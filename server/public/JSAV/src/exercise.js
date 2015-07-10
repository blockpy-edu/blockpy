/**
* Module that contains support for TRAKLA2-type exercises.
* Depends on core.js, anim.js, utils.js, translate.js
*/
/*global JSAV, jQuery, console */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }
  // function to filter the steps to those that should be graded
  var gradeStepFilterFunction = function(step) { return step.options.grade; };

  var Exercise = function(jsav, options) {
    this.jsav = jsav;
    this.options = jQuery.extend({reset: function() { }, controls: null, feedback: "atend",
                                  feedbackSelectable: false, fixmode: "undo",
                                  fixmodeSelectable: false, grader: "default",
                                  resetButtonTitle: this.jsav._translate("resetButtonTitle"),
                                  undoButtonTitle: this.jsav._translate("undoButtonTitle"),
                                  modelButtonTitle: this.jsav._translate("modelButtonTitle"),
                                  gradeButtonTitle: this.jsav._translate("gradeButtonTitle")
                                 },
                                  window.JSAV_EXERCISE_OPTIONS,
                                  options);
    // initialize controls
    var cont = $(this.options.controls),
        self = this;
    if (cont.size() === 0) {
      cont = this.jsav.container.find(".jsavexercisecontrols");
    }
    // function to handle the reset event
    var resetHandler = function() {
      self.jsav.logEvent({type: "jsav-exercise-reset"});
      self.reset();
    };
    // function to handle the model answer event
    var modelHandler = function() {
      cont.addClass("active");
      self.jsav.logEvent({type: "jsav-exercise-model-open"});
      self.showModelanswer();
      cont.removeClass("active");
    };
    // allow reset and model answer through an event triggered on container
    this.jsav.container.bind({"jsav-exercise-reset": resetHandler,
                              "jsav-exercise-model": modelHandler});
    if (cont.size()) {
      var $reset = $('<input type="button" name="reset" value="' + this.options.resetButtonTitle + '" />')
                      .click(resetHandler),
          $model = $('<input type="button" name="answer" value="' + this.options.modelButtonTitle + '" />')
                      .click(modelHandler),
          $action = $('<span class="actionIndicator"></span>');
      // only add undo and grade button if not in continuous mode
      if (this.options.feedback !== "continuous") {
        var $grade = $('<input type="button" name="grade" value="' + this.options.gradeButtonTitle + '" />').click(
              function() {
                cont.addClass("active");
                self.showGrade();
                cont.removeClass("active");
                self.jsav.logEvent({type: "jsav-exercise-grade", score: $.extend({}, self.score)});
              }),
            $undo = $('<input type="button" name="undo" value="' + this.options.undoButtonTitle + '" />"').click(
              function() {
                self.jsav.logEvent({type: "jsav-exercise-undo"});
                self.undo();
              });
        cont.append($undo, $reset, $model, $grade, $action);
      } else {
        cont.append($reset, $model, $action);
      }
      $action.position({of: cont.children().last(), at: "right center", my: "left center", offset: "5 -2"});
    }
    // if feedbacktype can be selected, add settings for it
    if (this.options.feedbackSelectable) {
      this.feedback = this.jsav.settings.add("feedback", {
              "type": "select",
              "options": {
                  "continuous": this.jsav._translate("continuous"),
                  "atend": this.jsav._translate("atend")},
              "label":this.jsav._translate("feedbackLabel"),
              "value": this.options.feedback});
    }
    // if fixmode can be selected, add settings for it
    if (this.options.fixmodeSelectable) {
      this.fixmode = this.jsav.settings.add("fixmode", {
              "type": "select",
              "options": {
                  "undo": this.jsav._translate("undo"),
                  "fix": this.jsav._translate("fix")},
              "label": this.jsav._translate("fixLabel"),
              "value": this.options.fixmode});
    }

    // if jsavscore element is present and empty, add default structure
    var $jsavscore = this.jsav.container.find(".jsavscore");
    if ($jsavscore.size() === 1 && $jsavscore.children().size() === 0 &&
      this.options.feedback === "continuous") {
      $jsavscore.html(this.jsav._translate("scoreLabel") + ' <span class="jsavcurrentscore"></span> / ' +
          '<span class="jsavmaxscore" ></span>, <span class="jsavamidone">' + this.jsav._translate("remainingLabel") +
          ' <span class="jsavpointsleft"></span></span>, ' +
          this.jsav._translate("lostLabel") + ' <span class="jsavpointslost" ></span>');
      this._defaultscoretext = true;
    }
    
    // if custom showGrade function is given
    if (this.options.showGrade && $.isFunction(this.options.showGrade)) {
      this.showGrade = this.options.showGrade;
    }

    // add a gradeableStep function to the jsav instance
    var exer = this;
    jsav.gradeableStep = function() {
      exer.gradeableStep.apply(exer, arguments);
    };
  };
  Exercise.GradeStepFilterFunction = gradeStepFilterFunction;
  var allEqual = function(initial, model, compare) {
    if ($.isArray(initial)) {
      if (!compare ) { compare = [];} // initialize compare to an empty array
      for (var i = 0; i < initial.length; i++) {
        if (!model[i].equals(initial[i], compare[i])) {
          return false;
        }
      }
      return true;
    } else {
      return model.equals(initial, compare);
    }
  };
  var graders = {
    "default": function() {
      var studentSteps = 0,
          correct = true,
          forwStudent = true,
          forwModel = true,
          modelAv = this.modelav,
          studentAv = this.jsav,
          modelTotal = modelAv.totalSteps(), // "cache" the size
          studentTotal = studentAv.totalSteps(); // "cache" the size

      this.score.correct = 0;
      this.score.student = 0;
      while (correct && forwStudent && forwModel && modelAv.currentStep() <= modelTotal &&
            studentAv.currentStep() <= studentTotal) {
        forwStudent = studentAv.forward(gradeStepFilterFunction);
        forwModel = modelAv.forward(gradeStepFilterFunction);
        if (forwStudent) { studentSteps++; }
        correct = false;
        if (forwModel) {
          if (forwModel && forwStudent) {
            if (allEqual(this.initialStructures, this.modelStructures, this.options.compare)) {
              correct = true;
              this.score.correct++;
            }
          }
        }
      }
      // figure out the total number of graded steps in student answer
      forwStudent = true;
      while (forwStudent && studentAv.currentStep() < studentTotal) {
        forwStudent = studentAv.forward(gradeStepFilterFunction);
        if (forwStudent) {
          studentSteps++;
        }
      }
      this.score.student = studentSteps;
    },
    "default-continuous": function() {
      var modelAv = this.modelav,
          studentAv = this.jsav,
          forwModel;
      if (modelAv.currentStep() < modelAv.totalSteps() &&
              studentAv.currentStep() <= studentAv.totalSteps()) {
        forwModel = modelAv.forward(gradeStepFilterFunction);
        this.score.student++;
        if (forwModel) {
          if (allEqual(this.initialStructures, this.modelStructures, this.options.compare)) {
            this.score.correct++;
          }
        }
      }
      studentAv.forward();
    },
    // A grader that only compares the student structures and model structures at the last
    // step of both animation sequences. Useful in exercises where only the final state is relevant
    // instead of the process how student got there.
    finalStep: function() {
      this.score.correct = 0;
      this.score.student = 1;
      this.score.total = 1;
      this.modelav.end();
      this.jsav.end();
      if (allEqual(this.initialStructures, this.modelStructures, this.options.compare)) {
        this.score.correct = 1;
      }
    },
    finder: function() {
      var studentSteps = 0,
          cont = true,
          forwStudent = true,
          forwModel = true,
          modelAv = this.modelav,
          studentAv = this.jsav,
          modelTotal = modelAv.totalSteps(), // "cache" the size
          studentTotal = studentAv.totalSteps(); // "cache" the size

      this.score.correct = 0;
      this.score.student = 0;
      while (forwModel && cont && modelAv.currentStep() <= modelTotal &&
            studentAv.currentStep() <= studentTotal) {
        forwModel = modelAv.forward(gradeStepFilterFunction);
        if (forwModel) {
          forwStudent = true;
          while (forwStudent && !allEqual(this.initialStructures, this.modelStructures, this.options.compare) &&
            studentAv.currentStep() <= studentTotal) {
              forwStudent = studentAv.forward();
          }
          if (allEqual(this.initialStructures, this.modelStructures, this.options.compare)) {
            this.score.correct++;
          } else {
            cont = false;
          }
        }
      }
    }
  }; // end grader specification
  // set the continuous finalStep grader the same as normal finalStep
  graders["finalStep-continuous"] = graders.finalStep;

  var exerproto = Exercise.prototype;
  exerproto._updateScore = function() {
    if (this.options.feedback === "continuous") {
      if (!this.modelav) {
        this.modelanswer();
        this.grade();
      }
      // cache to make access faster
      var container = this.jsav.container,
          score = this.score;
      if (this._defaultscoretext) {
        container.find(".jsavamidone").html((score.total === score.correct)?
            this.jsav._translate("doneLabel"):this.jsav._translate("remainingLabel") + " <span class='jsavpointsleft'></span>");
      }
      // Fields of the score object:
      // score.total = steps in total in the exercise
      // score.correct = steps correct in the student solution
      // score.fix = steps fixed in the student solution
      // score.undo = steps undone in the student solution

      // check how many points have been undone
      var undo = score.undo;
      // if the current step was undone, it is not counted in the correct field yet
      // so we have to reduce the undo by one
      if (this._undoneSteps[this.jsav.currentStep()]) {
        undo = undo - 1;
      }
      // update the widget fields
      container.find(".jsavcurrentscore").text(score.correct - undo);
      container.find(".jsavcurrentmaxscore").text(score.correct + score.fix + score.undo);
      container.find(".jsavmaxscore").text(score.total);
      container.find(".jsavpointsleft").text((score.total - score.correct  - score.fix) || this.jsav._translate("doneLabel"));
      container.find(".jsavpointslost").text(score.fix || score.undo || 0);
    }
  };
  exerproto.grade = function(continuousMode) {
    // behavior in a nutshell:
    // 1. get the student's solution
    // 2. get the model answer
    // 3. rewind both
    // 4. compare the states in the visualizations
    // 5. TODO: scale the points
    // 6. return result
    // 7. TODO: show comparison of own and model side by side (??)
    if (!this.modelav) {
      this.modelanswer();
    }
    var origStep = this.jsav.currentStep(),
        origModelStep = this.modelav.currentStep();
    if (!continuousMode) {
      this.jsav.begin();
      this.modelav.begin();
    }
    var prevFx = $.fx.off || false;
    $.fx.off = true;
    if ($.isFunction(this.options.grader)) {
      this.options.grader.call(this);
    } else {
      graders[this.options.grader + (continuousMode ? "-continuous" : "")].call(this);
    }
    if (!continuousMode) {
      this.jsav.jumpToStep(origStep);
      this.modelav.jumpToStep(origModelStep);
    }
    $.fx.off = prevFx;
    return this.score;
  };
  exerproto.showGrade = function() {
    // shows an alert box of the grade
    this.grade();
    var grade = this.score,
      msg = this.jsav._translate("yourScore") + " " + (grade.correct) + " / " + grade.total;
    if (grade.fix > 0) {
      msg += "\n" + this.jsav._translate("fixedSteps") + " " + grade.fix;
    }
    window.alert(msg);
  };
  exerproto.modelanswer = function(returnToStep) {
    if (this.modelDialog) {
      this.modelDialog.remove();
    }
    var model = this.options.model,
        modelav,
        self = this,
        modelOpts = $.extend({"title": this.jsav._translate("modelWindowTitle"),
                              "closeOnClick": false,
                              "modal": false,
                              "closeCallback": function() {
                                self.jsav.logEvent({type: "jsav-exercise-model-close"});
                                if (typeof returnToStep === "number") {
                                  modelav.jumpToStep(returnToStep);
                                }
                              }
                             },
                            this.options.modelDialog); // options passed for the model answer window
    // add a class to "hide" the dialog when preparing it
    if (modelOpts.dialogClass) {
      modelOpts.dialogClass += " jsavmodelpreparing";
    } else {
      modelOpts.dialogClass = "jsavmodelpreparing";
    }
    // function that will "catch" the model answer animator log events and rewrite
    // their type to have the jsav-exercise-model prefix and the av id
    var modelLogHandler = function(eventData) {
      eventData.av = self.jsav.id();
      eventData.type = eventData.type.replace("jsav-", "jsav-exercise-model-");
      $("body").trigger("jsav-log-event", eventData);
    };
    if ($.isFunction(model)) {
      // behavior in a nutshell:
      // 1. create a new JSAV (and the HTML required for it)
      modelav = new JSAV($("<div><span class='jsavcounter'/><div class='jsavcontrols'/><p class='jsavoutput jsavline'></p></div>").addClass("jsavmodelanswer"),
              {logEvent: modelLogHandler });

      // add a gradeableStep function to the modelanswer jsav instance
      modelav.gradeableStep = function() {
        this.stepOption("grade", true);
        this.step();
      };

      // 2. create a dialog for the model answer
      this.modelDialog = JSAV.utils.dialog(modelav.container, modelOpts );
      // 3. generate the model structures and the state sequence
      this.modelStructures = model(modelav);
      // 4. rewind the model answer and hide the dialog
      modelav.recorded();
      var oldFx = $.fx.off || false;
      $.fx.off = true;
      // figure out the total number of graded steps in model answer
      var forwModel = true,
          modelTotal = modelav.totalSteps(),
          totalSteps = 0;
      while (forwModel && modelav.currentStep() <= modelTotal) {
        forwModel = modelav.forward(gradeStepFilterFunction);
        if (forwModel) {
          totalSteps++;
        }
      }
      $.fx.off = oldFx;
      modelav.begin();
      this.modelDialog.hide();
      this.score.total = totalSteps;
      this.modelav = modelav;
    }
  };
  exerproto.showModelanswer = function() {
    var prevPosition = this.modelav?this.modelav.currentStep():0;
    // regenerate the model answer
    this.modelanswer(prevPosition);
    // rewind the model av
    this.modelav.begin();
    // show the dialog and remove preparing class
    this.modelDialog.removeClass("jsavmodelpreparing");
    this.modelDialog.show();
  };
  exerproto.reset = function() {
    this.jsav.clearAnimation();
    this.score = {total: 0, correct: 0, undo: 0, fix: 0, student: 0};
    this._undoneSteps = [];
    this.jsav.RECORD = true;
    this.initialStructures = this.options.reset();
    this.jsav.displayInit();
    this.jsav.recorded();
    if (this.modelav) {
      this.modelav.container.remove();
      this.modelav = undefined;
      this.modelStructures = undefined;
    }
    this.jsav._undo = [];
    this._updateScore();
    // log the initialization of an exercise, passing the exercise as data
    // this enables other components on a page to get access to the exercise object
    this.jsav.logEvent({type: "jsav-exercise-init", exercise: this});
  };
  exerproto.undo = function() {
    var oldFx = $.fx.off || false;
    $.fx.off = true;
    // undo last step
    this.jsav.backward(); // the empty new step
    this.jsav.backward(); // the new graded step
    // undo until the previous graded step
    var undoGraders = ["default", "finder", "finalStep"];
    if ((undoGraders.indexOf(this.options.grader) !== -1 ) && this.jsav.backward(gradeStepFilterFunction)) {
      // if such step was found, redo it
      this.jsav.forward();
      this.jsav.step({updateRelative: false});
    } else {
      // ..if not, the first student step was incorrent and we can rewind to beginning
      this.jsav.begin();
    }
    this.jsav._redo = [];
    $.fx.off = oldFx;
  };
  var moveModelBackward = function(exer) {
    exer.modelav.backward();
    if (exer.modelav.backward(gradeStepFilterFunction)) {
      exer.modelav.forward();
    }
  };
  exerproto.gradeableStep = function() {
    var prevFx = $.fx.off || false;
    $.fx.off = true;
    // if we are here because of fix function being called, [show error message and] return
    if (this._fixing) {
      if (this.options.debug) {
        console.error("exercise.gradeableStep() shouldn't be called in fix function");
      }
      return;
    }
    this.jsav.stepOption("grade", true);
    this.jsav.step();
    var that = this;
    if ((this.feedback && this.feedback.val() === "continuous") ||
        (!this.feedback && this.options.feedback === "continuous")) {
      var doContinuousGrading = function() {
        var grade = that.grade(true); // true is for continuous mode
        if (grade.student === grade.correct) { // all student's steps are correct
          that.jsav.logEvent({ type: "jsav-exercise-grade-change", score: $.extend({}, grade)});
          that._updateScore();
          return;
        }
        if (grade.correct === grade.total) { // student continues with the exercise even after done
          return;
        }
        var fixmode = that.fixmode?that.fixmode.val():that.options.fixmode;
        // undo until last graded step
        if (fixmode !== "none") {
          that.undo();
          that.score.student--;
        }
        if (fixmode === "fix" && $.isFunction(that.options.fix)) {
          // call the fix function of the exercise to correct the state
          that._fixing = true;
          var modelAv = that.modelav, studentAv = that.jsav;
          that.fix(that.modelStructures);
          delete that._fixing;
          that.score.fix++;
          that.jsav.stepOption("grade", true);
          that.jsav.step();
          if (that.options.debug && !allEqual(that.initialStructures, that.modelStructures, that.options.compare)) {
            console.error("The fix function did not work as expected, the structures aren't equal");
          }
          that.jsav.logEvent({type: "jsav-exercise-step-fixed", score: $.extend({}, grade)});
          window.alert(that.jsav._translate("fixedPopup"));
        } else if (fixmode === "fix") {
          if (!that._undoneSteps[that.jsav.currentStep()]) {
            that.score.undo++;
            that._undoneSteps[that.jsav.currentStep()] = true;
          }
          that.jsav.logEvent({type: "jsav-exercise-step-undone", score: $.extend({}, grade)});
          moveModelBackward(that);
          window.alert(that.jsav._translate("fixFailedPopup"));
        } else if (fixmode === "none") {
          // DO nothing
        } else {
          if (!that._undoneSteps[that.jsav.currentStep()]) {
            that.score.undo++;
            that._undoneSteps[that.jsav.currentStep()] = true;
          }
          that.jsav.logEvent({type: "jsav-exercise-step-undone", score: $.extend({}, grade)});
          moveModelBackward(that);
          window.alert(that.jsav._translate("undonePopup"));
        }
        that._updateScore();
      };
      that.jsav._clearPlaying(function() {
        // log the gradeable step event
        that.jsav.logEvent({type: "jsav-exercise-gradeable-step"});
        // set a timer to do the grading once animation is finished
        doContinuousGrading();
        $.fx.off = prevFx;
      });
    } else {
      this.jsav._clearPlaying(function() {
        // log the event of gradeable step after the animation is finished
        that.jsav.logEvent({type: "jsav-exercise-gradeable-step"});
      });
      $.fx.off = prevFx;
    }
  };
  exerproto.fix = function() {
    var fix = this.options.fix;
    if ($.isFunction(fix)) {
      var prevFx = $.fx.off || false;
      $.fx.off = true;
      fix(this.modelStructures);
      $.fx.off = prevFx;
    }
  };
  exerproto._jsondump = function() {
    var jsav = this.jsav,
        states = [],
        forw = true,
        initial = this.initialStructures,
        origStep = jsav.currentStep(),
        oldFx = $.fx.off || false;
    $.fx.off = true;
    var getstate = function() {
      if ($.isArray(initial)) {
        var state = [];
        for (var i=0, l=initial.length; i < l; i++) {
          state.push(initial[i].state());
        }
        return state;
      } else {
        return initial.state();
      }
    };
    jsav.begin();
    while (forw) {
      states.push(getstate());
      forw = jsav.forward();
    }
    this.jsav.jumpToStep(origStep);
    $.fx.off = oldFx;
    return JSON.stringify(states);
  };

  JSAV._types.Exercise = Exercise;
  
  JSAV.ext.exercise = function(model, reset, options) {
    var opts = $.extend({model: model, reset: reset}, options);
    return new Exercise(this, opts);
    // options:
    //  - reset: a function that initializes the exercise and returns the structure(s) to
    //           compare in grading
    //  - model: a function that generates the model answer and returns the structure(s) to
    //           compare in grading
    //  - controls: a DOM/jQuery element or a selector for the element where the exercise
    //              controls (reset, model, grade) are to be added
  };
}(jQuery));