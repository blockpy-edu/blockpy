export var $builtinmodule = function(name) {
    var mod, sampleWrapper;
    mod = {__name__: "image"};

    if (!Sk.PIL) {
        Sk.PIL = {assets: {}};
    }

    // InstantPromise is a workaround to allow usage of the clean promise-style
    // then/catch syntax but to instantly call resolve the then/catch chain so we
    // can avoid creating Suspensions in unnecessary cases.  This is desirable
    // because Suspensions have a fairly large negative impact on overall
    // performance.  These 'instant promises' come into play when a tracer()
    // call is made with a value other than 1.  When tracer is 0 or greater than 1
    // , we can bypass the creation of a Suspension and proceed to the next line of
    // code immediately if the current line is not going to involve a screen
    // update. We determine if a real promise or InstantPromise is necessary by
    // checking FrameManager.willRenderNext()
    function InstantPromise(err, result) {
        this.lastResult = result;
        this.lastError  = err;
    }

    InstantPromise.prototype.then = function(cb) {
        if (this.lastError) {
            return this;
        }

        try {
            this.lastResult = cb(this.lastResult);
        } catch(e) {
            this.lastResult = undefined;
            this.lastError  = e;
        }

        return this.lastResult instanceof Promise ? this.lastResult : this;
    };

    InstantPromise.prototype.catch = function(cb) {
        if (this.lastError) {
            try {
                this.lastResult = cb(this.lastError);
                this.lastError  = undefined;
            } catch(e) {
                this.lastResult = undefined;
                this.lastError = e;
            }
        }

        return this.lastResult instanceof Promise ? this.lastResult : this;
    };

    var buildImage = function(imageData) {

    };

    function getAsset(name) {
        return new Promise(function(resolve, reject) {
            if (Sk.PIL.assets[name] !== undefined) {
                //return Sk.PIL.assets[name];
                resolve(Sk.PIL.assets[name]);
            } else {
                var img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload = function () {
                    Sk.PIL.assets[name] = img;
                    resolve(img);
                };
                img.onerror = function () {
                    //throw new Error("Failed to load asset: " + name);
                    reject(name);
                };
                img.src = name;
            }
        });
    }

    var image = function($gbl, $loc) {
        // open(filename) or open(url)
        // show()

        $loc.__init__ = new Sk.builtin.func(function (self, file_or_url) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            Sk.builtin.pyCheckType("file_or_url", "string", Sk.builtin.checkString(file_or_url));
            self.file_or_url = file_or_url;
            // TODO: Change to suspension
            var imagePromise = getAsset(Sk.ffi.remapToJs(file_or_url));
            var susp = new Sk.misceval.Suspension();
            self.image = Sk.builtin.none.none$;
            susp.resume = function() {
                if (susp.data["error"]) {
                    //throw new Sk.builtin.IOError(susp.data["error"].message);
                    throw susp.data["error"];
                } else {
                    //return self.image;
                }
            };
            susp.data = {
                type: "Sk.promise",
                promise: imagePromise.then(function(value) {
                    self.image = value;
                    self.canvas = document.createElement("canvas");
                    self.canvas.width = self.image.width;
                    self.canvas.height = self.image.height;
                    self.canvas.getContext("2d").drawImage(self.image, 0, 0, self.image.width, self.image.height);
                    self.pixels = self.canvas.getContext("2d").getImageData(0, 0, self.image.width, self.image.height).data;
                    //return value;
                }, function(err) {
                    self.image = "";
                    throw err;
                    //return err;
                })
            };

            return susp;
        });

        $loc.show = new Sk.builtin.func(function(self) {
            if (Sk.console === undefined) {
                throw new Sk.builtin.NameError("Can not resolve drawing area. Sk.console is undefined!");
            }

            var consoleData = {
                image: self.image,
                file_or_url: self.file_or_url
            };

            Sk.console.printPILImage(consoleData);
        });

        $loc.flip = new Sk.builtin.func(function(self) {
            self.image.style.transform = "scaleX(-1)";
            if (Sk.console === undefined) {
                throw new Sk.builtin.NameError("Can not resolve drawing area. Sk.console is undefined!");
            }
            return self;
        });
    };
    mod.Image = Sk.misceval.buildClass(mod, image, "Image", []);

    return mod;
};