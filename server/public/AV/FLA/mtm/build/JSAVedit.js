/*!
 * JSAV - JavaScript Algorithm Visualization Library
 * Version v1.0.1-6-gea2e525
 * Copyright (c) 2011-2015 by Ville Karavirta and Cliff Shaffer
 * Released under the MIT license.
 */

/**
* Module that contains JSAV core.
*/
/*global JSAV, jQuery, Raphael */
(function($) {
  "use strict";
  var JSAV = function() {
    create.apply(this, arguments);
  };
  JSAV.position = function(elem) {
    var $el = $(elem),
      offset = $el.position(),
      translate = null;//$el.css("transform").translate; // requires jquery.transform.light.js!!
    if (translate) {
      return {left: offset.left + translate[0], top: offset.top + translate[1]};
    } else { return offset; }
  };
  var jsavproto = JSAV.prototype;
  jsavproto.getSvg = function() {
    if (!this.svg) { // lazily create the SVG overlay only when needed
      this.svg = Raphael(this.canvas[0]);
//      this.svg.renderfix();
      var style = this.svg.canvas.style;
      style.position = "absolute";
    }
    return this.svg;
  };
  jsavproto.id = function() {
    var id = this.container[0].id;
    if (!id) {
      id = JSAV.utils.createUUID();
      this.container[0].id = id;
    }
    return id;
  };
  jsavproto.clear = function() {
    // clear the container and find the new ref to canvas
    this.container.html(this._initialHTML);
    this.canvas = this.container.find(".jsavcanvas");
  };
  JSAV._types = {}; // for exposing types of JSAV for customization
  JSAV.ext = {}; // for extensions
  JSAV.init = function(f) { // for initialization functions
    JSAV.init.functions.push(f);
  };
  JSAV.init.functions = [];
  
  var create = function() {
    // this will point to a newly-created JSAV instance
    if (typeof arguments[0] === "string") {
      this.container = $(document.getElementById(arguments[0]));
    } else if (arguments[0] instanceof HTMLElement) {
      this.container = $(arguments[0]); // make sure it is jQuery object
    } else if (arguments[0] && typeof arguments[0] === "object" && arguments[0].constructor === jQuery) {
      this.container = arguments[0];
    }

    var defaultOptions = $.extend({
      autoresize: true,
      scroll: true
    }, window.JSAV_OPTIONS);
    // if the container was set based on the first argument, options are the second arg
    if (this.container) {
      this.options = $.extend(defaultOptions, arguments[1]);
    } else { // otherwise assume the first argument is options (if exists)
      this.options = $.extend(defaultOptions, arguments[0]);
      // set the element option as the container
      this.container = $(this.options.element);
    }

    // initialHTML will be logged as jsav-init, this._initialHTML used in clear
    var initialHTML = this.container.clone().wrap("<p/>").parent().html();
    this._initialHTML = this.container.html();

    this.container.addClass("jsavcontainer");
    this.canvas = this.container.find(".jsavcanvas");
    if (this.canvas.size() === 0) {
      this.canvas = $("<div />").addClass("jsavcanvas").appendTo(this.container);
    }
    // element used to block events when animating
    var shutter = $("<div class='jsavshutter' />").appendTo(this.container);
    this._shutter = shutter;

    this.RECORD = true;
    jQuery.fx.off = true; // by default we are recording changes, not animating them
    // initialize stuff from init namespace
    initializations(this, this.options);
    // add all plugins from ext namespace
    extensions(this, this, JSAV.ext);

    this.logEvent({ type: "jsav-init", initialHTML: initialHTML });
  };
  function initializations(jsav, options) {
    var fs = JSAV.init.functions;
    for (var i = 0; i < fs.length; i++) {
      if ($.isFunction(fs[i])) {
        fs[i].call(jsav, options);
      }
    }
  }
  function extensions(jsav, con, add) {
    for (var prop in add) {
      if (add.hasOwnProperty(prop) && !(prop in con)) {
        switch (typeof add[prop]) {
        case "function":
          (function (f) {
            con[prop] = con === jsav ? f : function () { return f.apply(jsav, arguments); };
          }(add[prop]));
          break;
        case "object":
          con[prop] = con[prop] || {};
          extensions(jsav, con[prop], add[prop]);
          break;
        default:
          con[prop] = add[prop];
          break;
        }
      }
    }
  }

  // register a handler for autoresizing the jsavcanvas
  JSAV.init(function() {
    // in a JSAV init function, this will be the just-created JSAV instance
    if (this.options.autoresize) {
      var that = this;
      // register event handler for jsav-updaterelative which is triggered on each step
      this.container.on("jsav-updaterelative", function() {
        // collect max top and left positions of all JSAV objects
        var maxTop = parseInt(that.canvas.css("minHeight"), 10),
            maxLeft = parseInt(that.canvas.css("minWidth"), 10);

        // go through all elements inside jsavcanvas
        that.canvas.children().each(function(index, item) {
          var $item = $(item),
              itemPos = $item.position();
          // ignore SVG, since it will be handled differently since it's sized 100%x100%
          if (item.nodeName.toLowerCase() !== "svg") {
            maxTop = Math.max(maxTop, itemPos.top + $item.outerHeight(true));
            maxLeft = Math.max(maxLeft, itemPos.left + $item.outerWidth(true));
          }
        });
        if (that.svg) { // handling of SVG
          var curr = that.svg.bottom, // start from the element in the behind
              bbox, strokeWidth;
          while (curr) { // iterate all SVG objects in Raphael
            bbox = curr.getBBox();
            strokeWidth = curr.attr("stroke-width");
            maxTop = Math.max(maxTop, bbox.y2 + strokeWidth);
            maxLeft = Math.max(maxLeft, bbox.x2 + strokeWidth);
            curr = curr.next;
          }
        }
        // limit minWidth to parent width if scroll is set to true
        if (that.options.scroll) {
          var parentWidth = that.canvas.parent().width();
          maxLeft = Math.min(maxLeft, parentWidth);
        }
        // set minheight and minwidth on the jsavcanvas element
        that.canvas.css({"minHeight": maxTop, "minWidth": maxLeft});
      });
    }
  }); // end autoresize handler

  if (window) {
    window.JSAV = JSAV;
  }
}(jQuery));
/**
* Module that contains the translation implementation.
* Depends on core.js, utils.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  JSAV._translations = {
    "en": {
      // animation control button titles
      "backwardButtonTitle": "Backward",
      "forwardButtonTitle": "Forward",
      "beginButtonTitle": "Begin",
      "endButtonTitle": "End",

      "resetButtonTitle": "Reset",
      "undoButtonTitle": "Undo",
      "modelButtonTitle": "Model Answer",
      "gradeButtonTitle": "Grade",

      "modelWindowTitle": "Model Answer",

      "feedbackLabel":"Grading Mode: ",
      "continuous": "Continuous",
      "atend": "At end",

      "fixLabel": "Continuous feedback behaviour",
      "undo": "Undo incorrect step",
      "fix": "Fix incorrect step",

      "scoreLabel": "Score:",
      "remainingLabel": "Points remaining:",
      "lostLabel": "Points lost:",
      "doneLabel": "DONE",

      "yourScore": "Your score:",
      "fixedSteps": "Fixed incorrect steps:",

      "fixedPopup": "Your last step was incorrect. Your work has been replaced with the correct step so that you can continue.",
      "fixFailedPopup": "Your last step was incorrect and I should fix your solution, but don't know how. So it was undone and you can try again.",
      "undonePopup": "Your last step was incorrect. Things are reset to the beginning of the step so that you can try again.",

      "settings": "Settings",
      "animationSpeed" : "Animation speed",
      "(slowFast)": "(slow - fast)",
      "valueBetween1And10": "Value between 1 (Slow) and 10 (Fast).",
      "save": "Save",
      "saved": "Saved...",

      "questionClose": "Close",
      "questionCheck": "Check Answer",
      "questionCorrect": "Correct!",
      "questionIncorrect": "Incorrect"
    },
    "fi": {
      "backwardButtonTitle": "Askel taaksepäin",
      "forwardButtonTitle": "Askel eteenpäin",
      "beginButtonTitle": "Kelaa alkuun",
      "endButtonTitle": "Kelaa loppuun",

      "resetButtonTitle": "Uudelleen",
      "undoButtonTitle": "Kumoa",
      "modelButtonTitle": "Mallivastaus",
      "gradeButtonTitle": "Arvostele",

      "modelWindowTitle": "Mallivastaus",

      "feedbackLabel":"Arvostelumuoto: ",
      "continuous": "Jatkuva",
      "atend": "Lopussa",

      "fixLabel": "Jatkuvan arvostelun asetukset",
      "undo": "Kumoa väärin menneet askeleet",
      "fix": "Korjaa väärin menneet askeleet",

      "scoreLabel": "Pisteet:",
      "remainingLabel": "Pisteitä jäljellä:",
      "lostLabel": "Menetetyt pisteet:",
      "doneLabel": "VALMIS",

      "yourScore": "Sinun pisteesi:",
      "fixedSteps": "Korjatut askeleet:",

      "fixedPopup": "Viime askeleesi meni väärin. Se on korjattu puolestasi, niin että voit jatkaa tehtävää.",
      "fixFailedPopup": "Viime askeleesi meni väärin ja minun tulisi korjata se. En kuitenkaan osaa korjata sitä, joten olen vain kumonnut sen.",
      "undonePopup": "Viime askeleesi meni väärin. Askel on kumottu, niin että voit yrittää uudelleen.",

      "settings": "Asetukset",
      "animationSpeed" : "Animointinopeus",
      "(slowFast)": "(hidas - nopea)",
      "valueBetween1And10": "Anna arvo 1:n (hidas) ja 10:n (nopea) välillä.",
      "save": "Tallenna",
      "saved": "Tallennettu...",

      "questionClose": "Sulje",
      "questionCheck": "Tarkista vastaus",
      "questionCorrect": "Oikein!",
      "questionIncorrect": "Väärin"

    },
    "sv": {
      "resetButtonTitle": "Börja om",
      "undoButtonTitle": "Ångra",
      "modelButtonTitle": "Visa lösning",
      "gradeButtonTitle": "Poängsätt",

      "modelWindowTitle": "Lösning",

      "feedbackLabel":"Rättningsalternativ: ",
      "continuous": "Rätta kontinuerligt",
      "atend": "Poängsätt i slutet",

      "fixLabel": "Alternativ för kontinuerlig rättning",
      "undo": "Ångra felaktigt steg",
      "fix": "Åtgärda felaktigt steg",

      "scoreLabel": "Poäng:",
      "remainingLabel": "Kvarvarande poäng:",
      "lostLabel": "Förlorade poäng:",
      "doneLabel": "FÄRDIG!",

      "yourScore": "Din poäng:",
      "fixedSteps": "Åtgärdade felaktiga steg:",

      "fixedPopup": "Ditt senaste steg var felaktigt. Det har ersatts med det korrekta steget så att du kan fortsätta.",
      "fixFailedPopup": "Ditt senaste steg var felaktigt men jag vet inte hur det bör åtgärdas. Därför har ditt steg ångrats och du kan försöka igen.",
      "undonePopup": "Ditt senaste steg var felaktigt. Steget har ångrats så att du kan försöka igen.",

      "settings": "Inställningar",
      "animationSpeed" : "Animationshastighet",
      "(slowFast)": "(långsamt - snabbt)",
      "valueBetween1And10": "Värde mellan 1 (långsamt) och 10 (snabbt).",
      "save": "Spara",
      "saved": "Sparat..."
    },
    "fr": {
      "resetButtonTitle": "Reinitialiser",
      "undoButtonTitle": "Annuler",
      "modelButtonTitle": "Solution",
      "gradeButtonTitle": "Score",

      "modelWindowTitle": "Solution",

      "feedbackLabel":"Type de controle: ",
      "continuous": "Continue",
      "atend": "A la fin",

      "fixLabel": "Parametres de controle continue",
      "undo": "Annuler les étapes incorrectes",
      "fix": "Corriger les étapes incorrectes",

      "scoreLabel": "Score:",
      "remainingLabel": "Points restants:",
      "lostLabel": "Points perdus:",
      "doneLabel": "Activite terminée",

      "yourScore": "Votre score:",
      "fixedSteps": "Corriger les étapes incorrectes:",

      "fixedPopup": "Votre dernière action etait incorrecte. Votre action a été corrigée pour vous permettre de poursuivre.",
      "fixFailedPopup": "Votre dernière action etait incorrecte et je ne sais pas comment la corriger. Votre action a ete annulée, essayez a nouveau.",
      "undonePopup": "Votre dernière action etait incorrecte. La simulation a été reinitialisée. Essayez a nouveau.",

      "settings": "Paramètres",
      "animationSpeed" : "Vitesse",
      "(slowFast)": "(lent - rapide)",
      "valueBetween1And10": "Vitesse entre 1 (Lent) et 10 (Rapide).",
      "save": "Sauvegarder",
      "saved": "Sauvegarde complète..."
    }
  };

  JSAV.init(function (options) {
    var language = options.lang || "en";
    if (typeof JSAV._translations[language] === "object") {
      this._translate = JSAV.utils.getInterpreter(JSAV._translations, language);
    } else {
      this._translate = JSAV.utils.getInterpreter(JSAV._translations, "en");
    }
  });

}(jQuery));

/**
* Module that contains the animator implementations.
* Depends on core.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";

  var DEFAULT_SPEED = 300,
      playingCl = "jsavplaying"; // class used to mark controls when playing


  if (typeof JSAV === "undefined") { return; }

  var AnimatableOperation = function(opts) {
    this.obj = opts.obj;
    this.effect = opts.effect;
    this.args = opts.args;
    if (opts.undo) {
      this.undoeffect = opts.undo;
    }
    if (opts.undoargs) {
      this.undoArgs = opts.undoargs;
    }
  };
  AnimatableOperation.prototype.apply = function() {
    var self = this;
    var obj = self.obj,
      state = obj.state?obj.state():null;
    var retVal = this.effect.apply(this.obj, this.args);
    if (typeof retVal === "undefined" || retVal === this.obj) {
      if (typeof this.undoeffect === "undefined" || !$.isFunction(this.undoeffect)) {
        this.undoeffect = (function() {
          return function() { // we create one that will set the state of obj to its current state
            obj.state(state);
          };
        }());
      }
    } else {
      this.undoArgs = retVal;
    }
  };
  AnimatableOperation.prototype.undo = function() {
    if (typeof this.undoArgs === "undefined") {
      this.undoeffect.apply(this.obj, this.args);
    } else {
      this.effect.apply(this.obj, this.undoArgs);
    }
  };

  var AnimStep = function(options) {
    this.operations = [];
    this.options = options || {};
  };
  AnimStep.prototype.add = function(oper) {
    this.operations.push(oper);
  };
  AnimStep.prototype.isEmpty = function() {
    return this.operations.length === 0;
  };

  function backward(filter) {
    if (this._undo.length === 0) { return; }
    var step = this._undo.pop();
    var ops = step.operations; // get the operations in the step we're about to undo
    for (var i = ops.length - 1; i >= 0; i--) { // iterate the operations
      // operation contains: [target object, effect function, arguments, undo function]
      var prev = ops[i];
      prev.undo();
    }
    this._redo.unshift(step);
    // if a filter function is given, check if this step matches
    // if not, continue moving backward
    if (filter && $.isFunction(filter) && !filter(step)) {
      this.backward(filter);
    }
    // trigger an event on the container to update the counter
    this.container.trigger("jsav-updatecounter", [this.currentStep() + 1, this.totalSteps() + 1]);
    return step;
  }

  function forward() {
    if (this._redo.length === 0) { return; }
    var step = this._redo.shift();
    var ops = step.operations; // get the operations in the step we're about to undo
    for (var i = 0; i < ops.length; i++) {
      var next = ops[i];
      next.apply();
    }
    this._undo.push(step);
    // trigger an event on the container to update the counter
    this.container.trigger("jsav-updatecounter", [this.currentStep() + 1, this.totalSteps() + 1]);
    return step; // return the just applied step
  }

  function begin() {
    var oldFx = $.fx.off || false;
    $.fx.off = true;
    while (this._undo.length) {
      this.backward();
    }
    $.fx.off = oldFx;
    return this;
  }
  
  function end() {
    var oldFx = $.fx.off || false;
    $.fx.off = true;
    while (this._redo.length) {
      this.forward();
    }
    $.fx.off = oldFx;
    return this;
  }
  

  JSAV.init(function() {
    this._animations = 0;
    this._redo = []; // stack for operations to redo
    this._undo = []; // stack for operations to undo
    var that = this,
        $controls = $(".jsavcontrols", this.container);

    function logAnimEvent(action) {
      var eventData = {
        "type": action,
        "currentStep": that.currentStep(),
        "totalSteps": that.totalSteps()
      };
      that.logEvent(eventData);
    }

    // set a timer to remove the class indicating animation playing
    // once the animation is completed. optional callback function that
    // will be called once done.
    function clearPlayingTimeout(jsav, callback) {
      var timerid;
      var timeouter = function() {
        if (!jsav.isAnimating()) {
          jsav.container.removeClass(playingCl);
          jsav._animations = 0;
          if ($.isFunction(callback)) {
            callback();
          }
          clearInterval(timerid);
        }
      };
      timerid = setInterval(timeouter, 50);
    }

    // function for clearing the playing flag
    this._clearPlaying = function clearPlaying(callback) {
      if (this.isAnimating()) {
        clearPlayingTimeout(this, callback);
      } else {
        this.container.removeClass(playingCl);
        if ($.isFunction(callback)) {
          callback();
        }
      }
    };
    // reqister event handlers for the control buttons
    var beginHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      // if playing flag is set, don't respond
      if (that.container.hasClass(playingCl)) { return; }
      // set the playing flag, that is, a class on the controls
      that.container.addClass(playingCl);
      that.begin(); // go to beginning
      that._clearPlaying(); // clear the flag
      // log the event
      logAnimEvent("jsav-begin");
    };
    var backwardHandler = function(e, filter) {
      e.preventDefault();
      e.stopPropagation();
      e.stopPropagation();
      if (that.container.hasClass(playingCl)) { return; }
      that.container.addClass(playingCl);
      that.backward(filter);
      // clear playing flag after a timeout for animations to end
      that._clearPlaying();
      // log the event
      logAnimEvent("jsav-backward");
    };
    var forwardHandler = function(e, filter) {
      e.preventDefault();
      e.stopPropagation();
      if (that.container.hasClass(playingCl)) { return; }
      that.container.addClass(playingCl);
      that.forward(filter);
      that._clearPlaying();
      // log the event
      logAnimEvent("jsav-forward");
    };
    var endHandler = function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (that.container.hasClass(playingCl)) { return; }
      that.container.addClass(playingCl);
      that.end();
      that._clearPlaying();
      // log the event
      logAnimEvent("jsav-end");
    };
    if ($controls.size() !== 0) {
      var tmpTranslation = this._translate("beginButtonTitle");
      $("<span class='jsavbegin' title='" + tmpTranslation + "'>&lt;&lt;</span>").click(beginHandler).appendTo($controls);
      tmpTranslation = this._translate("backwardButtonTitle");
      $("<span class='jsavbackward' title='" + tmpTranslation + "'>&lt;</span>").click(backwardHandler).appendTo($controls);
      tmpTranslation = this._translate("forwardButtonTitle");
      $("<span class='jsavforward' title='" + tmpTranslation + "'>&gt;</span>").click(forwardHandler).appendTo($controls);
      tmpTranslation = this._translate("endButtonTitle");
      $("<span class='jsavend' title='" + tmpTranslation + "'>&gt;&gt;</span>").click(endHandler).appendTo($controls);
      this._controlsContainer = $controls;
    }
    // bind the handlers to events to enable control by triggering events
    this.container.bind({ "jsav-forward": forwardHandler,
                          "jsav-backward": backwardHandler,
                          "jsav-begin": beginHandler,
                          "jsav-end": endHandler });
                          
    // add slideshow counter if an element with class counter exists
    var counter = $(".jsavcounter", this.container);
    // register an event to be triggered on container to update the counter
    if (counter.size() > 0) {
      counter.text("0 / 0"); // initialize the counter text
      // register event handler to update the counter
      this.container.bind("jsav-updatecounter", function(evet, current, total) {
        counter.text(current + " / " + total);
      });
    }
    
    // register a listener for the speed change event
    $(document).bind("jsav-speed-change", function(e, args) {
      that.SPEED = args;
    });
  });
  
  // this function can be used to "decorate" effects to be applied when moving forward
  // in the animation
  function anim(effect, undo) {
    // returns a function that can be used to provide function calls that are applied later
    // when viewing the visualization
    return function() {
      var jsav = this; // this points to the objects whose function was decorated
      var args = $.makeArray(arguments),
          norecord = false;
      if (args.length > 0 && args[args.length-1] && typeof args[args.length-1] === "object" &&
              args[args.length-1].record === false) {
        norecord = true;
      }
      if (!jsav.hasOwnProperty("_redo")) { jsav = this.jsav; }
      if (jsav.options.animationMode === 'none' || norecord) { // if not recording, apply immediately
        effect.apply(this, arguments);
      } else {
        var stackTop = jsav._undo[jsav._undo.length - 1];
        if (!stackTop) {
          stackTop = new AnimStep();
          jsav._undo.push(stackTop);
        }
        // add to stack: [target object, effect function, arguments, undo function]
        var oper = new AnimatableOperation({obj: this, effect: effect,
          args: arguments, undo: undo});
        stackTop.add(oper);
        if (jsav._shouldAnimate()) {
          jsav.container.addClass(playingCl);
        }
        oper.apply();
        if (jsav._shouldAnimate()) {
          jsav._clearPlaying();
        }
      }
      return this;
    };
  }
  function moveWrapper(func, filter) {
    var origStep = this.currentStep(),
      step = func.call(this);
    if (!step) {
      return false;
    }
    if (filter) {
      if ($.isFunction(filter)) {
        var filterMatch = filter(step),
          matched = filterMatch;
        while (!filterMatch && this.currentStep() < this.totalSteps()) {
          step = func.call(this);
          if (!step) { break; }
          filterMatch = filter(step);
          matched = matched || filterMatch;
        }
        if (!matched) {
          this.jumpToStep(origStep);
          return false;
        }
      }
    }
    return true;
  }
  JSAV.anim = anim;
  if (localStorage) { // try to fetch a stored setting for speed from localStorage
    var spd = localStorage.getItem("jsav-speed");
    if (spd) { // if we have a value, it is a string (from localStorage)
      spd = parseInt(spd, 10);
      if (isNaN(spd)) { // if we couldn't parse an int, fallback to default speed
        spd = DEFAULT_SPEED;
      }
    } else { // no value in localStorage, go with the default speed
      spd = DEFAULT_SPEED;
    }
    JSAV.ext.SPEED = spd;
  } else {
    JSAV.ext.SPEED = DEFAULT_SPEED;
  }
  JSAV.ext.begin = begin;
  JSAV.ext.end = end;
  JSAV.ext.forward = function(filter) {
    return moveWrapper.call(this, forward, filter);
  };
  JSAV.ext.backward = function(filter) {
    return moveWrapper.call(this, backward, filter);
  };
  JSAV.ext.currentStep = function() {
    return this._undo.length;
  };
  JSAV.ext.totalSteps = function() {
    return this._undo.length + this._redo.length;
  };
  JSAV.ext.animInfo = function() {
    // get some "size" info about the animation, namely the number of steps
    // and the total number of effects (or operations) in the animation
    var info = { steps: this.totalSteps()},
      i,
      effects = 0;
    for (i = this._undo.length; i--; ) {
      effects += this._undo[i].operations.length;
    }
    for (i = this._redo.length; i--; ) {
      effects += this._redo[i].operations.length;
    }
    info.effects = effects;
    return info;
  };
  JSAV.ext.step = function(options) {
    var updateRelative = (options && options.updateRelative === false ? false : true);
    if (updateRelative) { this.container.trigger("jsav-updaterelative"); }
    if (this.options.animationMode !== "none") {
      this._undo.push(new AnimStep(options)); // add new empty step to oper. stack
      if (options && this.message && options.message) {
        this.message(options.message);
      }
    }
    return this;
  };
  JSAV.ext.clearAnimation = function(options) {
    var opts = $.extend({undo: true, redo: true}, options);
    if (opts.undo) {
      this._undo = [];
    }
    if (opts.redo) {
      this._redo = [];
    }
  };
  JSAV.ext.displayInit = function() {
    this.container.trigger("jsav-updaterelative");
    this.clearAnimation({redo: false});
    return this;
  };
  /** Jumps to step number step. */
  JSAV.ext.jumpToStep = function(step) {
    var stepCount = this.totalSteps(),
        jsav = this,
        stepFunction = function(stp) {
          return jsav.currentStep() === step;
        };
    var oldFx = $.fx.off || false;
    $.fx.off = true;
    if (step >= stepCount) {
      this.end();
    } else if (step < 0) {
      this.begin();
    } else if (step < this.currentStep()) {
      this.backward(stepFunction);
    } else {
      this.forward(stepFunction);
    }
    $.fx.off = oldFx;
    return this;
  };
  JSAV.ext.stepOption = function(name, value) {
    var step = this._undo[this._undo.length - 1];
    if (value !== undefined) { // set named property
      if (step) {
        step.options[name] = value;
      }
    } else if (typeof name === "string") { // get named property
      if (step) {
        return step.options[name];
      } else {
        return undefined;
      }
    } else { // assume an object
      for (var item in name) {
        if (name.hasOwnProperty(item)) {
          this.stepOption(item, name[item]);
        }
      }
    }
  };
  JSAV.ext.recorded = function() {
    // if there are more than one step, and the last step is empty, remove it
    if (this._undo.length > 1 && this._undo[this._undo.length - 1].isEmpty()) {
      this._undo.pop();
    } else {
      this.container.trigger("jsav-updaterelative");
    }
    this.begin();
    this.RECORD = false;
    $.fx.off = false;
    this.logEvent({type: "jsav-recorded"});
    return this;
  };
  JSAV.ext.isAnimating = function() {
    // returns true if animation is playing, false otherwise
    return !!this.container.find(":animated").size() || this._animations > 0;
  };
  JSAV.ext._shouldAnimate = function() {
    return (!this.RECORD && !$.fx.off && this.SPEED > 50);
  };
  JSAV.ext.disableControls = function() {
    if (this._controlsContainer) {
      this._controlsContainer.addClass("jsavdisabled");
    }
  };
  JSAV.ext.enableControls = function() {
    if (this._controlsContainer) {
      this._controlsContainer.removeClass("jsavdisabled");
    }
  };
}(jQuery));

/** Override the borderWidth/Color CSS getters to return the
 info for border-top. */
