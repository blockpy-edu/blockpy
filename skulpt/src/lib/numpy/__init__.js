/**
	Made by Michael Ebert for https://github.com/skulpt/skulpt
	ndarray implementation inspired by https://github.com/geometryzen/davinci-dev (not compatible with skulpt)

	Some methods are based on the original numpy implementation.

	See http://waywaaard.github.io/skulpt/ for more information.
**/
var numpy = function () {
  if (typeof mathjs == 'function') {
    // load mathjs instance
    this.math = mathjs;
  } else {
    Sk.debugout("mathjs not included and callable");
  }
};

numpy.prototype.wrapasfloats = function (values) {
  var i;
  for (i = 0; i < values.length; i++) {
    values[i] = new Sk.builtin.nmber(values[i], Sk.builtin.nmber.float$);
  }

  return values;
};

numpy.prototype.arange = function (start, stop, step) {
  if (step === undefined)
    step = 1.0;

  start *= 1.0;
  stop *= 1.0;
  step *= 1.0;

  var res = [];
  for (var i = start; i < stop; i += step) {
    res.push(i);
  }

  return res;
};

var $builtinmodule = function (name) {
  var np = new numpy();

  var mod = {};

  /**
		Class for numpy.ndarray
	**/
  var CLASS_NDARRAY = "numpy.ndarray";

  function remapToJs_shallow(obj, shallow) {
    var _shallow = shallow || true;
    if (obj instanceof Sk.builtin.list) {
      if (!_shallow) {
        var ret = [];
        for (var i = 0; i < obj.v.length; ++i) {
          ret.push(Sk.ffi.remapToJs(obj.v[i]));
        }
        return ret;
      } else {
        return obj.v;
      }
    } else if (obj instanceof Sk.builtin.float_) {
      return Sk.builtin.asnum$nofloat(obj);
    } else {
      return Sk.ffi.remapToJs(obj);
    }
  }

  /**
		Unpacks in any form fo nested Lists
	**/
  function unpack(py_obj, buffer, state) {
    if (py_obj instanceof Sk.builtin.list || py_obj instanceof Sk.builtin.tuple) {
      var py_items = remapToJs_shallow(py_obj);
      state.level += 1;

      if (state.level > state.shape.length) {
        state.shape.push(py_items.length);
      }
      var i;
      var len = py_items.length;
      for (i = 0; i < len; i++) {
        unpack(py_items[i], buffer, state);
      }
      state.level -= 1;
    } else {
      buffer.push(py_obj);
    }
  }

  /**
   Computes the strides for columns and rows
  **/
  function computeStrides(shape) {
    var strides = shape.slice(0);
    strides.reverse();
    var prod = 1;
    var temp;
    for (var i = 0, len = strides.length; i < len; i++) {
      temp = strides[i];
      strides[i] = prod;
      prod *= temp;
    }

    return strides.reverse();
  }

  /**
    Computes the offset for the ndarray for given index and strides
    [1, ..., n]
  **/
  function computeOffset(strides, index) {
    var offset = 0;
    for (var k = 0, len = strides.length; k < len; k++) {
      offset += strides[k] * index[k];
    }
    return offset;
  }

  /**
    Calculates the size of the ndarray, dummy
	**/
  function prod(numbers) {
    var size = 1;
    var i;
    for (i = 0; i < numbers.length; i++) {
      size *= numbers[i];
    }
    return size;
  }

  /**
		Creates a string representation for given buffer and shape
		buffer is an ndarray
	**/
  function stringify(buffer, shape, dtype) {
    var emits = shape.map(function (x) {
      return 0;
    });
    var uBound = shape.length - 1;
    var idxLevel = 0;
    var str = "[";
    var i = 0;
    while (idxLevel !== -1) {
      if (emits[idxLevel] < shape[idxLevel]) {
        if (emits[idxLevel] !== 0) {
          str += ", ";
        }

        if (idxLevel < uBound) {
          str += "[";
          idxLevel += 1;
        } else {
          if (dtype === Sk.builtin.float_)
            str += Sk.ffi.remapToJs(Sk.builtin.str(new Sk.builtin.float_(buffer[
              i++])));
          else
            str += Sk.ffi.remapToJs(Sk.builtin.str(buffer[i++]));
          emits[idxLevel] += 1;
        }
      } else {
        emits[idxLevel] = 0;
        str += "]";
        idxLevel -= 1;
        if (idxLevel >= 0) {
          emits[idxLevel] += 1;
        }
      }
    }
    return str;
  }

  /*
    http://docs.scipy.org/doc/numpy/reference/generated/numpy.ndarray.tolist.html?highlight=tolist#numpy.ndarray.tolist
  */
  function tolistrecursive(buffer, shape, strides, startdim, dtype) {
    var i, n, stride;
    var arr, item;

    /* Base case */
    if (startdim >= shape.length) {
      if (dtype && dtype === Sk.builtin.float_) {
        return new Sk.builtin.float_(buffer[0]); // handle float special case
      } else {
        return Sk.ffi.remapToPy(buffer[0]);
      }
    }

    n = shape[startdim];
    stride = strides[startdim];

    arr = [];

    for (i = 0; i < n; i++) {
      item = tolistrecursive(buffer, shape, strides, startdim + 1, dtype);
      arr.push(item);

      buffer = buffer.slice(stride);
    }

    return new Sk.builtin.list(arr);
  }

  /**
	 internal tolist interface
	**/
  function tolist(buffer, shape, strides, dtype) {
    var buffer_copy = buffer.slice(0);
    return tolistrecursive(buffer_copy, shape, strides, 0, dtype);
  }

  /**
    Updates all attributes of the numpy.ndarray
  **/
  function updateAttributes(self, ndarrayJs) {
    Sk.abstr.sattr(self, 'ndmin', new Sk.builtin.int_(ndarrayJs.shape.length));
    Sk.abstr.sattr(self, 'dtype', ndarrayJs.dtype);
    Sk.abstr.sattr(self, 'shape', new Sk.builtin.tuple(ndarrayJs.shape.map(
      function (x) {
        return new Sk.builtin.int_(x);
      })));
    Sk.abstr.sattr(self, 'strides', new Sk.builtin.tuple(ndarrayJs.strides.map(
      function (x) {
        return new Sk.builtin.int_(x);
      })));
    Sk.abstr.sattr(self, 'size', new Sk.builtin.int_(prod(ndarrayJs.shape)));
    Sk.abstr.sattr(self, 'data', new Sk.ffi.remapToPy(ndarrayJs.buffer));
  }

  /**
    An array object represents a multidimensional, homogeneous array of fixed-size items.
    An associated data-type object describes the format of each element in the array
    (its byte-order, how many bytes it occupies in memory, whether it is an integer, a
    floating point number, or something else, etc.)

    Arrays should be constructed using array, zeros or empty (refer to the See Also
    section below). The parameters given here refer to a low-level method (ndarray(...)) for
    instantiating an array.

    For more information, refer to the numpy module and examine the the methods and
    attributes of an array.
  **/
  var ndarray_f = function ($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function (self, shape, dtype, buffer,
      offset, strides, order) {
      var ndarrayJs = {}; // js object holding the actual array
      ndarrayJs.shape = Sk.ffi.remapToJs(shape);

      ndarrayJs.strides = computeStrides(ndarrayJs.shape);
      ndarrayJs.dtype = dtype || Sk.builtin.none.none$;

      if (buffer && buffer instanceof Sk.builtin.list) {
        ndarrayJs.buffer = Sk.ffi.remapToJs(buffer);
      }

      self.v = ndarrayJs; // value holding the actual js object and array
      self.tp$name = CLASS_NDARRAY; // set class name

      updateAttributes(self, ndarrayJs);
    });

    $loc.tp$getattr = Sk.builtin.object.prototype.GenericGetAttr;

    // ToDo: setAttribute should be implemented, change of shape causes resize
    // ndmin cannot be set, etc...
    $loc.tp$setattr = Sk.builtin.object.prototype.GenericSetAttr;

    /*
      Return the array as a (possibly nested) list.

      Return a copy of the array data as a (nested) Python list. Data items are
      converted to the nearest compatible Python type.
    */
    $loc.tolist = new Sk.builtin.func(function (self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var list = tolist(ndarrayJs.buffer, ndarrayJs.shape, ndarrayJs.strides,
        ndarrayJs.dtype);

      return list;
    });

    $loc.reshape = new Sk.builtin.func(function (self, shape, order) {
      Sk.builtin.pyCheckArgs("reshape", arguments, 2, 3);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, ndarrayJs.dtype,
        new Sk.builtin.list(ndarrayJs.buffer));
    });

    $loc.copy = new Sk.builtin.func(function (self, order) {
      Sk.builtin.pyCheckArgs("copy", arguments, 1, 2);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var buffer = ndarrayJs.buffer.map(function (x) {
        return x;
      });
      var shape = new Sk.builtin.tuplePy(ndarrayJs.shape.map(function (x) {
        return new Sk.builtin.int_(x);
      }));
      return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, ndarrayJs.dtype,
        new Sk.builtin.list(buffer));
    });

    /**
      Fill the array with a scalar value.
      Parameters: value: scalar
                    All elements of a will be assigned this value
    **/
    $loc.fill = new Sk.builtin.func(function (self, value) {
      Sk.builtin.pyCheckArgs("fill", arguments, 2, 2);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var buffer = ndarrayJs.buffer.map(function (x) {
        return x;
      });
      var i;
      for (i = 0; i < ndarrayJs.buffer.length; i++) {
        if (ndarrayJs.dtype) {
          ndarrayJs.buffer[i] = Sk.misceval.callsim(ndarrayJs.dtype,
            value);
        }
      }
    });

    $loc.__getitem__ = new Sk.builtin.func(function (self, index) {
      Sk.builtin.pyCheckArgs("[]", arguments, 2, 2);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var _index; // current index
      var _buffer; // buffer as python type
      var buffer_internal; // buffer als js array
      var _stride; // stride
      var _shape; // shape as js
      var i;

      // single index e.g. [3]
      if (Sk.builtin.checkInt(index)) {
        var offset = Sk.ffi.remapToJs(index);

        if (ndarrayJs.shape.length > 1) {
          _stride = ndarrayJs.strides[0];
          buffer_internal = [];
          _index = 0;

          for (i = offset * _stride, ubound = (offset + 1) * _stride; i <
            ubound; i++) {
            buffer_internal[_index++] = ndarrayJs.buffer[i];
          }

          _buffer = new Sk.builtin.list(buffer_internal);
          _shape = new Sk.builtin.tuple(Array.prototype.slice.call(
              ndarrayJs.shape,
              1)
            .map(function (x) {
              return new Sk.builtin.int_(x);
            }));
          return Sk.misceval.callsim(mod[CLASS_NDARRAY], _shape,
            undefined,
            _buffer);
        } else {
          if (offset >= 0 && offset < ndarrayJs.buffer.length) {
            return ndarrayJs.buffer[offset];
          } else {
            throw new Sk.builtin.IndexError("array index out of range");
          }
        }
      } else if (index instanceof Sk.builtin.tuple) {
        // index like [1,3]
        var keyJs = Sk.ffi.remapToJs(index);
        return ndarrayJs.buffer[computeOffset(ndarrayJs.strides, keyJs)];
      } else if (index instanceof Sk.builtin.slice) {
        // support for slices e.g. [1:4]
        var indices = index.indices();
        var start = typeof indices[0] !== 'undefined' ? indices[0] : 0;
        var stop = typeof indices[1] !== 'undefined' ? indices[1] :
          ndarrayJs
          .buffer.length;
        stop = stop > ndarrayJs.buffer.length ? ndarrayJs.buffer.length :
          stop;
        var step = typeof indices[2] !== 'undefined' ? indices[2] : 1;
        buffer_internal = [];
        _index = 0;
        if (step > 0) {
          for (i = start; i < stop; i += step) {
            buffer_internal[_index++] = ndarrayJs.buffer[i];
          }
        }
        _buffer = new Sk.builtin.list(buffer_internal);
        _shape = new Sk.builtin.tuple([buffer_internal.length].map(
          function (
            x) {
            return new Sk.builtin.int_(x);
          }));
        return Sk.misceval.callsim(mod[CLASS_NDARRAY], _shape, undefined,
          _buffer);
      } else {
        throw new Sk.builtin.ValueError('Index "' + index +
          '" must be int, slice or tuple');
      }
    });

    $loc.__setitem__ = new Sk.builtin.func(function (self, index, value) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      Sk.builtin.pyCheckArgs("[]", arguments, 3, 3);
      if (index instanceof Sk.builtin.int_) {
        var _offset = Sk.ffi.remapToJs(index);
        if (ndarrayJs.shape.length > 1) {
          var _value = Sk.ffi.remapToJs(value);
          var _stride = ndarrayJs.strides[0];
          var _index = 0;

          var _ubound = (_offset + 1) * _stride;
          var i;
          for (i = _offset * _stride; i < _ubound; i++) {
            ndarrayJs.buffer[i] = _value.buffer[_index++];
          }
        } else {
          if (_offset >= 0 && _offset < ndarrayJs.buffer.length) {
            ndarrayJs.buffer[_offset] = value;
          } else {
            throw new Sk.builtin.IndexError("array index out of range");
          }
        }
      } else if (index instanceof Sk.builtin.tuple) {
        _key = Sk.ffi.remapToJs(index);
        ndarrayJs.buffer[computeOffset(ndarrayJs.strides, _key)] = value;
      } else {
        throw new Sk.builtin.TypeError(
          'argument "index" must be int or tuple');
      }
    });

    $loc.__len__ = new Sk.builtin.func(function (self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      return new Sk.builtin.int_(ndarrayJs.shape[0]);
    });

    $loc.__iter__ = new Sk.builtin.func(function (self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var ret = {
        tp$iter: function () {
          return ret;
        },
        $obj: ndarrayJs,
        $index: 0,
        tp$iternext: function () {
          if (ret.$index >= ret.$obj.buffer.length) return undefined;
          return ret.$obj.buffer[ret.$index++];
        }
      };
      return ret;
    });

    $loc.__str__ = new Sk.builtin.func(function (self) {
      var ndarrayJs = remapToJs_shallow(self, false);
      return new Sk.builtin.str(stringify(ndarrayJs.buffer,
        ndarrayJs.shape, ndarrayJs.dtype));
    });

    $loc.__repr__ = new Sk.builtin.func(function (self) {
      var ndarrayJs = Sk.ffi.remapToJs(self);
      return new Sk.builtin.str("array(" + stringify(ndarrayJs.buffer,
        ndarrayJs.shape, ndarrayJs.dtype) + ")");
    });

    /**
      Creates left hand side operations for given binary operator
    **/
    function makeNumericBinaryOpLhs(operation) {
      return function (self, other) {
        var lhs;
        var rhs;
        var buffer; // external
        var _buffer; // internal use
        var shape; // new shape of returned ndarray
        var i;


        var ndarrayJs = Sk.ffi.remapToJs(self);

        if (Sk.abstr.typeName(other) === CLASS_NDARRAY) {
          lhs = ndarrayJs.buffer;
          rhs = Sk.ffi.remapToJs(other)
            .buffer;
          _buffer = [];
          for (i = 0, len = lhs.length; i < len; i++) {
            //_buffer[i] = operation(lhs[i], rhs[i]);
            _buffer[i] = Sk.abstr.binary_op_(lhs[i], rhs[i], operation);
          }
        } else {
          lhs = ndarrayJs.buffer;
          _buffer = [];
          for (i = 0, len = lhs.length; i < len; i++) {
            _buffer[i] = Sk.abstr.numberBinOp(lhs[i], other, operation);
          }
        }

        // create return ndarray
        shape = new Sk.builtin.tuple(ndarrayJs.shape.map(function (x) {
          return new Sk.builtin.int_(x);
        }));
        buffer = new Sk.builtin.list(_buffer);
        return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, undefined,
          buffer);
      };
    }

    function makeNumericBinaryOpRhs(operation) {
      return function (self, other) {
        var ndarrayJs = Sk.ffi.remapToJs(self);
        var rhsBuffer = ndarrayJs.buffer;
        var _buffer = [];
        for (var i = 0, len = rhsBuffer.length; i < len; i++) {
          _buffer[i] = Sk.abstr.numberBinOp(other, rhsBuffer[i], operation);
        }
        var shape = new Sk.builtin.tuple(ndarrayJs.shape.map(function (x) {
          return new Sk.builtin.int_(x);
        }));
        buffer = new Sk.builtin.list(_buffer);
        return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, undefined, buffer);
      };
    }

    /*
      Applies given operation on each element of the ndarray.
    */
    function makeUnaryOp(operation) {
      return function (self) {
        var ndarrayJs = Sk.ffi.remapToJs(self);
        var _buffer = ndarrayJs.buffer.map(function (value) {
          return Sk.abstr.numberUnaryOp(Sk.ffi.remapToPy(value), operation);
        });
        var shape = new Sk.builtin.tuple(ndarrayJs.shape.map(function (x) {
          return new Sk.builtin.int_(x);
        }));
        buffer = new Sk.builtin.list(_buffer);
        return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, undefined, buffer);
      };
    }

    $loc.__add__ = new Sk.builtin.func(makeNumericBinaryOpLhs("Add"));
    $loc.__radd__ = new Sk.builtin.func(makeNumericBinaryOpRhs("Add"));

    $loc.__sub__ = new Sk.builtin.func(makeNumericBinaryOpLhs("Sub"));
    $loc.__rsub__ = new Sk.builtin.func(makeNumericBinaryOpRhs("Sub"));

    $loc.__mul__ = new Sk.builtin.func(makeNumericBinaryOpLhs("Mult"));
    $loc.__rmul__ = new Sk.builtin.func(makeNumericBinaryOpRhs("Mult"));

    $loc.__div__ = new Sk.builtin.func(makeNumericBinaryOpLhs("Div"));
    $loc.__rdiv__ = new Sk.builtin.func(makeNumericBinaryOpRhs("Div"));

    $loc.__mod__ = new Sk.builtin.func(makeNumericBinaryOpLhs("Mod"));
    $loc.__rmod__ = new Sk.builtin.func(makeNumericBinaryOpRhs("Mod"));

    $loc.__xor__ = new Sk.builtin.func(makeNumericBinaryOpLhs("BitXor"));
    $loc.__rxor__ = new Sk.builtin.func(makeNumericBinaryOpRhs("BitXor"));

    $loc.__lshift__ = new Sk.builtin.func(makeNumericBinaryOpLhs("LShift"));
    $loc.__rlshift__ = new Sk.builtin.func(makeNumericBinaryOpRhs("LShift"));

    $loc.__rshift__ = new Sk.builtin.func(makeNumericBinaryOpLhs("RShift"));
    $loc.__rrshift__ = new Sk.builtin.func(makeNumericBinaryOpRhs("RShift"));

    $loc.__pos__ = new Sk.builtin.func(makeUnaryOp("UAdd"));
    $loc.__neg__ = new Sk.builtin.func(makeUnaryOp("USub"));

    /**
     Simple pow implementation that faciliates the pow builtin
    **/
    $loc.__pow__ = new Sk.builtin.func(function (self, other) {
      Sk.builtin.pyCheckArgs("__pow__", arguments, 2, 2);
      var ndarrayJs = Sk.ffi.remapToJs(self);
      var _buffer = ndarrayJs.buffer.map(function (value) {
        return Sk.builtin.pow(Sk.ffi.remapToPy(value), other);
      });
      var shape = new Sk.builtin.tuple(ndarrayJs.shape.map(function (x) {
        return new Sk.builtin.int_(x);
      }));
      buffer = new Sk.builtin.list(_buffer);
      return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, undefined, buffer);
    });

    // end of ndarray_f
  };

  mod[CLASS_NDARRAY] = Sk.misceval.buildClass(mod, ndarray_f,
    CLASS_NDARRAY, []);

  /**
   Trigonometric functions, all element wise
  **/
  mod.pi = Sk.builtin.assk$(np.math ? np.math.PI : Math.PI, Sk.builtin.nmber.float$);
  mod.e = Sk.builtin.assk$(np.math ? np.math.E : Math.E, Sk.builtin.nmber.float$);
  /**
  Trigonometric sine, element-wise.
  **/

  function callTrigonometricFunc(x, op) {
    var res;
    var num;
    if (x instanceof Sk.builtin.list || x instanceof Sk.builtin.tuple) {
      x = Sk.misceval.callsim(mod.array, x);
    }

    if (Sk.abstr.typeName(x) === CLASS_NDARRAY) {
      var ndarrayJs = Sk.ffi.remapToJs(x);

      var _buffer = ndarrayJs.buffer.map(function (value) {
        num = Sk.builtin.asnum$(value);
        res = op.call(null, num);
        return new Sk.builtin.nmber(res, Sk.builtin.nmber
          .float$);
      });

      var shape = new Sk.builtin.tuple(ndarrayJs.shape.map(function (x) {
        return new Sk.builtin.int_(x);
      }));

      buffer = new Sk.builtin.list(_buffer);
      return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, undefined, buffer);
    } else if (Sk.builtin.checkNumber(x)) {
      num = Sk.builtin.asnum$(x);
      res = op.call(null, num);
      return new Sk.builtin.nmber(res, Sk.builtin.nmber
        .float$);
    }

    throw new Sk.builtin.TypeError('Unsupported argument type for "x"');
  }

  // Sine, element-wise.
  var sin_f = function (x, out) {
    Sk.builtin.pyCheckArgs("sin", arguments, 1, 2);
    return callTrigonometricFunc(x, np.math ? np.math.sin : Math.sin);
  };
  sin_f.co_varnames = ['x', 'out'];
  sin_f.$defaults = [0, new Sk.builtin.list([])];
  mod.sin = new Sk.builtin.func(sin_f);

  // Hyperbolic sine, element-wise.
  var sinh_f = function (x, out) {
    Sk.builtin.pyCheckArgs("sinh", arguments, 1, 2);
    if (!np.math) throw new Sk.builtin.OperationError("sinh requires mathjs");
    return callTrigonometricFunc(x, np.math.sinh);
  };
  sinh_f.co_varnames = ['x', 'out'];
  sinh_f.$defaults = [0, new Sk.builtin.list([])];
  mod.sinh = new Sk.builtin.func(sinh_f);

  // Inverse sine, element-wise.
  var arcsin_f = function (x, out) {
    Sk.builtin.pyCheckArgs("arcsin", arguments, 1, 2);
    return callTrigonometricFunc(x, np.math ? np.math.asin : Math.asin);
  };
  arcsin_f.co_varnames = ['x', 'out'];
  arcsin_f.$defaults = [0, new Sk.builtin.list([])];
  mod.arcsin = new Sk.builtin.func(arcsin_f);

  // Cosine, element-wise.
  var cos_f = function (x, out) {
    Sk.builtin.pyCheckArgs("cos", arguments, 1, 2);
    return callTrigonometricFunc(x, np.math ? np.math.cos : Math.cos);
  };
  cos_f.co_varnames = ['x', 'out'];
  cos_f.$defaults = [0, new Sk.builtin.list([])];
  mod.cos = new Sk.builtin.func(cos_f);

  // Hyperbolic cosine, element-wise.
  var cosh_f = function (x, out) {
    Sk.builtin.pyCheckArgs("cosh", arguments, 1, 2);
    if (!np.math) throw new Sk.builtin.OperationError("cosh requires mathjs");
    return callTrigonometricFunc(x, np.math.cosh);
  };
  cosh_f.co_varnames = ['x', 'out'];
  cosh_f.$defaults = [0, new Sk.builtin.list([])];
  mod.cosh = new Sk.builtin.func(cosh_f);

  // Inverse cosine, element-wise.
  var arccos_f = function (x, out) {
    Sk.builtin.pyCheckArgs("arccos", arguments, 1, 2);
    return callTrigonometricFunc(x, np.math ? np.math.acos : Math.acos);
  };
  arccos_f.co_varnames = ['x', 'out'];
  arccos_f.$defaults = [0, new Sk.builtin.list([])];
  mod.arccos = new Sk.builtin.func(arccos_f);

  // Inverse tangens, element-wise.
  var arctan_f = function (x, out) {
    Sk.builtin.pyCheckArgs("arctan", arguments, 1, 2);
    return callTrigonometricFunc(x, np.math ? np.math.atan : Math.atan);
  };
  arctan_f.co_varnames = ['x', 'out'];
  arctan_f.$defaults = [0, new Sk.builtin.list([])];
  mod.arctan = new Sk.builtin.func(arctan_f);

  // Tangens, element-wise.
  var tan_f = function (x, out) {
    Sk.builtin.pyCheckArgs("tan", arguments, 1, 2);
    return callTrigonometricFunc(x, np.math ? np.math.tan : Math.tan);
  };
  tan_f.co_varnames = ['x', 'out'];
  tan_f.$defaults = [0, new Sk.builtin.list([])];
  mod.tan = new Sk.builtin.func(tan_f);

  // Hyperbolic cosine, element-wise.
  var tanh_f = function (x, out) {
    Sk.builtin.pyCheckArgs("tanh", arguments, 1, 2);
    if (!np.math) throw new Sk.builtin.OperationError("tanh requires mathjs");
    return callTrigonometricFunc(x, np.math.tanh);
  };
  tanh_f.co_varnames = ['x', 'out'];
  tanh_f.$defaults = [0, new Sk.builtin.list([])];
  mod.tanh = new Sk.builtin.func(tanh_f);

  /* Simple reimplementation of the linspace function
   * http://docs.scipy.org/doc/numpy/reference/generated/numpy.linspace.html
   */
  var linspace_f = function (start, stop, num, endpoint, retstep) {
    Sk.builtin.pyCheckArgs("linspace", arguments, 3, 5);
    Sk.builtin.pyCheckType("start", "number", Sk.builtin.checkNumber(
      start));
    Sk.builtin.pyCheckType("stop", "number", Sk.builtin.checkNumber(
      stop));
    if (num === undefined) {
      num = 50;
    }
    var num_num = Sk.builtin.asnum$(num);
    var endpoint_bool;

    if (endpoint === undefined) {
      endpoint_bool = true;
    } else if (endpoint.constructor === Sk.builtin.bool) {
      endpoint_bool = endpoint.v;
    }

    var retstep_bool;
    if (retstep === undefined) {
      retstep_bool = false;
    } else if (retstep.constructor === Sk.builtin.bool) {
      retstep_bool = retstep.v;
    }

    var samples;
    var step;

    start_num = Sk.builtin.asnum$(start) * 1.0;
    stop_num = Sk.builtin.asnum$(stop) * 1.0;

    if (num_num <= 0) {
      samples = [];
    } else {

      var samples_array;
      if (endpoint_bool) {
        if (num_num == 1) {
          samples = [start_num];
        } else {
          step = (stop_num - start_num) / (num_num - 1);
          samples_array = np.arange(0, num_num);
          samples = samples_array.map(function (v) {
            return v * step + start_num;
          });
          samples[samples.length - 1] = stop_num;
        }
      } else {
        step = (stop_num - start_num) / num_num;
        samples_array = np.arange(0, num_num);
        samples = samples_array.map(function (v) {
          return v * step + start_num;
        });
      }
    }

    //return as ndarray! dtype:float
    var dtype = Sk.builtin.float_;
    for (i = 0; i < samples.length; i++) {
      samples[i] = Sk.misceval.callsim(dtype, samples[i]);
    }

    var buffer = Sk.builtin.list(samples);
    var shape = new Sk.builtin.tuple([samples.length]);
    var ndarray = Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, dtype,
      buffer);

    if (retstep_bool === true)
      return new Sk.builtin.tuple([ndarray, step]);
    else
      return ndarray;
  };

  // this should allow for named parameters
  linspace_f.co_varnames = ['start', 'stop', 'num', 'endpoint',
    'retstep'
  ];
  linspace_f.$defaults = [0, 0, 50, true, false];
  mod.linspace =
    new Sk.builtin.func(linspace_f);

  /* Simple reimplementation of the arange function
   * http://docs.scipy.org/doc/numpy/reference/generated/numpy.arange.html#numpy.arange
   */
  var arange_f = function (start, stop, step, dtype) {
    Sk.builtin.pyCheckArgs("arange", arguments, 1, 4);
    Sk.builtin.pyCheckType("start", "number", Sk.builtin.checkNumber(
      start));
    var start_num;
    var stop_num;
    var step_num;

    if (stop === undefined && step === undefined) {
      start_num = Sk.builtin.asnum$(0);
      stop_num = Sk.builtin.asnum$(start);
      step_num = Sk.builtin.asnum$(1);
    } else if (step === undefined) {
      start_num = Sk.builtin.asnum$(start);
      stop_num = Sk.builtin.asnum$(stop);
      step_num = Sk.builtin.asnum$(1);
    } else {
      start_num = Sk.builtin.asnum$(start);
      stop_num = Sk.builtin.asnum$(stop);
      step_num = Sk.builtin.asnum$(step);
    }

    // set to float
    if (!dtype || dtype == Sk.builtin.none.none$) {
      if (Sk.builtin.checkInt(start))
        dtype = Sk.builtin.int_;
      else
        dtype = Sk.builtin.float_;
    }

    // return ndarray
    var arange_buffer = np.arange(start_num, stop_num, step_num);
    // apply dtype casting function, if it has been provided
    if (dtype && Sk.builtin.checkClass(dtype)) {
      for (i = 0; i < arange_buffer.length; i++) {
        arange_buffer[i] = Sk.misceval.callsim(dtype, arange_buffer[i]);
      }
    }

    buffer = Sk.builtin.list(arange_buffer);
    var shape = new Sk.builtin.tuple([arange_buffer.length]);
    return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, dtype,
      buffer);
  };

  arange_f.co_varnames = ['start', 'stop', 'step', 'dtype'];
  arange_f
    .$defaults = [0, 1, 1, Sk.builtin.none.none$];
  mod.arange = new Sk.builtin
    .func(arange_f);

  /* implementation for numpy.array
	------------------------------------------------------------------------------------------------
		http://docs.scipy.org/doc/numpy/reference/generated/numpy.array.html#numpy.array

		object : array_like
		An array, any object exposing the array interface, an object whose __array__ method returns an array, or any (nested) sequence.

		dtype : data-type, optional
		The desired data-type for the array. If not given, then the type will be determined as the minimum type required to hold the objects in the sequence. This argument can only be used to ‘upcast’ the array. For downcasting, use the .astype(t) method.

		copy : bool, optional
		If true (default), then the object is copied. Otherwise, a copy will only be made if __array__ returns a copy, if obj is a nested sequence, or if a copy is needed to satisfy any of the other requirements (dtype, order, etc.).

		order : {‘C’, ‘F’, ‘A’}, optional
		Specify the order of the array. If order is ‘C’ (default), then the array will be in C-contiguous order (last-index varies the fastest). If order is ‘F’, then the returned array will be in Fortran-contiguous order (first-index varies the fastest). If order is ‘A’, then the returned array may be in any order (either C-, Fortran-contiguous, or even discontiguous).

		subok : bool, optional
		If True, then sub-classes will be passed-through, otherwise the returned array will be forced to be a base-class array (default).

		ndmin : int, optional
		Specifies the minimum number of dimensions that the resulting array should have. Ones will be pre-pended to the shape as needed to meet this requirement.

		Returns :
		out : ndarray
		An array object satisfying the specified requirements
	*/
  // https://github.com/geometryzen/davinci-dev/blob/master/src/stdlib/numpy.js
  // https://github.com/geometryzen/davinci-dev/blob/master/src/ffh.js
  // http://docs.scipy.org/doc/numpy/reference/arrays.html
  var array_f = function (object, dtype, copy, order, subok, ndmin) {
    Sk.builtin.pyCheckArgs("array", arguments, 1, 6);

    if (object === undefined)
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(object) +
        "' object is undefined");

    var elements = [];
    var state = {};
    state.level = 0;
    state.shape = [];

    unpack(object, elements, state);

    var i;
    // apply dtype casting function, if it has been provided
    if (dtype && Sk.builtin.checkClass(dtype)) {
      for (i = 0; i < elements.length; i++) {
        elements[i] = Sk.misceval.callsim(dtype, elements[i]);
      }
    } else {
      // check elements and find first usable type
      // should be refactored
      for (i = 0; i < elements.length; i++) {
        if (elements[i] && isNaN(elements[i])) {
          dtype = Sk.builtin.float_;
          break;
        } else if (typeof elements[i] == 'string') {
          dtype = Sk.builtin.str;
        } else {
          dtype = Sk.builtin.float_;
        }
      }
    }

    // check for ndmin param
    if (ndmin) {
      if (Sk.builtin.checkNumber(ndmin)) {
        var _ndmin = Sk.builtin.asnum$(ndmin);
        if (_ndmin >= 0 && _ndmin > state.shape.length) {
          var _ndmin_array = [];
          for (i = 0; i < _ndmin - state.shape.length; i++) {
            _ndmin_array.push(1);
          }
          state.shape = _ndmin_array.concat(state.shape);
        }
      } else {
        throw new Sk.builtin.TypeError(
          'Parameter "ndmin" must be of type "int"');
      }
    }

    var _shape = new Sk.builtin.tuple(state.shape.map(function (x) {
      return new Sk.builtin.int_(x);
    }));

    var _buffer = new Sk.builtin.list(elements);
    // create new ndarray instance
    return Sk.misceval.callsim(mod[CLASS_NDARRAY], _shape, dtype,
      _buffer);
  };

  array_f.co_varnames = ['object', 'dtype', 'copy', 'order',
    'subok', 'ndmin'
  ];
  array_f.$defaults = [null, Sk.builtin.none.none$, true, new Sk.builtin.str(
    'C'), false, new Sk.builtin.int_(0)];
  mod.array = new Sk.builtin.func(array_f);

  /**
    Return a new array of given shape and type, filled with zeros.
  **/
  var zeros_f = function (shape, dtype, order) {
    Sk.builtin.pyCheckArgs("zeros", arguments, 1, 3);
    Sk.builtin.pyCheckType("shape", "tuple", shape instanceof Sk.builtin.tuple);
    if (dtype instanceof Sk.builtin.list) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dtype) +
        "' is not supported for dtype.");
    }

    var _zero = new Sk.builtin.float_(0.0);

    return Sk.misceval.callsim(mod.full, shape, _zero, dtype, order);
  };
  zeros_f.co_varnames = ['shape', 'dtype', 'order'];
  zeros_f.$defaults = [
    new Sk.builtin.tuple([]), Sk.builtin.none.none$, new Sk.builtin.str('C')
  ];
  mod.zeros = new Sk.builtin.func(zeros_f);

  /**
    Return a new array of given shape and type, filled with `fill_value`.
  **/
  var full_f = function (shape, fill_value, dtype, order) {
    Sk.builtin.pyCheckArgs("full", arguments, 2, 4);
    Sk.builtin.pyCheckType("shape", "tuple", shape instanceof Sk.builtin.tuple);
    if (dtype instanceof Sk.builtin.list) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dtype) +
        "' is currently not supported for dtype.");
    }

    // generate an array of the dimensions for the generic array method
    var _shape = Sk.ffi.remapToJs(shape);
    var _size = prod(_shape);
    var _buffer = [];
    var _fill_value = fill_value;
    var i;

    for (i = 0; i < _size; i++) {
      _buffer[i] = _fill_value;
    }

    // if no dtype given and type of fill_value is numeric, assume float
    if (!dtype && Sk.builtin.checkNumber(fill_value)) {
      dtype = Sk.builtin.float_;
    }

    // apply dtype casting function, if it has been provided
    if (Sk.builtin.checkClass(dtype)) {
      for (i = 0; i < _buffer.length; i++) {
        _buffer[i] = Sk.misceval.callsim(dtype, _buffer[i]);
      }
    }

    return Sk.misceval.callsim(mod[CLASS_NDARRAY], shape, dtype, new Sk.builtin
      .list(
        _buffer));
  };
  full_f.co_varnames = ['shape', 'fill_value', 'dtype', 'order'];
  full_f.$defaults = [
    new Sk.builtin.tuple([]), Sk.builtin.none.none$, Sk.builtin.none.none$, new Sk
    .builtin
    .str('C')
  ];
  mod.full = new Sk.builtin.func(full_f);


  /**
    Return a new array of given shape and type, filled with ones.
  **/
  var ones_f = function (shape, dtype, order) {
    Sk.builtin.pyCheckArgs("ones", arguments, 1, 3);
    Sk.builtin.pyCheckType("shape", "tuple", shape instanceof Sk.builtin.tuple);
    if (dtype instanceof Sk.builtin.list) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(dtype) +
        "' is not supported for dtype.");
    }

    var _one = new Sk.builtin.float_(1.0);
    return Sk.misceval.callsim(mod.full, shape, _one, dtype, order);
  };
  ones_f.co_varnames = ['shape', 'dtype', 'order'];
  ones_f.$defaults = [
    new Sk.builtin.tuple([]), Sk.builtin.none.none$, new Sk.builtin.str('C')
  ];
  mod.ones = new Sk.builtin.func(ones_f);


  /**
    Dot product
  **/
  var dot_f = function (a, b) {
    Sk.builtin.pyCheckArgs("dot", arguments, 2, 2);

    // ToDo: add support for ndarray args

    if (!(a instanceof Sk.builtin.list) && !Sk.builtin.checkNumber(
      a) && (Sk.abstr.typeName(a) !== CLASS_NDARRAY)) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(a) +
        "' is not supported for a.");
    }

    if (!(b instanceof Sk.builtin.list) && !Sk.builtin.checkNumber(
      b) && (Sk.abstr.typeName(b) !== CLASS_NDARRAY)) {
      throw new Sk.builtin.TypeError("'" + Sk.abstr.typeName(b) +
        "' is not supported for b.");
    }

    var res;

    var b_matrix;
    var a_matrix;

    if (Sk.abstr.typeName(a) === CLASS_NDARRAY) {
      a_matrix = a.v.buffer;
			a_matrix = a_matrix.map(function (x) {
				return Sk.ffi.remapToJs(x);
			});
    } else {
      a_matrix = Sk.ffi.remapToJs(a);
    }

    if (Sk.abstr.typeName(b) === CLASS_NDARRAY) {
      b_matrix = b.v.buffer;
			b_matrix = b_matrix.map(function (x) {
				return Sk.ffi.remapToJs(x);
			});
    } else {
      b_matrix = Sk.ffi.remapToJs(b);
    }

    var a_size = np.math.size(a_matrix);
    var b_size = np.math.size(b_matrix);


    if (a_size.length >= 1 && b_size.length > 1) {
      if (a_size[a_size.length - 1] != b_size[b_size - 2]) {
        throw new Sk.builtin.ValueError(
          "The last dimension of a is not the same size as the second-to-last dimension of b."
        );
      }
    }

    res = np.math.multiply(a_matrix, b_matrix);
		
		if (!Array.isArray(res)) { // if result
			return Sk.ffi.remapToPy(res);
		}
		
    // return ndarray
    buffer = new Sk.builtin.list(res);
    return Sk.misceval.callsim(mod.array, buffer, Sk.builtin.float_);
  };
  dot_f.co_varnames = ['a', 'b'];
  dot_f.$defaults = [Sk.builtin.none.none$,
    Sk.builtin.none.none$
  ];
  mod.dot = new Sk.builtin.func(dot_f);

  /* not implemented methods */
  mod.ones_like = new Sk.builtin.func(function () {
    throw new Sk.builtin.NotImplementedError(
      "ones_like is not yet implemented");
  });
  mod.empty_like = new Sk.builtin.func(function () {
    throw new Sk.builtin.NotImplementedError(
      "empty_like is not yet implemented");
  });
  mod.ones_like = new Sk.builtin.func(function () {
    throw new Sk.builtin.NotImplementedError(
      "ones_like is not yet implemented");
  });
  mod.empty = new Sk.builtin.func(function () {
    throw new Sk.builtin.NotImplementedError(
      "empty is not yet implemented");
  });
  mod.arctan2 = new Sk.builtin.func(function () {
    throw new Sk.builtin.NotImplementedError(
      "arctan2 is not yet implemented");
  });
  mod.asarray = new Sk.builtin.func(array_f);
  return mod;
};
