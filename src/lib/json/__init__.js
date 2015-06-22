
var $builtinmodule = function(name)
{
    var mod = {};

    mod.loads = new Sk.builtin.func(function(s)
            {
                return Sk.ffi.remapToPy(eval(s.v));
            });

    mod.dumps = new Sk.builtin.func(function(object_)
            {
                return new Sk.builtin.str(JSON.stringify(Sk.ffi.remapToJs(object_)));
            });

    return mod;
};