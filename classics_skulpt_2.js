

var $builtinmodule = function(name)
{
    var mod = {};
    
    mod.get = new Sk.builtin.func(function(property) {
        Sk.builtin.pyCheckArgs("get", arguments, 1, 1);
        Sk.builtin.pyCheckType("property", "string", Sk.builtin.checkString(property));
        property = property.v;
        return Sk.ffi.remapToPy(_IMPORTED_DATASETS["classics"][property].data);
    });

    return mod;
}