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