jQuery.cssHooks.borderColor = {
	get: function(elem) {
    return jQuery(elem).css("border-top-color");
	}
};
jQuery.cssHooks.borderWidth = {
	get: function(elem) {
    return jQuery(elem).css("border-top-width");
	}
};
/**
* Module that contains utility functions.
* Depends on core.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  // Test if range type is supported and add to jQuery.support
  var inp = $("<input type='range' />");
  $.support.inputTypeRange = (inp.prop("type") === "range");

  var ObjCommons = function() {},
      objproto = ObjCommons.prototype;
  // gets or sets the id of the object
  objproto.id = function(newId) {
    if (newId) {
      this.element[0].id = newId;
      return this;
    } else {
      var id = this.element[0].id;
      if (!id) {
        id = JSAV.utils.createUUID();
        this.element[0].id = id;
      }
      return id;
    }
  };
  objproto.bounds = function(recalculate, options) {
    if (recalculate && $.isFunction(this.layout)) {
      return this.layout($.extend({boundsOnly: true}, options));
    } else {
      var pos = this.position();
      return $.extend({width: this.element.width(), height: this.element.height()}, pos);
    }
  };
  objproto.position = function() {
    return JSAV.position(this.element);
  };
  objproto.isVisible = function() {
    // use the jquery :visible pseudo filter for checking for visibility
    return this.element.filter(":visible").size() > 0;
  };
  objproto.clear = function() {
    if (this.element) {
      this.element.remove();
    }
  };
  objproto._animateTranslate = JSAV.anim(function(dx, dy, options) {
    var leftie = this.element.css("left")==="auto"?dx:"+="+dx,
        toppie = this.element.css("top")==="auto"?dy:"+="+dy;
    this.element.css({left: leftie + "px", top: toppie + "px"});
    if (this.jsav._shouldAnimate()) {
      this.element.css({x: -dx, y: -dy, z: 1});
      this.jsav.effects.transition(this.element, {x: 0, y: 0, z: 1}, options);
    }
    return [-dx, -dy, options];
  });
  objproto.translate = function(dx, dy, options) {
    var val = this._animateTranslate(dx, dy, options);
    if (this._moveListeners) {
      this.element.trigger("jsav-object-move", [dx, dy]);
    }
    return val;
  };
  objproto.translateX = function(dx, options) {
    return this.translate(dx, 0, options);
  };
  objproto.translateY = function(dy, options) {
    return this.translate(0, dy, options);
  };
  objproto.moveTo = function(newLeft, newTop, options) {
    var curPos = this.element.position(),
        dx = newLeft - curPos.left,
        dy = newTop - curPos.top;
    var val = this._animateTranslate(dx, dy, options);
    if (this._moveListeners) {
      this.element.trigger("jsav-object-move", [dx, dy]);
    }
  };
  objproto._registerMoveListener = function(callback) {
    // if callback isn't a function, do nothing
    if (!$.isFunction(callback)) { return; }
    // register the callback as an event handler for jsav-move-object
    this._moveListeners = (this._moveListeners || 0) + 1;
    this.element.on("jsav-object-move", callback);
    // if we have a parent container (such as tree for tree nodes), register for
    // moves of that as well
    if (this.container) {
      this.container._registerMoveListener(callback);
    }
  };
  objproto._unregisterMoveListener = function(callback) {
    this.element.off("jsav-object-move", callback);
    this._moveListeners--;
    if (this.container) {
      this.container._unregisterMoveListener(callback);
    }
  };

  JSAV._types.JSAVObject = ObjCommons;

  JSAV.utils = {};
  var u = JSAV.utils; // shortcut for easier and faster access

  u.getQueryParameter = function(name) {
    var params = window.location.search,
      vars = {},
      i,
      pair;
    if (params) {
      params = params.slice(1).split('&'); // get rid of ?
      for (i=params.length; i--; ) {
        pair = params[i].split('='); // split to name and value
        vars[pair[0]] = decodeURIComponent(pair[1]); // decode URI
        if (name && pair[0] === name) {
          return pair[1]; // if name requested, return the matching value
        }
      }
    }
    if (name) { return; } // name was passed but param was not found, return undefined
    return vars;
  };
  /* from raphaeljs */
  u.createUUID = function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [],
        i = 0;
    for (; i < 32; i++) {
      s[i] = (~~(Math.random() * 16)).toString(16);
    }
    s[12] = 4;  // bits 12-15 of the time_hi_and_version field to 0010
    s[16] = ((s[16] & 3) | 8).toString(16);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    return "jsav-" + s.join("");
  };

  /** Returns an iterable version of the passed array that has functions .next() and
    * .hasNext(). Note, that the array is a clone of the original array! */
  u.iterable = function(array) {
    var i = 0,
      array_clone = array.slice(0);
    array_clone.next = function() {
      return this[i++];
    };
    array_clone.hasNext = function() {
      return i < this.length;
    };
    array_clone.reset = function() {
      i = 0;
    };
    return array_clone;
  };

  /** Returns true if the passed object is a graphical primitive, false otherwise. */
  u.isGraphicalPrimitive = function(jsavobj) {
    if (!jsavobj) { return false; }
    return !!jsavobj.rObj;
  };


  JSAV.ext.logEvent = function(eventData) {
    // if object, add default fields if they don't exist
    if (typeof eventData === "object") {
      if (!eventData.hasOwnProperty('tstamp')) {
        eventData.tstamp = new Date().toISOString();
      }
      if (!eventData.hasOwnProperty('av')) {
        eventData.av = this.id();
      }
      eventData.currentStep = this.currentStep();
    }
    if ($.isFunction(this.options.logEvent)) {
      this.options.logEvent(eventData);
    } else {
      $("body").trigger("jsav-log-event", [eventData]);
    }
  };
  
  var dialogBase = '<div class="jsavdialog"></div>',
    $modalElem = null;
  
  u.dialog = function(html, options) {
    // options supported :
    //  - modal (default true)
    //  - width (and min/maxWidth)
    //  - height (and min/maxHeight)
    //  - closeText
    //  - dialogClass
    //  - title
    //  - closeCallback
    //  - dialogBase
    //  - dialogRootElement
    options = $.extend({}, {modal: true, closeOnClick: true}, options);
    var d = {},
        modal = options.modal,
        $dialog = $(options.dialogBase || dialogBase),
        i, l, attr,
        attrOptions = ["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"];
    if (typeof html === "string") {
      $dialog.html(html);
    } else if ($.isFunction(html)) {
      $dialog.html(html());
    } else {
      $dialog.append(html); // jquery or dom element
    }
    if ("title" in options) {
      $dialog.prepend("<h2>" + options.title + "<a href='#' class='jsavdialogclose'>&times;</a></h2>");
    }
    if ("dialogClass" in options) {
      $dialog.addClass(options.dialogClass);
    }
    for (i = 0, l = attrOptions.length; i < l; i++ ) {
      attr = attrOptions[i];
      if (options[attr] !== undefined) {
        $dialog.css(attr, options[attr]);
      }
    }
    var $doc = $(document),
      $win = $(window),
      docHeight = $doc.height(),
      docWidth = $doc.width(),
      winHeight = $win.height(),
      winWidth = $win.width(),
      scrollLeft = $doc.scrollLeft(),
      scrollTop = $doc.scrollTop();
    if (!("width" in options)) {
      $dialog.css("width", Math.max(500, winWidth*0.7)); // min width 500px, default 70% of window
    }
    var close = function(e) {
      if (e) { // if used as an event handler, prevent default behavior
        e.preventDefault();
      }
      if ($modalElem) {
        $modalElem.detach();
      }
      $dialog.remove();
      if ($.isFunction(options.closeCallback)) {
        options.closeCallback();
      }
    };
    if (modal) {
      $modalElem = $modalElem || $('<div class="jsavmodal" />');
      $modalElem.appendTo($("body"));
      if (options.closeOnClick) {
        $modalElem.click(close);
      }
    }
    $dialog.find(".jsavdialogclose").click(close);
    if ("closeText" in options) {
      var closeButton = $('<button type="button" class="jsavrow">' + options.closeText + '</button>')
        .click(close);
      $dialog.append(closeButton);
    }

    var $dial = $dialog.appendTo(options.dialogRootElement || $("body"));
    $dial.draggable();
    var center = function() {
      $dialog.css({
        top: Math.max(scrollTop + (winHeight - $dialog.outerHeight())/2, 0),
        left: scrollLeft + (winWidth - $dialog.outerWidth())/2
      });
    };
    center();
    $dial.show = function() {
      center();
      $dial.fadeIn();
    };
    $dial.close = close;
    return $dial;
  };
  
  u.value2type = function(val, valtype) {
    if (valtype === "number") {
      return Number(val);
    } else if (valtype === "boolean") {
      if (typeof(val) === "boolean") {
        return val;
      } else if (typeof(val) === "string") {
        return val === "true";
      }
      return !!val;
    } else {
      return val;
    }
  };
  
  var dummyTestFunction = function(dataArr) { return true; };
  u.rand = {
    random: Math.random,
    numKey: function(min, max) {
      return Math.floor(this.random()*(max-min) + min);
    },
    numKeys: function(min, max, num, options) {
      var opts = $.extend(true, {sorted: false, test: dummyTestFunction,
                                tries: 10}, options);
      var keys, tries = opts.tries, size = num;
      do {
        keys = [];
        for (size = num; size--; ) {
          keys.push(this.numKey(min, max));
        }
      } while (tries-- && !opts.test(keys));
      if (opts.sorted) { keys.sort(opts.sortfunc || function(a, b) {return a - b;}); }
      return keys;
    },
    /** returns an array of num random items from given array collection */
    sample: function(collection, num, options) {
      var opts = $.extend(true, {test: dummyTestFunction,
                                 tries: 10}, options);
      var min = 0,
        max = collection.length,
        result = [],
        dupl,
        tmp, rnd,
        tries = opts.tries;
      if (max < num || num < 0) { return undefined; }
      do {
        dupl = collection.slice(0);

        // do num random swaps, always swap with an item later in the array
        for (var i = 0; i < num; i++) {
          tmp = dupl[i];
          rnd = this.numKey(i, max);
          dupl[i] = dupl[rnd];
          dupl[rnd] = tmp;
        }
      } while (tries-- && !opts.test(dupl));
      return dupl.slice(0, num);
    }


  };
  /*  Makes constructor inherit superConstructor
   *  from Golimojo: http://www.golimojo.com/etc/js-subclass.html
   */
  u.extend = function(constructor, superConstructor) {
    function surrogateConstructor() {}

    surrogateConstructor.prototype = superConstructor.prototype;

    var prototypeObject = new surrogateConstructor();
    prototypeObject.constructor = constructor;

    constructor.prototype = prototypeObject;
  };

  /* Returns a function which interpet given labels to a values
   * (usually a strings) in the selected language.
   *
   * langJSON         - a JavaScript object or a URL to a JSON file
   *                    containing the translation(s)
   * selectedLanguage - a string which tells which language to select.
   *                    If undefined the langJSON is assumed to already
   *                    contain the translation for a language.
   *
   * If the translations are in separate files the URL can be written
   * with the label {lang}. This label will then be replaced with the
   * selected language. For instance if the translations are in BST-en.json
   * and BST-fi.json, langJSON can be "BST-{lang}.json" and selectedLanguage
   * "en" or "fi".
   *
   * A translation object for only one language could look like this:
   *    {message: "Hello!"}
   * and for two languages it could look like this:
   *    {
   *      en: {message: "Hello!"},
   *      fi: {message: "Moi!"}
   *    }
   */
  u.getInterpreter = function (langJSON, selectedLanguage) {
    var trans;

    // get the translation from the given location or object 
    if (typeof langJSON === "string") {
      // assume langJSON is a url
      if (langJSON.indexOf("{lang}") !== -1) {
        // replace {lang} label with the selected language
        langJSON = langJSON.replace("{lang}", selectedLanguage);
        selectedLanguage = undefined;
      }
      $.ajax({
        url: langJSON,
        async: false,
        dataType: "json",
        success: function (data) {
          if (selectedLanguage) {
            trans = data[selectedLanguage];
          } else {
            trans = data;
          }
        }
      });
    } else if (typeof langJSON === "object") {
      // assume this is an object containing one or more translations
      if (selectedLanguage) {
        trans = langJSON[selectedLanguage];
      } else {
        trans = langJSON;
      }
    }

    // if the selected translation is not an object give a warning and
    // return a dummy function
    if (typeof trans !== "object") {
      console.warn("Language not found (" + selectedLanguage + ")");
      return function (label) {
        return "[" + label + "]";
      };
    }

    // return the interpreter function for the selected language
    return function (label) {
      if (typeof trans[label] === "undefined") {
        console.warn("Cannot find label: " + label);
        return "[" + label + "]";
      }
      return trans[label];
    };
  };

  /* Replaces the labels (surrounded by curly brackets) in a string with a value
   * 
   * For instance if the string is "The value of x is {x}" and the object
   * containing the replacements for the tag is {x: 7}, this function will
   * return the string "The value of x is 7"
   *
   * This function uses regular expressions to replace the tags. Therefore tags
   * should not use numbers or special characters such as . ? * + etc.
   */
  u.replaceLabels = function (string, replacementObject) {
    if (!replacementObject || typeof replacementObject !== "object") {
      return string;
    }

    var result = string;
    for (var label in replacementObject) {
      if (replacementObject.hasOwnProperty(label)) {
        var reg = new RegExp("{"+label+"}", "g");
        result = result.replace(reg, replacementObject[label]);
      }
    }

    return result;
  };

  /*
   * Returns an undoable/animatable function which will work with JSAV's
   * undo and recorded animation. The returned function can for instance be
   * used to show or hide non-JSAV DOM element.
   *
   * Arguments: jsav - The jsav instance with the exercise or animation.
   *            func - The function which performs the action.
   *                   If the same function can be used to undo the performed
   *                   action, it should return the undo arguments in an array.
   *            undoFunc - (OPTIONAL IF func RETURNS THE UNDO ARGUMENTS)
   *                   The function which will undo the action performed by
   *                   func.
   *
   */
  u.getUndoableFunction = function (jsav, func, undoFunc) {
    var f = JSAV.anim(func, undoFunc);
    return function () { f.apply(jsav, arguments); };
  };

/*!
// based on seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
// http://davidbau.com/encode/seedrandom.js
//
// 12/12/2011: Original code modified to add the methods to JSAV.utils.rand
// instead of overwriting the Math.random().
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow
 * @param {number=} startdenom
 */
