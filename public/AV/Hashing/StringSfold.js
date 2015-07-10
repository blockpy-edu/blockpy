"use strict";
/*global ODSA */
(function ($) {
  // Declare and initialize state variables
  var keyValue = $('#keyvalue').val();
  
  // Convenience function for writing output messages
  var tell = function (msg) { $('p.output').html(msg); };

  // Validate Table size field
  function CheckKey() {
    keyValue = $('#keyvalue').val();
  }

  function sfold(s) {
    var intLength = Math.floor(s.length / 4);
    var sum = 0;
    var j, k;
    var curr = 0;
    var mult;
    for (j = 0; j < intLength; j++) {
      mult = 1;
      for (k = 0 ; k < 4; k++) {
        sum += s.charCodeAt(curr) * mult;
        curr++;
        mult *= 256;
      }
    }

    mult = 1;
    while (curr < s.length) {
      sum += s.charCodeAt(curr) * mult;
      curr++;
      mult *= 256;
    }

    return sum;
  }

  // Main action: Result of clicking "Calculate" button
  function Calculate() {
    var i;
    ODSA.AV.logExerciseInit({'user_key': keyValue});
    var output = sfold($.trim(keyValue));
    tell('<br/>' + output);
    ODSA.AV.awardCompletionCredit();
  }

  // Action callbacks for form entities
  $('#keyvalue').focusout(CheckKey);
  $('#calculate').click(Calculate);
}(jQuery));
