var $builtinmodule = function() {
  var mod, sampleWrapper;

  mod = {};

  sampleWrapper = {
    getSound : new Sk.builtin.func(function (sample) {
      Sk.builtin.pyCheckArgs('getSound', arguments, 1);
      return sample._sound;
    }),

    getSampleValue : new Sk.builtin.func(function (sample) {
      Sk.builtin.pyCheckArgs('getSampleValue', arguments, 1);
      return new Sk.builtin.float_(sample._internalSound.getLeftSample(sample._index));
    }),

    setSampleValue : new Sk.builtin.func(function (sample, value) {
      Sk.builtin.pyCheckArgs('setSampleValue', arguments, 2);
      sample._internalSound.setLeftSample(sample._index, Sk.ffi.unwrapo(value));
    }),
  };

  mod.Sample = Sk.misceval.buildClass(mod, function ($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function (self, sound, index) {
      Sk.builtin.pyCheckArgs('__init__', arguments, 3);
      self._sound = sound;
      self._internalSound = sound._sound;
      self._index = Sk.ffi.unwrapo(index);
    });

    $loc.__str__ = new Sk.builtin.func(function (self) {
      Sk.builtin.pyCheckArgs('__str__', arguments, 1);
      return new Sk.builtin.str('Sample at ' + self._index + ' with value ' +
                            self._internalSound.getLeftSample(self._index));
    });

    $loc.__repr__ = new Sk.builtin.func(function (self) {
      Sk.builtin.pyCheckArgs('__repr__', arguments, 1);
      return new Sk.builtin.str('Sample at ' + self._index + ' with value ' +
                            self._internalSound.getLeftSample(self._index));
    });

    goog.object.extend($loc, sampleWrapper);
  }, 'Sample', []);

  goog.object.extend(mod, sampleWrapper);

  return mod;
};