(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math.seedrandom = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math.random = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = Math.pow(width, chunks);
significance = Math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
}(
  [],   // pool: entropy pool starts empty
  u.rand, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
));
/*!
 End seedrandom.js
 */
 
  var _helpers = {};
  u._helpers = _helpers;
  var JSAV_CLASS_NAMES = ["jsavarray", "jsavhorizontalarray", "jsavverticalarray",
                          "jsavbararray", "jsavindexed",
                          "jsavnode", "jsavindex",
                          "jsavcommontree", "jsavtree", "jsavbinarytree",
                          "jsavbinarynode", "jsavtreenode",
                          "jsavlistnode", "jsavlist", "jsavverticallist",
                          "jsavhorizontallist",
                          "jsavmatrix",
                          "jsavgraphnode",
                          "jsavvariable", "jsavedge"];
  _helpers.setElementClasses = function(element, cls) {
    var elem = element[0],
        clsList,
        curCls,
        c, i;
    if (elem instanceof SVGElement && typeof elem.classList === "object") {
      clsList = elem.classList;
      curCls = Array.prototype.slice.call(elem.classList, 0);
      for (i = curCls.length; i--; ) {
        c = curCls[i];
        if (JSAV_CLASS_NAMES.indexOf(c) === -1 && cls.indexOf(c) === -1) {
          clsList.remove(c);
        }
      }
      for (i = cls.length; i--; ) {
        c = cls[i];
        if (!clsList.contains(c)) {
          clsList.add(c);
        }
      }
    } else {
      // Fallback for SVG elements in PhantomJS
      // PhantomJS does not use classList for SVG elements
      clsList = element.first().attr("class").split(" ");
      curCls = clsList.slice(0);
      for (i = curCls.length; i--; ) {
        c = curCls[i];
        if (JSAV_CLASS_NAMES.indexOf(c) === -1 && cls.indexOf(c) === -1) {
          clsList.splice(clsList.indexOf(c), 1); // remote c from clsList
        }
      }
      for (i = cls.length; i--; ) {
        c = cls[i];
        if (clsList.indexOf(c) === -1) {
          clsList.push(c); // add c to clsList
        }
      }
      element.first().attr("class", clsList.join(" "));
    }
  };
  _helpers.elementClasses = function(element) {
    var elem = element[0],
        cls,
        customCls = [],
        i;
    if (elem instanceof SVGElement && typeof elem.classList === "object") {
      cls = Array.prototype.slice.call(element[0].classList, 0);
    } else {
      // Fallback for SVG elements in PhantomJS
      // PhantomJS does not use classList for SVG elements
      cls = element.first().attr("class").split(" ");
    }
    for (i = cls.length; i--; ) {
      if (JSAV_CLASS_NAMES.indexOf(cls[i]) === -1) {
        customCls.push(cls[i]);
      }
    }
    return customCls;
  };
  _helpers.css = function(cssprop, value, options) {
    if (typeof cssprop === "string" && typeof value === "undefined") {
      return this.element.css(cssprop);
    } else {
      return this._setcss(cssprop, value, options);
    }
  };
  _helpers._setcss = function(cssprop, value, options) {
    var oldProps,
        el = this.element,
        newprops, opts = options;
    if (typeof cssprop === "string" && typeof value !== "undefined") {
      // handle args like (propName, newValue)
      oldProps = {}; //we will still return an object of old props
      oldProps[cssprop] = el.css(cssprop);
      newprops = {}; // newProps for animation
      newprops[cssprop] = value;
      value = undefined;
    } else {
      oldProps = $.extend(true, {}, cssprop);
      for (var i in cssprop) {
        if (cssprop.hasOwnProperty(i)) {
          oldProps[i] = el.css(i);
        }
      }
      opts = value;
      newprops = cssprop;
    }
    if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
      this.jsav.effects.transition(this.element, newprops, opts);
    } else {
      this.element.css(newprops);
    }
    return [oldProps, value, options];
  };
  // function that selects elements from $elems that match the indices
  // filter (number, array of numbers, or filter function)
  _helpers.getIndices = function($elems, indices) {
    if (typeof indices === "undefined") { return $elems; } // use all if no restrictions are given
    if ($.isFunction(indices)) { // use a filter function..
      return $elems.filter(indices); // ..and let jQuery do the work
    } else if ($.isArray(indices)) {
      // return indices that are in the array
      return $elems.filter(function(index, item) {
        for (var i=0; i < indices.length; i++) {
          if (indices[i] === index) { return true; }
        }
        return false;
      });
    } else if (typeof indices === "number") {
      return $elems.eq(indices); // return the specific index
    } else if (typeof indices === "boolean") {
      // return all elems if indices is true, empty set otherwise
      return indices?$elems:$({});
    } else {
      try { // last resort, try if the argument can be parsed into an int..
        return $elems.eq(parseInt(indices, 10));
      } catch (err) {
        return $({}); // ..if not, return an empty set
      }
    }
  };
  _helpers.normalizeIndices = function($elems, indices, test) {
    var normIndices = [],
        $normElems = this.getIndices($elems, indices),
        i, l;
    if (typeof test !== "undefined") {
      $normElems = $normElems.filter(test);
    }
    for (i = 0, l = $normElems.size(); i < l; i++) {
      normIndices.push($elems.index($normElems.get(i)));
    }
    return normIndices;
  };
  _helpers.cssEquals = function(jsavObj1, jsavObj2, cssProps) {
    var cssprop, i;
    if ($.isArray(cssProps)) { // array of property names
      for (i = 0; i < cssProps.length; i++) {
        cssprop = cssProps[i];
        if (jsavObj1.css(cssprop) !== jsavObj2.css(cssprop)) { return false; }
      }
    } else { // if not array, expect it to be a property name string
      cssprop = cssProps;
      if (jsavObj1.css(cssprop) !== jsavObj2.css(cssprop)) { return false; }
    }
    return true;
  };
  _helpers.classEquals = function(jsavObj1, jsavObj2, classNames) {
    var clazzname, i, l;
    if ($.isArray(classNames)) { // array of property names
      for (i = 0, l = classNames.length; i < l; i++) {
        clazzname = classNames[i];
        if (jsavObj1.hasClass(clazzname) !== jsavObj2.hasClass(clazzname)) {
          return false;
        }
      }
    } else { // if not array, expect it to be a property name string
      clazzname = classNames;
      if (jsavObj1.hasClass(clazzname) !== jsavObj2.hasClass(clazzname)) {
        return false;
      }
    }
    return true;
  };

  // position the given object relative to relElem, taking into account offsets and anchors
  // the move is animated
  var animateToNewRelativePosition = function(jsavobj, relElem, offsetLeft, offsetTop, anchor, myAnchor) {
    var el = jsavobj.element,
        elemCurPos = el.position();

    // use jqueryui to position the el relative to the relElem
    el.position({my: myAnchor,
      at: anchor,
      of: relElem,
      offset: offsetLeft + " " + offsetTop,
      collision: "none"});
    var elemPos = el.position();
    var elemLeft = elemPos.left;
    var elemTop = elemPos.top;
    if (elemLeft === elemCurPos.left && elemTop === elemCurPos.top) { // relativeTo element has not changed pos
      return {left: 0, top: 0}; // no change to animate, just return
    } else {
      // move it back to the original position
      el.css({left: elemCurPos.left, top: elemCurPos.top});
      // animate the move
      jsavobj.moveTo(elemLeft, elemTop); // change the position
    }
    // return the change in position
    return {left: elemLeft - elemCurPos.left, top: elemTop - elemCurPos.top};
  };

  // Set jsavobj to move after target. possible optional options. Both jsavobj and target
  // need to be instances of JSAVObject.
  //
  // - callback: a function that will be called with deltaleft and deltatop arguments
  //             indicating the change in position
  // - autotranslate: if true, the jsavobj will be moved at the end of the step when
  //                  jsav-updaterelative triggers
  _helpers._setRelativeFollowUpdater = function(jsavobj, target, options) {
    // unbind possible previous handlers on the jsavobj
    // this enables changing the target by calling this function again
    if (jsavobj._relativehandle) {
      jsavobj._relativetarget._unregisterMoveListener(jsavobj._relativehandle);
      jsavobj.jsav.container.off("jsav-updaterelative", jsavobj._updaterelativehandle);
    }
    // keep track of the size of the change. the target can move position multiple times,
    // and we will make the animation simpler and sum those changes and move the jsavobj once
    var leftSum = 0,
        topSum = 0,
        callbackFunc = options && $.isFunction(options.callback);

    // handler for the jsav-updaterelative event, this is when the jsavobj is finally moved
    var updaterelativehandle = function() {
      if (leftSum !== 0 || topSum !== 0) {
        jsavobj.translate(leftSum, topSum);
        leftSum = 0;
        topSum = 0;
      }
    };
    // handler for the target object moves
    var relativehandle = function(evt, dleft, dtop) {
      evt.stopPropagation();
      if (callbackFunc) { options.callback(dleft, dtop); }
      leftSum += dleft;
      topSum += dtop;
    };
    // if we should translate jsavobj at the end, register the updaterelativehandle to
    // lister for jsav.updaterelative event
    if (!options || options.autotranslate) {
      jsavobj.jsav.container.on("jsav-updaterelative", updaterelativehandle);
    }
    // store the listeners
    jsavobj._relativetarget = target;
    jsavobj._relativehandle = relativehandle;
    jsavobj._updaterelativehandle = updaterelativehandle;
    // register move listener to the target object
    target._registerMoveListener(relativehandle);
  };

  // Sets the given jsavobj to be positioned relative to the options.relativeTo object
  _helpers.setRelativePositioning = function(jsavobj, options) {
    // possible options
    var el = jsavobj.element,
        relElem = options.relativeTo, // REQUIRED
        anchor = options.anchor || "center",
        myAnchor = options.myAnchor || "center",
        follow = !!options.follow; // default to false

    if (!(relElem instanceof jQuery)) {
      if (relElem.nodeType === Node.ELEMENT_NODE) { // check if it's DOM element
        relElem = $(relElem);
      } else if (relElem.constructor === JSAV._types.ds.AVArray && "relativeIndex" in options)  {
        // position relative to the given array index, so set relElem to that index element
        relElem = relElem.index(options.relativeIndex).element; // get the array index object
      } else if (JSAV.utils.isGraphicalPrimitive(relElem)) { // JSAV graphical primitive
        relElem = $(relElem.rObj.node);
      } else {
        // if not jQuery object nor DOM element, assume JSAV object
        relElem = relElem.element || relElem;
      }
    }
    // make sure the jsavobj element is absolutely positioned
    el.css({ position: "absolute" });
    var offsetLeft = parseInt(options.left || 0, 10),
        offsetTop = parseInt(options.top || 0, 10);

    // if we have previous handler (and we are thus changing targets), animate to the new position
    // and also call the callback with the position change if we have one
    if (jsavobj._relativehandle) {
      var move = animateToNewRelativePosition(jsavobj, relElem, offsetLeft, offsetTop, anchor, myAnchor);
      if ($.isFunction(options.callback)) {
        options.callback(move.left, move.top);
      }
    } else { // set the initial position to the current position (to prevent unnecessary animations)
      el.position({my: myAnchor,
                   at: anchor,
                   of: relElem,
                   offset: offsetLeft + " " + offsetTop,
                   collision: "none"});
    }
    if (follow) { // if the jsavobj should move along with the target, register it to do so
      this._setRelativeFollowUpdater(jsavobj, options.relativeTo, $.extend({autotranslate: true}, options));
    }
  };

  /* Handles top, left, right, bottom options and positions the given element accordingly */
  _helpers.handlePosition = function(jsavobj) {
    var el = jsavobj.element,
        options = jsavobj.options;
    if ("relativeTo" in options || "left" in options || "top" in options || "bottom" in options || "right" in options) {
      var positions = ["right", "bottom", "top", "left"],
          posProps = {"position": "absolute"},
          pos;
      options.center = false;
      // if positioning relative to some other object
      if ("relativeTo" in options && options.relativeTo) {
        this.setRelativePositioning(jsavobj, options);
      } else { // positioning absolutely
        for (var i = positions.length; i--; ) {
          pos = positions[i];
          if (options.hasOwnProperty(pos)) {
            posProps[positions[i]] = options[pos];
          }
          el.css(posProps);
        }
      }
    }
  };
  _helpers.handleVisibility = function(jsavobj, options) {
    jsavobj.element.css("display", "none");
    var visible = (typeof options.visible === "boolean" && options.visible === true);
    if (visible) {
      jsavobj.show(options);
    }
  };
  // A helper function to attach to JSAV objects to animate and record
  // toggling of a CSS class. Note, that when adding this to a JSAV
  // object prototype, it should be wrapper with the JSAV.anim(..).
  // For example:
  // treenode.toggleClass = JSAV.anim(JSAV.utils._helpers._toggleClass);
  _helpers._toggleClass = function(className, options) {
    var opts = $.extend({animate: true}, options);
    if (this.jsav._shouldAnimate() && opts.animate) {
      this.jsav.effects._toggleClass(this.element, className, options);
    } else {
      this.element.toggleClass(className);
    }
    return [className, options];
  };
  // A helper function to attach to JSAV objects to animate and record
  // addition of a CSS class. This should not be wrapped with JSAV.anim(..).
  // Note, that this function assumes there is a .toggleClass(..) function
  // on the JSAV object.
  _helpers.addClass = function(className, options) {
    if (!this.element.hasClass(className)) {
      return this.toggleClass(className, options);
    } else {
      return this;
    }
  };
  // A helper function to attach to JSAV objects to animate and record
  // removal of a CSS class. This should not be wrapped with JSAV.anim(..).
  // Note, that this function assumes there is a .toggleClass(..) function
  // on the JSAV object.
  _helpers.removeClass = function(className, options) {
    if (this.element.hasClass(className)) {
      return this.toggleClass(className, options);
    } else {
      return this;
    }
  };
  // A helper function to attach to JSAV objects to tell whether or not the
  // object has a CSS class applied.
  _helpers.hasClass = function(className) {
    return this.element.hasClass(className);
  };

}(jQuery));
/**
* Module that contains the message output implementations.
* Depends on core.js, anim.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }
  
  var MessageHandler = function(jsav, output) {
    this.jsav = jsav;
    this.output = output;
    if (this.output && "title" in jsav.options) {
      this.output.html("<div class='jsavtitle'>" + jsav.options.title + "</div>");
    }
  };
  MessageHandler.prototype.umsg = JSAV.anim(function(msg, options) {
    if (options && options.fill && typeof options.fill === "object") {
      // replace the labels in the string if the replacements are given in the options
      msg = JSAV.utils.replaceLabels(msg, options.fill);
    }
    var opts = $.extend({color: "black", preserve: false}, options);
    if (this.output) {
      if (this.output.hasClass("jsavline") && opts.preserve) {
        var el = this.output.find("div:last"),
          newmsg = "<span style='color:" + opts.color + ";'>" + msg + "</span>";
        if (el.size() > 0) { // existing content in message output
          el.append(newmsg);
        } else { // first message
          this.output.html("<div style='color:" + opts.color + ";'>" + msg + "</div>");
        }
      } else if (this.output.hasClass("jsavline")) {
        this.output.html("<div style='color:" + opts.color + ";'>" + msg + "</div>");
      //} else if (this.output.hasClass("jsavscroll")) {
      } else { // e.g. "jsavscroll", which is default
        this.output.append("<div style='color:" + opts.color + ";'>" + msg + "</div>");
        if (this.output[0]) {
          this.output[0].scrollTop = this.output[0].scrollHeight;
        }
      }
    }
    if (!this.jsav.RECORD) { // trigger events only if not recording
      this.jsav.container.trigger("jsav-message", [msg, options]);
    }
    return this;
  });
  MessageHandler.prototype.clear = JSAV.anim(function() {
    if (this.output) {
      this.output.html("");
    }
  });
  
  MessageHandler.prototype.state = function(newValue) {
    if (newValue) {
      this.output.html(newValue);
      this.jsav.container.trigger("jsav-message", [newValue, this.options]);
    } else {
      return this.output.html() || "<span/>";
    }
  };
  
  JSAV.ext.umsg = function(msg, options) {
    this._msg.umsg(msg, options);
  };
  JSAV.ext.clearumsg = function(msg, options) {
    this._msg.clear();
  };
  
  JSAV.init(function(options) {
    var output = options.output ? $(options.output) : $(this.container).find(".jsavoutput");
    this._msg = new MessageHandler(this, output);
  });
}(jQuery));

/**
* Module that contains interaction helpers for JSAV.
* Depends on core.js, anim.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";

  // to use jQuery queue (code borrowed from https://github.com/rstacruz/jquery.transit/)
  function callOrQueue(self, queue, fn) {
    if (queue === true) {
      self.queue(fn);
    } else if (queue) {
      self.queue(queue, fn);
    } else {
      fn();
    }
  }

  $.fn.extend({
    // use CSS3 animations to animate the class toggle (if supported by browser)
    // based on https://github.com/rstacruz/jquery.transit/
    jsavToggleClass: function(classNames, opts) {
      var self  = this;

      var opt = $.extend({queue: true, easing: "linear", delay: 0}, opts);
      opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
          opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;
      // Account for aliases (`in` => `ease-in`).
      if ($.cssEase[opt.easing]) { opt.easing = $.cssEase[opt.easing]; }

      // Build the duration/easing/delay attributes for the transition.
      var transitionValue = 'all ' + opt.duration + 'ms ' + opt.easing;
      if (opt.delay) { transitionValue += ' ' + opt.delay + 'ms'; }

      // If there's nothing to do...
      if (opt.duration === 0) {
        return this.toggleClass( this, arguments );
      }

      var RUN_DONE = false; // keep track if the toggle has already been done
      var run = function(nextCall) {
        var bound = false; // if transitionEnd was bound or not
        var called = false; // if callback has been called; to prevent timeout calling it again

        // Prepare the callback.
        var cb = function() {
          if (called) { return; }
          called = true;
          if (bound) { self.unbind($.support.transitionEnd, cb); }

          self.each(function() {
            // clear the transition properties of all elements
            this.style[$.support.transition] = null;
          });
          if (typeof opt.complete === 'function') { opt.complete.apply(self); }
          if (typeof nextCall === 'function') { nextCall(); }
        };

        if ((opt.duration > 0) && ($.support.transitionEnd) && ($.transit.useTransitionEnd)) {
          // Use the 'transitionend' event if it's available.
          bound = true;
          self.bind($.support.transitionEnd, cb);
        }

        // Fallback to timers if the 'transitionend' event isn't supported or fails to trigger.
        window.setTimeout(cb, opt.duration);

        if (!RUN_DONE) { // Apply only once
          // Apply transitions
          self.each(function() {
            if (opt.duration > 0) {
              this.style[$.support.transition] = transitionValue;
            }
            $(this).toggleClass(classNames);
          });
        }
        RUN_DONE = true;
      };

      // Defer running. This allows the browser to paint any pending CSS it hasn't
      // painted yet before doing the transitions.
      var deferredRun = function(next) {
        this.offsetWidth; // force a repaint
        run(next);
      };

      // Use jQuery's fx queue.
      callOrQueue(self, opt.queue, deferredRun);

      // Chainability.
      return this;
    }
  });



  var parseValueEffectParameters = function() {
    // parse the passed arguments
    // possibilities are:
    //  - array, ind, array, ind
    //  - array, ind, node
    //  - node, array, ind
    //  - node, node
    var params = { args1: [],
                   args2: [],
                   from: arguments[0] // first param is always 1st structure
                 };
    var secondstrPos = 1;
    if (typeof arguments[1] === "number") { // array index
      params.args1 = [ arguments[1] ];
      secondstrPos = 2; // 2nd structure will be at arg index 2
    }
    params.to = arguments[secondstrPos];
    if (typeof arguments[secondstrPos + 1] === "number") { // array index
      params.args2 = [ arguments[secondstrPos + 1] ];
    }
    return params;
  };
  var doValueEffect = function(opts) {
    // get the values of the from and to elements
    var from = opts.from, // cache the values
        to = opts.to,
        val = from.value.apply(from, opts.args1),
        oldValue = to.value.apply(to, opts.args2),
        $fromValElem, $toValElem, toPos;
    // set the value in original structure to empty string or, if undoing, the old value
    if (opts.mode === "swap") {
      from.value.apply(from, opts.args1.concat([ oldValue, {record: false} ]));
    } else if (opts.mode === "move" || typeof opts.old !== "undefined") {
      from.value.apply(from, opts.args1.concat([(typeof opts.old !== "undefined")?opts.old:"", {record: false}]));
    }
    // set the value of the target structure
    to.value.apply(to, opts.args2.concat([val, {record: false}]));

    // get the HTML elements for the values, for arrays, use the index
    if (from.constructor === JSAV._types.ds.AVArray) {
      $fromValElem = from.element.find("li:eq(" + opts.args1[0] + ") .jsavvaluelabel");
    } else if (from.element.hasClass("jsavlabel")) { // special treatment for labels
      $fromValElem = from.element;
    } else {
      $fromValElem = from.element.find(".jsavvaluelabel");
    }
    if (to.constructor === JSAV._types.ds.AVArray) {
      $toValElem = to.element.find("li:eq(" + opts.args2[0] + ") .jsavvaluelabel");
    } else if (to.element.hasClass("jsavlabel")) { // special treatment for labels
      $toValElem = to.element;
    } else {
      $toValElem = to.element.find(".jsavvaluelabel");
    }

    if (this._shouldAnimate()) {  // only animate when playing, not when recording
      var toValElemHeight = $toValElem.height(); // saved into a variable, because the computed value is zero after repositioning
      var fromValElemHeight = $fromValElem.height(); // saved into a variable, because the computed value is zero after repositioning
      $toValElem.position({of: $fromValElem}); // let jqueryUI position it on top of the from element
      if (opts.mode === "swap") {
        toPos = $.extend({}, $toValElem.position());
        if (to.options.layout !== "bar") {
          $toValElem.css({left: 0, top: 0});
        } else {
          $toValElem.css({left: 0, bottom: 0, top: ""});
        }
        $fromValElem.position({of: $toValElem});
        $toValElem.css(toPos);
        if (from.options.layout !== "bar") {
          $fromValElem.transition({left: 0, top: 0}, this.SPEED, 'linear');
        } else {
          var bottom = $fromValElem.parent().height() - $fromValElem.position().top - fromValElemHeight;
          $fromValElem.css({top: "", bottom: bottom});
          $fromValElem.transition({left: 0, bottom: 0}, this.SPEED, 'linear'); // animate to final position
        }
      }
      if (to.options.layout !== "bar") {
        $toValElem.transition({left: 0, top: 0}, this.SPEED, 'linear'); // animate to final position
      } else {
        var bottom = $toValElem.parent().height() - $toValElem.position().top - toValElemHeight;
        $toValElem.css({top: "", bottom: bottom});
        $toValElem.transition({left: 0, bottom: 0}, this.SPEED, 'linear'); // animate to final position
      }
    }

    // return "reversed" parameters and the old value for undoing
    return [ {
          from: to,
          args1: opts.args2,
          to: from,
          args2: opts.args1,
          old: oldValue,
          mode: opts.mode
        } ];
  };

  JSAV.ext.effects = {
    /* toggles the clazz class of the given elements with CSS3 transitions */
    _toggleClass: function($elems, clazz, options) {
      this._animations += $elems.length;
      var that = this;

      $elems.jsavToggleClass(clazz, {duration: (options && options.duration) || this.SPEED, delay: (options && options.delay) || 0,
        complete: function() { that._animations--; }
      });
    },
    /* Animate the properties of the given elements with CSS3 transitions */
    transition: function($elems, cssProps, options) {
      this._animations += $elems.length;
      var that = this;
      $elems.transition(cssProps, {duration: (options && options.duration) || this.SPEED,
                                    delay: (options && options.delay) || 0,
                                    complete: function() { that._animations--; }
      });
    },
    /* toggles visibility of an element */
    _toggleVisible: function() {
      if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
        this.element.fadeToggle(this.jsav.SPEED);
      } else {
        this.element.toggle();
      }
      return [];
    },
    /* shows an element */
    show: function(options) {
      if (this.element.filter(":visible").size() === 0) {
        this._toggleVisible(options);
      }
      return this;
    },
    /* hides an element */
    hide: function(options) {
      if (this.element.filter(":visible").size() > 0) {
        this._toggleVisible(options);
      }
      return this;
    },
    copyValue: function() {
      var params = parseValueEffectParameters.apply(null, arguments);
      // wrap the doValueEffect function to JSAV animatable function
      JSAV.anim(doValueEffect).call(this, params);
    },
    moveValue: function() {
      var params = parseValueEffectParameters.apply(null, arguments);
      params.mode = "move";
      // wrap the doValueEffect function to JSAV animatable function
      JSAV.anim(doValueEffect).call(this, params);
    },
    swapValues: function() {
      var params = parseValueEffectParameters.apply(null, arguments);
      params.mode = "swap";
      // wrap the doValueEffect function to JSAV animatable function
      JSAV.anim(doValueEffect).call(this, params);
    },
    swap: function($str1, $str2, options) {
      var opts = $.extend({translateY: true, arrow: true, highlight: true, swapClasses: false}, options),
          $val1 = $str1.find("span.jsavvalue"),
          $val2 = $str2.find("span.jsavvalue"),
          classes1 = $str1.attr("class"),
          classes2 = $str2.attr("class"),
          posdiffX = JSAV.position($str1).left - JSAV.position($str2).left,
          posdiffY = opts.translateY?JSAV.position($str1).top - JSAV.position($str2).top:0,
          $both = $($str1).add($str2),
          speed = this.SPEED/5;

      // ..swap the value elements...
      var val1 = $val1[0],
          val2 = $val2[0],
          aparent = val1.parentNode,
          asibling = val1.nextSibling===val2 ? val1 : val1.nextSibling;
      val2.parentNode.insertBefore(val1, val2);
      aparent.insertBefore(val2, asibling);

      // ... and swap classes...
      if (opts.swapClasses) {
        $str1.attr("class", classes2);
        $str2.attr("class", classes1);
      }

      // ..and finally animate..
      if (this._shouldAnimate()) {  // only animate when playing, not when recording
        if ('Raphael' in window && opts.arrow) { // draw arrows only if Raphael is loaded
          var off1 = $val1.offset(),
              off2 = $val2.offset(),
              coff = this.canvas.offset(),
              x1 = off1.left - coff.left + $val1.outerWidth()/2,
              x2 = off2.left - coff.left + $val2.outerWidth()/2,
              y1 = off1.top - coff.top + $val1.outerHeight() + 5,
              y2 = y1,
              curve = 20,
              cx1 = x1,
              cx2 = x2,
              cy1 = y2 + curve,
              cy2 = y2 + curve,
              arrowStyle = "classic-wide-long";
          if (posdiffY > 1 || posdiffY < 1) {
            y2 = off2.top - coff.top + $val2.outerHeight() + 5;
            var angle = (y2 - y1) / (x2 - x1),
                c1 = Math.pow(y1, 2) - (curve*curve / (1 + angle*angle)),
                c2 = Math.pow(y2, 2) - (curve*curve / (1 + angle*angle));
            cy1 = y1 + Math.sqrt(y1*y1 - c1);
            cx1 = x1 - angle*Math.sqrt(y1*y1 - c1);
            cy2 = y2 + Math.sqrt(y2*y2 - c2);
            cx2 = x2 - angle*Math.sqrt(y2*y2 - c2);
          }
          // .. and draw a curved path with arrowheads
          var arr = this.getSvg().path("M" + x1 + "," + y1 + "C" + cx1 + "," + cy1 + " " + cx2 + "," + cy2 + " " + x2 + "," + y2).attr({"arrow-start": arrowStyle, "arrow-end": arrowStyle, "stroke-width": 5, "stroke":"lightGray"});
        }
        // .. then set the position so that the array appears unchanged..
        $val2.css({"x": -posdiffX, "y": -posdiffY, z: 1});
        $val1.css({"x": posdiffX, "y": posdiffY, z: 1});

        // mark to JSAV that we're animating something more complex
        this._animations += 1;
        var jsav = this;
        // .. animate the color ..
        if (opts.highlight) {
          $both.addClass("jsavswap", 3*speed);
        }
        // ..animate the translation to 0, so they'll be in their final positions..
        $val1.transition({"x": 0, y: 0, z: 0}, 7*speed, 'linear');
        $val2.transition({x: 0, y: 0, z: 0}, 7*speed, 'linear',
          function() {
            if (arr) { arr.remove(); } // ..remove the arrows if they exist
            // ..and finally animate to the original styles.
            if (opts.highlight) {
              $both.removeClass("jsavswap", 3*speed);
            }
            // notify jsav that we're done with our animation
            jsav._animations -= 1;
        });
      }
    }
  };
}(jQuery));
/*global JSAV, jQuery */
(function($) {
  "use strict";
  // events to register as functions on tree
  var events = ["click", "dblclick", "mousedown", "mousemove", "mouseup",
                "mouseenter", "mouseleave"];
  // returns a function for the passed eventType that binds a passed
  // function to that eventType nodes/edges in the tree
  // eventOpts that can be specified:
  //  - selector: specify a CSS selector that will select the element which the event listener is attached to
  //              (essentially this is the selector passed to jQuery .on() function). for example .jsavnode
  //  - dataField: the name of the data field where the JSAV object can be found. for example node
  //  - logEventPrefix: the prefix used when logging this event. the name of the event (i.e click) will be
  //                    prepended to this prefix. for example jsav-node-
  var eventhandler = function(eventType, eventOpts) {
    return function(data, handler, options) {
      // default options; not enabled for edges by default
      var defaultopts = {edge: false},
          jsav = this.jsav,
          opts = defaultopts; // by default, go with default options
      if (typeof options === "object") { // 3 arguments, last one is options
        opts = $.extend(defaultopts, options);
      } else if (typeof handler === "object") { // 2 arguments, 2nd is options
        opts = $.extend(defaultopts, handler);
      }
      if (!opts.edge || opts.node) {
        // bind an event handler for nodes in this tree
        this.element.on(eventType, eventOpts.selector, function(e) {
          var $curr = $(this),
              elem = $curr.data(eventOpts.dataField); // get the JSAV node object
          while (!elem) {
            $curr = $curr.parent();
            elem = $curr.data(eventOpts.dataField);
          }
          jsav.logEvent({type: eventOpts.logEventPrefix + eventType, objid: elem.id(), objvalue: elem.value() });
          if ($.isFunction(data)) { // if no data -> 1st arg is the handler function
            // bind this to the elem and call handler
            // with the event as parameter
            data.call(elem, e);
          } else if ($.isFunction(handler)) { // data provided, 2nd arg is the handler function
            var params = $.isArray(data)?data.slice(0):[data]; // get a cloned array or data as array
            params.push(e); // jQuery event as the last parameter
            handler.apply(elem, params); // apply the given handler function
          }
        });
      }
      if (opts.edge) { // if supposed to attach the handler to edges
        // find the SVG elements matching this tree's container
        this.jsav.canvas.on(eventType, '.jsavedge[data-container="' + this.id() + '"]', function(e) {
          var edge = $(this).data("edge"); // get the JSAV edge object
          jsav.logEvent({type: "jsav-edge-" + eventType, startvalue: edge.start().value(),
                        endvalue: edge.end().value(), startid: edge.start().id(), endid: edge.end().id() });
          if ($.isFunction(data)) { // no data
            // bind this to the edge and call handler
            // with the event as parameter
            data.call(edge, e);
          } else if ($.isFunction(handler)) { // data provided
            var params = $.isArray(data)?data.slice(0):[data]; // get a cloned array or data as array
            params.push(e); // jQuery event as the last parameter
            handler.apply(edge, params); // apply the function
          }
        });
      }
      return this; // enable chaining of calls
    };
  };
  var on = function(eventOpts) {
    return function(eventName, data, handler, options) {
      eventhandler(eventName, eventOpts).call(this, data, handler, options);
      return this;
    };
  };
  
  JSAV.utils._events = {
    _addEventSupport: function(proto, options) {
      var opts = $.extend({selector: ".jsavnode", logEventPrefix: "jsav-node-", dataField: "node"}, options);
      // create the event binding functions and add to the given prototype
      for (var i = events.length; i--; ) {
        proto[events[i]] = eventhandler(events[i], opts);
      }
      proto.on = on(opts);
    }
  };
}(jQuery));
/**
* Module that contains the graphical primitive implementations.
* Depends on core.js, anim.js, jQuery, Raphael
*/
/*global JSAV, jQuery, Raphael */
if (typeof Raphael !== "undefined") { // only execute if Raphael is loaded
  (function($, R) {
    "use strict";
    if (typeof JSAV === "undefined") { return; }

    var JSAVGraphical = function() {};
    JSAVGraphical.prototype = {
      // utility function that actually implements hide
      // animated show function
      show: function(options) {
        if (this.css("opacity") !== 1) {
          this.css({"opacity": 1}, options);
        }
      },
      // animated hide function
      hide: function(options) {
        if (this.css("opacity") !== 0) {
          this.css({"opacity": 0}, options);
        }
      },
      isVisible: function(options) {
        return (this.css("opacity") !== 0);
      },
      transform: function(transform, options) {
        var oldTrans = this.rObj.transform();
        if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
          this.rObj.animate( { transform: transform }, this.jsav.SPEED);
        } else {
          this.rObj.transform(transform, options);
        }
        return oldTrans;
      },
      rotate: JSAV.anim(function(deg) {
        this.transform("...r" + deg);
        return [0 - deg];
      }),
      scale: JSAV.anim(function(sx, sy) {
        this.transform("...S" + sx + "," + sy);
        return [1.0/sx, 1.0/sy];
      }),
      scaleX: function(sx, options) {
        return this.scale(sx, 1, options);
      },
      scaleY: function(sy, options) {
        return this.scale(1, sy, options);
      },
      translate: JSAV.anim(function(dx, dy, options) {
        this.transform("...T" + dx + "," + dy);
        return [0-dx, 0-dy];
      }),
      translateX: function(dx, options) {
        return this.translate(dx, 0, options);
      },
      translateY: function(dy, options) {
        return this.translate(0, dy, options);
      },
      _setattrs: JSAV.anim(function(props, options) {
        var oldProps = $.extend(true, {}, props);
        for (var i in props) {
          if (props.hasOwnProperty(i)) {
            oldProps[i] = this.rObj.attr(i);
          }
        }
        if (this.jsav._shouldAnimate() && (!options || !options.dontAnimate)) { // only animate when playing, not when recording
          this.rObj.animate( props, this.jsav.SPEED);
        } else {
          for (i in props) {
            if (props.hasOwnProperty(i)) {
              this.rObj.attr(i, props[i]);
            }
          }
        }
        return [oldProps];
      }),
      css: function(props, options) {
        if (typeof props === "string") {
          return this.rObj.attr(props);
        } else {
          return this._setattrs(props, options);
        }
      },
      state: function(newState) {
        if (typeof newState !== "undefined") {
          for (var i in newState) {
            if (newState.hasOwnProperty(i)) {
              this.rObj.attr(i, newState[i]);
            }
          }
          return this;
        } else {
          var attrs = $.extend(true, {}, this.rObj.attrs);
          return attrs;
        }
      },
      bounds: function() {
        var bbox = this.rObj.getBBox();
        return { left: bbox.x, top: bbox.y, width: bbox.width, height: bbox.height };
      },
      id: JSAV._types.JSAVObject.prototype.id,
      clear: function() {
        this.rObj.remove();
      }
    };
    var graphicalproto = JSAVGraphical.prototype;
    graphicalproto.addClass = JSAV.utils._helpers.addClass;
    graphicalproto.removeClass = JSAV.utils._helpers.removeClass;
    graphicalproto.hasClass = JSAV.utils._helpers.hasClass;
    graphicalproto.toggleClass = JSAV.anim(JSAV.utils._helpers._toggleClass);

    // events to register as functions on the graphical primitive "super"prototype
    var events = ["click", "dblclick", "mousedown", "mousemove", "mouseup",
      "mouseenter", "mouseleave"];
    // returns a function for the passed eventType that binds a passed
    // function to that eventType for the graphical primitive
    var eventhandler = function(eventType) {
      return function(data, handler) {
        // store reference to this, needed when executing the handler
        var self = this;
        // bind a jQuery event handler, limit to .jsavindex
        this.element.on(eventType, function(e) {
          // log the event
          self.jsav.logEvent({type: "jsav-graphical-" + eventType, objid: self.id()});
          if ($.isFunction(data)) { // if no custom data..
            // ..bind this to the graphical primitive and call handler
            // with the event as param
            data.call(self, e);
          } else if ($.isFunction(handler)) { // if custom data is passed
            // ..bind this to the graphical primitive and call handler
            var params = $.isArray(data)?data.slice(0):[data]; // get a cloned data array or data as array
            params.push(e); // jQuery event as the last
            handler.apply(self, params); // apply the function
          }
        });
        return this;
      };
    };
    // create the event binding functions and add to the prototype
    for (var i = events.length; i--; ) {
      graphicalproto[events[i]] = eventhandler(events[i]);
    }
    // a function to bind any other events then the ones specially registered
    graphicalproto.on = function(eventName, data, handler) {
      eventhandler(eventName).call(this, data, handler);
      return this;
    };

    var init = function(obj, jsav, props) {
      obj.jsav = jsav;
      obj.element = $(obj.rObj.node).data("svgelem", obj.rObj);
      var prop = $.extend({'visible': true}, props);
      for (var i in prop) {
        if (prop.hasOwnProperty(i)) {
          obj.rObj.attr(i, prop[i]);
        }
      }
      // if opacity not set manually, we'll hide the object and show it if it
      // should be visible
      if (!('opacity' in prop)) {
        obj.rObj.attr('opacity', 0);
        var visible = (typeof prop.visible === "boolean" &&
                      prop.visible === true);
        if (visible) {
          obj.show(prop);
        }
      }
    };

    // Function for translating one point in a path object such as line or polyline.
    // Parameter point should be an index of a point, for example, 0 for the start
    // point of a line. Parameters dx and dy tell how much the point should be
    // translated.
    var translatePoint  = function(point, dx, dy, options) {
      var currPath = this.rObj.attrs.path,
          newPath = "",
          pathElem;
      if (point > currPath.length) { return this; }
      for (var i=0, l=currPath.length; i < l; i++) {
        pathElem = currPath[i];
        if (i === point) {
          newPath += pathElem[0] + " " + (+pathElem[1] + dx) + " " +
                    (+pathElem[2] + dy);
        } else {
          newPath += pathElem.join(' ');
        }
      }
      this._setattrs({"path": newPath}, options);
      return this;
    };

    // A function for changing the points of a path such as a line of polyline
    // Parameter points should be an array of points that should be changed.
    // For example, to change points 0 and 3 in a polyline points should be:
    //  [[0, new0X, new0Y], [3, new3X, new3Y]]
    var movePoints  = function(points, options) {
      var currPath = this.rObj.attrs.path,
          newPath = currPath.slice(),
          newPoints = this.points(),
          pathElem, i, l;
      for (i = 0, l = points.length; i < l; i++) {
        var p = points[i];
        pathElem = currPath[p[0]];
        newPath[p[0]] = [pathElem[0], p[1], p[2]];
        newPoints[p[0]] = p.slice(1);
      }
      var np = "";
      for (i = 0, l = newPath.length; i < l; i++) {
        pathElem = newPath[i];
        np += pathElem.join(' ');
      }
      this._setpoints(newPoints);
      this._setattrs({"path": np}, $.extend({dontAnimate: ("" + currPath) === "M-1,-1L-1,-1"}, options));
      return this;
    };
    var _setpoints = JSAV.anim(function (newPoints) {
      var oldPoints = $.extend(true, [], this._points);
      this._points = newPoints;
      return [oldPoints];
    });
    // A function for getting the points of a path such as a line or polyline
    var points = function() {
      return $.extend(true, [], this._points); // deep copy of points
    };

    var Circle = function(jsav, raphael, x, y, r, props) {
      this.rObj = raphael.circle(x, y, r);
      init(this, jsav, props);
      return this;
    };
    JSAV.utils.extend(Circle, JSAVGraphical);
    var cproto = Circle.prototype;
    cproto.center = function(x, y, options) {
      if (typeof x === "undefined") { // getting center
        return this.rObj.attr(["cx", "cy"]);
      } else if ($.isArray(x) && x.length === 2) {
        this._setattrs({"cx": x[0], "cy": x[1]}, options);
      } else if (typeof y !== "undefined") {
        this._setattrs({"cx": x, "cy": y}, options);
      } else if ("cx" in x && "cy" in x) {
        this._setattrs(x, options);
      }
      return this;
    };
    cproto.radius = function(r, options) {
      if (typeof r === "undefined") {
        return this.rObj.attr("r");
      } else {
        this._setattrs({"r": r}, options);
        return this;
      }
    };

    var Rect = function(jsav, raphael, x, y, w, h, r, props) {
      this.rObj = raphael.rect(x, y, w, h, r);
      init(this, jsav, props);
      return this;
    };
    JSAV.utils.extend(Rect, JSAVGraphical);
    var rectproto = Rect.prototype;
    rectproto.width = function(w, options) {
      if (typeof w === "undefined") {
        return this.rObj.attr("width");
      } else {
        this._setattrs({"width": w}, options);
        return this;
      }
    };
    rectproto.height = function(h, options) {
      if (typeof h === "undefined") {
        return this.rObj.attr("height");
      } else {
        this._setattrs({"height": h}, options);
        return this;
      }
    };

    var Line = function(jsav, raphael, x1, y1, x2, y2, props) {
      this.rObj = raphael.path("M" + x1 + " "+ y1 + "L" + x2 + " " + y2);
      init(this, jsav, props);
      this._points = [[x1, y1], [x2, y2]];
      return this;
    };
    JSAV.utils.extend(Line, JSAVGraphical);

    Line.prototype.translatePoint = translatePoint;
    Line.prototype._polylineMovePoints = movePoints;
    Line.prototype.movePoints = function(newx1, newy1, newx2, newy2) {
      if ($.isArray(newx1)) {
        // assume it's an array suitable for "general" movePoints
        return this._polylineMovePoints(newx1);
      } else {
        // otherwise create an array suitable for "general" movePoints
        return this._polylineMovePoints([[0, newx1, newy1], [1, newx2, newy2]]);
      }
    };
    Line.prototype.points = points;
    Line.prototype._setpoints = _setpoints;

    var Ellipse = function(jsav, raphael, x, y, rx, ry, props) {
      this.rObj = raphael.ellipse(x, y, rx, ry);
      init(this, jsav, props);
      return this;
    };
    JSAV.utils.extend(Ellipse, JSAVGraphical);
    var ellproto = Ellipse.prototype;
    ellproto.center = cproto.center;
    ellproto.radius = function(x, y, options) {
      if (typeof x === "undefined") { // getting radius
        return this.rObj.attr(["rx", "ry"]);
      } else if ($.isArray(x) && x.length === 2) {
        this._setattrs({"rx": x[0], "ry": x[1]}, options);
      } else if (typeof y !== "undefined") {
        this._setattrs({"rx": x, "ry": y}, options);
      } else if ("rx" in x && "ry" in x) {
        this._setattrs(x, options);
      }
      return this;
    };


    var Polyline = function(jsav, raphael, points, close, props) {
      var path = "M ";
      for (var i=0, l=points.length; i < l; i++) {
        if (i) { path += "L";}
        path += points[i][0] + " " + points[i][1];
      }
      if (close) {
        path += "Z";
      }
      this.rObj = raphael.path(path);
      init(this, jsav, props);
      this._points = points;
      return this;
    };
    JSAV.utils.extend(Polyline, JSAVGraphical);

    Polyline.prototype.translatePoint = translatePoint;
    Polyline.prototype.movePoints = movePoints;
    Polyline.prototype.points = points;
    Polyline.prototype._setpoints = _setpoints;

    var Path = function(jsav, raphael, path, props) {
      this.rObj = raphael.path(path);
      init(this, jsav, props);
      return this;
    };
    JSAV.utils.extend(Path, JSAVGraphical);
    Path.prototype.path = function(newPath, options)  {
      if (typeof newPath === "undefined") {
        return this.rObj.attr("path");
      } else {
        return this._setattrs({ path: newPath }, options);
      }
    };

    var Set = function(jsav, raphael, props) {
      this.rObj = raphael.set();
      init(this, jsav, props);
      return this;
    };
    JSAV.utils.extend(Set, JSAVGraphical);
    var setproto = Set.prototype;
    setproto.push = function(g) {
      this.rObj.push(g.rObj);
      return this;
    };
    var getSvgCanvas = function(jsav, props) {
      if (typeof props === "undefined" || !props.container) {
        return jsav.getSvg();
      } else {
        return props.container.getSvg();
      }
    };
    JSAV.ext.g = {
      circle: function(x, y, r, props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Circle(this, svgCanvas, x, y, r, props);
      },
      rect: function(x, y, w, h, r, props) {
        // if border-radius not given, assume r is options and radius is 0
        if (typeof(r) === "object") {
          props = r;
          r = 0;
        }
        var svgCanvas = getSvgCanvas(this, props);
        return new Rect(this, svgCanvas, x, y, w, h, r, props);
      },
      line: function(x1, y1, x2, y2, props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Line(this, svgCanvas, x1, y1, x2, y2, props);
      },
      ellipse: function(x, y, rx, ry, props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Ellipse(this, svgCanvas, x, y, rx, ry, props);
      },
      polyline: function(points, props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Polyline(this, svgCanvas, points, false, props);
      },
      polygon: function(points, props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Polyline(this, svgCanvas, points, true, props);
      },
      path: function(path, props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Path(this, svgCanvas, path, props);
      },
      set: function(props) {
        var svgCanvas = getSvgCanvas(this, props);
        return new Set(this, svgCanvas);
      }
    };

    // expose the types
    var gTypes = {
      JSAVGraphical: JSAVGraphical,
      Circle: Circle,
      Rect: Rect,
      Line: Line,
      Ellipse: Ellipse,
      Polyline: Polyline,
      Path: Path,
      Set: Set
    };
    JSAV._types.g = gTypes;

    // jQuery incorrectly returns 0 for width and height of SVG elements
    // this is a workaround for that bug and returns the correct values
    // for SVG elements and uses default jQuery implementation for other
    // elements. Note, that only get is fixed and set uses default jQuery
    // implementation.
    var svgElements = ["circle", "path", "rect", "ellipse", "line", "polyline", "polygon"],
        origWidthHook = $.cssHooks.width,
        origHeightHook = $.cssHooks.height;
    $.cssHooks.width = {
      get: function(elem, computed, extra) {
        // if an SVG element, handle getting the width properly
        if (svgElements.indexOf(elem.nodeName) !== -1) {
          return elem.getBoundingClientRect().width;
        }
        return origWidthHook.get(elem, computed, extra);
      },
      set: origWidthHook.set
    };
    $.cssHooks.height = {
      get: function(elem, computed, extra) {
        // if an SVG element, handle getting the height properly
        if (svgElements.indexOf(elem.nodeName) !== -1) {
          return elem.getBoundingClientRect().height;
        }
        return origHeightHook.get(elem, computed, extra);
      },
      set: origHeightHook.set
    };

    /*!
    Following utility functions for handling SVG elements add/remove/toggle/hasClass
    functions are implemented by Keith Wood. See:
   http://keith-wood.name/svg.html
   jQuery DOM compatibility for jQuery SVG
   Written by Keith Wood (kbwood{at}iinet.com.au) April 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */
    $.svg = {
      isSVGElem: function(node) {
        return (node.nodeType == 1 && node.namespaceURI == 'http://www.w3.org/2000/svg');
      }
    };
    /* Support adding class names to SVG nodes. */
    $.fn.addClass = function(origAddClass) {
      return function(classNames) {
        classNames = classNames || '';
        return this.each(function() {
          if ($.svg.isSVGElem(this)) {
            var node = this;
            $.each(classNames.split(/\s+/), function(i, className) {
              var classes = (node.className ? node.className.baseVal : node.getAttribute('class'));
              if ($.inArray(className, classes.split(/\s+/)) == -1) {
                classes += (classes ? ' ' : '') + className;
                (node.className ? node.className.baseVal = classes :
                  node.setAttribute('class',  classes));
              }
            });
          }
          else {
            origAddClass.apply($(this), [classNames]);
          }
        });
      };
    }($.fn.addClass);

    /* Support removing class names from SVG nodes. */
    $.fn.removeClass = function(origRemoveClass) {
      return function(classNames) {
        classNames = classNames || '';
        return this.each(function() {
          if ($.svg.isSVGElem(this)) {
            var node = this;
            $.each(classNames.split(/\s+/), function(i, className) {
              var classes = (node.className ? node.className.baseVal : node.getAttribute('class'));
              classes = $.grep(classes.split(/\s+/), function(n, i) { return n != className; }).
                join(' ');
              (node.className ? node.className.baseVal = classes :
                node.setAttribute('class', classes));
            });
          }
          else {
            origRemoveClass.apply($(this), [classNames]);
          }
        });
      };
    }($.fn.removeClass);

    /* Support toggling class names on SVG nodes. */
    $.fn.toggleClass = function(origToggleClass) {
      return function(className, state) {
        return this.each(function() {
          if ($.svg.isSVGElem(this)) {
            if (typeof state !== 'boolean') {
              state = !$(this).hasClass(className);
            }
            $(this)[(state ? 'add' : 'remove') + 'Class'](className);
          }
          else {
            origToggleClass.apply($(this), [className, state]);
          }
        });
      };
    }($.fn.toggleClass);

    /* Support checking class names on SVG nodes. */
    $.fn.hasClass = function(origHasClass) {
      return function(className) {
        className = className || '';
        var found = false;
        this.each(function() {
          if ($.svg.isSVGElem(this)) {
            var classes = (this.className ? this.className.baseVal :
              this.getAttribute('class')).split(/\s+/);
            found = ($.inArray(className, classes) > -1);
          }
          else {
            found = (origHasClass.apply($(this), [className]));
          }
          return !found;
        });
        return found;
      };
    }($.fn.hasClass);
    /*! End Keith Wood's utilities */

  }(jQuery, Raphael));

} else { // end if Raphael !== "undefined"
  // if raphael is not loaded, create dummy functions which warn when using primitives without Raphael
  var error = function() {
    console.error("You are trying to use graphical primitives but forgot to load Raphael.js.");
  };
  var g = {};
  var names = ["circle", "rect", "line", "ellipse", "polyline", "polygon", "path", "set"];
  for (var i = names.length; i--; ) { g[names[i]] = error; }
  JSAV.ext.g = g;
}

