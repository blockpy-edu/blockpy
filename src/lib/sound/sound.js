// Do not include this module directly as it has dependencies 
var $builtinmodule = function() {
  var soundWrapper, mod, Sample;

  mod = {};

  // Dependency
  Sample = Sk.sysmodules.mp$subscript('sound.sample').$d.Sample;

  soundWrapper = {
    stopPlaying: new Sk.builtin.func(function (sound) {
      Sk.builtin.pyCheckArgs('stopPlaying', arguments, 1);
      sound._sound.stop();
    }),

    play : new Sk.builtin.func(function(sound) {
      Sk.builtin.pyCheckArgs('play', arguments, 1);
      sound._sound.play();
    }),

    blockingPlay : new Sk.builtin.func(function(sound) {
      Sk.builtin.pyCheckArgs('blockingPlay', arguments, 1);
      Sk.future(function (continueWith) {
        sound._sound.play(continueWith);
      });
    }),

    getDuration : new Sk.builtin.func(function(sound) {
      Sk.builtin.pyCheckArgs('getDuration', arguments, 1);
      return new Sk.builtin.float_(sound._sound.getDuration());
    }),

    getNumSamples : new Sk.builtin.func(function(sound) {
      Sk.builtin.pyCheckArgs('getNumSamples', arguments, 1);
      return new Sk.builtin.int_(sound._sound.getLength());
    }),

    getLength : new Sk.builtin.func(function(sound) {
      Sk.builtin.pyCheckArgs('getLength', arguments, 1);
      return new Sk.builtin.int_(sound._sound.getLength());
    }),

    getSamplingRate : new Sk.builtin.func(function(sound) {
      Sk.builtin.pyCheckArgs('getSamplingRate', arguments, 1);
      return new Sk.builtin.int_(sound._sound.getSamplingRate());
    }),

    setSampleValueAt : new Sk.builtin.func(function(sound, index, value) {
      var length;

      Sk.builtin.pyCheckArgs('setSampleValueAt', arguments, 3);

      length = sound._sound.getLength();

      if(index < 0 || index >= length) {
        throw new Sk.builtin.ValueError('Index must have a value between 0 and ' + length);
      }

      if(!(value instanceof Sk.builtin.int_)) {
        throw new Sk.builtin.TypeError('Value must be an integer');
      }

      value = Sk.ffi.unwrapo(value);

      if(value < -32768) { value = -32768; }
      if(value > 32767) { value = 32767; }

      sound._sound.setLeftSample(Sk.ffi.unwrapo(index), pythy.Sound.map16BitIntToFloat(value));
    }),

    setLeftSample : new Sk.builtin.func(function(sound, index, value) {
      var length;

      Sk.builtin.pyCheckArgs('setLeftSample', arguments, 3);

      length = sound._sound.getLength();

      if(index < 0 || index >= length) {
        throw new Sk.builtin.ValueError('Index must have a value between 0 and ' + length);
      }

      if(!(value instanceof Sk.builtin.int_)) {
        throw new Sk.builtin.TypeError('Value must be an integer');
      }

      value = Sk.ffi.unwrapo(value);

      if(value < -32768) { value = -32768; }
      if(value > 32767) { value = 32767; }

      sound._sound.setLeftSample(Sk.ffi.unwrapo(index), pythy.Sound.map16BitIntToFloat(value));
    }),

    setRightSample : new Sk.builtin.func(function(sound, index, value) {
      var length;

      Sk.builtin.pyCheckArgs('setRightSample', arguments, 3);

      length = sound._sound.getLength();

      if(index < 0 || index >= length) {
        throw new Sk.builtin.ValueError('Index must have a value between 0 and ' + length);
      }

      if(!(value instanceof Sk.builtin.int_)) {
        throw new Sk.builtin.TypeError('Value must be an integer');
      }

      value = Sk.ffi.unwrapo(value);

      if(value < -32768) { value = -32768; }
      if(value > 32767) { value = 32767; }

      sound._sound.setRightSample(Sk.ffi.unwrapo(index), pythy.Sound.map16BitIntToFloat(value));
    }),

    getSampleValueAt : new Sk.builtin.func(function(sound, index) {
      var length;

      Sk.builtin.pyCheckArgs('getSampleValueAt', arguments, 2);

      length = sound._sound.getLength();

      if(index < 0 || index >= length) {
        throw new Sk.builtin.ValueError('Index must have a value between 0 and ' + length);
      }

      return new Sk.builtin.int_(pythy.Sound.mapFloatTo16BitInt(sound._sound.getLeftSample(Sk.ffi.unwrapo(index))));
    }),

    getLeftSample : new Sk.builtin.func(function(sound, index) {
      var length;

      Sk.builtin.pyCheckArgs('getLeftSample', arguments, 2);

      length = sound._sound.getLength();

      if(index < 0 || index >= length) {
        throw new Sk.builtin.ValueError('Index must have a value between 0 and ' + length);
      }

      return new Sk.builtin.int_(pythy.Sound.mapFloatTo16BitInt(sound._sound.getLeftSample(Sk.ffi.unwrapo(index))));
    }),

    getRightSample : new Sk.builtin.func(function(sound, index) {
      var length;

      Sk.builtin.pyCheckArgs('getRightSample', arguments, 2);

      length = sound._sound.getLength();

      if(index < 0 || index >= length) {
        throw new Sk.builtin.ValueError('Index must have a value between 0 and ' + length);
      }

      return new Sk.builtin.int_(pythy.Sound.mapFloatTo16BitInt(sound._sound.getRightSample(Sk.ffi.unwrapo(index))));
    }),

    getSampleObjectAt : new Sk.builtin.func(function (sound, index) {
      var length;

      Sk.builtin.pyCheckArgs('getSampleObjectAt', arguments, 2);

      length = sound._sound.getLength();

      if(index < 0 || index >= length) {
        throw new Sk.builtin.ValueError('Index must have a value between 0 and ' + length);
      }

      return Sk.misceval.callsim(Sample, sound, index);
    }),

    getSamples : new Sk.builtin.func(function (sound) {
      var samples, len;
    
      Sk.builtin.pyCheckArgs('getSamples', arguments, 1);

      samples = [];
      len = sound._sound.getLength();

      for(var i = 0; i < len; i++) {
        samples.push(Sk.misceval.callsim(Sample, sound, Sk.builtin.int_(i)));
      }

      return new Sk.builtin.list(samples);
    })
  };

  mod.Sound = Sk.misceval.buildClass(mod, function ($gbl, $loc) {
    var onError;

    onError = function (continueWith) {
      return function (errorMsg) {
        if(errorMsg.indexOf('File') !== -1) {
          continueWith(new Sk.builtin.ValueError(errorMsg + '. Is the URL incorrect?'));
        } else {
          continueWith(new Sk.builtin.ValueError(errorMsg));
        }
      }
    };

    $loc.__init__ = new Sk.builtin.func(function (sound) {
      var arg0, res, arg1, arg2;

      Sk.builtin.pyCheckArgs('__init__', arguments, [2, 3]);

      arg0 = arguments[1];

      if(arg0 instanceof Sk.builtin.str) {
        arg0 = Sk.ffi.unwrapo(arg0); //url
        res = Sk.future(function (continueWith) {
          new window.pythy.Sound(continueWith, onError(continueWith), arg0);
        }); 
      } else if(arg0.tp$name === 'Sound') {
        res = Sk.future(function (continueWith) {
          new window.pythy.Sound(continueWith, onError(continueWith), arg0._sound);
        });
      } else {
        arg1 = Sk.ffi.unwrapo(arguments[1]); //numSamples
        arg2 = Sk.ffi.unwrapo(arguments[2]); //samplingRate
        res = Sk.future(function (continueWith) {
          new window.pythy.Sound(continueWith, onError(continueWith), arg1, arg2);
        });
      }

      if(res instanceof window.pythy.Sound) {
        sound._sound = res;
      } else if(res) {
        throw res;
      }
    });

    $loc.__str__ = new Sk.builtin.func(function(sound) {
      var str;

      Sk.builtin.pyCheckArgs('__str__', arguments, 1);

      str = 'Sound, ';

      if(sound._sound.url) {
        str += 'File: ' + sound._sound.url + ', ';
      }

      return new Sk.builtin.str(str + 'Number of samples: ' + sound._sound.getLength());
    });

    $loc.__repr__ = new Sk.builtin.func(function(sound) {
      var str;

      Sk.builtin.pyCheckArgs('__repr__', arguments, 1);

      str = 'Sound, ';

      if(sound._sound.url) {
        str += 'File: ' + sound._sound.url + ', ';
      }

      return new Sk.builtin.str(str + 'Number of samples: ' + sound._sound.getLength());
    });

    $loc.writeToFile = new Sk.builtin.func(function(sound, path) {
      Sk.builtin.pyCheckArgs('writeToFile', arguments, 2);
      sound._sound.save(Sk.ffi.unwrapo(path));
    });

    $loc.duplicate = new Sk.builtin.func(function (sound) {
      Sk.builtin.pyCheckArgs('duplicate', arguments, 1);
      return Sk.misceval.callsim(mod.Sound, sound); 
    });

    goog.object.extend($loc, soundWrapper);

  }, 'Sound', []);

  goog.object.extend(mod, soundWrapper);

  goog.object.extend(mod, {
    duplicateSound: new Sk.builtin.func(function (sound) {
      Sk.builtin.pyCheckArgs('duplicateSound', arguments, 1);
      return Sk.misceval.callsim(mod.Sound, sound); 
    }),

    makeSound: new Sk.builtin.func(function (url) {
      Sk.builtin.pyCheckArgs('makeSound', arguments, 1);
      return Sk.misceval.callsim(mod.Sound, url);
    }),

    makeEmptySound: new Sk.builtin.func(function (numSamples, samplingRate) {
      Sk.builtin.pyCheckArgs('makeEmptySound', arguments, [1, 2]);
      return Sk.misceval.callsim(mod.Sound, numSamples, samplingRate);
    }),

    makeEmptySoundBySeconds: new Sk.builtin.func(function (seconds, samplingRate) {
      var numSamples;

      Sk.builtin.pyCheckArgs('makeEmptySoundBySeconds', arguments, [1, 2]);

      if(Sk.ffi.unwrapo(seconds) < 0) {
        throw new Sk.builtin.ValueError('Duration can not be negative');
      }
      numSamples = Sk.ffi.unwrapo(seconds) * (Sk.ffi.unwrapo(samplingRate) || window.pythy.Sound.SAMPLE_RATE);
      return Sk.misceval.callsim(mod.Sound, new Sk.builtin.int_(numSamples), samplingRate);
    }),

    openSoundTool: new Sk.builtin.func(function (sound) {
      Sk.builtin.pyCheckArgs('openSoundTool', arguments, 1);
      window.pythy.soundTool.start(sound._sound);
    }),

    writeSoundTo : new Sk.builtin.func(function(sound, path) {
      Sk.builtin.pyCheckArgs('writeSoundTo', arguments, 2);
      sound._sound.save(Sk.ffi.unwrapo(path));
    })
  });

  return mod;
};
