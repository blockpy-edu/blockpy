var $builtinmodule = function(name)
{
    var mod = {};
        
    mod.set_success = new Sk.builtin.func(function() {
        Sk.builtin.pyCheckArgs("set_success", arguments, 0, 0);
        
        throw new Sk.misceval.callsim(mod.Success);
        
        return Sk.ffi.remapToPy(count);
    });
    var success = function ($gbl, $loc) {};
    mod.Success = Sk.misceval.buildClass(mod, success, "Success", [Sk.builtin.Exception])
    return mod;
}