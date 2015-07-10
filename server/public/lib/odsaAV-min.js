"use strict";
/*global alert: true, console: true, ODSA, PARAMS, JSAV_OPTIONS, JSAV_EXERCISE_OPTIONS, MathJax */

/**
 * This file constitutes the AV and exercise component of the OpenDSA framework
 * It is responsible for:
 *
 *   1) Initializing certain global variables such as ODSA.SETTINGS.AV_NAME
 *
 *   2) Defining generalized utility functions used by multiple AVs / exercises
 *
 *   3) Automatically handling some common AV behavior
 *        - Displays a message that user's can no longer receive credit for an
 *          exercise after viewing the model answer
 *
 *   4) Automatically logging most actions taken within an AV
 *        - Sends log information to the parent page or submits its own logging
 *          data (unless overridden by a URL configuration parameter)
 *
 * This file should only be referenced by AVs and non-Khan Academy exercises (not modules)
 *
 * DEPENDENCIES:
 *   - odsaUtils.js must be included before this file
 *     - Ensures the proper namespaces exist (i.e. window.console, ODSA, ODSA.SETTINGS, ODSA.UTILS)
 *     - Parses URL parameters, initializes the PARAMS object, and automatically sets some specific global variables
 *
 * Author: Dan Breakiron
 * Last Modified: 2014-09-19
 */

