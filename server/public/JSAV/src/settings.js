/**
* Module that contains the configurable settings panel implementation
* Depends on core.js, utils.js, trasnlations.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }
  var speedChoices = [5000, 3000, 1500, 1000, 500, 400, 300, 200, 100, 50];
  var getSpeedChoice = function(speedVal) {
    var curval = speedChoices.length - 1;
    while (curval && speedChoices[curval] < speedVal) {
      curval--;
    }
    return curval + 1;
  };
  var speedSetting = function(settings) {
    return function() {
      var translate;
      if (settings.jsav) {
        translate = settings.jsav._translate;
      } else {
        var lang = "en";
        if (window.JSAV_OPTIONS &&
            window.JSAV_OPTIONS.lang &&
            typeof JSAV._translations[window.JSAV_OPTIONS.lang] === "object")
        {
          lang = window.JSAV_OPTIONS.lang;
        }
        translate = JSAV.utils.getInterpreter(JSAV._translations, lang);
      }
      var curSpeed = JSAV.ext.SPEED;
      var rangeSupported = !!$.support.inputTypeRange;
      // get the closest speed choice to the current speed
      var curval = getSpeedChoice(curSpeed);
      // add explanation if using range slider, help text otherwise
      var $elem = $('<div class="jsavrow">' + translate("animationSpeed") + (rangeSupported?' ' + translate("(slowFast)"):'') +
          ': <input type="range" min="1" max="10" step="1" size="30" value="' + curval + '"/> ' +
          (rangeSupported?'':'<button>' + translate("save") + '</button><div class="jsavhelp">' + translate("valueBetween1And10")) +
          '</div>');
      // event handler function for storing the speed
      var speedChangeHandler = function() {
        var speed = parseInt($(this).val(), 10);
        if (isNaN(speed) || speed < 1 || speed > 10) { return; }
        speed = speedChoices[speed - 1]; // speed in milliseconds
        curSpeed = speed;
        JSAV.ext.SPEED = speed;
        //trigger speed change event to update all AVs on the page
        $(document).trigger("jsav-speed-change", speed);
        if (localStorage) {
          localStorage.setItem("jsav-speed", speed);
        }
      };
      // set the value and add a change event listener
      var $inputElem = $elem.find("input").val(curval);
      if (rangeSupported) {
        $inputElem.change(speedChangeHandler);
      } else {
        $elem.find("button").click(function() {
          speedChangeHandler.call($inputElem);
          var savedElem = $("<span>" + translate("saved") + "</span>");
          setTimeout(function() { savedElem.fadeOut(); }, 1000);
          $(this).after(savedElem);
        });
      }

      // return the element
      return $elem;
    };
  };
  
  /* Creates an input component to be used in the settings panel. varname should be unique
    within the document. Options can specify the label of the component, in which case
    a label element is created. Option value specifies the default value of the element.
    Every other option will be set as an attribute of the input element. */
  var createInputComponent = function(varname, options) {
    var label,
        opts = $.extend({"type": "text"}, options),
        input = $('<input id="jsavsettings-' + varname + '" type="' +
          opts.type + '"/>');
    if ('label' in opts) {
      label = $('<label for="jsavsettings-' + varname + '">' + opts.label + "</label>");
    }
    if ('value' in opts) {
      input.val(opts.value);
    }
    for (var attr in opts) {
      if (['label', 'value', 'type'].indexOf(attr) === -1) {
        input.attr(attr, opts[attr]);
      }
    }
    return $('<div class="jsavrow"/>').append(label).append(input);
  };
  
  /* Creates a select component to be used in the settings panel. varname should be unique
    within the document. Options can specify the label of the component, in which case
    a label element is created. Option value specifies the default value of the element.
    Option options should be a map where every key-value pair will make for an option element
    in the form. Every other option will be set as an attribute of the input element. */
  var createSelectComponent = function(varname, options) {
    var label,
        select = $('<select id="jsavsettings-' + varname + '" />');
    if ('label' in options) {
      label = $('<label for="jsavsettings-' + varname + '">' + options.label + "</label>");
    }
    var opts = options.options;
    for (var key in opts) {
      if (opts.hasOwnProperty(key)) {
        select.append('<option value="' + key + '">' + opts[key] + '</option>');
      }
    }
    if ('value' in options) {
      select.val(options.value);
    }
    var toCheck = ['label', 'value', 'options', 'type'];
    for (var attr in options) {
      if ($.inArray(attr, toCheck) === -1) {
        select.attr(attr, options[attr]);
      }
    }
    return $('<div class="jsavrow"/>').append(label).append(select);
  };
  
  var Settings = function(elem) {
      this.components = [];
      this.add(speedSetting(this));
      
      var that = this;
      if (elem) {
        $(elem).click(function(e) {
          e.preventDefault();
          that.show();
        });
      }
    },
    sproto = Settings.prototype;
  sproto.show = function() {
    var $cont = $("<div class='jsavsettings'></div>");
    for (var i = 0; i < this.components.length; i++) {
      $cont.append(this.components[i]);
    }
    // append the JSAV version to the settings dialog
    $cont.append("<span class='jsavversion'>" + JSAV.version() + "</span>");
    
    var translate;
    if (this.jsav) {
      translate = this.jsav._translate;
    } else {
      var lang = "en";
      if (window.JSAV_OPTIONS &&
          window.JSAV_OPTIONS.lang &&
          typeof JSAV._translations[window.JSAV_OPTIONS.lang] === "object")
      {
        lang = window.JSAV_OPTIONS.lang;
      }
      translate = JSAV.utils.getInterpreter(JSAV._translations, lang);
    }
    var title = translate("settings");
    this.dialog = JSAV.utils.dialog($cont, {title: title});
  };
  sproto.close = function() {
    if (this.dialog) {
      this.dialog.close();
    }
  };
  sproto.add = function(create, options) {
    if ($.isFunction(create)) {
      // create is a function that returns a DOM Element or jQuery object or HTML string
      this.components.push(create);
    } else {
      // create is a name of a variable
      if (!('type' in options)) {
        return;
      }
      var elem, func;
      if (options.type === 'select') {
        func = createSelectComponent;
      } else {
        func = createInputComponent;
      }
      elem = func(create, options);
      this.components.push(elem);
      return elem.find("input, select");
    }
  };
  JSAV.utils.Settings = Settings;
  JSAV.init(function() {
    if (this.options.settings) {
      this.settings = this.options.settings;
    } else {
      this.settings = new Settings($(this.container).find(".jsavsettings").show());
    }
    // set a reference to the JSAV instance for translation support
    this.settings.jsav = this;
  });
}(jQuery));