(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  var Label = function(jsav, text, options) {
    this.jsav = jsav;
    this.options = $.extend({visible: true}, options);
    this.element = $('<div class="jsavlabel">' + text + '</div>');
    if (this.options.before) {
      this.element.insertBefore(this.options.before.element);
    } else if (this.options.after) {
      this.element.insertAfter(this.options.after.element);
    } else if (this.options.container) {
      this.options.container.append(this.element);
    } else {
      $(this.jsav.canvas).append(this.element);
    }
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(Label, JSAV._types.JSAVObject);
  var labelproto = Label.prototype;
  labelproto._toggleVisible = JSAV.anim(JSAV.ext.effects._toggleVisible);
  labelproto.show = JSAV.ext.effects.show;
  labelproto.hide = JSAV.ext.effects.hide;
  labelproto._setText = JSAV.anim(
    function(newText) {
      this.element.html(newText);
    }
  );
  labelproto.text = function(newValue, options) {
    if (typeof newValue === "undefined") {
      return this.element.html();
    } else {
      this._setText(newValue, options);
      return this;
    }
  };
  // add value(..) function as an alias for text
  labelproto.value = labelproto.text;
  labelproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      this.text(newState.t, {record: false});
      JSAV.utils._helpers.setElementClasses(this.element, newState.cls || []);
      this.element.attr("style", newState.css || "");
    } else {
      var state = {t: this.text()},
        style = this.element.attr("style");
      var cls = JSAV.utils._helpers.elementClasses(this.element);
      if (cls.length > 0) {
        state.cls = cls;
      }
      if (style) {
        state.css = style;
      }
      return state;
    }
  };
  labelproto.equals = function(otherLabel, options) {
    if (!otherLabel || !(otherLabel instanceof Label) ||
      this.text() !== otherLabel.text()) { return false; }
    // compare styling of the variables
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherLabel, options.css);
      if (!cssEquals) { return false; }
    }

    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherLabel, options["class"]);
      if (!classEquals) { return false; }
    }
    return true;

  }
  labelproto.css = JSAV.utils._helpers.css;
  labelproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);
  labelproto.addClass = JSAV.utils._helpers.addClass;
  labelproto.removeClass = JSAV.utils._helpers.removeClass;
  labelproto.hasClass = JSAV.utils._helpers.hasClass;
  labelproto.toggleClass = JSAV.anim(JSAV.utils._helpers._toggleClass);
  JSAV._types.Label = Label; // expose the label type

  JSAV.ext.label = function(text, options) {
    return new Label(this, text, options);
  };
}(jQuery));
/**
* Module that contains the data structure implementations.
* Depends on core.js, anim.js, utils.js, effects.js
*/
/*global JSAV, jQuery, Raphael */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  // create a utility function as a jQuery "plugin"
  $.fn.getstyles = function() {
    // Returns the values of CSS properties that are given as
    // arguments. For example, $elem.getstyles("background-color", "color")
    // could return an object {"background-color" : "rgb(255, 120, 120)",
    //                         "color" : "rgb(0, 0, 0)"}
    var res = {},
      arg;
    for (var i = 0; i < arguments.length; i++) {
      arg = arguments[i];
      if ($.isArray(arg)) {
        for (var j = 0; j < arg.length; j++) {
          res[arg[j]] = this.css(arg[j]);
        }
      } else {
        res[arg] = this.css(arg);
      }
    }
    return res;
  };

  // common properties/functions for all data structures, these can be copied
  // to the prototype of a new DS using the addCommonProperties(prototype) function
  var JSAVDataStructure = function() {};
  JSAV.utils.extend(JSAVDataStructure, JSAV._types.JSAVObject);
  var dsproto = JSAVDataStructure.prototype;
  dsproto.getSvg = function() {
      if (!this.svg) { // lazily create the SVG overlay only when needed
        this.svg = new Raphael(this.element[0]);
        this.svg.renderfix();
        var style = this.svg.canvas.style;
        style.position = "absolute";
      }
      return this.svg;
    };
  dsproto._toggleVisible = JSAV.anim(JSAV.ext.effects._toggleVisible);
  dsproto.show = JSAV.ext.effects.show;
  dsproto.hide = JSAV.ext.effects.hide;
  dsproto.addClass = JSAV.utils._helpers.addClass;
  dsproto.removeClass = JSAV.utils._helpers.removeClass;
  dsproto.hasClass = JSAV.utils._helpers.hasClass;
  dsproto.toggleClass = JSAV.anim(JSAV.utils._helpers._toggleClass);
  // dummy methods for initializing a DS, the DS should override these
  dsproto.initialize = function() { };
  dsproto.initializeFromElement = function() { };
  dsproto.clone = function() {};



  // implementation for a tree edge
  var Edge = function(jsav, start, end, options) {
    this.jsav = jsav;
    this.startnode = start;
    this.endnode = end;
    this.options = $.extend(true, {"display": true}, options);
    this.container = start.container;
    var startPos = start?start.element.position():{left:0, top:0},
        endPos = end?end.element.position():{left:0, top:0};
    if (startPos.left === endPos.left && startPos.top === endPos.top) {
      // layout not done yet
      this.g = this.jsav.g.line(-1, -1, -1, -1, $.extend({container: this.container}, this.options));
    } else {
      if (end) {
        endPos.left += end.element.outerWidth() / 2;
        endPos.top += end.element.outerHeight();
      }
      if (!startPos.left && !startPos.top) {
        startPos = endPos;
      }
      this.g = this.jsav.g.line(startPos.left,
                              startPos.top,
                              endPos.left,
                              endPos.top, $.extend({container: this.container}, this.options));
    }

    this.element = $(this.g.rObj.node);

    var visible = (typeof this.options.display === "boolean" && this.options.display === true);
    this.g.rObj.attr({"opacity": 0});
    this.element.addClass("jsavedge");
    if (start) {
      this.element[0].setAttribute("data-startnode", this.startnode.id());
    }
    if (end) {
      this.element[0].setAttribute("data-endnode", this.endnode.id());
    }
    this.element[0].setAttribute("data-container", this.container.id());
    this.element.data("edge", this);

    if (typeof this.options.weight !== "undefined") {
      this._weight = this.options.weight;
      this.label(this._weight);
    }
    if (visible) {
      this.g.show();
    }
  };
  JSAV.utils.extend(Edge, JSAVDataStructure);
  var edgeproto = Edge.prototype;
  edgeproto.start = function(node, options) {
    if (typeof node === "undefined") {
      return this.startnode;
    } else {
      this.startnode = node;
      this.g.rObj.node.setAttribute("data-startnode", this.startnode?this.startnode.id():"");
      return this;
    }
  };
  edgeproto.end = function(node, options) {
    if (typeof node === "undefined") {
      return this.endnode;
    } else {
      this.endnode = node;
      this.g.rObj.node.setAttribute("data-endnode", this.endnode?this.endnode.id():"");
      return this;
    }
  };
  edgeproto._setweight = JSAV.anim(function(newWeight) {
    var oldWeight = this._weight;
    this._weight = newWeight;
    return [oldWeight];
  });
  edgeproto.weight = function(newWeight) {
    if (typeof newWeight === "undefined") {
      return this._weight;
    } else {
      this._setweight(newWeight);
      this.label(newWeight);
    }
  };
  edgeproto.clear = function() {
    this.g.rObj.remove();
  };
  edgeproto.hide = function(options) {
    if (this.g.isVisible()) {
      this.g.hide(options);
      if (this._label) { this._label.hide(options); }
    }
  };
  edgeproto.show = function(options) {
    if (!this.g.isVisible()) {
      this.g.show(options);
      if (this._label) { this._label.show(options); }
    }
  };
  edgeproto.isVisible = function() {
    return this.g.isVisible();
  };
  edgeproto.label = function(newLabel, options) {
    if (typeof newLabel === "undefined") {
      if (this._label && this._label.element.filter(":visible").size() > 0) {
        return this._label.text();
      } else {
        return undefined;
      }
    } else {
      if (!this._label) {
        var self = this;
        var _labelPositionUpdate = function(options) {
          if (!self._label) { return; } // no label, nothing to do
          var bbox = (options && options.bbox) ? options.bbox: self.g.bounds(),
              lbbox = self._label.bounds(),
              newTop = bbox.top + (bbox.height - lbbox.height)/2,
              newLeft = bbox.left + (bbox.width - lbbox.width)/2;
          if (newTop !== lbbox.top || newLeft || lbbox.left) {
            self._label.css({top: newTop, left: newLeft}, options);
          }
        };
        this._labelPositionUpdate = _labelPositionUpdate;
        this._label = this.jsav.label(newLabel, {container: this.container.element});
        this._label.element.addClass("jsavedgelabel");
      } else {
        this._label.text(newLabel, options);
      }
    }
  };

  edgeproto.equals = function(otherEdge, options) {
    if (!otherEdge || !otherEdge instanceof Edge) {
      return false;
    }
    //if (!options || !(typeof options.checkNodes === "boolean" && !options.checkNodes)) {
    if (options && !options.dontCheckNodes) {
      if (!this.startnode.equals(otherEdge.startnode) ||
                !this.endnode.equals(otherEdge.endnode)) {
        return false;
      }
    }
    // if edge weights are different, the edges are different
    if (this._weight !== otherEdge._weight) { return false; }

    // compare styling of the edges
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherEdge, options.css);
      if (!cssEquals) { return false; }
    }

    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherEdge, options["class"]);
      if (!classEquals) { return false; }
    }

    return true;
  };

  edgeproto._setcss = JSAV.anim(function(cssprop, value) {
    var oldProps = $.extend(true, {}, cssprop),
        el = this.g.rObj,
        newprops;
    if (typeof cssprop === "string" && typeof value !== "undefined") {
      oldProps[cssprop] = el.attr(cssprop);
      newprops = {};
      newprops[cssprop] = value;
    } else {
      for (var i in cssprop) {
        if (cssprop.hasOwnProperty(i)) {
          oldProps[i] = el.attr(i);
        }
      }
      newprops = cssprop;
    }
    if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
      el.animate(newprops, this.jsav.SPEED);
    } else {
      el.attr(newprops);
    }
    return [oldProps];
  });
  edgeproto.css = function(cssprop, value, options) {
    if (typeof cssprop === "string" && typeof value === "undefined") {
      return this.g.rObj.attr(cssprop);
    } else {
      return this._setcss(cssprop, value, options);
    }
  };
  edgeproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      this.g.css(newState.a); // set the css of the element
      JSAV.utils._helpers.setElementClasses(this.element, newState.cls || []); // set classes
      if (newState.l) { // set label
        this.label(newState.l, {record: false});
      } else if (this.label()) {
        this.label("");
      }
      if (newState.w) { // set weight
        this.weight(newState.w);
      } else if (this.weight()) {
        this.weight("");
      }
    } else {
      var state = {a: this.g.rObj.attrs}, // get all attrs set for the element
          cls = JSAV.utils._helpers.elementClasses(this.element); // get classes
      if (cls.length > 0) { state.cls = cls; }
      if (this.label()) { state.l = this.label(); } // label
      if (this._weight) { state.w = this.weight(); } // weight

      return state;
    }
  };
  edgeproto.position = function() {
    var bbox = this.g.bounds();
    return {left: bbox.left, top: bbox.top};
  };
  // add class handling functions
  edgeproto.addClass = function(className, options) {
    if (!this.element.hasClass(className)) {
      return this.toggleClass(className, options);
    } else {
      return this;
    }
  };
  edgeproto.removeClass = function(className, options) {
    if (this.element.hasClass(className)) {
      return this.toggleClass(className, options);
    } else {
      return this;
    }
  };
  edgeproto.hasClass = function(className) {
    return this.element.hasClass(className);
  };
  edgeproto.toggleClass = JSAV.anim(function(className, options) {
    this.element.toggleClass(className);
    return [className, options];
  });
  // add highlight/unhighlight functions, essentially only toggle jsavhighlight class
  edgeproto.highlight = function(options) {
    this.addClass("jsavhighlight", options);
  };
  edgeproto.unhighlight = function(options) {
    this.removeClass("jsavhighlight", options);
  };

  edgeproto.layout = function(options) {
    var sElem = this.start().element,
        eElem = this.end().element,
        start = (options && options.start)?options.start:this.start().position(),
        end = (options && options.end)?options.end:this.end().position(),
        sWidth = sElem.outerWidth()/2.0,
        sHeight = sElem.outerHeight()/2.0,
        eWidth = eElem.outerWidth()/2.0,
        eHeight = eElem.outerHeight()/2.0,
        fromX = (options && options.fromPoint)?options.fromPoint[0]:Math.round(start.left + sWidth),
        fromY = (options && options.fromPoint)?options.fromPoint[1]:Math.round(start.top + sHeight),
        toX = Math.round(end.left + eWidth),
        toY = Math.round(end.top + eHeight),
        fromAngle = normalizeAngle(2*Math.PI - Math.atan2(toY - fromY, toX - fromX)),
        toAngle = normalizeAngle(2*Math.PI - Math.atan2(fromY - toY, fromX - toX)),
        startRadius = parseInt(sElem.css("borderBottomRightRadius"), 10) || 0,
        ADJUSTMENT_MAGIC = 2.2, // magic number to work with "all" stroke widths
        strokeWidth = parseInt(this.g.element.css("stroke-width"), 10),
        // adjustment for the arrow drawn before the end of the edge line
        startStrokeAdjust = this.options["arrow-begin"]? strokeWidth * ADJUSTMENT_MAGIC:0,
        fromPoint = (options && options.fromPoint)?options.fromPoint:
                                    getNodeBorderAtAngle({width: sWidth + startStrokeAdjust,
                                                          height: sHeight + startStrokeAdjust,
                                                          x: fromX, y: fromY}, {x: toX, y: toY}, fromAngle, startRadius),
        // arbitrarily choose to use bottom-right border radius
        endRadius = parseInt(eElem.css("borderBottomRightRadius"), 10) || 0,
        // adjustment for the arrow drawn after the end of the edge line
        endStrokeAdjust = this.options["arrow-end"]?strokeWidth * ADJUSTMENT_MAGIC:0,
        toPoint = getNodeBorderAtAngle({width: eWidth + endStrokeAdjust, height: eHeight + endStrokeAdjust, x: toX, y: toY},
                                        {x: fromX, y: fromY}, toAngle, endRadius);
    // getNodeBorderAtAngle returns an array [x, y], and movePoints wants the point position
    // in the (poly)line as first item in the array, so we'll create arrays like [0, x, y] and
    // [1, x, y]
    this.g.movePoints([[0].concat(fromPoint), [1].concat(toPoint)], options);

    if ($.isFunction(this._labelPositionUpdate)) {
      var bbtop = Math.min(fromPoint[1], toPoint[1]),
          bbleft = Math.min(fromPoint[0], toPoint[0]),
          bbwidth = Math.abs(fromPoint[0] - toPoint[0]),
          bbheight = Math.abs(fromPoint[1] - toPoint[1]),
          bbox = {top: bbtop, left: bbleft, width: bbwidth, height: bbheight};
      this._labelPositionUpdate($.extend({bbox: bbox}, options));
    }

    if (this.start().value() === "jsavnull" || this.end().value() === "jsavnull") {
      this.addClass("jsavedge", options).addClass("jsavnulledge", options);
    } else {
      this.addClass("jsavedge", options).removeClass("jsavnulledge");
    }
  };

  // helper functions for edge position calculation
  function normalizeAngle(angle) {
    var pi = Math.PI;
    while (angle < 0) {
      angle += 2 * pi;
    }
    while (angle >= 2 * pi) {
      angle -= 2 * pi;
    }
    return angle;
  }

  // calculate the intersection of line from pointa to pointb and circle with the given center and radius
  function lineIntersectCircle(pointa, pointb, center, radius) {
    var result = {};
    var a = (pointb.x - pointa.x) * (pointb.x - pointa.x) + (pointb.y - pointa.y) * (pointb.y - pointa.y);
    var b = 2 * ((pointb.x - pointa.x) * (pointa.x - center.x) +(pointb.y - pointa.y) * (pointa.y - center.y));
    var cc = center.x * center.x + center.y * center.y + pointa.x * pointa.x + pointa.y * pointa.y -
                2 * (center.x * pointa.x + center.y * pointa.y) - radius * radius;
    var deter = b * b - 4 * a * cc;
    function interpolate(p1, p2, d) {
      return {x: p1.x+(p2.x-p1.x)*d, y:p1.y+(p2.y-p1.y)*d};
    }
    if (deter <= 0 ) {
      result.inside = false;
    } else {
      var e = Math.sqrt (deter);
      var u1 = ( - b + e ) / (2 * a );
      var u2 = ( - b - e ) / (2 * a );
      if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
        if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
          result.inside = false;
        } else {
          result.inside = true;
        }
      } else {
        if (0 <= u2 && u2 <= 1) {
          result.enter=interpolate (pointa, pointb, u2);
        }
        if (0 <= u1 && u1 <= 1) {
          result.exit=interpolate (pointa, pointb, u1);
        }
        result.intersects = true;
      }
    }
    return result;
  }

  function getNodeBorderAtAngle(dim, targetNodeCenter, angle, radius) {
    // dim: x, y coords of center and *half* of width and height
    // make sure they have non-zero values
    dim.width = Math.max(dim.width, 1);
    dim.height = Math.max(dim.height, 1);
    var x, y, pi = Math.PI,
        urCornerA = Math.atan2(dim.height*2.0, dim.width*2.0),
        ulCornerA = pi - urCornerA,
        lrCornerA = 2*pi - urCornerA,
        llCornerA = urCornerA + pi,
        intersect, topAngle, bottomAngle, leftAngle, rightAngle;
    // set the radius to be at most half the width or height of the element
    radius = Math.min(radius, dim.width, dim.height);
    // on the higher level, divide area (2pi) to four seqments based on which way the edge will be drawn:
    //  - right side (angle < 45deg or angle > 315deg)
    //  - top (45deg < angle < 135deg) or (pi/4 < angle < (3/4)*pi)
    //  - left side (135deg < angle < 225deg)
    //  - bottom (225deg < angle < 315deg)
    // Each of these areas will then be divided to three sections:
    //  - middle section, where the node border is a line
    //  - two sections where the node border is part of the rounded corner circle
    if (angle < urCornerA || angle > lrCornerA) { // on right side
      topAngle = Math.atan2(dim.height - radius, dim.width);
      bottomAngle = 2*pi - topAngle;
      // default to the right border line
      x = dim.x + dim.width;
      y = dim.y - dim.width * Math.tan(angle);

      // handle the rounded corners if necessary
      if (radius > 0 && angle > topAngle && angle < bottomAngle) { // the rounded corners
        // calculate intersection of the line between node centers and the rounded corner circle
        if (angle < bottomAngle && angle > pi) { // bottom right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter,
                                      {x: dim.x + dim.width - radius, y: dim.y + dim.height - radius}, radius);
        } else { // top right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter,
                                      {x: dim.x + dim.width - radius, y: dim.y - dim.height + radius}, radius);
        }
      }
    } else if (angle > ulCornerA && angle < llCornerA) { // left
      topAngle = pi - Math.atan2(dim.height - radius, dim.width);
      bottomAngle = 2*pi - topAngle;

      // default to the left border line
      x = dim.x - dim.width;
      y = dim.y + dim.width*Math.tan(angle);

      // handle the rounded corners
      if (radius > 0 && (angle < topAngle || angle > bottomAngle)) {
        if (topAngle > angle) { // top left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y - dim.height + radius}, radius); // circle
        } else { // bottom left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y + dim.height - radius}, radius); // circle
        }
      }
    } else if (angle <= ulCornerA) { // top
      rightAngle = Math.atan2(dim.height, dim.width - radius);
      leftAngle = pi - rightAngle;

      // default to the top border line
      y = dim.y - dim.height;
      x = dim.x + (dim.height)/Math.tan(angle);

      // handle the rounded corners
      if (radius > 0 && (angle > leftAngle || angle < rightAngle)) {
        if (angle > leftAngle) { // top left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y - dim.height + radius}, radius); // circle
        } else { // top right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x + dim.width - radius, y: dim.y - dim.height + radius}, radius); // circle
        }
      }
    } else { // on bottom side
      leftAngle = pi + Math.atan2(dim.height, dim.width-radius);
      rightAngle = 2*pi - Math.atan2(dim.height, dim.width-radius);

      // default to the bottom border line
      y = dim.y + dim.height;
      x = dim.x - (dim.height)/Math.tan(angle);
      if (radius > 0 && (angle < leftAngle || angle > rightAngle)) {
        if (angle > rightAngle) { // bottom right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x + dim.width - radius, y: dim.y + dim.height - radius}, radius); // circle
        } else { // bottom left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y + dim.height - radius}, radius); // circle
        }
      }
    }
    // if on a corner and we found an intersection, set that as the edge coordinates
    if (intersect && intersect.exit) {
      x = intersect.exit.x;
      y = intersect.exit.y;
    }
    return [Math.round(x), Math.round(y)];
  }


  var Node = function() {};
  JSAV.utils.extend(Node, JSAVDataStructure);
  var nodeproto = Node.prototype;

  nodeproto.value = function(newVal, options) {
    if (typeof newVal === "undefined") {
      return JSAV.utils.value2type(this.element.attr("data-value"), this.element.attr("data-value-type"));
    } else {
      this._setvalue(newVal, options);
    }
    return this;
  };
  nodeproto._setvalue = JSAV.anim(function(newValue) {
    var oldVal = this.value(),
      valtype = typeof(newValue);
    if (typeof oldVal === "undefined") {oldVal = ""};
    if (valtype === "object") { valtype = "string"; }
    this.element
      .find(".jsavvalue") // find the .jsavvalue element
      .html(this._valstring(newValue)) // set the HTML to new value
      .end() // go back to this.element
      .attr({"data-value": newValue, "data-value-type": valtype}); // set attributes
    return [oldVal];
  });
  nodeproto._valstring = function(value) {
    return "<span class='jsavvaluelabel'>" + value + "</span>";
  };
  nodeproto.highlight = function(options) {
    return this.addClass("jsavhighlight");
  };
  nodeproto.unhighlight = function(options) {
    return this.removeClass("jsavhighlight");
  };
  nodeproto.isHighlight = function() {
    return this.hasClass("jsavhighlight");
  };
  // NOTE: the state function only sets state of the node, not
  // things like edges out of the node
  nodeproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      this.value(newState.v, {record: false});
      JSAV.utils._helpers.setElementClasses(this.element, newState.cls || []);
      this.element.attr("style", newState.css || "");
    } else {
      var state = { v: this.value() },
        style = this.element.attr("style");
      var cls = JSAV.utils._helpers.elementClasses(this.element);
      if (cls.length > 0) {
        state.cls = cls;
      }
      if (style) {
        state.css = style;
      }
      return state;
    }
  };

  nodeproto.css = JSAV.utils._helpers.css;
  nodeproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  JSAV._types.ds = { "JSAVDataStructure": JSAVDataStructure, "Edge": Edge, "Node": Node };
  // expose the extend for the JSAV
  JSAV.ext.ds = {
    layout: { }
  };
}(jQuery));

/**
* Module that contains the array data structure implementations.
* Depends on core.js, anim.js, utils.js, effects.js, datastructures.js
*/
/* global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  var getIndices = JSAV.utils._helpers.getIndices;

  // templates used to create new elements into the array, depending on the layout options
  var templates = { };
  templates.array =  '<span class="jsavvalue">' +
                            '<span class="jsavvaluelabel">{{value}}</span>' +
                          '</span>';
  templates["array-indexed"] = templates.array +
                          '<span class="jsavindexlabel">{{index}}</span>';
  templates.vertical = templates.array;
  templates["vertical-indexed"] = templates["array-indexed"];
  templates.bar = '<span class="jsavvaluebar"></span>' + templates.array;
  templates["bar-indexed"] = templates.bar + '<span class="jsavindexlabel">{{index}}</span>';


  var ArrayIndex = function(container, value, index, options) {
    this.jsav = container.jsav;
    this.container = container;
    this.index = index;
    // always have indices visible, visibility is controlled by the array
    this.options = $.extend(true, {}, options, {visible: true});
    var indHtml = container.options.template
        .replace("{{value}}", value)
        .replace("{{index}}", index);
    var ind = $("<li class='jsavnode jsavindex'>" + indHtml + "</li>");
    this.element = ind;
    if (this.options.autoResize) {
      ind.addClass("jsavautoresize");
    }
    this.container.element.append(ind);

  };
  JSAV.utils.extend(ArrayIndex, JSAV._types.ds.Node);
  var indexproto = ArrayIndex.prototype;
  indexproto.value = function(newValue, options) {
    return this.container.value(this.index, newValue, options);
  };
  indexproto._setvalue = indexproto.value;
  // show/hide of indices makes no sense, so replace them with noop functions
  indexproto.show = function() {};
  indexproto.hide = function() {};
  indexproto.equals = function(otherIndex, options) {
    if (!otherIndex || this.value() !== otherIndex.value() || !otherIndex instanceof ArrayIndex) {
      return false;
    }
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherIndex, options.css);
      if (!cssEquals) { return false; }
    }
    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherIndex, options["class"]);
      if (!classEquals) { return false; }
    }
    return true; // values equal, nothing else to compare
  };


  /* Array data structure for JSAV library. */
  var AVArray = function(jsav, element, options) {
    this.jsav = jsav;
    this.options = $.extend(true, {autoresize: true, center: true, layout: "array"}, options);
    if (!this.options.template) {
      this.options.template = templates[this.options.layout + (this.options.indexed?"-indexed":"")];
    }
    this._indices = [];
    if ($.isArray(element)) {
      this.initialize(element);
    } else if (element) { // assume it's a DOM element
      this.element = $(element);
      this.initializeFromElement();
    }
  };
  JSAV.utils.extend(AVArray, JSAV._types.ds.JSAVDataStructure);
  AVArray._templates = templates;
  var arrproto = AVArray.prototype;

  arrproto.isHighlight = function(index, options) {
    return this.hasClass(index, "jsavhighlight");
  };

  arrproto.highlight = function(indices, options) {
    this.addClass(indices, "jsavhighlight", options);
    return this;
  };

  arrproto.unhighlight = function(indices, options) {
    this.removeClass(indices, "jsavhighlight", options);
    return this;
  };

  arrproto._setarraycss = JSAV.anim(function(cssprops, options) {
    var oldProps = $.extend(true, {}, cssprops),
        el = this.element;
    if (typeof cssprops !== "object") {
      return [cssprops];
    } else {
      for (var i in cssprops) {
        if (cssprops.hasOwnProperty(i)) {
          oldProps[i] = el.css(i);
        }
      }
    }
    if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
      this.jsav.effects.transition(this.element, cssprops, options);
    } else {
      this.element.css(cssprops);
    }
    return [oldProps];
  });
  arrproto.css = function(indices, cssprop, options) {
    var $elems;
    if (typeof cssprop === "string") {
      $elems = getIndices($(this.element).find("li"), indices);
      return $elems.css(cssprop);
    } else if (typeof indices === "string") {
      return this.element.css(indices);
    } else if (!$.isArray(indices) && typeof indices === "object") { // object, apply for array
      return this._setarraycss(indices, options);
    } else {
      var indArray = JSAV.utils._helpers.normalizeIndices($(this.element).find("li.jsavindex"), indices);
      for (var i = 0, l = indArray.length; i < l; i++) {
        this._indices[indArray[i]].css(cssprop, options);
      }
      return this;
    }
  };
  arrproto.index = function(index) {
    return this._indices[index];
  };
  arrproto.swap = JSAV.anim(function(index1, index2, options) {
    var $pi1 = $(this.element).find("li:eq(" + index1 + ")"),
        $pi2 = $(this.element).find("li:eq(" + index2 + ")"),
        tmp = this._values[index1];
    this._values[index1] = this._values[index2];
    this._values[index2] = tmp;
    this.jsav.effects.swap($pi1, $pi2, options);
    return [index1, index2, options];
  });
  arrproto.clone = function() {
    // fetch all values
    var vals = this._values;
    var newArray = new AVArray(this.jsav, vals, $.extend(true, {}, this.options, {visible: false}));
    newArray.state(this.state());
    return newArray;
  };
  arrproto.size = function() { return this.element.find("li").size(); };
  arrproto.value = function(index, newValue, options) {
    if (typeof newValue === "undefined") {
      return this._values[index];
    } else {
      return this._setvalue(index, newValue, options);
    }
  };
  arrproto._newindex = function(value, index) {
    if (typeof value === "undefined") {
      value = "";
    }
    if (typeof index === "undefined") {
      index = "";
    }
    var ind = new ArrayIndex(this, value, index, this.options);
    this._indices[index] = ind;
    return ind;
  };
  arrproto._setvalue = JSAV.anim(function(index, newValue) {
    var size = this.size(),
      oldval = this.value(index);
    while (index > size - 1) {
      var newli = this._newindex("", size);
      this._values[size] = "";
      size = this.size();
    }
    var $index = this.element.find("li:eq(" + index + ")");
    this._values[index] = newValue;
    $index.find(".jsavvaluelabel").html("" + newValue);
    return [index, oldval];
  });
  arrproto._initOptionClasses = function() {
    if (this.options.autoresize) {
      this.element.addClass("jsavautoresize");
    }
    if (this.options.center) {
      this.element.addClass("jsavcenter");
    }
    if (this.options.indexed) {
      this.element.addClass("jsavindexed");
    }
  };
  arrproto.initialize = function(data) {
    var el = this.options.element || $("<ol/>"),
      key, val, i;
    if (!this.options.element) {
      $(this.jsav.canvas).append(el);
    }
    this.element = el;
    this._initOptionClasses();
    this._values = data.slice(0);
    // replace null values with empty strings
    for (i = 0; i < data.length; i++) {
      if (data[i] === null || data[i] === undefined) {
        this._values[i] = "";
      }
    }
    el.addClass("jsavarray");
    this.options = jQuery.extend({visible: true}, this.options);
    for (key in this.options) {
      if (this.options.hasOwnProperty(key)) {
        val = this.options[key];
        if (typeof(val) === "string" || typeof(val) === "number" || typeof(val) === "boolean") {
          el.attr("data-" + key, val);
        }
      }
    }
    for (i=0; i < data.length; i++) {
      this._newindex(data[i], i);
    }
    JSAV.utils._helpers.handlePosition(this);
    this.layout();
    el.css("display", "none");
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  arrproto.initializeFromElement = function() {
    if (!this.element) { return; }
    var $elem = this.element,
      $elems = $elem.find("li"),
      data = $elem.data(),
      that = this;
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        this.options[key] = data[key];
      }
    }
    $elem.addClass("jsavarray");
    this._initOptionClasses();

    this._values = [];
    $elems.each(function(index) {
      var $this = $(this),
          value = JSAV.utils.value2type($this.attr("data-value") || $this.html(), // value
                                        $this.attr("data-value-type") || "string"), // value type
          $newElem = that._newindex(value, index); // create a new element using the template of the layout
      that._values[index] = value;
      // remove the original li element
      $this.remove();
    });
    this.layout();
  };
  arrproto.layout = function(options) {
    var layoutAlg = this.options.layout || "_default";
    this.element.removeClass("jsavbararray");
    return this.jsav.ds.layout.array[layoutAlg](this, options);
  };
  // set the new state of the array
  // NOTE: this won't even try to set state properly if the arrays have
  // different layouts
  arrproto.state = function(newstate) {
    if (newstate) {
      this.element.attr("style", newstate.style || "");
      JSAV.utils._helpers.setElementClasses(this.element, newstate.classes || []);
      var currIndices = this._indices, newIndices = newstate.ind,
          i = 0, curr = currIndices.length, newl = newIndices.length;
      for (; i < curr && i < newl; i++) {
        currIndices[i].state(newIndices[i]);
      }
      // handle removing or adding indices; note, that after the for loop
      // above, only one of the while loops can ever be executed
      while (i < curr) { // remove indices
        var lastInd = currIndices.length - 1;
        currIndices[lastInd].element.remove();
        currIndices.splice(lastInd);
        this._values.splice(lastInd);
        i++;
      }
      while (i < newl) { // add indices
        var newInd = this._newindex("", i);
        newInd.state(newIndices[i]);
        i++;
      }
    } else {
      var state = {ind: []};
      var indices = state.ind;
      for (var i = 0, l = this._indices.length; i < l; i++) {
        indices.push(this._indices[i].state());
      }
      var style = this.element.attr("style");
      if (style) {
        state.style = style;
      }
      var cls = JSAV.utils._helpers.elementClasses(this.element);
      if (cls.length > 0) {
        state.classes = cls;
      }
      return state;
    }
  };
  arrproto.equals = function(otherArray, options) {
    var opts = options || {},
      i, j,
      equal,
      cssprop,
      clazzname,
      len;
    if ($.isArray(otherArray)) { // simple case of array values
      if (!options) { // if nothing in options is specified
        len = otherArray.length;
        if (this.size() !== len) { // don't compare arrays of different size
          return false;
        }
        for (i = 0; i < len; i++) { // are the values equal
          equal = this.value(i) == otherArray[i];
          if (!equal) { return false; }
        }
        return true; // if tests passed, arrays are equal
      } else { // if options
        if ('css' in opts) { // if css property given, compare given array to property
          cssprop = opts.css;
          for (i = 0; i < len; i++) {
            equal = this.css(i, cssprop) === otherArray[i];
            if (!equal) { return false; }
          }
          return true; // if tests passed, arrays are equal
        }
      }
    } else { // JSAV array
      len = otherArray.size();
      if (this.size() !== len) { // size check
        return false;
      }
      if (!('value' in opts) || opts.value) { // if comparing values
        for (i = 0; i < len; i++) {
          equal = this.value(i) == otherArray.value(i);
          if (!equal) { return false; }
        }
      }
      if ('css' in opts) { // if comparing css properties
        if ($.isArray(opts.css)) { // array of property names
          for (i = 0; i < opts.css.length; i++) {
            cssprop = opts.css[i];
            for (j = 0; j < len; j++) {
              equal = this.css(j, cssprop) === otherArray.css(j, cssprop);
              if (!equal) { return false; }
            }
          }
        } else { // if not array, expect it to be a property name string
          cssprop = opts.css;
          for (i = 0; i < len; i++) {
            equal = this.css(i, cssprop) === otherArray.css(i, cssprop);
            if (!equal) { return false; }
          }
        }
      }
      if ('class' in opts) { // if comparing class attributes
        if ($.isArray(opts["class"])) { // array of class names
          for (i = 0; i < opts["class"].length; i++) {
            clazzname = opts["class"][i];
            for (j = 0; j < len; j++) {
              equal = this.hasClass(j, clazzname) === otherArray.hasClass(j, clazzname);
              if (!equal) { return false; }
            }
          }
        } else { // if not array, expect it to be a class name string
          clazzname = opts["class"];
          for (i = 0; i < len; i++) {
            equal = this.hasClass(i, clazzname) === otherArray.hasClass(i, clazzname);
            if (!equal) { return false; }
          }
        }
      }
      return true; // if tests passed, arrays are equal
    }

    // default: return false
    return false;
  };
  arrproto.toggleClass = JSAV.anim(function(index, className, options) {
    var $elems = getIndices($(this.element).find("li.jsavindex"), index);
    if (this.jsav._shouldAnimate()) {
      this.jsav.effects._toggleClass($elems, className, options);
    } else {
      $elems.toggleClass(className);
    }
    return [index, className, options];
  });
  arrproto.addClass = function(index, className, options) {
    var indices = JSAV.utils._helpers.normalizeIndices($(this.element).find("li.jsavindex"), index, ":not(." + className + ")");
    if (indices.length > 0) {
      return this.toggleClass(indices, className, options);
    } else {
      return this;
    }
  };
  arrproto.removeClass = function(index, className, options) {
    var indices = JSAV.utils._helpers.normalizeIndices($(this.element).find("li.jsavindex"), index, "." + className);
    if (indices.length > 0) {
      return this.toggleClass(indices, className, options);
    } else {
      return this;
    }
  };
  arrproto.hasClass = function(index, className) {
    var $elems = getIndices($(this.element).find("li.jsavindex"), index);
    return $elems.hasClass(className);
  };

  // Returns true if the array contains no values
  arrproto.isEmpty = function () {
    for (var i = 0; i < this.size(); i++) {
      if (this.value(i) !== "") { return false; }
    }
    return true;
  };

  // events to register as functions on array
  var events = ["click", "dblclick", "mousedown", "mousemove", "mouseup",
                "mouseenter", "mouseleave"];
  // returns a function for the passed eventType that binds a passed
  // function to that eventType for indices in the array
  var eventhandler = function(eventType) {
    return function(data, handler) {
      // store reference to this, needed when executing the handler
      var self = this;
      // bind a jQuery event handler, limit to .jsavindex
      this.element.on(eventType, ".jsavindex", function(e) {
        // get the index of the clicked element
        var index = self.element.find(".jsavindex").index(this);
        // log the event
        self.jsav.logEvent({type: "jsav-array-" + eventType, arrayid: self.id(), index: index});
        if ($.isFunction(data)) { // if no custom data..
          // ..bind this to the array and call handler
          // with params array index and the event
          data.call(self, index, e);
        } else if ($.isFunction(handler)) { // if custom data is passed
          // ..bind this to the array and call handler
          var params = $.isArray(data)?data.slice(0):[data]; // get a cloned array or data as array
          params.unshift(index); // add index to first parameter
          params.push(e); // jQuery event as the last
          handler.apply(self, params); // apply the function
        }
      });
      return this;
    };
  };
  // create the event binding functions and add to array prototype
  for (var i = events.length; i--; ) {
    arrproto[events[i]] = eventhandler(events[i]);
  }
  arrproto.on = function(eventName, data, handler) {
    eventhandler(eventName).call(this, data, handler);
    return this;
  };

  arrproto.toggleArrow = function(indices, options) {
    this.toggleClass(indices, "jsavarrow", options);
  };
  arrproto.toggleLine = JSAV.anim(function(index, options) {
      // Toggles a marker line above a given array index for bar layout
      // Options that can be passed:
      //  - markStyle: style of the "ball" as an object of CSS property/value pairs.
      //               Default style is first applied, then the given style. Passing
      //               null will disable the ball alltogether
      //  - lineStyle: style of the line, similarly to markStyle
      //  - startIndex: index in the array where the line will start. default 0
      //  - endIndex: index in the array where the line will end, inclusive. default
      //              last index of the array
      if (this.options.layout !== "bar") { return; } // not bar layout
      var valelem = this.element.find("li .jsavvalue").eq(index),
          lielem = valelem.parent();
      if (valelem.size() === 0 ) { return; } // no such index
      var opts = $.extend({startIndex: 0, endIndex: this.size() - 1}, options);

      var $mark = lielem.find(".jsavmark"),
          $markline = lielem.find(".jsavmarkline");
      if ($markline.size() === 0 && $mark.size() === 0) { // no mark exists yet
        if (opts.markStyle !== null) { // mark is not disabled
          $mark = $("<div class='jsavmark' />");
          lielem.prepend($mark);
          if (opts.markStyle) { $mark.css(opts.markStyle); }
          $mark.css({ bottom: valelem.height() - $mark.outerHeight()/2,
                      left: valelem.position().left + valelem.width() / 2 - $mark.outerWidth()/2,
                      display: "block"});
        }
        if (opts.lineStyle !== null) { // mark line not disabled
          $markline = $("<div class='jsavmarkline' />");
          lielem.prepend($markline);
          if (opts.lineStyle) { $markline.css(opts.lineStyle); }
          var startelem = this.element.find("li:eq(" + opts.startIndex + ")"),
              endelem = this.element.find("li:eq(" + opts.endIndex + ")");
          $markline.css({ width: endelem.position().left - startelem.position().left +
                                  endelem.width(),
                          left:startelem.position().left - lielem.position().left,
                          bottom: valelem.height() - $markline.outerHeight()/2,
                          display: "block"});
        }
      } else { // mark exists already, remove them
        $mark.remove();
        $markline.remove();
      }
      return [index, opts];
    });


  JSAV._types.ds.AVArray = AVArray;
  JSAV._types.ds.ArrayIndex = ArrayIndex;
  // expose the data structures for the JSAV
  JSAV.ext.ds.array = function(element, options) {
    return new AVArray(this, element, options);
  };

}(jQuery));




