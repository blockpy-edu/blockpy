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