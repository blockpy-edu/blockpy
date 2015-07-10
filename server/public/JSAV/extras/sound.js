(function($) {
  "use strict";
  JSAV.ext.sound = JSAV.anim(function(filename, options) {
    $.ionSound.addSound(filename);

    if (this._soundPlaying) { // stop previous sound
      // this._soundPlaying is never cleared; we can still stop it
      $.ionSound.stop(this._soundPlaying);
    }

    // start the new sound
    if (this._shouldAnimate()) {
      this._soundPlaying = filename;
      $.ionSound.play(filename);
    }
    return [filename, options];
  });

  // register function to be called when JSAV is initialized
  JSAV.init(function(options) {
    // initialize ionSound on JSAV initialization
    $.ionSound({sounds: [], path: options.soundPath || "./" });
  });
}(jQuery));