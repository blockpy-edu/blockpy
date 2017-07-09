// Do not include this module directly as has dependencies 
var $builtinmodule = function(name) {
  var mod, pictureWrapper, DrawUtils, Pixel, Color;

  mod = {};

  // Get a reference to the dependencies 
  // TODO Find a better way to do this?
  Pixel = Sk.sysmodules.mp$subscript('image.pixel').$d.Pixel;
  Color = Sk.sysmodules.mp$subscript('image.color').$d;

  DrawUtils = {
    drawEllipticalArc : function(ctx, x, y, w, h, startAngle, endAngle, reversed, fill) {
      var ratio, xr, cx, cy;

      ratio = h / w;
      xr = w / 2;
      cx = x + xr;
      cy = (y + h / 2) / ratio;

      ctx.save();
      ctx.scale(1, ratio);
      ctx.beginPath();
      if (fill) { ctx.moveTo(cx, cy); }
      ctx.arc(cx, cy, xr, startAngle, endAngle, reversed);
      if (fill) { ctx.moveTo(cx, cy); }
      ctx.restore();

      if (fill){ ctx.fill(); } else { ctx.stroke(); }
    },

    degToRad : function(degrees) {
      return degrees * Math.PI / 180;
    },

    drawEllipse : function(ctx, x, y, w, h, fill) {
      var ratio = h / w;
      var xr = w / 2;
      var yr = h / 2;

      ctx.save();
      ctx.scale(1, h / w);
      ctx.beginPath();
      ctx.arc(x + xr, (y + yr) / ratio, xr, 0, 2 * Math.PI);
      ctx.restore();

      if (fill) { ctx.fill(); } else { ctx.stroke(); }
    },

    styleFromColor : function(color) {
      return 'rgb(' + color._red + ',' + color._green + ',' + color._blue + ')';
    },

    /**
     * Creates a canvas, copies the specified picture onto it, then invokes the
     * callback so that additional drawing can be performed on the context. Once
     * the callback is complete, the canvas contents are copied back into the
     * original picture.
     *
     * @param picture
     * @param callback
     */
    drawInto : function(picture, callback) {
      var canvas, ctx;

      canvas = document.createElement('canvas');
      canvas.width = picture._width;
      canvas.height = picture._height;
      ctx = canvas.getContext('2d');
      ctx.putImageData(picture._imageData, 0, 0);
      
      callback(ctx, canvas);

      picture._imageData = ctx.getImageData(0, 0, picture._width, picture._height);
    },

    /**
     * Returns an object with width and height properties that describe the
     * pixel dimensions of a string of text.
     *
     * @param text the string to measure
     * @param font the CSS 'font' style for the text
     */
    measureText : function(text, font) {
      var div, size;

      div = $('<div>').text(text).css({
        position: 'absolute',
        'top': '-1000px',
        left: '-1000px',
        font: font
      });

      $('body').append(div);
      
      size = { width: div.width(), height: div.height() };

      div.remove();

      return size;
    },
  };

  pictureWrapper = {
    show : new Sk.builtin.func(function (self) {
      var canvas, ctx;

      Sk.ffi.checkArgs('show', arguments, 1);

      canvas = document.createElement('canvas');
      canvas.width = self._width;
      canvas.height = self._height;

      ctx = canvas.getContext('2d');
      ctx.putImageData(self._imageData, 0, 0);

      window.pythy.pictureTool.show(canvas);
    }),

    repaint : new Sk.builtin.func(function (self) {
      var canvas, ctx;

      Sk.ffi.checkArgs('repaint', arguments, 1);

      canvas = document.createElement('canvas');
      canvas.width = self._width;
      canvas.height = self._height;

      ctx = canvas.getContext('2d');
      ctx.putImageData(self._imageData, 0, 0);

      window.pythy.pictureTool.show(canvas);
    }),

    addArc : new Sk.builtin.func(function(self, x, y, width, height,
          startAngle, arcAngle, color) {
      Sk.ffi.checkArgs('addArc', arguments, [7, 8]);

      DrawUtils.drawInto(self, function(ctx) {
        var startRads, angleRads, endRads, reversed;

        ctx.lineWidth = 1;
        ctx.strokeStyle = DrawUtils.styleFromColor(color || Color.black);

        startRads = -DrawUtils.degToRad(Sk.ffi.unwrapo(startAngle));
        angleRads = DrawUtils.degToRad(Sk.ffi.unwrapo(arcAngle));
        endRads = startRads - angleRads;
        reversed = (angleRads >= 0);

        DrawUtils.drawEllipticalArc(ctx, Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y),
            Sk.ffi.unwrapo(width), Sk.ffi.unwrapo(height), startRads, endRads,
            reversed, false);
      });
    }),

    addArcFilled : new Sk.builtin.func(function(self, x, y, width, height,
          startAngle, arcAngle, color) {
      Sk.ffi.checkArgs('addArcFilled', arguments, [7, 8]);

      DrawUtils.drawInto(self, function(ctx) {
        var startRads, angleRads, endRads, reversed;

        ctx.lineWidth = 1;
        ctx.fillStyle = DrawUtils.styleFromColor(color || Color.black);

        startRads = -DrawUtils.degToRad(Sk.ffi.unwrapo(startAngle));
        angleRads = DrawUtils.degToRad(Sk.ffi.unwrapo(arcAngle));
        endRads = startRads - angleRads;
        reversed = (angleRads >= 0);

        DrawUtils.drawEllipticalArc(ctx, Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y),
            Sk.ffi.unwrapo(width), Sk.ffi.unwrapo(height), startRads, endRads,
            reversed, true);
      });
    }),

    addLine : new Sk.builtin.func(function(self, x1, y1, x2, y2, color) {
      Sk.ffi.checkArgs('addLine', arguments, [5, 6]);

      DrawUtils.drawInto(self, function(ctx) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = DrawUtils.styleFromColor(color || Color.black);

        ctx.beginPath();
        ctx.moveTo(Sk.ffi.unwrapo(x1), Sk.ffi.unwrapo(y1));
        ctx.lineTo(Sk.ffi.unwrapo(x2), Sk.ffi.unwrapo(y2));
        ctx.stroke();
      });
    }),

    addOval : new Sk.builtin.func(function(self, x, y, width, height, color) {
      Sk.ffi.checkArgs('addOval', arguments, [5, 6]);

      DrawUtils.drawInto(self, function(ctx) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = DrawUtils.styleFromColor(color || Color.black);
        DrawUtils.drawEllipse(ctx, Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y),
            Sk.ffi.unwrapo(width), Sk.ffi.unwrapo(height), false);
      });
    }),

    addOvalFilled : new Sk.builtin.func(function(self, x, y, width, height, color) {
      Sk.ffi.checkArgs('addOvalFilled', arguments, [5, 6]);

      DrawUtils.drawInto(self, function(ctx) {
        ctx.lineWidth = 1;
        ctx.fillStyle = DrawUtils.styleFromColor(color || Color.black);
        DrawUtils.drawEllipse(ctx, Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y),
            Sk.ffi.unwrapo(width), Sk.ffi.unwrapo(height), true);
      });
    }),

    addRect : new Sk.builtin.func(function(self, x, y, width, height, color) {
      Sk.ffi.checkArgs('addRect', arguments, [5, 6]);

      DrawUtils.drawInto(self, function(ctx) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = DrawUtils.styleFromColor(color || Color.black);
        ctx.strokeRect(Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y),
            Sk.ffi.unwrapo(width), Sk.ffi.unwrapo(height));
      });
    }),

    addRectFilled : new Sk.builtin.func(function(self, x, y, width, height, color) {
      Sk.ffi.checkArgs('addRectFilled', arguments, [5, 6]);

      DrawUtils.drawInto(self, function(ctx) {
        ctx.lineWidth = 1;
        ctx.fillStyle = DrawUtils.styleFromColor(color || Color.black);
        ctx.fillRect(Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y),
            Sk.ffi.unwrapo(width), Sk.ffi.unwrapo(height));
      });
    }),

    addText : new Sk.builtin.func(function(self, x, y, string, color) {
      Sk.ffi.checkArgs('addText', arguments, [4, 5]);

      DrawUtils.drawInto(self, function(ctx) {
        var height, text;

        text = Sk.ffi.unwrapo(string);
        ctx.fillStyle = DrawUtils.styleFromColor(color || Color.black);
        height = DrawUtils.measureText(text, ctx.font).height;
        ctx.fillText(text, Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y) + height);
      });
    }),

    addTextWithStyle : new Sk.builtin.func(function(self, x, y, text, style, color) {
      Sk.ffi.checkArgs('addTextWithStyle', arguments, [5, 6]);

      DrawUtils.drawInto(self, function(ctx) {
        var height;

        text = Sk.ffi.unwrapo(text);
        ctx.fillStyle = DrawUtils.styleFromColor(color || Color.black);
        ctx.font = Sk.misceval.callsim(style._toJSString, style);
        height = DrawUtils.measureText(text, ctx.font).height;
        ctx.fillText(text, Sk.ffi.unwrapo(x), Sk.ffi.unwrapo(y) + height);
      });
    }),

    getHeight : new Sk.builtin.func(function (self) {
      Sk.ffi.checkArgs('getHeight', arguments, 1);
      return new Sk.builtin.int_(self._height);
    }),

    getWidth : new Sk.builtin.func(function (self) {
      Sk.ffi.checkArgs('getWidth', arguments, 1);
      return new Sk.builtin.int_(self._width);
    }),

    getPixel : new Sk.builtin.func(function (picture, x, y) {
      Sk.ffi.checkArgs('getPixel', arguments, 3);
      return Sk.misceval.callsim(Pixel, picture, x, y);
    }),

    getPixelAt : new Sk.builtin.func(function (picture, x, y) {
      Sk.ffi.checkArgs('getPixelAt', arguments, 3);
      return Sk.misceval.callsim(Pixel, picture, x, y);
    }),

    getPixels : new Sk.builtin.func(function (picture) {
      var pixels;

      Sk.ffi.checkArgs('getPixels', arguments, 1);

      pixels = [];
      for(var r = 0; r < picture._height; r++) {
        for(var c = 0; c < picture._width; c++) {
          pixels.push(Sk.misceval.callsim(Pixel, picture, c, r));
        }
      }

      return new Sk.builtin.list(pixels);
    }),

    getAllPixels : new Sk.builtin.func(function (picture) {
      var pixels;

      Sk.ffi.checkArgs('getAllPixels', arguments, 1);

      pixels = [];
      for(var r = 0; r < picture._height; r++) {
        for(var c = 0; c < picture._width; c++) {
          pixels.push(Sk.misceval.callsim(Pixel, picture, c, r));
        }
      }

      return new Sk.builtin.list(pixels);
    }),

    copyInto: new Sk.builtin.func(function (smallPic, bigPic, startX, startY) {
      Sk.ffi.checkArgs('copyInto', arguments, 4);

      DrawUtils.drawInto(bigPic, function (ctx) {
        ctx.putImageData(smallPic._imageData, Sk.ffi.unwrapo(startX), Sk.ffi.unwrapo(startY));
      });
    }),

    setAllPixelsToAColor: new Sk.builtin.func(function (picture, color) {
      Sk.ffi.checkArgs('setAllPixelsToAColor', arguments, 2);

      DrawUtils.drawInto(picture, function (ctx) {
        ctx.fillStyle = DrawUtils.styleFromColor(color);
        ctx.fillRect(0, 0, picture._width, picture._height);
      });
    })
  };

  mod.Picture = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function (self, imageUrl) {
      var url, res, origUrl;

      Sk.ffi.checkArgs('__init__', arguments, 2);

      origUrl = window.mediaffi.customizeMediaURL(Sk.ffi.unwrapo(imageUrl));

      url = Sk.transformUrl(origUrl);

      res = Sk.future(function (continueWith) {
        $('<img>').load(function() {
          var canvas, ctx;

          self._url = origUrl;
          self._width = this.width;
          self._height = this.height;

          canvas = document.createElement('canvas');
          canvas.width = self._width;
          canvas.height = self._height;
          ctx = canvas.getContext('2d');
          ctx.drawImage(this, 0, 0);

          self._ctx = ctx;
          self._imageData = ctx.getImageData(0, 0, self._width, self._height);
          continueWith(null);
        }).error(function() {
          continueWith(new Sk.builtin.ValueError('The picture could not be ' +
                'loaded. Is the URL incorrect?'));
        }).attr('src', url);
      });
      if (res) { throw res; };
    });

    $loc.__str__ = new Sk.builtin.func(function(self) {
      Sk.ffi.checkArgs('__str__', arguments, 1);
      return new Sk.builtin.str('Picture'   +
                                ', url '    + self._url +
                                ', height ' + self._height +
                                ', width '  + self._width);
    });

    $loc.duplicate = new Sk.builtin.func(function (picture) {
      var newPic;

      Sk.ffi.checkArgs('duplicate', arguments, 1);

      newPic = Sk.misceval.callsim(mod.EmptyPicture, picture._width, picture._height);
      Sk.misceval.callsim(mod.copyInto, picture, newPic, 0, 0);
      return newPic;
    });

    goog.object.extend($loc, pictureWrapper);

  }, 'Picture', []);

  mod.EmptyPicture = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function (self, width, height) {
      var canvas, ctx;

      Sk.ffi.checkArgs('__init__', arguments, 3);

      self._width = Sk.builtin.asnum$(width);
      self._height = Sk.builtin.asnum$(height);
      canvas = document.createElement("canvas");
      ctx = canvas.getContext('2d');
      canvas.height = self.height;
      canvas.width = self.width;
      self._imageData = ctx.getImageData(0, 0, self._width, self._height);
    });

    $loc.__str__ = new Sk.builtin.func(function(self) {
      Sk.ffi.checkArgs('__str__', arguments, 1);
      return new Sk.builtin.str('Picture'   +
                                ', height ' + self._height +
                                ', width '  + self._width);
    });
  }, 'EmptyPicture', [mod.Picture]);

  goog.object.extend(mod, pictureWrapper);

  goog.object.extend(mod, {
    makePicture : new Sk.builtin.func(function (imageUrl) {
      Sk.ffi.checkArgs('makePicture', arguments, 1);
      return Sk.misceval.callsim(mod.Picture, imageUrl);
    }),

    makeEmptyPicture : new Sk.builtin.func(function(width, height, color) {
      var picture;

      Sk.ffi.checkArgs('makeEmptyPicture', arguments, [2, 3]);
      color = color || Color.white
      picture = Sk.misceval.callsim(mod.EmptyPicture, width, height);

      DrawUtils.drawInto(picture, function (ctx) {
        ctx.fillStyle = DrawUtils.styleFromColor(color);
        ctx.fillRect(0, 0, picture._width, picture._height);
      });

      return picture;
    }),

    duplicatePicture: new Sk.builtin.func(function (picture) {
      var newPic;

      Sk.ffi.checkArgs('duplicatePicture', arguments, 1);
      newPic = Sk.misceval.callsim(mod.EmptyPicture, picture._width, picture._height);
      Sk.misceval.callsim(mod.copyInto, picture, newPic, 0, 0);
      return newPic;
    })
  });

  return mod;
};
