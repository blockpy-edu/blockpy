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