/// array layout
(function($) {
  "use strict";
  function setArrayWidth(array, $lastItem, options) {
    var width = 0;
    array.element.find("li").each(function(index, item) {
      width += $(this).outerWidth(true);
    });
    if (width !== array.element.width()) {
      // add +1 to reduce problems with different browser zoom levels and
      // last element ovefflowing from the array container
      array.css({"width": (width + 1) + "px"});
    }
  }

  function horizontalArray(array, options) {
    var $arr = $(array.element).addClass("jsavhorizontalarray"),
      $items = $arr.find("li"),
      maxHeight = -1;
    $items.each(function(index, item) {
      var $i = $(this);
      maxHeight = Math.max(maxHeight, $i.outerHeight());
    });
    $arr.height(maxHeight + (array.options.indexed?30:0));
    setArrayWidth(array, $items.last(), options);
    var arrPos = $arr.position();
    return { width: $arr.outerWidth(), height: $arr.outerHeight(),
              left: arrPos.left, top: arrPos.top };
  }

  function verticalArray(array, options) {
    var $arr = $(array.element).addClass("jsavverticalarray"),
      $items = $arr.find("li"),
      maxWidth = -1,
      indexed = !!array.options.indexed;
    if (indexed) {
      $items.each(function(index, item) {
        var $i = $(this);
        var $indexLabel = $i.find(".jsavindexlabel");
        maxWidth = Math.max(maxWidth, $indexLabel.innerWidth());
        $indexLabel.css({
          top: $i.innerHeight() / 2 - $indexLabel.outerHeight() / 2
        });
      });
      $items.css("margin-left", maxWidth);
    }
    setArrayWidth(array, $items.last(), options);
    var arrPos = $arr.position();
    return { width: $arr.outerWidth(), height: $arr.outerHeight(),
              left: arrPos.left, top: arrPos.top };
  }

  function barArray(array, options) {
    var $arr = $(array.element).addClass("jsavbararray"),
      $items = $arr.find("li.jsavindex"),//.css({"position":"relative", "float": "left"}),
      maxValue = Number.MIN_VALUE,
      width = $items.first().outerWidth(),
      size = array.size();
    for (var i = 0; i < size; i++) {
      maxValue = Math.max(maxValue, array.value(i));
    }
    maxValue *= 1.15;

    // a function which will animate and record the change of height of an element
    var setBarHeight = JSAV.anim(function(elem, newHeight, options) {
      // the JSAV.anim wrapper will make sure this points to jsav instance
      var oldHeight = elem.height();
      if (this.jsav._shouldAnimate()) {
        this.jsav.effects.transition(elem, {height: newHeight}, options);
      } else {
        elem.css({height: newHeight});
      }
      return [elem, oldHeight];
    });

    $items.each(function(index, item) {
      var $i = $(this);
      var $valueBar = $i.find(".jsavvaluebar"),
          $value = $i.find(".jsavvalue"),
          valueBarHeight = $valueBar.height(),
          newBarHeight = Math.round(valueBarHeight*(array.value(index) / maxValue));
      // only if height has changed should it be recorded
      if (newBarHeight !== $value.height()) {
        setBarHeight.call(array, $value, newBarHeight);
      }
    });
    setArrayWidth(array, $items.last(), options);
    return { width: array.element.outerWidth(), height: array.element.outerHeight(),
              left: array.position().left, top: array.position().top };
  }

  JSAV.ext.ds.layout.array = {
    "_default": horizontalArray,
    "bar": barArray,
    "array": horizontalArray,
    "vertical": verticalArray
  };
}(jQuery));
/**
* Module that contains the tree data structure implementations.
* Depends on core.js, datastructures.js, anim.js, utils.js
*/
/*global JSAV, jQuery, console */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }
  var Edge = JSAV._types.ds.Edge; // shortcut to JSAV Edge

  var Tree = function(jsav, options) {
    this.init(jsav, options);
  };
  JSAV.utils.extend(Tree, JSAV._types.ds.JSAVDataStructure);
  var treeproto = Tree.prototype;
  treeproto.init = function(jsav, options) {
    this._layoutDone = false;
    this.jsav = jsav;
    this.options = options;
    var el = this.options.element || $("<div/>");
    el.addClass("jsavtree jsavcommontree");
    for (var key in this.options) {
      var val = this.options[key];
      if (this.options.hasOwnProperty(key) && typeof(val) === "string" ||
            typeof(val) === "number" || typeof(val) === "boolean") {
        el.attr("data-" + key, val);
      }
    }
    if (!this.options.element) {
      $(this.jsav.canvas).append(el);
    }
    this.element = el;
    if (this.options.autoresize) {
      this.element.addClass("jsavautoresize");
    }
    JSAV.utils._helpers.handlePosition(this);
    this.constructors = $.extend({
      Tree: Tree,
      Node: TreeNode,
      Edge: Edge
    }, this.options.constructors);
    this.rootnode = this.newNode("", null);
    this.element.attr({"data-root": this.rootnode.id(), "id": this.id()});
    this.rootnode.element.attr("data-child-role", "root");
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  treeproto._setrootnode = JSAV.anim(function(node) {
    var oldroot = this.rootnode;
    this.rootnode = node;
    this.element.attr("data-root", node.id());
    node.element.attr("data-child-role", "root");
    node.element.removeAttr("data-parent data-binchildrole data-child-pos");
    if (oldroot) { oldroot.element.removeAttr("data-child-role"); }
    return [oldroot];
  });
  treeproto.root = function(newRoot, options) {
    var opts = $.extend({hide: true}, options);
    if (typeof newRoot === "undefined") {
      return this.rootnode;
    } else if (newRoot instanceof this.constructors.Node) {
      var oldroot = this.rootnode;
      this._setrootnode(newRoot, options);
      this.rootnode.edgeToParent(null);
      if (opts.hide && oldroot) { oldroot.hide(); }
    } else {
      if (this.rootnode) {
        this.rootnode.value(newRoot, options);
      } else {
        this._setrootnode(this.newNode(newRoot, null, options), options);
      }
    }
    return this.rootnode;
  };
  treeproto.clear = function() {
    this.root().clear();
    this.element.remove();
  };
  treeproto.newNode = function(value, parent, options) {
    return new this.constructors.Node(this, value, parent, options);
  };
  treeproto.height = function() {
    return this.rootnode.height();
  };
  treeproto.layout = function(options) {
    var layoutAlg = this.options.layout || "_default";
    return this.jsav.ds.layout.tree[layoutAlg](this, options);
  };
  treeproto.equals = function(otherTree, options) {
    if (!otherTree instanceof this.constructors.Tree) {
      return false;
    }
    return this.root().equals(otherTree.root(), options);
  };
  treeproto.css = JSAV.utils._helpers.css;
  treeproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);
  treeproto.show = function(options) {
    if (this.element.filter(":visible").size() === 0) {
      this._toggleVisible(options);
    }
    var opts = $.extend({recursive: true}, options);
    if (opts.recursive) {
      this.root().show(options); // also show all the nodes
    }
    return this;
  };
  /* hides an element */
  treeproto.hide = function(options) {
    if (this.element.filter(":visible").size() > 0) {
      this._toggleVisible(options);
    }
    var opts = $.extend({recursive: true}, options);
    if (opts.recursive) {
      this.root().hide(options); // also hide all the nodes
    }
    return this;
  };

  treeproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      var tree = this;
      var setNodeState = function(node, newState) {
        node.state(newState);
        var newChildren = newState.children || [],
            children = node.children(),
            pos = 0;
        var newChildState = newChildren[pos],
            child = children[pos];
        while (newChildState && child) { // set states of "common" children
          setNodeState(child, newChildState);
          pos++;
          newChildState = newChildren[pos];
          child = children[pos];
        }
        if (newChildren.length > children.length) {
          // add more children
          while (pos < newChildren.length) {
            var newChildNode = tree.newNode("", node, {record: false});
            node.addChild(newChildNode);
            setNodeState(newChildNode, newChildren[pos]);
            pos++;
          }
        } else {
          // remove all extra children
          while (pos < children.length) {
            node.child(pos).remove({record: false});
            children = node.children();
          }
        }
      };
      setNodeState(this.root(), newState);
    } else {
      var nodeState = function(node) {
        if (!node) { return null; }
        var state = node.state(),
            children = node.children();
        if (children.length > 0) {
          state.children = [];
          for (var i = 0; i < children.length; i++) {
            state.children.push(nodeState(node.child(i)));
          }
        }
        return state;
      };
      return nodeState(this.root());

    }
  };

  JSAV.utils._events._addEventSupport(treeproto);
  
  var TreeNode = function(container, value, parent, options) {
    this.init(container, value, parent, options);
  };
  JSAV.utils.extend(TreeNode, JSAV._types.ds.Node);
  var nodeproto = TreeNode.prototype;
  nodeproto.init = function(container, value, parent, options) {
    this.jsav = container.jsav;
    this.container = container;
    this.parentnode = parent;
    this.options = $.extend(true, {visible: true}, parent?parent.options:{}, options);
    this.constructors = $.extend({}, container.constructors, this.options.constructors);
    var el = this.options.nodeelement || $("<div><span class='jsavvalue'>" + this._valstring(value) + "</span></div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavtreenode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if (parent) {
      el.attr("data-parent", parent.id());
    }
    if (this.options.autoResize) {
      el.addClass("jsavautoresize");
    }
    this.container.element.append(el);

    JSAV.utils._helpers.handleVisibility(this, this.options);
    if (parent) {
      this._edgetoparent = new this.constructors.Edge(this.jsav, this, parent);
      if (this.options.edgeLabel) {
        this._edgetoparent.label(this.options.edgeLabel);
      }
    }
    this.childnodes = [];
  };
  nodeproto._valstring = function(value) {
    var valstr = "<span class='jsavvaluelabel'>";
    if (value === "jsavnull") {
      return valstr + "</span>";
    }
    return valstr + value + "</span>";
  };
  nodeproto._setparent = JSAV.anim(function(newParent, options) {
    var oldParent = this.parentnode;
    this._edgetoparent.end(newParent, options);
    if (options && options.edgeLabel) {
      this._edgetoparent.label(options.edgeLabel, options);
    }
    this.element.attr("data-parent", newParent?newParent.id():"");
    this.parentnode = newParent;
    return [oldParent, options];
  });
  nodeproto.parent = function(newParent, options) {
    if (typeof newParent === "undefined") {
      return this.parentnode;
    } else {
      if (!this._edgetoparent) {
        this._setEdgeToParent(new this.constructors.Edge(this.jsav, this, newParent, options));
      }
      this._setparent(newParent, options);

      // if both this node and parent are visible but the edge is not, show it
      if (this.isVisible() && newParent && newParent.isVisible() && !this._edgetoparent.isVisible()) {
        this._edgetoparent.show();
      } else if ((!this.isVisible() || !newParent || !newParent.isVisible()) && this._edgetoparent.isVisible()) {
        // if either this node or new parent are invisible but the edge is not,
        // and hide option is either not set ot it's true -> hide the edge to parent
        if (!options || typeof options.hide === "undefined" || options.hide) {
          this._edgetoparent.hide();
        }
      }
      return this;
    }
  };
  nodeproto._setEdgeToParent = JSAV.anim(function(edge, options) {
    var oldEdge = this._edgetoparent;
    this._edgetoparent = edge;
    return [oldEdge, options];
  });
  nodeproto.edgeToParent = function(edge, options) {
    if (typeof edge === "undefined") {
      return this._edgetoparent;
    } else {
      if (!edge && this._edgetoparent) { this._edgetoparent.hide(); }
      return this._setEdgeToParent(edge, options);
    }
  };
  nodeproto.edgeToChild = function(pos) {
    var child = this.child(pos);
    if (child) {
      return child.edgeToParent();
    } else {
      return undefined;
    }
  };
  nodeproto.clear = function() {
    if (this.edgeToParent()) {
      this.edgeToParent().clear();
    }
    var ch = this.children();
    for (var i = ch.length; i--; ) {
      if (ch[i]) {
        ch[i].clear();
      }
    }
    this.childnodes = [];
    this.element.remove();
  };
  nodeproto.addChild = function(node, options) {
    var pos = this.childnodes.length;
    return this.child(pos, node, options);
  };
  nodeproto._setchildnodes = JSAV.anim(function(newchildren, options) {
    var oldChildren = this.childnodes;
    this.childnodes = newchildren;
    $.each(newchildren, function(index, n) {
      n.element.attr("data-child-pos", index);
    });
    return [oldChildren, options];
  });
  var setchildhelper = function(self, pos, node, options) {
    var oldval = self.childnodes[pos],
        opts = $.extend({hide: true}, options);
    if (oldval) {
      if (opts.hide) { oldval.hide(); }
      oldval.parent(null, opts);
    }
    if (node) {
      var newchildnodes = self.childnodes.slice(0);
      newchildnodes[pos] = node;
      if (node.parent() && node.parent() !== self) {
        node.remove({hide: false});
      }
      node.parent(self);
      self._setchildnodes(newchildnodes, opts);
    } else {
      self._setchildnodes($.map(self.childnodes, function(item, index) {
        if (index !== pos) { return item; }
        else { return null; }
      }), opts);
    }
    return self;
  };
  nodeproto.child = function(pos, node, options) {
    if (typeof node === "undefined") {
      return this.childnodes[pos];
    } else {
      if (node !== null && !(node instanceof this.constructors.Node)) {
        node = this.container.newNode(node, this, options);
      }
      return setchildhelper(this, pos, node, options);
    }
  };
  nodeproto.remove = function(options) {
    if (this === this.container.rootnode) {
      this.container.root(this.container.newNode("", null), options);
      return this;
    }
    var parent = this.parent(),
        children = parent.children();
    for (var i = 0, l = children.length; i < l; i++) {
      if (children[i] === this) {
        return parent.child(i, null, options);
      }
    }
    return this;
  };
  nodeproto.height = function() {
    var chs = this.children(),
      maxheight = 0,
      max = Math.max;
    for (var i=0, l=chs.length; i < l; i++) {
      if (chs[i]) {
        maxheight = max(maxheight, chs[i].height());
      }
    }
    return maxheight + 1;
  };
  nodeproto.equals = function(otherNode, options) {
    if (!otherNode || this.value() !== otherNode.value()) {
      return false;
    }
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherNode, options.css);
      if (!cssEquals) { return false; }
    }
    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherNode, options["class"]);
      if (!classEquals) { return false; }
    }
    // compare edge style
    if (this.edgeToParent()) {
      var edgeEquals = this.edgeToParent().equals(otherNode.edgeToParent(),
                                        $.extend({}, options, {dontCheckNodes: true}));
      if (!edgeEquals) { return false; }
    }
    // compare children
    var ch = this.children(),
        och = otherNode.children();
    if (ch.length !== och.length) {
      return false;
    }
    for (var j = 0, l = ch.length; j < l; j++) {
      if (ch[j] && och[j] && !ch[j].equals(och[j], options)) {
        return false;
      }
    }
    return true; // values equal, nothing else to compare
  };
  nodeproto.children = function() {
    return this.childnodes;
  };
  nodeproto.show = function(options) {
    if (this.element.filter(":visible").size() === 0) {
      this._toggleVisible(options);
    }
    var opts = $.extend({recursive: true}, options);
    if (this._edgetoparent) {
      this._edgetoparent.show();
    }
    if (opts.recursive) {
      var ch = this.children();
      if (ch) {
        for (var i = 0, l = ch.length; i < l; i++) {
          ch[i].show(options); // also show the child nodes
        }
      }
    }
    return this;
  };
  nodeproto.hide = function(options) {
    var opts = $.extend({recursive: true}, options),
        ch, i, l;
    if (this.element.filter(":visible").size() > 0) {
      this._toggleVisible(options);
    }
    if (this._edgetoparent) {
      this._edgetoparent.hide(options);
    }
    if (opts.recursive) { // hide children recursively
      ch = this.children();
      if (ch) {
        for (i = 0, l = ch.length; i < l; i++) {
          ch[i].hide(options); // also hide the child nodes
        }
      }
    } else { // hide only edges to children
      ch = this.children();
      if (ch) {
        for (i = 0, l = ch.length; i < l; i++) {
          ch[i].edgeToParent().hide(options); // also hide the edges to child nodes
        }
      }
    }
    return this;
  };

  
  /// Binary Tree implementation
  var BinaryTree = function(jsav, options) {
    var opts = $.extend({constructors: {
      Tree: BinaryTree,
      Node: BinaryTreeNode,
      Edge: Edge
    }}, options);
    this.init(jsav, opts);
    this.element.addClass("jsavbinarytree");
  };
  JSAV.utils.extend(BinaryTree, Tree);
  var bintreeproto = BinaryTree.prototype;
  bintreeproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      var tree = this;

      var setNodeState = function(node, state) {
        node.state(state);
        var setChild = function(childName) {
          var child = node[childName]();
          if (!child && !state[childName]) { // no such child
            return;
          } else if (child && state[childName]) { // both such children
            setNodeState(child, state[childName]);
          } else if (child) { // existing child, need to remove
            node[childName](null, {record: false});
          } else { // no existing child but new child, need to add node
            var newNode = tree.newNode("", node, {record: false});
            node[childName](newNode, {record: false});
            setNodeState(newNode, state[childName]);
          }
        };
        setChild("left");
        setChild("right");
      };
      setNodeState(this.root(), newState);

    } else {
      var nodeState = function(node) {
        if (!node) { return null; }
        var state = node.state();
        if (node.left()) {
          state.left = nodeState(node.left());
        }
        if (node.right()) {
          state.right = nodeState(node.right());
        }
        return state;
      };
      return nodeState(this.root());
    }
  };

  /// Binary Tree Node implementation
  var BinaryTreeNode = function(container, value, parent, options) {
    this.init(container, value, parent, options);
    this.element.addClass("jsavbinarynode");
  };
  JSAV.utils.extend(BinaryTreeNode, TreeNode);
  var binnodeproto = BinaryTreeNode.prototype;

  // a general setchild method for bintreenode, pos parameter
  // should be either 0 (left) or 1 (right), node is the new child
  function setchild(self, pos, node, options) {
    var oPos = pos?0:1,
        other,
        newchildnodes,
        child = self.child(pos),
        oChild = self.child(oPos),
        opts = $.extend({hide: true}, options);
    if (typeof node === "undefined") {
      if (child && child.value() !== "jsavnull") {
        return child;
      } else {
        return undefined;
      }
    } else {
      var nullopts = $.extend({}, opts);
      nullopts.edgeLabel = undefined;
      if (node === null) { // node is null, remove child
        if (child && child.value() !== "jsavnull") {
          child.parent(null, opts);
          // child exists
          if (!oChild || oChild.value() === "jsavnull") { // ..but no other child
            if (opts.hide) { child.hide(); }
            if (oChild) { oChild.hide(); }
            self._setchildnodes([]);
          } else { // other child exists
            // create a null node and set it as other child
            other = self.container.newNode("jsavnull", self, nullopts);
            other.element.addClass("jsavnullnode").attr("data-binchildrole", pos?"right":"left");
            if (opts.hide) { child.hide(); }
            newchildnodes = [];
            newchildnodes[pos] = other;
            newchildnodes[oPos] = oChild;
            self._setchildnodes(newchildnodes, opts);
          }
        }
      } else { // create a new node and set the child
        if (!(node instanceof self.constructors.Node)) {
          // if there is a child node and value is number or string, just change the value of the node
          if (child && (typeof node === "number" || typeof node === "string")) {
            return child.value(node, opts);
          } else {
            node = self.container.newNode(node, self, opts);
          }
        } else {
          // if this node is already a child somewhere else, remove it there
          if (node.parent() && node.parent() !== self) {
            node.remove({hide: false});
          }
          node.parent(self);
        }
        node.element.attr("data-binchildrole", pos?"right":"left");
        newchildnodes = [];
        newchildnodes[pos] = node;
        if (child) {
          if (opts.hide) { child.hide(); }
        }
        if (!oChild) {
          other = self.container.newNode("jsavnull", self, nullopts);
          other.element.addClass("jsavnullnode").attr("data-binchildrole", oPos?"right":"left");
          newchildnodes[oPos] = other;
        } else {
          newchildnodes[oPos] = oChild;
        }
        self._setchildnodes(newchildnodes, opts);
        return node;
      }
    }
    return child;
  }
  binnodeproto.addChild = function(node, options) {
    var pos = -1;
    if (!this.left()) { // try left child
      pos = 0;
    } else if (!this.right()) { // try right child
      pos = 1;
    } else {
      console.error("Binarytree node already has two children, cannot add more");
      return;
    }
    return this.child(pos, node, options);
  };
  binnodeproto.left = function(node, options) {
    return setchild(this, 0, node, options);
  };
  binnodeproto.right = function(node, options) {
    return setchild(this, 1, node, options);
  };
  binnodeproto.child = function(pos, node, options) {
    if (typeof node === "undefined") {
      return this.childnodes[pos];
    } else {
      if (typeof node === "string" || typeof node === "number") {
        node = this.container.newNode(node, this, options);
      }
      return setchild(this, pos, node, options);
    }
  };
  binnodeproto.remove = function(options) {
    if (this === this.container.rootnode) {
      this.container.root(this.container.newNode("", null), options);
      return this;
    }
    var parent = this.parent();
    if (parent.left() === this) {
      return setchild(parent, 0, null, options);
    } else if (parent.right() === this) {
      return setchild(parent, 1, null, options);
    }
  };
  binnodeproto.edgeToLeft = function() {
    return this.edgeToChild(0);
  };
  binnodeproto.edgeToRight = function() {
    return this.edgeToChild(1);
  };
  binnodeproto._setvalue = JSAV.anim(function(newValue) {
    var oldVal = this.value(),
        valtype = typeof(newValue);
    if (typeof oldVal === "undefined") {oldVal = "";}
    if (valtype === "object") { valtype = "string"; }
    this.element
        .removeClass("jsavnullnode")
        .find(".jsavvalue")
        .html(this._valstring(newValue))
        .end()
        .attr({"data-value": newValue, "data-value-type": valtype});
    if (newValue === "jsavnull") {
      this.element.addClass("jsavnullnode");
    }
    return [oldVal];
  });

  // expose the types to JSAV._types.ds
  var dstypes = JSAV._types.ds;
  dstypes.Tree = Tree;
  dstypes.TreeNode = TreeNode;
  dstypes.BinaryTree = BinaryTree;
  dstypes.BinaryTreeNode = BinaryTreeNode;

  // add functions to jsav.ds to create tree, binarytree, end edge
  JSAV.ext.ds.tree = function(options) {
    return new Tree(this, $.extend(true, {visible: true, autoresize: true}, options));
  };
  JSAV.ext.ds.binarytree = function(options) {
    return new BinaryTree(this, $.extend(true, {visible: true, autoresize: true}, options));
  };
  JSAV.ext.ds.edge = function(options) {
    return new Edge(this, $.extend(true, {}, options));
  };
}(jQuery));

