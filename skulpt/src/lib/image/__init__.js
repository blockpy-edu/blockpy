var $builtinmodule = function(name) {
  var mod, Canvas2Image, importAllSubmodules, DrawUtils, mediaPath;

  mod = {};

  DrawUtils = {
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
  }

  // The Canvas2Image library is used to convert a canvas into an image that
  // can be saved to the media library. Credit for the original goes to
  // https://github.com/hongru/canvas2image.
  Canvas2Image = {
    $support : (function () {
      var canvas, ctx;

      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');

      return {
        canvas: !!ctx,
        imageData: !!ctx.getImageData,
        dataURL: !!canvas.toDataURL,
        btoa: !!window.btoa
      };
    }()),

    _scaleCanvas : function (canvas, width, height) {
      var w, h, retCanvas, retCtx;

      w = canvas.width;
      h = canvas.height;

      if (!width) { width = w; }
      if (!height) { height = h; }

      retCanvas = document.createElement('canvas');
      retCanvas.width = width;
      retCanvas.height = height;

      retCtx = retCanvas.getContext('2d');
      retCtx.drawImage(canvas, 0, 0, w, h, 0, 0, width, height);

      return retCanvas;
    },

    _getDataURL : function (canvas, type, width, height) {
      return this._scaleCanvas(canvas, width, height).toDataURL(type);
    },

    _fixType : function (type) {
      var r;

      type = type.toLowerCase().replace(/jpg/i, 'jpeg');
      r = type.match(/png|jpeg|bmp|gif/)[0];

      return 'image/' + r;
    },

    _encodeData : function (data) {
      var str;

      if (!window.btoa) { throw new Error('btoa undefined'); }

      str = '';

      if (typeof(data) === 'string') {
        str = data;
      } else {
        for (var i = 0; i < data.length; i++) {
          str += String.fromCharCode(data[i]);
        }
      }

      return btoa(str);
    },

    _getImageData : function (canvas) {
      return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    },

    _makeURI : function (strData, type) {
      return 'data:' + type + ';base64,' + strData;
    },

    _genBitmapImage : function (data) {
      var imgHeader, imgInfoHeader, width, height, fsize, _width, _height;
      var dataSize, padding, imgData, strPixelData, y, offsetX, offsetY, strPixelRow;

      imgHeader = [];
      imgInfoHeader = [];

      width = data.width;
      height = data.height;
      fsize = width * height * 3 + 54; // header size:54 bytes

      imgHeader.push(0x42); // 66 -> B
      imgHeader.push(0x4d); // 77 -> M
      imgHeader.push(fsize % 256); // r

      fsize = Math.floor(fsize / 256);
      imgHeader.push(fsize % 256); // g

      fsize = Math.floor(fsize / 256);
      imgHeader.push(fsize % 256); // b

      fsize = Math.floor(fsize / 256);
      imgHeader.push(fsize % 256); // a

      imgHeader.push(0);
      imgHeader.push(0);
      imgHeader.push(0);
      imgHeader.push(0);

      imgHeader.push(54); // offset -> 6
      imgHeader.push(0);
      imgHeader.push(0);
      imgHeader.push(0);

      // info header
      imgInfoHeader.push(40); // info header size
      imgInfoHeader.push(0);
      imgInfoHeader.push(0);
      imgInfoHeader.push(0);

      // width info
      _width = width;

      imgInfoHeader.push(_width % 256);
      _width = Math.floor(_width / 256);

      imgInfoHeader.push(_width % 256);
      _width = Math.floor(_width / 256);

      imgInfoHeader.push(_width % 256);
      _width = Math.floor(_width / 256);

      imgInfoHeader.push(_width % 256);

      // height info
      _height = height;

      imgInfoHeader.push(_height % 256);
      _height = Math.floor(_height / 256);

      imgInfoHeader.push(_height % 256);
      _height = Math.floor(_height / 256);

      imgInfoHeader.push(_height % 256);
      _height = Math.floor(_height / 256);

      imgInfoHeader.push(_height % 256);

      imgInfoHeader.push(1);
      imgInfoHeader.push(0);
      imgInfoHeader.push(24); // 24-bit bitmap
      imgInfoHeader.push(0);

      // no compression
      imgInfoHeader.push(0);
      imgInfoHeader.push(0);
      imgInfoHeader.push(0);
      imgInfoHeader.push(0);

      // pixel data
      dataSize = width * height * 3;

      imgInfoHeader.push(dataSize % 256);
      dataSize = Math.floor(dataSize / 256);

      imgInfoHeader.push(dataSize % 256);
      dataSize = Math.floor(dataSize / 256);

      imgInfoHeader.push(dataSize % 256);
      dataSize = Math.floor(dataSize / 256);

      imgInfoHeader.push(dataSize % 256);

      // blank space
      for (var i = 0; i < 16; i ++) { imgInfoHeader.push(0); }

      padding = (4 - ((width * 3) % 4)) % 4;
      imgData = data.data;
      strPixelData = '';
      y = height;

      do {
        offsetY = width * (y - 1) * 4;
        strPixelRow = '';
        for (var x = 0; x < width; x ++) {
          offsetX = 4 * x;
          strPixelRow += String.fromCharCode(imgData[offsetY + offsetX + 2]);
          strPixelRow += String.fromCharCode(imgData[offsetY + offsetX + 1]);
          strPixelRow += String.fromCharCode(imgData[offsetY + offsetX]);
        }
        for (var n = 0; n < padding; n ++) {
          strPixelRow += String.fromCharCode(0);
        }

        strPixelData += strPixelRow;
      } while(-- y);

      return (this._encodeData(imgHeader.concat(imgInfoHeader)) + this._encodeData(strPixelData));
    },

    convertToURI : function (canvas, width, height, type) {
      var data, strData;

      if (this.$support.canvas && this.$support.dataURL) {
        if (!type) { type = 'png'; }
        type = this._fixType(type);

        if (/bmp/.test(type)) {
          data = this._getImageData(this._scaleCanvas(canvas, width, height));
          strData = this._genBitmapImage(data);
          return _makeURI(strData, 'image/bmp');
        } else {
          strData = this._getDataURL(canvas, type, width, height);
          return strData;
        }
      } else {
        //TODO throw error
      }
    }
  };

  goog.object.extend(mod, {
    pickAFile : new Sk.builtin.func(function () {
      Sk.ffi.checkArgs('pickAFile', arguments, 0);

      return Sk.future(function (continueWith) {
        window.pythy.showMediaModal({
          mediaLinkClicked: function (link) {
            var clientHost, url;

            clientHost = window.location.protocol + '//' + window.location.host;
            url = $(link).attr('href');
            if(url[0] === '/') { url = clientHost + url; }

            $('#media_library_modal').modal('hide');

            continueWith(new Sk.builtin.str(url));
          },
          cancelled: function () {
            continueWith(null);
          }
        });
      });
    }),

    setMediaPath : new Sk.builtin.func(function (path) {
      Sk.ffi.checkArgs('setMediaPath', arguments, 1);
      mediaPath = Sk.ffi.unwrapo(path);
      if(mediaPath[mediaPath.length - 1] === '/') {
        mediaPath = mediaPath.substring(0, mediaPath.length - 1);
      }
    }),

    getMediaPath : new Sk.builtin.func(function (url) {
      Sk.ffi.checkArgs('getMediaPath', arguments, [0, 1]);

      if(url) {
        url = Sk.ffi.unwrapo(url);
      } else {
        url = '';
      }
      if(!mediaPath) {
        return new Sk.builtin.str(window.mediaffi.customizeMediaURL(url));
      } else {
        return new Sk.builtin.str(mediaPath + '/' + url);
      }
    }),

    writePictureTo : new Sk.builtin.func(function(picture, path) {
      var type;

      Sk.ffi.checkArgs('writePictureTo', arguments, 2);

      // Extract the file extension. It looks bizarre at first; source is
      // http://stackoverflow.com/a/12900504/307266.
      path = Sk.ffi.unwrapo(path);
      type = path.substr((Math.max(0, path.lastIndexOf(".")) || Infinity) + 1);

      result = Sk.future(function(continueWith) {
        DrawUtils.drawInto(picture, function(ctx, canvas) {
          var dataUrl;

          dataUrl = Canvas2Image.convertToURI(
              canvas, picture.width, picture.height, type);

          window.mediaffi.writePictureTo(dataUrl, path, continueWith);
        });
      });
      if(result && result.errors && result.errors.length) {
        throw new Sk.builtin.ValueError(result.errors[0].file[0]);
      }
    }),

    openPictureTool : new Sk.builtin.func(function(picture) {
      Sk.ffi.checkArgs('openPictureTool', arguments, 1);
      window.pythy.pictureTool.show(picture._url);
    }),
  });

  return mod;
};
