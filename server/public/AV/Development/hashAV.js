"use strict";
/*global alert: true, console: true, is, ODSA */

/*
 * For queries & switch cases, follow the numbering below:
 * Hash Functions (hashFunct):
 *  1. Simple Mod Hash
 *  2. Binning Hash
 *  3. Mid-Square Hash
 *  4. Simple Hash for Strings
 *  5. Improved Hash for Strings
 *
 * Collision Resolutions (collision):
 *  1. Linear Probing
 *  2. Linear Probing by Stepsize of 2
 *  3. Linear Probing by Stepsize of 3
 *  4. Pseudo-Random Probing
 *  5. Quadratic Probing
 *  6. Double Hashing (Prime)
 *  7. Double Hashing (Power-of-2)
 *
 * Table Size (tableSize):
 *  Number between 1 and 16
 *
 * Key Range (keyrange):
 *  1. 0-99
 *  2. 0-999
 *
 * M-value (m):
 *  - A prime number (if collision=6)
 *  - A power-of-2 (if collision=7)
 *
 * To handle queries:
 *  Set the hashFunct, collision, tableSize, keyrange and m according to the reference above
 *  For example, to choose Mid-Square Hash with pseudo-random probing, you would use:
 *  hash.html?hashFunct=3&collision=4
 */

