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