// Tree layout
(function($) {
  "use strict";
  function treeLayout(tree, options) {
    var opts = $.extend({}, tree.options, options),
        NODEGAP = opts.nodegap || 40,
        results = {};
    var compactArray = function(arr) {
          return $.map(arr, function(item) { return item || null; });
        };
    var calculateLayout = function(node) {
      var ch = compactArray(node.children());
      for (var i = 0, l=ch.length; i < l; i++) {
        if (ch[i]) {
          calculateLayout(ch[i]);
        }
      }
      results[node.id()] = {
        cachedTranslation: {width: 0, height: 0},
        translation: {width: 0, height: 0},
        node: node
      };
      calculateContours(node);
    },
    calculateContours = function(node) {
      var children = compactArray(node.children()),
        resnode = results[node.id()];
      var nodeWidth = node.element.outerWidth()/2.0,
          nodeHeight = node.element.outerHeight();
      if (children.length === 0) {
        resnode.contours = new TreeContours(-nodeWidth, nodeWidth + (nodeWidth % 2 === 0 ? 0 : 1),
                          nodeHeight, node.value());
        translateThisNode(node, -nodeWidth, 0);
      } else {
        var transSum = 0;
        var firstChild = children[0];
        resnode.contours = results[firstChild.id()].contours;
        results[firstChild.id()].contours = null;
        translateNodes(firstChild, 0, NODEGAP + nodeHeight);

        for (var i = 1, l = children.length; i < l; i++) {
          var child = children[i];
          if (!child) { continue; }
          var childC = results[child.id()].contours;
          var trans = resnode.contours.calcTranslation(childC, NODEGAP);
          transSum += trans;

          results[child.id()].contours = null;
          resnode.contours.joinWith(childC, trans);

          translateNodes(child, getXTranslation(firstChild) + trans - getXTranslation(child),
                                    NODEGAP + nodeHeight);
        }

        var rootTrans = transSum / children.length;
        resnode.contours.addOnTop(-nodeWidth, nodeWidth + (nodeWidth % 2 === 0 ? 0 : 1),
                  nodeHeight, NODEGAP, rootTrans);
        translateThisNode(node, getXTranslation(firstChild) + rootTrans, 0);
      }
    },
    translateThisNode = function(node, x, y) {
      var restrans = results[node.id()].translation;
      restrans.width += x;
      restrans.height += y;
    },
    translateNodes = function(node, x, y) {
      if (!node) { return; }
      var restrans = results[node.id()].cachedTranslation;
      if (!restrans) {
        restrans = {width: 0, height: 0};
        results[node.id()].cachedTranslation = restrans;
      }
      restrans.width += x;
      restrans.height += y;
    },
    getXTranslation = function(node) {
      var restrans = results[node.id()].cachedTranslation;
      return results[node.id()].translation.width +
        ((!restrans) ? 0 : restrans.width);
    },
    propagateTranslations = function(node) {
      if (!node) { return; }
      var noderes = results[node.id()];
      if (noderes.cachedTranslation) {
        var ch = compactArray(node.children());
        for (var i = 0, l = ch.length; i < l; i++) {
          var child = ch[i];
          translateNodes(child, noderes.cachedTranslation.width, noderes.cachedTranslation.height);
          propagateTranslations(child);
        }
        noderes.translation.width += noderes.cachedTranslation.width;
        noderes.translation.height += noderes.cachedTranslation.height;
        noderes.cachedTranslation = null;
      }
    },
    root = tree.root();
    
    calculateLayout(root);
    translateNodes(root, 20, 10 + NODEGAP);
    propagateTranslations(root);

    // figure out mix and max positions of nodes
    var maxX = -Number.MAX_VALUE, maxY = -Number.MAX_VALUE,
        minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
        max = Math.max,
        min = Math.min;
    $.each(results, function(key, value) {
      maxX = max(maxX, value.translation.width + value.node.element.outerWidth());
      maxY = max(maxY, value.translation.height + value.node.element.outerHeight());
      minX = min(minX, value.translation.width);
      minY = min(minY, value.translation.height);
    });
    // change the position of nodes
    if (!opts.boundsOnly) { // only change pos if we are not just calculating bounds
      $.each(results, function(key, value) {
        var oldPos = value.node.element.position();
        // if node hasn't been positioned earlier, don't animate
        if (!value.node._layoutDone && oldPos.left === 0 && oldPos.top === 0) {
          value.node.element.css({left: (value.translation.width - minX) + "px",
                                  top: (value.translation.height - minY) + "px"});
          value.node._layoutDone = true;
        } else { // otherwise animate to the new position
          value.node.moveTo(value.translation.width - minX, value.translation.height - minY);
        }
      });
    }

    // calculate left coordinate to center the tree inside its parent container
    var centerTree = function(tree, width) {
      // if options center is not set to truthy value, center it
      if (opts.hasOwnProperty("center") && !opts.center) {
        return 0;
      }
      var containerWidth = $(tree.jsav.canvas).width(),
          treeLeft = parseInt(tree.element.css("left"), 10) || 0;
      return Math.max(0, (containerWidth - width)/2) - treeLeft;
    };

    var treeDims = { width: maxX - minX, height: maxY - minY },
        left = centerTree(tree, maxX - minX);

    if (!opts.boundsOnly) { // only go through edges if we are not just calculating bounds
      if (!tree._layoutDone) {
        tree._layoutDone = true;
        tree.element.css(treeDims);
        if (left) {
          tree.element.css("left", left);
        }
      } else {
        tree.css(treeDims, opts);
        if (left) {
          tree.translateX(left);
        }
      }
      $.each(results, function(key, value) {
        var node = value.node;
        if (node._edgetoparent) {
          var start = {left: value.translation.width - minX,
                        top: value.translation.height - minY},
              endnode = results[node.parent().id()].translation,
              end = {left: endnode.width - minX,
              top: endnode.height - minY};
          node._edgetoparent.layout($.extend({start: start, end: end}, opts));
        }
      });
    }

    // return the dimensions of the tree
    return $.extend({ top: tree.position().top }, treeDims);
  }

  var layouts = JSAV.ext.ds.layout;
  layouts.tree = {
    "_default": treeLayout
  };

  var TreeContours = function(left, right, height, data) {
    this.cHeight = height;
    this.leftCDims = [];
    this.leftCDims[this.leftCDims.length] = {width: -left, height: height};
    this.cLeftExtent = left;
    this.rightCDims = [];
    this.rightCDims[this.rightCDims.length] = {width: -right, height: height};
    this.cRightExtent = right;
  };
  TreeContours.prototype = {
    addOnTop: function(left, right, height, addHeight, originTrans) {
      var lCD = this.leftCDims,
          rCD = this.rightCDims;
      lCD[lCD.length-1].height += addHeight;
      lCD[lCD.length-1].width += originTrans + left;
      rCD[rCD.length-1].height += addHeight;
      rCD[rCD.length-1].width += originTrans + right;

      lCD.push({width: -left, height: height});
      rCD.push({width: -right, height: height});
      this.cHeight += height + addHeight;
      this.cLeftExtent -= originTrans;
      this.cRightExtent -= originTrans;
      if (left < this.cLeftExtent) {
        this.cLeftExtent = left;
      }
      if (right > this.cRightExtent) {
        this.cRightExtent = right;
      }
    },
    joinWith: function(other, hDist) {
      var thisCDisp, otherCDisp, middle;
      if (other.cHeight > this.cHeight) {
        var newLeftC = [];
        var otherLeft = other.cHeight - this.cHeight;
        thisCDisp = 0;
        otherCDisp = 0;
        $.each(other.leftCDims, function (index, item) {
          if (otherLeft > 0 ) {
            var dim = {width: item.width, height: item.height};
            otherLeft -= item.height;
            if (otherLeft < 0) {
              dim.height += otherLeft;
            }
            newLeftC[newLeftC.length] = dim;
          } else {
            otherCDisp += item.width;
          }
        });
        middle = newLeftC[newLeftC.length - 1];

        $.each(this.leftCDims, function(index, item) {
          thisCDisp += item.width;
          newLeftC[newLeftC.length] = {width: item.width, height: item.height};
        });

        middle.width -= thisCDisp - otherCDisp;
        middle.width -= hDist;
        this.leftCDims = newLeftC;
      }
      if (other.cHeight >= this.cHeight) {
        this.rightCDims = other.rightCDims.slice();
      } else {
        var thisLeft = this.cHeight - other.cHeight;
        var nextIndex = 0;

        thisCDisp = 0;
        otherCDisp = 0;
        $.each(this.rightCDims, function (index, item) {
          if (thisLeft > 0 ) {
            nextIndex++;
            thisLeft -= item.height;
            if (thisLeft < 0) {
              item.height += thisLeft;
            }
          } else {
            thisCDisp += item.width;
          }
        });
        for (var i = nextIndex + 1, l=this.rightCDims.length; i < l; i++) {
          this.rightCDims[i] = null;
        }
        this.rightCDims = $.map(this.rightCDims, function(item) {return item;});
        middle = this.rightCDims[nextIndex];

        for (i = 0, l=other.rightCDims.length; i < l; i++) {
          var item = other.rightCDims[i];
          otherCDisp += item.width;
          this.rightCDims[this.rightCDims.length] = {width: item.width, height: item.height};
        }
        middle.width += thisCDisp - otherCDisp;
        middle.width += hDist;
      }
      this.rightCDims[this.rightCDims.length-1].width -= hDist;

      if (other.cHeight > this.cHeight) {
        this.cHeight = other.cHeight;
      }
      if (other.cLeftExtent + hDist < this.cLeftExtent) {
        this.cLeftExtent = other.cLeftExtent + hDist;
      }
      if (other.cRightExtent + hDist > this.cRightExtent) {
        this.cRightExtent = other.cRightExtent + hDist;
      }
    },
    calcTranslation: function(other, wantedDist) {
      var lc = this.rightCDims,
          rc = other.leftCDims,
          li = lc.length - 1,
          ri = rc.length - 1,
          lCumD = {width: 0, height: 0},
          rCumD = {width: 0, height: 0},
          displacement = wantedDist,
          ld, rd;

      while (true) {
        if (li < 0) {
          if (ri < 0 || rCumD.height >= lCumD.height) {
            break;
          }
          rd = rc[ri];
          rCumD.height += rd.height;
          rCumD.width += rd.width;
          ri--;
        } else if (ri < 0) {
          if (lCumD.height >= rCumD.height) {
            break;
          }
          ld = lc[li];
          lCumD.height += ld.height;
          lCumD.width += ld.width;
          li--;
        } else {
          ld = lc[li];
          rd = rc[ri];
          var leftNewHeight = lCumD.height,
              rightNewHeight = rCumD.height;
          if (leftNewHeight <= rightNewHeight) {
            lCumD.height += ld.height;
            lCumD.width += ld.width;
            li--;
          }
          if (rightNewHeight <= leftNewHeight) {
            rCumD.height += rd.height;
            rCumD.width += rd.width;
            ri--;
          }
        }
        if (displacement < rCumD.width - lCumD.width + wantedDist) {
          displacement = rCumD.width - lCumD.width + wantedDist;
        }
      }
      return displacement;
    }
  };
}(jQuery));
/**
* Module that contains the linked list data structure implementations.
* Depends on core.js, datastructures.js, anim.js, utils.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  var Edge = JSAV._types.ds.Edge;

  var List = function(jsav, options) {
    this.jsav = jsav;
    this.options = $.extend({visible: true, nodegap: 40, autoresize: true}, options);
    var el = this.options.element || $("<div/>");
    el.addClass("jsavlist");
    for (var key in this.options) {
      var val = this.options[key];
      if (this.options.hasOwnProperty(key) && typeof(val) === "string" || typeof(val) === "number" || typeof(val) === "boolean") {
        el.attr("data-" + key, val);
      }
    }
    if (!this.options.element) {
      $(jsav.canvas).append(el);
    }
    this.element = el;
    this.element.attr({"id": this.id()});
    if (this.options.autoresize) {
      el.addClass("jsavautoresize");
    }
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(List, JSAV._types.ds.JSAVDataStructure);
  var listproto = List.prototype;
  listproto.first = function(newFirst, options) {
    if (typeof newFirst === "undefined") {
      return this._first;
    } else {
      return this.addFirst(newFirst, options);
    }
  };
  listproto._setfirst = JSAV.anim(function(newFirst) {
    var oldFirst = this._first;
    this._first = newFirst;
    return [oldFirst];
  });
  listproto.add = function(index, newValue, options) {
    if (index < 0 || index > this.size()) { return this; }
    if (index === 0) {
      return this.addFirst(newValue, options);
    }
    var node = this.get(index - 1),
      newNode;
    if (newValue instanceof ListNode) {
      newNode = newValue;
    } else {
      newNode = this.newNode(newValue);
    }
    if (node) { // there is node for the index
      newNode.next(node.next(), options);
      node.next(newNode, options);
    }
    return this;
  };
  listproto.addFirst = function(newValue, options) {
    if (newValue instanceof ListNode) {
      newValue.next(this._first, options);
      this._setfirst(newValue, options);
    } else {
      this._setfirst(this.newNode(newValue, $.extend({}, options, {first: true, next: this._first})), options);
    }
    return this;
  };
  /** returns the last item in the list or if newLast is given, adds it to the end */
  listproto.last = function(newLast, options) {
    if (typeof newLast === "undefined") {
      var curNode = this.first();
      while (curNode && curNode.next()) {
        curNode = curNode.next();
      }
      return curNode;
    } else {
      this.addLast(newLast, options);
    }
  };
  /** adds the given value/node as the last item in the list */
  listproto.addLast = function(newValue, options) {
    var last = this.last(),
        newNode;
    if (typeof last === "undefined") { // if no last, add to first
      this.first(newValue);
      return this;
    }
    if (newValue instanceof ListNode) {
      newNode = newValue;
    } else {
      newNode = this.newNode(newValue);
    }
    last.next(newNode, options);
    return this;
  };
  /** Returns the item at index, first node is at index 0 */
  listproto.get = function(index) {
    if (typeof(index) !== "number" || index < 0) { return; }
    var curNode = this.first(),
        pos = 0;
    while (curNode.next() && pos < index) {
      curNode = curNode.next();
      pos++;
    }
    if (pos === index) {
      return curNode;
    } else {
      return undefined;
    }
  };
  listproto.newNode = function(value, options) {
    return new ListNode(this, value, $.extend({first: false}, this.options, options));
  };
  listproto.remove = function(index, options) {
    var opts = $.extend({hide: true}, options);
    if (index === 0) {
      return this.removeFirst(options);
    } else if (index === this.size() - 1) {
      return this.removeLast(options);
    }
    var prev = this.get(index - 1),
        next = this.get(index + 1),
        oldNode = prev.next();
    prev.next(next, options);
    if (opts.hide) {
      oldNode.hide();
      oldNode.edgeToNext().hide();
    }
    return oldNode;
  };
  listproto.removeFirst = function(options) {
    if (this.size() <= 0) { return; }
    var opts = $.extend({hide: true}, options),
        oldFirst = this.first();
    this._setfirst(oldFirst.next(), options);
    if (opts.hide) {
      oldFirst.hide();
      if (oldFirst.edgeToNext()) {
        oldFirst.edgeToNext().hide();
      }
    }
    return oldFirst;
  };
  listproto.removeLast = function(options) {
    if (this.size() <= 1) { return this.removeFirst(); }
    var opts = $.extend({hide: true}, options),
        newLast = this.get(this.size() - 2),
        oldLast = this.last();
    newLast.next(null, options);
    if (opts.hide) {
      oldLast.hide();
      newLast.edgeToNext().hide();
    }
    return oldLast;
  };
  listproto.layout = function(options) {
    var layoutAlg = $.extend({}, this.options, options).layout || "_default";
    return this.jsav.ds.layout.list[layoutAlg](this, options);
  };
  listproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      // first handle the special case of newState being an empty list
      if (newState.n.length === 0) {
        while (this.first()) { // just remove everything
          this.removeFirst({record: false});
        }
        return; // remember to return
      }

      var currNode = this.first(),
          i = 0,
          newCurrState = newState.n[i];
      while (newCurrState && currNode) {
        currNode.state(newCurrState);
        currNode = currNode.next();
        newCurrState = ++i < newState.n.length?newState.n[i]:null;
      }
      if (!currNode) {
        // list is shorter than the new state
        currNode = this.last();
        for (; i < newState.n.length; i++) {
          var newNode = this.newNode("", {record: false});
          if (!currNode) { // if this list was initially empty
            this.first(newNode);
            currNode = this.first();
          }
          newNode.state(newState.n[i]);
          currNode.next(newNode, {record: false});
          currNode = newNode;
        }
      } else {
        // newCurrState is null, so list is longer than new state
        while (currNode !== this.last()) { // remove until proper length
          this.removeLast({record: false});
        }
      }
      currNode = this.first();
      var edge = currNode.edgeToNext(),
          edges = newState.e;
      for (i = 0; i < edges.length; i++) {
        this.get(i).edgeToNext().state(edges[i]);
      }
    } else {
      var state = {},
          node = this.first(),
          edge,
          nodes = [], edges = [];
      while (node) {
        nodes.push(node.state());
        edge = node.edgeToNext();
        if (edge) {
          edges.push(edge.state());
        }
        node = node.next();
      }
      state.n = nodes;
      state.e = edges;
      return state;
    }
  };
  listproto.clear = function() {
    this.element.remove();
  };
  listproto.size = function() {
    var curNode = this.first(),
      size = 0;
    while (curNode) {
      size++;
      curNode = curNode.next();
    }
    return size;
  };
  listproto.equals = function(otherList, options) {
    if (!this.first() && !otherList.first()) { // empty lists
      return true;
    } else if (!this.first()) { // other list not empty, this list is
      return false;
    } else {
      return this.first().equals(otherList.first(), options);
    }
  };
  listproto.css = JSAV.utils._helpers.css;
  listproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  // add the event handler registration functions to the list prototype
  JSAV.utils._events._addEventSupport(listproto);
  
  var ListNode = function(container, value, options) {
    this.jsav = container.jsav;
    this.container = container;
    this._next = options.next;
    this._value = value;
    this.options = $.extend(true, {visible: true}, options);
    var el = $("<div><span class='jsavvalue'>" + this._valstring(value) + "</span><span class='jsavpointerarea'></span></div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavlistnode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if ("first" in options && options.first) {
      this.container.element.prepend(el);
    } else {
      this.container.element.append(el);
    }
    if (this._next) {
      this._edgetonext = new Edge(this.jsav, this, this._next, {"arrow-end": "classic-wide-long"});
      if (this.options.edgeLabel) {
        this._edgetonext.label(this.options.edgeLabel);
      }
    }
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  
  JSAV.utils.extend(ListNode, JSAV._types.ds.Node);
  var listnodeproto = ListNode.prototype;
  
  listnodeproto.next = function(newNext, options) {
    if (typeof newNext === "undefined") {
      return this._next;
    } else {
      if (this._edgetonext) { this._edgetonext.show(); }
      return this._setnext(newNext, options);
    }
  };
  listnodeproto._setnext = JSAV.anim(function(newNext, options) {
    var oldNext = this._next;
    this._next = newNext;
    if (newNext && this._edgetonext) {
      this._edgetonext.end(newNext);
    } else if (newNext){
      this._edgetonext = new Edge(this.jsav, this, this._next, {"arrow-end": "classic-wide-long"});
    }
    if (options && options.edgeLabel) {
      this._edgetonext.label(options.edgeLabel);
    }
    return [oldNext];
  });
  listnodeproto.edgeToNext = function() {
    return this._edgetonext;
  };
  listnodeproto.equals = function(otherNode, options) {
    if (!otherNode || this.value() !== otherNode.value()) {
      return false;
    }
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherNode, options.css);
      if (!cssEquals) { return false; }
    }
    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherNode, options["class"]);
      if (!classEquals) { return false; }
    }
    // compare edge style
    if (this.next() && this.edgeToNext()) {
      var edgeEquals = this.edgeToNext().equals(otherNode.edgeToNext(),
          $.extend({}, options, {dontCheckNodes: true}));
      if (!edgeEquals) { return false; }
    }
    // compare next nodes
    if (this.next()) { // both have next, return whether they match
      return this.next().equals(otherNode.next(), options);
    } else if (otherNode.next()) { // this node has no next, the other has
      return false; // nodes are not equal
    } else {
      return true;
    }
  };

  // expose the list types
  var dstypes = JSAV._types.ds;
  dstypes.List = List;
  dstypes.ListNode = ListNode;

  function centerList(list, width, options) {
    // center the list inside its parent container
    if (list.options.hasOwnProperty("center") && !list.options.center) {
      // if options center is set to falsy value, return
      return 0;
    }
    // width of list expected to be last items position + its width
    var containerWidth = $(list.jsav.canvas).width();
    return (containerWidth - width)/2 - list.position().left;
  }

  var horizontalNodePosUpdate = function(node, prevNode, prevPos, opts) {
    // function for calculating node positions in horizontal list
    var nodePos = node.element.position(),
        newPos = { left: nodePos.left, top: nodePos.top }, // by default, don't move it
        result = { node: node, nodePos: newPos };
    if (opts.updateLeft) {
      newPos.left = prevNode?(prevPos.left + prevNode.element.outerWidth() + opts.nodegap):0;
    }
    if (opts.updateTop) { newPos.top = 0; }
    var edge = prevNode?prevNode._edgetonext:undefined;
    if (edge && opts.updateEdges) {
      result.edge = edge;
      result.edgeFromPoint = [
        prevPos.left + prevNode.element.outerWidth() - 5,
        prevPos.top + Math.round(prevNode.element.outerHeight()/2)
      ];
    }
    return result;
  };
  var verticalNodePosUpdate = function(node, prevNode, prevPos, opts) {
    // function for calculating node positions in vertical list
    var nodePos = node.element.position(),
        newPos = { left: nodePos.left, top: nodePos.top },
        result = { node: node, nodePos: newPos };
    if (opts.updateLeft) { newPos.left = 0; }
    if (opts.updateTop) {
      newPos.top = prevNode?(prevPos.top + prevNode.element.outerHeight() + opts.nodegap):0;
    }
    var edge = prevNode?prevNode._edgetonext:undefined;
    if (edge && opts.updateEdges) {
      result.edge = edge;
      result.edgeFromPoint = [
        prevPos.left + Math.round(prevNode.element.outerWidth()/2),
        prevPos.top + prevNode.element.outerHeight() - 5
      ];
    }
    return result;
  };
  var listLayout = function(list, options, updateFunc) {
    // a general list layout that goes through the nodes and calls given updateFunc
    // to calculate the new node positions
    var curNode = list.first(),
        prevNode,
        opts = $.extend({updateLeft: true, updateTop: true, updateEdges: true}, list.options, options),
        curPos,
        prevPos = {},
        minLeft = Number.MAX_VALUE,
        minTop = Number.MAX_VALUE,
        maxLeft = Number.MIN_VALUE,
        maxTop = Number.MIN_VALUE,
        width,
        height,
        left,
        posData = [],
        curPosData;
    // two phase layout: first go through all the nodes calculate positions
    while (curNode) {
      curPosData = updateFunc(curNode, prevNode, prevPos, opts);
      curPos = curPosData.nodePos;
      // keep track of max and min coordinates to calculate the size of the container
      minLeft = (typeof curPos.left !== "undefined")?Math.min(curPos.left, minLeft):minLeft;
      minTop  = (typeof curPos.top  !== "undefined")?Math.min(curPos.top, minTop):minTop;
      maxLeft = (typeof curPos.left !== "undefined")?Math.max(curPos.left + curNode.element.outerWidth(), maxLeft):maxLeft;
      maxTop  = (typeof curPos.top  !== "undefined")?Math.max(curPos.top + curNode.element.outerHeight(), maxTop):maxTop;
      posData.unshift(curPosData);
      // go to next node and continue with that
      prevNode = curNode;
      prevPos = curPos;
      curNode = curNode.next();
    }
    if (list.size()) {
      width = maxLeft - minLeft;
      height = maxTop - minTop;
    } else {
      var tmpNode = list.newNode("");
      width = tmpNode.element.outerWidth();
      height = tmpNode.element.outerHeight();
      tmpNode.clear();
    }
    left = centerList(list, width, opts);
    if (!opts.boundsOnly) {
      // ..update list size and position..
      list.css({width: width, height: height});
      if (left) {
        list.translateX(left);
      }
      // .. and finally update the node and edge positions
      // doing the size first makes the animation look smoother by reducing some flicker
      for (var i = posData.length - 1; i >= 0; i--) {
        var posItem = posData[i];
        posItem.node.moveTo(posItem.nodePos.left, posItem.nodePos.top);
        if (posItem.edge) {
          posItem.edge.layout({fromPoint: posItem.edgeFromPoint, end: posItem.nodePos});
        }
      }
    }
    return { width: width, height: height, left: left, top: list.element.position().top };
  };
  var verticalList = function(list, options) {
    list.element.addClass("jsavverticallist");
    // use the general list layout with verticalNodePosUpdate as the calculator
    return listLayout(list, options, verticalNodePosUpdate);
  };
  var horizontalList = function(list, options) {
    list.element.addClass("jsavhorizontallist");
    // use the general list layout with horizontalNodePosUpdate as the calculator
    return listLayout(list, options, horizontalNodePosUpdate);
  };

  JSAV.ext.ds.layout.list = {
    "_default": horizontalList,
    "horizontal": horizontalList,
    "vertical": verticalList
  };

  JSAV.ext.ds.list = function(options) {
    return new List(this, options);
  };
}(jQuery));
/**
* Module that contains the graph data structure implementations.
* Depends on core.js, datastructures.js, anim.js, utils.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }
  var Edge = JSAV._types.ds.Edge; // shortcut to JSAV Edge

  var Graph = function(jsav, options) {
    this._nodes = [];
    this._edges = [];
    this._alledges = null;
    this.jsav = jsav;
    this.options = $.extend({visible: true, nodegap: 40, autoresize: true, width: 400, height: 200,
                              directed: false, center: true}, options);
    var el = this.options.element || $("<div/>");
    el.addClass("jsavgraph");
    for (var key in this.options) {
      var val = this.options[key];
      if (this.options.hasOwnProperty(key) && typeof(val) === "string" || typeof(val) === "number" || typeof(val) === "boolean") {
        el.attr("data-" + key, val);
      }
    }
    if (!this.options.element) {
      $(jsav.canvas).append(el);
    }
    this.element = el;
    el.attr({"id": this.id()}).width(this.options.width).height(this.options.height);
    if (this.options.autoresize) {
      el.addClass("jsavautoresize");
    }
    if (this.options.center) {
      el.addClass("jsavcenter");
    }
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  // a helper function to sort an array of nodes based on the node value
  Graph._nodeSortFunction = function(a, b) {
    return a.value() - b.value();
  };

  JSAV.utils.extend(Graph, JSAV._types.ds.JSAVDataStructure);
  var graphproto = Graph.prototype;
  graphproto.css = JSAV.utils._helpers.css;
  graphproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  graphproto._setnodes = JSAV.anim(function(newnodes, options) {
    var oldnodes = this._nodes;
    this._nodes = newnodes;
    return [oldnodes, options];
  });
  graphproto._setadjs = JSAV.anim(function(newadjs, options) {
    var oldadjs = this._edges;
    this._edges = newadjs;
    this._alledges = null;
    return [oldadjs, options];
  });
  graphproto._setadjlist = JSAV.anim(function(newadj, index, options) {
    var oldadj = this._edges[index];
    this._edges[index] = newadj;
    this._alledges = null;
    return [oldadj, index, options];
  });

  // returns a new graph node
  graphproto.newNode = function(value, options) {
    var newNode = new GraphNode(this, value, options), // create new node
        newNodes = this._nodes.slice(0);
    newNodes.push(newNode); // add new node to clone of node array
    // set the nodes (makes the operation animatable
    this._setnodes(newNodes, options);

    var newAdjs = this._edges.slice(0);
    newAdjs.push([]);
    this._setadjs(newAdjs, options);

    return newNode;
  };
  graphproto.addNode = function(value, options) {
    return this.newNode(value, options);
  };
   // removes the given node
  graphproto.removeNode = function(node, options) {
    var nodeIndex = this._nodes.indexOf(node);
    if (nodeIndex === -1) { return; } // no such node

    // remove all edges connected to this node
    var allEdges = this.edges();
    for (var i = allEdges.length; i--; ) {
      var edge = allEdges[i];
      if (edge.start().id() === node.id() || edge.end().id() === node.id()) {
        this.removeEdge(edge, options);
      }
    }

    // update the adjacency lists
    var firstAdjs = this._edges.slice(0, nodeIndex),
        newAdjs = firstAdjs.concat(this._edges.slice(nodeIndex + 1));
    this._setadjs(newAdjs, options);

    // create a new array of nodes without the removed node
    var firstNodes = this._nodes.slice(0, nodeIndex),
        newNodes = firstNodes.concat(this._nodes.slice(nodeIndex + 1));
    // set the nodes (makes the operation animated)
    this._setnodes(newNodes, options);

    // finally hide the node
    node.hide(options);
    // return this for chaining
    return this;
  };

  // adds an edge from fromNode to toNode
  graphproto.addEdge = function(fromNode, toNode, options) {
    // only allow one edge between two nodes
    if (this.hasEdge(fromNode, toNode)) { return; }

    var opts = $.extend({}, this.options, options);
    if (opts.directed && !opts["arrow-end"]) {
      opts["arrow-end"] = "classic-wide-long";
    }

    // get indices of the nodes
    var fromIndex = this._nodes.indexOf(fromNode),
        toIndex = this._nodes.indexOf(toNode);
    if (fromIndex === -1 || toIndex === -1) { return; } // no such nodes

    // create new edge
    var edge = new Edge(this.jsav, fromNode, toNode, opts),
        adjlist = this._edges[fromIndex].slice(0);
    // add new edge to adjlist
    adjlist.push(edge);
    // set the adjlist (makes the operation animated)
    this._setadjlist(adjlist, fromIndex, opts);

    return edge;
  };

  // removes an edge from fromNode to toNode
  graphproto.removeEdge = function(fNode, tNode, options) {
    var edge,
        fromNode,
        toNode,
        opts;
    // first argument is an edge object
    if (fNode.constructor === JSAV._types.ds.Edge) {
      edge = fNode;
      fromNode = edge.start();
      toNode = edge.end();
      opts = tNode;
    } else { // if not edge, assume two nodes
      fromNode = fNode;
      toNode = tNode;
      edge = this.getEdge(fromNode, toNode);
      opts = options;
    }
    if (!edge) { return; } // no such edge

    var fromIndex = this._nodes.indexOf(fromNode),
        toIndex = this._nodes.indexOf(toNode),
        adjlist = this._edges[fromIndex],
        edgeIndex = adjlist.indexOf(edge),
        newAdjlist = adjlist.slice(0, edgeIndex).concat(adjlist.slice(edgeIndex + 1));
    this._setadjlist(newAdjlist, fromIndex, options);
    // we "remove" the edge by hiding it
    edge.hide();
  };

  // returns true/false whether an edge from fromNode to toNode exists
  graphproto.hasEdge = function(fromNode, toNode) {
    return this.getEdge(fromNode, toNode);
  };

  graphproto.getEdge = function(fromNode, toNode) {
    var edges = this.edges();
    for (var i = 0, l = edges.length; i < l; i++) {
      var edge = edges[i];
      if (edge.start() === fromNode && edge.end() === toNode) {
        return edge;
      } else if (!this.options.directed && edge.end() === fromNode && edge.start() === toNode) {
        return edge;
      }
    }
    return undefined;
  };

  // returns an iterable array of nodes in the graph
  graphproto.nodes = function() {
    return JSAV.utils.iterable(this._nodes);
  };
  // returns the number of nodes in the graph
  graphproto.nodeCount = function() {
    return this._nodes.length;
  };
  var collectAllEdges = function(graph) {
    var alledges = [];
    for (var i = 0, l = graph._edges.length; i < l; i++) {
      for (var j = 0, ll = graph._edges[i].length; j < ll; j++) {
        var edge = graph._edges[i][j];
        if (alledges.indexOf(edge) === -1) {
          alledges.push(edge);
        }
      }
    }
    return alledges;
  };
  // returns an array of edges in the graph
  graphproto.edges = function() {
    if (!this._alledges) {
      this._alledges = collectAllEdges(this);
    }
    return JSAV.utils.iterable(this._alledges);
  };
  // returns the number of edges in the graph
  graphproto.edgeCount = function() {
    if (!this._alledges) {
      this._alledges = collectAllEdges(this);
    }
    return this._alledges.length;
  };
  // compares this graph to other graph and return true if they are equal
  graphproto.equals = function(other, options) {
    if (!other instanceof Graph) { return false; }
    if (this.nodeCount() !== other.nodeCount() ||
        this.edgeCount() !== other.edgeCount()) { return false; }

    var myNodes = this.nodes().sort(Graph._nodeSortFunction),
        otherNodes = other.nodes().sort(Graph._nodeSortFunction);
    for (var i = myNodes.length; i--; ) {
      // if a pair of nodes isn't equal, graphs are not equal
      if (!myNodes[i].equals(otherNodes[i], options)) {
        return false;
      }
    }
    return true;
  };
  // creates a clone of the graph
  graphproto.clone = function(opts) {
    var cloneOpts = $.extend(this.options, {visible: false}, opts);
    if ('element' in cloneOpts) { delete cloneOpts.element; }
    var cloneGraph = this.jsav.ds.graph(cloneOpts),
        nodes = this.nodes(Graph._nodeSortFunction),
        cloneNode, cloneNodes,
        edges = this.edges(),
        n, e, i, fromInd, toInd, edgeOpts;

    // clone all the nodes
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i];
      cloneNode = cloneGraph.addNode(n.value(), cloneOpts);
      cloneNode.element.attr("style", n.element.attr("style"));
      cloneNode.element.attr("class", n.element.attr("class"));
    }
    cloneNodes = cloneGraph.nodes(Graph._nodeSortFunction);

    // clone all the edges
    for (i = 0; i < edges.length; i++) {
      e = edges[i];
      fromInd = nodes.indexOf(e.start());
      toInd = nodes.indexOf(e.end());
      // add edge weight
      if (typeof e.weight() !== "undefined") {
        edgeOpts = { weight: e.weight() };
      } else {
        edgeOpts = { };
      }
      cloneGraph.addEdge(cloneNodes[fromInd], cloneNodes[toInd], $.extend({}, cloneOpts, edgeOpts));
    }
    return cloneGraph;
  };
  graphproto.state = function(newState) {
    if (typeof newState !== "undefined") {
      // remove all edges
      var edges = this.edges(),
          nodes = this.nodes(Graph._nodeSortFunction),
          newNodes = newState.n,
          newEdges = newState.e,
          i, l, e, newE;
      for (i = 0, l = edges.length; i < l; i++) {
        e = edges[i];
        this.removeEdge(e.start(), e.end(), {record: false});
      }
      // go through existing nodes and set the state
      for (i = 0; i < nodes.length && i < newNodes.length; i++) {
        nodes[i].state(newNodes[i]);
      }
      // remove extra nodes
      while (i < nodes.length) {
        this.removeNode(nodes[nodes.length - 1]);
        i++;
      }
      //   or add needed nodes
      while(i < newNodes.length) {
        var newNode = this.newNode("", {record: false});
        newNode.state(newNodes[nodes.length]);
        nodes.push(newNode);
        i++;
      }
      // create edges between the nodes
      for (i = 0, l = newEdges.length; i < l; i++) {
        e = newEdges[i]; // includes array like [startNodeIndex, endNodeIndex]
        newE = this.addEdge(nodes[e[0]], nodes[e[1]], {record: false});
        newE.state(e[2]);
      }
    } else {
      var state = {},
          nodes = [],
          edges = [],
          nodelist = this.nodes(Graph._nodeSortFunction),
          edgelist = this.edges(),
        i, e;
      for (i = 0; i < nodelist.length; i++) {
        nodes.push(nodelist[i].state());
      }
      for (i = 0; i < edgelist.length; i++) {
        e = edgelist[i];
        edges.push([nodelist.indexOf(e.start()), nodelist.indexOf(e.end()), e.state()]);
      }
      state.n = nodes;
      state.e = edges;
      return state;
    }
  };


  // add the event handler registering functions
  JSAV.utils._events._addEventSupport(graphproto);

  // do the graph layout
  graphproto.layout = function(options) {
    var layoutAlg = this.options.layout || "_default";
    return this.jsav.ds.layout.graph[layoutAlg](this, options);
  };

  var SpringLayout = function(graph, options) {
    this.graph = graph;
    this.iterations = 2000;
    this.maxRepulsiveForceDistance = 6;
    this.k = 2;
    this.c = 0.01;
    this.maxVertexMovement = 0.5;
    this.results = {};
    this.nodes = graph.nodes();
    this.edges = graph.edges();
    this.layout();
    var factorX = (graph.element.width() - this.maxNodeWidth) / (this.layoutMaxX - this.layoutMinX),
        factorY = (graph.element.height() - this.maxNodeHeight) / (this.layoutMaxY - this.layoutMinY),
        node, edge, res;
    for (var i = 0, l = this.nodes.length; i < l; i++) {
      node = this.nodes[i];
      res = this.results[node.id()];
      node.moveTo((res.layoutPosX - this.layoutMinX) * factorX,
                  Math.max(0, (res.layoutPosY - this.layoutMinY) * factorY -
                    node.element.outerHeight()));
    }
    for (i = 0, l = this.edges.length; i < l; i++) {
      edge = this.edges[i];
      edge.layout(options);
    }
  };

  /*!
   * Graph layout algorithm based on Graph Dracula
   * https://github.com/strathausen/dracula
   * Graph Dracula is "released under the MIT license"
   */
  SpringLayout.prototype = {
    layout: function() {
      this.layoutPrepare();
      for (var i = 0; i < this.iterations; i++) {
        this.layoutIteration();
      }
      this.layoutCalcBounds();
    },

    layoutPrepare: function() {
      for (var i = 0, l = this.nodes.length; i < l; i++) {
        var node = {};
        node.layoutPosX = 0;
        node.layoutPosY = 0;
        node.layoutForceX = 0;
        node.layoutForceY = 0;
        this.results[this.nodes[i].id()] = node;
      }
    },

    layoutCalcBounds: function() {
      var minx = Infinity,
          maxx = -Infinity,
          miny = Infinity,
          maxy = -Infinity,
          nodes = this.nodes,
          maxNodeWidth = -Infinity,
          maxNodeHeight = -Infinity,
          i, x, y, l, n;

      for (i = 0, l = nodes.length; i < l; i++) {
        n = nodes[i];
        x = this.results[n.id()].layoutPosX;
        y = this.results[n.id()].layoutPosY;
        if (x > maxx) { maxx = x; }
        if (x < minx) { minx = x; }
        if (y > maxy) { maxy = y; }
        if (y < miny) { miny = y; }
        maxNodeWidth = Math.max(maxNodeWidth, n.element.outerWidth());
        maxNodeHeight = Math.max(maxNodeHeight, n.element.outerHeight());
      }

      this.layoutMinX = minx;
      this.layoutMaxX = maxx;
      this.layoutMinY = miny;
      this.layoutMaxY = maxy;
      this.maxNodeWidth = maxNodeWidth;
      this.maxNodeHeight = maxNodeHeight;
    },

    layoutIteration: function() {
      // Forces on nodes due to node-node repulsions
      var prev = [],
          nodes, edges,
          i, l, j, k;
      nodes = this.nodes;
      for (i = 0, l = nodes.length; i < l; i++) {
        var node1 = nodes[i];
        for (j = 0, k = prev.length; j < k; j++) {
          var node2 = nodes[prev[j]];
          this.layoutRepulsive(node1, node2);
        }
        prev.push(i);
      }

      // Forces on nodes due to edge attractions
      edges = this.edges;
      for (i = 0, l = edges.length; i < l; i++) {
        var edge = edges[i];
        this.layoutAttractive(edge);
      }

      // Move by the given force
      nodes = this.nodes;
      for (i = 0, l = nodes.length; i < l; i++) {
        var node = this.results[nodes[i].id()];
        var xmove = this.c * node.layoutForceX;
        var ymove = this.c * node.layoutForceY;

        var max = this.maxVertexMovement;
        if (xmove > max) { xmove = max; }
        if (xmove < -max) { xmove = -max; }
        if (ymove > max) { ymove = max; }
        if (ymove < -max) { ymove = -max; }

        node.layoutPosX += xmove;
        node.layoutPosY += ymove;
        node.layoutForceX = 0;
        node.layoutForceY = 0;
      }
    },

    layoutRepulsive: function(node1, node2) {
      if (typeof node1 === 'undefined' || typeof node2 === 'undefined') {
        return;
      }
      var lay1 = this.results[node1.id()],
          lay2 = this.results[node2.id()];
      var dx = lay2.layoutPosX - lay1.layoutPosX;
      var dy = lay2.layoutPosY - lay1.layoutPosY;
      var d2 = dx * dx + dy * dy;
      if (d2 < 0.01) {
        dx = 0.1 * Math.random() + 0.1;
        dy = 0.1 * Math.random() + 0.1;
        d2 = dx * dx + dy * dy;
      }
      var d = Math.sqrt(d2);
      if (d < this.maxRepulsiveForceDistance) {
        var repulsiveForce = this.k * this.k / d;
        lay2.layoutForceX += repulsiveForce * dx / d;
        lay2.layoutForceY += repulsiveForce * dy / d;
        lay1.layoutForceX -= repulsiveForce * dx / d;
        lay1.layoutForceY -= repulsiveForce * dy / d;
      }
    },

    layoutAttractive: function(edge) {
      var node1 = edge.start();
      var node2 = edge.end();


      var lay1 = this.results[node1.id()],
          lay2 = this.results[node2.id()];
      var dx = lay2.layoutPosX - lay1.layoutPosX;
      var dy = lay2.layoutPosY - lay1.layoutPosY;
      var d2 = dx * dx + dy * dy;
      if (d2 < 0.01) {
        dx = 0.1 * Math.random() + 0.1;
        dy = 0.1 * Math.random() + 0.1;
        d2 = dx * dx + dy * dy;
      }
      var d = Math.sqrt(d2);
      if (d > this.maxRepulsiveForceDistance) {
        d = this.maxRepulsiveForceDistance;
        d2 = d * d;
      }
      var attractiveForce = (d2 - this.k * this.k) / this.k;
      if (edge.attraction === undefined) {
        edge.attraction = 1;
      }
      attractiveForce *= Math.log(edge.attraction) * 0.5 + 1;

      lay2.layoutForceX -= attractiveForce * dx / d;
      lay2.layoutForceY -= attractiveForce * dy / d;
      lay1.layoutForceX += attractiveForce * dx / d;
      lay1.layoutForceY += attractiveForce * dy / d;
    }
  };
  /*! End Graph Dracula -based code
  */

  var springLayout = function springLayout(graph, options) {
    var layout = new SpringLayout(graph);
  };
  var manualLayout = function manualLayout(graph, options) {
    var i, l, edge,
        edges = graph.edges();
    for (i = 0, l = edges.length; i < l; i++) {
      edge = edges[i];
      edge.layout();
    }
  };
  JSAV.ext.ds.layout.graph = {
    "_default": manualLayout,
    "automatic": springLayout,
    "manual": manualLayout
  };


  // a layout function using a layered graph layout algorithm
  // expects the Dagre library (https://github.com/cpettitt/dagre) to be loaded
  var dagreLayout = function(graph, options) {
    // if dagre is not loaded, show error and return
    if (!('dagre' in window)) {
      console.error("You are trying to use the layered layout, please load dagre.js " +
        "(https://github.com/cpettitt/dagre)!");
      return;
    }
    var opts = $.extend({}, graph.options, options);
    // create a dagre graph (directed always, even though the graph can be undirected)
    var g = new dagre.Digraph();
    // go through and add the nodes to the dagre graph
    var nodes = graph.nodes();
    var nmap = {};
    while (nodes.hasNext()) {
      var node = nodes.next();
      nmap[node.id()] = node;
      g.addNode(node.id(), {width: node.bounds().width, height: node.bounds().height})
    }
    // add the edges
    var edges = graph.edges();
    while (edges.hasNext()) {
      var edge = edges.next();
      g.addEdge(null, edge.start().id(), edge.end().id());
    }
    // run the dagre layout
    var layout = dagre.layout().run(g);
    // move the JSAV nodes to the layout positions
    // and get max x and y of bottom-right corner
    var maxX = -1,
      maxY = -1;
    layout.eachNode(function(u, value) {
      if (!opts.boundsOnly) {
        nmap[u].moveTo(value.x - value.width/2.0, value.y - value.height/2.0);
      }
      maxX = Math.max(value.x + value.width, maxX);
      maxY = Math.max(value.y + value.height, maxY);
    });
    // new size of the graph should be:
    var graphDims = { width: maxX + 5, height: maxY + 5}; // +5 for the box shadow :)
    if (!opts.boundsOnly) { // if we should update..
      // set the size of the graph
      graph.css(graphDims);
      // call the JSAV edge layout function for all the edges
      edges = graph.edges();
      while (edges.hasNext()) {
        edge = edges.next();
        edge.layout();
      }
    }
    // return the new bounds of the graph
    return $.extend({ top: graph.position().top }, graphDims);
  };
  // expose the dagre layout function as layered layout
  JSAV.ext.ds.layout.graph.layered = dagreLayout;
  // end the layered graph layout stuff..


  // The GraphNode type definition
  var GraphNode = function(container, value, options) {
    this.jsav = container.jsav;
    this.container = container;
    this.options = $.extend(true, {visible: true, left: 0, top: 0}, options);
    var el = this.options.nodeelement || $("<div><span class='jsavvalue'>" + this._valstring(value) + "</span></div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavgraphnode")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if (this.options.autoResize) {
      el.addClass("jsavautoresize");
    }
    this.container.element.append(el);

    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(GraphNode, JSAV._types.ds.Node);
  var nodeproto = GraphNode.prototype;
  nodeproto.css = JSAV.utils._helpers.css;
  nodeproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);

  nodeproto.neighbors = function() {
    var edges,
        neighbors = [],
        edge, i, l;
    if (this.container.options.directed) { // directed graph
      edges = this.container._edges[this.container._nodes.indexOf(this)];
      for (i = 0, l = edges.length; i < l; i++) {
        neighbors.push(edges[i].end());
      }
    } else { // undirected graph
      // inefficient way to go through all edges, but educational graphs should be small :)
      edges = this.container.edges();
      for (i = 0, l = edges.length; i < l; i++) {
        edge = edges[i];
        if (edge.start() === this) {
          neighbors.push(edge.end());
        } else if (edge.end() === this) {
          neighbors.push(edge.start());
        }
      }
    }
    return JSAV.utils.iterable(neighbors);
  };
  nodeproto.edgeTo = function(node) {
    return this.container.getEdge(this, node);
  };
  nodeproto.edgeFrom = function(node) {
    return node.edgeTo(this);
  };

  nodeproto.equals = function(otherNode, options) {
    if (!otherNode || this.value() !== otherNode.value()) {
      return false;
    }

    // compare css properties of the node
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherNode, options.css);
      if (!cssEquals) { return false; }
    }
    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherNode, options["class"]);
      if (!classEquals) { return false; }
    }

    var myNeighbors = this.neighbors().sort(Graph._nodeSortFunction),
        otherNeighbors = otherNode.neighbors().sort(Graph._nodeSortFunction),
        myNeighbor, otherNeighbor;
    // different number of neighbors -> cannot be equal nodes
    if (myNeighbors.length !== otherNeighbors.length) { return false; }

    var i;
    for (i = myNeighbors.length; i--; ) {
      myNeighbor = myNeighbors[i];
      otherNeighbor = otherNeighbors[i];
      // if value of neighbor differs, this node is different than otherNode
      if (myNeighbor.value() !== otherNeighbor.value()) { return false; }
      // if edges differ -> not the same nodes
      if (!this.container.getEdge(this, myNeighbor)
                .equals(otherNode.container.getEdge(otherNode, otherNeighbor),
                        $.extend({}, options, {dontCheckNodes: true})
                        //options
                        )) {
        return false;
      }
    }

    return true; // values equal, neighbors equal, edges equal, nothing else to compare
  };

  // expose the types
  var dstypes = JSAV._types.ds;
  dstypes.Graph = Graph;
  dstypes.GraphNode = GraphNode;

  // add functions to jsav.ds to create graphs
  JSAV.ext.ds.graph = function(options) {
    return new Graph(this, $.extend(true, {visible: true, autoresize: true}, options));
  };

})(jQuery);

