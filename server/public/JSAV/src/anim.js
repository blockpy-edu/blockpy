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