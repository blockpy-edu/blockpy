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