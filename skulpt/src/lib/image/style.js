var $builtinmodule = function(name) {
  var mod, styleWrapper;

  mod = {};

  mod.Style = Sk.misceval.buildClass(mod, function($gbl, $loc) {
    $loc.__init__ = new Sk.builtin.func(function (self, family, emph, size) {
      Sk.ffi.checkArgs('__init__', arguments, 4);
      self._family = family;
      self._emph = emph;
      self._size = Sk.ffi.unwrapo(size);
    }); 

    $loc.__str__ = new Sk.builtin.func(function(self) {
      Sk.ffi.checkArgs('__str__', arguments, 1);
      return new Sk.builtin.str('Style'   +
                                ', family ' + self._family +
                                ', emph '   + self._emph +
                                ', size '   + self._size);
    });

    $loc._toJSString = new Sk.builtin.func(function(self) {
      var styleString;

      switch(self._emph) {
        case 1:
          styleString = 'bold';
          break;
        case 2:
          styleString = 'italic';
          break;
        case 3:
          styleString = 'bold italic';
          break;
        default:
          styleString = '';
      }

      styleString += ' ' + self._size + 'pt';
      styleString += ' ' + self._family;

      return styleString;
    });
  }, 'Style', []);

  goog.object.extend(mod, {
    makeStyle : new Sk.builtin.func(function(family, emph, size) {
      Sk.ffi.checkArgs('makeStyle', arguments, 3);
      return Sk.misceval.callsim(mod.Style, family, emph, size);
    }),
    PLAIN     : 0,
    BOLD      : 1,
    ITALIC    : 2,
    sansSerif : 'Sans Serif',
    serif     : 'Serif',
    mono      : 'Monospaced',
    comicSans : 'Comic Sans MS',
  });

  return mod;
};