/*global JSAV, jQuery, console */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  var getIndices = JSAV.utils._helpers.getIndices;
  var defaultOptions = {style: "table",
                        autoresize: true,
                        center: true,
                        visible: true};
  /* Matrix data structure for JSAV library. */
  var Matrix = function(jsav, initialData, options) {
    this.jsav = jsav;
    var i;
    if ($.isArray(initialData)) { // initialData contains an array of data
      this.options = $.extend({}, defaultOptions, options);
      options = this.options;
    } else if (typeof initialData === "object") { // initialData is options
      this.options = $.extend({}, defaultOptions, initialData);
      options = this.options; // cache the options
      // we'll create an initialData based on lines and columns options
      var temparr = [];
      initialData = [];
      temparr.length = options.columns;
      for (i = options.rows; i--; ) { initialData.push(temparr); }
    } else {
      console.error("Invalid arguments for initializing a matrix!");
    }
    this.element = options.element?$(options.element):$("<div class='jsavmatrix' />")
                                                      .appendTo(jsav.canvas); // add to DOM
    if ('id' in options) {
      this.id(options.id, {record: false});
    }
    // add a class for the style of the matrix
    this.element.addClass("jsavmatrix" + options.style);

    // create arrays within the matrix element
    // set visible to false to prevent the array from animating show
    var arrayOpts = $.extend({}, options, {center: false, visible: false}),
        arrayElem;

    // make sure we don't pass the matrix's id or positioning to the arrays
    delete arrayOpts.id;
    delete arrayOpts.left;
    delete arrayOpts.top;
    delete arrayOpts.relativeTo;
    this._arrays = [];
    for (i = 0; i < initialData.length; i++) {
      // create an element for the array and add to options
      arrayElem = $("<ol />");
      arrayOpts.element = arrayElem;
      this.element.append(arrayElem);
      // initialize the array
      this._arrays[i] = jsav.ds.array(initialData[i], arrayOpts);
      // set the array visible, visibility will be handled by the matrix element
      arrayElem.css("display", "block");
    }
    this.options = $.extend(true, {}, options);
    JSAV.utils._helpers.handlePosition(this);
    this.layout();
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(Matrix, JSAV._types.ds.JSAVDataStructure);
  var matrixproto = Matrix.prototype;

  // swap two elements in the matrix, (row1, col1) with (row2, col2)
  matrixproto.swap = function(row1, col1, row2, col2, options) {
    this.jsav.effects.swapValues(this._arrays[row1], col1,
                                        this._arrays[row2], col2,
                                        options);
    return this;
  };
  // set or get the state of this structure to be restored in the future
  matrixproto.state = function(newState) {
    var _arrays = this._arrays, // cache
        i, l;
    if (newState) {
      for (i = 0, l = _arrays.length; i < l; i++) {
        _arrays[i].state(newState[i]);
      }
      return this;
    } else {
      var state = [];
      for (i = 0, l = _arrays.length; i < l; i++) {
        state.push(_arrays[i].state());
      }
      return state;
    }
  };
  // layout all the arrays in this matrix
  matrixproto.layout = function(options) {
    var dimensions, i,
        l = this._arrays.length,
        maxWidth = -1;
    // if we want to center the structure, add the css class to do that
    if (this.options.center) {
      this.element.addClass("jsavcenter");
    }
    for (i = 0; i < l; i++) {
      dimensions = this._arrays[i].layout(options);
      maxWidth = Math.max(maxWidth, dimensions.width);
    }
    this.element.width(maxWidth + "px");
  };
  matrixproto.equals = function(other, options) {
    var i, l,
        _arrays, _other;
    if ($.isArray(other)) {
      for (i = other.length; i--; ) {
        if (!this._arrays[i].equals(other[i], options)) {
          return false;
        }
      }
    } else if (other.constructor === Matrix) {
      _arrays = this._arrays;
      _other = other._arrays;
      // if lengths don't match, they can't be the same
      if (_other.length !== _arrays.length) {
        return false;
      }
      // iterate over the arrays and compare (starting from end)
      for (i = _other.length; i--; ) {
        if (!_arrays[i].equals(_other[i], options)) {
          return false;
        }
      }
    } else {
      console.error("Unknown type of object for comparing with matrix:", other);
      return false;
    }
    // if we made it this far, the matrices are equal
    return true;
  };

  // functions of array that we want to add to the matrix
  var arrayFunctions = ["highlight", "unhighlight", "isHighlight", "css", "value",
                        "addClass", "hasClass", "removeClass", "toggleClass"];
  // will return a wrapper for the arrays function with funcname
  // the returned function will assume the row index as the first parameter and will
  // pass the rest of the arguments to the array function
  var arrayFunctionWrapper = function(funcname) {
    return function() {
      var arrIndex = arguments[0];
      if (typeof arrIndex !== "number") { return; }
      var array = this._arrays[arrIndex];
      return array[funcname].apply(array, [].slice.call(arguments, 1));
    };
  };
  // add functions with all the names in arrayFunctions wrapped in the row extension function
  for (var i = arrayFunctions.length; i--; ) {
    matrixproto[arrayFunctions[i]] = arrayFunctionWrapper(arrayFunctions[i]);
  }


  // events to register as functions on the matrix
  var events = ["click", "dblclick", "mousedown", "mousemove", "mouseup",
                "mouseenter", "mouseleave"];
  // returns a function for the passed eventType that binds a passed
  // function to that eventType for indices in the arrays
  var eventhandler = function(eventType) {
    return function(data, handler) {
      // store reference to this, needed when executing the handler
      var self = this;
      // bind a jQuery event handler, limit to .jsavindex
      this.element.on(eventType, ".jsavindex", function(e) {
        var targetArray = $(this).parent();
        // get the row of the clicked element
        var row = self.element.find(".jsavarray").index(targetArray);
        var col = targetArray.find(".jsavindex").index(this);
        // log the event
        self.jsav.logEvent({type: "jsav-matrix-" + eventType,
                            matrixid: self.id(),
                            row: row,
                            column: col});
        if ($.isFunction(data)) { // if no custom data..
          // ..bind this to the matrix and call handler
          // with params row and column and the event
          data.call(self, row, col, e);
        } else if ($.isFunction(handler)) { // if custom data is passed
          var params = $.isArray(data)?data.slice(0):[data]; // get a cloned array or data as array
          params.unshift(col); // add index to first parameter
          params.unshift(row); // add index to first parameter
          params.push(e); // jQuery event as the last
          handler.apply(self, params); // apply the function
        }
      });
      return this;
    };
  };
  // create the event binding functions and add to array prototype
  for (i = events.length; i--; ) {
    matrixproto[events[i]] = eventhandler(events[i]);
  }
  matrixproto.on = function(eventName, data, handler) {
    eventhandler(eventName).call(this, data, handler);
    return this;
  };


  JSAV._types.ds.Matrix = Matrix;
  JSAV.ext.ds.matrix = function(initialData, options) {
    return new Matrix(this, initialData, options);
  };
})(jQuery);
/**
* Module that contains support for program code constructs.
* Depends on core.js, anim.js
*/
/*global JSAV, jQuery */
(function($) {
  "use strict";
  if (typeof JSAV === "undefined") { return; }

  var getIndices = JSAV.utils._helpers.getIndices;

  var Variable = function(jsav, value, options) {
    this.jsav = jsav;
    this.options = $.extend({visible: false, type: typeof value}, options);
    this.element = $('<div class="jsavvariable">' +
                      '<span class="jsavvarlabel"></span> <span class="jsavvalue">' +
                      '<span class="jsavvaluelabel jsavvarvalue">' + value + '</span></span></div>');
    this.element.find(".jsavvarvalue").attr("data-value", value);
    this.element.data("var", this);
    if (this.options.before) {
      this.element.insertBefore(this.options.before.element);
    } else if (this.options.after) {
      this.element.insertAfter(this.options.after.element);
    } else {
      $(this.jsav.canvas).append(this.element);
    }
    if (this.options.label) {
      this.element.find(".jsavvarlabel").html(this.options.label);
    }
    if (this.options.name) {
      this.element.attr("data-varname", this.options.name);
    }
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };
  JSAV.utils.extend(Variable, JSAV._types.JSAVObject);
  var varproto = Variable.prototype;
  // add visibility functions
  varproto._toggleVisible = JSAV.anim(JSAV.ext.effects._toggleVisible);
  varproto.show = JSAV.ext.effects.show;
  varproto.hide = JSAV.ext.effects.hide;
  // add event handlers to variable
  JSAV.utils._events._addEventSupport(varproto, { selector: ".jsavvalue",
                                                  logEventPrefix: "jsav-var-",
                                                  dataField: "var"});
  varproto._setValue = JSAV.anim(
    function(newValue, options) {
      var oldValue = this.value();
      this.element.find(".jsavvarvalue").html(newValue);
      this.element.find(".jsavvarvalue").attr("data-value", newValue);
      return [oldValue, options];
    }
  );
  varproto.value = function(newValue, options) {
    if (typeof newValue === "undefined") {
      var val = this.element.find(".jsavvarvalue").attr("data-value");
      return JSAV.utils.value2type(val, this.options.type);
    } else {
      this._setValue(newValue, options);
      return this;
    }
  };
  varproto.state = function(newstate) {
    if (newstate) {
      // set the type of this variable
      this.options.type = newstate.t;
      // set the value
      this.value(newstate.v, {record: false});
      // use the helper to add the classes and remove any existing extra classes
      JSAV.utils._helpers.setElementClasses(this.element, newstate.cls || []);
      // set the style attribute to match the newstate or clear existing styles
      this.element.attr("style", newstate.style || "");
    } else { // no new state, so return the current state
      var state = { t: this.options.type, v: this.value() },
          cls = JSAV.utils._helpers.elementClasses(this.element),
          style = this.element.attr("style");
      if (style) { state.style = style; }
      if (cls.length > 0) { state.cls = cls; }
      return state;
    }
  };
  varproto.equals = function(otherVariable, options) {
    if (!otherVariable || typeof otherVariable !== "object" ||
      this.value() !== otherVariable.value()) { return false; }
    // compare styling of the variables
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherVariable, options.css);
      if (!cssEquals) { return false; }
    }

    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherVariable, options["class"]);
      if (!classEquals) { return false; }
    }
    return true;
  };
  varproto.css = JSAV.utils._helpers.css;
  varproto._setcss = JSAV.anim(JSAV.utils._helpers._setcss);
  varproto.addClass = JSAV.utils._helpers.addClass;
  varproto.removeClass = JSAV.utils._helpers.removeClass;
  varproto.hasClass = JSAV.utils._helpers.hasClass;
  varproto.toggleClass = JSAV.anim(JSAV.utils._helpers._toggleClass);
  varproto.highlight = function(options) {
    this.addClass("jsavhighlight", options);
  };
  varproto.unhighlight = function(options) {
    this.removeClass("jsavhighlight", options);
  };
  varproto.isHighlight = function() {
    return this.hasClass("jsavhighlight");
  };


  JSAV._types.Variable = Variable;
  JSAV.ext.variable = function(value, options) {
    return new Variable(this, value, options);
  };


  // A pointer object that can have a name and a target that it points to.
  var Pointer = function(jsav, name, options) {
    this.jsav = jsav;
    var defaultOptions = {visible: true, // visible by default
                          follow: true,
                          // positioned 20px above the object pointed to
                          anchor: "left top",
                          myAnchor: "left bottom",
                          left: 0,
                          top: "-20px" };
    this.options = $.extend(defaultOptions, options);
    this.element = $('<div class="jsavpointer"><div class="jsavlabel">' + name + '</div>' +
                     '<div class="jsavpointerarea"></div></div>');
    if (this.options.before) {
      this.element.insertBefore(this.options.before.element);
    } else if (this.options.after) {
      this.element.insertAfter(this.options.after.element);
    } else if (this.options.container) {
      this.options.container.append(this.element);
    } else {
      $(this.jsav.canvas).append(this.element);
    }

    // if we have relativeIndex or targetIndex in options, get the index and
    // delete the options
    if (typeof(this.options.targetIndex) !== "undefined") {
      this.options.relativeTo = this.options.relativeTo.index(this.options.targetIndex);
      delete this.options.targetIndex;
      delete this.options.relativeIndex;
    } else if (typeof(this.options.relativeIndex) !== "undefined") {
      this.options.relativeTo = this.options.relativeTo.index(this.options.relativeIndex);
      delete this.options.relativeIndex;
    }

    if (!this.options.fixed) {
      this.options.follow = true;
      var pointer = this;
      var arrowPointerListener = function(dleft, dtop) {
        pointer._pointerLeftSum += dleft;
        pointer._pointerTopSum += dtop;
      };
      this._arrowPointerCallback = arrowPointerListener;
    }
    JSAV.utils._helpers.setRelativePositioning(this, $.extend({}, this.options, {callback: this._arrowPointerCallback}));

    JSAV.utils._helpers.handleVisibility(this, this.options);
    this._target = this.options.relativeTo;
    if (this._target) {
      this._createArrow();
    }
  };
  // Extend the Label type
  JSAV.utils.extend(Pointer, JSAV._types.Label);
  var pointerproto = Pointer.prototype;

  // Function to make the arrow end follow the target element of this pointer.
  // The arrow will change in two ways: when pointer moves and when target moves.
  // This function handles the latter case. This function also registers a handler
  // for jsav-updaterelative event which will trigger the actual re-drawing of the
  // arrow. Until that event fires, the change in position is tracked in fields
  // _targetLeft/TopSum and _pointerLeft/TopSum.
  //
  // The movement of the pointer element is handled by a listener set in the
  // constructor.
  pointerproto._setArrowTargetFollower = function() {
    this._targetLeftSum = 0;
    this._targetTopSum = 0;
    // store this in the closure for the handlers
    var pointer = this;
    if (!this._arrowUpdateRelativeListener) {
      // A handler for jsav-updaterelative event. When the event fires, move
      // the arrow based on the cumulative translations
      var arrowUpdateRelativeListener = function() {
        if (!pointer.isVisible()) { return; }
        pointer._translateArrowPoints(pointer._pointerLeftSum, pointer._pointerTopSum,
                                   pointer._targetLeftSum, pointer._targetTopSum);
        pointer._targetLeftSum = 0;
        pointer._targetTopSum = 0;
        pointer._pointerLeftSum = 0;
        pointer._pointerTopSum = 0;
      };
      // store the function to recognize later that it has been set
      this._arrowUpdateRelativeListener = arrowUpdateRelativeListener;
      // register the event listener
      pointer.jsav.container.on("jsav-updaterelative", arrowUpdateRelativeListener);
    }

    // function called whenever the target moves.
    var arrowTargetListener = function(dleft, dtop) {
      pointer._targetLeftSum += dleft;
      pointer._targetTopSum += dtop;
    };
    // set up an event handler to update the arrow position whenever the target moves
    JSAV.utils._helpers._setRelativeFollowUpdater(this.arrow, this._target, {callback: arrowTargetListener,
                                                        autotranslate: false});
  };

  // translate the start and end points of the arrow by the given amounts
  pointerproto._translateArrowPoints = function(startDiffX, startDiffY, endDiffX, endDiffY) {
    var curPoints = this.arrow.points();
    curPoints[0][0] += startDiffX;
    curPoints[0][1] += startDiffY;
    curPoints[1][0] += endDiffX;
    curPoints[1][1] += endDiffY;
    // call the movePoints of the line (in the slightly strange format it has :))
    this.arrow.movePoints([[0, curPoints[0][0], curPoints[0][1]],
                           [1, curPoints[1][0], curPoints[1][1]]]);
  };
  // helper function to create the arrow for the pointer
  pointerproto._createArrow = function(options) {
    // calculate the points
    var arrowPoints = this._arrowPoints();
    // create the line graphical primitive for the arrow
    var arrow = this.jsav.g.line(arrowPoints[0][1], arrowPoints[0][2],
        arrowPoints[1][1], arrowPoints[1][2],
        {"arrow-end": "classic-wide",
          "arrow-start": "oval-medium-medium",
          "stroke-width": 2,
          "opacity": 0});
    if (this.isVisible()) {
      arrow.show();
    }
    this._pointerLeftSum = 0;
    this._pointerTopSum = 0;
    // store the arrow in the object
    this.arrow = arrow;
    // set the arrow to follow the target
    this._setArrowTargetFollower();
  };

  // Helper function to record the change of the pointer target.
  pointerproto._setTarget = JSAV.anim(
    function(newTarget, options) {
      var oldTarget = this.target();
      this._target = newTarget;
      return [oldTarget];
    }
  );
  // Calculates the start and end points of the arrow to be drawn for this pointer.
  // Returns a structure compatible with the line.movePoints(..) function. That is,
  // an array like [[0, startX, startY], [1, endX, endY]]
  // Note, that this assumes that both the pointer and the target are inside the
  // jsavcanvas HTML element.
  // Also not, that this uses _calculateArrowTargetPosition to calculate the end point.
  pointerproto._arrowPoints = function(newLeft, newTop, options) {
    if (typeof newLeft === "object") {
      options = newLeft;
      newLeft = null;
      newTop = null;
    }
    var opts = $.extend({}, this.options, options),
        myBounds = this.bounds();

    var targetPoint = this._calculateArrowTargetPosition(this._target, opts),
        newPoints = [[0, (newLeft || myBounds.left) + myBounds.width/2 + 1, //+1 to center the arrow start "ball"
                         (newTop || myBounds.top) + myBounds.height - 5], // -5 to get to center of pointerarea
                     [1, targetPoint[0], targetPoint[1]]];
    return newPoints;
  };
  // calculate the end point of the arrow based on the target element. Argument target
  // should be a JSAV object.
  pointerproto._calculateArrowTargetPosition = function(target, opts) {
    var myBounds = this.bounds();
    // if targetting null, make the arrow 0 length
    if (this._target === null) {
      return [myBounds.left + myBounds.width/2 + 5, myBounds.top + myBounds.height + 5];
    }
    // figure out where to target the arrow
    // format of the arrowAnchor should be horz vert
    // where horz is left, center, right, or a percentage
    // and vert is top, center, bottom, or a percentage
    var horzPercentMapping = {left: 0, center: 50, right: 100},
        vertPercentMapping = {top: 0, center: 50, bottom: 100};
    var arrowHorzAnchor = 50, // default to center
        arrowVertAnchor = 0, // and top
        arrowAnchor = opts.arrowAnchor || this.options.arrowAnchor;
    if (arrowAnchor) {
      var anchor = arrowAnchor.split(' ');
      if (anchor.length === 1) {
        arrowHorzAnchor = arrowVertAnchor = parseInt(anchor[0], 10);
      } else {
        arrowHorzAnchor = horzPercentMapping[anchor[0]];
        if (typeof arrowHorzAnchor !== "number") {
          arrowHorzAnchor = parseInt(anchor[0], 10);
        }
        arrowVertAnchor = vertPercentMapping[anchor[1]];
        if (typeof arrowVertAnchor !== "number") {
          arrowVertAnchor = parseInt(anchor[1], 10);
        }
      }
    }
    var targetElem = target.element,
        targetOffset = targetElem.offset(),
        canvasOffset = this.jsav.canvas.offset(),
        targetBounds = {width: targetElem.outerWidth(),
          height: targetElem.outerHeight(),
          left: targetOffset.left - canvasOffset.left,
          top: targetOffset.top - canvasOffset.top};
    return [targetBounds.left + targetBounds.width*arrowHorzAnchor/100.0,
            targetBounds.top + targetBounds.height*arrowVertAnchor/100.0];
  };

  // Update the target of this pointer. Argument newTarget should be a JSAV object.
  // Options available are the same as when positioning elements relative to each other.
  pointerproto.target = function(newTarget, options) {
    if (typeof newTarget === "undefined") {
      return this._target;
    } else {
      var opts = $.extend({}, options);

      // if relativeIndex or targetIndex are in options, get the index from the
      // target and delete the options
      if (typeof(opts.targetIndex) !== "undefined") {
        newTarget = newTarget.index(opts.targetIndex);
        delete opts.targetIndex;
        delete opts.relativeIndex;
      } else if (typeof(opts.relativeIndex) !== "undefined") {
        newTarget = newTarget.index(opts.relativeIndex);
        delete opts.relativeIndex;
      }

      // record the change of the target
      this._setTarget(newTarget, opts);

      // if setting target to null, hide the arrow
      if (newTarget === null) {
        if (this.arrow) { this.arrow.hide(); }
        this.addClass("jsavnullpointer");
        return this;
      } else {
        this.removeClass("jsavnullpointer");
      }
      // if no arrow, create the arrow
      if (!this.arrow) {
        this._createArrow(opts);
      } else if (!this.arrow.isVisible()) {
        // if arrow is hidden, show it
        this.arrow.show();
      }

      // reset the counters for pointer position change
      this._pointerLeftSum = 0;
      this._pointerTopSum = 0;
      // if position is not fixed, update relative position to match new target
      if (!this.options.fixed) {
        var newPos = JSAV.utils._helpers.setRelativePositioning(this, $.extend({}, this.options, opts,
                                                              {relativeTo: newTarget,
                                                               callback: this._arrowPointerCallback}));
      }
      // set the arrow to follow the new target
      this._setArrowTargetFollower();
      // calculate the change in position for the arrow target
      var newTargetArrowPoint = this._calculateArrowTargetPosition(newTarget, opts);
      var currTargetPoint = this.arrow.points()[1];
      this._targetLeftSum += newTargetArrowPoint[0] - currTargetPoint[0];
      this._targetTopSum += newTargetArrowPoint[1] - currTargetPoint[1];
      // return this for chaining
      return this;
    }
  };
  pointerproto._orighide = pointerproto.hide;
  pointerproto.hide = function(options) {
    this._orighide(options);
    if (this.arrow) { this.arrow.hide(); }
  };
  pointerproto._origshow = pointerproto.show;
  pointerproto.show = function(options) {
    this._origshow(options);
    if (this.arrow) { this.arrow.show(); }
  };
  pointerproto.equals = function(otherPointer, options) {
    if (!otherPointer || !otherPointer instanceof Pointer) {
      return false;
    }
    if (options && 'css' in options) { // if comparing css properties
      var cssEquals = JSAV.utils._helpers.cssEquals(this, otherPointer, options.css);
      if (!cssEquals) { return false; }
    }
    if (options && 'class' in options) { // if comparing class attributes
      var classEquals = JSAV.utils._helpers.classEquals(this, otherPointer, options["class"]);
      if (!classEquals) { return false; }
    }
    return this.target().equals(otherPointer.target(), options);
  };
  // Expose the Pointer as the .pointer(...) function on JSAV instances.
  JSAV.ext.pointer = function(name, target, options) {
    return new Pointer(this, name, $.extend({}, options, { "relativeTo": target}));
  };
  // Expose the Pointer type
  JSAV._types.Pointer = Pointer;


  // regexps used for trimming
  var trimRightRegexp = /\s+$/,
      trimLeftRegexp = /^\s*\n/;

  // Pseudocode objects for JSAV
  var Code = function(jsav, codelines, options) {
    this.jsav = jsav;
    if (typeof(codelines) === "undefined") {
      codelines = [];
    } else if (typeof(codelines) === "string") {
      // strings will be split at newline characters
      codelines = codelines.split("\n");
    } else if (typeof(codelines) === "object" && !$.isArray(codelines)) {
      options = codelines;
      // if no codelines are given, we assume options includes a URL
      $.ajax( {
                url: options.url,
                async: false, // we need it now, so not asynchronous request
                mimeType: "text/plain", // assume it is text
                success: function(data) {
                  var code = data,
                      tmp;
                  if (options.startAfter) {
                    // split on the start tag
                    tmp = code.split(options.startAfter);
                    // if there are multiple instances, we'll use the last one
                    code = tmp[tmp.length - 1];
                  }
                  if (options.endBefore) {
                    // split on the end tag
                    // in case of multiple instances of the marker, use the first part
                    code = code.split(options.endBefore)[0];
                  }

                  // strip extra whitespace from beginning and end; not the whitespace on the
                  // first line of code, though
                  code = code.replace(trimRightRegexp, "").replace(trimLeftRegexp, "");
                  codelines = code.split("\n");
                }
              });
    }
    this.options = $.extend({visible: true, lineNumbers: true, htmlEscape: true,  center: true}, options);
    // select correct HTML element type based on option lineNumbers
    var elem = this.options.lineNumbers?"ol":"ul";
    this.element = this.options.element || $('<' + elem + ' class="jsavcode"></' + elem + '>');
    if (this.options.before) {
      this.element.insertBefore(this.options.before.element);
    } else if (this.options.after) {
      this.element.insertAfter(this.options.after.element);
    } else {
      $(this.jsav.canvas).append(this.element);
    }
    // generate the elements for all lines...
    var clElems = $();
    for (var i = 0, l = codelines.length; i < l; i++) {
      clElems = clElems.add(createCodeLine(codelines[i], this));
    }
    // .. and change the DOM only once
    this.element.append(clElems);
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
    if (this.options.center && !this.options.left && !this.options.right && !this.options.top && !this.options.bottom) {
      var prevDisplay = this.element.css("display");
      this.element.css("display", "inline-block");
      this.element.css("width", this.element.outerWidth());
      this.element.css("display", prevDisplay);
      this.element.addClass("jsavcenter");
    }
  };
  var createCodeLine = function(code, container) {
    var clElem = $('<li class="jsavcodeline">');
    if (container.options.htmlEscape) {
      // let jQuery do the HTML escaping
      clElem.text(code);
    } else {
      clElem.html(code);
    }
    return clElem;
  };
  JSAV.utils.extend(Code, JSAV._types.JSAVObject);
  var codeproto = Code.prototype;
  codeproto._toggleVisible = JSAV.anim(JSAV.ext.effects._toggleVisible);
  codeproto.addCodeLine = JSAV.anim(function(newLine) {
    this.element.append(createCodeLine(newLine, this));
  });
  // wrapper function for getIndices to add support for numbering with tags
  function getCodeLineElements(self, linenum) {
    if (typeof linenum === "string") {
      if (self.options.tags && typeof self.options.tags[linenum] !== "undefined") {
        linenum = self.options.tags[linenum];
      } else {
        linenum = undefined;
      }
    }
    // Change line numbers to indices
    var indices;
    if (linenum) {
      if (typeof linenum === "number") {
        indices = linenum - 1;
      } else if ($.isArray(linenum)) {
        indices = [];
        for (var i = 0; i < linenum.length; i++) {
          indices[i] = linenum[i] - 1;
        }
      } else if ($.isFunction(linenum)) {
        indices = function (ind) { return linenum(ind + 1); };
      }
    }
    return getIndices($(self.element).find("li.jsavcodeline"), indices);
  }
  codeproto.highlight = function(linenum, options) {
    return this.addClass(linenum, "jsavhighlight");
  };
  codeproto.unhighlight = function(linenum, options) {
    return this.removeClass(linenum, "jsavhighlight");
  };
  codeproto.isHighlight = function(linenum) {
    return this.hasClass(linenum, "jsavhighlight");
  };
  codeproto.toggleClass = JSAV.anim(function(linenum, className, options) {
    var $elems = getCodeLineElements(this, linenum);
    if (this.jsav._shouldAnimate()) {
      this.jsav.effects._toggleClass($elems, className, options);
    } else {
      $elems.toggleClass(className);
    }
    return [linenum, className];
  });
  codeproto.addClass = function(linenum, className, options) {
    var $elems = getCodeLineElements(this, linenum);
    if (!$elems.hasClass(className)) {
      return this.toggleClass(linenum, className, options);
    } else {
      return this;
    }
  };
  codeproto.removeClass = function(linenum, className, options) {
    var $elems = getCodeLineElements(this, linenum);
    if ($elems.hasClass(className)) {
      return this.toggleClass(linenum, className, options);
    } else {
      return this;
    }
  };
  codeproto.hasClass = function(linenum, className) {
    var $elems = getCodeLineElements(this, linenum);
    return $elems.hasClass(className);
  };
  codeproto._setcss = JSAV.anim(function(indices, cssprops, options) {
    var $elems = getCodeLineElements(this, indices);
    if (this.jsav._shouldAnimate()) { // only animate when playing, not when recording
      this.jsav.effects.transition($elems, cssprops, options);
    } else {
      $elems.css(cssprops);
    }
    return this;
  });
  codeproto.setCurrentLine = function(linenum, options) {
    var $curr = this.element.find("li.jsavcurrentline"),
        currlinenum = this.element.find("li.jsavcodeline").index($curr) + 1,
        $prev = this.element.find("li.jsavpreviousline"),
        prevlinenum = this.element.find("li.jsavcodeline").index($prev) + 1;
    if (typeof linenum === "string") {
      if (this.options.tags && typeof this.options.tags[linenum] !== "undefined") {
        linenum = this.options.tags[linenum];
      } else {
        linenum = 0;
      }
    }
    if (linenum === 0) {
      if (currlinenum !== 0) { this.toggleClass(currlinenum, "jsavcurrentline"); }
      if (prevlinenum !== 0) { this.toggleClass(prevlinenum, "jsavpreviousline"); }
    } else if (prevlinenum === 0 && currlinenum === 0) {
      this.toggleClass(linenum, "jsavcurrentline");
    } else if (prevlinenum === 0 && currlinenum !== 0 && linenum !== currlinenum) {
      this.toggleClass(currlinenum, "jsavpreviousline jsavcurrentline", options);
      this.toggleClass(linenum, "jsavcurrentline");
    } else if (prevlinenum !== 0 && currlinenum !== 0 && linenum !== currlinenum && linenum !== prevlinenum && prevlinenum !== currlinenum) {
      this.toggleClass(prevlinenum, "jsavpreviousline", options);
      this.toggleClass(currlinenum, "jsavpreviousline jsavcurrentline", options);
      this.toggleClass(linenum, "jsavcurrentline", options);
    } else if (prevlinenum === linenum && currlinenum === linenum) {
      // nothing to be done
    } else if (prevlinenum !== 0 && currlinenum !== 0 && linenum === prevlinenum) {
      this.toggleClass(prevlinenum, "jsavpreviousline jsavcurrentline", options);
      this.toggleClass(currlinenum, "jsavpreviousline jsavcurrentline", options);
    } else if (prevlinenum !== 0 && currlinenum !== 0 && linenum === currlinenum) {
      this.toggleClass(prevlinenum, "jsavpreviousline", options);
      this.toggleClass(currlinenum, "jsavpreviousline", options);
    } else if (prevlinenum !== 0 && currlinenum !== 0 && currlinenum === prevlinenum) {
      this.toggleClass(prevlinenum, "jsavcurrentline", options);
      this.toggleClass(linenum, "jsavcurrentline", options);
    }
    return this;
  };
  codeproto.css = function(linenum, cssprop, options) {
    var $elems = getCodeLineElements(this, linenum);
    if (typeof cssprop === "string") {
      return $elems.css(cssprop);
    } else if (typeof linenum === "string" && typeof cssprop === "undefined") {
      return this.element.css(linenum);
    } else {
      if ($.isFunction(linenum)) { // if linenum is a function, evaluate it right away and get a list of indices
        var all_elems = $(this.element).find("li.jsavcodeline"),
          sel_indices = []; // array of selected indices
        for (var i = 0; i < $elems.size(); i++) {
          sel_indices.push(all_elems.index($elems[i]) + 1);
        }
        linenum = sel_indices;
      }
      return this._setcss(linenum, cssprop, options);
    }
  };
  codeproto.show = function(linenum, options) {
    if ((typeof(linenum) === "undefined" || typeof(linenum) === "object") &&
        !$.isArray(linenum) && this.element.filter(":visible").size() === 0) {
      return this._toggleVisible(linenum);
    } else {
      return this.removeClass(linenum, "jsavhiddencode", options);
    }
  };
  codeproto.hide = function(linenum, options) {
    if ((typeof(linenum) === "undefined" || typeof(linenum) === "object") &&
        !$.isArray(linenum) && this.element.filter(":visible").size() === 1) {
      return this._toggleVisible(linenum);
    } else {
      return this.addClass(linenum, "jsavhiddencode", options);
    }
  };
  codeproto.state = function(newState) {
    if (typeof(newState) === "undefined") {
      return { "html": this.element.html() };
    } else {
      this.element.html(newState.html);
    }
  };
  JSAV._types.Code = Code;

  JSAV.ext.code = function(codelines, options) {
    return new Code(this, codelines, options);
  };
}(jQuery));
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