/* The fun starts here  */
(function ($) {
  /*
   * Queue Data Structure
   * Created by Stephen Morley - http://code.stephenmorley.org
   * Released under the terms of Creative Commons
   */
  function Queue() {
    // initialise the queue and offset
    var queue  = [];
    var offset = 0;

    /* Returns true if the queue is empty, and false otherwise.
     */
    this.isEmpty = function () {
      return (queue.length === 0);
    };

    /* Returns the length of the queue
     */
    this.getLength = function () {
      return (queue.length - offset);
    };

    /* Enqueues the specified item.
     */
    this.enqueue = function (item) {
      queue.push(item);
    };

    /* Dequeues an item and returns it. If the queue is empty then undefined is
     * returned.
     */
    this.dequeue = function () {

      // if the queue is empty, return undefined
      if (queue.length === 0) {
        return undefined;
      }

      // store the item at the front of the queue
      var item = queue[offset];

      // increment the offset and remove the free space if necessary
      if (++offset * 2 >= queue.length) {
        queue  = queue.slice(offset);
        offset = 0;
      }

      // return the dequeued item
      return item;
    };
  }
  /* End Queue */

  /*
   * Primality testing code
   *
   * Copyright (c) 2011 Alexei Kourbatov, www.JavaScripter.net
   * All information on these Web sites, JavaScripter.net or JavaScripter.com, is provided "AS IS", without warranties of any
   * kind. I can change it at any time, without notice.
   *
   * Permission is hereby granted to use this information for educational purposes only. You are not allowed to get money for
   * re-distribution of this information or remove any copyright notices from these pages or code. If you want to make a mirror
   * of this Web site or otherwise re-distribute the information or code found on this site or make any commercial use of this
   * information or code, do ask me via e-mail: webmaster(at)javascripter.net.
   *
   * All trademarks are the property of their respective owners and are used here for information purposes only. JavaScript is
   * a trademark of Oracle Corporation.
   *
   * Courtesy of http://www.javascripter.net/faq/primefactors.txt
   */

  /**
   * function leastFactor(n) returns:
   *    the smallest prime that divides n
   *    NaN if n is NaN or Infinity
   *    0  if n is 0
   *    1  if n = 1, n = -1, or n is not an integer
   */
  var leastFactor = function (n) {
    if (isNaN(n) || !isFinite(n)) {
      return NaN;
    }
    if (n === 0) {
      return 0;
    }
    if (n % 1 || n * n < 2) {
      return 1;
    }
    if (n % 2 === 0) {
      return 2;
    }
    if (n % 3 === 0) {
      return 3;
    }
    if (n % 5 === 0) {
      return 5;
    }
    var m = Math.sqrt(n);
    for (var i = 7; i <= m; i += 30) {
      if (n % i === 0) {
        return i;
      }
      if (n % (i + 4) === 0) {
        return i + 4;
      }
      if (n % (i + 6) === 0) {
        return i + 6;
      }
      if (n % (i + 10) === 0) {
        return i + 10;
      }
      if (n % (i + 12) === 0) {
        return i + 12;
      }
      if (n % (i + 16) === 0) {
        return i + 16;
      }
      if (n % (i + 22) === 0) {
        return i + 22;
      }
      if (n % (i + 24) === 0) {
        return i + 24;
      }
    }

    return n;
  };

  /**
   * Optimized version of leastFactor for Opera, Chrome, Firefox
   * In these browsers, "i divides n" is much faster as
   * (q = n / i) === Math.floor(q) than n % i === 0
   */
  if (navigator.userAgent.indexOf('Opera') !== -1 ||
      navigator.userAgent.indexOf('Chrome') !== -1 ||
      navigator.userAgent.indexOf('Firefox') !== -1) {
    leastFactor = function (n) {
      if (isNaN(n) || !isFinite(n)) {
        return NaN;
      }
      if (n === 0) {
        return 0;
      }
      if (n % 1 || n * n < 2) {
        return 1;
      }
      if (n % 2 === 0) {
        return 2;
      }
      if (n % 3 === 0) {
        return 3;
      }
      if (n % 5 === 0) {
        return 5;
      }
      var q, m = Math.sqrt(n);
      for (var i = 7; i <= m; i += 30) {
        if ((q = n / i) === Math.floor(q)) {
          return i;
        }
        if ((q = n / (i + 4)) === Math.floor(q)) {
          return i + 4;
        }
        if ((q = n / (i + 6)) === Math.floor(q)) {
          return i + 6;
        }
        if ((q = n / (i + 10)) === Math.floor(q)) {
          return i + 10;
        }
        if ((q = n / (i + 12)) === Math.floor(q)) {
          return i + 12;
        }
        if ((q = n / (i + 16)) === Math.floor(q)) {
          return i + 16;
        }
        if ((q = n / (i + 22)) === Math.floor(q)) {
          return i + 22;
        }
        if ((q = n / (i + 24)) === Math.floor(q)) {
          return i + 24;
        }
      }
      return n;
    };
  }

  /**
   * function isPrime(n) returns:
   *   - false if n is NaN or not a finite integer
   *   - true  if n is prime
   *   - false otherwise
   */
  var isPrime = function (n) {
    if (isNaN(n) || !isFinite(n) || n % 1 || n < 2) {
      return false;
    }
    if (n === leastFactor(n)) {
      return true;
    }
    return false;
  };

  /* End Primality test code */

  function isPowerOf2(m) {
    /*jslint bitwise: true */
    return !(isNaN(m) || !isFinite(m) || m < 1 || ((m - 1) & m)  ===  0);
  }


  /* Variables */
  var jsav,                     // JSAV
      defCtrlState,             // Stores the default state of the controls
      defTableSizeOptions,      // Stores the HTML of the default table size options
      arr,                      // JSAV Array
      nextStep = new Queue(),   // A queue containing 'steps' to be played when the user clicks 'Next'
      slotPerm = [0];           // A permutation of slots for pseudo random probing, must be a global so that
                                // the same permutation is used each time

  // Process About button: Pop up a message with an Alert
  function about() {
    alert("Shellsort Algorithm Visualization\nWritten by Nayef Copty, Mauricio De la Barra, Daniel Breakiron, and Cliff Shaffer\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/cashaffer/OpenDSA\nCompiled with JSAV library version " + JSAV.version());
  }

  /**
   * Wrapper class for error messages
   */
  function error(message) {
    jsav.umsg(message, {"color" : "red"});
    jsav.umsg("<br />");
  }

  /**
   * Sets the default state for the controls based on the query parameters
   */
  function setDefaultControlState() {
    defCtrlState = {};
    defCtrlState.hashFunct = 0;
    defCtrlState.collision = 0;
    defCtrlState.tableSize = 0;
    defCtrlState.keyrange = 0;
    defCtrlState.m = '';

    // Update the default control state based on the query parameters
    var params = JSAV.utils.getQueryParameter();

    // Set hash function
    if (params.hashFunct) {
      if (params.hashFunct > 0 && params.hashFunct <= 5) {
        defCtrlState.hashFunct = params.hashFunct;

        // Disable so user can't change the value set by parameter
        $('#function').attr('disabled', 'disabled');
      } else {
        console.error("Invalid URL parameter method: " + params.hashFunct);
      }
    }

    // Set collision resolution policy
    if (params.collision) {
      if (params.collision > 0 && params.collision <= 7) {
        defCtrlState.collision = params.collision;

        // Disable so user can't change the value set by parameter
        $('#collision').attr('disabled', 'disabled');
      } else {
        console.error("Invalid URL parameter collision: " + params.collision);
      }
    }

    // Set table size
    if (params.tableSize) {
      if (params.tableSize > 0 && params.tableSize <= 16) {
        defCtrlState.tableSize = params.tableSize;

        // Disable so user can't change the value set by parameter
        $('#tablesize').attr('disabled', 'disabled');
      } else {
        console.error("Invalid URL parameter tableSize: " + params.tableSize);
      }
    }

    // Set keyrange
    if (params.keyrange) {
      if (params.keyrange > 0 && params.keyrange <= 2) {
        defCtrlState.keyrange = params.keyrange;

        // Disable so user can't change the value set by parameter
        $('#keyrange').attr('disabled', 'disabled');
      } else {
        console.error("Invalid URL parameter keyrange: " + params.keyrange);
      }
    }

    // Set M-value
    if (params.m) {
      if (params.m > 0) {
        defCtrlState.m = params.m;

        // Disable so user can't change the value set by parameter
        $('#M').attr('disabled', 'disabled');
      } else {
        console.error("Invalid URL parameter m: " + params.m);
      }
    }
  }

  /**
   * Instruct the user on what fields they are missing and clear and redraw the hash table
   */
  function resetAV() {
    // Display a message telling them what fields they need to select
    jsav.clearumsg();
    var missingFields = [];

    // Ensure user selected a hash function
    var funct = Number($('#function').val());
    if (funct === 0) {
      missingFields.push('hash function');
    } else {
      jsav.umsg('Algorithm Selected: ' + $("#function option:selected").text());

      // If user selected binning, make sure they selected a key range too
      if (funct === 2) {
        if ($('#keyrange').val() === '0') {
          missingFields.push('key range');
        } else {
          jsav.umsg('Key Range Selected: ' + $("#keyrange option:selected").text());
        }
      }
    }

    // Ensure user selected a collision resolution policy
    var coll = Number($('#collision').val());
    if (coll === 0) {
      missingFields.push('collision policy');
    } else {
      jsav.umsg('Collsion Policy Selected: ' + $("#collision option:selected").text());

      // Ensure a valid M-value is provided for double hashing policies
      var M = Number($('#M').val());

      if (coll === 6) {    // Double hashing (prime)
        $('#mValue').show();
        $('#M').attr('placeholder', 'Prime Number');

        if (isPrime(M)) {
          jsav.umsg('Prime Number Selected: ' + $("#M").val());
        } else {
          missingFields.push('prime number M');
        }
      } else if (coll === 7) {    // Double hashing (power-of-2)
        $('#mValue').show();
        $('#M').attr('placeholder', 'Power-of-2');

        if (isPowerOf2(M)) {
          jsav.umsg('Power-of-2 Selected: ' + M);
        } else {
          missingFields.push('power-of-2 M');
        }
      } else {
        $('#mValue').hide();
      }
    }

    // Ensure user selected a table size
    if ($('#tablesize').val() === '0') {
      missingFields.push('table size');
    }

    // Craft an appropriate message to the user, telling them what fields they are missing
    if (missingFields.length > 0) {
      // Disable the input box if fields are missing
      $("#input").attr("disabled", "disabled");

      var msg = 'Please select a ' + missingFields.join(', ');
      var commaIndex = msg.lastIndexOf(",");

      if (commaIndex > -1) {
        msg = msg.substring(0, commaIndex) + ' and' + msg.substring(commaIndex + 1, msg.length);
      }

      jsav.umsg(msg);
    } else {
      // If all necessary fields are selected, enable the input box and tell the user to begin
      $("#input").removeAttr("disabled");

      jsav.umsg("Enter a value and click Next");
      jsav.umsg("<br />");
    }

    // Draw new array
    var size = $('#tablesize').val();

    var htmlData = "";
    for (var i = 0; i < size; i++) {
      htmlData += "<li></li>";
    }

    var hashTable = $('#hashTable');
    hashTable.html(htmlData);

    // Create a new JSAV array
    arr = jsav.ds.array(hashTable, {indexed: true, layout: "vertical", center: false});

    // Make sure the queue is clear and state variables are reset
    nextStep = new Queue();
    slotPerm = [0];

    // TODO - might be able to combine this with the loop above
    // Append a span containing the count to each index
    $('li.jsavindex').each(function (index, item) {
      $(item).append('<span id="' + index + '_count" class="jsavindexlabel countlabel" style="display: none;">1</span>');
    });
  }

  function setFunction() {
    // Reset the array size options list (if currently shows values for mid-square)
    if ($('#tablesize option').length === 3) {
      // Save the value the user has selected
      var size = $("#tablesize").val();

      $("#tablesize").html(defTableSizeOptions);

      // Select the value the user previously had selected
      $("#tablesize").val(size);
    }

    // Disable and hide keyrange dropdown
    $('#keyrange').hide();

    // Display Appropriate Message and Enable Appropriate Controls for each function
    switch ($('#function').val()) {
    // Prompt user to select a function
    case '0':
      $('#input').attr("disabled", "disabled");
      break;

    // Binning
    case '2':
      // Enable key range
      $('#keyrange').show();
      break;

    // Mid Square
    case '3':
      // Change array size options to only 8 and 16
      $("#tablesize").html('<option value="0">Table Size</option><option value="8">8</option><option value="16">16</option>');
      break;
    }

    // Refresh the AV display when the function is changed
    resetAV();
  }

  /**
   * Reset all controls to their default state
   */
  function resetControls() {
    $("#function").val(defCtrlState.hashFunct);
    $("#collision").val(defCtrlState.collision);
    $("#tablesize").val(defCtrlState.tableSize);
    $("#keyrange").val(defCtrlState.keyrange);
    $("#M").val(defCtrlState.m);
    if (defCtrlState.m === '') {
      $('#mValue').hide();
    }
    setFunction();

    // Clear input textbox and disable next button
    $("#input").val("");
    $('#next').attr("disabled", "disabled");
  }

  /**
   * Resets the visualization
   */
  function reset() {
    // Clear any existing messages and hash table data
    jsav.clearumsg();
    $('#hashTable').html('');

    // Reset controls to their default state
    resetControls();

    // Make sure the queue is empty
    nextStep = new Queue();
  }

  function loadNextSlide() {
    var step = nextStep.dequeue();

    if (step.canInsert) {
      if (step.insert) {    // Insertion step
        jsav.umsg("Inserting " + step.value + " at position " + step.position + ".");
        jsav.umsg("<br>");
        arr.unhighlight(step.position);
        arr.value(step.position, step.value);
      } else {    // Highlighting step
        jsav.umsg("Attempting to insert " + step.value + " at position " + step.position + ".");
        arr.unhighlight();
        arr.highlight(step.position);
      }
    }

    // Disable Next Button & re-enable input field if queue is empty
    if (nextStep.isEmpty()) {
      // Clear, enable and set the focus to the input textbox
      $("#input").val("");
      $("#input").removeAttr("disabled");
      $("#input").focus();
      // Disable the next button
      $('#next').attr("disabled", "disabled");

      // If array is full at the end of dequeue, display message
      if (!step.canInsert) {
        var errorMsg;
        if (step.arrayFull) {
          errorMsg = "Array is full. Insertion failed. Please Restart.";
          // User has been informed the array is full and they
          // must restart, so disable the input textbox
          //$('#input').attr("disabled", "disabled");
        } else {
          errorMsg = "Array is not full, but number of insertion attempts is greater than array size. Insertion failed.";
        }

        error(errorMsg);
        arr.unhighlight();
      }
    } else {
      // Set the focus to the 'Next' button so users can click 'Enter' to trigger the next step
      $("#next").focus();
    }
  }

  /* Hashing Functions */

  // Simple mod function
  function simpleMod(inputVal) {
    // Check that the input value is a number and within the correct range
    if (inputVal < 0 || inputVal > 99999 || isNaN(inputVal)) {
      error("Please enter a number in the range of 0-99999");
      // Return error
      return 1;
    }

    // Simple Mod Function
    var pos = inputVal % arr.size();

    jsav.umsg("Hash position = Input Value % Table Size");
    jsav.umsg("Hash position = " + inputVal + " % " + arr.size() + ' = ' + pos);

    // Process function with selected collision resolution
    determineResolution(inputVal, pos, false, true);

    // Return success
    return 0;
  }

  // Binning Function
  function binning(inputVal) {
    var keyrange = $("#keyrange").val();

    // Check that a key range has been selected
    if ((Number(keyrange)) === 0) {
      error("Please select a key range.");
      // Return error
      return 1;
    } else {    // Key range selected
      switch (keyrange) {
      case '1':
        keyrange = 100;
        break;

      case '2':
        keyrange = 1000;
        break;
      }

      // Check that the input value is a number within the correct range
      if (inputVal < 0 || inputVal >= keyrange || isNaN(inputVal)) {
        error("Please enter an input value between 0 and " + keyrange - 1 + ".");
        // Return Error
        return 1;
      } else {    // Valid input
        jsav.umsg("Attempting to insert: " + inputVal);

        // Binning function Position
        var binsize = keyrange / $("#tablesize").val();
        var pos =  Math.floor(inputVal / binsize);

        jsav.umsg("Bin Size = Key Range / Table Size");
        jsav.umsg("Bin Size = " + keyrange + " / " + $("#tablesize").val() + " = " + binsize.toFixed(2));
        jsav.umsg("Hash Position = Input Value / Bin Size");
        jsav.umsg("Hash Position = " + inputVal + " / " + binsize.toFixed(2) + " = " + pos);

        // Process function with selected collision resolution
        determineResolution(inputVal, pos, false, true);

        // Return success
        return 0;
      }
    }
  }

  // Mid-Square Method
  function midSquare(inputVal) {
    // Check that input is a number within the correct range
    if (inputVal > 65536 || inputVal < 0 || isNaN(inputVal)) {
      error("Please enter a value in the range of 0-65536");
      // Return error
      return 1;
    }

    jsav.umsg("Attempting to insert: " + inputVal);

    var size = Number($("#tablesize").val());
    var strpadding = "00000000";
    var modVal = 256;

    if (size === 16) {
      strpadding = "0000000000000000";
      modVal = 65536;
    }

    // Square Input Value
    var squaredInput = (inputVal * inputVal) % modVal;

    // Convert squaredInput to base 2 and pad it to the correct length
    var binaryDigit = (strpadding + squaredInput.toString(2)).substr(size * -1);

    // Get the middle bits
    var len = size / 4;
    var start = (size - len) / 2;
    var middleBits = binaryDigit.substr(start, len);

    // Highlight the middle bits
    binaryDigit = binaryDigit.substring(0, start) + '<span style="color: red">' +
                  middleBits + '</span>' + binaryDigit.substring(start + len, binaryDigit.length);

    // Convert Middle Bits to Decimal
    var pos = parseInt(middleBits, 2);

    jsav.umsg(inputVal + " * " + inputVal + " % " + modVal + " = " + squaredInput);
    jsav.umsg(size + "-bit binary digit = " + binaryDigit);
    jsav.umsg("Middle four bits = " + middleBits);
    jsav.umsg("Hash position = " + pos);

    // Process function with selected collision resolution
    determineResolution(inputVal, pos, false, true);

    // Return success
    return 0;
  }

  // Simple hashing for strings
  //  - inputVal should be a string, however a number in a string is acceptable (e.g. "123")
  function simpleStrings(inputVal) {
    // Check input is a string
    if (inputVal === null) {
      error("Please enter a value to hash.");
      // Return error
      return 1;
    }

    jsav.umsg("Attempting to insert: " + inputVal);

    // Sum of string's ASCII number
    var sum = 0;
    for (var i = 0; i < inputVal.length; i++) {
      sum += inputVal.charCodeAt(i);
    }

    // Table Size
    var size = $("#tablesize").val();

    // Position is the sum mod the table size
    var pos = sum % size;

    jsav.umsg("The sum is " + sum);
    jsav.umsg("Hash value: " + sum + " % " + size + " = " + pos);

    // Process function with selected collision resolution
    determineResolution(inputVal, pos, false, true);

    // Return success
    return 0;
  }

  // Hashing for Strings (Improved)
  //   - inputVal should be a string, however a number in a string is acceptable (e.g. "123")
  function improvedStrings(inputVal) {
    // Check input is a string
    if (inputVal === null) {
      error("Please enter a value to hash.");
      // Return error
      return 1;
    }

    jsav.umsg("Attempting to insert " + inputVal);

    var inputLength = inputVal.length / 4;
    var sum = 0;
    var mult;
    for (var i = 0; i < inputLength; i++) {
      // Grab the substring of size 4
      var inputsubstring = inputVal.substring(i * 4, (i * 4) + 4);
      mult = 1;
      for (var j = 0; j < inputsubstring.length; j++) {
        sum += inputsubstring.charCodeAt(j) * mult;
        mult *= 256;
      }
    }

    var size = $("#tablesize").val();
    var pos = sum % size;

    jsav.umsg("The sum is " + sum);
    jsav.umsg("Hash value: " + sum + " % " + size + " = " + pos);

    // Process function with selected collision resolution
    determineResolution(inputVal, pos, false, true);

    // Return success
    return 0;
  }


  /* Collision Resolutions */

  // Function that determines which collision resolution to pick
  function determineResolution(inputVal, pos, showCounts, printPerm) {
    var collisionResolution = $("#collision").val();
    var ret = 0;
    var stepSize;

    switch (collisionResolution) {
      // No function chosen
    case '0':
      reset();
      break;
    case '1':
      ret = linearProbing(inputVal, pos, showCounts, 1);
      break;
    case '2':
      ret = linearProbing(inputVal, pos, showCounts, 2);
      break;
    case '3':
      ret = linearProbing(inputVal, pos, showCounts, 3);
      break;
    case '4':
      ret = pseudoRandom(inputVal, pos, showCounts, printPerm);
      break;
    case '5':
      ret = quadraticProbing(inputVal, pos, showCounts);
      break;
    case '6':
      stepSize = doubleHashPrime(inputVal, showCounts);
      ret = linearProbing(inputVal, pos, showCounts, stepSize);
      break;
    case '7':
      stepSize = doubleHashPowerOf2(inputVal, showCounts);
      ret = linearProbing(inputVal, pos, showCounts, stepSize);
      break;
    }

    return ret;
  }

  // Linear Probing
  function linearProbing(inputVal, pos, showCounts, stepSize) {
    // Counter that counts how many times the loop ran
    var count = 0;

    var arrayFull = false;
    var canInsert = true;

    // Loop across the array. "infinite" loop. Breaks if array is full.
    for (;;) {
      // If space is available, break
      if (String(arr.value(pos)) === "") {
        break;
      }

      // If array is full, break out
      if (count === arr.size()) {
        // Tried to insert everywhere the algorithm would let us, failed
        canInsert = false;

        // Assume the array is full, since insertion failed
        arrayFull = true;

        if (stepSize > 1) {
          // Checking if there are any empty slots, even when count === arr.size()
          for (var b = 0; b < arr.size(); b++) {
            if (String(arr.value(b)) === "") {
              arrayFull = false;
              break;
            }
          }
        }
        break;
      }

      // Insert attempt as highlighting activity
      if (!showCounts) {
        enqueueStep(pos, inputVal, false, arrayFull, canInsert);
      }

      pos += stepSize;

      // Wrap around to the beginning of the array
      if (pos >= arr.size()) {
        pos %= arr.size();
      }

      // Increment count
      count++;
    }
    
    // Empty spot found. Insert element inputVal at pos
    if (!showCounts) {
      enqueueStep(pos, inputVal, true, arrayFull, canInsert);
    } else {
      return pos;
    }
  }

  // Pseudo-Random Probing
  function pseudoRandom(inputVal, pos, showCounts, printPerm) {
    var arrayFull = false;
    var canInsert = true;

    // Cast into a number, otherwise '0' will be considered false.
    if ((Number(arr.value(pos))) !== false) {
      var i, j, rnum, temp;

      // If not already done, create a random permutation
      if (slotPerm.length < arr.size()) {
        for (i = 1; i < arr.size(); i++) {
          slotPerm[i] = i;
        }
        // Now, randomize
        for (i = 1; i < arr.size(); i++) {
          rnum = Math.ceil(Math.random() * (arr.size() - 1));
          temp = slotPerm[i];
          slotPerm[i] = slotPerm[rnum];
          slotPerm[rnum] = temp;
        }
      }

      if (printPerm) {
        jsav.umsg("Permutation: " + slotPerm.join(' '));
      }

      // Counter that counts how many times the loop ran
      var count = 0;

      // Current index of array of permutations
      var currIndex = 1;

      // Position to check, will point to the correct position at the end of the loop
      temp = pos;

      // Loop across the array. "infinite" loop. Breaks if array is full.
      for (;;) {
        // If space is available, break
        if (String(arr.value(temp)) === "") {
          break;
        }

        // If array is full, break out
        if (count === arr.size()) {
          // Tried to insert everywhere the algorithm would let us, failed
          canInsert = false;

          // Assume the array is full, since insertion failed, but check for any empty slots
          arrayFull = true;
          for (var b = 0; b < arr.size(); b++) {
            if (String(arr.value(b)) === "") {
              arrayFull = false;
              break;
            }
          }
          break;
        }

        // Insert attempt as highlighting activity
        if (!showCounts) {
          enqueueStep(temp, inputVal, false, arrayFull, canInsert);
        }

        // Calculate next position to check by adding the next random slot to the original position
        temp  = pos + slotPerm[currIndex];
        currIndex++;

        // Wrap around to the beginning of the array
        if (temp >= arr.size()) {
          temp %= arr.size();
        }

        // Increment count
        count++;
      }

      // Empty spot found. Insert element inputVal at temp
      pos = temp;
    }

    if (!showCounts) {
      enqueueStep(pos, inputVal, true, arrayFull, canInsert);
    } else {
      return pos;
    }
  }

  // Quadratic Probing
  function quadraticProbing(inputVal, pos, showCounts) {
    var arrayFull = false;
    var canInsert = true;

    // Temp pointer that will point to the correct position at the end of the loop
    var temp = pos;

    // Counter that counts how many times the loop ran
    var count = 0;

    // i for the quadratic probing
    var i = 1;

    // Loop across the array. "infinite" loop. Breaks if array is full.
    for (;;) {
      // If space is available, break
      if (String(arr.value(temp)) === "") {
        break;
      }

      // If array is full, break out
      if (count === arr.size()) {
        // Tried to insert everywhere the algorithm would let us, failed
        canInsert = false;

        // Assume the array is full, since insertion failed, but check for any empty slots
        arrayFull = true;
        for (var b = 0; b < arr.size(); b++) {
          if (String(arr.value(b)) === "") {
            arrayFull = false;
            break;
          }
        }
        break;
      }

      // Insert attempt as highlighting activity
      if (!showCounts) {
        enqueueStep(temp, inputVal, false);
      }

      // Calculate the next position to check by adding the square of i to the original position, increment i
      temp = pos + i * i;
      i++;

      // Wrap around to the beginning of the array
      if (temp >= arr.size()) {
        temp %= arr.size();
      }

      // Increment count
      count++;
    }

    // Empty spot found. Insert element inputVal at temp
    if (!showCounts) {
      enqueueStep(temp, inputVal, true);
    } else {
      return temp;
    }
  }

  /**
   * Calculates the step size for double hashing collision policy using a prime number M
   */
  function doubleHashPrime(inputVal, showCounts) {
    var M = Number($('#M').val());

    if (!isPrime(M)) {
      error("Please enter a valid prime number M");
      // Return error
      return 1;
    }

    var stepSize = 1 + (inputVal % (M - 1));

    if (!showCounts) {
      jsav.umsg("Step size = 1 + (Input Value % (M - 1))");
      jsav.umsg("Step size = 1 + (" + inputVal + " % (" + M + " - 1)) = " + stepSize);
    }

    return stepSize;
  }

  /**
   * Calculates the step size for double hashing collision policy using a power of 2
   */
  function doubleHashPowerOf2(inputVal, showCounts) {
    var M = Number($('#M').val());

    // Test if its a valid power of 2
    if (!isPowerOf2(M)) {
      error("Please enter a valid power of 2 M");
      // Return error
      return 1;
    }

    var stepSize = ((inputVal % (M / 2)) * 2) + 1;

    if (!showCounts) {
      jsav.umsg("Step size = ((Input Value % (M / 2)) * 2) + 1");
      jsav.umsg("Step size = ((" + inputVal + " % (" + M + " / 2)) * 2) + 1 = " + stepSize);
    }

    return stepSize;
  }

  /**
   * Adds a step to the queue
   *  pos - array position to perform an action
   *  val - the value to insert
   *  arrayFull - true if entire array is full
   *  canInsert - true if pos is empty and insertion can take place
   *              false if all positions the resolution algorithm attempts are full
   */
  function enqueueStep(pos, val, insert, arrayFull, canInsert) {
    // Create an queue a highlight step
    var step = {
      'position': pos,
      'value': val,
      'insert': false,
      'arrayFull': arrayFull,
      'canInsert': canInsert
    };
    nextStep.enqueue(step);

    // Queue an insertion step too, if applicable
    if (insert && canInsert) {
      step = {
        'position': pos,
        'value': val,
        'insert': true,
        'arrayFull': arrayFull,
        'canInsert': canInsert
      };
      nextStep.enqueue(step);
    }
  }







  /**
   * Runs when page has finished loading
   * Anything that triggers an interaction with an HTML element should be done here
   */
  $(document).ready(function () {
    jsav = new JSAV($('.avcontainer'));

    /* Key Presses */
    $('#M').keyup(function (event) {
      resetAV();
    });

    $('#M').keypress(function (event) {
      // Capture 'Enter' press
      if (event.which === 13) {
        // Prevent 'Enter' from posting the form and refreshing the page
        event.preventDefault();
      }
    });

    $('#keyrange').change(function () {
      resetAV();
    });

    // If the user hits 'Enter' while the focus is on the textbox,
    // click 'Next' rather than refreshing the page
    $("#input").keypress(function (event) {
      // Capture 'Enter' press
      if (event.which === 13) {
        // Prevent 'Enter' from posting the form and refreshing the page
        event.preventDefault();

        // If the user entered a value and inserting is allowed, trigger 'Next'
        if ($("#input").val() !== "" && !$('#next').attr('disabled')) {
          $('#next').click();
        }
      } else {
        // Enable the 'Next' button when the user enters a value
        $('#next').removeAttr('disabled');
      }
    });


    /* Event Triggers */

    // Event trigger change if hashing function option is changed
    $("#function").change(function () {
      setFunction();
    });

    // Event trigger change if collision function option is changed
    $("#collision").change(function () {
      resetAV();
    });

    // Event trigger change if size of hash changes
    $("#tablesize").change(function () {
      resetAV();
    });

    /* Next button pushed.
     * If no slide show exits, make one.
     * Else, load next slide
     */
    $('#next').click(function () {
      var ret = 1;
      if (nextStep.isEmpty()) {    // Perform first step
        // Input field value
        var inputVal = $("#input").val();
        
        // Log the state of the exercise
        var state = {};
        state.user_function = $("#function option:selected").text();
        state.user_collision = $("#collision option:selected").text();
        state.user_tablesize = $("#tablesize option:selected").text();
        state.user_keyrange = $("#keyrange option:selected").text();
        state.user_mValue = $("#mValue").val();
        state.hash_table = arr.toString();
        state.user_input = inputVal;
        ODSA.AV.logExerciseInit(state);

        // Disable input field to process it safely
        $("#input").attr("disabled", "disabled");

        // Process input with selected function
        switch ($("#function").val()) {
        case '0':  // No function chosen
          reset();
          break;
        case '1':
          ret = simpleMod(inputVal);
          break;
        case '2':
          ret = binning(inputVal);
          break;
        case '3':
          ret = midSquare(inputVal);
          break;
        case '4':
          ret = simpleStrings(inputVal);
          break;
        case '5':
          ret = improvedStrings(inputVal);
          break;
        }

        // Show first slide if success
        if (ret === 0) {
          loadNextSlide();
        } else {    // Error occurred, re-enable input textfield
          console.error('Error occurred when hashing ' + inputVal);
          $("#input").removeAttr("disabled");
        }
      } else {    // Load next slide
        loadNextSlide();

        var i;
        var tableSize = $("#tablesize").val();
        var tableCount = [];

        // Reset counts to 0
        for (i = 0; i < tableSize; i++) {
          tableCount[i] = 0;
          $('#' + i + '_count').html(0);
        }

        // Recalculate the counts
        for (i = 0; i < tableSize; i++) {
          ret = determineResolution(0, i, true, false);
          var count = tableCount[ret];
          count++;
          tableCount[ret] = count;
          $('#' + ret + '_count').html(count);
        }
      }
    });

    // Connect action callbacks to the HTML entities
    $('#about').click(about);
    $('#reset').click(reset);
    $('#help').click(function () {
      window.open("hashAVHelp.html", 'helpwindow');
    });
    $('#showcounts').click(function () {
      if ($('.countlabel').css('display') === 'none') {
        $('.countlabel').show();
        $('#showcounts').val('Hide Counts');
      } else {
        $('.countlabel').hide();
        $('#showcounts').val('Show Counts');
      }
    });

    // create a new settings panel and specify the link to show it
    var settings = new JSAV.utils.Settings($(".jsavsettings"));

    // Set the default state for the controls
    setDefaultControlState();

    // Get the default HTML for the tablesize dropdown list
    defTableSizeOptions = $('#tablesize').html();

    // Adjust UI element positions
    var contWidth = $('#container').width() - 20; // 20 pixels for padding
    $('.jsavoutput').width(contWidth / 2);
    $('#hashTable').css('left', (3 * contWidth / 4));

    // Call reset - the initial state of the vizualization
    reset();
  });
}(jQuery));
