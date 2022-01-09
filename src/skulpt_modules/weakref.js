export var $builtinmodule = function(name) {
    var mod, sampleWrapper;
    mod = {__name__: "weakref"};

    /*mod.WeakSet = Sk.abstr.buildNativeClass("weakref.WeakSet", {
        constructor: function WeakSet()
    });*/

    var WeakSet = function($gbl, $loc) {
        $loc.__init__ = new Sk.builtin.func(function (self, data) {
            Sk.builtin.pyCheckArgs("__init__", arguments, 2, 2);
            Sk.builtin.pyCheckType("data", "iterable", Sk.builtin.checkIterable(data));
            self.data = [];
            let iter = Sk.abstr.iter(data);
            let next;
            do {
                next = Sk.abstr.iternext(iter);
                if (next !== undefined) {
                    self.data.push(new WeakRef(next));
                }
            } while (next !== undefined);
            return Sk.builtin.none.none$;
        });

        $loc.__iter__ = new Sk.builtin.func(function(self) {
            const viewOfData = [];
            for (let i=0; i < self.data.length; i++) {
                const item = self.data[i].deref();
                if (item !== undefined) {
                    viewOfData.push(item);
                }
            }
            self.data = viewOfData;
            return Sk.abstr.iter(new Sk.builtin.list(viewOfData));
        });

        /*$loc.next$ = new Sk.builtin.func(function (self) {
            return self.tp$iter();
        });*/

        $loc.add = new Sk.builtin.func(function(self, item) {
            self.data.push(new WeakRef(item));
        });
    };
    mod.WeakSet = Sk.misceval.buildClass(mod, WeakSet, "WeakSet", []);

    return mod;
};