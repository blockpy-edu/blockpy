"use strict";
/*global alert: true, console: true, ODSA */
(function ($) {
  // Declare and initialize state variables
  var
    tsize = Number($('#tablesize').val()), // Table size
    recs = Number($('#numrecs').val()), // Number of records
    birthCredit = false,    // Credit flag for question 1
    thousandCredit = false, // Credit flag for question 2
    noCredit = true,        // Have not yet given credit
    // Convenience function for writing output messages
    tell = function (msg) { $('p.output').text(msg); };

  // Process About button: Pop up a message with an Alert
  function About() {
    alert("Birthday problem calculator\nWritten by Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at https://github.com/cashaffer/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
  }

  // Validate Table size field
  function CheckTable() {
    tsize = Number($('#tablesize').val());
    if (isNaN(tsize) || (tsize < 1) || (tsize > 10000)) {
      alert("Table size has to be a positive number less than 10000");
    }
  }

  // Validate number of records field
  function CheckRecs() {
    recs = Number($('#numrecs').val());
    if (isNaN(recs) || (recs < 1) || (recs > tsize)) {
      alert("Number of records must be a positive number less than the table size");
    }
  }

  // Main action: Result of clicking "Calculate" button
  function Calculate() {
    var prob, fact, result;
    if (tsize <= 0 || recs < 0) { tell("Bad input"); }
    else {
      var initData = {};
      initData.user_table_size = tsize;
      initData.user_num_recs = recs;
      ODSA.AV.logExerciseInit(initData);
      
      if (recs === 0) { prob = 0.0; }
      else if (recs > tsize) { prob = 1.0; }
      else {
        fact = 1.0;
        for (var i = tsize - recs + 1; i < tsize; i++) {
          fact = fact * i / tsize;
        }
        prob = 1.0 - fact;
      }
      result = (prob * 100).toFixed(4);
      tell(result + "%");
      console.log("Calculated: " + result);
      // Smallest number to get a collision chance of 60% on 365
      if ((tsize === 365) && (recs === 27)) {
        birthCredit = true;
      }
      // Smallest number to get a collision chance of 50% on 1000
      if ((tsize === 1000) && (recs === 38)) {
        thousandCredit = true;
      }
      if (birthCredit && thousandCredit && noCredit) {
        ODSA.AV.awardCompletionCredit();
        noCredit = false;  // Don't keep trying to assign credit
        console.log("Got birthday credit");
      }
    }
  }

  // Action callbacks for form entities
  $('#about').click(About);
  $('#tablesize').focusout(CheckTable);
  $('#numrecs').focusout(CheckRecs);
  $('#calculate').click(Calculate);
}(jQuery));