"use strict";
/*global alert: true, ODSA */
(function ($) {
  // Declare and initialize state variables
  var keyValue = Number($('#keyvalue').val());
  
  // Convenience function for writing output messages
  var tell = function (msg) { $('p[class="output"]').html(msg); };

  // Validate Table size field
  function CheckKey() {
    keyValue = Number($('#keyvalue').val());
    if (isNaN(keyValue) || (keyValue > 1000000000)) {
      alert("Key Value must be a number less than 1000000000");
    }
  }

  // Main action: Result of clicking "Calculate" button
  function Calculate() {
    ODSA.AV.logExerciseInit({'user_key': keyValue});
    
    var result = keyValue * keyValue;
    var left = Math.floor(result / 100000);
    var center = Math.floor(result / 1000 % 100);
    if (center < 10) {
      center = '0' + center;
    }
    var right = result % 1000;
    if (right < 10) { right = '00' + right; }
    else if (right < 100) { right = '0' + right; }
    var output = left + '<span class = "standout">' + center + '</span>' + right;
    tell(output);
    ODSA.AV.awardCompletionCredit();
  }

  // Action callbacks for form entities
  $('#keyvalue').focusout(CheckKey);
  $('#calculate').click(Calculate);
}(jQuery));
