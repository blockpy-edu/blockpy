"use strict";
/*global alert: true, console: true, warn: true, ODSA, JSAV_EXERCISE_OPTIONS, JSAV_OPTIONS */

/**
 * This file defines utility functions used by both AVs and modules
 *
 * It is responsible for:
 *
 *   1) Creating function stubs for console to support IE without developer tools
 *
 *   2) Defining default JSAV_OPTIONS and JSAV_EXERCISE_OPTIONS
 *
 *   3) Defining extensions to JSAV and various utility functions for use in AVs
 *      and on modules
 *
 *   4) Automatically parsing URL parameters and using them to initialize
 *      ODSA.SETTINGS (if applicable, i.e. on embedded pages)
 *
 *   5) Defining functions related to loading and automatically applying
 *      language translations
 *
 *   6) Defining logging functions and automatically attaching some of them to
 *      elements
 *
 * This file is required by both AVs and modules and should be
 * referenced before odsaAV.js and odsaMOD.js, respectively
 *
 * Author: Dan Breakiron
 * Last Modified: 2014-09-19
 */

/**
 * Dictionary of exercise parameters parsed from the URL
 */
var PARAMS = {};

(function($) {
  //*****************************************************************************
  //*************                  GLOBAL VARIBALES                 *************
  //*****************************************************************************

  /**
   * Local settings object that makes it easier to access ODSA.SETTINGS and allows better minification
   */
  var settings;

  /**
   * Local moduleName object that makes it easier to access ODSA.SETTINGS.MODULE_NAME and allows better minification
   */
  var moduleName;

  /**
   * A unique instance identifier, used to group interaction events from a single instance
   */
  var uiid = +new Date();

  /**
   * Stores book stranslation text
   */
  var langDict = {};


  //*****************************************************************************
  //*************                  JSAV Extensions                  *************
  //*****************************************************************************
  /**
   * Extends the JSAV AV array to have the slice functionality of JavaScript arrays
   */
  JSAV._types.ds.AVArray.prototype.slice = function(start, end) {
    var array = [];

    for (var i = 0; i < (end - start); i++) {
      array[i] = this.value(start + i);
    }

    return array;
  };

  /**
   * Convenience function for highlighting the pivot value in blue
   */
  JSAV._types.ds.AVArray.prototype.highlightBlue = function(index) {
    return this.addClass(index, "processing");
  };
  JSAV._types.ds.AVArray.prototype.unhighlightBlue = function(index) {
    return this.removeClass(index, "processing");
  };

  /**
   * Convenience function for highlighting sorted values
   */
  JSAV._types.ds.AVArray.prototype.markSorted = function(index) {
    this.removeClass(index, "processing");
    return this.addClass(index, "sorted");
  };

  /**
   * toString function for JSAV arrays, useful for debugging
   */
  JSAV._types.ds.AVArray.prototype.toString = function() {
    var size = this.size();
    var str = '[';
    for (var i = 0; i < size; i++) {
      str += this.value(i);

      if (i < size - 1) {
        str += ', ';
      }
    }
    str += ']';

    return str;
  };


  //*****************************************************************************
  //***********                   Utility Functions                   ***********
  //*****************************************************************************

  /**
   * Loops through all the keys in a dictionary of parameters and sets
   * the appropriate JSAV_EXERCISE_OPTIONS or JSAV_OPTIONS setting if the
   * key begins with JXOP- or JOP-, respectively
   */
  function setJSAVOpt(key, value) {
    if (key.indexOf('JXOP-') === 0) {
      // Arguments that begin with the prefix 'JXOP-' are JSAV_EXERCISE_OPTIONS settings
      // Strip the 'JXOP-' flag from the setting name and apply the specified value
      JSAV_EXERCISE_OPTIONS[key.replace('JXOP-', '')] = value;
    } else if (key.indexOf('JOP-') === 0) {
      // Arguments that begin with the prefix 'JOP-' are JSAV_OPTIONS settings
      // Strip the 'JOP-' flag from the setting name and apply the specified value
      JSAV_OPTIONS[key.replace('JOP-', '')] = value;
    }
  }

  /**
   * Parses parameters from the URL, supports exercise configuration and changing the default JSAV options
   * If an AV author changes any of the default JSAV options set above, they must call this function
   * (ODSA.UTILS.parseURLParams();) to apply any URL parameters and ensure their exercise remains configurable
   */
  function parseURLParams() {
    // Parse the querystring from the URL
    var query_params = JSAV.utils.getQueryParameter();

    // Automatically set any JSAV_EXERCISE_OPTIONS or JSAV_OPTIONS, if applicable
    for (var key in query_params) {
      if (query_params.hasOwnProperty(key)) {
        setJSAVOpt(key, query_params[key]);
      }
    }

    // Make PARAMS include all of the parameters (including the JXOP- and JOP- ones)
    PARAMS = query_params;
  }

  /**
   * Function to translate module pages, fetches translation in language_msg.json  file
   * returns a JSON object
   */
  function loadLangMod() {
    var langText = {},
      // url = getBookURL() + '_static/language_msg.json';
      url = '/_static/language_msg.json';

    $.ajax({
      url: url,
      async: false,
      dataType: "json",
      success: function(data) {
        var langFile = getJSON(data);
        var tmpLD = langFile[ODSA.SETTINGS.BOOK_LANG].jinja;
        var tmpLD1 = langFile[ODSA.SETTINGS.BOOK_LANG].js;
        langText = $.extend({}, tmpLD, tmpLD1);
      },
      error: function(data) {
        data = getJSON(data);

        if (data.hasOwnProperty('status') && data.status === 200) {
          console.error('JSON language file is malformed. Please make sure your JSON is valid.');
        } else {
          console.error('Unable to load JSON language file (' + url + ')');
        }
      }
    });

    return langText;
  }

  /**
   * Returns correct type information.  Bypasses broken behavior of 'typeof'.
   * `typeof` should be avoided at all costs (unless checking if a var is defined).
   *
   * Based on 'is' from: http://bonsaiden.github.com/JavaScript-Garden/
   * See https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/ for more information
   */
  function getType(obj) {
    if (typeof obj !== "undefined") {
      // Parse the type from the Object toString output
      return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
    }
    return "undefined";
  }

  /**
   * Returns the URL of the book
   */
  function getBookURL() {
    if (typeof ODSA.SETTINGS.BOOK_URL === "undefined") {
      var loc = location.href;
      ODSA.SETTINGS.BOOK_URL = loc.substring(0, loc.lastIndexOf('/') + 1);
    }

    return ODSA.SETTINGS.BOOK_URL;
  }

  /**
   * Returns ODSA.SETTINGS.BOOK_ID if it exists (i.e. was supplied via
   * URL parameter or a previous call to this function)
   *
   * If it does not exist, initializes it with the SHA1 hash of the
   * book's URL for use as a unique identifier
   */
  function getBookID() {
    if (typeof ODSA.SETTINGS.BOOK_ID === "undefined") {
      var url = getBookURL();
      // TODO: Needs to eliminate the protocol so that the book is considered the same regardless of using HTTP or HTTPS
      // url = url.substring(url.indexOf(':') + 3);
      ODSA.SETTINGS.BOOK_ID = Sha1.hash(url);
    }

    return ODSA.SETTINGS.BOOK_ID;
  }

  /**
   * Returns true if the system is configured with a metrics collection server
   */
  function loggingServerEnabled() {
    return !!settings.LOGGING_SERVER;
  }

  /**
   * Returns true if the system is configured with a scoring server
   */
  function scoringServerEnabled() {
    return !!settings.SCORE_SERVER;
  }

  /**
   * Erases the localStorage keys associated with a user's session
   * Used when the user logs out manually or when their session expires
   */
  function clearSession() {
    localStorage.removeItem('session_key');
    localStorage.removeItem('session_expires');
    localStorage.removeItem('warn_login');
    // Remove the variable storing the user's progress on KA exercises
    localStorage.removeItem('khan_exercise');

    // Trigger a page reload to reset exercises (in case someone else logs in) and proficiency indicators
    window.location.reload();
  }

  /**
   * Returns false if a session exists and the session expiration time has not yet passed
   */
  function isSessionExpired() {
    if (localStorage.session_expires) {

      var sessionExpiration = localStorage.session_expires,
        currentTime = (new Date()).getTime();

      // Compare the saved expiration date in milliseconds with the current milliseconds
      if (sessionExpiration > currentTime) {
        return false;
      }

      if (langDict.hasOwnProperty('session_expired')) {
        alert(langDict.session_expired);
        clearSession();

        // Trigger a page reload to reset exercises (in case someone else logs in) and proficiency indicators
        window.location.reload();
      }
    }
    return true;
  }

  /**
   * Returns whether or not a user is currently logged in
   */
  function userLoggedIn() {
    return !isSessionExpired();
  }

  function getUsername() {
    if (userLoggedIn()) {
      return localStorage.username;
    }
    return "guest";
  }

  function getSessionKey() {
    if (localStorage.session_key) {
      return localStorage.session_key;
    }
    return "phantom-key";
  }

  /**
   * Rounds the given number to a max of 2 decimal places
   */
  function roundPercent(number) {
    return Math.round(number * 100) / 100;
  }

  /**
   * Returns true if the given element is a JSAV managed control
   * Relies on JSAV controls being in a container with a class that matches '.*jsav\w*control.*'
   * include "jsavexercisecontrols" and "jsavcontrols"
   */
  function isJSAVControl(item) {
    /*jslint regexp: true */
    return (item && item.parentElement && item.parentElement.className.match(/.*jsav\w*control.*/) !== null);
  }

  /**
   * Returns the given data as a JSON object
   * If given a string, converts it to JSON
   * If given a JSON object, does nothing
   */
  function getJSON(data) {
    if (typeof data === 'undefined') {
      console.warn("getJSON() error: data is undefined");
      return {};
    }

    if (getType(data) === "string") {
      data = jQuery.parseJSON(data);
    }

    return data;
  }

  // Randomly scramble the contents of an array
  function permute(arr) {
    for (var i = 0; i < arr.length; i++) { // for each i
      var randompos = Math.floor(Math.random() * arr.length);
      var temp = arr[i];
      arr[i] = arr[randompos];
      arr[randompos] = temp;
    }
  }


  //*****************************************************************************
  //***********        Dynamic Exercise Configuration Functions       ***********
  //*****************************************************************************

  /**
   * Loads a JSON exercise configuration file that contains natural
   * language translations, multiple code languages, and default parameters
   * Uses this config file to reset the language of common elements, then
   * returns an object that contains a JSAV interpreter, code object, and
   * a parameters object
   *
   * Parameters:
   *   Takes an object as its parameter which contains optional arguments
   *   (described below)
   *
   *  - av_name - the name of the AV (required for mini-slideshows because there
   *              could be multiple AVs per page, optional for standalone AVs
   *              because ODSA.SETTINGS.AV_NAME is used by default)
   *
   *  - json_path - the path to the JSON file containing language data,
   *                relative to the root OpenDSA directory defaults to
   *                av_name (convention for standalone AVs)
   *
   *  - av_container - ID of the container containing the AV (defaults to
   *                   '#container' for standalone AVs and  '#[av_name]' for
   *                    mini-slideshows
   *
   * Return:
   *   - Returns an object containing a JSAV interpreter and code
   *   - Ex: {interpreter: ..., code: ..., params: ...}
   */
  function loadConfig(args) {
    // Initialize args, if no object was provided
    if (typeof args === 'undefined') {
      args = {};
    }

    // If av_name is provided as an argument (necessary for mini-slideshows)
    // use it, otherwise default to ODSA.SETTINGS.AV_NAME (valid for standalone AVs)
    var av_name = (args.hasOwnProperty('av_name')) ? args.av_name : settings.AV_NAME;

    // Default the JSON URL to the name of the AV (convention for standalone AVs)
    var json_url = av_name;

    // If json_filepath was provided as an argument, attempt to calculate the
    // relative path to the OpenDSA root directory, then append the filepath
    if (args.hasOwnProperty('json_path')) {
      if (settings.hasOwnProperty('BUILD_TO_ODSA')) {
        json_url = settings.BUILD_TO_ODSA + args.json_path;
      } else {
        json_url = args.json_path;
      }
    }

    // Default av_container to #container (the av_container for standalone AVs)
    var av_container = $('#container');
    var configurationFile;
    var result = {
      interpreter: function(tag) {
        return tag;
      },
      code: undefined,
      getSettings: function() {
        return new JSAV.utils.Settings($(".jsavsettings"));
      },
      params: {}
    };

    // Use intelligent defaults to try and set the av_container
    if (args.hasOwnProperty('av_container') && $('#' + args.av_container).length > 0) {
      // Set av_container using provided parameter
      av_container = $('#' + args.av_container);
    } else if ($('#' + av_name).length > 0) {
      // If the container is named for the AV it is a mini-slideshow

      // If the AV is a mini-slideshow and does not provide a json_path
      // argument, assume the name of the JS file where the AV is defined,
      // the JSON exercise config file, and the AV name are the same
      // Use this assumption to auto-detect the path to the JSON file
      if (!args.hasOwnProperty('json_path')) {
        // json_url = $('script[src*="/' + av_name + '.js"]')[0].src + 'on';
        json_url = av_name;
      }

      // Set av_container to av_name (default for mini-slideshows)
      av_container = $('#' + av_name);
    } else if ($(av_container).length === 0) {
      // If av_container is not provided as a parameter, does not match the av_name or '#container', then print an error message
      console.warn('ERROR: Unable to apply translation because #' + av_container + ', #' + av_name + ', and #container do not exist');
    }

    // Append '.json' to the end of the JSON URL, if it doesn't already exist
    if (json_url.indexOf('.json') === -1) {
      json_url += '.json';
    }

    // Initialize the selected natural language and code language
    // Ensure lang and code are lowercase so that everything will be in a predictable case
    var lang = (JSAV_EXERCISE_OPTIONS.lang || JSAV_OPTIONS.lang || "en").toLowerCase();
    var code_lang = (JSAV_EXERCISE_OPTIONS.code || JSAV_OPTIONS.code || args.default_code || '').toLowerCase();
    // Initialize the list of natural and programming languages to empty lists
    var langs = [],
      code_langs = [];
    // download the entire configuration file

    $.ajax({
      // Provide a complete relative path in order for sinatra to correclty locate and return a resource.
      url: TP.ODSAParams.problem_url + json_url,
      // url: "../../AV/Sorting/quicksortPRO.json",
      async: false,
      dataType: "json",
      success: function(data) {
        configurationFile = ODSA.UTILS.getJSON(data);

        // URL where the language information can be downloaded from
        var langUrl = '';

        // Obtain the translation data
        if (typeof configurationFile !== 'undefined' && configurationFile.hasOwnProperty('translations')) {
          var translation;

          if (typeof configurationFile.translations === "string") {
            // If 'translations' is a generic URL, replace the '{lang}' placeholder with the language we are trying to load
            langUrl = configurationFile.translations.replace('{lang}', lang);
          } else {
            // We assume 'translations' is an object
            // Save the keys in langs
            langs = Object.keys(configurationFile.translations);
            // If the preferred language doesn't exist in the translation file, default to English
            if (!configurationFile.translations.hasOwnProperty(lang)) {
              console.warn('Desired language (' + lang + ') does not exist, falling back to English');
              lang = 'en';
            }

            if (typeof configurationFile.translations[lang] === "object") {
              // If 'translations' is an object containing translations, we found the translation data
              translation = configurationFile.translations[lang];
            } else if (typeof configurationFile.translations[lang] === "string") {
              // Looks for a JSON file at the path (relative to the AV HTML file) specified in association with a given langauge
              langUrl = json_url.split("/");
              langUrl.pop();
              langUrl = langUrl.join("/");
              if (langUrl !== "") {
                langUrl += "/";
              }
              langUrl += configurationFile.translations[lang];
            }
          }

          // If langUrl is initialized, download the language data
          if (langUrl !== '') {
            // download the language object from the url
            var langData;

            // TODO: Add a failure condition that tries again with 'en' if translations is a string containing '{lang}'
            $.ajax({
              url: langUrl,
              async: false,
              dataType: "json",
              success: function(data) {
                langData = data;
              }
            });

            translation = langData;
          }

          // Initialize the interpreter object
          result.interpreter = JSAV.utils.getInterpreter(translation);

          // Update the language of text used in the AV
          if (typeof translation === 'undefined') {
            console.error('There is no translation support for language ' + JSAV_OPTIONS.lang);
          } else {
            var elem;
            for (var field in translation) {
              if (translation.hasOwnProperty(field) && field.indexOf("av_") !== 0) {
                elem = av_container.find(field);
                if (elem.size() > 0) {
                  if (elem.is('input')) {
                    elem.attr('value', translation[field]);
                  } else {
                    elem.html(translation[field]);
                  }
                }
              }
            }
          }
        } else {
          console.error('JSON language file does not contain a "translations" key.  Please make sure your JSON file follows the correct format.');
        }
        // Save a list of all the code languages and 'none' in the configuration file
        if (configurationFile && configurationFile.code) {
          code_langs = ['none'].concat(Object.keys(configurationFile.code));
        }
        // If code_lang is set to 'none' or the configuration file doesn't contain a 'code' object,
        // then disable code for the AV
        if (code_lang !== 'none' && typeof configurationFile !== 'undefined' && configurationFile.hasOwnProperty('code')) {
          // If the preferred code language does not exist in the translation
          // file, use the first language that does or print a warning if not code is provided
          if (!configurationFile.code.hasOwnProperty(code_lang)) {
            var keys = Object.keys(configurationFile.code);

            if (keys.length > 0) {
              if (code_lang !== '') {
                console.warn('Translation file (' + json_url + ') does not contain ' + code_lang + ' code, defaulting to ' + keys[0]);
              }
              code_lang = keys[0];
            } else {
              console.warn('Translation file (' + json_url + ') does not contain any code');
              code_lang = '';
            }
          }

          // If a code language is specified, read the code translation from the
          // configuration file
          if (code_lang !== '') {
            result.code = configurationFile.code[code_lang];
          }
        }

        /*
         * Add any default parameters defined in the config file to PARAMS
         * (and apply and JXOP- or JOP- parameters)
         *
         * NOTE: Will overwrite conflicting keys if they already exist in
         * PARAMS, but will not overwrite values set via URL parameters
         * This allows the config file to reset the default JXOP- or JOP-
         * settings defined in this file
         */
        var key, value;
        var query_string = JSAV.utils.getQueryParameter();

        if (configurationFile.hasOwnProperty('params')) {
          for (key in configurationFile.params) {
            // Allow the JSON exercise config file to set exercise defaults
            if (configurationFile.params.hasOwnProperty(key) && !query_string.hasOwnProperty(key)) {
              value = configurationFile.params[key];

              setJSAVOpt(key, value);
              PARAMS[key] = value;
            }
          }
        }
      },
      error: function(data) {
        data = ODSA.UTILS.getJSON(data);

        if (data.hasOwnProperty('status') && data.status === 200) {
          console.error('JSON language file is malformed. Please make sure your JSON is valid.');
        } else {
          console.error('Unable to load JSON language file (' + json_url + ')');
        }
      }
    });
    // helper function for creating natural/programming language selector for the JSAV settings
    // type should be either "lang" for natural language or "code_lang" for programming language
    function settingsSelector(type) {
      return function() {
        var options = {
          lang: {
            id: 'jsavsettings-language',
            label: 'language',
            param: 'JOP-lang='
          },
          code_lang: {
            id: 'jsavsettings-code',
            label: 'programming',
            param: 'JXOP-code='
          }
        };
        // helper function for capitalizing the first letter in a string
        function getLabel(string) {
          if (translations[string]) {
            return translations[string].language_name;
          }
          return string.charAt(0).toUpperCase() + string.slice(1);
        }
        // temporary translations
        var translations = {
          en: {
            language_name: 'English',
            language: 'Language:',
            programming: 'Programming language:'
          },
          fi: {
            language_name: 'Suomi',
            language: 'Kieli:',
            programming: 'Ohjelmointikieli:'
          },
          sv: {
            language_name: 'Svenska',
            language: 'Språk:',
            programming: 'Programmeringsspråk:'
          }
        };
        var opts = options[type] || options.lang,
          // The label 'Language'/'Programming Language' (translated if possible)
          label = (translations[lang] ? translations[lang] : translations.en)[opts.label],
          // the element we append to the JSAV settings window
          $elem = $('<div class="jsavrow">' +
            '<label for="' + opts.id + '">' + label + ' </label>' +
            '<select id="' + opts.id + '"></select></div>'),
          // the selector element
          $select = $elem.find('#' + opts.id),
          // the value options for the selector
          vals = (type === 'lang' ? langs : code_langs),
          // the currently selected value
          selected = (type === 'lang' ? lang : code_lang),
          // string with HTML option elements
          optElems = '';
        // add the options to optElems
        vals.forEach(function(val) {
          optElems += '<option value="' + val + '" ' + (val === selected ? 'selected' : '') + '>' +
            getLabel(val) + '</option>';
        });
        // append the options to the selector
        $select.append(optElems);
        // add change listener to the selector
        $select.change(function() {
          // get the url of the AV
          var url = window.location.href,
            // create a regular expression for finding the current URL key-value parameter pair
            regexp = new RegExp(opts.param + '[^&]*'),
            // value of the new URL key-value parameter pair
            newParameter = opts.param + $select.val();
          if (url.search(regexp) !== -1) {
            // the url parameter is in the current url -> replace it
            url = url.replace(regexp, newParameter);
          } else {
            // append the url parameter to the url
            var appendChar = (url.search(/\?/) === -1 ? '?' : '&');
            url += (appendChar + newParameter);
          }
          // reload the AV
          window.location.href = url;
        });
        // return the element to JSAV settings
        return $elem;
      };
    }
    // getSettings() will return a new JSAV Settings instance that has selectors for
    // natural and programming language if there are at least two choices available.
    result.getSettings = function() {
      var settings = new JSAV.utils.Settings($(".jsavsettings"));
      if (langs.length > 1) { // add a language selector to JSAV settings
        settings.add(settingsSelector('lang'));
      }
      if (code_langs.length > 1) { // add a programming language selector to JSAV settings
        settings.add(settingsSelector('code_lang'));
      }
      return settings;
    };
    return result;
  }


  //*****************************************************************************
  //***********                   Logging Functions                   ***********
  //*****************************************************************************

  /**
   * Checks the given JSON object to ensure it has the correct fields
   *     data - a JSON object representing an event
   */
  function isValidEvent(data) {
    // If av and uiid are not provided, give them default values
    if (typeof data.av === "undefined") {
      data.av = '';
    }
    if (typeof data.uiid === "undefined") {
      data.uiid = uiid;
    }

    var missingFields = [];

    if (typeof data.type === "undefined") {
      missingFields.push('type');
    }
    if (typeof data.desc === "undefined") {
      missingFields.push('desc');
    }

    if (missingFields.length > 0) {
      if (missingFields.length === 1) {
        console.warn("Invalid event, '" + missingFields[0] + "' is undefined");
      } else {
        console.warn("Invalid event, '" + missingFields.join(', ') + "' are undefined");
      }

      console.log(data);
      return false;
    }

    return true;
  }

  /**
   * Appends the given data to the event log
   * 'module_name' and 'tstamp' will be appended automatically by this function
   *
   *   data - A JSON string or object containing event data, must contain
   *          the following fields: 'av', 'type', 'desc', 'uiid'
   */
  function logEvent(data) {
    if (loggingServerEnabled()) {
      data = getJSON(data);

      // List of attributes the event data is required to have
      var reqAttrib = ['av', 'desc', 'module_name', 'steps_fixed', 'tstamp', 'type', 'uiid'];

      // Loop through all attributes and remove any unnecessary ones
      // (if the server will ignore them, no reason for us to store and send them)
      for (var prop in data) {
        if (data.hasOwnProperty(prop) && reqAttrib.indexOf(prop) === -1) {
          // Data has a property that the server will ignore, discard it
          delete data.prop;
        }
      }

      // Ensure given JSON data is a valid event
      if (!isValidEvent(data)) {
        console.warn('logEvent() error: Invalid event');
        console.log(data);
        return;
      }

      // Don't log events without either an AV name or a module name
      // Getting duplicates of some events where one is missing both
      // Currently all legitimate events should have one or the other
      if (data.av === "" && moduleName === "") {
        console.warn('Exercise name and moduleName cannot both be ""');
        return;
      }

      data.module = moduleName;
      // Store username and book ID with each event because all events will be grouped together, allowing any user to submit everyone's events to ensure we collect as much data as possible
      data.user = getUsername(); // TODO: Work with Eric to make sure the server recognizes the "guest" user
      data.book = getBookID();

      // Add a timestamp to the data
      if (data.tstamp) {
        // Convert existing JSAV timestamp from ISO format to milliseconds
        data.tstamp = new Date(data.tstamp).getTime();
      } else {
        data.tstamp = (new Date()).getTime();
      }

      // Convert the description field into a string so the server can handle it properly
      data.desc = JSON.stringify(data.desc); // TODO: Find out if the server can handle it as a JSON object rather than requiring a string

      // Store the event in localStorage
      // The random number is used to reduce the likelihood of collisions where multiple events get logged at the same time
      var rand = Math.floor(Math.random() * 101);
      localStorage[['event', data.tstamp, rand].join('-')] = JSON.stringify(data);
    }
  }

  /**
   * Logs a custom user interaction
   *     type - String identifying the type of action
   *     desc - Human-readable string describing the action
   *     exerName - Name of the exercise with which the action is associated
   *     eventUiid - A value that identifies a unique exercise instance, used to tie exercise events to a specific instance
   */
  function logUserAction(type, desc, exerName, eventUiid) {
    if (loggingServerEnabled()) {
      var eventData = {};
      eventData.type = type;
      eventData.desc = {
        'msg': desc
      };
      eventData.av = (exerName) ? exerName : settings.AV_NAME;
      eventData.uiid = (eventUiid) ? eventUiid : uiid;
      logEvent(eventData);
    }
  }

  /**
   * Sends the event data logged in localStorage to the server
   */
  function sendEventData() {
    if (loggingServerEnabled()) {
      var sessionKey = getSessionKey(),
        tstamp = (new Date()).getTime(),
        keysToPurge = [],
        eventList = [];

      // Loop through localStorage looking for any events that occurred before tstamp
      for (var key in localStorage) {
        // indexOf is used rather than startsWith because startsWith isn't supported in Chrome
        if (key.indexOf('event-') === 0 && parseInt(key.split('-')[1], 10) < tstamp) {
          // Keep track of which objects to remove if the AJAX message is successful
          keysToPurge.push(key);
          eventList.push(getJSON(localStorage[key]));
        }
      }

      // TODO: What about if the AJAX communication is successful, but the user closes the browser before the response returns and the values are removed - they will still be in local storage and they will be sent again

      // Return if there is no data to send
      if (eventList.length === 0) {
        return true;
      }

      // Send the data to the server
      jQuery.ajax({
        url: settings.LOGGING_SERVER + "/api/v1/user/exercise/avbutton/",
        type: "POST",
        data: JSON.stringify(eventList), // TODO: Work with Eric to get the server to accept the new format
        contentType: "application/json; charset=utf-8",
        datatype: "json",
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          data = getJSON(data);

          // Client successfully contacted the server, data was either successfully stored or rejected for being invalid, either way remove the events that were sent from localStorage
          for (var i in keysToPurge) {
            if (keysToPurge.hasOwnProperty(i)) {
              localStorage.removeItem(keysToPurge[i]);
            }
          }
        },
        error: function(data) {
          data = getJSON(data);

          if (data.status === 400) {
            // If status === 400 (Bad request) it means some of the data was rejected
            // by the server and that we should discard that data to prevent future failures
            console.group('Event data rejected by server');
            console.debug(JSON.stringify(eventList));
            console.groupEnd();

            for (var i in keysToPurge) {
              if (keysToPurge.hasOwnProperty(i)) {
                localStorage.removeItem(keysToPurge[i]);
              }
            }
          } else if (data.status === 401) {
            // Trigger event which will cause the expired session to be handled appropriately
            $('body').trigger('odsa-session-expired', [sessionKey]);
          } else {
            console.group("Error sending event data");
            console.debug(data);
            console.groupEnd();
          }
        }
      });
    }
  }

  /**
   * Default function to handle logging button clicks
   */
  function buttonLogger() {
    /*jslint validthis: true */
    if (loggingServerEnabled()) {
      var type = "",
        desc = "";

      if (this.id !== "") {
        type = this.type + "-" + this.id;
      } else {
        type = this.type;
        console.warn(this.value + " button does not have an ID");
      }

      // TODO: Find a better way to get the description for a button
      if (this.hasAttribute('data-desc')) {
        desc = this.getAttribute('data-desc');
      } else if (this.value !== "") {
        desc = this.value;
      } else if (this.id !== "") {
        desc = this.id;
      } else if (this.name !== "") {
        desc = this.name;
      }

      logUserAction(type, desc);
    }
  }

  /**
   * Default function to handle logging hyperlink clicks
   */
  function linkLogger() {
    /*jslint validthis: true */
    if (loggingServerEnabled()) {

      var type = "",
        desc = {
          href: this.href,
          text: $(this).html
        };

      if (settings.AV_NAME === "" && this.form) {
        settings.AV_NAME = this.form.id;
      }

      if (this.id !== "") {
        type = "hyperlink-" + this.id;
      } else {
        type = "hyperlink";
        console.warn("Link (" + this.href + ") does not have an ID");
      }

      // TODO: Find a better way to log links
      logUserAction(type, desc);
    }
  }


  //*****************************************************************************
  //*************                   INITIALIZATION                  *************
  //*****************************************************************************

  // Define the console object if it doesn't exist to support IE without developer tools
  if (!(window.console && console.log)) {
    console = {
      log: function() {},
      debug: function() {},
      info: function() {},
      warn: function() {},
      error: function() {}
    };
  }

  if (typeof JSAV_EXERCISE_OPTIONS === "undefined") {
    window.JSAV_EXERCISE_OPTIONS = {};
  }

  if (typeof window.JSAV_OPTIONS === "undefined") {
    window.JSAV_OPTIONS = {};
  }

  // Set default grading options for JSAV exercises (so that standalone or non-configured exercises use sensible options)
  JSAV_EXERCISE_OPTIONS.feedback = "continuous";
  JSAV_EXERCISE_OPTIONS.fixmode = "fix";

  parseURLParams();

  // Initialize applicable settings on embedded pages using URL parameters
  // The ODSA namespace is initialized in _static/config.js on module pages
  if (typeof ODSA === "undefined") {
    var odsaSettings = {};
    odsaSettings.BOOK_ID = PARAMS.book;
    odsaSettings.EXERCISE_SERVER = PARAMS.exerciseServer;
    odsaSettings.LOGGING_SERVER = PARAMS.loggingServer;
    odsaSettings.SCORE_SERVER = PARAMS.scoreServer;
    odsaSettings.MODULE_ORIGIN = PARAMS.moduleOrigin;
    odsaSettings.MODULE_NAME = PARAMS.module;

    // If MODULE_ORIGIN is not specified, assume they are on the same domain
    if (!odsaSettings.MODULE_ORIGIN) {
      odsaSettings.MODULE_ORIGIN = location.origin;
    }

    window.ODSA = {};
    window.ODSA.SETTINGS = odsaSettings;
  } else {
    // Only load translations on module pages (translations on loaded on
    // AVs using a different function)
    langDict = loadLangMod();
  }

  settings = ODSA.SETTINGS;

  // IMPORTANT: Uses parent.location so that the MODULE_ORIGIN doesn't have to be
  // specified in the config file in order for postMessage to work
  // Only works if module and exercises are hosted on the same domain
  // settings.MODULE_ORIGIN = parent.location.protocol + '//' + parent.location.host;
  settings.EXERCISE_ORIGIN = settings.MODULE_ORIGIN;
  settings.AV_ORIGIN = settings.MODULE_ORIGIN;

  /*
   * Constant storing the name of the AV that loaded this file
   * If this file is loaded on a module page, this value will remain ""
   * Otherwise, if loaded on an AV page, this value will be initialized in odsaAV.js
   */
  settings.AV_NAME = '';
  /*
   * IMPORTANT: Special case for local testing. If the page is accessed
   * via the loopback address, set the MODULE_ORIGIN, AV_ORIGIN, and
   * EXERCISE_ORIGIN to the loopback origin
   */
  if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
    settings.MODULE_ORIGIN = settings.AV_ORIGIN = settings.EXERCISE_ORIGIN = location.origin;
  }
  /*
   * Makes sure ODSA.SETTINGS.MODULE_NAME is initialized
   *
   * IMPORTANT: Must be done before document.ready() so that the value
   * can be used by logging functions called by AV initialize() methods
   * that are run before document.ready()
   */
  settings.MODULE_NAME = (settings.hasOwnProperty('MODULE_NAME')) ? settings.MODULE_NAME : '';
  moduleName = settings.MODULE_NAME;

  // Provide a warning if HTTPS is not used for communication with the backend
  if (scoringServerEnabled() && !settings.SCORE_SERVER.match(/^https:/)) {
    console.warn('Score server communication should use HTTPS');
  }

  $(document).ready(function() {
    // Ensure moduleName has been initialized
    // IMPORTANT: Might have to be initialized here because
    // ODSA.SETTINGS.MODULE_NAME is contained within the HTML of modules pages
    moduleName = settings.MODULE_NAME;

    // Make sure localStorage is enabled
    var localStorageEnabled = function() {
      var enabled, uid = +new Date();
      try {
        localStorage[uid] = uid;
        enabled = (localStorage[uid] === uid);
        localStorage.removeItem(uid);
        return enabled;
      } catch (e) {
        return false;
      }
    };

    if (!localStorageEnabled) {
      if (jQuery) {
        warn("You must enable DOM storage in your browser.", false);
      }
      return;
    }

    // Add buttonLogger to all buttons on the page
    $(':button').each(function(index, item) {
      // Don't attach handler to JSAV managed controls in order to prevent double logging
      if (!isJSAVControl(item)) {
        $(item).click(buttonLogger);
      }
    });

    // Add linkLogger to all links on the page
    $('a').each(function(index, item) {
      // Don't attach handler to JSAV managed controls in order to prevent double logging
      if (!isJSAVControl(item) && $(item).attr("id") !== "logon" && $(item).attr("class") !== "close") {
        $(item).click(linkLogger);
      }
    });
  });

  //*****************************************************************************
  //***********            Creates global ODSA.UTILS object           ***********
  //*****************************************************************************

  // Add publically available functions to a globally accessible ODSA.UTILS object
  var odsaUtils = {};
  odsaUtils.langDict = langDict;
  odsaUtils.getBookID = getBookID;
  odsaUtils.getBookURL = getBookURL;
  odsaUtils.getUsername = getUsername;
  odsaUtils.getSessionKey = getSessionKey;
  odsaUtils.clearSession = clearSession;
  odsaUtils.userLoggedIn = userLoggedIn;
  odsaUtils.scoringServerEnabled = scoringServerEnabled;
  odsaUtils.getJSON = getJSON;
  odsaUtils.permute = permute;
  odsaUtils.loadConfig = loadConfig;
  odsaUtils.logUserAction = logUserAction;
  odsaUtils.logEvent = logEvent;
  odsaUtils.sendEventData = sendEventData;
  odsaUtils.roundPercent = roundPercent;
  odsaUtils.getType = getType;
  odsaUtils.parseURLParams = parseURLParams;
  odsaUtils.discardEvents = ["jsav-init", "jsav-recorded", "jsav-exercise-init", "jsav-exercise-model-init", "jsav-exercise-model-recorded"];
  odsaUtils.ssEvents = ['jsav-forward', 'jsav-backward', 'jsav-begin', 'jsav-end', 'jsav-exercise-model-forward', 'jsav-exercise-model-backward', 'jsav-exercise-model-begin', 'jsav-exercise-model-end'];
  window.ODSA.UTILS = odsaUtils;


  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /*  SHA-1 implementation in JavaScript | (c) Chris Veness 2002-2010 | www.movable-type.co.uk      */
  /*   - see http://csrc.nist.gov/groups/ST/toolkit/secure_hashing.html                             */
  /*         http://csrc.nist.gov/groups/ST/toolkit/examples.html                                   */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  var Sha1 = {}; // Sha1 namespace

  /**
   * Generates SHA-1 hash of string
   *
   * @param {String} msg                String to be hashed
   * @param {Boolean} [utf8encode=true] Encode msg as UTF-8 before generating hash
   * @returns {String}                  Hash of msg as hex character string
   */
  Sha1.hash = function(msg, utf8encode) {
    /*jslint bitwise: true */
    utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;

    // convert string to UTF-8, as SHA only deals with byte-streams
    if (utf8encode) {
      msg = Utf8.encode(msg);
    }

    // constants [section 4.2.1]
    var K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];

    // PREPROCESSING

    msg += String.fromCharCode(0x80); // add trailing '1' bit (+ 0's padding) to string [section 5.1.1]

    // convert string msg into 512-bit/16-integer blocks arrays of ints [section 5.2.1]
    var l = msg.length / 4 + 2; // length (in 32-bit integers) of msg + '1' + appended length
    var N = Math.ceil(l / 16); // number of 16-integer-blocks required to hold 'l' ints
    var M = new Array(N);

    for (var i = 0; i < N; i++) {
      M[i] = new Array(16);
      for (var j = 0; j < 16; j++) { // encode 4 chars per integer, big-endian encoding
        M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
          (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
      } // note running off the end of msg is ok 'cos bitwise ops on NaN return 0
    }
    // add length (in bits) into final pair of 32-bit integers (big-endian) [section 5.1.1]
    // note: most significant word would be (len-1)*8 >>> 32, but since JS converts
    // bitwise-op args to 32 bits, we need to simulate this by arithmetic operators
    M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
    M[N - 1][14] = Math.floor(M[N - 1][14]);
    M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;

    // set initial hash value [section 5.3.1]
    var H0 = 0x67452301;
    var H1 = 0xefcdab89;
    var H2 = 0x98badcfe;
    var H3 = 0x10325476;
    var H4 = 0xc3d2e1f0;

    // HASH COMPUTATION [section 6.1.2]

    var W = new Array(80);
    var a,
      b,
      c,
      d,
      e;

    for (i = 0; i < N; i++) {
      // 1 - prepare message schedule 'W'
      for (var t = 0; t < 16; t++) {
        W[t] = M[i][t];
      }
      for (t = 16; t < 80; t++) {
        W[t] = Sha1.ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
      }

      // 2 - initialise five working variables a, b, c, d, e with previous hash value
      a = H0;
      b = H1;
      c = H2;
      d = H3;
      e = H4;

      // 3 - main loop
      for (t = 0; t < 80; t++) {
        var s = Math.floor(t / 20); // seq for blocks of 'f' functions and 'K' constants
        var T = (Sha1.ROTL(a, 5) + Sha1.f(s, b, c, d) + e + K[s] + W[t]) & 0xffffffff;
        e = d;
        d = c;
        c = Sha1.ROTL(b, 30);
        b = a;
        a = T;
      }

      // 4 - compute the new intermediate hash value
      H0 = (H0 + a) & 0xffffffff; // note 'addition modulo 2^32'
      H1 = (H1 + b) & 0xffffffff;
      H2 = (H2 + c) & 0xffffffff;
      H3 = (H3 + d) & 0xffffffff;
      H4 = (H4 + e) & 0xffffffff;
    }

    return Sha1.toHexStr(H0) + Sha1.toHexStr(H1) +
      Sha1.toHexStr(H2) + Sha1.toHexStr(H3) + Sha1.toHexStr(H4);
  };

  //
  // function 'f' [section 4.1.1]
  //
  Sha1.f = function(s, x, y, z) {
    /*jslint bitwise: true */
    switch (s) {
      case 0:
        return (x & y) ^ (~x & z); // Ch()
      case 1:
        return x ^ y ^ z; // Parity()
      case 2:
        return (x & y) ^ (x & z) ^ (y & z); // Maj()
      case 3:
        return x ^ y ^ z; // Parity()
    }
  };

  //
  // rotate left (circular left shift) value x by n positions [section 3.2.5]
  //
  Sha1.ROTL = function(x, n) {
    /*jslint bitwise: true */
    return (x << n) | (x >>> (32 - n));
  };

  //
  // hexadecimal representation of a number
  //   (note toString(16) is implementation-dependant, and
  //   in IE returns signed numbers when used on full words)
  //
  Sha1.toHexStr = function(n) {
    /*jslint bitwise: true */
    var s = "",
      v;
    for (var i = 7; i >= 0; i--) {
      v = (n >>> (i * 4)) & 0xf;
      s += v.toString(16);
    }
    return s;
  };


  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
  /*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
  /*              single-byte character encoding (c) Chris Veness 2002-2010                         */
  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

  var Utf8 = {}; // Utf8 namespace

  /**
   * Encode multi-byte Unicode string into utf-8 multiple single-byte characters
   * (BMP / basic multilingual plane only)
   *
   * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
   *
   * @param {String} strUni Unicode string to be encoded as UTF-8
   * @returns {String} encoded string
   */
  Utf8.encode = function(strUni) {
    /*jslint bitwise: true */
    // use regular expressions & String.replace callback function for better efficiency
    // than procedural approaches
    var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g, // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function(c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
      }
    );
    strUtf = strUtf.replace(
      /[\u0800-\uffff]/g, // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function(c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
      }
    );
    return strUtf;
  };

  /**
   * Decode utf-8 encoded string back into multi-byte Unicode characters
   *
   * @param {String} strUtf UTF-8 string to be decoded back to Unicode
   * @returns {String} decoded string
   */
  Utf8.decode = function(strUtf) {
    /*jslint bitwise: true */
    // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
    var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, // 3-byte chars
      function(c) { // (note parentheses for precence)
        var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
        return String.fromCharCode(cc);
      }
    );
    strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g, // 2-byte chars
      function(c) { // (note parentheses for precence)
        var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
        return String.fromCharCode(cc);
      }
    );
    return strUni;
  };

  /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
}(jQuery));