/**
* Module that contains the question implementations.
* Depends on core.js, anim.js, utils.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  var BLOCKED_ATTRIBUTES = ['correct', 'comment', 'points'];
  var createUUID = JSAV.utils.createUUID;

  // a component to be added to settings to toggle show/don't show questions
  var questionSetting = function(jsav) {
    return function() {
      var idPrefix = "jsav" + jsav.id() + "ShowQuestions";
      var $elem = $('<div class="jsavrow">Show Questions: ' +
                    '<input id="' + idPrefix + 'Yes" type="radio" value="true" name="jsav-questions" />' +
                    '<label for="' + idPrefix + 'Yes">Yes</label>' +
                    '<input  id="' + idPrefix + 'No" type="radio" value="false" name="jsav-questions" />' +
                    '<label for="' + idPrefix + 'No">No</label>' +
                    '</div>');
      if (jsav.options.showQuestions) {
        $elem.find("#" + idPrefix + "Yes").prop("checked", true);
      } else {
        $elem.find("#" + idPrefix + "No").prop("checked", true);
      }
      $elem.find('input').on("change", function() {
        jsav.options.showQuestions = ($(this).val() === "true");
      });
      return $elem;
    };
  };

  var createInputComponent = function(label, itemtype, options) {
    var labelElem = $('<label for="' + options.id + '">' + label + "</label>"),
      input = $('<input id="' + options.id + '" type="' +
        itemtype + '"/>');
    $.each(options, function(key, value) {
      if (BLOCKED_ATTRIBUTES.indexOf(key) === -1) {
        input.attr(key, value);
      }
    });
    return $('<div class="jsavrow"/>').append(input).append(labelElem);
  };
  var feedbackFunction = function($elems) {
    var cbs = $elems.find('[type="checkbox"]'),
      that = this,
      correct = true;
    if (cbs.size() === 0) {
      cbs = $elems.find('[type="radio"]');
    }
    var answers = [], answer;
    cbs.each(function(index, item) {
      var qi = that.choiceById(item.id);
      var $item = $(item);
      answer = {
        label: qi.label,
        selected: !!$item.prop("checked"),
        type: $item.attr("type"),
        correct: true // assume correct and mark false if incorrect
      };
      if (!!$item.prop("checked") !== !!qi.options.correct) {
        correct = false;
        answer.correct = false;
        //return false; // break the loop
      }
      answers.push(answer);
    });
    $elems.filter(".jsavfeedback")
        .html(correct?this.jsav._translate('questionCorrect'):this.jsav._translate('questionIncorrect'))
        .removeClass("jsavcorrect jsavincorrect")
        .addClass(correct?"jsavcorrect":"jsavincorrect");
    $elems.filter('[type="submit"]').remove();
    return {correct: correct, answers: answers};
    // TODO: add support for points, feedback comments etc.
  };
  
  var qTypes = {};
  qTypes.TF = { // True-False type question
    init: function() {
      this.name = createUUID();
      this.choices[0] = new QuestionItem(this.options.falseLabel || "False",
                                        "radio", {name: this.name, correct: !this.options.correct});
      this.choices[1] = new QuestionItem(this.options.trueLabel || "True",
                                        "radio", {name: this.name, correct: !!this.options.correct});
      this.correctChoice = function(correctVal) {
        if (correctVal) {
          this.choices[1].correct = true;
        } else {
          this.choices[0].correct = true;
        }
      };
    },
    feedback: feedbackFunction
  };
  qTypes.MC = {
    init: function() {
      this.name = createUUID();
    },
    addChoice: function(label, options) {
      this.choices.push(new QuestionItem(label, "radio", $.extend({name: this.name}, options)));
      return this;
    },
    feedback: feedbackFunction
  };
  qTypes.MS = {
    addChoice: function(label, options) {
      this.choices.push(new QuestionItem(label, "checkbox", $.extend({}, options)));
      return this;
    },
    feedback: feedbackFunction
  };
  
  var QuestionItem = function(label, itemtype, options) {
    this.label = label;
    this.itemtype = itemtype;
    this.options = $.extend({}, options);
    if (!("id" in this.options)) {
      this.options.id = createUUID();
    }
    this.correct = this.options.correct || false;
  };
  QuestionItem.prototype.elem = function() {
    return createInputComponent(this.label, this.itemtype, this.options);
  };
  
  
  var Question = function(jsav, qtype, questionText, options) {
    // TODO: support for options: mustBeAsked, maxPoints
    // valid types: tf, fib, mc, ms (in the future: remote)
    this.jsav = jsav;
    this.asked = false;
    this.choices = [];
    this.questionText = questionText;
    this.maxPoints = 1;
    this.achievedPoints = -1;
    this.qtype = qtype.toUpperCase();
    this.options = options;
    var funcs = qTypes[this.qtype];
    var that = this;
    $.each(funcs, function(fName, f) {
      that[fName] = f;
    });
    this.init();
  };
  var qproto = Question.prototype;
  qproto.id = function(newId) {
    if (typeof newId !== "undefined") {
      this.id = newId;
    } else {
      return this.id;
    }
  };
  qproto.show = JSAV.anim(function() {
    // once asked, ignore; when recording, ignore
    if (this.asked || !this.jsav._shouldAnimate() || !this.jsav.options.showQuestions) {
      return;
    }
    this.jsav.disableControls();
    this.asked = true; // mark asked
    var $elems = $(),
        that = this,
        i;
    // add feedback element
    $elems = $elems.add($('<div class="jsavfeedback" > </div>'));
    // add the answer choices, randomize order
    var order = [];
    for (i=this.choices.length; i--; ) {
      order.push(i);
    }
    for (i=5*order.length; i--; ) {
      var rand1 = JSAV.utils.rand.numKey(0, order.length + 1),
          rand2 = JSAV.utils.rand.numKey(0, order.length + 1),
          tmp = order[rand1];
      order[rand1] = order[rand2];
      order[rand1] = tmp;
    }
    for (i=0; i < this.choices.length; i++) {
      $elems = $elems.add(this.choices[order[i]].elem());
    }
    // ... and close button
    var close = $('<input type="button" value="' + this.jsav._translate('questionClose') + '" />').click(
      function () {
        that.dialog.close();
      });
    close.css("display", "none");
    $elems = $elems.add(close);
    // .. and submit button
    var submit = $('<input type="submit" value="' + this.jsav._translate('questionCheck') + '" />').click(
      function () {
        var logData = that.feedback($elems);
        logData.question = that.questionText;
        logData.type = "jsav-question-answer";
        if (that.options.id) {
          logData.questionId = that.options.id;
        }
        that.jsav.logEvent(logData);
        if (!that.jsav.options.questionResubmissionAllowed) {
          submit.remove();
          close.show();
        }
      });
    $elems = $elems.add(submit);
    // .. create a close callback handler for logging the close
    var closeCallback = function() {
      var logData = {
        type: "jsav-question-close",
        question: that.questionText
      };
      that.jsav.enableControls();
      if (that.options.id) { logData.questionId = that.options.id; }
      that.jsav.logEvent(logData);
    };
    var dialogClass = this.jsav.options.questionDialogClass || "";
    // .. and finally create a dialog to show the question
    this.dialog = JSAV.utils.dialog($elems, {title: this.questionText,
                                             dialogRootElement: this.jsav.options.questionDialogBase,
                                             closeCallback: closeCallback,
                                             closeOnClick: false,
                                             dialogClass: dialogClass
                                            });
    this.dialog.filter(".jsavdialog").addClass("jsavquestiondialog");

    // log the question show and the choices
    var logChoices = [];
    for (i = 0; i < this.choices.length; i++) {
      var c = this.choices[i];
      logChoices.push({label: c.label, correct: c.correct});
    }
    var logData = {
      type: "jsav-question-show",
      question: this.questionText,
      questionType: this.qtype,
      choices: logChoices
    };
    if (this.options.id) { logData.questionId = this.options.id; }
    this.jsav.logEvent(logData);

    return $elems;
  });
  qproto.choiceById = function(qiId) {
    for (var i = this.choices.length; i--; ) {
      if (this.choices[i].options.id === qiId) {
        return this.choices[i];
      }
    }
    return null;
  };
  
  // dummy function for the animation, there is no need to change the state
  // when moving in animation; once shown, the question is not shown again
  qproto.state = function() {};
  
  // add dummy function for the stuff that question types need to overwrite
  var noop = function() {};
  $.each(['init', 'feedback', 'addChoice'], function(index, val) {
    qproto[val] = noop;
  });

  // A "class" for showing questions in iframes during a slideshow
  var QuestionFrame = function(jsav, url, options) {
    this.jsav = jsav;
    this.url = url;
    this.options = options;
    this._showed = false;
  };
  var qfproto = QuestionFrame.prototype;
  qfproto._createElement = function() {
    var $iframe = $("<iframe src='" + this.url + "'></iframe>");
    $iframe.prop("seamless", true); // make it seamless by default
    if (this.options.attr) { // pass attributes to the iframe
      $iframe.attr(this.options.attr);
    }
    $iframe.addClass("jsavquestionframe");
    return $iframe;
  };
  // JSAV animated show operation
  qfproto.show = JSAV.anim(function() {
    // if already showed or shouldn't show animations, return
    if (this._showed || !this.jsav._shouldAnimate() || !this.jsav.options.showQuestions) {
      return;
    }
    this._showed = true;
    var $iframe = this.options.element || this._createElement();
    // by default, dialog shouldn't close when clicking outside of it
    var opts = $.extend({closeOnClick: false}, this.options);
    delete opts.attr;
    var that = this;
    // .. create a close callback handler for logging the close
    opts.closeCallback = function() {
      var logData = {
        type: "jsav-question-closeiframe",
        question: that.questionText
      };
      if (that.options.id) { logData.questionId = that.options.id; }
      that.jsav.logEvent(logData);
    };
    JSAV.utils.dialog($iframe, opts);
    var logData = {
      type: "jsav-question-showiframe",
      url: this.url
    };
    if (opts.id) { logData.questionId = opts.id; }
    this.jsav.logEvent(logData);
  });
  // dummy function for the animation, there is no need to change the state
  // when moving in animation; once shown, the question frame is not shown again
  qfproto.state = function() {};

  JSAV.ext.question = function(qtype, questionText, options) {
    // if the question setting hasn't been added, add it now
    if (!this._questionSetting && this.settings) {
      this._questionSetting = true;
      this.settings.add(questionSetting(this));
    }
    var logData = {
      type: "jsav-question-created",
      question: questionText
    };
    this.logEvent(logData);
    if (qtype === "IFRAME") {
      return new QuestionFrame(this, questionText, options);
    } else {
      return new Question(this, qtype, questionText, $.extend({}, options));
    }
  };
  // Resets the flags of whether pop-up quetions questions have been asked already.
  // As a side effect, this rewinds the animation to the beginning
  JSAV.ext.resetQuestionAnswers = function() {
    // rewind the animation
    this.begin();
    // go through all the animations steps..
    for (var i = 0; i < this._redo.length; i++) {
      // ..and all the operations in all the steps
      var stepOperations = this._redo[i].operations;
      for (var j = 0; j < stepOperations.length; j++) {
        // if the target object of the operation is a question
        var obj = stepOperations[j].obj;
        if (obj && obj instanceof Question) {
          // set the question as not asked
          obj.asked = false;
        }
      }
    }
  };
  JSAV.init(function() {
    // default to true for showing questions
    if (typeof this.options.showQuestions === "undefined") {
      this.options.showQuestions = true;
    }
    // bind the jsav-question-reset event of the container to reset the questions
    this.container.bind({"jsav-question-reset": function() {
        this.resetQuestionAnswers();
      }.bind(this)});
    });
}(jQuery));