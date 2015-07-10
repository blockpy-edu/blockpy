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