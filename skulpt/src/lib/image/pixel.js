// Do not include this module directly as it has dependencies 
var $builtinmodule = function(name) {
  var mod, pixelWrapper, Color, colorMod;

  mod = {};
  colorMod = Sk.sysmodules.mp$subscript('image.color').$d;
  Color = colorMod.Color;

  pixelWrapper = {
    setColor : new Sk.builtin.func(function (self, color) {
      var data, index;

      Sk.ffi.checkArgs('setColor', arguments, 2);

      data = self._picture._imageData.data;

      index = self._y * 4 * self._picture._width  + self._x * 4;

      data[index] = color._red;
      data[index+1] = color._green;
      data[index+2] = color._blue;
      // Note: We have to set the alpha to 255 because the rgb values are
      // multiplied by the alpha before being set. So if alpha = 0, the rgb
      // values will become 0
      data[index+3] = 255;
    }),

    getColor : new Sk.builtin.func(function (self) {
      var red, green, blue;

      Sk.ffi.checkArgs('getColor', arguments, 1);

      red = Sk.misceval.callsim(self.getRed, self); 
      green = Sk.misceval.callsim(self.getGreen, self); 
      blue = Sk.misceval.callsim(self.getBlue, self);

      return Sk.misceval.callsim(Color, red, green, blue);
    }),

    getX : new Sk.builtin.func(function (self) {
      Sk.ffi.checkArgs('getX', arguments, 1);
      return new Sk.builtin.int_(self._x);
    }),

    getY : new Sk.builtin.func(function (self) {
      Sk.ffi.checkArgs('getY', arguments, 1);
      return new Sk.builtin.int_(self._y);
    }),

    getRed : new Sk.builtin.func(function (self) {
      var index;

      Sk.ffi.checkArgs('getRed', arguments, 1);

      index = (self._y * 4) * self._picture._width + (self._x * 4);

      return new Sk.builtin.int_(self._picture._imageData.data[index]);
    }),

    getGreen : new Sk.builtin.func(function (self) {
      var index;

      Sk.ffi.checkArgs('getGreen', arguments, 1);

      index = (self._y * 4) * self._picture._width + (self._x * 4);

      return new Sk.builtin.int_(self._picture._imageData.data[index + 1]);
    }),

    getBlue : new Sk.builtin.func(function (self) {
      var index;

      Sk.ffi.checkArgs('getBlue', arguments, 1);

      index = (self._y * 4) * self._picture._width + (self._x * 4);

      return new Sk.builtin.int_(self._picture._imageData.data[index + 2]);
    }),

    setRed : new Sk.builtin.func(function (self, red) {
      var index;

      Sk.ffi.checkArgs('setRed', arguments, 2);

      index = self._y * 4 * self._picture._width  + self._x * 4;

      self._picture._imageData.data[index] = colorMod._validateColor(Sk.ffi.unwrapo(red));
      // Note: We have to set the alpha to 255 because the rgb values are
      // multiplied by the alpha before being set. So if alpha = 0, the rgb
      // values will become 0
      self._picture._imageData.data[index + 3] = 255;
    }),

    setGreen : new Sk.builtin.func(function (self, green) {
      var index;

      Sk.ffi.checkArgs('setGreen', arguments, 2);

      index = self._y * 4 * self._picture._width  + self._x * 4;

      self._picture._imageData.data[index + 1] = colorMod._validateColor(Sk.ffi.unwrapo(green));
      // Note: We have to set the alpha to 255 because the rgb values are
      // multiplied by the alpha before being set. So if alpha = 0, the rgb
      // values will become 0
      self._picture._imageData.data[index + 3] = 255;
    }),

    setBlue : new Sk.builtin.func(function (self, blue) {
      var index;

      Sk.ffi.checkArgs('setBlue', arguments, 2);

      index = self._y * 4 * self._picture._width  + self._x * 4;

      self._picture._imageData.data[index + 2] = colorMod._validateColor(Sk.ffi.unwrapo(blue));
      // Note: We have to set the alpha to 255 because the rgb values are
      // multiplied by the alpha before being set. So if alpha = 0, the rgb
      // values will become 0
      self._picture._imageData.data[index + 3] = 255;
    })
  };

  mod.Pixel = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function(self, picture, x, y) {
      Sk.ffi.checkArgs('__init__', arguments, 4);

      self._x = Sk.builtin.asnum$(x);
      self._y = Sk.builtin.asnum$(y);
      self._picture = picture;
    });

    $loc.__str__ = new Sk.builtin.func(function(self) {
      var red, green, blue;

      Sk.ffi.checkArgs('__str__', arguments, 1);

      red = Sk.builtin.asnum$(Sk.misceval.callsim(self.getRed, self)); 
      green = Sk.builtin.asnum$(Sk.misceval.callsim(self.getGreen, self)); 
      blue = Sk.builtin.asnum$(Sk.misceval.callsim(self.getBlue, self));

      return new Sk.builtin.str('Pixel'  + 
                                ', red='   + red +
                                ', green=' + green +
                                ', blue='  + blue);
    });

    goog.object.extend($loc, pixelWrapper);
  }, 'Pixel', []);

  goog.object.extend(mod, pixelWrapper);

  return mod;
};
