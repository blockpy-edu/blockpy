var $builtinmodule = function(name) {
  var mod, colorWrapper, COLOR_FACTOR, noWrapColor, wrapColor;

  mod = {};

  COLOR_FACTOR = 0.70;

  noWrapColor = function (value) {
    var v;

    v = Sk.builtin.asnum$(value);
    if(v < 0) { v = 0; } else if (v > 255) { v = 255; } 
    return v;
  };

  wrapColor = function (value) {
    var v;

    v = (Sk.builtin.asnum$(value) % 256);
    if(value < 0) { v += 256; } 

    return v;
  };

  mod._validateColor = noWrapColor;

  mod._colorWrapAround = 0;

  colorWrapper = {
    makeDarker : new Sk.builtin.func(function(self) {
      Sk.ffi.checkArgs('makeDarker', arguments, 1);

      // This is from java.awt.Color
      return Sk.misceval.callsim(mod.Color, self._red * COLOR_FACTOR,
          self._green * COLOR_FACTOR, self._blue * COLOR_FACTOR);
    }),

    makeLighter : new Sk.builtin.func(function(self) {
      var r, g, b, factor;
      
      Sk.ffi.checkArgs('makeLighter', arguments, 1);

      r = self._red;
      g = self._green;
      b = self._blue;
      factor = 1.0 / (1.0 - COLOR_FACTOR);

      // This is from java.awt.Color
      if(r === 0 && b === 0 && g === 0) {
        return Sk.misceval.callsim(mod.Color, factor, factor, factor);
      }

      if(r > 0 && r < factor) { r = factor; }
      if(g > 0 && g < factor) { g = factor; }
      if(b > 0 && b < factor) { b = factor; }

      return Sk.misceval.callsim(mod.Color, r / COLOR_FACTOR, g / COLOR_FACTOR, b / COLOR_FACTOR);
    }),

    makeBrighter : new Sk.builtin.func(function(self) {
      var r, g, b, factor;
      
      Sk.ffi.checkArgs('makeBrighter', arguments, 1);

      r = self._red;
      g = self._green;
      b = self._blue;
      factor = 1.0 / (1.0 - COLOR_FACTOR);

      // This is from java.awt.Color
      if(r === 0 && b === 0 && g === 0) {
        return Sk.misceval.callsim(mod.Color, factor, factor, factor);
      }

      if(r > 0 && r < factor) { r = factor; }
      if(g > 0 && g < factor) { g = factor; }
      if(b > 0 && b < factor) { b = factor; }

      return Sk.misceval.callsim(mod.Color, r / COLOR_FACTOR, g / COLOR_FACTOR, b / COLOR_FACTOR);
    }),

    distance : new Sk.builtin.func(function(self, other) {
      Sk.ffi.checkArgs('distance', arguments, 2);

      return new Sk.builtin.float_(Math.sqrt(
        Math.pow(self._red - other._red, 2) +
        Math.pow(self._green - other._green, 2) +
        Math.pow(self._blue - other._blue, 2)));
    })
  };

  mod.Color = Sk.misceval.buildClass(mod, function ($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function(self, red, green, blue) {
      Sk.ffi.checkArgs('__init__', arguments, [2, 4]);

      if(red.tp$name === 'Color') {
        self._red = mod._validateColor(parseInt(Sk.builtin.asnum$(red._red)));
        self._green = mod._validateColor(parseInt(Sk.builtin.asnum$(red._green)));
        self._blue = mod._validateColor(parseInt(Sk.builtin.asnum$(red._blue)));
      } else {
        self._red = mod._validateColor(parseInt(Sk.builtin.asnum$(red))); 
        self._green = mod._validateColor(parseInt(Sk.builtin.asnum$(green)));
        self._green = self._green >= 0 ? self._green : self._red;
        self._blue = mod._validateColor(parseInt(Sk.builtin.asnum$(blue)));
        self._blue = self._blue >= 0 ? self._blue : self._red;
      }

    });

    $loc.__str__ = new Sk.builtin.func(function(self) {
      Sk.ffi.checkArgs('__str__', arguments, 1);
      return new Sk.builtin.str('Color' + 
                                ', r='  + self._red +
                                ', g='  + self._green +
                                ', b='  + self._blue);
    });

    goog.object.extend($loc, colorWrapper);
  }, 'Color', []); 

  goog.object.extend(mod, colorWrapper);

  goog.object.extend(mod, {
    makeColor : new Sk.builtin.func(function(red, green, blue) {
      Sk.ffi.checkArgs('makeColor', arguments, [1, 3]);
      return Sk.misceval.callsim(mod.Color, red, green, blue);
    }),

    pickAColor : new Sk.builtin.func(function() {
      Sk.ffi.checkArgs('pickAColor', arguments, 0);
      
      return Sk.future(function(continueWith) {
        window.pythy.colorPicker.show(function (r, g, b) {
          continueWith(Sk.misceval.callsim(mod.Color, r, g, b));
        });
      });
    }),

    setColorWrapAround: new Sk.builtin.func(function (flag) {
      Sk.ffi.checkArgs('setColorWrapAround', arguments, 1);

      mod._colorWrapAround = Sk.builtin.asnum$(flag);

      switch(mod._colorWrapAround) {
        case 0:
          mod._validateColor = noWrapColor;
          break;
        case 1:
          mod._validateColor = wrapColor;
          break;
        default:
          throw new Sk.builtin.TypeError('The flag must be a boolean value');
      }
    }),

    getColorWrapAround: new Sk.builtin.func(function () {
      Sk.ffi.checkArgs('getColorWrapAround', arguments, 0);
      return new Sk.builtin.bool(mod._colorWrapAround);
    }),

    black     : Sk.misceval.callsim(mod.Color, 0, 0, 0),
    blue      : Sk.misceval.callsim(mod.Color, 0, 0, 255),
    cyan      : Sk.misceval.callsim(mod.Color, 0, 255, 255),
    darkGray  : Sk.misceval.callsim(mod.Color, 64, 64, 64),
    gray      : Sk.misceval.callsim(mod.Color, 128, 128, 128),
    green     : Sk.misceval.callsim(mod.Color, 0, 255, 0),
    lightGray : Sk.misceval.callsim(mod.Color, 192, 192, 192),
    magenta   : Sk.misceval.callsim(mod.Color, 255, 0, 255),
    orange    : Sk.misceval.callsim(mod.Color, 255, 200, 0),
    pink      : Sk.misceval.callsim(mod.Color, 255, 175, 175),
    red       : Sk.misceval.callsim(mod.Color, 255, 0, 0),
    white     : Sk.misceval.callsim(mod.Color, 255, 255, 255),
    yellow    : Sk.misceval.callsim(mod.Color, 255, 255, 0)
  });

  return mod;
};
