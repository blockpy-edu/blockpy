"use strict";
/*global alert: true, ODSA */

(function ($) {
  var jsav;

  function runit() {
    var i;
	var answer;
    jsav = new JSAV($('.avcontainer'), {logEvent: eventHandler});
	//jsav.logEvent({type: "jsav-question-answer"});
  	jsav.umsg('In slide 1');
    jsav.displayInit();
    jsav.umsg('In slide 2, multiple-select question');
    var q = jsav.question("MS", "Life is good?")
                .addChoice("Of course", {correct: true})
                .addChoice("Certainly", {correct: true})
                .addChoice("No way!")
                .show();
    jsav.step();
    jsav.umsg('In slide 3, true/false question');
    var q2 = jsav.question("TF", "True or false?", {correct: true})
                 .show();
    jsav.step();
    jsav.umsg('In slide 4, multiple-choice question');
    var q3 = jsav.question("MC", "Yes or No?")
                 .addChoice("Yes", {correct: true})
                 .addChoice("No", {correct: false})
                 .show();
    jsav.step();
    jsav.umsg('In slide 5, iframe question');
    jsav.question("IFRAME", "../../Exercises/Background/IntroSumm.html", {height: "800", title: "Answer me this:"})
        .show();

    jsav.recorded();
  }
  function eventHandler(eventData) {
	if(eventData.type === 'jsav-question-answer') {
	  alert(eventData.correct);
	}
  }
  // Connect action callbacks to the HTML entities
  $('#about').click(about);
  $('#runit').click(runit);
  //$('#help').click(help);
  $('#reset').click(ODSA.AV.reset);
}(jQuery));