(function($) {
  // Provide a warning that behavior is undefined if odsaUtils.js is not included
  if (typeof ODSA === "undefined" || typeof ODSA.SETTINGS === "undefined") {
    console.warn("odsaUtils.js must be included before odsaAV.js to ensure proper functionality");
  }

  //*****************************************************************************
  //*************                  GLOBAL VARIBALES                 *************
  //*****************************************************************************

  var seed = PARAMS.seed || Math.floor(Math.random() * 99999999999999).toString();

  /**
   * Local settings object that makes it easier to access ODSA.SETTINGS and
   * allows better minification
   */
  var settings = ODSA.SETTINGS;
  ODSA.SETTINGS.MODULE_ORIGIN = "*";

  /**
   * Local odsaUtils object that makes it easier to access ODSA.UTILS and
   * allows better minification
   */
  var odsaUtils = ODSA.UTILS;

  /**
   * A timestamp when the user started looking at the page
   */
  var focusTime = +new Date();

  /**
   * The total amount of time the user has spent on the current exercise instance
   */
  var totalTime = 0;

  /**
   * Stores the empty contents of the avcontainer, used for reset
   */
  var emptyContent = '';

  /**
   * A flag used to indicate that the user cannot receive credit for the
   * current exercise instance after viewing the model answer
   */
  var allowCredit = true;

  /**
   * A unique instance identifier, used to group interaction events from a single instance
   */
  var uiid = +new Date();

  /**
   * Controls whether the AV submits its own event data or allows its parent page to handle event data
   */
  var selfLoggingEnabled = PARAMS.selfLoggingEnabled === 'false' ? false : true;


  //*****************************************************************************
  //*************                    AV FUNCTIONS                   *************
  //*****************************************************************************

  /**
   * Facilitates dynamic iFrame resizing by sending the size of the page to the parent page
   */
  function sendResizeMsg() {
    // wait a while in case the exercise is rendering
    setTimeout(function() {
      // try to find the container for the whole exercise
      var $jsavContainer = $("#container");

      if ($jsavContainer.length === 0) {
        $jsavContainer = $("#jsavcontainer");
      }

      if ($jsavContainer.length === 0) {
        return; // give up
      }

      var $body = $("body"),
        bodyXMargin = $body.outerWidth(true) - $body.outerWidth(),
        bodyYMargin = $body.outerHeight(true) - $body.outerHeight(),
        width = $jsavContainer.outerWidth(true) + bodyXMargin,
        height = $jsavContainer.outerHeight(true) + bodyYMargin;

      // If height or width is 0, an error occurred
      // IMPORTANT: Do not report zero dimensions to module page as it
      // will effectively make the AV permanently hidden
      if (height === 0 || width === 0) {
        console.warn('Unable to determine dimensions of ' + ODSA.SETTING.AV_NAME);
        return;
      }

      // IMPORTANT: Replace settings.MODULE_ORIGIN with '*' (including
      // quotes) in order to perform local testing
      parent.postMessage({
        type: "resize-iframe",
        exerName: ODSA.SETTINGS.AV_NAME,
        width: width,
        height: height
      }, settings.MODULE_ORIGIN);

    }, 100);
  }

  /**
   * Generates a JSAV event to log the initial state of an AV or exercise
   *   - initData - A JSON object that contains the initial state of an exercise
   *     Conventions:
   *       - The key for automatically generated data should have a prefix 'gen_'
   *         - Ex: an automatically generated array would be 'gen_array'
   *       - The key for user generated data should have a prefix 'user_'
   *         - Ex: Array data the user enters in the textbox should have a key 'user_array'
   */
  function logExerciseInit(initData) {
    // Reset the uiid (unique instance identifier)
    uiid = +new Date();
    totalTime = 0;

    var data = {
      av: settings.AV_NAME,
      type: 'odsa-exercise-init',
      desc: JSON.stringify(initData)
    };
    $("body").trigger("jsav-log-event", [data]);
  }

  /**
   * Generates a JSAV event that triggers the code to give a user credit for an exercise
   */
  function awardCompletionCredit() {
    var data = {
      av: settings.AV_NAME,
      type: 'odsa-award-credit'
    };
    $("body").trigger("jsav-log-event", [data]);
  }

  /**
   * Resets the AV to its initial state
   */
  function reset(flag) {
    // Replace the contents of the avcontainer with the save initial state
    $('.avcontainer').unbind().html(emptyContent);

    // Clear the array values field, when no params given and reset button hit
    if (flag !== true && !$('#arrayValues').prop("disabled")) {
      $('#arrayValues').val("");
    }

    sendResizeMsg();
  }

  // Initialize the arraysize drop down list
  function initArraySize(min, max, selected) {
    // Use the midpoint between the min and max as a default, if a selected value isn't provided
    selected = (selected) ? selected : Math.round((max + min) / 2);

    var html = "";
    for (var i = min; i <= max; i++) {
      html += '<option ';
      if (i === selected) {
        html += 'selected="selected" ';
      }
      html += 'value="' + i + '">' + i + '</option>';
    }

    $('#arraysize').html(html);

    // Save the min and max values as data attributes so
    // they can be used by processArrayValues()
    $('#arraysize').data('min', min);
    $('#arraysize').data('max', max);
  }

  // Validate the array values a user enters or generate an array of random numbers if none are provided
  function processArrayValues(upperLimit) {
    upperLimit = (upperLimit) ? upperLimit : 999;

    var i,
      initData = {},
      minSize = $('#arraysize').data('min'),
      maxSize = $('#arraysize').data('max'),
      msg = "Please enter " + minSize + " to " + maxSize + " positive integers between 0 and " + upperLimit;

    if (!minSize || !maxSize) {
      console.warn('processArrayValues() called without calling initArraySize()');
    }

    // Convert user's values to an array,
    // assuming values are space separated
    var arrValues = $('#arrayValues').val().match(/[0-9]+/g) || [];

    if (arrValues.length === 0) { // Empty field
      // Generate (appropriate length) array of random numbers between 0 and the given upper limit
      for (i = 0; i < $('#arraysize').val(); i++) {
        arrValues[i] = Math.floor(Math.random() * (upperLimit + 1));
      }
      initData.gen_array = arrValues;
    } else {
      // Ensure user provided array is in correct range
      if (arrValues.length < minSize || arrValues.length > maxSize) {
        alert(msg);
        return null;
      }

      // Ensure all user entered values are positive integers
      for (i = 0; i < arrValues.length; i++) {
        arrValues[i] = Number(arrValues[i]);
        if (isNaN(arrValues[i]) || arrValues[i] < 0 || arrValues[i] > upperLimit) {
          alert(msg);
          return null;
        }
      }

      initData.user_array = arrValues;

      // Update the arraysize dropdown to match the length of the user entered array
      $('#arraysize').val(arrValues.length);
    }

    // Dynamically log initial state of text boxes
    $('input[type=text]').each(function(index, item) {
      var id = $(item).attr('id');

      if (id !== 'arrayValues') {
        initData['user_' + id] = $(item).val();
      }
    });

    // Dynamically log initial state of dropdown lists
    $('select').each(function(index, item) {
      var id = $(item).attr('id');
      initData['user_' + id] = $(item).val();
    });

    // Log initial state of exercise
    ODSA.AV.logExerciseInit(initData);

    return arrValues;
  }

  // Return a standard phrasing to be used in the "about" alert box
  function aboutstring(title, authors) {
    return title + "\nWritten by " + authors + "\nCreated as part of the OpenDSA hypertextbook project\nFor more information, see http://algoviz.org/OpenDSA\nSource and development history available at\nhttps://github.com/OpenDSA/OpenDSA\nCompiled with JSAV library version " + JSAV.version();
  }

  //*****************************************************************************
  //*************            AV INFRASTRUCTURE FUNCTIONS            *************
  //*****************************************************************************

  function processEventData(data) {
    var flush = false;

    // Filter out events we aren't interested in
    if (odsaUtils.discardEvents.indexOf(data.type) > -1) {
      return;
    }

    // Overwrite the av attribute with the correct AV name, append the
    // uiid, then calculate the amount of time spent on the exercise
    data.av = settings.AV_NAME;
    data.uiid = uiid;
    data.seed = seed;
    data.totalTime = totalTime + (+new Date()) - focusTime;


    // If data.desc doesn't exist or is empty, initialize it
    if (!data.desc || data.desc === '') {
      data.desc = {};
    } else {
      // If it already exists, make sure its a JSON object
      data.desc = odsaUtils.getJSON(data.desc);
    }

    var score,
      complete;

    if (odsaUtils.ssEvents.indexOf(data.type) > -1) {
      data.desc.currentStep = data.currentStep;
      data.desc.currentStep = data.totalSteps;

      // TODO: Add startTime and highestStep from odsaMOD.js

      // Flush event data when the end of a slideshow is reached
      if (data.currentStep === data.totalSteps) {
        flush = true;
      }
    } else if (data.type === "jsav-array-click") {
      data.desc.index = data.index;
      data.desc.arrayID = data.arrayid;
    } else if (data.type === "jsav-exercise-grade-change" || data.type === "jsav-exercise-grade" || data.type === "jsav-exercise-step-fixed") {
      // On grade change events, log the user's score and submit it
      score = odsaUtils.roundPercent(data.score.correct / data.score.total);
      // TODO: Verify with Ville how to properly calculate this
      complete = odsaUtils.roundPercent((data.score.correct + data.score.undo + data.score.fix) / data.score.total);
      data.desc.score = score;
      data.desc.complete = complete;

      // Prevent event data from being transmitted on every step
      // This makes better use of the buffering mechanism and overall reduces the network traffic (removed overhead of individual requests), but it takes a while to complete and while its sending the log data isn't saved in local storage, if the user closes the page before the request completes and it fails the data will be lost
      if (complete === 1) {
        // Set the score into score form field and submit.
        if (TP.outcomeService) {

          // $('input[name=score]').val(score);
          // $('#score_form').submit();

          // Send the data to the server
          TP.toParams.score = score;
          jQuery.ajax({
            url: "/assessment",
            type: "POST",
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(TP.toParams),
            datatype: "json",
            // xhrFields: {
            //   withCredentials: true
            // },
            success: function(data) {
              // alert("YES!");
            },
            error: function(data) {
              // alert("WHAT HAPPENED!");
            }
          });

        }
      }

      flush = true;
    } else if (data.type === "jsav-exercise-model-open") {
      // TODO: See https://github.com/OpenDSA/OpenDSA/issues/249

      // If user looks at the model answer before they are done and
      // they haven't already lost credit, warn them they can no longer
      // receive credit and prevent them from getting credit for the exercise
      if (allowCredit && $('span.jsavamidone').html() !== "DONE") {
        allowCredit = false;

        alert("You can no longer receive credit for the current instance of this exercise.\nClick 'Reset' or refresh the page to get a new problem instance.");

        // Hide the score widget and display and appropriate message in its place
        $('span.jsavscore').hide();
        $('span.jsavscore').parent().append('<span id="credit_disabled_msg">Credit not given for this instance</span>');
      }
    } else if (data.type === "jsav-exercise-reset") {
      flush = true;

      // If the student looked at the model answer for the previous
      // attempt, allow them to get credit for the new instance
      if (!allowCredit) {
        allowCredit = true;

        $('span.jsavscore').show();
        $('#credit_disabled_msg').remove();
      }
    }

    // Appends a flag to the data, indicating that the AV itself will
    // submit the data to the logging server
    if (selfLoggingEnabled) {
      data.logged = true;
    }

    if (settings.MODULE_ORIGIN) {
      parent.postMessage(data, settings.MODULE_ORIGIN);
    }

    // Save the event in localStorage
    if (!!settings.LOGGING_SERVER && selfLoggingEnabled) {
      odsaUtils.logEvent(data);

      if (flush) {
        odsaUtils.sendEventData();
      }
    }
  }

  //*****************************************************************************
  //*************            Creates global ODSA.AV object           ************
  //*****************************************************************************

  // Create a global AV namespace and make the necessary AV variables
  // and utility functions public by adding them to it
  window.ODSA.AV = {};
  ODSA.AV.aboutstring = aboutstring;
  ODSA.AV.awardCompletionCredit = awardCompletionCredit;
  ODSA.AV.initArraySize = initArraySize;
  ODSA.AV.logExerciseInit = logExerciseInit;
  ODSA.AV.processArrayValues = processArrayValues;
  ODSA.AV.reset = reset;
  ODSA.AV.sendResizeMsg = sendResizeMsg;


  //*****************************************************************************
  //*************                   INITIALIZATION                  *************
  //*****************************************************************************

  /**
   * Parses the name of the page from the URL
   */
  function getNameFromURL(url) {
    // If no URL is specified, uses the pathname of the current page
    url = (url) ? url : location.pathname;
    var start = url.lastIndexOf("/") + 1,
      end = url.lastIndexOf(".htm");

    // URL is a directory, redirecting to an index page
    if (start === url.length && end === -1) {
      return 'index';
    }

    return url.slice(start, end);
  }

  // Initialize ODSA.SETTINGS.AV_NAME
  // ODSA.SETTINGS.AV_NAME = getNameFromURL();

  $(document).ready(function() {
    // Initialize ODSA.SETTINGS.AV_NAME
    ODSA.SETTINGS.AV_NAME = TP.ODSAParams.short_name;

    // If MathJax is loaded, attach an event handler to the avcontainer that
    // will apply MathJax processing to each JSAV message
    if (typeof MathJax !== 'undefined') {
      MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ['$', '$'],
            ['\\(', '\\)']
          ],
          displayMath: [
            ['$$', '$$'],
            ["\\[", "\\]"]
          ],
          processEscapes: true
        },
        "HTML-CSS": {
          scale: "80"
        }
      });
      $('.avcontainer').on("jsav-message", function() {
        // invoke MathJax to do conversion again
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      });
      $(".avcontainer").on("jsav-updatecounter", function() {
        // invoke MathJax to do conversion again
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
      });
    }

    // Record the HTML of the avcontainer in the "empty" state
    emptyContent = $('.avcontainer').html();

    // Send the size of the page to the parent page to allow for iframe resizing
    sendResizeMsg();

    // Listen for JSAV events and forward them to the parent page
    $("body").on("jsav-log-event", function(e, data) {
      processEventData(data);
    });

    // Attach logging handlers to window events
    if (!!settings.LOGGING_SERVER) {
      // Log the browser ready event
      odsaUtils.logUserAction('document-ready', 'User loaded the ' + settings.AV_NAME + ' AV');

      if (selfLoggingEnabled) {
        // Send any stored event data when the page loads
        odsaUtils.sendEventData();
      }

      $(window).focus(function(e) {
        odsaUtils.logUserAction('window-focus', 'User looking at ' + settings.AV_NAME + ' window');
        focusTime = +new Date();
      });

      $(window).blur(function(e) {
        odsaUtils.logUserAction('window-blur', 'User is no longer looking at ' + settings.AV_NAME + ' window');
        totalTime += (+new Date() - focusTime);
      });

      $(window).on('beforeunload', function() {
        // Log the browser unload event
        odsaUtils.logUserAction('window-unload', 'User closed or refreshed ' + settings.AV_NAME + ' window');
      });
    }
  });
}(jQuery));