(function ($) {
  "use strict";
  if (typeof JSAV === "undefined") {
    return;
  }
  var Edge = JSAV._types.ds.Edge;
  JSAV.ext.ds.fa = function (options) {
    var opts = $.extend(true, {visible: true, autoresize: true}, options);
    return new FiniteAutomaton(this, opts);
  };


  var FiniteAutomaton = function (jsav, options) {
    this.init(jsav, options);
  };
  JSAV.utils.extend(FiniteAutomaton, JSAV._types.ds.Graph);
  var faproto = FiniteAutomaton.prototype;

  faproto.init = function (jsav, options) {
    this._nodes = [];
    this._edges = [];
    this._alledges = null;
    this.alphabet = {};
    this.jsav = jsav;
    this.stateCount = 0;
    this.initial;
    this.options = $.extend({visible: true, nodegap: 40, autoresize: true, width: 400, height: 200,
                              directed: true, center: true, arcoffset: 50, emptystring: "\&lambda;"}, options);
    //this.options = $.extend({directed: true}, options);
    var el = this.options.element || $("<div/>");
    el.addClass("jsavgraph jsavfiniteautomaton");
    for (var key in this.options) {
      var val = this.options[key];
      if (this.options.hasOwnProperty(key) && typeof(val) === "string" || typeof(val) === "number" || typeof(val) === "boolean") {
        el.attr("data-" + key, val);
      }
    }
    if (!this.options.element) {
      $(jsav.canvas).append(el);
    }
    this.element = el;
    el.attr({"id": this.id()}).width(this.options.width).height(this.options.height);
    if (this.options.autoresize) {
      el.addClass("jsavautoresize");
    }
    if (this.options.center) {
      el.addClass("jsavcenter");
    }
    this.constructors = $.extend({
      Graph: FiniteAutomaton,
      Node: faState,
      Edge: faTransition
    }, this.options.constructors);
    //this.initialState = this.newNode('q0');
    
    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options); 
  };

  //var events = ["click", "dblclick", "mousedown", "mousemove", "mouseup", "mouseenter", "mouseleave"]; //contextmenu?
  JSAV.utils._events._addEventSupport(faproto);

  faproto.addNode = function(options) {
    var value;
    if (!options || !options.value) {
      value = "q" + this._nodes.length;
    }
    else{
      value = options.value;
    }
    return this.newNode(value, options);
  };


  faproto.removeNode = function(node, options) {
    var nodeIndex = this._nodes.indexOf(node);
    if (nodeIndex === -1) { return; } // no such node

    // remove all edges connected to this node
    var allEdges = this.edges();
    for (var i = allEdges.length; i--; ) {
      var edge = allEdges[i];
      if (edge.start().id() === node.id() || edge.end().id() === node.id()) {
        this.removeEdge(edge, options);
      }
    }

    // update the adjacency lists
    var firstAdjs = this._edges.slice(0, nodeIndex),
        newAdjs = firstAdjs.concat(this._edges.slice(nodeIndex + 1));
    this._setadjs(newAdjs, options);

    // create a new array of nodes without the removed node
    var firstNodes = this._nodes.slice(0, nodeIndex),
        newNodes = firstNodes.concat(this._nodes.slice(nodeIndex + 1));
    // set the nodes (makes the operation animated)
    this._setnodes(newNodes, options);

    // finally hide the node
    if (node._stateLabel) { node._stateLabel.hide(options);}
    node.hide(options);
    this.updateNodes();
    // return this for chaining
    return this;
  };

  faproto.newNode = function(value, options) {
    var newNode = new this.constructors.Node(this, value, options), // create new node
        newNodes = this._nodes.slice(0);
        newNodes.push(newNode); // add new node to clone of node array
    // set the nodes (makes the operation animatable
    this._setnodes(newNodes, options);

    var newAdjs = this._edges.slice(0);
    newAdjs.push([]);
    this._setadjs(newAdjs, options);

    return newNode;
  }; 

  faproto.addEdge = function(fromNode, toNode, options) {
    if (options.weight === "") {
      options.weight = this.options.emptystring;
    }
    if (this.hasEdge(fromNode, toNode)) { 
      var prevEdge = this.getEdge(fromNode, toNode);
      var prevWeight = prevEdge.weight();
      if (prevWeight === options.weight) { return; }

        prevEdge.weight(prevWeight + ',' + options.weight);
        return prevEdge;
    }
    var opts = $.extend({}, this.options, options);
    if (opts.directed && !opts["arrow-end"]) {
      opts["arrow-end"] = "classic-wide-long";
    }

    // get indices of the nodes
    var fromIndex = this._nodes.indexOf(fromNode),
        toIndex = this._nodes.indexOf(toNode);
    if (fromIndex === -1 || toIndex === -1) { return; } // no such nodes

    // create new edge
    var edge = new faTransition(this.jsav, fromNode, toNode, opts),
        adjlist = this._edges[fromIndex].slice(0);
    // add new edge to adjlist
    adjlist.push(edge);
    // set the adjlist (makes the operation animated)
    this._setadjlist(adjlist, fromIndex, opts);

    if (this.hasEdge(toNode, fromNode) && !toNode.equals(fromNode)) {
      var prevEdge = this.getEdge(toNode, fromNode);
      prevEdge.dfaArc(true);
      edge.dfaArc(true);
      prevEdge.layout();
      edge.layout();
    }
    return edge;
  };
  faproto.removeEdge = function(fNode, tNode, options) {
    var edge,
        fromNode,
        toNode,
        opts;
    // first argument is an edge object
    if (fNode.constructor === JSAV._types.ds.faTransition) {
      edge = fNode;
      fromNode = edge.start();
      toNode = edge.end();
      opts = tNode;
    } else { // if not edge, assume two nodes
      fromNode = fNode;
      toNode = tNode;
      edge = this.getEdge(fromNode, toNode);
      opts = options;
    }
    if (!edge) { return; } // no such edge

    var fromIndex = this._nodes.indexOf(fromNode),
        toIndex = this._nodes.indexOf(toNode),
        adjlist = this._edges[fromIndex],
        edgeIndex = adjlist.indexOf(edge),
        newAdjlist = adjlist.slice(0, edgeIndex).concat(adjlist.slice(edgeIndex + 1));
    this._setadjlist(newAdjlist, fromIndex, options);
    // we "remove" the edge by hiding it
      
    if (edge.dfaArc()) {
      var oppEdge = this.getEdge(toNode, fromNode);
      oppEdge.dfaArc(false);
      oppEdge.layout();
    }
    edge.hide();
  };

  faproto.makeInitial = function(node, options) {
    node.addClass("start");   //change this later
    this.initial = node;
    node.initialState(true);     //
  };

  faproto.updateAlphabet = function () {
    var alphabet = {};
    var edges = this.edges();
    var w;
    for (var next = edges.next(); next; next = edges.next()) {
      w = next.weight();
      w = w.split(',');
      for (var i = 0; i < w.length; i++) {
        if (w[i] !== this.options.emptystring) {
          if (!(w[i] in alphabet)) {
            alphabet[w[i]] = 0;
          }
          alphabet[w[i]]++;
        }
      }
    }
    this.alphabet = alphabet;
    return alphabet;
  };

  faproto.updateNodes = function() {
    for (var i = 0; i < this._nodes.length; i++) {
      this._nodes[i].value('q'+i);
    }
  }
  faproto.getNodeWithValue = function(value) {
    var nodes = this.nodes();
    for (var next = nodes.next(); next; next = nodes.next()) {
      if (next.value() === value) {
        return next;
      }
    }
  };

  faproto.transitionFunction = function(nodeFrom, letter, options) {
    //returns an array of values
    var edges = nodeFrom.getOutgoing(),
        ret = [];
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (edge.weight().split(',').indexOf(letter) !== -1) {
        ret.push(edge.end().value());
      }
    }
    return ret;
  };

  faproto.traverse = function (state, letter, options) {
    var successors = state.neighbors(),
        traversed = [];
    for (var next = successors.next(); next; next = successors.next()) {
      var weight = this.getEdge(currentState, next).weight().split(',');
      for (var i = 0; i < weight.length; i++) {
        if (letter == weight[i]) {
          traversed.push(next);
        }
      }
    } 
    if (traversed.length > 0) {
      return JSAV.utils.iterable(traversed);
    } else { return null };
  };

  faproto.layout = function(options) {
    var layoutAlg = this.options.layout || "_default";
    var ret = this.jsav.ds.layout.graph[layoutAlg](this, options);
    var nodes = this.nodes();
    for (var next = nodes.next(); next; next = nodes.next()) {
      next.stateLabelPositionUpdate();
    }
    return ret;
  };



  var faTransition = function (jsav, start, end, options) {
    //edge
    this.options = $.extend({arc: false}, options);
    this.jsav = jsav;
    this.startnode = start;
    this.endnode = end;
    this.options = $.extend(true, {"display": true}, options);
    this.container = start.container;
    var startPos = start?start.element.position():{left:0, top:0},
        endPos = end?end.element.position():{left:0, top:0};
    if (startPos.left === endPos.left && startPos.top === endPos.top) {
      // layout not done yet
      this.g = this.jsav.g.path("M-1 -1L-1 -1", $.extend({container: this.container}, this.options));
    } else {
        if (end) {
          endPos.left += end.element.outerWidth() / 2;
          endPos.top += end.element.outerHeight();
        }
        if (!startPos.left && !startPos.top) {
          startPos = endPos;
        }
        this.g = this.jsav.g.path("M" + startPos.left + " " + startPos.top + "L" + endPos.left + " " + endPos.top, 
                                  $.extend({container: this.container}, this.options));
    }

    this.element = $(this.g.rObj.node);

    var visible = (typeof this.options.display === "boolean" && this.options.display === true);
    this.g.rObj.attr({"opacity": 0});
    this.element.addClass("jsavedge jsavfatransition");
    if (start) {
      this.element[0].setAttribute("data-startnode", this.startnode.id());
    }
    if (end) {
      this.element[0].setAttribute("data-endnode", this.endnode.id());
    }
    this.element[0].setAttribute("data-container", this.container.id());
    this.element.data("edge", this);

    if (typeof this.options.weight !== "undefined") {
      this._weight = this.options.weight;
      this.label(this._weight);
    }
    if (visible) {
      this.g.show();
    }
  };
  JSAV.utils.extend(faTransition, JSAV._types.ds.Edge);

  var fatransitionproto = faTransition.prototype;
  fatransitionproto.weight = function(newWeight) {
    if (typeof newWeight === "undefined") {
      return this._weight;
    } else if (newWeight === "") {
      newWeight = this.container.options.emptystring;
    } 
    this._setweight(newWeight);
    this.label(newWeight);
  };

  fatransitionproto.layout = function(options) {
    var controlPointX, controlPointY, midX, midY,
        sElem = this.start().element,
        eElem = this.end().element,
        start = (options && options.start)?options.start:this.start().position(),
        end = (options && options.end)?options.end:this.end().position(),
        sWidth = sElem.outerWidth()/2.0,
        sHeight = sElem.outerHeight()/2.0,
        eWidth = eElem.outerWidth()/2.0,
        eHeight = eElem.outerHeight()/2.0,
        fromX = (options && options.fromPoint)?options.fromPoint[0]:Math.round(start.left + sWidth),
        fromY = (options && options.fromPoint)?options.fromPoint[1]:Math.round(start.top + sHeight),
        toX = Math.round(end.left + eWidth),
        toY = Math.round(end.top + eHeight),
        fromAngle = normalizeAngle(2*Math.PI - Math.atan2(toY - fromY, toX - fromX)),
        toAngle = normalizeAngle(2*Math.PI - Math.atan2(fromY - toY, fromX - toX)),
        startRadius = parseInt(sElem.css("borderBottomRightRadius"), 10) || 0,
        ADJUSTMENT_MAGIC = 2.2, // magic number to work with "all" stroke widths
        strokeWidth = parseInt(this.g.element.css("stroke-width"), 10),
        // adjustment for the arrow drawn before the end of the edge line
        startStrokeAdjust = this.options["arrow-begin"]? strokeWidth * ADJUSTMENT_MAGIC:0,
        fromPoint = (options && options.fromPoint)?options.fromPoint:
                                    getNodeBorderAtAngle({width: sWidth + startStrokeAdjust,
                                                          height: sHeight + startStrokeAdjust,
                                                          x: fromX, y: fromY}, {x: toX, y: toY}, fromAngle, startRadius),
        // arbitrarily choose to use bottom-right border radius
        endRadius = parseInt(eElem.css("borderBottomRightRadius"), 10) || 0,
        // adjustment for the arrow drawn after the end of the edge line
        endStrokeAdjust = this.options["arrow-end"]?strokeWidth * ADJUSTMENT_MAGIC:0,
        toPoint = getNodeBorderAtAngle({width: eWidth + endStrokeAdjust, height: eHeight + endStrokeAdjust, x: toX, y: toY},
                                        {x: fromX, y: fromY}, toAngle, endRadius);
    // getNodeBorderAtAngle returns an array [x, y], and movePoints wants the point position
    // in the (poly)line as first item in the array, so we'll create arrays like [0, x, y] and
    // [1, x, y]
    //======================================================== sung-hoon
      
    if (this.start().equals(this.end())) {
      var adjust = Math.sqrt(2) / 2.0;
      fromY = Math.round(fromY - adjust * sHeight);
      fromX = Math.round(fromX - adjust * sWidth);
      var loopR = Math.round(0.8 * sWidth);
      this.g.path("M" + fromX + ',' + fromY + ' a' + loopR + ',' + loopR + ' -45 1,1 ' 
                  + (Math.round(2 * sWidth * adjust) + 2) + ',' + 0, options);
      //this.g.element.css("z-index", -1);
    }
    else if (this.options.arc) { //arc (quadratic bezier curve)
      var midX = ((fromPoint[0] + toPoint[0]) / 2.0),
          midY = ((fromPoint[1] + toPoint[1]) / 2.0),
          vectorX = fromPoint[1] - toPoint[1],
          vectorY = toPoint[0] - fromPoint[0],
          scaling = this.options.arcoffset / Math.sqrt(Math.pow(vectorX, 2) + Math.pow(vectorY, 2)),
          controlPointX = midX + scaling * vectorX,
          controlPointY = midY + scaling * vectorY;
      this.g.path('M '+ fromPoint[0] + ',' + fromPoint[1] + ' Q' + controlPointX + ',' 
            + controlPointY + ' ' + toPoint[0] + ',' + toPoint[1], options);
    } else {  //line (same as .movePoints)
        this.g.path(("M" + fromPoint[0] + " " + fromPoint[1] + "L" + toPoint[0] + " " + toPoint[1]), options);
    }
      

    if ($.isFunction(this._labelPositionUpdate)) {
      var bbtop = Math.min(fromPoint[1], toPoint[1]),
          bbleft = Math.min(fromPoint[0], toPoint[0]),
          bbwidth = Math.abs(fromPoint[0] - toPoint[0]),
          bbheight = Math.abs(fromPoint[1] - toPoint[1]);
      if (this.options.arc) {
        bbtop = bbtop + (this.options.arcoffset / 2.0) * (controlPointY - midY) / Math.abs(controlPointY - midY);
        bbleft = bbleft + (this.options.arcoffset / 2.0) * (controlPointX - midX) / Math.abs(controlPointX - midX);
      } 
      else if (this.start().equals(this.end())) {
        bbtop = Math.round(start.top - 1.2 * sHeight);
        bbleft = Math.round(start.left);
        bbwidth = Math.round(2 * sWidth);
        bbheight = Math.round(0.5 * sHeight);
      }
      var bbox = {top: bbtop, left: bbleft, width: bbwidth, height: bbheight};
      this._labelPositionUpdate($.extend({bbox: bbox}, options));
    }

    if (this.start().value() === "jsavnull" || this.end().value() === "jsavnull") {
      this.addClass("jsavedge", options).addClass("jsavnulledge", options);
    } 
    else {
      this.addClass("jsavedge", options).removeClass("jsavnulledge");
    }
  };
  function normalizeAngle(angle) {
    var pi = Math.PI;
    while (angle < 0) {
      angle += 2 * pi;
    }
    while (angle >= 2 * pi) {
      angle -= 2 * pi;
    }
    return angle;
  }

  // calculate the intersection of line from pointa to pointb and circle with the given center and radius
  function lineIntersectCircle(pointa, pointb, center, radius) {
    var result = {};
    var a = (pointb.x - pointa.x) * (pointb.x - pointa.x) + (pointb.y - pointa.y) * (pointb.y - pointa.y);
    var b = 2 * ((pointb.x - pointa.x) * (pointa.x - center.x) +(pointb.y - pointa.y) * (pointa.y - center.y));
    var cc = center.x * center.x + center.y * center.y + pointa.x * pointa.x + pointa.y * pointa.y -
                2 * (center.x * pointa.x + center.y * pointa.y) - radius * radius;
    var deter = b * b - 4 * a * cc;
    function interpolate(p1, p2, d) {
      return {x: p1.x+(p2.x-p1.x)*d, y:p1.y+(p2.y-p1.y)*d};
    }
    if (deter <= 0 ) {
      result.inside = false;
    } else {
      var e = Math.sqrt (deter);
      var u1 = ( - b + e ) / (2 * a );
      var u2 = ( - b - e ) / (2 * a );
      if ((u1 < 0 || u1 > 1) && (u2 < 0 || u2 > 1)) {
        if ((u1 < 0 && u2 < 0) || (u1 > 1 && u2 > 1)) {
          result.inside = false;
        } else {
          result.inside = true;
        }
      } else {
        if (0 <= u2 && u2 <= 1) {
          result.enter=interpolate (pointa, pointb, u2);
        }
        if (0 <= u1 && u1 <= 1) {
          result.exit=interpolate (pointa, pointb, u1);
        }
        result.intersects = true;
      }
    }
    return result;
  }

  function getNodeBorderAtAngle(dim, targetNodeCenter, angle, radius) {
    // dim: x, y coords of center and *half* of width and height
    // make sure they have non-zero values
    dim.width = Math.max(dim.width, 1);
    dim.height = Math.max(dim.height, 1);
    var x, y, pi = Math.PI,
        urCornerA = Math.atan2(dim.height*2.0, dim.width*2.0),
        ulCornerA = pi - urCornerA,
        lrCornerA = 2*pi - urCornerA,
        llCornerA = urCornerA + pi,
        intersect, topAngle, bottomAngle, leftAngle, rightAngle;
    // set the radius to be at most half the width or height of the element
    radius = Math.min(radius, dim.width, dim.height);
    // on the higher level, divide area (2pi) to four seqments based on which way the edge will be drawn:
    //  - right side (angle < 45deg or angle > 315deg)
    //  - top (45deg < angle < 135deg) or (pi/4 < angle < (3/4)*pi)
    //  - left side (135deg < angle < 225deg)
    //  - bottom (225deg < angle < 315deg)
    // Each of these areas will then be divided to three sections:
    //  - middle section, where the node border is a line
    //  - two sections where the node border is part of the rounded corner circle
    if (angle < urCornerA || angle > lrCornerA) { // on right side
      topAngle = Math.atan2(dim.height - radius, dim.width);
      bottomAngle = 2*pi - topAngle;
      // default to the right border line
      x = dim.x + dim.width;
      y = dim.y - dim.width * Math.tan(angle);

      // handle the rounded corners if necessary
      if (radius > 0 && angle > topAngle && angle < bottomAngle) { // the rounded corners
        // calculate intersection of the line between node centers and the rounded corner circle
        if (angle < bottomAngle && angle > pi) { // bottom right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter,
                                      {x: dim.x + dim.width - radius, y: dim.y + dim.height - radius}, radius);
        } else { // top right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter,
                                      {x: dim.x + dim.width - radius, y: dim.y - dim.height + radius}, radius);
        }
      }
    } else if (angle > ulCornerA && angle < llCornerA) { // left
      topAngle = pi - Math.atan2(dim.height - radius, dim.width);
      bottomAngle = 2*pi - topAngle;

      // default to the left border line
      x = dim.x - dim.width;
      y = dim.y + dim.width*Math.tan(angle);

      // handle the rounded corners
      if (radius > 0 && (angle < topAngle || angle > bottomAngle)) {
        if (topAngle > angle) { // top left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y - dim.height + radius}, radius); // circle
        } else { // bottom left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y + dim.height - radius}, radius); // circle
        }
      }
    } else if (angle <= ulCornerA) { // top
      rightAngle = Math.atan2(dim.height, dim.width - radius);
      leftAngle = pi - rightAngle;

      // default to the top border line
      y = dim.y - dim.height;
      x = dim.x + (dim.height)/Math.tan(angle);

      // handle the rounded corners
      if (radius > 0 && (angle > leftAngle || angle < rightAngle)) {
        if (angle > leftAngle) { // top left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y - dim.height + radius}, radius); // circle
        } else { // top right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x + dim.width - radius, y: dim.y - dim.height + radius}, radius); // circle
        }
      }
    } else { // on bottom side
      leftAngle = pi + Math.atan2(dim.height, dim.width-radius);
      rightAngle = 2*pi - Math.atan2(dim.height, dim.width-radius);

      // default to the bottom border line
      y = dim.y + dim.height;
      x = dim.x - (dim.height)/Math.tan(angle);
      if (radius > 0 && (angle < leftAngle || angle > rightAngle)) {
        if (angle > rightAngle) { // bottom right
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x + dim.width - radius, y: dim.y + dim.height - radius}, radius); // circle
        } else { // bottom left
          intersect = lineIntersectCircle({x: dim.x, y: dim.y}, targetNodeCenter, // line
                          {x: dim.x - dim.width + radius, y: dim.y + dim.height - radius}, radius); // circle
        }
      }
    }
    // if on a corner and we found an intersection, set that as the edge coordinates
    if (intersect && intersect.exit) {
      x = intersect.exit.x;
      y = intersect.exit.y;
    }
    return [Math.round(x), Math.round(y)];
  }





  fatransitionproto.dfaArc = function(newBool) {
    if (typeof newBool === "undefined") {
      return this.options.arc;
    } 
    else if (typeof newBool === 'boolean') {
      this.options.arc = newBool;
    }
  };


  var faState = function (container, value, options) {
    this.init(container, value, options);
  };
  JSAV.utils.extend(faState, JSAV._types.ds.GraphNode);

  var fastateproto = faState.prototype;

  fastateproto.init = function (container, value, options) {
    this.jsav = container.jsav;
    this.container = container;
    this.isInitial = false;
    this.isFinal = false;
    this.options = $.extend(true, {visible: true, left: 0, top: 0}, options);
    this.constructors = $.extend({}, container.constructors, this.options.constructors);
    var el = this.options.nodeelement || $("<div><span class='jsavvalue'>" + this._valstring(value) + "</span></div>"),
      valtype = typeof(value);
    if (valtype === "object") { valtype = "string"; }
    this.element = el;
    el.addClass("jsavnode jsavgraphnode jsavfastate")
        .attr({"data-value": value, "id": this.id(), "data-value-type": valtype })
        .data("node", this);
    if (this.options.autoResize) {
      el.addClass("jsavautoresize");
    }
    this.container.element.append(el);

    JSAV.utils._helpers.handlePosition(this);
    JSAV.utils._helpers.handleVisibility(this, this.options);
  };

  //not used:
  fastateproto.initialState = function(newBool) {
    if (typeof newBool === "undefined") {
      return this.isInitial;
    } 
    else if (typeof newBool === 'boolean') {
      this.isInitial = newBool;
    }
  };
  fastateproto.finalState = function(newBool) {
    if (typeof newBool === "undefined") {
      return this.isFinal;
    } 
    else if (typeof newBool === 'boolean') {
      this.isFinal = newBool;
    }
  };

  fastateproto.getOutgoing = function() {
    var edges = this.container._edges[this.container._nodes.indexOf(this)];
    return edges; //should probably change this to return an iterable object
  };

  fastateproto.stateLabel = function(newLabel, options) {
    if (typeof newLabel === "undefined") {
      if (this._stateLabel && this._stateLabel.element.filter(":visible").size() > 0) {
        return this._stateLabel.text();
      } else {
        return undefined;
      }
    } else {
      if (!this._stateLabel) {
        this._stateLabel = this.jsav.label(newLabel, {container: this.container.element});
        this._stateLabel.element.addClass("jsavstatelabel");
      } else {
        this._stateLabel.text(newLabel, options);
      }
    }
  };

  fastateproto.stateLabelPositionUpdate = function(options) {   //make this run whenever nodes are moved
    if(!this._stateLabel) { return; }
    var bbox = this.position(),
        lbbox = this._stateLabel.bounds(),
        nWidth = this.element.outerWidth(),
        nHeight = this.element.outerHeight(),
        newTop = bbox.top + nHeight,
        newLeft = bbox.left;
    if (newTop !== lbbox.top || newLeft || lbbox.left) {
      this._stateLabel.css({top: newTop, left: newLeft, width: nWidth}, options);
    }
  };


  
  var dstypes = JSAV._types.ds;
  dstypes.FiniteAutomaton = FiniteAutomaton;
  dstypes.faState = faState;
  dstypes.faTransition = faTransition;

}(jQuery));
/**
* Version support
* Depends on core.js
*/
(function() {
  if (typeof JSAV === "undefined") { return; }
  var theVERSION = "v1.0.1-6-gea2e525";

  JSAV.version = function() {
    return theVERSION;
  };
})();
